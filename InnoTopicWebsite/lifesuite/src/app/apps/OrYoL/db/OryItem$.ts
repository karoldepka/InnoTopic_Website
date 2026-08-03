import {
  DbItemClass,
  DbItemField,
} from './DbItemClass'
import {Injector} from '@angular/core'
import {OryItemsService} from '../core/ory-items.service'
import {OryOdmItemsService} from '../db-supabase/ory-odm-items.service'
import {OryOdmItem$} from '../db-supabase/OryOdmItem$'
import {HasPatchThrottled, ItemData} from '../tree-model/has-item-data'
import {stripHtml} from '../../../libs/AppFedShared/utils/html-utils'
import {trimToUndefined} from '../../../libs/AppFedShared/utils/utils'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'

export type ItemId = string //& { type: 'ItemId' }

export type NodeInclusionId = string //& { type: 'NodeInclusionId' }

export type DomainItem$ = any

export type DomainItemCtor = new (
  injector: Injector,
  item$: OryItem$,
) => DomainItem$

/** GH: thin compatibility wrapper around `OryOdmItemsService`'s real, shared `OryOdmItem$` -
 * this class used to keep its own separate `itemData`/`data$` copy, populated only when
 * `TreeModel.onNodeAddedOrModified()` happened to call `onDataArrivedFromRemote()` on THIS
 * SPECIFIC instance. Any other `OryItem$` created for the same id (`TreeModel.obtainItemById()`
 * creating a second one for a node rendered in two branches, `MindfulnessTrackingService` making
 * its own third one for `_mindfulness_<uid>`) had its own independent, possibly-stale copy - and
 * since every write (`patchThrottled`/`patchNow`) always went through `SupabaseTreeService.
 * patchItemData()` -> `OryOdmItemsService.obtainItem$ById().patchNow()` regardless, and that
 * write reconstructs a whole sub-object (e.g. `TimeTrackedEntry`'s `timeTrack`) from *this
 * instance's own* locally-held values with a shallow merge server-side, whichever stale mirror
 * wrote last would silently clobber the other's just-written state - a classic lost-update race,
 * and the concrete cause of recurring "edit conflict" reports on `/tree/_mindfulness`.
 *
 * Every `OryItem$` for a given id now delegates its actual data/patch/save to the SAME shared
 * `OryOdmItem$` (`OryOdmItemsService.obtainItem$ById()` - the same cache `SupabaseTreeService`
 * already writes through), so no two mirrors can ever diverge regardless of how many wrapper
 * instances exist - `obtainDomainItem()` below caches on that shared object too, so e.g.
 * `TimeTrackedEntry` is deduplicated the same way. The wrapper's public shape (itemData/data$/
 * patchThrottled/onDataArrivedFromRemote/obtainDomainItem/...) is kept identical to before so
 * every existing `.content.dbItem` call site (tree cells, voice-memo fields, time-tracking, ...)
 * needs zero changes. */
export class OryItem$<TData = any> implements HasPatchThrottled<TData> {

  /** Still referenced externally by `TreeTableNodeContent.canApplyDataToViewGivenColumnLastLocalEdit()`. */
  public static readonly DELAY_MS_BETWEEN_LOCAL_EDIT_AND_APPLYING_FROM_DB = 7000

  itemsService = this.injector.get(OryItemsService)

  /** The single real, server-synced object for this id - see class doc comment above. */
  private realItem$: OryOdmItem$ = this.injector.get(OryOdmItemsService).obtainItem$ById(this.id as any)

  constructor(
    public injector: Injector,
    public id: ItemId,
  ) {
  }

  get itemData(): TData | undefined {
    return this.realItem$.currentVal as any
  }

  /** Typed against this wrapper's own `TData` (matching the old plain-field behavior), not the
   * shared `OryOdmItem$`'s concrete `OryOdmItem | nullish` - callers overwhelmingly use `OryItem$`
   * with no explicit type param (`TData = any`), which needs `.data$.lastVal.foo` to keep working
   * without a null-check the previous implementation never required either. */
  get data$(): CachedSubject<TData> {
    return this.realItem$.data$ as unknown as CachedSubject<TData>
  }

  /** Never actually set anywhere in the codebase (matches the previous behavior - kept for
   * interface compatibility rather than removed outright, in case a future column-visibility
   * feature wires it up). */
  itemClass?: DbItemClass

  hasField(field: DbItemField) {
    return !!this.itemClass?.hasField?.(field)
  }

  /** GH #75: whether this item's title is blank - HTML-aware (a TinyMCE-empty `<p></p>` strips
   * down to no text), so backspace-to-delete on an "empty-looking" rich-text title is recognized
   * even though its raw HTML string isn't itself an empty string. */
  isEmptyOrWhitespace(): boolean {
    const title = (this.itemData as any)?.title
    return trimToUndefined(stripHtml(title) ?? undefined) === undefined
  }

  patchThrottled(patch: any/*FIXME */) {
    this.realItem$.patchThrottled(patch)
    // Preserves OryItem$'s existing role as an adapter onto OrYoL's own event bus - e.g.
    // TimeTrackingService listens for isDone patches (auto-pause) and for local self-emits here,
    // independent of the shared OryOdmItem$'s own (unrelated) locallyVisibleChanges$ stream.
    this.itemsService.onItemWithDataPatchedByUserLocally$.next([this, patch])
    this.itemsService.onItemAddedOrModified$.next(this)
  }

  getItemData(): ItemData | undefined {
    return this.realItem$.getItemData()
  }

  getId() {
    return this.id
  }

  onDataArrivedFromRemote(itemData: TData | undefined) {
    if (itemData !== undefined) {
      this.realItem$.applyDataFromDbAndEmit(itemData as any)
    }
  }

  /** type MyClassInstance = InstanceType<typeof MyClass>; */
  obtainDomainItem<TCtor extends DomainItemCtor>(ctor: TCtor): InstanceType<TCtor> {
    // Cached on the shared realItem$, not on this wrapper - so e.g. TimeTrackedEntry is the same
    // instance regardless of which OryItem$ wrapper (or how many) requested it for this id.
    return this.realItem$.obtainDomainItem(ctor as any)
  }
}
