import {Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs'
import {OdmTreeNode} from '../../OdmTreeNode'
import {OdmCell} from '../../../cells/OdmCell'
import {fieldVirtualNodeId, hasFieldValue, isSlotVisible, slotDescriptorMatchesSearch, SlotDescriptor, SlotKind} from '../../../cells/SlotDescriptor'
import {getBareSlotChildren$} from '../../../BareSlotChildren'
import {IonicModule} from '@ionic/angular'
import {MinMidMaxCellComponent} from '../../../cells/min-mid-max-cell/min-mid-max-cell.component'
import {RichTextEditCellComponent} from '../../../cells/rich-text-edit-cell/rich-text-edit-cell.component'
import {IntensityCellComponent} from '../../../cells/intensity-cell/intensity-cell.component'
import {CommentThreadComponent} from '../../../../comments/comment-thread/comment-thread.component'
import {ExpandToggleComponent} from '../../../../expand-toggle/expand-toggle.component'
import {SlotIconComponent} from '../../../cells/slot-icon/slot-icon.component'
import {BareSlotCellComponent} from '../../../cells/bare-slot-cell/bare-slot-cell.component'
import {SlotPickerComponent} from '../../../cells/slot-picker/slot-picker.component'
import {VirtualSlotStatesOdmService} from '../../../../virtual-slot-state/virtual-slot-states-odm.service'
import {VirtualSlotState$} from '../../../../virtual-slot-state/VirtualSlotState$'
import {TimeTrackedItemCellComponent} from '../../../../../../apps/OrYoL/time-tracking/time-tracked-item-cell/time-tracked-item-cell.component'
import {CellNavigationService} from '../../../../cell-navigation.service'
import {SlotUsageTrackerService} from '../../../cells/slot-usage-tracker.service'

/** Renders one cell per *visible* `SlotDescriptor` for a real item's own fields (GH #89's unified
 * Journal/Learn field rendering) - the generic dispatcher `node-content.component.html`'s own
 * hardcoded per-column cell wiring was heading towards, now driven by data (a `SlotDescriptor[]`)
 * instead of one hardcoded template element per field. `@Input() descriptors` is the item class's
 * *full* registry (e.g. Journal's 236 numeric descriptors) - `isSlotVisible()` (shared with
 * `SlotPickerComponent`, so the two can't drift out of sync) narrows that down to slots that are
 * either filled in, manually added via the picker, or a bare slot (always shown).
 *
 * Every visible slot is commentable AND time-trackable (GH #89) via the same fabricated
 * `fieldVirtualNodeId()` id: `FieldComment` client-filters by it as a `targetNodeId`, while
 * `VirtualSlotState` uses it as the item's own id (one time-track state per slot, not many like
 * comments) - `obtainItem$ById()` lazily creates that row on first patch, same as
 * `OdmService2`'s own well-known `treeRootItem`, so nothing needs pre-creating per slot. */
@Component({
    selector: 'app-tree-node-cells',
    templateUrl: './tree-node-cells.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./tree-node-cells.component.sass'],
    imports: [IonicModule, MinMidMaxCellComponent, RichTextEditCellComponent, IntensityCellComponent, BareSlotCellComponent, CommentThreadComponent, ExpandToggleComponent, SlotIconComponent, TimeTrackedItemCellComponent, SlotPickerComponent],
})
export class TreeNodeCellsComponent implements OnChanges, OnInit, OnDestroy {

  @Input()
  treeNode !: OdmTreeNode

  @Input()
  descriptors !: SlotDescriptor[]

  /** Set by the caller to the descriptor id currently loading (e.g. Learn's `answer` side while
   * an AI generation call is in flight) - purely a spinner/disabled-state signal, forwarded to
   * whichever cell has `aiFillable` and matches. */
  @Input()
  aiFillLoadingDescriptorId: string | null = null

  /** Pass-through of a `RichTextEditCellComponent`'s `aiFillRequested` for whichever
   * `aiFillable` descriptor triggered it - the actual AI call/business logic is the caller's
   * responsibility (see `SlotDescriptor.aiFillable`'s doc comment), not this generic dispatcher's. */
  @Output()
  aiFillRequested = new EventEmitter<SlotDescriptor>()

  /** Pass-through to every `kind: 'slot'` cell's own `BareSlotCellComponent.onChildCreated` -
   * see `FieldVoiceMemoChildController`'s doc comment. Only OrYoL's `TreeNodeMenuPopoverComponent`
   * currently supplies this. */
  @Input()
  onSlotChildCreated?: (child: any) => void

  /** When set, this descriptor's cell is force-expanded and focused once, right after the first
   * `rebuildCells()` - e.g. Journal's write-new page (GH #104) wants `general` ready to type into
   * immediately, instead of behind an extra "tap the pill" step. Only applied once at startup;
   * later @Input() changes have no effect (matches `manuallyExpandedSlotIds`' own "sticky once
   * expanded" semantics - there's no scenario yet where this needs to re-fire). */
  @Input()
  autoExpandDescriptorId?: string

  /** Descriptor ids the caller considers "primary" for this item class (e.g. Journal's `general`) -
   * exempt from the GH #85/#101 clutter-hiding rule regardless of value/MRU/manual-expand state, so
   * the anchor field a user is expected to always be able to find/fill stays present even on an
   * otherwise-filled-in item where it would otherwise itself still be empty. Kept as a caller-
   * supplied list (not a hardcoded id here) so this component stays usable by any item class, not
   * just Journal's. */
  @Input()
  alwaysVisibleDescriptorIds: string[] = []

  /** Starting value for `showMostRecentlyUsed` (see that field's own doc comment for why it's
   * opt-in by default) - applied once, at startup only (mirrors `autoExpandDescriptorId`'s own
   * "sticky once applied" semantics), so the user's own later toggle isn't fought on every
   * change-detection pass. Journal's write page sets this true: unlike browsing someone else's
   * item, or your own well after the fact, "show me my usual fields" is exactly what's wanted
   * while actively writing a fresh entry. */
  @Input()
  defaultShowMostRecentlyUsed = false

  /** When set, `mruDescriptorIds` is built from each `SlotKind`'s own most-recently-used fields
   * independently (this many per kind) instead of one shared pool capped at `MRU_LIMIT` - e.g.
   * Journal's write page wants its 10 most-recently-used numeric self-ratings AND its
   * 10 most-recently-used text fields to each get their own slice, rather than whichever kind
   * happens to be used more often crowding the other out of one combined top-8. `undefined`
   * (the default) preserves the original shared-pool behavior exactly, for every other caller. */
  @Input()
  mruLimitPerKind?: number

  private didAutoExpand = false

  private appliedDefaultShowMostRecentlyUsed = false

  /** Mirrors `SlotPickerComponent`'s own search box - typing a field's name also reveals it here
   * if it's currently clutter-hidden, instead of only surfacing as a separate "add" chip above. */
  private searchTerm = ''

  cells: Array<{descriptor: SlotDescriptor, cell?: OdmCell, targetNodeId: string, timeTrackItem$: VirtualSlotState$}> = []

  /** Which cell's comment thread is expanded - at most one at a time, mirroring the numeric
   * cell's own single `commentOpen` toggle. Keyed by descriptor id, not index, so it survives
   * `cells` being rebuilt on an unrelated descriptor-list change. */
  openCommentsForDescriptorId: string | null = null

  /** An empty cell (no value, and no children recorded under its virtual-node id - see below)
   * renders as a small compact button instead of its full row, so an item with several never-
   * filled fields (right after OrYoL's "Apply Template", or Journal/Learn's many always-
   * shortlisted fields before they're filled in) doesn't turn into a wall of empty rows/rating
   * widgets - see this component's .sass for the flex-wrap layout that lets compact buttons flow
   * together and share lines. "Has a value" for numeric/text/intensity is synchronous
   * (`hasFieldValue()` on the item's own current val, checked directly in `isCompact()`), but
   * every kind ALSO needs this live `getBareSlotChildren$()`-backed set: recording a voice memo on
   * *any* field kind creates a real child anchored under that field's virtual-node id (e.g.
   * `MinMidMaxCellComponent.onTranscriptReady()`), rendered read-only via a second, add-input-less
   * `<app-bare-slot-cell>` under the field's own widget - a field with such a child must count as
   * "has content" even if its own scalar value was never actually set. See
   * `syncBareSlotContentSubscriptions()`. */
  bareSlotHasContentIds = new Set<string>()

  /** Once a compact cell is clicked open, it stays expanded for the rest of this component's
   * lifetime even if its content is later removed - collapsing it back out from under the user
   * mid-edit would be jarring. Reset naturally next time the popover/page reopens. */
  manuallyExpandedSlotIds = new Set<string>()

  /** Compact pills stay mounted briefly after being picked so their dismissal animation can play
   * before Angular replaces them with the full field editor. */
  exitingCompactSlotIds = new Set<string>()

  private static readonly COMPACT_PILL_EXIT_DURATION_MS = 150

  /** GH #85/#101: once an item has at least one real filled-in field, its *other*, never-filled
   * shortlisted fields (e.g. Journal's ~46 "always shown" metrics) stop rendering as compact pills
   * at all - on a real entry these are pure clutter (confirmed live: 45 pills on one item), not the
   * quick-access convenience they're meant to be on a genuinely blank one. This id set is the
   * candidate escape hatch (the most-recently-used ones, server-synced via
   * `SlotUsageTrackerService`) - only actually applied while `showMostRecentlyUsed` is on, see
   * that flag's own doc comment for why this moved behind a checkbox instead of being automatic. */
  mruDescriptorIds = new Set<string>()

  /** GH #101's "show all" checkbox - the manual override for the same hiding rule, for the rarer
   * case of wanting to browse/open a field that's neither filled nor recently used. */
  showAllFields = false

  /** Opt-in gate for `mruDescriptorIds` - originally MRU fields stayed visible unconditionally,
   * but that made "which fields show by default" depend on personal usage history instead of just
   * the item's own data, surprising on someone else's item (or your own after a while). Default
   * visibility is now just the caller's `alwaysVisibleDescriptorIds` + fields with an actual value;
   * MRU is available as an explicit, temporary "show me my usual fields" toggle instead. */
  showMostRecentlyUsed = false

  /** Opt-in gate for every `isShortListed` ("core") field, filled or not - originally these all
   * stayed visible unconditionally on a genuinely blank item ("for quick entry"), but that meant a
   * brand-new entry showed the same ~46-pill wall this whole hiding rule exists to avoid, just on
   * a delay (the moment `general` gets any text, everything else vanishes anyway). A blank item is
   * no longer special-cased - `general` alone (via `alwaysVisibleDescriptorIds`) is enough to start
   * from; this checkbox is the explicit way back to browsing the full core-field set. */
  showCoreFields = false

  private static readonly MRU_LIMIT = 8

  /** Pool size fetched from `SlotUsageTrackerService` before splitting by kind (`mruLimitPerKind`)
   * - generously larger than any realistic per-kind limit so a kind used less often than others
   * (e.g. fewer text-field edits than numeric-rating taps) doesn't get crowded out of the shared
   * recency-ordered pool before its own top-N are found. */
  private static readonly MRU_POOL_SIZE_FOR_SPLIT = 200

  private valSubscription?: Subscription

  /** One `getBareSlotChildren$()` subscription per currently-visible bare slot, keyed by
   * descriptor id - reconciled (not just accumulated) on every `rebuildCells()` since the visible
   * slot set can shrink (e.g. `SlotPickerComponent`/template changes) as well as grow. */
  private bareSlotSubscriptions = new Map<string, Subscription>()

  constructor(
    private virtualSlotStatesOdmService: VirtualSlotStatesOdmService,
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
    private cellNavigationService: CellNavigationService,
    private slotUsageTrackerService: SlotUsageTrackerService,
  ) {
  }

  ngOnInit(): void {
    // Re-filter whenever the item's own value changes, not just on an @Input() change - e.g.
    // right after SlotPickerComponent patches `manuallyAddedSlotIds`, a previously-hidden slot
    // must appear without treeNode/descriptors themselves having changed.
    this.valSubscription = this.treeNode.item$.val$.subscribe(() => {
      this.rebuildCells()
      this.changeDetectorRef.markForCheck()
    })
    // ngOnChanges (treeNode/descriptors are both bound @Input()s) always runs before ngOnInit,
    // including on this very first change - so `cells` is already populated here.
    this.maybeAutoExpand()
  }

  ngOnChanges(): void {
    if (!this.appliedDefaultShowMostRecentlyUsed) {
      this.appliedDefaultShowMostRecentlyUsed = true
      this.showMostRecentlyUsed = this.defaultShowMostRecentlyUsed
    }
    this.rebuildCells()
  }

  ngOnDestroy(): void {
    this.valSubscription?.unsubscribe()
    for (const subscription of this.bareSlotSubscriptions.values()) {
      subscription.unsubscribe()
    }
  }

  /** See `mruLimitPerKind`'s own doc comment. Unset: original shared-pool behavior (top
   * `MRU_LIMIT` overall, any kind). Set: fetches one larger recency-ordered pool (cheap - it's
   * already a plain in-memory object under `SlotUsageTrackerService`, not a fresh query), then
   * walks it taking up to `mruLimitPerKind` ids per `SlotKind` independently, so e.g. numeric
   * ratings being tapped far more often than text fields are filled in doesn't crowd text out of
   * a shared top-N. An id whose descriptor no longer exists in this item class's registry (kind
   * unknown) is skipped rather than counted against any kind's limit. */
  private computeMruDescriptorIds(): Set<string> {
    const namespace = this.treeNode.item$.getCollectionName()
    if (!this.mruLimitPerKind) {
      return new Set(this.slotUsageTrackerService.getMostRecentlyUsedIds(namespace, TreeNodeCellsComponent.MRU_LIMIT))
    }
    const kindById = new Map(this.descriptors.map(descriptor => [descriptor.id, descriptor.kind]))
    const pool = this.slotUsageTrackerService.getMostRecentlyUsedIds(namespace, TreeNodeCellsComponent.MRU_POOL_SIZE_FOR_SPLIT)
    const countByKind = new Map<SlotKind, number>()
    const result = new Set<string>()
    for (const id of pool) {
      const kind = kindById.get(id)
      if (!kind) continue
      const countSoFar = countByKind.get(kind) ?? 0
      if (countSoFar >= this.mruLimitPerKind) continue
      countByKind.set(kind, countSoFar + 1)
      result.add(id)
    }
    return result
  }

  private rebuildCells(): void {
    // Rebuilt whenever the node/descriptors/item-value changes (not per-render) - an OdmCell is a
    // thin, cheap wrapper, but there's no reason to reconstruct it every change-detection pass.
    const itemVal = this.treeNode.item$.val
    this.mruDescriptorIds = this.computeMruDescriptorIds()
    const trimmedSearch = this.searchTerm.trim()
    this.cells = this.descriptors
      // A search match reveals ANY matching descriptor here directly, not just already-visible/
      // shortlisted ones - matches SlotPickerComponent's own "once actively searching, the search
      // scope widens to every descriptor" behavior for its separate add-chip row, so typing a
      // field's name jumps straight to it wherever it conceptually belongs either way.
      //
      // The mruLimitPerKind arm below is deliberately scoped to that flag rather than a bare
      // `showMostRecentlyUsed` check: isSlotVisible() itself has no notion of MRU at all (a
      // never-filled, non-isShortListed descriptor never passes it, regardless of usage history -
      // isClutteringUnfilledPill()'s own MRU exemption only ever "rescues" already-isShortListed
      // fields, since it's a second filter that only runs on what already passed this first one).
      // For Journal's write page, where most descriptors in its ~236-strong numeric
      // catalog aren't isShortListed, that would make MRU a no-op for exactly the fields it's
      // meant to surface. Gating on mruLimitPerKind keeps every other existing caller (which never
      // sets it) byte-for-byte unchanged - MRU still only affects isShortListed fields for them.
      .filter(descriptor => isSlotVisible(descriptor, itemVal)
        || (trimmedSearch && slotDescriptorMatchesSearch(descriptor, trimmedSearch))
        || (!!this.mruLimitPerKind && this.showMostRecentlyUsed && this.mruDescriptorIds.has(descriptor.id)))
      .filter(descriptor => !this.isClutteringUnfilledPill(descriptor, itemVal))
      .map(descriptor => {
        const targetNodeId = fieldVirtualNodeId(this.treeNode.item$.id as string, descriptor.id)
        return {
          descriptor,
          cell: descriptor.dataFieldKey
            ? new OdmCell(this.treeNode, {
              id: descriptor.dataFieldKey,
              type: descriptor.kind,
              buttonsDescriptor: descriptor.buttonsDescriptor,
            })
            : undefined,
          targetNodeId,
          timeTrackItem$: this.virtualSlotStatesOdmService.obtainItem$ById(targetNodeId),
        }
      })

    // Every field kind can now have real children anchored under its virtual-node id (a bare
    // slot's own children, or a voice-memo-created child on any other kind - see
    // bareSlotHasContentIds' doc comment), found by ancestorIds-containment (BareSlotChildren.ts) -
    // that only finds anything once the parent's full descendant tree has actually been bulk-
    // loaded. Whatever embeds this component (currently only OdmTreeNodeComponent, via
    // requestLoadChildren()) may already trigger this, but calling it again here is a cheap no-op
    // guard (OdmItem$2.requestLoadChildren() bails if already listening) - cheaper than requiring
    // every future embedder to remember to.
    if (this.cells.length > 0) {
      this.treeNode.requestLoadChildren()
    }

    this.syncBareSlotContentSubscriptions()
  }

  /** Reconciles `bareSlotSubscriptions`/`bareSlotHasContentIds` against the current `cells` list -
   * every kind now needs this (not just `kind: 'slot'`, see `bareSlotHasContentIds`' doc comment) -
   * subscribes newly-visible cells, tears down ones no longer visible, and leaves already-
   * subscribed ones alone (their subscription already reflects live content, no need to churn it
   * on every unrelated `rebuildCells()` call, e.g. a sibling field being edited). */
  private syncBareSlotContentSubscriptions(): void {
    const visibleIds = new Set(this.cells.map(entry => entry.descriptor.id))

    for (const [descriptorId, subscription] of this.bareSlotSubscriptions) {
      if (!visibleIds.has(descriptorId)) {
        subscription.unsubscribe()
        this.bareSlotSubscriptions.delete(descriptorId)
        this.bareSlotHasContentIds.delete(descriptorId)
      }
    }

    for (const entry of this.cells) {
      if (this.bareSlotSubscriptions.has(entry.descriptor.id)) {
        continue
      }
      const descriptorId = entry.descriptor.id
      const subscription = getBareSlotChildren$(this.treeNode.item$, entry.targetNodeId).subscribe(children => {
        if (children.length > 0) {
          this.bareSlotHasContentIds.add(descriptorId)
        } else {
          this.bareSlotHasContentIds.delete(descriptorId)
        }
        this.changeDetectorRef.markForCheck()
      })
      this.bareSlotSubscriptions.set(descriptorId, subscription)
    }
  }

  /** Every cell with no content stays a compact button until either it gains content, or the user
   * explicitly clicks it open - `isShortListed` (Journal's `mental_health`, Learn's "Mental health
   * impact", etc.) means "always shown", not "always shown at full size": an unset field is just
   * as compact-able as an unset bare slot, whether it's a star rating, a bucket picker, or a plain
   * text box. A field with a voice-memo-created child (`bareSlotHasContentIds`) counts as "has
   * content" too, even with no scalar value of its own. */
  /** See `mruDescriptorIds`' doc comment (GH #85/#101). Scoped to `isShortListed` + non-`'slot'`
   * descriptors specifically - those are the always-shown-regardless-of-value set that causes the
   * clutter; bare slots and explicitly-searched-and-added fields are left exactly as
   * `isSlotVisible()` already decides (unchanged, out of scope here). Deliberately no "blank item"
   * exemption - a brand-new entry showing every shortlisted field (confirmed live: ~46 of them)
   * defeats the purpose just as much as an already-filled-in one would; `general` staying visible
   * via `alwaysVisibleDescriptorIds` is what keeps a fresh entry usable instead. */
  private isClutteringUnfilledPill(descriptor: SlotDescriptor, itemVal: any): boolean {
    if (!descriptor.isShortListed || descriptor.kind === 'slot') {
      return false
    }
    if (this.alwaysVisibleDescriptorIds.includes(descriptor.id)) {
      return false
    }
    if (this.searchTerm.trim() && slotDescriptorMatchesSearch(descriptor, this.searchTerm)) {
      return false // actively searching - reveal a match here too, not just as a separate add-chip
    }
    if (this.showAllFields || this.showCoreFields || this.manuallyExpandedSlotIds.has(descriptor.id)) {
      return false
    }
    if (this.showMostRecentlyUsed && this.mruDescriptorIds.has(descriptor.id)) {
      return false
    }
    return !hasFieldValue(itemVal?.[descriptor.dataFieldKey as string])
  }

  isCompact(descriptor: SlotDescriptor): boolean {
    if (this.manuallyExpandedSlotIds.has(descriptor.id)) {
      return false
    }
    if (this.bareSlotHasContentIds.has(descriptor.id)) {
      return false
    }
    if (descriptor.kind === 'slot') {
      return true
    }
    return !hasFieldValue(this.treeNode.item$.val?.[descriptor.dataFieldKey as string])
  }

  private maybeAutoExpand(): void {
    if (this.didAutoExpand || !this.autoExpandDescriptorId) {
      return
    }
    if (!this.cells.some(entry => entry.descriptor.id === this.autoExpandDescriptorId)) {
      return
    }
    this.didAutoExpand = true
    this.expandCompactCell(this.autoExpandDescriptorId)
  }

  expandCompactCell(descriptorId: string): void {
    if (this.exitingCompactSlotIds.has(descriptorId)) {
      return
    }
    const entry = this.cells.find(cellEntry => cellEntry.descriptor.id === descriptorId)
    if (entry && this.isCompact(entry.descriptor)) {
      this.exitingCompactSlotIds.add(descriptorId)
      this.changeDetectorRef.markForCheck()
      setTimeout(() => this.finishExpandingCompactCell(descriptorId), this.shouldReduceMotion() ? 0 : TreeNodeCellsComponent.COMPACT_PILL_EXIT_DURATION_MS)
      return
    }
    this.finishExpandingCompactCell(descriptorId)
  }

  private finishExpandingCompactCell(descriptorId: string): void {
    this.manuallyExpandedSlotIds.add(descriptorId)
    this.exitingCompactSlotIds.delete(descriptorId)
    this.slotUsageTrackerService.recordUsage(this.treeNode.item$.getCollectionName(), descriptorId)
    // GH #85/#101: this descriptor may have been filtered out of `cells` entirely (never-filled,
    // not-yet-MRU shortlisted field on an otherwise-filled-in item) - re-run the filter now that
    // it's manually expanded, same as onFieldPicked()'s caller (a search hit isn't necessarily
    // already in `cells` either).
    this.rebuildCells()
    this.changeDetectorRef.markForCheck()
    // Angular hasn't swapped the compact button for the real cell yet at this point in the same
    // tick - defer to let that render first, same reasoning as onFieldPicked()'s scrollIntoView.
    setTimeout(() => this.focusExpandedCell(descriptorId))
  }

  private shouldReduceMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /** GH #101's "show all" checkbox - `cells` itself depends on `showAllFields` now
   * (`isClutteringUnfilledPill()`), so toggling it needs a rebuild, unlike a plain template-only
   * flag. */
  onShowAllFieldsChange(value: boolean): void {
    this.showAllFields = value
    this.rebuildCells()
    this.changeDetectorRef.markForCheck()
  }

  /** `showMostRecentlyUsed`'s own checkbox handler - same rebuild-on-toggle reasoning as
   * `onShowAllFieldsChange()` above. */
  onShowMostRecentlyUsedChange(value: boolean): void {
    this.showMostRecentlyUsed = value
    this.rebuildCells()
    this.changeDetectorRef.markForCheck()
  }

  /** `showCoreFields`'s own checkbox handler - same rebuild-on-toggle reasoning as
   * `onShowAllFieldsChange()` above. */
  onShowCoreFieldsChange(value: boolean): void {
    this.showCoreFields = value
    this.rebuildCells()
    this.changeDetectorRef.markForCheck()
  }

  /** `SlotPickerComponent.searchTermChange` - a match also un-hides a clutter-hidden field here,
   * see `isClutteringUnfilledPill()`. */
  onSearchTermChange(term: string): void {
    this.searchTerm = term
    this.rebuildCells()
    this.changeDetectorRef.markForCheck()
  }

  /** Focuses whatever the just-expanded cell's own natural input is - `numeric`/`text`/
   * `intensity` cells are `AbstractCellComponent`s with a real `focus()` (TinyMCE's own focus API
   * for text, not a raw DOM call, so it works even inside its iframe), found via
   * `CellNavigationService`'s registry rather than `OdmCell` reference equality (robust against
   * `rebuildCells()` having re-run a fresh `OdmCell` in between). `kind: 'slot'`
   * (`BareSlotCellComponent`) isn't one of those (no single editable value of its own) - falls
   * back to its "Add…" input directly. */
  private focusExpandedCell(descriptorId: string, attemptsLeft = 20): void {
    const container = this.elementRef.nativeElement.querySelector<HTMLElement>(`[data-descriptor-id="${descriptorId}"]`)
    const cellComponent = container && [...this.cellNavigationService.cellComponents]
      .find(component => container.contains(component.elementRef.nativeElement))
    if (cellComponent) {
      cellComponent.focus()
      return
    }
    const ionInput = container?.querySelector('ion-input, ion-textarea') as (HTMLElement & {setFocus?: () => void}) | null
    if (ionInput?.setFocus) {
      ionInput.setFocus()
      return
    }
    const plainInput = container?.querySelector<HTMLElement>('input, textarea, [contenteditable="true"]')
    if (plainInput) {
      plainInput.focus()
      return
    }
    // Nothing focusable found yet. A user-triggered click (expandCompactCell()'s other caller)
    // always finds it on the very first attempt, since the app has already fully settled by then -
    // this branch only matters for GH #104's auto-expand-at-startup case, which races Angular
    // still mounting the expanded cell's child component (on top of TinyMCE's own async init on
    // top of THAT) during cold app bootstrap. Retry for up to ~2s rather than silently giving up.
    if (attemptsLeft > 0) {
      setTimeout(() => this.focusExpandedCell(descriptorId, attemptsLeft - 1), 100)
    }
  }

  /** `SlotPickerComponent.fieldPicked` - now that the search box scans every field, not just
   * addable ones (see that component's doc comment), this is the "jump to it" half: expand it if
   * it's currently compact, then scroll it into view. `[attr.data-descriptor-id]` (set on both the
   * compact button and the expanded `.slot-cell` in the template) is what makes it findable either
   * way - `setTimeout` lets Angular re-render the compact->expanded switch first, so the element
   * being scrolled to is the final, full-size one, not the about-to-disappear compact button. */
  onFieldPicked(descriptor: SlotDescriptor): void {
    this.expandCompactCell(descriptor.id)
    setTimeout(() => {
      this.elementRef.nativeElement
        .querySelector(`[data-descriptor-id="${descriptor.id}"]`)
        ?.scrollIntoView({behavior: 'smooth', block: 'center'})
    })
  }

  trackByDescriptorId(index: number, entry: {descriptor: SlotDescriptor}): string {
    return entry.descriptor.id
  }

  onCommentsIsOpenChange(descriptorId: string, isOpen: boolean): void {
    this.openCommentsForDescriptorId = isOpen ? descriptorId : null
  }

}
