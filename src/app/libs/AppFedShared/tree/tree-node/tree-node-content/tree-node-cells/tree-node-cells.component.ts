import {Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs'
import {OdmTreeNode} from '../../OdmTreeNode'
import {OdmCell} from '../../../cells/OdmCell'
import {fieldVirtualNodeId, hasFieldValue, isSlotVisible, SlotDescriptor} from '../../../cells/SlotDescriptor'
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

  private didAutoExpand = false

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

  /** GH #85/#101: once an item has at least one real filled-in field, its *other*, never-filled
   * shortlisted fields (e.g. Journal's ~46 "always shown" metrics) stop rendering as compact pills
   * at all - on a real entry these are pure clutter (confirmed live: 45 pills on one item), not the
   * quick-access convenience they're meant to be on a genuinely blank one. This id set is the
   * escape hatch that keeps a few of them around anyway: the most-recently-used ones (so a field
   * you always fill in stays one tap away), recomputed each `rebuildCells()` from
   * `SlotUsageTrackerService` (cheap - a handful of localStorage entries per item class). */
  mruDescriptorIds = new Set<string>()

  /** GH #101's "show all" checkbox - the manual override for the same hiding rule, for the rarer
   * case of wanting to browse/open a field that's neither filled nor recently used. */
  showAllFields = false

  private static readonly MRU_LIMIT = 8

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
    this.rebuildCells()
  }

  ngOnDestroy(): void {
    this.valSubscription?.unsubscribe()
    for (const subscription of this.bareSlotSubscriptions.values()) {
      subscription.unsubscribe()
    }
  }

  private rebuildCells(): void {
    // Rebuilt whenever the node/descriptors/item-value changes (not per-render) - an OdmCell is a
    // thin, cheap wrapper, but there's no reason to reconstruct it every change-detection pass.
    const itemVal = this.treeNode.item$.val
    this.mruDescriptorIds = new Set(
      this.slotUsageTrackerService.getMostRecentlyUsedIds(this.treeNode.item$.getCollectionName(), TreeNodeCellsComponent.MRU_LIMIT)
    )
    const anyFieldHasValue = this.descriptors.some(descriptor =>
      descriptor.kind !== 'slot' && hasFieldValue(itemVal?.[descriptor.dataFieldKey as string])
    )
    this.cells = this.descriptors
      .filter(descriptor => isSlotVisible(descriptor, itemVal))
      .filter(descriptor => !this.isClutteringUnfilledPill(descriptor, itemVal, anyFieldHasValue))
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
   * `isSlotVisible()` already decides (unchanged, out of scope here). */
  private isClutteringUnfilledPill(descriptor: SlotDescriptor, itemVal: any, anyFieldHasValue: boolean): boolean {
    if (!descriptor.isShortListed || descriptor.kind === 'slot') {
      return false
    }
    if (!anyFieldHasValue) {
      return false // blank item - every shortlisted field stays available for quick entry, as today
    }
    if (this.showAllFields || this.manuallyExpandedSlotIds.has(descriptor.id) || this.mruDescriptorIds.has(descriptor.id)) {
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
    this.manuallyExpandedSlotIds.add(descriptorId)
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

  /** GH #101's "show all" checkbox - `cells` itself depends on `showAllFields` now
   * (`isClutteringUnfilledPill()`), so toggling it needs a rebuild, unlike a plain template-only
   * flag. */
  onShowAllFieldsChange(value: boolean): void {
    this.showAllFields = value
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
