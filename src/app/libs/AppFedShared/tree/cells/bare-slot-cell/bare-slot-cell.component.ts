import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core'
import {AsyncPipe} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {IonicModule} from '@ionic/angular'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {OdmItem$2} from '../../../odm/OdmItem$2'
import {odmTimestampToMillis} from '../../../odm/utils'
import {createChildUnderSlot, FieldVoiceMemoChildController, getBareSlotChildren$} from '../../BareSlotChildren'
import {VoiceMemoFieldComponent} from '../../../audio/voice-memo-field/voice-memo-field.component'
import {DatePipe} from '@angular/common'
import {OdmTreeNode} from '../../tree-node/OdmTreeNode'
import {OdmTreeNodeComponent} from '../../tree-node/odm-tree-node.component'

/** A bare slot (GH #89's `kind: 'slot'` descriptor, e.g. a former OrYoL/Learn template node like
 * "Plan") - no scalar value of its own, just a live-filtered list of the parent's real children
 * that were tagged with this slot's fabricated id (see `BareSlotChildren.ts`) plus an affordance
 * to add another. Rendered by `TreeNodeCellsComponent` alongside `MinMidMaxCellComponent`/
 * `RichTextEditCellComponent` for the other two `SlotKind`s - it isn't an `AbstractCellComponent`
 * itself (no single editable value/`OdmCell` to bind), but the comment-thread and time-tracking
 * toggles around it work identically since both key off the same fabricated `targetNodeId`.
 *
 * Children render via the generic `app-tree-node` (`OdmTreeNodeComponent`) - the same recursive,
 * expand/collapse tree rendering used elsewhere in the app, unified here instead of a bespoke
 * flat text list, so a voice-memo-created child (or one added directly here) is a first-class,
 * navigable/nestable node, not a dead-end label. Deliberately NOT OrYoL's own tree component
 * (`NestedTreeNodeComponent`) - that one is fused to OrYoL's multi-parent `TreeModel`/
 * `NodeInclusion` engine and only ever renders `OryBaseTreeNode`s, whereas this cell's children
 * can be a `GenericItem`/`JournalEntry`/`LearnItem`/`OryItem` alike, all plain `OdmItem$2`s. */
@Component({
  selector: 'app-bare-slot-cell',
  templateUrl: './bare-slot-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./bare-slot-cell.component.sass'],
  imports: [AsyncPipe, DatePipe, FormsModule, IonicModule, VoiceMemoFieldComponent, OdmTreeNodeComponent],
})
export class BareSlotCellComponent implements OnChanges {

  @Input() parentItem$!: OdmItem$2<any, any, any, any>
  @Input() targetNodeId!: string
  @Input() descriptorId!: string

  /** A bare slot (`kind: 'slot'`) has no widget of its own, so it needs this add-input/voice-memo
   * row to create its first child at all. A `numeric`/`text`/`intensity` cell already has its own
   * voice-memo button (recording there already `createChildUnderSlot()`s the exact same way - see
   * e.g. `MinMidMaxCellComponent.onTranscriptReady()`) - when this component is embedded under one
   * of those (read-only children list only, see `TreeNodeCellsComponent`), a second add-input here
   * would just be a confusing duplicate. */
  @Input() showAddInput = true

  children$?: Observable<OdmItem$2<any, any, any, any>[]>

  /** GH #89's "descendantsCount"/"whenDescendantLastModified" rollup, scoped to just this bare
   * slot's own children (not the whole parent item's full descendant tree - see
   * `OdmItem$2.getDescendantsCount()`'s doc comment for why these are computed on demand, not
   * persisted fields). Deduplication isn't needed here the way it is for the whole-item rollup -
   * `getBareSlotChildren$()` already yields each item at most once. */
  summary$?: Observable<{count: number, whenLastModified: Date | null}>

  newChildTitle = ''

  /** One `OdmTreeNode` wrapper per child, reused across `children$` re-emissions (keyed by item
   * id) rather than rebuilt every time - a fresh wrapper each emission would reset `isExpanded`
   * and remount `app-tree-node` on every unrelated reactive update (e.g. a sibling child's edit). */
  private treeNodeCache = new Map<string, OdmTreeNode<OdmItem$2<any, any, any, any>>>()

  /** GH #89's voice-memo-becomes-a-child wiring, shared with every other cell kind - see
   * `FieldVoiceMemoChildController`'s doc comment. A bare slot's own "add" row already targets
   * this exact slot (`targetNodeId`), so unlike the other cells' controllers (which derive their
   * own target from a `dataFieldKey`), this one is just handed straight through. */
  voiceMemoChildController!: FieldVoiceMemoChildController<any>

  ngOnChanges(): void {
    this.voiceMemoChildController = new FieldVoiceMemoChildController(this.parentItem$, this.targetNodeId)
    this.children$ = getBareSlotChildren$(this.parentItem$, this.targetNodeId)
    this.summary$ = this.children$.pipe(
      map(children => {
        const timestamps = children
          .map(child => odmTimestampToMillis((child.val as any)?.whenLastModified))
          .filter((ms): ms is number => ms !== undefined)
        return {
          count: children.length,
          whenLastModified: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null,
        }
      }),
    )
  }

  getChildTreeNode(child: OdmItem$2<any, any, any, any>): OdmTreeNode<OdmItem$2<any, any, any, any>> {
    const id = child.id as string
    let treeNode = this.treeNodeCache.get(id)
    if (!treeNode) {
      treeNode = new OdmTreeNode(undefined, child)
      this.treeNodeCache.set(id, treeNode)
    }
    return treeNode
  }

  addChild(): void {
    const title = this.newChildTitle.trim()
    if (!title) {
      return
    }
    createChildUnderSlot(this.parentItem$, this.targetNodeId, {title} as any)
    this.newChildTitle = ''
  }

}
