import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, Output} from '@angular/core'
import {NG_VALUE_ACCESSOR} from '@angular/forms'
import {NgFor} from '@angular/common'
import {IonicModule} from '@ionic/angular'
import {addIcons} from 'ionicons'
import {star, starOutline} from 'ionicons/icons'
import {CustomFormControl} from '../../../AppFedShared/utils/angular/custom-form-control'

export type StarRatingVal = number

/**
 * A tap-to-rate star widget. Clicking a star sets the rating to that star's full value;
 * clicking the same active star again cycles its partial fill through .5, .25, .75,
 * then back to full. Clicking the active first star clears the rating to numeric zero.
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

  @Input() allowZero = true

  private readonly sameStarFractions = [0.5, 0.25, 0.75, 1]
  private continueFirstStarCycleAfterClear = false

  currentValue: StarRatingVal = 0
  hasExplicitRating = false

  @Output() numericValue = new EventEmitter<StarRatingVal>()

  constructor(private changeDetectorRef: ChangeDetectorRef) {
    super()
    // Intentional exception to LifeSuite's solid-icon convention: outline stars are the
    // unselected rating placeholders; selected/fractional values render a solid star above them.
    addIcons({star, starOutline})
  }

  get starIndexes(): number[] {
    return Array.from({length: this.maxStars}, (_, i) => i + 1)
  }

  get ratingAriaLabel(): string {
    return `Rating: ${this.currentValue} of ${this.maxStars} stars`
  }

  starAriaLabel(starIndex: number): string {
    return `Set rating to ${starIndex} of ${this.maxStars} stars`
  }

  override writeValue(value: StarRatingVal | null | undefined): void {
    super.writeValue(value ?? 0)
    this.hasExplicitRating = value !== null && value !== undefined
    this.currentValue = value ?? 0
    // OnPush + ControlValueAccessor gotcha: writeValue() can be called by Angular's forms
    // machinery (e.g. a [ngModel] binding on a parent that re-evaluates every change-detection
    // pass, as journal-numeric-fields.component.html's does) from *outside* any event this
    // component's own template raised - that update alone doesn't mark an OnPush view dirty, so
    // the star fill can silently fail to visually reflect the new currentValue.
    this.changeDetectorRef.markForCheck()
  }

  fillFractionFor(starIndex: number): number {
    return Math.max(0, Math.min(1, this.currentValue - (starIndex - 1)))
  }

  isExplicitZeroMarker(starIndex: number): boolean {
    return this.hasExplicitRating && this.currentValue === 0 && starIndex === 1
  }

  onStarClick(starIndex: number) {
    if (starIndex === 1 && this.currentValue === 0 && this.continueFirstStarCycleAfterClear) {
      this.continueFirstStarCycleAfterClear = false
      this.setValue(0.5)
      return
    }

    const newValue = this.isActiveStar(starIndex)
      ? this.nextSameStarValue(starIndex)
      : starIndex
    // nextSameStarValue() marks the `1 → 0` transition so the following click can continue
    // into the fractional sequence. Do not immediately clear that marker here.
    if (newValue !== 0 || starIndex !== 1) this.continueFirstStarCycleAfterClear = false
    this.setValue(newValue)
  }

  private isActiveStar(starIndex: number): boolean {
    return this.currentValue > starIndex - 1 && this.currentValue <= starIndex
  }

  private nextSameStarValue(starIndex: number): StarRatingVal {
    if (this.allowZero && starIndex === 1 && this.currentValue === 1) {
      this.continueFirstStarCycleAfterClear = true
      return 0
    }

    const currentFraction = this.currentValue - (starIndex - 1)
    const currentFractionIndex = this.sameStarFractions.findIndex(
      fraction => Math.abs(fraction - currentFraction) < 0.001
    )
    const nextFractionIndex = currentFractionIndex === -1
      ? 0
      : (currentFractionIndex + 1) % this.sameStarFractions.length

    return starIndex - 1 + this.sameStarFractions[nextFractionIndex]
  }

  private setValue(newValue: StarRatingVal) {
    this.hasExplicitRating = true
    this.currentValue = newValue
    this.numericValue.emit(newValue)
    this.fireOnChange(newValue)
  }
}
