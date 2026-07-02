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

export type UserId = string

export class OdmInMemItemWriteOnce {
  public whenCreated?: OdmTimestamp
  /** TODO maybe better status: 'normal'/null | 'del(eted)' | 'arch(ived)' - but also think of "other meaning of status", like "draft", "published" etc
   * and whenDeleted, whenArchived
   * */
  public isDeleted?: OdmTimestamp
  public owner?: UserId
  public parentIds?: string[]
}

/** FIXME: rename OdmInMemItemData */
export class OdmInMemItem extends OdmInMemItemWriteOnce {
  public whenLastModified?: OdmTimestamp
  public whereCreated?: any
  /** Fractional sibling-ordering key (OrYoL-style), spaced by ODM_ORDER_STEP so nodes
   * can be reordered/inserted between neighbours without renumbering siblings. */
  public orderNum?: number
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

/** Spacing between sibling `orderNum`s (OrYoL-style). Large gap lets us insert
 * between two neighbours by averaging, without renumbering siblings. */
export const ODM_ORDER_STEP = 1000 * 1000

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
    this.currentVal ! . parentIds = this.parents?.filter(
      p => p.id /* FIXME this is a hack if parent was not saved yet (didn't get id yet) */
    )?.map(p => p.id as string) ?? [] /* FIXME: on the loading/receiving side, the this.parents are not set in-mem? */

    if ( ! this.id ) {
      this.id = this.generateItemId()
      // this.currentVal.id = this.id
    }
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
    this.currentVal ! . whenLastModified = OdmBackend.nowTimestamp()
  }

  applyDataFromDbAndEmit(incomingConverted: TInMemData) {
    if (this.hasUnsyncedChanges) {
      // This device has a local edit that hasn't been confirmed written yet - applying
      // incoming data now (e.g. a delayed server echo) would clobber it. Clock-independent:
      // no timestamp comparison needed, since we already know our own edit is unconfirmed.
      debugLog('applyDataFromDbAndEmit: skipped, hasUnsyncedChanges', this.id, incomingConverted)
      return
    }
    const incomingMillis = odmTimestampToMillis((incomingConverted as any)?.whenLastModified)
    const currentMillis = odmTimestampToMillis((this.currentVal as any)?.whenLastModified)
    if (currentMillis !== undefined && incomingMillis !== undefined && incomingMillis < currentMillis) {
      // Stale/out-of-order data (e.g. a late realtime echo overtaken by a newer read) -
      // never let it regress what's already shown.
      debugLog('applyDataFromDbAndEmit: skipped, incoming older than current', this.id, incomingConverted)
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
    console.log(`saveNowToDb`)
    this.setIdAndWhenCreatedIfNecessary()
    this.setLastModifiedIfNecessary(modificationOpts)
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
    console.log('onChildrenAddedLocally', children)
    this.childrenList$.nextWithCache([
      ... (this.childrenList$.lastVal ?? []),
      ... children,
    ])
  }

  public requestLoadChildren() {
    if ( this.childrenListener || ! this.id ) {
      return
    }
    console.log('requestLoadChildren', this.id)
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

        console.log(`requestLoadChildren, onAdded addedItemId parent: `, thisItem$.id, addedItemId, `existingItem?.val$?.hasEmitted`, existingItem?.val$?.hasEmitted)

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
          console.log(`requestLoadChildren, thisItem$.childrenList$.lastVal.push`, thisItem$.id, addedItemId)

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
    console.log('requestLoadTreeDescendants', this.id)
    if ( this.treeDescendantsListener ) {
      return
    }
    // Descendants (any depth) just join the service's general item pool, same as a normal
    // collection-wide load - reuse that listener rather than a bespoke per-node list.
    this.treeDescendantsListener = this.odmService.createBackendListener()

    this.odmService.odmCollectionBackend.loadTreeDescendantsOf(this.id !, this.treeDescendantsListener)
  }


  public getParentIds(): TItemId[] {
    // check if parents are set correctly:
    if ( ! this.parents?.length && !this.isTreeRoot() ) {
      if ( appGlobals.feat.categoriesTree.showFixmes ) {
        console.error('Item$ has no parents, but is not root!', this)
      }
    }
    // FIXME: handle case where this.parents are nullish
    return (this.parents?.map(parent => parent.id! as TItemId)) ?? ([] as TItemId[])
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

  /** OrYoL-style fractional ordering: midpoint between neighbours, or one step
   * beyond a single neighbour, or 0 when there are none. */
  calculateOrderNumBetween(previous: number | nullish, next: number | nullish): number {
    if ( (previous ?? null) === null && next != null ) {
      return next - ODM_ORDER_STEP
    }
    if ( previous != null && (next ?? null) === null ) {
      return previous + ODM_ORDER_STEP
    }
    if ( (previous ?? null) === null && (next ?? null) === null ) {
      return 0
    }
    return (previous! + next!) / 2
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
}
