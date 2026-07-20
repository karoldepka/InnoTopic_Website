import {Component, Input, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {OdmCell} from '../../cells/OdmCell'
import {OdmTreeNode} from '../OdmTreeNode'
import {cellDirections, CellNavigationService} from '../../../cell-navigation.service'
import {CachedSubject} from '../../../utils/cachedSubject2/CachedSubject2'
import {getDictionaryValuesAsArray, setIdsFromKeys} from '../../../utils/dictionary-utils'
import { PopoverController, IonicModule } from '@ionic/angular'
import {OdmTreeNodePopupComponent} from '../odm-tree-node-popup/odm-tree-node-popup.component'
import {RichTextEditCellComponent} from '../../cells/rich-text-edit-cell/rich-text-edit-cell.component'
import {VoiceMemoFieldComponent} from '../../../audio/voice-memo-field/voice-memo-field.component'
import { AsyncPipe, NgIf } from '@angular/common';


export function column(colDesc: any) {
  return colDesc
}

/** Generic per-node content for `OdmTreeNodeComponent` ("`app-tree-node`", GH #89's unify-the-
 * tree-rendering effort - see `BareSlotCellComponent`, which now embeds this to display a field's
 * voice-memo-created children, not just Learn's own sub-items view). Only `title` is universal
 * across every `OdmItem$2` subclass; the "answer" column is Learn-specific (a quiz's answer text)
 * and only rendered when this node's collection actually is `LearnItem` - showing/building an
 * `answer` cell for e.g. a `GenericItem`/`JournalEntry` child would edit a field that doesn't
 * exist on it. The "Node actions" (`...`) button is gated the same way - it opens
 * `OdmTreeNodePopupComponent`, which is still hardcoded to `LearnItem`/`LearnItem$` throughout
 * (template application, task/category type-switching, `getRouterLinkUrl()`) and would either
 * misbehave or create a wrong-typed child if opened for a non-Learn node. Genericizing that popup
 * too is a separate, larger piece of work, deliberately not attempted here - hiding it is the
 * safe default until it is.
 *
 * Also renders its own `<app-voice-memo-field>` (`fieldId: 'note'`, matching
 * `FieldVoiceMemoChildController`'s convention) - a voice-memo-created child (the main new
 * reason any `OdmItem$2` besides a `LearnItem` ends up here at all) needs somewhere to actually
 * show/play the recording that created it, not just its transcript-derived title. */
@Component({
    selector: 'app-tree-node-content',
    templateUrl: './odm-tree-node-content.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./odm-tree-node-content.component.sass'],
    imports: [
        IonicModule,
        RichTextEditCellComponent,
        VoiceMemoFieldComponent,
        AsyncPipe,
        NgIf,
    ],
})
export class OdmTreeNodeContentComponent implements OnInit {

  @Input()
  treeNode !: OdmTreeNode

  val$!: CachedSubject<any>

  @ViewChild('answerCell') answerCell?: RichTextEditCellComponent;

  @ViewChild('titleCell') titleCell!: RichTextEditCellComponent;

  mapColumnIdToCell!: Map<string, OdmCell>

  showAnswer = false

  isLearnItem = false

  columns!: any[]

  cells!: OdmCell<any>[]

  constructor(
    public cellNavigationService: CellNavigationService,
    public popoverController: PopoverController,
  ) { }

  ngOnInit() {
    this.val$ = this.treeNode.item$.val$
    this.isLearnItem = this.treeNode.item$.odmService.className === 'LearnItem'

    const columnsDict = setIdsFromKeys({
      title: column({
        type: 'richText',
        flexGrow: 1,
      }),
      ...(this.isLearnItem ? {
        answer: column({
          type: 'richText',
          flexGrow: 2,
        }),
      } : {}),
    })
    this.columns = getDictionaryValuesAsArray(columnsDict)

    this.mapColumnIdToCell = new Map<string, OdmCell>()
    this.cells = this.columns.map(column => {
      const cell = new OdmCell(this.treeNode, column)
      this.mapColumnIdToCell.set(column.id, cell)
      return cell
    })
  }

  onArrowLeft() {
    // this.cellNavigationService.navigateToCellVisuallyInDirection(cellDirections.left)
  }

  async onClickClassIcon($event: MouseEvent) {
    const popover = await this.popoverController.create({
      component: OdmTreeNodePopupComponent,
      componentProps: {
        treeNode: this.treeNode,
        // treeHost: this.treeHost,
        nodeContentComponent: this,
      },
      event: $event,
      translucent: true,
      mode: 'ios',
    });
    return await popover.present();
  }

  toggleShowAnswer() {
    this.showAnswer = !this.showAnswer
    this.answerCell?.focus()
  }

  focusTitle() {
    this.titleCell.focus()
  }

  /** Ctrl+ArrowUp/Down and Tab/Shift+Tab, matching OrYoL's own `NodeContentComponent` bindings
   * for muscle-memory parity (GH #89 unify-the-tree-worlds effort) - both now call the exact same
   * `OdmItem$2.reorderUp()`/`indentIncrease()` etc. built on the shared `NodeOrderer`. `Tab`'s
   * default (move focus to the next form control) has to be suppressed, or indenting would also
   * shift focus away from this row. */
  reorderUp(event: Event) {
    event.preventDefault()
    this.treeNode.item$.reorderUp()
  }

  reorderDown(event: Event) {
    event.preventDefault()
    this.treeNode.item$.reorderDown()
  }

  indentIncrease(event: Event) {
    event.preventDefault()
    this.treeNode.item$.indentIncrease()
  }

  indentDecrease(event: Event) {
    event.preventDefault()
    this.treeNode.item$.indentDecrease()
  }
}
