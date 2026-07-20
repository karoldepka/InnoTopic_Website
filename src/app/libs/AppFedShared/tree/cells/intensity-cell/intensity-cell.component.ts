import {Component, ChangeDetectionStrategy} from '@angular/core'
import {FormsModule} from '@angular/forms'
import {AbstractCellComponent} from '../../../AbstractCellComponent'
import {ButtonsDescriptor, NumericPickerComponent} from '../../../../AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {VoiceMemoFieldComponent} from '../../../audio/voice-memo-field/voice-memo-field.component'
import {fieldVirtualNodeId} from '../SlotDescriptor'
import {createChildUnderSlot} from '../../BareSlotChildren'

/** A discrete named-bucket rating (Learn's `IntensityVal = {id, numeric}` - `funEstimate`,
 * `mentalLevelEstimate`, `physicalHealthImpact`, `mentalHealthImpact`, `importance`,
 * `importanceCurrent`) - deliberately NOT folded into `MinMidMaxCellComponent`, which is a
 * continuous 0-10 star rating + free-text note. These are a genuinely different interaction
 * model (tap one of ~11 labelled emoji buckets, no note field) with no natural lossless mapping
 * onto a 5-star scale - see `SlotDescriptor.buttonsDescriptor` for where the per-field bucket set
 * comes from (ported as-is from the 5 near-duplicate `*-level-edit`/`ImportanceEditComponent`
 * components this replaces). */
@Component({
  selector: 'app-intensity-cell',
  templateUrl: './intensity-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./intensity-cell.component.sass'],
  imports: [NumericPickerComponent, FormsModule, VoiceMemoFieldComponent],
})
export class IntensityCellComponent extends AbstractCellComponent {

  get buttonsDescriptor(): ButtonsDescriptor {
    return this.cell.column.buttonsDescriptor
  }

  get val(): any {
    return this.cell.patchableObservable.locallyVisibleChanges$.lastVal
  }

  onValueChanged(newValue: any): void {
    this.cell.patchThrottled(newValue)
  }

  /** Same "voice note -> new sub-node" behavior as the other cells (GH #89) - there's no note
   * field on an intensity value to append into (unlike `MinMidMaxCellComponent`'s comment). */
  onTranscriptReady(transcript: string): void {
    const targetNodeId = fieldVirtualNodeId(this.cell.treeNode.item$.id as string, this.cell.column.id)
    createChildUnderSlot(this.cell.treeNode.item$, targetNodeId, {title: transcript} as any)
  }

  override focus() {
    (this.elementRef.nativeElement.querySelector('.actionable, button') as HTMLElement | null)?.focus?.()
  }

}
