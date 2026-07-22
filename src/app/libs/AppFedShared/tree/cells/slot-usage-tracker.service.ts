import {Injectable} from '@angular/core'

interface SlotUsageEntry {
  count: number
  lastUsedAt: number
}

/** Tracks how often and how recently each field/slot descriptor id has been actively used
 * (opened via a compact pill, or picked via the search box) - GH #101/#103's "most recently used"
 * + "store count of uses" requirement, shared between Journal/Learn's item-detail field lists and
 * (eventually) the `/what-next` page's own buttons, per #103's "share code with the other MRU
 * issue". Deliberately per-browser (localStorage), not synced - this is a personal UI convenience
 * (which fields you personally reach for most), not app data worth persisting server-side.
 *
 * Namespaced by the caller (e.g. an item class name like 'JournalEntry'/'LearnItem') so unrelated
 * descriptor-id spaces across different apps/collections can't collide or bleed into each other's
 * "most recently used" lists. */
@Injectable({providedIn: 'root'})
export class SlotUsageTrackerService {

  private storageKeyFor(namespace: string): string {
    return `slotUsage_${namespace}`
  }

  private readAll(namespace: string): Record<string, SlotUsageEntry> {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeyFor(namespace)) ?? '{}')
    } catch {
      return {}
    }
  }

  recordUsage(namespace: string, descriptorId: string): void {
    const all = this.readAll(namespace)
    const existing = all[descriptorId] ?? {count: 0, lastUsedAt: 0}
    all[descriptorId] = {count: existing.count + 1, lastUsedAt: Date.now()}
    localStorage.setItem(this.storageKeyFor(namespace), JSON.stringify(all))
  }

  /** Ids only, most-recently-used first - the shape both the MRU chip row and any future
   * frequency-boosted search ranking need. */
  getMostRecentlyUsedIds(namespace: string, limit: number): string[] {
    const all = this.readAll(namespace)
    return Object.entries(all)
      .sort(([, a], [, b]) => b.lastUsedAt - a.lastUsedAt)
      .slice(0, limit)
      .map(([id]) => id)
  }
}
