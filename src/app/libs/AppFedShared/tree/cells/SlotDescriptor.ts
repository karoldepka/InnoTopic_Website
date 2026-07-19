/** Unified per-field/side/template-node descriptor (GH #89) - one shape replacing Journal's
 * numeric/text descriptors, Learn's "sides", and OrYoL/Learn's hardcoded template-node lists.
 * Rendered by `TreeNodeCellsComponent` via `OdmCell`/`OdmTreeNode` (see that file's doc comment
 * for why no new node/cell wrapper class was needed for the common, scalar-field case). */
export type SlotKind = 'numeric' | 'text' | 'slot'

export interface SlotDescriptor {
  id: string
  label: string
  icon?: string
  kind: SlotKind
  /** The key on the parent item this slot's value reads/writes through to (e.g. `mood`,
   * `funEstimate`, `general`) - omitted for a bare slot with no scalar value of its own (e.g. a
   * former OrYoL/Learn template node like "Plan"), which only hosts real children and comments. */
  dataFieldKey?: string
  searchTerms?: string | string[]
  /** Always visible regardless of value/`manuallyAddedSlotIds` - ports Journal's old
   * numeric-descriptor "shortlist" (~50 of 236 fields shown by default) and its old text-
   * descriptor "not `hide`" default (all but one of 18 text fields always shown). */
  isShortListed?: boolean
}

/** The fabricated virtual-node id for a slot on a given parent item, e.g.
 * `abcdefgh_field_mood` - GH #89's exact convention ("Id of the virtual node should be
 * `_field_`"). Used as the comment-thread target id for every slot (real scalar field or bare),
 * and as the `ancestorIds`-containment anchor for a bare slot's real children. Never persisted
 * itself - always recomputed from the (real) parent id + slot id. */
export function fieldVirtualNodeId(parentItemId: string, slotId: string): string {
  return `${parentItemId}_field_${slotId}`
}

/** A field value counts as "filled in" if it's a non-empty string (plain or rich-text scalar
 * fields) or a composite `{numVal, comment}` (Journal-style numeric fields, see
 * `JournalCompositeFieldVal`) with either half actually set - an empty `{}` left behind by a
 * since-cleared rating must NOT count as data, or the field would stay stuck visible forever. */
function hasFieldValue(value: any): boolean {
  if (value == null) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (typeof value === 'object') {
    return (value.numVal !== undefined && value.numVal !== null) || !!value.comment?.trim?.()
  }
  return true
}

/** Whether a slot should actually render for a given item - `TreeNodeCellsComponent` and
 * `SlotPickerComponent` (which only offers *hidden* slots) share this so they can't drift out of
 * sync. A bare slot (`kind: 'slot'`) always shows (it's a stable structural grouping, like a
 * former OrYoL template node); a scalar field shows once it's filled in, once it's
 * `isShortListed`, or once the user's explicitly added it via the picker
 * (`manuallyAddedSlotIds`) - a 236-descriptor registry (Journal's numeric fields) would otherwise
 * render 236 mostly-empty cells. */
export function isSlotVisible(descriptor: SlotDescriptor, itemVal: {manuallyAddedSlotIds?: string[]} & Record<string, any> | undefined): boolean {
  if (descriptor.kind === 'slot' || descriptor.isShortListed) {
    return true
  }
  if (descriptor.dataFieldKey && hasFieldValue(itemVal?.[descriptor.dataFieldKey])) {
    return true
  }
  return !!itemVal?.manuallyAddedSlotIds?.includes(descriptor.id)
}

function includesSearchTerm(haystack: string | string[] | undefined, needle: string): boolean {
  if (!haystack) {
    return false
  }
  if (Array.isArray(haystack)) {
    return haystack.some(h => includesSearchTerm(h, needle))
  }
  return haystack.toLowerCase().includes(needle)
}

/** Fuzzy-ish (substring, case-insensitive) match across id/label/searchTerms - used by
 * SlotPickerComponent's search box, same fields Journal's own descriptor search already checked. */
export function slotDescriptorMatchesSearch(descriptor: SlotDescriptor, search: string): boolean {
  const needle = search.trim().toLowerCase()
  if (!needle) {
    return true
  }
  return includesSearchTerm(descriptor.id, needle)
    || includesSearchTerm(descriptor.label, needle)
    || includesSearchTerm(descriptor.searchTerms, needle)
}
