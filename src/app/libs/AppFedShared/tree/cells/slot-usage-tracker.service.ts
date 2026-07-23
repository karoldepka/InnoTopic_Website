import {Injectable} from '@angular/core'
import {GenericItemsService} from '../generic-items.service'
import {GenericItem$} from '../GenericItem$'
import {AuthService} from '../../../../auth/auth.service'

interface SlotUsageEntry {
  count: number
  lastUsedAt: number
}

/** Tracks how often and how recently each field/slot descriptor id has been actively used
 * (opened via a compact pill, or picked via the search box) - GH #101/#103's "most recently used"
 * + "store count of uses" requirement, shared between Journal/Learn's item-detail field lists and
 * (eventually) the `/what-next` page's own buttons, per #103's "share code with the other MRU
 * issue". Synced server-side (one `GenericItem` row per user per namespace, via the same generic
 * ODM collection GenericItem$/GenericItemsService already provide - no new backend table/RLS
 * needed) rather than localStorage, so "fields I use most" follows the user across devices.
 *
 * Namespaced by the caller (e.g. an item class name like 'JournalEntry'/'LearnItem') so unrelated
 * descriptor-id spaces across different apps/collections can't collide or bleed into each other's
 * "most recently used" lists. */
@Injectable({providedIn: 'root'})
export class SlotUsageTrackerService {

  private cacheByNamespace = new Map<string, Record<string, SlotUsageEntry>>()
  private item$ByNamespace = new Map<string, GenericItem$>()

  constructor(
    private genericItemsService: GenericItemsService,
    private authService: AuthService,
  ) {
  }

  /** `undefined` while logged out (no per-user id to key the row under) - callers just no-op in
   * that case, same as any other logged-out-write scenario elsewhere in the app. */
  private itemIdFor(namespace: string): string | undefined {
    const uid = this.authService.authUser$.lastVal?.uid
    return uid ? `slot_usage_${namespace}_${uid}` : undefined
  }

  /** Lazily obtains (and starts syncing) this namespace's row - idempotent per namespace, so
   * repeated calls (every `recordUsage()`/`getMostRecentlyUsedIds()`) are cheap. */
  private obtainItem(namespace: string): GenericItem$ | undefined {
    const itemId = this.itemIdFor(namespace)
    if (!itemId) {
      return undefined
    }
    let item$ = this.item$ByNamespace.get(namespace)
    if (!item$) {
      item$ = this.genericItemsService.obtainItem$ById(itemId as any)
      item$.val$.subscribe(val => {
        this.cacheByNamespace.set(namespace, (val as any)?.slotUsageEntries ?? {})
      })
      this.item$ByNamespace.set(namespace, item$)
    }
    return item$
  }

  recordUsage(namespace: string, descriptorId: string): void {
    const item$ = this.obtainItem(namespace)
    if (!item$) {
      return
    }
    const all = this.cacheByNamespace.get(namespace) ?? {}
    const existing = all[descriptorId] ?? {count: 0, lastUsedAt: 0}
    const updated = {...all, [descriptorId]: {count: existing.count + 1, lastUsedAt: Date.now()}}
    item$.patchThrottled({slotUsageEntries: updated} as any)
  }

  /** Ids only, most-recently-used first - the shape both the MRU chip row and any future
   * frequency-boosted search ranking need. Reads whatever's currently cached (populated once the
   * row's initial load/realtime sync has landed) - synchronous like the old localStorage version
   * so `TreeNodeCellsComponent.rebuildCells()` doesn't need to become async, at the cost of a brief
   * empty result on a genuinely cold app start until this namespace's row first arrives. */
  getMostRecentlyUsedIds(namespace: string, limit: number): string[] {
    this.obtainItem(namespace) // ensures the row is being loaded/subscribed even if never patched
    const all = this.cacheByNamespace.get(namespace) ?? {}
    return Object.entries(all)
      .sort(([, a], [, b]) => b.lastUsedAt - a.lastUsedAt)
      .slice(0, limit)
      .map(([id]) => id)
  }
}
