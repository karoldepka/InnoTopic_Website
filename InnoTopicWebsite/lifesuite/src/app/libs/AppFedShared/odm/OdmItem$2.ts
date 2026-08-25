/** Object-Document/Database Mapping item */
import {DictPatch, PatchableObservable, throttleTimeWithLeadingTrailing} from "../utils/rxUtils";
import {OdmItemId} from "./OdmItemId";
import {OdmService2} from './OdmService2'
import {OdmBackend, OdmTimestamp} from './OdmBackend'
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {nullish} from '../utils/type-utils'
import {appGlobals} from '../g'
import {OdmList$} from './odm-list$'
import {tap} from 'rxjs/operators'
import {getNowTimePointSuitableForId, odmTimestampToMillis} from './utils'
import {BehaviorSubject} from 'rxjs'
import {debugLog} from '../utils/log'
import {Injector} from '@angular/core'
import {NodeOrderer, ORDER_STEP} from './NodeOrderer'
import {getOdmModificationDeviceId} from './odm-modification-device'

export type UserId = string

/** How many of an item's own past `whenLastModified` values to remember (see
 * `OdmInMemItem.whenLastModifiedHistory`) - just enough to cover a realistically delayed realtime
 * echo, not a full history. */
const OWN_WHEN_LAST_MODIFIED_HISTORY_LIMIT = 64

/** Constructor shape for a "domain item" - a companion object overlaying an `OdmItem$2` with
 * type-specific behaviour (e.g. OrYoL's `TimeTrackedEntry`) without the base item itself needing
 * to know about it. Mirrors `OryItem$.DomainItemCtor` (`apps/OrYoL/db/OryItem$.ts`) so the same
 * domain items can be obtained from either kind of item - see `obtainDomainItem()` below. */
export type OdmDomainItemCtor<TDomainItem = any> = new (
  injector: Injector,
  item$: OdmItem$2<any, any, any, any>,
) => TDomainItem

export class OdmInMemItemWriteOnce {
  public whenCreated?: OdmTimestamp
  /** TODO maybe better status: 'normal'/null | 'del(eted)' | 'arch(ived)' - but also think of "other meaning of status", like "draft", "published" etc
   * and whenDeleted, whenArchived
   * */
  public isDeleted?: OdmTimestamp
  public whenArchived?: OdmTimestamp | null
  public owner?: UserId
  public parentIds?: string[]
  /** Full ancestor-id path (root..self, exclusive of self) - persisted explicitly (not purely
   * derived at read time) so the `ancestor_ids`-containment query (`.contains([nodeId])`) can
   * fetch a whole displayable subtree in one request without needing every ancestor loaded
   * client-side first. Kept in sync with `inclusionsByParentId`/`parentIds` by
   * `setIdAndWhenCreatedIfNecessary()` via `getAncestorIds()`. */
  public ancestorIds?: string[]
  /** Extra `ancestorIds` entries beyond the real parent chain `getAncestorIds()` already walks -
   * currently just the bare-slot mechanism (GH #89): a child "created under" a fabricated/virtual
   * slot id (e.g. `abcdefgh_field_plan`) stays a completely normal child of its real parent
   * (`parentIds` unchanged) with the slot id appended here, so it's reachable via the exact same
   * `ancestorIds`-containment query as any other descendant - see `BareSlotChildren.ts`. */
  public manualAncestorIds?: string[]
  /** GH #89 unify-the-tree-worlds: a parent-child relationship (and its sibling order under that
   * specific parent), embedded directly on the child instead of living in a separate "inclusion"
   * row/collection (OrYoL's old `NodeInclusion` model). Keyed by parent item id - most items have
   * exactly one key; an item included under several different parents at once (OrYoL's multi-
   * parent support) has one entry per parent, each with its own independent order. This is the
   * source of truth `getParentIds()`/`getAncestorIds()` derive from when present (see below) -
   * `parentIds`/`ancestorIds` stay as real persisted columns for containment queries, but are
   * always recomputed from this map, never edited independently. */
  public inclusionsByParentId?: Record<string, {orderNum: number}>
}

/** FIXME: rename OdmInMemItemData */
export class OdmInMemItem extends OdmInMemItemWriteOnce {
  public whenLastModified?: OdmTimestamp
  /** GH #73/#125/#126: this item's own last few self-written `whenLastModified` values (ISO
   * strings, oldest first, capped at `OWN_WHEN_LAST_MODIFIED_HISTORY_LIMIT`) - lets a delayed
   * realtime echo of one of *our own* past writes (Supabase's realtime channel echoes back this
   * device's own writes, with no ordering guarantee against a newer local edit that already
   * landed) be recognized by exact match against this list and never mistaken for a genuinely
   * conflicting edit from elsewhere - see `BrowserOdmStorage.put()`'s use of this. A frequently-
   * rewritten item (e.g. OrYoL's `_mindfulness` anchor, patched on every time-track pause/resume)
   * is exactly where this race was most reproducible ("happens all the time" per #125/#126). */
  public whenLastModifiedHistory?: string[]
  /** Browser-install marker of the device that made the current version. This is not an account
   * identity: it exists solely to recognize delayed self-echoes in the local cache. */
  public whenLastModifiedDeviceId?: string
  /** GH #89's "whenDescendantLastModified" rollup - server-maintained (see the
   * `trg_bump_when_descendant_last_modified` DB trigger, migration
   * `add_when_descendant_last_modified_rollup`), never written directly by the client except for
   * the local-only optimistic bump in `bumpAncestorsWhenDescendantLastModifiedLocally()` below
   * (so the UI reflects a just-made edit immediately, including fully offline, before the write
   * even reaches the server). See `getWhenDescendantLastModified()`'s doc comment for why a MAX
   * rollup like this one is safe to persist/propagate incrementally, unlike a count would be. */
  public whenDescendantLastModified?: OdmTimestamp
  public whereCreated?: any
  /** Fractional sibling-ordering key (OrYoL-style), spaced by ODM_ORDER_STEP so nodes
   * can be reordered/inserted between neighbours without renumbering siblings. */
  public orderNum?: number
  /** GH #89's unified slot picker: ids of `SlotDescriptor`s the user explicitly added via
   * `SlotPickerComponent` even though they have no filled value (or no `dataFieldKey`) yet - an
   * otherwise-empty/bare slot only renders once it's either filled in or listed here, so a
   * 236-descriptor registry (Journal's numeric fields) doesn't render 236 empty cells. */
  public manuallyAddedSlotIds?: string[]
}

export type OdmRawItemData = OdmInMemItem // workaround

export type OdmPatch<TData> = DictPatch<TData>

export interface ModificationOpts {
  dontSetWhenLastModified?: boolean
}

export function convertUndefinedFieldValsToNull(obj: any) {
  for ( let key of Object.keys(obj) ) {
    if ( obj[key] === undefined ) {
      obj[key] = null
    }
  }
  return obj
}

/** Compact, user-visible summary of a patch's changed fields, e.g. `importance=3, title=Buy milk`.
 * Long values are truncated so the sync status UI stays readable. */
export function summarizePatch(patch: any): string {
  if ( ! patch || typeof patch !== 'object' ) {
    return ''
  }
  return Object.keys(patch).map(key => {
    const value = patch[key]
    let asStr = typeof value === 'string' ? value : JSON.stringify(value)
    if ( asStr && asStr.length > 40 ) {
      asStr = asStr.slice(0, 40) + '…'
    }
    return `${key}=${asStr}`
  }).join(', ')
}

/** Spacing between sibling `orderNum`s. Large gap lets us insert between two neighbours by
 * averaging, without renumbering siblings. Re-exported from the shared `NodeOrderer` (GH #89's
 * unify-the-tree-worlds effort - this used to be a separate, duplicate constant) so there's one
 * canonical value, not two that could drift apart. */
export const ODM_ORDER_STEP = ORDER_STEP

/** One stateless instance, shared by every `OdmItem$2` - `NodeOrderer` holds no per-call state. */
const nodeOrderer = new NodeOrderer()

export type OdmItem$2CtorOpts = { createdLocally?: boolean }

/** Maybe have another conversion like OdmItem$W - W meaning writable,
 * to not confuse with real observables; or another special char like EUR - editable, funny pun.
 * Need to have a pronounceable version, like is the case with $ -> Stream
 *
 * In CoDaDriS terms, OdmItem$2 would have been ObjectAtBranch (not Vlid - Vlid is just a wrapper around ItemId)
 * where branch is e.g. draft/published. And the $ listens to changes to the item on a particular branch.
 * */
export class OdmItem$2<
  TSelf extends OdmItem$2<any, any, any, any> /* workaround coz I don't know how to get this in TS*/,
  TInMemData extends OdmInMemItem,
  TRawData /* TODO: maybe this does not have to be part of public interface */ extends OdmRawItemData /* workaround */, // = TInMemData,
  TItemListService extends
    OdmService2<TItemListService, TInMemData, TRawData, any /* workaround */>, // =
    // OdmService2<TInMemData, TRawData>,
  TItemId extends
    OdmItemId<TRawData> =
    OdmItemId<TRawData>,
  TMemPatch extends
    OdmPatch<TInMemData> =
    OdmPatch<TInMemData>,
  TRawPatch extends /* TODO: maybe this does not have to be part of public interface */
    OdmPatch<TRawData> =
    OdmPatch<TRawData>,
  TChild extends
    // typeof this =
    // typeof this
    TSelf =
    TSelf,
  TParent extends
    TSelf =
    TSelf
>
  implements PatchableObservable<TInMemData | nullish, TMemPatch>
{

  /** consider renaming to just `val` or `data`; undefined means not yet loaded; null means deleted (or perhaps losing access, e.g. via changing permissions -> "No longer available"
   * or realizing we don't have access
   * or empty value arrived
   **/
  currentVal: TInMemData | nullish = undefined // TODO: could have an initial non-nullish value from func/ctor param, to avoid undefined checks

  /** Has patch that has not yet had a call to backend DB API (as opposed to not having been synchronized via network) */
  hasPendingPatch = false

  /** Fields changed (locally) since the last successful DB write — written incrementally (merge). */
  private pendingDbPatch: Partial<TInMemData> = {}

  /** True from the moment a local edit is made until the write is *confirmed* (pruned in
   * onDbWriteResolved) — spans the whole in-flight window, unlike `hasPendingPatch` which
   * flips back to false the instant the throttled save is merely *initiated*. This is the
   * signal `applyDataFromDbAndEmit` uses to avoid clobbering an unconfirmed local edit. */
  get hasUnsyncedChanges(): boolean {
    return Object.keys(this.pendingDbPatch).length > 0
  }

  /** Whether the item is known to already exist in the DB (loaded or previously saved). Until
   * true, saves write the whole document so first-time metadata (whenCreated/owner) is stored. */
  private hasBeenPersistedToDb = false


  get val() { return this.currentVal }

  get val$() { return this.locallyVisibleChanges$ }

  /** Alias for `val$` under the name OrYoL's `OryItem$.data$` uses, so code written against
   * either kind of item (e.g. `TimeTrackedEntry` - see `TimeTrackable` in
   * `apps/OrYoL/time-tracking/time-tracking.service.ts`) doesn't need to care which one it has. */
  get data$() { return this.locallyVisibleChanges$ }

  /** Non-optional to match `HasItemData.getId()` (`apps/OrYoL/tree-model/has-item-data.ts`) -
   * only meaningful once the item actually has an id (true by the time anything treats it as a
   * domain-item host, same assumption `OryItem$.getId()` makes over its own non-optional `id`). */
  getId(): TItemId { return this.id as TItemId }

  getItemData(): TInMemData | nullish { return this.currentVal }

  /** The ODM collection/class name this item belongs to (e.g. `"JournalEntry"`, `"LearnItem"`) -
   * the same string already used as the `collection` key in patterns like
   * `OdmConflictToastService.COLLECTION_ROUTES`, so callers that need to route to/identify an
   * item's app (without hard-importing that app's model class) can key off this instead. */
  getCollectionName(): string { return this.odmService.className }

  private mapCtorToDomainItem = new Map<OdmDomainItemCtor, any>()

  /** Get-or-create a cached "domain item" companion object for this item (one instance per
   * constructor, reused across calls) - mirrors `OryItem$.obtainDomainItem()`
   * (`apps/OrYoL/db/OryItem$.ts`) so the same domain items (e.g. `TimeTrackedEntry`) work
   * identically whether the underlying item is an OrYoL tree item or a plain `OdmItem$2` (Journal,
   * Learn, ...). */
  obtainDomainItem<TCtor extends OdmDomainItemCtor>(ctor: TCtor): InstanceType<TCtor> {
    let ret = this.mapCtorToDomainItem.get(ctor)
    if ( ! ret ) {
      ret = new ctor(this.odmService.injector, this)
      this.mapCtorToDomainItem.set(ctor, ret)
    }
    return ret
  }

  private resolveFuncPendingThrottled?: (value?: (PromiseLike<any> | any)) => void

  public locallyVisibleChanges$ = new CachedSubject<TInMemData | nullish>()
  public locallyVisibleChangesThrottled$ = new CachedSubject<TInMemData | nullish>()
  public localUserSavesToThrottle$ = new CachedSubject<TInMemData | nullish>(/* it's important it's undefined here; otherwise it would send writes to db on load */)
  // TODO: distinguish between own-data changes (e.g. just name surname) and nested collections data change; or nested collections should only be obtained by service directly, via another observable

  /** FIXME: encapsulate into OdmCollection<TSelf>, and unify with all-items-list?
   * This has `list` in name, so should only react to changes of the list itself (not object data contents
   * */
  public childrenList$ = new CachedSubject<TSelf[] | undefined>(this.opts?.createdLocally ? [] : undefined)

  public children$: OdmList$<TChild>
    = new OdmList$<TChild>()//new CachedSubject<TSelf[] | undefined>()

  public childrenListener?: any

  public treeDescendantsListener?: any

  public get throttleIntervalMs() { return this.odmService.throttleIntervalMs }

  constructor(
    public odmService: TItemListService,
    public id?: TItemId,
    initialInMemData?: TInMemData,
    public parents?: TParent[],
    public readonly opts?: OdmItem$2CtorOpts,
  ) {
    // console.log('OdmItem$2: parents', parents, 'constructor opts', opts)
    if ( initialInMemData !== undefined ) {
      this.emitNewVal(initialInMemData)
      // TODO: this.hasPendingPatch = true ?

      // DO NOT patch here, as it can create an infinite loop
      // this.patchNow(initialInMemData) // maybe should override rather than patch
    }

    this.localUserSavesToThrottle$.pipe(
      throttleTimeWithLeadingTrailing(this.odmService.throttleSaveToDbMs)
    ).subscribe(((value: TInMemData) => {
      /* why this works only once?
       * Causes saveNowToDb to receive old value
      // this.odmService.saveNowToDb(this as unknown as T)
      this.odmService.saveNowToDb(this.asT)
      */
      // FIXME: incremental patching
      this.odmService.saveNowToDb(this)
      this.hasPendingPatch = false
      this.resolveFuncPendingThrottledIfNecessary()
    }) as any /* TODO investigate after strict */)
    // this.onModified()

    // FIXME: weave parents into db data

    // if ( opts?.createdLocally ) {
    //   this.childrenList$.nextWithCache([])
    // }

    if ( parents ) {
      for (let parent of parents) {
        parent.onChildrenAddedLocally([this])
      }
    }

  }

  private setIdAndWhenCreatedIfNecessary() {
    this.currentVal ! . owner = this.odmService.authService.authUser$?.lastVal?.uid
    this.currentVal ! . whenCreated = this.currentVal ! . whenCreated || OdmBackend.nowTimestamp()
    /* FIXME move to smth like setMetadata(): */
    // Always derived from getParentIds()/getAncestorIds() (not reimplemented here) so a
    // subclass override (e.g. explicit-parent-id items) and the persisted `parentIds`/
    // `ancestorIds` fields can never silently diverge - see inclusionsByParentId's doc comment.
    this.currentVal ! . parentIds = this.getParentIds() as string[]
    this.currentVal ! . ancestorIds = this.getAncestorIds() as string[]

    if ( ! this.id ) {
      this.id = this.generateItemId()
      // this.currentVal.id = this.id
    }
  }

  /** GH #89 unify-the-tree-worlds: records (or updates the order of) a parent-child relationship
   * directly on this item, replacing OrYoL's old separate-row `NodeInclusion` model. `parentItem$`
   * must already be loaded (true by construction - you can't attach a child under a parent you
   * don't have in memory), so `getAncestorIds()` can walk it immediately without a network round
   * trip. Caller is responsible for persisting afterward (`saveNowToDb()`/`patchNow()`). */
  setParentInclusion(parentItem$: TParent, orderNum: number): void {
    this.currentVal ??= {} as TInMemData
    const parentId = parentItem$.id as string
    const inclusions = {...(this.currentVal.inclusionsByParentId ?? {})}
    inclusions[parentId] = {orderNum}
    this.currentVal.inclusionsByParentId = inclusions
    if (!this.parents?.some(p => p.id === parentId)) {
      this.parents = [...(this.parents ?? []), parentItem$]
    }
  }

  /** Removes this item from one specific parent (the multi-parent-aware counterpart of
   * `setParentInclusion()`) - e.g. a move/reparent removes the old parent then adds the new one. */
  removeParentInclusion(parentId: string): void {
    if (!this.currentVal?.inclusionsByParentId) {
      return
    }
    const inclusions = {...this.currentVal.inclusionsByParentId}
    delete inclusions[parentId]
    this.currentVal.inclusionsByParentId = inclusions
    this.parents = this.parents?.filter(p => p.id !== parentId)
  }

  /** Sibling order under one specific parent - falls back to the legacy flat `orderNum` scalar
   * for items not using `inclusionsByParentId` (single-parent generic items, unchanged). */
  getOrderNumUnderParent(parentId: string): number | undefined {
    return this.currentVal?.inclusionsByParentId?.[parentId]?.orderNum ?? this.currentVal?.orderNum
  }

  private generateItemId(): TItemId {
    return ('' + this.odmService.className + "__" + getNowTimePointSuitableForId() + '_') as TItemId  // hack
  }

  patchThrottled(patch: TMemPatch, modificationOpts?: ModificationOpts) {
    this.currentVal ??= {} as TInMemData /* HACK - FIXME - test it - tree deep descendants disappeared?
      - might affect hasEmitted... / has initial data arrived
      FIXME: patching removes (does not store) parentIds and ancestorIds - started happening after rich text cell - need to store parents in a field when loading
     */
    convertUndefinedFieldValsToNull(patch)
    convertUndefinedFieldValsToNull(this.currentVal) // quick hack for undefined in importance
    // return; // HACK
    if ( ! this.resolveFuncPendingThrottled ) {
      const promise = new Promise((resolveFunc) => {
        this.resolveFuncPendingThrottled = resolveFunc
      })
      this.odmService.syncStatusService.handleSavingPromise(promise, this.describePendingChange(patch))
    }
    this.setIdAndWhenCreatedIfNecessary()
    this.setLastModifiedIfNecessary(modificationOpts) // before the patching, in case patch contains modification fields
    Object.assign(this.currentVal, patch) // patching the value locally
    Object.assign(this.pendingDbPatch as any, patch) // accumulate for incremental (merge) DB write
    this.hasPendingPatch = true
    this.persistPendingEditDurably()

    // this.localUserSavesToThrottle$.next(this.asT) // other code listens to this and throttles - saves
    this.localUserSavesToThrottle$.next(this.currentVal) // other code listens to this and throttles - saves
    this.locallyVisibleChanges$.next(this.currentVal) // other code listens to this and throttles - saves
    /* TODO move to odmService.onPatched(this, patch) */
    this.odmService.emitLocalItems()
    this.odmService.itemHistoryService.onPatch(this, patch)
  }

  /** Durably journals the full accumulated pendingDbPatch (BrowserOdmStorage) so it survives a
   * reload/crash before the write confirms - see OdmService2.resumePendingEdits(). Best-effort:
   * a failure here shouldn't block the local edit the user just made. */
  private persistPendingEditDurably(): void {
    const whenLastModified = odmTimestampToMillis((this.currentVal as any)?.whenLastModified)
    this.odmService.browserOdmStorage
      .savePendingEdit(
        this.odmService.className,
        this.id as string,
        this.pendingDbPatch as Record<string, any>,
        whenLastModified !== undefined ? new Date(whenLastModified).toISOString() : new Date().toISOString(),
      )
      .catch(error => debugLog('persistPendingEditDurably failed', this.id, error))
  }

  /** Restores a durably-journaled unsynced edit after a reload/crash and retries the save.
   * Seeds `currentVal` from the local cache first if nothing has loaded it yet, so the item
   * doesn't render blank while the retry is in flight. */
  async resumeUnsyncedPatch(patch: Record<string, any>): Promise<void> {
    if (!this.currentVal) {
      const cached = await this.odmService.browserOdmStorage.get(this.odmService.className, this.id as string)
      if (cached) {
        this.currentVal = this.odmService.convertFromDbFormat(cached.data as TRawData)
        this.hasBeenPersistedToDb = true
      }
    }
    this.currentVal ??= {} as TInMemData
    Object.assign(this.currentVal, patch)
    Object.assign(this.pendingDbPatch as any, patch)
    this.hasPendingPatch = true
    this.locallyVisibleChanges$.next(this.currentVal)
    this.odmService.saveNowToDb(this)
  }

  /** Builds a short, user-visible description of a pending change, e.g.
   * `Modified Task "Buy milk" with importance=3, title=Buy milk`. */
  private describePendingChange(patch: TMemPatch): string {
    const typeName = this.odmService.className
    const title = (this.currentVal as any)?.title ?? (this.currentVal as any)?.name ?? this.id
    const patchSummary = summarizePatch(patch)
    return `Modified ${typeName} "${title}"` + (patchSummary ? ` with ${patchSummary}` : '')
  }

  private setLastModifiedIfNecessary(modificationOpts: ModificationOpts | nullish ) {
    if ( ! ( modificationOpts?.dontSetWhenLastModified ?? false ) ) {
      this.setWhenLastModified()
      // TODO: move whereLastModified from service
    }
  }

  // patchFieldThrottled(fieldKey: keyof TInMemData, fieldPatch: TInMemData[fieldKey]) {
  // patchFieldThrottled(fieldKey: keyof TInMemData, fieldPatch: typeof TInMemData[fieldKey]) {
  // can I use T[P] ? as in: type ReadOnly = {   readonly [P in keyof T]: T[P] };
  // patchFieldThrottled(fieldKey: keyof TData, fieldPatch: (typeof this.fieldKey)) {
  //  // idea: patch level 1 and pass partial
  // }

  // TODO: patchFieldsDeeplyLevel1 -- deeply LEVEL 1 -- for type safety

  patchNow(patch: TMemPatch, modificationOpts?: ModificationOpts) {
    this.setIdAndWhenCreatedIfNecessary()
    this.setLastModifiedIfNecessary(modificationOpts)
    Object.assign(this.currentVal !, patch)
    Object.assign(this.pendingDbPatch as any, patch) // accumulate for incremental (merge) DB write
    this.persistPendingEditDurably()
    this.odmService.saveNowToDb(this)
    this.resolveFuncPendingThrottledIfNecessary()
    this.locallyVisibleChanges$.next(this.currentVal) // other code listens to this and throttles - saves
    this.odmService.emitLocalItems()
  }

  deleteWithoutConfirmation() {
    this.currentVal ! . isDeleted = OdmBackend.nowTimestamp() // TODO: unused; check undefined
    this.odmService.deleteWithoutConfirmation(this)
  }

  /** Default impl, to be overridden */
  toDbFormat(): TRawData {
    let dbFormat: any = Object.assign({}, this.currentVal) as any as TRawData

    for ( let key of Object.keys(dbFormat) ) {
      if ( dbFormat[key] === undefined ) {
        dbFormat[key] = null // for Firestore
      }
    }

    return dbFormat
    // return this.currentVal as any as TRawData
    // // delete dbFormat.odmService
    // // delete dbFormat.locallyVisibleChanges$
    // // delete dbFormat.locallyVisibleChangesThrottled$
    // // delete dbFormat.localUserSavesToThrottle$
    // if ( !dbFormat.isDeleted ) {
    //   delete dbFormat.isDeleted // For Firestore to avoid undefined
    // }
    // for ( let key of Object.keys(dbFormat) ) {
    //   if ( dbFormat[key] === undefined ) {
    //     delete dbFormat[key]
    //   }
    // }
    // // TODO: https://stackoverflow.com/questions/35055731/how-to-deeply-map-object-keys-with-javascript-lodash
    // // https://stackoverflow.com/questions/48156234/function-documentreference-set-called-with-invalid-data-unsupported-field-val
    // return dbFormat
  }

  setWhenLastModified() {
    // debugLog(`setWhenLastModified`, this)
    // console.trace(`setWhenLastModified`, this)
    const ts = OdmBackend.nowTimestamp()
    this.currentVal ! . whenLastModified = ts
    this.currentVal ! . whenLastModifiedDeviceId = getOdmModificationDeviceId()
    const history = this.currentVal ! . whenLastModifiedHistory ?? []
    history.push(ts.toDate().toISOString())
    this.currentVal ! . whenLastModifiedHistory = history.slice(-OWN_WHEN_LAST_MODIFIED_HISTORY_LIMIT)
    this.bumpAncestorsWhenDescendantLastModifiedLocally(ts)
  }

  /** Optimistic, offline-safe half of GH #89's "whenDescendantLastModified" rollup - the DB
   * trigger (`trg_bump_when_descendant_last_modified`) is the authoritative propagation path, but
   * that only takes effect once this edit actually reaches the server. Walking `this.parents`
   * (whatever's already resident in memory - same caveat as `getAncestorIds()`) and patching each
   * loaded ancestor directly means the UI updates immediately, including with no network at all,
   * via the exact same durable patch/journal/retry path (`patchThrottled`) any other field edit
   * already uses - no bespoke offline handling needed.
   *
   * Deliberately gated on `hasBeenPersistedToDb`: patching an ancestor whose full data hasn't
   * loaded yet would `patchThrottled()` a near-empty `currentVal`, and this backend's upsert
   * writes `data` as a whole JSONB column (not a merge) - see `createPostgresOdmRow()` - so that
   * would wipe out every other real field on that row. Skipping unloaded ancestors here is safe:
   * the DB trigger still reaches them once the edit syncs, this is purely a same-session nicety. */
  private bumpAncestorsWhenDescendantLastModifiedLocally(timestamp: OdmTimestamp, visitedIds: Set<string> = new Set()): void {
    const newMs = odmTimestampToMillis(timestamp)
    if (newMs === undefined) {
      return
    }
    for (const parent of this.parents ?? []) {
      const parentId = parent?.id as string | undefined
      if (!parentId || visitedIds.has(parentId)) {
        continue
      }
      visitedIds.add(parentId)
      if (!(parent as any).hasBeenPersistedToDb) {
        continue
      }
      const existingMs = odmTimestampToMillis((parent.currentVal as any)?.whenDescendantLastModified)
      if (existingMs === undefined || existingMs < newMs) {
        (parent as any).patchThrottled({whenDescendantLastModified: timestamp}, {dontSetWhenLastModified: true})
      }
      ;(parent as any).bumpAncestorsWhenDescendantLastModifiedLocally(timestamp, visitedIds)
    }
  }

  applyDataFromDbAndEmit(incomingConverted: TInMemData) {
    if (this.hasUnsyncedChanges) {
      // This device has a local edit that hasn't been confirmed written yet - applying
      // incoming data now (e.g. a delayed server echo) would clobber it. Clock-independent:
      // no timestamp comparison needed, since we already know our own edit is unconfirmed.
      return
    }
    const incomingMillis = odmTimestampToMillis((incomingConverted as any)?.whenLastModified)
    const currentMillis = odmTimestampToMillis((this.currentVal as any)?.whenLastModified)
    if (currentMillis !== undefined && incomingMillis !== undefined && incomingMillis < currentMillis) {
      // Stale/out-of-order data (e.g. a late realtime echo overtaken by a newer read) -
      // never let it regress what's already shown.
      return
    }
    // Object.assign(this, incomingConverted) // TODO:
    this.emitNewVal(incomingConverted)
    this.hasBeenPersistedToDb = true // it came from the DB, so it exists there
    this.parents = incomingConverted?.parentIds?.map(id => this.odmService.obtainItem$ById(id))
    // console.error(`FIXME: set this.parents (otherwise they will be destroyed when patching). And this.parents$. Though, 2 sources of truth: inMemData and parents$. this.parents value: `, this.parents, this.getParentIds() )
  }

  private emitNewVal(newVal: TInMemData) {
    this.currentVal = newVal
    this.locallyVisibleChanges$.next(newVal)
  }

  /** Note: saveThrottled does not exist, because we prefer to use patch, for incremental saves of only the fields that have changed */
  saveNowToDb(modificationOpts?: ModificationOpts) {
    this.debugLog(`saveNowToDb`)
    this.setIdAndWhenCreatedIfNecessary()
    this.setLastModifiedIfNecessary(modificationOpts)
    // Unlike patchNow/patchThrottled (incremental edits to an already-loaded item), this is the
    // whole-document save used for first-time creation (add(), createChild()) - there's no prior
    // persisted state to diff against, so the entire current value is what's actually unsynced
    // until the write confirms. Without journaling it the same way a patch is, a brand-new item
    // created while offline that failed its first write attempt was never marked as needing a
    // retry - it just sat local-only-cached forever, since nothing else ever calls this again
    // for an item nobody edits further.
    Object.assign(this.pendingDbPatch as any, this.currentVal)
    this.persistPendingEditDurably()
    this.odmService.saveNowToDb(this)
    this.resolveFuncPendingThrottledIfNecessary()
  }

  public saveNowToDbIfNeeded() {
    if ( this.hasPendingPatch
      /* more like hasUserEnteredData */
    ) {
      this.saveNowToDb /* ...Force */()
    }
    // TODO: item$ ?. hasOrHadUserProvidedContent() --> "had" - for undo in text fields (for the text field to not disappear), and for deleting item via backspace like OrYoL will have, and prolly LifeSuite Categories
    // FIXME: check if has pending patches
  }

  // ============================================================================
  // Incremental DB patching: write only changed fields (merge) rather than the whole
  // document. The FIRST save of a new item still writes the whole document, so metadata
  // (whenCreated/owner) is stored; subsequent saves send only the accumulated changes.
  // ============================================================================

  /** True once the item is known to exist in the DB (loaded or previously saved). */
  get isPersistedInDb(): boolean {
    return this.hasBeenPersistedToDb
  }

  /** Snapshot of the fields changed since the last successful write (excludes metadata). */
  snapshotPendingDbPatch(): Partial<TInMemData> {
    return { ...this.pendingDbPatch }
  }

  /** Fields to write for an incremental (merge) save: pending changes plus always-changing
   * metadata (whenLastModified / whereLastModified). Returns undefined when a whole-document
   * write is required (item not yet persisted). */
  buildIncrementalDbPatch(): Partial<TInMemData> | undefined {
    if ( ! this.hasBeenPersistedToDb ) {
      return undefined
    }
    const v = this.currentVal as any
    const patch: any = { ...this.pendingDbPatch }
    patch.whenLastModified = v?.whenLastModified ?? null
    if ( v && 'whereLastModified' in v ) {
      patch.whereLastModified = v.whereLastModified ?? null
    }
    return patch as Partial<TInMemData>
  }

  /** After a successful DB write, mark the item persisted and drop the written fields from the
   * pending patch — keeping any edits made while the write was in flight (i.e. changed value). */
  onDbWriteResolved(writtenPatch: Partial<TInMemData>): void {
    this.hasBeenPersistedToDb = true
    for ( const key of Object.keys(writtenPatch) as (keyof TInMemData)[] ) {
      if ( this.pendingDbPatch[key] === writtenPatch[key] ) {
        delete this.pendingDbPatch[key]
      }
    }
    if (this.hasUnsyncedChanges) {
      // Further edits arrived while this write was in flight - keep the durable journal in
      // sync with what's actually still unconfirmed, rather than clearing it prematurely.
      this.persistPendingEditDurably()
    } else {
      this.odmService.browserOdmStorage
        .clearPendingEdit(this.odmService.className, this.id as string)
        .catch(error => debugLog('clearPendingEdit failed', this.id, error))
    }
  }


  private resolveFuncPendingThrottledIfNecessary() {
    if (this.resolveFuncPendingThrottled) {
      // console.log(`resolveFuncPendingThrottled()`)
      this.resolveFuncPendingThrottled?.(true)
      this.resolveFuncPendingThrottled = undefined
    }
  }

  public onChildrenAddedLocally(children: TSelf[]) {
    this.debugLog('onChildrenAddedLocally', children)
    this.childrenList$.nextWithCache([
      ... (this.childrenList$.lastVal ?? []),
      ... children,
    ])
  }

  public requestLoadChildren() {
    if ( this.childrenListener || ! this.id ) {
      return
    }
    this.debugLog('requestLoadChildren', this.id)
    /* FIXME: this is copy-paste from entire-collection loading */
    /* TODO: encapsulate into OdmCollection object ?
      children$, allItems$
    *   */
    const service = this.odmService
    const thisItem$ = this
    this.childrenListener = {
      onAdded(addedItemId: TItemId, addedItemRawData: TRawData) {

        let existingItem: TSelf | undefined = service.mapIdToItem$.get(addedItemId)
        // debugLog('setBackendListenerIfNecessary onAdded', service, ...arguments, 'service.itemsCount()', service.itemsCount())

        thisItem$.debugLog(`requestLoadChildren, onAdded addedItemId parent: `, thisItem$.id, addedItemId, `existingItem?.val$?.hasEmitted`, existingItem?.val$?.hasEmitted)

        // service.obtainOdmItem$(addedItemId) TODO
        // if ( ! existingItem ) {
        if ( ! existingItem?.val$?.hasEmitted ) { /* FIXME: isn't this gonna cause it to never emit changes coming from another machine ? */
          // FIXME: this is is causing item to never load if subscribed via item details url early

          existingItem = service.obtainItem$ById(addedItemId)

          let items = service.localItems$.lastVal;
          // if ( ! existingItem /* FIXME: now existingItem always returns smth */ ) {
          //   existingItem = service.createOdmItem$ForExisting(addedItemId, service.convertFromDbFormat(addedItemRawData))// service.convertFromDbFormat(addedItemRawData); // FIXME this.
          // }

          existingItem!.applyDataFromDbAndEmit(service.convertFromDbFormat(addedItemRawData) !) /* emits here, screwing this `! emitted` condition */
          // FIXME: set parent(s)
          thisItem$.debugLog(`requestLoadChildren, thisItem$.childrenList$.lastVal.push`, thisItem$.id, addedItemId)

          items!.push(existingItem)
        } // else: it was added locally as lag compensation, don't do anything, to not destroy potential local changes

        thisItem$.childrenList$.lastVal ??= []
        if ( ! thisItem$.childrenList$.lastVal.includes(existingItem !) ) {
          thisItem$.childrenList$.lastVal.push(existingItem!) /* FIXME: this out-of-band modification might confuse RxJS */
        }


        // } else {
        // errorAlert('onAdded item unexpectedly existed already: ' + addedItemId, existingItem, 'incoming data: ', addedItemRawData)
        // existingItem.applyDataFromDbAndEmit(service.convertFromDbFormat(addedItemRawData))
        // }
        // service.emitLocalItems() -- now handled by onFinishedProcessingChangeSet

      },
      onModified(modifiedItemId: TItemId, modifiedItemRawData: TRawData) {
        // debugLog('setBackendListenerIfNecessary onModified', ...arguments)
        let convertedItemData = service.convertFromDbFormat(modifiedItemRawData);
        let existingItem = service.obtainItem$ById(modifiedItemId)
        if (existingItem && existingItem.applyDataFromDbAndEmit) {
          existingItem.applyDataFromDbAndEmit(convertedItemData)
        } else {
          console.error('FIXME existingItem.applyDataFromDbAndEmit(convertedItemData)', existingItem, existingItem && existingItem.applyDataFromDbAndEmit)
        }
        // service.emitLocalItems() -- now handled by onFinishedProcessingChangeSet
      },
      onRemoved(removedItemId: TItemId) {
        /* FIXME: remove in childrenList$ */
        service.localItems$.lastVal = service.localItems$ !.lastVal !.filter(item => item.id !== removedItemId)
        // TODO: remove from map? but keep in mind this could be based on query result. Maybe better to have a weak map and do NOT remove manually
        // service.emitLocalItems() -- now handled by onFinishedProcessingChangeSet
      },
      onFinishedProcessingChangeSet() {
        // console.log('onFinishedProcessingChangeSet() - thisItem$.childrenList$.lastVal', thisItem$.childrenList$.lastVal)
        thisItem$.childrenList$.lastVal ??= [] /* FIXME: only emit if changed ? */
        thisItem$.childrenList$.reEmit()
        service.emitLocalItems()
      },
    }

    this.odmService.odmCollectionBackend.loadChildrenOf(this.id !, this.childrenListener)
  }

  public requestLoadTreeDescendants() {
    this.debugLog('requestLoadTreeDescendants', this.id)
    // A brand-new, not-yet-saved item has no id yet (only assigned on its first save/patch -
    // see setIdAndWhenCreatedIfNecessary()) - matches the same guard requestLoadChildren() above
    // already has. Without it, OdmTreeNode.requestLoadChildren() (called unconditionally by
    // TreeNodeCellsComponent for every visible cell, not just bare slots, so a voice-memo-created
    // child is findable under any field kind) crashed on every fresh item: "'ancestorId': must be
    // truthy, is: undefined" - ancestorId here is just loadTreeDescendantsOf()'s own parameter
    // name (a query filter on the real ancestor_ids column), not a persisted field.
    if ( this.treeDescendantsListener || ! this.id ) {
      return
    }
    // Descendants (any depth) just join the service's general item pool, same as a normal
    // collection-wide load - reuse that listener rather than a bespoke per-node list.
    this.treeDescendantsListener = this.odmService.createBackendListener()

    this.odmService.odmCollectionBackend.loadTreeDescendantsOf(this.id !, this.treeDescendantsListener)
  }


  public getParentIds(): TItemId[] {
    if ( this.currentVal?.inclusionsByParentId ) {
      return Object.keys(this.currentVal.inclusionsByParentId) as TItemId[]
    }

    if ( this.parents ) {
      return this.parents.map(parent => parent.id! as TItemId)
    }

    const persistedParentIds = this.currentVal?.parentIds
    if ( persistedParentIds ) {
      return persistedParentIds as TItemId[]
    }

    // Top-level items intentionally have no parents. New saves call
    // setIdAndWhenCreatedIfNecessary() first, which writes parentIds: [] explicitly.
    if ( this.isTreeRoot() || Array.isArray(persistedParentIds) ) {
      return [] as TItemId[]
    }

    if ( appGlobals?.feat?.categoriesTree?.showFixmes ) {
      console.error('Item$ has no parent metadata; treating as top-level item.', this)
    }
    return [] as TItemId[]
  }

  public getAncestorIds(): TItemId[] {
    /* FIXME: consider case where we load a sub-tree - some parent-of-parent were not yet loaded;
      but we can use their `ancestorIds` from their data object, without even having to load the ancestors
    *   */

    const ancestorIds = [] as TItemId[]
    ancestorIds.push(... this.getParentIds())
    for ( let parentItem$ of this.parents ?? [] ) {
      const ancestorsOfParent: TItemId[] = parentItem$.getAncestorIds() as TItemId[]
      ancestorIds.push(... ancestorsOfParent)
    }
    ancestorIds.push(... (this.currentVal?.manualAncestorIds ?? []) as TItemId[])

    return ancestorIds
  }

  /** Todo rename to distinguish actual root from tree-starting-at-item or visual root */
  private isTreeRoot() {
    return this.id === this.odmService.treeRootItemId
  }

  /** another name: selectField$P */
  getObservablePatchableForField<TKey extends keyof TInMemData>(fieldName: TKey): PatchableObservable<TInMemData[TKey] | nullish, TMemPatch[TKey] | nullish> {
    const odmItem$ = this
    const mapFunc = (val: TInMemData| nullish): TInMemData[TKey] | undefined => {
      // kinda like `select()` in ngrx
      return val?.[fieldName]
    }
    const cachedSubject = new CachedSubject<TInMemData[TKey] | nullish>(mapFunc(odmItem$.currentVal))
    this.val$.pipe(
      /* .map here? */
      tap((value) => {
        // console.log(`getObservablePatchableForField cachedSubject value`, value)
        // Use the same mapping function to avoid duplicate code
        const transformedValue = mapFunc(value);
        // console.log(`getObservablePatchableForField transformedValue`, transformedValue)
        cachedSubject.next(transformedValue); // Update mappedSubject with the transformed value
      })
    )/*.pipe()*/.subscribe();
    // toCachedSubject()
    // FIXME: cache this in a map per-field
    const po: PatchableObservable<TInMemData[TKey] | nullish> = {

      locallyVisibleChanges$: cachedSubject,

      patchThrottled(patch: TInMemData[TKey]) {
        // console.log(`getObservablePatchableForField patchThrottled`, patch)
        const patch1 = {
          [fieldName]: patch
        } as unknown as TMemPatch /* here need to cast coz not all fields are patchable (not all are `keyof TMemPatch)*/
        odmItem$.patchThrottled(patch1)
      }
    }
    return po as PatchableObservable<nullish | TInMemData[TKey], nullish | TMemPatch[TKey]> // `as` - WORKAROUND after angular 15 update

  }

  getAncestorsPath$(): BehaviorSubject<TParent[]> {
    let item$: TSelf | undefined = this as any as TSelf
    let retPath: TParent[] = []

    while (true) {
      // const categories = item$?.val?.categories
      if ( ! item$?.parents?.length ) {
        break
      }
      item$ = item$.parents?.[0] // FIXME: take multi-parent into account
      retPath.push(item$ as TParent)
      // break if there is importance OR no parents
    }
    return new BehaviorSubject(retPath.reverse()) // FIXME make it update as ancestors change
  }

  // ============================================================================
  // Tree traversal & indentation goodies (unified from the OrYoL tree-node model).
  // These run synchronously over the in-memory parents/childrenList$ graph that
  // OdmItem$2 already maintains, complementing its incremental patch+save model.
  // An item can have multiple parents (DAG); path/depth helpers follow the
  // *primary* (first) parent, which is what a single tree rendering uses.
  // ============================================================================

  /** Primary (first) parent, or undefined for a root / top-level item. */
  getPrimaryParent(): TParent | undefined {
    return this.parents?.[0]
  }

  /** Immediate children currently loaded in memory ([] if none / not yet loaded). */
  getChildren(): TChild[] {
    return (this.childrenList$.lastVal ?? []) as TChild[]
  }

  get hasChildren(): boolean {
    return this.getChildren().length > 0
  }

  /** Ancestor items along the primary path, ordered root-first (excludes this item). */
  getAncestorItemsPath(): TParent[] {
    const path: TParent[] = []
    let node = this.getPrimaryParent() as OdmItem$2<any, any, any, any> | undefined
    let guard = 0
    while ( node && guard++ < 10_000 ) {
      path.push(node as TParent)
      node = node.getPrimaryParent()
    }
    return path.reverse()
  }

  /** Indentation / nesting level along the primary path (0 = top-level). */
  getItemDepth(): number {
    return this.getAncestorItemsPath().length
  }

  /** Nearest ancestor (primary path) matching the predicate, or undefined. */
  findAncestorItemMatching(predicate: (item: TParent) => boolean): TParent | undefined {
    let node = this.getPrimaryParent() as OdmItem$2<any, any, any, any> | undefined
    let guard = 0
    while ( node && guard++ < 10_000 ) {
      if ( predicate(node as TParent) ) {
        return node as TParent
      }
      node = node.getPrimaryParent()
    }
    return undefined
  }

  /** Depth-first (pre-order) visit of all in-memory descendants; depth is relative (children = 1). */
  forEachDescendant(visit: (item: TChild, depth: number) => void, relativeDepth = 1): void {
    for ( const child of this.getChildren() ) {
      visit(child, relativeDepth)
      ;(child as unknown as OdmItem$2<any, any, any, any>).forEachDescendant(visit as any, relativeDepth + 1)
    }
  }

  /** Flattened in-memory descendants (depth-first, pre-order). */
  getDescendants(): TChild[] {
    const ret: TChild[] = []
    this.forEachDescendant(item => ret.push(item))
    return ret
  }

  /** True when every descendant satisfies the predicate (vacuously true when no children). */
  allDescendantsMatch(predicate: (item: TChild) => boolean): boolean {
    return this.getChildren().every(child =>
      predicate(child) &&
      (child as unknown as OdmItem$2<any, any, any, any>).allDescendantsMatch(predicate as any),
    )
  }

  /** Deduplicated (by id) in-memory descendants - unlike `getDescendants()`/`forEachDescendant()`
   * above, safe for a many-to-many tree (`parentIds`/`ancestorIds` are plain, unvalidated string
   * arrays - an item reachable via more than one parent path would otherwise be visited, and
   * counted, once per path) and guarded against a cycle (shouldn't occur in a well-formed tree,
   * but nothing at the DB level actually prevents one). Backing method for `getDescendantsCount()`
   * (GH #89's rollup fields) - only covers what's currently loaded in memory, same caveat
   * `getDescendants()` already has; call `requestLoadTreeDescendants()` first for a complete
   * answer over a whole subtree. (`getWhenDescendantLastModified()` no longer uses this - see its
   * own doc comment for why a MAX rollup didn't have to share this in-memory-only limitation.) */
  private getDeduplicatedDescendants(): OdmItem$2<any, any, any, any>[] {
    const visitedIds = new Set<string>()
    const result: OdmItem$2<any, any, any, any>[] = []
    const stack: OdmItem$2<any, any, any, any>[] = [...this.getChildren() as unknown as OdmItem$2<any, any, any, any>[]]
    while (stack.length > 0) {
      const item = stack.pop()!
      const id = item.id as string | undefined
      if (!id || visitedIds.has(id)) {
        continue
      }
      visitedIds.add(id)
      result.push(item)
      stack.push(...(item.getChildren() as unknown as OdmItem$2<any, any, any, any>[]))
    }
    return result
  }

  /** Total count of unique in-memory descendants (GH #89: "New field ... descendantsCount").
   * Deliberately a computed method, not a persisted field - a live incrementally-maintained
   * counter would need every write to any descendant to fan out and bump every ancestor's
   * counter, which doesn't fit this ODM's single-document-patch model and would be genuinely
   * wrong for a many-to-many tree (the same write incrementing a shared descendant's counter via
   * more than one parent path). Computing on demand from whatever's already loaded sidesteps
   * both problems entirely, at the cost of only covering the in-memory subtree - see
   * `getDeduplicatedDescendants()`'s doc comment. */
  getDescendantsCount(): number {
    return this.getDeduplicatedDescendants().length
  }

  /** Latest `whenLastModified` anywhere in this item's subtree (GH #89: "New field
   * whenDescendantLastModified") - a **persisted** field, unlike `getDescendantsCount()`. A count
   * can't be incrementally maintained correctly in a many-to-many tree (the same write would
   * increment a shared descendant's counter via more than one parent path), but a MAX doesn't have
   * that problem - it's idempotent and commutative regardless of how many paths or how many times
   * it's reapplied, so it's safe to propagate. The DB trigger `trg_bump_when_descendant_last_modified`
   * (migration `add_when_descendant_last_modified_rollup`) does that propagation server-side in
   * one bulk statement per write (via the already-fully-expanded `ancestor_ids` column), so this
   * is always accurate regardless of what's currently loaded client-side - unlike the old
   * in-memory-only computed version. `bumpAncestorsWhenDescendantLastModifiedLocally()` (called
   * from `setWhenLastModified()`) additionally patches whatever ancestors are already loaded in
   * this session for immediate, fully-offline-safe UI feedback ahead of that server round-trip. */
  getWhenDescendantLastModified(): OdmTimestamp | undefined {
    return (this.currentVal as any)?.whenDescendantLastModified
  }

  // ============================================================================
  // Sibling ordering & child creation (unified from the OrYoL tree node-orderer).
  // Children carry a fractional `orderNum` so they keep a stable, editable order
  // and can be inserted between neighbours by averaging — all persisted through
  // the OdmItem$2 incremental patch + save model.
  // ============================================================================

  /** This item's fractional sibling-ordering key (undefined if never ordered). */
  getOrderNum(): number | undefined {
    return this.currentVal?.orderNum
  }

  /** Children sorted by `orderNum` ascending; unordered children go last (stable). */
  getChildrenOrdered(): TChild[] {
    return [...this.getChildren()].sort((a, b) => {
      const ao = (a as unknown as OdmItem$2<any, any, any, any>).getOrderNum() ?? Number.POSITIVE_INFINITY
      const bo = (b as unknown as OdmItem$2<any, any, any, any>).getOrderNum() ?? Number.POSITIVE_INFINITY
      return ao - bo
    })
  }

  /** Fractional ordering: midpoint between neighbours, or one step beyond a single neighbour, or
   * 0 when there are none. Delegates to the shared `NodeOrderer` (GH #89's unify-the-tree-worlds
   * effort - this used to be a separate reimplementation of OrYoL's identical algorithm). */
  calculateOrderNumBetween(previous: number | nullish, next: number | nullish): number {
    return nodeOrderer.calculateNewOrderNumber(previous, next)
  }

  /** Create, register and persist a new child item under this one (appended last by
   * default), mirroring OrYoL's `addChild`. The child is wired into `parents` /
   * `childrenList$` immediately for snappy UX, then saved to the DB. */
  createChild(initialData?: Partial<TInMemData>, afterChild?: TChild): TChild {
    const ordered = this.getChildrenOrdered() as unknown as OdmItem$2<any, any, any, any>[]
    const previousChild = afterChild
      ? (afterChild as unknown as OdmItem$2<any, any, any, any>)
      : ordered[ordered.length - 1]
    const previousIndex = previousChild ? ordered.indexOf(previousChild) : -1
    const nextChild = previousIndex >= 0 ? ordered[previousIndex + 1] : ordered[0]
    const orderNum = this.calculateOrderNumBetween(previousChild?.getOrderNum(), nextChild?.getOrderNum())

    const data = { ...(initialData ?? {}), orderNum } as TInMemData
    const child = this.odmService.createOdmItem$(
      undefined,
      data,
      [this as unknown as TParent] as any,
      { createdLocally: true },
    ) as unknown as TChild
    ;(child as unknown as OdmItem$2<any, any, any, any>).saveNowToDb()
    return child
  }

  /** Move this item one position earlier among its (first) parent's ordered children - OrYoL's
   * `ApfNonRootTreeNode.reorderUp()`, generalized to a plain `OdmItem$2` child instead of a
   * `NodeInclusion`-wrapped tree node. Wraps around to become the last child when already first;
   * no-op with no parent or as an only child. */
  reorderUp(): void {
    const parent = this.parents?.[0] as unknown as OdmItem$2<any, any, any, any> | undefined
    if (!parent) {
      return
    }
    const ordered = parent.getChildrenOrdered() as unknown as OdmItem$2<any, any, any, any>[]
    const index = ordered.indexOf(this as unknown as OdmItem$2<any, any, any, any>)
    if (index < 0 || ordered.length < 2) {
      return
    }
    if (index === 0) {
      this.reorderBetween(parent, ordered[ordered.length - 1], undefined) // wrap to last
    } else {
      this.reorderBetween(parent, ordered[index - 2], ordered[index - 1])
    }
  }

  /** Move this item one position later among its (first) parent's ordered children - OrYoL's
   * `ApfNonRootTreeNode.reorderDown()`, generalized the same way `reorderUp()` is. Wraps around to
   * become the first child when already last; no-op with no parent or as an only child. */
  reorderDown(): void {
    const parent = this.parents?.[0] as unknown as OdmItem$2<any, any, any, any> | undefined
    if (!parent) {
      return
    }
    const ordered = parent.getChildrenOrdered() as unknown as OdmItem$2<any, any, any, any>[]
    const index = ordered.indexOf(this as unknown as OdmItem$2<any, any, any, any>)
    if (index < 0 || ordered.length < 2) {
      return
    }
    if (index === ordered.length - 1) {
      this.reorderBetween(parent, undefined, ordered[0]) // wrap to first
    } else {
      this.reorderBetween(parent, ordered[index + 1], ordered[index + 2])
    }
  }

  private reorderBetween(
    parent: OdmItem$2<any, any, any, any>,
    previous: OdmItem$2<any, any, any, any> | undefined,
    next: OdmItem$2<any, any, any, any> | undefined,
  ): void {
    const orderNum = parent.calculateOrderNumBetween(previous?.getOrderNum(), next?.getOrderNum())
    this.patchThrottled({orderNum} as TMemPatch)
    // Patching this child's own orderNum doesn't itself notify the parent's childrenList$ (a
    // separate CachedSubject) - force a re-emit so anything deriving a display order from it
    // (OdmTreeNode.childNodesList$) re-sorts immediately instead of only on the next unrelated
    // children-list change.
    parent.childrenList$.reEmit()
  }

  /** Nest this item one level deeper - becomes the last child of its previous sibling. OrYoL's
   * `ApfNonRootTreeNode.indentIncrease()`, generalized. No-op if this is already the first child
   * (no sibling above to become a child of). */
  indentIncrease(): void {
    const parent = this.parents?.[0] as unknown as OdmItem$2<any, any, any, any> | undefined
    if (!parent) {
      return
    }
    const ordered = parent.getChildrenOrdered() as unknown as OdmItem$2<any, any, any, any>[]
    const index = ordered.indexOf(this as unknown as OdmItem$2<any, any, any, any>)
    if (index <= 0) {
      return
    }
    this.reparentTo(ordered[index - 1], undefined)
  }

  /** Un-nest this item one level - becomes a sibling of its current parent, positioned right
   * after it. OrYoL's `ApfNonRootTreeNode.indentDecrease()`, generalized. No-op if the parent has
   * no parent of its own (this item is already top-level). */
  indentDecrease(): void {
    const parent = this.parents?.[0] as unknown as OdmItem$2<any, any, any, any> | undefined
    const grandparent = parent?.parents?.[0] as unknown as OdmItem$2<any, any, any, any> | undefined
    if (!parent || !grandparent) {
      return
    }
    this.reparentTo(grandparent, parent)
  }

  /** Re-parents this item onto `newParent`, positioned right after `afterSibling` (or last, if
   * omitted). Sets `.parents` directly so the very next `patchThrottled()`/save picks up the new
   * `parentIds` via the existing `setIdAndWhenCreatedIfNecessary()` logic - no separate field
   * needed. Updates both parents' locally-cached `childrenList$` immediately (removed from the
   * old one, added to the new one via `onChildrenAddedLocally()` - the same "wired in immediately
   * for snappy UX" pattern `createChild()` already uses) rather than waiting on a full reload. */
  private reparentTo(newParent: OdmItem$2<any, any, any, any>, afterSibling: OdmItem$2<any, any, any, any> | undefined): void {
    const orderedNewSiblings = newParent.getChildrenOrdered() as unknown as OdmItem$2<any, any, any, any>[]
    const afterIndex = afterSibling ? orderedNewSiblings.indexOf(afterSibling) : -1
    const previous = afterIndex >= 0 ? orderedNewSiblings[afterIndex] : orderedNewSiblings[orderedNewSiblings.length - 1]
    const next = afterIndex >= 0 ? orderedNewSiblings[afterIndex + 1] : undefined
    const orderNum = newParent.calculateOrderNumBetween(previous?.getOrderNum(), next?.getOrderNum())

    const oldParent = this.parents?.[0] as unknown as OdmItem$2<any, any, any, any> | undefined
    if (oldParent && oldParent !== newParent) {
      oldParent.childrenList$.nextWithCache(
        (oldParent.childrenList$.lastVal ?? []).filter(child => child !== (this as unknown as OdmItem$2<any, any, any, any>)),
      )
    }
    this.parents = [newParent as unknown as TParent]
    this.patchThrottled({orderNum} as TMemPatch)
    newParent.onChildrenAddedLocally([this as unknown as TSelf])
  }

  private debugLog(...args: any[]) {
    if (appGlobals.feat?.showDebug) {
      console.log(...args)
    }
  }
}
