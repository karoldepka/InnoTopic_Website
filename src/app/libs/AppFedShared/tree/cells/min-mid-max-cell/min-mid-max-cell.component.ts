import {Component, Injector, ChangeDetectionStrategy} from '@angular/core'
import {AbstractCellComponent} from '../../../AbstractCellComponent'
import {
  StarRatingComponent,
  StarRatingVal,
} from '../../../../AppFedSharedIonic/ratings/star-rating/star-rating.component'
import {FormsModule} from '@angular/forms'
import {IonicModule} from '@ionic/angular'
import {ExpandToggleComponent} from '../../../expand-toggle/expand-toggle.component'
import {VoiceMemoFieldComponent} from '../../../audio/voice-memo-field/voice-memo-field.component'
import {fieldVirtualNodeId} from '../SlotDescriptor'
import {createChildUnderSlot} from '../../BareSlotChildren'

/** A single composite numeric self-rating: `{numVal, comment}` - same shape Journal's fields
 * already use (`JournalCompositeFieldVal`), generalized so any app's numeric slot can share one
 * cell implementation instead of reimplementing the star-rating + note UX per app. */
export interface NumericCellVal {
  numVal?: number | null
  comment?: string | null
}

/** Numeric rating cell (star rating + an optional free-text note) - the numeric counterpart to
 * `RichTextEditCellComponent`, wired the same way through `OdmCell`/`AbstractCellComponent`.
 * Stores/reads the whole `{numVal, comment}` composite via `cell.patchableObservable` (already
 * scoped to this cell's one field by `OdmItem$2.getObservablePatchableForField()`), same as
 * Journal's original `JournalNumericFieldsComponent` did per-field by hand. */
@Component({
  selector: 'app-min-mid-max-cell',
  templateUrl: './min-mid-max-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./min-mid-max-cell.component.sass'],
  imports: [StarRatingComponent, FormsModule, IonicModule, ExpandToggleComponent, VoiceMemoFieldComponent],
})
export class MinMidMaxCellComponent extends AbstractCellComponent {

  /** Journal stores ratings on a 0-10 scale (finer-grained than the 5-star widget can directly
   * express) - same conversion `JournalNumericFieldsComponent` already used. */
  private static readonly maxStoredRatingValue = 10

  maxStars = 5

  commentOpen = false

  private get val(): NumericCellVal {
    return this.cell.patchableObservable.locallyVisibleChanges$.lastVal ?? {}
  }

  get starValue(): StarRatingVal {
    const numericValue = this.val.numVal ?? 0
    return numericValue * (this.maxStars / MinMidMaxCellComponent.maxStoredRatingValue)
  }

  get comment(): string {
    return this.val.comment ?? ''
  }

  get isCommentOpen(): boolean {
    return this.commentOpen || !!this.comment.trim()
  }

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  onStarValueChanged(starValue: StarRatingVal) {
    if (starValue === 0) {
      this.clearNumericValue()
      return
    }
    const numVal = starValue * (MinMidMaxCellComponent.maxStoredRatingValue / this.maxStars)
    this.cell.patchThrottled({...this.val, numVal})
  }

  private clearNumericValue() {
    const {numVal, ...withoutNumVal} = this.val
    const hasRemainingValue = Object.values(withoutNumVal).some(
      value => value !== undefined && value !== null && value !== ''
    )
    this.cell.patchThrottled(hasRemainingValue ? {...withoutNumVal, numVal: null} : null)
  }

  onCommentOpenChange(isOpen: boolean) {
    this.commentOpen = isOpen
    if (isOpen) {
      this.focusComment()
    }
  }

  private focusComment() {
    setTimeout(() => {
      const textarea = this.elementRef.nativeElement.querySelector('ion-textarea') as
        (HTMLElement & {setFocus?: () => Promise<void>}) | null
      textarea?.setFocus?.()
    })
  }

  onChangeComment(comment: string | null | undefined) {
    this.cell.patchThrottled({...this.val, comment: comment ?? ''})
  }

  /** "Recording a voice note on 'mood' should create a new sub-node. Its text should be the
   * transcript." (GH #89) - a real child of this cell's item, anchored under this field's
   * fabricated virtual-node id via `manualAncestorIds` (see `BareSlotChildren.ts`), not appended
   * into this field's own value/comment. */
  onTranscriptReady(transcript: string) {
    const targetNodeId = fieldVirtualNodeId(this.cell.treeNode.item$.id as string, this.cell.column.id)
    createChildUnderSlot(this.cell.treeNode.item$, targetNodeId, {title: transcript} as any)
  }

  override focus() {
    (this.elementRef.nativeElement.querySelector('.actionable, ion-icon') as HTMLElement | null)?.focus?.()
  }

}
