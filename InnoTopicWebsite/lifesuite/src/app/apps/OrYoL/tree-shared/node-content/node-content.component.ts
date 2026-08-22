import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  ApfBaseTreeNode, NodeFocusOptions, OryBaseTreeNode,
} from '../../tree-model/TreeModel'
import { TreeHostComponent } from '../../tree-host/tree-host/tree-host.component'
import { OryColumn } from '../OryColumn'
// import 'rxjs/add/operator/throttleTime';

import { padStart } from 'lodash-es';
import { DebugService } from '../../core/debug.service'

import { debugLog } from '../../utils/log'
// import {
//   NgbModal,
// } from '@ng-bootstrap/ng-bootstrap'
import {
  Cells,
  ColumnCell,
} from './Cells'
import { CellComponent } from '../cells/CellComponent'
import { NodeContentViewSyncer } from './NodeContentViewSyncer'
import { NodeDebug, NodeDebugCellComponent } from './node-debug-cell/node-debug-cell.component'
import {
  columnDefs,
  Columns,
} from './Columns'
import {Config, ConfigService} from '../../core/config.service'
import { TimeTrackingService, date as toDate } from '../../time-tracking/time-tracking.service'
import {getActiveElementCaretPos, getSelectionCursorState} from '../../../../libs/AppFedShared/utils/caret-utils'
import {isNullish} from '../../../../libs/AppFedShared/utils/utils'
import {nullish} from '../../../../libs/AppFedShared/utils/type-utils'
import {AlertController, PopoverController, ToastController} from '@ionic/angular'
import {presentDismissableToast} from '../../../../libs/AppFedShared/utils/toast-utils'
import {TreeNodeMenuPopoverComponent} from '../tree-node-menu/tree-node-menu-popover.component'
import {INodeContentComponent} from './INodeContentComponent'
import {CachedSubject} from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {OryTreeTableNodeContent} from '../../tree-model/OryTreeTableNodeContent'
import {TreeTableNodeContent} from '../../tree-model/TreeTableNodeContent'
import {ApfNonRootTreeNode} from '../../tree-model/TreeNode'
import { NgClass, NgIf, AsyncPipe } from '@angular/common';
import { NodeExpansionIconComponent } from './node-expansion-icon/node-expansion-icon.component';
import { NodeClassIconComponent } from './node-class-icon/node-class-icon.component';
import { NumericCellComponent } from '../cells/node-cell/numeric-cell.component';
import { NodeContentTimeTrackingComponent } from '../node-content-time-tracking/node-content-time-tracking.component';
import { OryRichTextCellComponent } from '../cells/rich-text-cell/ory-rich-text-cell.component';
import { ContenteditableCellComponent } from '../cells/contenteditable-cell/contenteditable-cell.component';
import { VoiceMemoFieldComponent } from '../../../../libs/AppFedShared/audio/voice-memo-field/voice-memo-field.component';

/* ==== Note there are those sources of truth kind-of (for justified reasons) :
* - UI state
* - tree model: treeNode.itemData & treeNode's nodeInclusionData
* - tree model / view-model events, e.g. fireOnChangeItemDataOfChildOnParents()
* (those above could probably be always 100% in sync; although might be throttleTime-d eg. 100ms if complex calculations and updating dependent nodes)
* - firestore (sent-to-firestore, received-from-firestore)
*/

@Component({
    selector: 'app-node-content',
    templateUrl: './node-content.component.html',
    styleUrls: ['./node-content.component.sass'],
    // encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        NgClass,
        NodeExpansionIconComponent,
        NodeClassIconComponent,
        NgIf,
        NumericCellComponent,
        NodeContentTimeTrackingComponent,
        OryRichTextCellComponent,
        ContenteditableCellComponent,
        NodeDebugCellComponent,
        AsyncPipe,
        VoiceMemoFieldComponent,
    ],
})
export class NodeContentComponent implements OnInit, AfterViewInit, OnDestroy, INodeContentComponent {

  /** Could be actually map *Cell* to Component */
  mapColumnToComponent = new Map<OryColumn, CellComponent>()

  columnDefs = columnDefs

  /* TODO: move to tree model / column-model */
  static columnsStatic = new Columns()

  columns: Columns = NodeContentComponent.columnsStatic

  cells!: Cells

  /* TODO: remove or getter redirect to val */
  isDone: Date | boolean /* for backwards compatibility */ | null = null

  nodeContentViewSyncer!: NodeContentViewSyncer

  @Input() treeNode!: OryBaseTreeNode

  @Input() treeHost!: TreeHostComponent

  private focusedColumn: OryColumn | undefined

  isAncestorOfFocused = false

  isDestroyed = false

  /** `patchThrottled()` emits the item's data stream synchronously. Without this guard, typing
   * in a title immediately makes this component re-run all of its cells and `detectChanges()`;
   * the editor already owns the just-entered DOM value, so that echo is redundant. */
  private isApplyingLocalInput = false

  public get isFocusAtRightmostColumn() { return this.focusedColumn === this.columns.lastColumn }

  public get isFocusAtLeftmostColumn() { return this.focusedColumn === this.columns.leftMostColumn }

  get isEstimatedTimeShown() {
    return ! this.treeNode.isChildOfRoot // FIXME
    // return this.treeNode.hasField(this.columns.estimatedTime)
  }

  nodeDebug = new NodeDebug()

  config$: CachedSubject<Config> = this.configService.config$

  constructor(
    public timeTrackingService: TimeTrackingService,
    private changeDetectorRef: ChangeDetectorRef,
    public debugService: DebugService,
    // private modalService: NgbModal,
    public configService: ConfigService,
    public popoverController: PopoverController,
    protected injector: Injector,
  ) {
    // should be at the level of model / column-model
    this.config$.subscribe(config => {
      this.columnDefs.estimatedTimeMin.hidden = ! config.showMinMaxColumns
      this.columnDefs.estimatedTimeMax.hidden = ! config.showMinMaxColumns
    })
  }

  ngOnInit() {
    this.cells = this.columns.createColumnCells(this.treeNode) // consider rolling cells into OdmItem$. But prolly not, coz OdmItem$ is not thinking in terms of columns/table/treetable

    this.nodeContentViewSyncer = new NodeContentViewSyncer(
      this.injector,
      this.treeNode,
      this.columns,
      this.mapColumnToComponent,
    )

    // debugLog('ngOnInit', this.treeNode.nodeInclusion)
    // debugLog('ngOnInit NodeContentComponent', this.treeNode)
    this.treeHost.registerNodeComponent(this)

    // here also react to child nodes to recalculate sum
    const onChangeItemDataOrChildHandler = () => {
      debugLog('onChangeItemDataOrChildHandler')
      // console.log('onChangeItemDataOrChildHandler')
      if ( ! this.isDestroyed ) {
        this.applyItemDataValuesToViews(false)
      }
    }
    this.treeNode.content.dbItem.data$.subscribe(() => {
      if (!this.isApplyingLocalInput) {
        onChangeItemDataOrChildHandler()
      }
    })
    this.treeNode.onChangeItemDataOfChild.subscribe(() => {
      if ( ! this.isDestroyed ) {
        this.changeDetectorRef.detectChanges()
      }
    })

    this.treeNode.treeModel.focus.focus$.subscribe(() => {
      if (!this.isDestroyed) {
        this.isAncestorOfFocused = this.treeNode.highlight.isAncestorOfFocusedNode()
        // console.log('isAncestorOfFocused', this.isAncestorOfFocused)
        this.changeDetectorRef.detectChanges()
      }
    })
  }

  private applyItemDataValuesToViews(force: boolean) {
    this.nodeDebug.countApplyItemDataValuesToViews ++
    debugLog('applyItemDataValuesToViews this.treeNode', this.treeNode)

    this.isDone = this.treeNode.content.itemData.isDone // TODO: remove redundant field in favor of single source of truth
    if (isNullish(this.isDone)) {
      this.isDone = null; // TODO: test for done timestamp
    }

    this.nodeContentViewSyncer.applyItemDataValuesToViews(force)
    this.changeDetectorRef.detectChanges()
  }

  ngAfterViewInit(): void {
    this.applyItemDataValuesToViews(true /* force = true */)

    // focus if expecting to focus
    // this.focus()
  }

  addChild() {
    const newTreeNode = this.treeNode.addChild() as any as ApfBaseTreeNode
    this.treeNode.expanded = true
    this.focusNewlyCreatedNode(newTreeNode)
  }

  private focusNewlyCreatedNode(newTreeNode: ApfBaseTreeNode) {
    // GH #82: this used to wrap the call below in its own setTimeout() - `TreeHostComponent.
    // focusNode()` already defers internally (waiting for the new node's DOM element to render),
    // so that outer setTimeout was a second, fully redundant event-loop hop adding real,
    // user-visible delay on every Enter press. Every other focusNode() caller
    // (newNodeAtVisualRoot(), createChildNavigateAndFocus(), planToday(), etc.) already calls it
    // directly with no wrapper, confirming the inner deferral alone is sufficient.
    this.treeHost.focusNode(newTreeNode)
  }

  keyPressAltEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent
    event.preventDefault()
    keyboardEvent.stopImmediatePropagation()
    this.addChild()
  }

  keyPressEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent
    if (keyboardEvent.defaultPrevented || keyboardEvent.altKey || keyboardEvent.ctrlKey || keyboardEvent.metaKey) {
      return
    }
    this.createSiblingOrChildOnEnter()
    event.preventDefault()
  }

  /** Split out of keyPressEnter() so a rich-text cell (whose own TinyMCE instance already calls
   * preventDefault() on a plain Enter before it bubbles here) can invoke this directly - going
   * through keyPressEnter() itself would immediately bail via its own defaultPrevented guard,
   * which exists to skip a keydown some *other* handler already dealt with, not this one. */
  createSiblingOrChildOnEnter() {
    if ( this.treeNode.isVisualRoot ) {
      this.addChild()
    } else {
      debugLog('key press enter; node: ', this.treeNode)
      const newTreeNode = this.addNodeAfterThis() as any as ApfBaseTreeNode
      this.focusNewlyCreatedNode(newTreeNode)
    }
  }

  /** NOTE: time-tracking is a cross-cutting built-in concern, so it's ok for it to spill into some generic code.
   * Though this should later be configurable in keyboard shortcuts settings. (at least on-off to avoid conflicts / accidents)
   *  */
  keyPressMetaEnter(event: any) {
    // debugLog('keyPressMetaEnter')
    const timeTrackedEntry = this.timeTrackingService.obtainEntryForItem(this.treeNode.content.dbItem)

    // fresh
    // -> (1) being tracked
    // -> done + next row
    // -> was tracked, **not done**
    // -> (1 back) being tracked, not done

    // TODO: move to global command handler? but under new name not toggleDone
    if ( timeTrackedEntry.val?.isTrackingNow ) {
      timeTrackedEntry.pauseOrNoop() // -- this is automatically executed at TT service level, but TT UI reacts with delay
      this.setDone(true) // FIXME this is prolly patching second time
      // timeTrackedEntry.pauseOrNoop()
      this.focusNodeBelow(event)
    } else {
      if ( this.isDone /* FIXME remove / getter redirect */ ) {
        this.setDone(false)
      } else {
        timeTrackedEntry.startOrResumeTrackingIfNeeded()
      }
    }

    // if ( timeTrackedEntry.wasTracked /* no longer relevant if it was tracked or not */ ) {
    // } else {
    //   timeTrackedEntry.startOrResumeTrackingIfNeeded()
    // }
  }

  public setDone(newDone: boolean) {
    this.isDone = newDone ? (this.isDone || new Date()) : false // TODO: test for done timestamp
    this.onInputChanged(null, this.cells.mapColumnToCell.get(this.columnDefs.isDone) !, this.isDone, null)
    this.changeDetectorRef.detectChanges()
  }

  addNodeAfterThis() {
    return (this.treeNode as any as ApfNonRootTreeNode).addSiblingAfterThis()
  }

  focusNodeAboveAtEnd() {
    const nodeToFocus: ApfBaseTreeNode | undefined = this.treeNode.getNodeVisuallyAboveThis() as ApfBaseTreeNode | undefined
    this.treeHost.focusNode(nodeToFocus, this.columns.lastColumn, {cursorPosition: -1})
  }

  focusNodeBelowAtBeginningOfLine() {
    const nodeToFocus = this.treeNode.getNodeVisuallyBelowThis() as ApfBaseTreeNode | undefined
    this.treeHost.focusNode(nodeToFocus, this.columns.leftMostColumn, {cursorPosition: 0})
  }

  /** TODO: rename to focusCellAbove */
  public focusNodeAbove($event: any) {
    // if ( getSelectionCursorState().atStart ) {
      const nodeToFocus = this.treeNode.getNodeVisuallyAboveThis() as ApfBaseTreeNode | undefined
      this.focusOtherNode(nodeToFocus)
    // }
  }

  public focusNodeBelow($event: any) {
    // if ( getSelectionCursorState().atEnd ) {
      const nodeToFocus = this.treeNode.getNodeVisuallyBelowThis() as ApfBaseTreeNode | undefined
      this.focusOtherNode(nodeToFocus)
    // }
  }

  focusOtherNode(nodeToFocus: ApfBaseTreeNode | undefined) {
    debugLog('focusOtherNode this.focusedColumn', this.focusedColumn)
    this.treeHost.focusNode(nodeToFocus, this.focusedColumn)
  }

  focus(column?: OryColumn | nullish, options?: NodeFocusOptions | nullish) {
    let cellComponentToFocus = this.getCellComponentByColumnOrDefault(column)
    if ( cellComponentToFocus ) {
      cellComponentToFocus.focus(options)
    }
  }

  getCellComponentByColumnOrDefault(column?: OryColumn | nullish): CellComponent {
    return this.mapColumnToComponent.get(column!)
      || this.mapColumnToComponent.get(this.columnDefs.title) !
  }

  onColumnFocused(column: OryColumn, event: any) {
    debugLog('onColumnFocused', column)
    this.focusedColumn = column
    this.treeHost.treeModel.focus.ensureNodeVisibleAndFocusIt(this.treeNode, column)
  }

  /* TODO: rename reactToInputChangedAndSave
  *
  * FIXME this can probably completely be moved to TreeTableNode
  * only view-related thing is `event
  *
  * */
  onInputChanged(event: any, cell: ColumnCell, inputNewValue: any, component: CellComponent | null) {
    debugLog('onInputChanged, cell', cell, event, component)
    const column = cell.column
    // here start moving responsibilities from component viewSyncer to
    this.isApplyingLocalInput = true
    try {
      this.treeNode.content.onInputChangedByUser(cell, inputNewValue)
      column.setValueOnItemData(this.treeNode.content.itemData, inputNewValue) /* FIXME this was changed on `develop`; + patchThrottled considerations */
    } finally {
      this.isApplyingLocalInput = false
    }

    // Only these fields contribute to parent-derived values (remaining time and completion).
    // Broadcasting title edits used to refresh every visible ancestor on every keystroke, which
    // made a deep/large /tree feel like the whole tree was being checked while typing.
    if (column === this.columnDefs.estimatedTime || column === this.columnDefs.isDone) {
      this.treeNode.fireOnChangeItemDataOfChildOnParents()
      this.changeDetectorRef.detectChanges()
    }
    // this.treeNode.onChangeItemData.emit()
    // TODO: investigating time recalculation
  }

  reorderUp(event: any) {
    event.preventDefault() // for Firefox causing page up/down; same for Safari and TextEdit, so looks like Chrome is lacking this shortcut
    ;(this.treeNode as any as ApfNonRootTreeNode).reorderUp()
  }

  reorderDown(event: any) {
    event.preventDefault() // for Firefox causing page up/down; same for Safari and TextEdit, so looks like Chrome is lacking this shortcut
    ;(this.treeNode as any as ApfNonRootTreeNode).reorderDown()
  }

  ngOnDestroy(): void {
    this.isDestroyed = true
    this.treeHost.onNodeContentComponentDestroyed(this)
  }

  /* TODO: move to end-time cell (only on day-plans) */
  formatEndTime(column: OryColumn) {
    const date = this.treeNode.content.endTime(column)
    return '' + date.getHours() + ':' + padStart('' + date.getMinutes(), 2, '0')
  }

  /** Day-plan nodes are conceptually "one per day" - shows which day this plan is actually for
   * at a glance, rather than only whatever's typed into the free-text title. ISO 8601 date (not
   * `.toISOString()`, which always converts to UTC - getFullYear()/getMonth()/getDate() read the
   * *local* timezone instead, same construction TimePointComponent already uses) plus a
   * locale-aware weekday name (undefined locale = the user's own browser/OS locale). */
  getDayPlanDateLabel(): string | undefined {
    const created = toDate(this.treeNode.content.itemData?.whenCreated)
    if (!created || isNaN(created.getTime())) {
      return undefined
    }
    const weekday = new Intl.DateTimeFormat(undefined, {weekday: 'long'}).format(created)
    const isoLocalDate = `${created.getFullYear()}-${padStart('' + (created.getMonth() + 1), 2, '0')}-${padStart('' + created.getDate(), 2, '0')}`
    return `${weekday}, ${isoLocalDate}`
  }

  indentDecrease($event: Event) {
    $event.preventDefault()
    ;(this.treeNode as any as ApfNonRootTreeNode).indentDecrease()
    this.focusNewlyCreatedNode(this.treeNode as any as ApfBaseTreeNode) // FIXME this will not work correctly when multi-parents get fully implemented
  }

  indentIncrease($event: Event) {
    $event.preventDefault()
    ;(this.treeNode as any as ApfNonRootTreeNode).indentIncrease()
    this.focusNewlyCreatedNode(this.treeNode as any as ApfBaseTreeNode) // FIXME this will not work correctly when multi-parents get fully implemented
  }

  onArrowRightOnRightMostCell() {
    // if ( getActiveElementCaretPos() === 0 ) {
    this.focusNodeBelowAtBeginningOfLine()
    // }
  }

  onKeyDownBackspaceOnEstimatedTime() {
    if ( getActiveElementCaretPos() === 0
      && this.treeNode.content.itemData.estimatedTime === ''
    ) {
      this.deleteOnBackspaceIfEmpty()
    }
  }

  onKeyDownBackspaceOnTitle() {
    // Legacy ContenteditableCellComponent path (behind the `useTinyMceTitleEditor` feature flag,
    // off by default now) - OryRichTextCellComponent's own TinyMCE-level interception
    // (RichTextEditComponent's interceptBackspaceOnEmpty) covers the live rich-text path instead.
    if ( getActiveElementCaretPos() === 0 && this.treeNode.isEmptyOrWhitespace() ) {
      this.deleteOnBackspaceIfEmpty()
    }
  }

  /** GH #75: backspace-to-delete, triggered once the title is already confirmed blank (either via
   * OryRichTextCellComponent's TinyMCE-level interception, or the legacy contenteditable path's
   * own check above). A node with children is left alone entirely - deleting it wouldn't cascade
   * to its children (TreeNode.deleteWithoutConfirmation() only ever touches the one item),
   * silently orphaning them; Archive (the tree-node menu's existing "remove a whole subtree"
   * action, which does recurse) is the right tool for that case, not backspace. Otherwise: a
   * genuinely empty node (title blank, nothing else set - treeNode.isEmpty()) deletes immediately,
   * nothing to lose. One with other data still set (e.g. an estimated time or a voice memo)
   * confirms first - deleting removes that too. */
  deleteOnBackspaceIfEmpty(): void {
    if ( this.treeNode.isVisualRoot || this.treeNode.hasChildren || ! this.treeNode.isEmptyOrWhitespace() ) {
      return
    }
    if ( this.treeNode.isEmpty() ) {
      this.deleteNodeWithUndoToast()
    } else {
      this.confirmThenDeleteWithUndoToast()
    }
  }

  private async confirmThenDeleteWithUndoToast() {
    const alert = await this.injector.get(AlertController).create({
      header: 'Delete this item?',
      message: 'It still has other data (e.g. a time estimate) that will be removed too.',
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {text: 'Delete', role: 'destructive', handler: () => this.deleteNodeWithUndoToast()},
      ],
    })
    await alert.present()
  }

  /** Deletes and offers a 6s "Undo" toast that re-creates the node - reuses TreeNode.addChild()'s
   * existing support for re-inserting an already-constructed node (same code path other node-reuse
   * callers like onNodeInclusionModified rely on), so undo goes through the exact same tested
   * create+persist logic as a normal add, rather than a bespoke restore path. Works because
   * deleteWithoutConfirmation() is a soft delete (sets when_deleted) and every save
   * (createPostgresOdmRow()) unconditionally writes when_deleted: null - a fresh save after delete
   * un-deletes it as a side effect. */
  private deleteNodeWithUndoToast() {
    const parent2 = this.treeNode.parent2
    const siblingAbove = this.treeNode.getSiblingNodeAboveThis()
    const deletedNode = this.treeNode
    this.treeNode.deleteWithoutConfirmation()
    const nodeToFocus = (siblingAbove && ! siblingAbove.isVisualRoot) ? siblingAbove
      : (parent2 && ! parent2.isVisualRoot) ? parent2
      : undefined
    if ( nodeToFocus ) {
      this.treeHost.focusNode(nodeToFocus as any, this.columns.lastColumn, {cursorPosition: -1})
    }
    presentDismissableToast(this.injector.get(ToastController), {
      message: 'Item deleted.',
      duration: 6000,
      color: 'medium',
      position: 'bottom',
      buttons: [{
        text: 'Undo',
        role: 'cancel',
        handler: () => {
          parent2?.addChild(siblingAbove as any, deletedNode as any)
        },
      }],
    })
  }

  onArrowLeft() {
    if ( getSelectionCursorState().atStart )  {
      if ( this.isFocusAtLeftmostColumn ) {
        this.focusNodeAboveAtEnd()
      } else {
        this.focusColumnToTheLeft()
      }
    }
  }

  onArrowRight() {
    if ( getSelectionCursorState().atEnd ) {
      if ( this.isFocusAtRightmostColumn ) {
        this.onArrowRightOnRightMostCell()
      } else {
        this.focusColumnToTheRight()
      }
    }
  }

  public focusColumnToTheRight() {
    const colIdx = this.columns.allNotHiddenColumns.indexOf(this.focusedColumn !)
    // TODO: this should be more independent of COLUMNS and work more on CELLS level
    debugLog('coldIdx', colIdx)
    this.focus(this.columns.allNotHiddenColumns[colIdx + 1])
  }

  public focusColumnToTheLeft() {
    const colIdx = this.columns.allNotHiddenColumns.indexOf(this.focusedColumn !)
    debugLog('coldIdx', colIdx)
    this.focus(this.columns.allNotHiddenColumns[colIdx - 1])
  }

  /** Ionic's automatic side-flipping for an event-anchored popover doesn't reliably pick whichever
   * side actually has more room - a click anywhere in roughly the bottom half of the viewport can
   * still get anchored "below" the click and clipped/shrunk to whatever sliver of space remains
   * there, rather than flipping to use the much larger space above (only verified to flip on its
   * own once the click was within a few dozen px of the very edge - 2026-08 incident:
   * TreeNodeMenuPopoverComponent, whose content commonly needs its full --max-height, got clamped
   * to ~200px for a click well above the actual bottom edge). Deciding the side ourselves from the
   * click's own viewport position, AND capping --max-height to the real room on that side (rather
   * than global.scss's blanket min(85vh, 720px), which is fine when the click is roughly centered
   * but overflows off-screen on the *other* edge once the click sits far enough from center that
   * even "the bigger side" has less than 85vh of room) gets the biggest popover the click position
   * actually allows, without ever pushing content off-screen. */
  async onClickClassIcon($event: MouseEvent) {
    // Ionic anchors an event-positioned popover to the *target element's* rect, not the raw click
    // coordinate (a click near the top of a tall icon vs. near its bottom would otherwise get
    // slightly different, inconsistent available-space numbers than what Ionic itself measures) -
    // so the space calculation below has to use that same rect to actually match where Ionic ends
    // up anchoring the popover's edge.
    const iconRect = (($event.currentTarget ?? $event.target) as HTMLElement).getBoundingClientRect()
    const spaceAbove = iconRect.top
    const spaceBelow = window.innerHeight - iconRect.bottom
    const side = spaceBelow >= spaceAbove ? 'bottom' : 'top'
    const edgeMargin = 16
    const availableSpace = Math.max(spaceAbove, spaceBelow) - edgeMargin
    const popover = await this.popoverController.create({
      component: TreeNodeMenuPopoverComponent,
      componentProps: {
        treeNode: this.treeNode,
        treeHost: this.treeHost,
        nodeContentComponent: this,
      },
      event: $event,
      side,
      alignment: 'center',
      translucent: true,
      mode: 'ios',
      cssClass: 'tree-node-menu-popover',
    });
    popover.style.setProperty('--max-height', `${Math.max(200, availableSpace)}px`)
    return await popover.present();
  }
}
