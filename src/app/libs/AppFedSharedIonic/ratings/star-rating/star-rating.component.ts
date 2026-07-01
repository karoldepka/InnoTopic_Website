import {ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output} from '@angular/core'
import {NG_VALUE_ACCESSOR} from '@angular/forms'
import {NgFor} from '@angular/common'
import {IonicModule} from '@ionic/angular'
import {addIcons} from 'ionicons'
import {star, starOutline} from 'ionicons/icons'
import {CustomFormControl} from '../../../AppFedShared/utils/angular/custom-form-control'

export type StarRatingVal = number

/**
 * A tap-to-rate star widget. Clicking a star sets the rating to that star's full value;
 * clicking the *same* star again cycles it down through quarter-steps (-.25, -.5, -.75)
 * before wrapping back to the full value, so quarter/half precision doesn't need a
 * separate control.
 */
@Component({
  selector: 'apf-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true,
    },
  ],
  imports: [NgFor, IonicModule],
})
export class StarRatingComponent extends CustomFormControl<StarRatingVal> {

  @Input() maxStars = 5

  currentValue: StarRatingVal = 0

  @Output() numericValue = new EventEmitter<StarRatingVal>()

  private lastClickedStarIndex: number | null = null
  private lastClickCycle = 0

  constructor() {
    super()
    addIcons({star, 'star-outline': starOutline})
  }

  get starIndexes(): number[] {
    return Array.from({length: this.maxStars}, (_, i) => i + 1)
  }

  override writeValue(value: StarRatingVal): void {
    super.writeValue(value)
    this.currentValue = value ?? 0
  }

  fillFractionFor(starIndex: number): number {
    return Math.max(0, Math.min(1, this.currentValue - (starIndex - 1)))
  }

  onStarClick(starIndex: number) {
    if (this.lastClickedStarIndex === starIndex) {
      this.lastClickCycle = (this.lastClickCycle + 1) % 4
    } else {
      this.lastClickedStarIndex = starIndex
      this.lastClickCycle = 0
    }
    const newValue = starIndex - this.lastClickCycle * 0.25
    this.currentValue = newValue
    this.numericValue.emit(newValue)
    this.fireOnChange(newValue)
  }
}
