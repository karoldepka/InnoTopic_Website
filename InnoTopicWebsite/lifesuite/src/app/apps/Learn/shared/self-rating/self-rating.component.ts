import {Component, EventEmitter, Injector, Input, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import { NumericPickerVal } from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import { StarRatingComponent } from '../../../../libs/AppFedSharedIonic/ratings/star-rating/star-rating.component'
import {errorAlert} from '../../../../libs/AppFedShared/utils/log'
import {LearnItem$} from '../../models/LearnItem$'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-self-rating',
    templateUrl: './self-rating.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./self-rating.component.sass'],
    imports: [NgIf, StarRatingComponent],
})
export class SelfRatingComponent extends BaseComponent implements OnInit {

  maxStars = 5

  /** The interval calculator (QuizIntervalCalculator.calculateIntervalHours) exponentiates
   * the raw rating, and was tuned against the old 0-2.75 button scale. Rescaling the 0-5
   * star value onto that same range keeps existing interval calibration unchanged. */
  private static readonly maxRatingValue = 2.75

  @Input()
  set item$(item$: LearnItem$ | undefined) {
    this._item$ = item$
  }

  get item$(): LearnItem$ | undefined {
    return this._item$
  }

  private _item$ ? : LearnItem$

  @Input()
  autoSave = true

  @Output() numericValue = new EventEmitter<NumericPickerVal>()

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  onChangeSelfRating(starValue: NumericPickerVal) {
    const rating = starValue * (SelfRatingComponent.maxRatingValue / this.maxStars)
    this.numericValue.emit(rating)
    if ( this.autoSave ) {
      if ( ! this. item$ ) {
        errorAlert(`cannot onChangeSelfRating on this. item$` + this. item$)
      } else {
        this.item$.setNewSelfRating(rating)
      }
    }
  }

}
