import {ChangeDetectionStrategy, Component, Input, OnChanges} from '@angular/core'
import {AsyncPipe} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {IonicModule} from '@ionic/angular'
import {Observable} from 'rxjs'
import {OdmItem$2} from '../../../odm/OdmItem$2'
import {createChildUnderSlot, getBareSlotChildren$} from '../../BareSlotChildren'
import {VoiceMemoFieldComponent} from '../../../audio/voice-memo-field/voice-memo-field.component'

/** A bare slot (GH #89's `kind: 'slot'` descriptor, e.g. a former OrYoL/Learn template node like
 * "Plan") - no scalar value of its own, just a live-filtered list of the parent's real children
 * that were tagged with this slot's fabricated id (see `BareSlotChildren.ts`) plus an affordance
 * to add another. Rendered by `TreeNodeCellsComponent` alongside `MinMidMaxCellComponent`/
 * `RichTextEditCellComponent` for the other two `SlotKind`s - it isn't an `AbstractCellComponent`
 * itself (no single editable value/`OdmCell` to bind), but the comment-thread and time-tracking
 * toggles around it work identically since both key off the same fabricated `targetNodeId`. */
@Component({
  selector: 'app-bare-slot-cell',
  templateUrl: './bare-slot-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./bare-slot-cell.component.sass'],
  imports: [AsyncPipe, FormsModule, IonicModule, VoiceMemoFieldComponent],
})
export class BareSlotCellComponent implements OnChanges {

  @Input() parentItem$!: OdmItem$2<any, any, any, any>
  @Input() targetNodeId!: string
  @Input() descriptorId!: string

  children$?: Observable<OdmItem$2<any, any, any, any>[]>

  newChildTitle = ''

  ngOnChanges(): void {
    this.children$ = getBareSlotChildren$(this.parentItem$, this.targetNodeId)
  }

  getChildTitle(child: OdmItem$2<any, any, any, any>): string {
    return (child.val as any)?.title ?? (child.val as any)?.name ?? child.id as string
  }

  addChild(): void {
    const title = this.newChildTitle.trim()
    if (!title) {
      return
    }
    createChildUnderSlot(this.parentItem$, this.targetNodeId, {title} as any)
    this.newChildTitle = ''
  }

  /** Same "voice note -> new sub-node" behavior as `MinMidMaxCellComponent`/
   * `RichTextEditCellComponent` (GH #89) - a bare slot already groups real children by this
   * exact mechanism, so recording directly onto it is just `createChildUnderSlot()` again. */
  onTranscriptReady(transcript: string): void {
    createChildUnderSlot(this.parentItem$, this.targetNodeId, {title: transcript} as any)
  }

}
