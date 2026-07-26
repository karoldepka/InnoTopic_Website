import Fuse from 'fuse.js'

/** A single "go do X" entry on /what-next - either a plain navigation (`route`) or a one-off
 * `action` (e.g. cravingFun() also needs to prime localStorage before navigating). */
export interface WhatNextDestination {
  id: string
  label: string
  note?: string
  route?: string
  action?: () => void
  size?: 'big'
  visibleIf?: () => boolean
}

/** Pure ranking/filtering logic for GH #103 ("searchable and MRU-displayable"), split out of
 * WhatNextPage so it's testable without the component's full Angular injector (Router,
 * FeatureService, SlotUsageTrackerService, ...) - just plain inputs in, a plain array out.
 *
 * At rest (no search typed): every destination, most-recently-used first (falling back to the
 * caller's own array order for anything with no usage history yet, via Infinity below). While
 * actively searching: fuzzy-matched results only, on label/note - same threshold GH #96 tuned for
 * the field picker (0.4 proved too permissive on short labels). */
export function rankDestinations(
  destinations: WhatNextDestination[],
  searchTerm: string,
  mostRecentlyUsedIds: string[],
): WhatNextDestination[] {
  const trimmed = searchTerm.trim()
  if (!trimmed) {
    const rank = new Map(mostRecentlyUsedIds.map((id, index) => [id, index]))
    return [...destinations].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity))
  }
  const fuse = new Fuse(destinations, {keys: ['label', 'note'], threshold: 0.2, ignoreLocation: true})
  return fuse.search(trimmed).map(result => result.item)
}
