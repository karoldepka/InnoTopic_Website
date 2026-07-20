import {Component, Input, Output, EventEmitter, OnChanges, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
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

  cells: Array<{descriptor: SlotDescriptor, cell?: OdmCell, targetNodeId: string, timeTrackItem$: VirtualSlotState$}> = []

  /** Which cell's comment thread is expanded - at most one at a time, mirroring the numeric
   * cell's own single `commentOpen` toggle. Keyed by descriptor id, not index, so it survives
   * `cells` being rebuilt on an unrelated descriptor-list change. */
  openCommentsForDescriptorId: string | null = null

  /** An empty cell (a bare slot with no children, or an `intensity` field with no value set - e.g.
   * Learn's "Mental health impact") renders as a small compact button instead of its full row, so
   * an item with several never-filled slots (right after OrYoL's "Apply Template", or Learn's six
   * always-shortlisted intensity fields before any are picked) doesn't turn into a wall of empty
   * rows/full bucket-picker grids - see this component's .sass for the flex-wrap layout that lets
   * compact buttons flow together and share lines. Only bare slots need tracking here: "has a
   * value" for an `intensity` field is synchronous (`hasFieldValue()` on the item's own current
   * val, checked directly in `isCompact()`), but "has children" for a bare slot needs the same
   * live `getBareSlotChildren$()` query `BareSlotCellComponent` itself uses - see
   * `syncBareSlotContentSubscriptions()`. */
  bareSlotHasContentIds = new Set<string>()

  /** Once a compact cell (bare slot or intensity field) is clicked open, it stays expanded for the
   * rest of this component's lifetime even if its content is later removed - collapsing it back
   * out from under the user mid-edit would be jarring. Reset naturally next time the popover/page
   * reopens. */
  manuallyExpandedSlotIds = new Set<string>()

  private valSubscription?: Subscription

  /** One `getBareSlotChildren$()` subscription per currently-visible bare slot, keyed by
   * descriptor id - reconciled (not just accumulated) on every `rebuildCells()` since the visible
   * slot set can shrink (e.g. `SlotPickerComponent`/template changes) as well as grow. */
  private bareSlotSubscriptions = new Map<string, Subscription>()

  constructor(
    private virtualSlotStatesOdmService: VirtualSlotStatesOdmService,
    private changeDetectorRef: ChangeDetectorRef,
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
    this.cells = this.descriptors
      .filter(descriptor => isSlotVisible(descriptor, itemVal))
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

    // A bare slot (`kind: 'slot'`) groups the item's real children by ancestorIds-containment
    // (see BareSlotChildren.ts) - that only finds anything once the parent's full descendant
    // tree has actually been bulk-loaded. Whatever embeds this component (currently only
    // OdmTreeNodeComponent, via requestLoadChildren()) may already trigger this, but calling it
    // again here is a cheap no-op guard (OdmItem$2.requestLoadChildren() bails if already
    // listening) - cheaper than requiring every future embedder to remember to.
    if (this.cells.some(entry => entry.descriptor.kind === 'slot')) {
      this.treeNode.requestLoadChildren()
    }

    this.syncBareSlotContentSubscriptions()
  }

  /** Reconciles `bareSlotSubscriptions`/`bareSlotHasContentIds` against the current `cells` list -
   * subscribes newly-visible bare slots, tears down ones no longer visible, and leaves already-
   * subscribed ones alone (their subscription already reflects live content, no need to churn it
   * on every unrelated `rebuildCells()` call, e.g. a sibling field being edited). */
  private syncBareSlotContentSubscriptions(): void {
    const visibleSlotIds = new Set(
      this.cells.filter(entry => entry.descriptor.kind === 'slot').map(entry => entry.descriptor.id),
    )

    for (const [descriptorId, subscription] of this.bareSlotSubscriptions) {
      if (!visibleSlotIds.has(descriptorId)) {
        subscription.unsubscribe()
        this.bareSlotSubscriptions.delete(descriptorId)
        this.bareSlotHasContentIds.delete(descriptorId)
      }
    }

    for (const entry of this.cells) {
      if (entry.descriptor.kind !== 'slot' || this.bareSlotSubscriptions.has(entry.descriptor.id)) {
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

  /** A bare slot with no children, or an `intensity` field with no value, stays a compact button
   * until either it gains content, or the user explicitly clicks it open. `numeric`/`text` cells
   * are never compact - they're only ever visible once already filled in (or shortlisted with a
   * value expected soon), unlike `intensity`'s "always shown so the user can rate it" shortlist. */
  isCompact(descriptor: SlotDescriptor): boolean {
    if (this.manuallyExpandedSlotIds.has(descriptor.id)) {
      return false
    }
    if (descriptor.kind === 'slot') {
      return !this.bareSlotHasContentIds.has(descriptor.id)
    }
    if (descriptor.kind === 'intensity') {
      return !hasFieldValue(this.treeNode.item$.val?.[descriptor.dataFieldKey as string])
    }
    return false
  }

  expandCompactCell(descriptorId: string): void {
    this.manuallyExpandedSlotIds.add(descriptorId)
    this.changeDetectorRef.markForCheck()
  }

  trackByDescriptorId(index: number, entry: {descriptor: SlotDescriptor}): string {
    return entry.descriptor.id
  }

  onCommentsIsOpenChange(descriptorId: string, isOpen: boolean): void {
    this.openCommentsForDescriptorId = isOpen ? descriptorId : null
  }

}
