import {Component, EventEmitter, Injector, Input, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import { btn, ButtonsDescriptor, ButtonVariantDescriptor, NumericPickerVal, NumericPickerComponent } from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {errorAlert} from '../../../../libs/AppFedShared/utils/log'
import {LearnItem$} from '../../models/LearnItem$'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-self-rating',
    templateUrl: './self-rating.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./self-rating.component.sass'],
    imports: [NgIf, NumericPickerComponent],
})
export class SelfRatingComponent extends BaseComponent implements OnInit {

  buttonDescriptors = new ButtonsDescriptor<number, string>([
    btn({
      btnVariants: [
        new ButtonVariantDescriptor(0),
        new ButtonVariantDescriptor(0.5),
        new ButtonVariantDescriptor(0.25),
        new ButtonVariantDescriptor(0.75),
      ],
      color: 'danger',
    }),
    btn({
      btnVariants: [
        new ButtonVariantDescriptor(1),
        new ButtonVariantDescriptor(1.5),
        new ButtonVariantDescriptor(1.25),
        new ButtonVariantDescriptor(1.75),
      ],
      color: 'warning',

    }),
    btn({
      btnVariants: [
        new ButtonVariantDescriptor(2),
        new ButtonVariantDescriptor(2.5),
        new ButtonVariantDescriptor(2.25),
        new ButtonVariantDescriptor(2.75),
      ],
      color: 'success',
    }),
  ])


  @Input()
  set item$(item$: LearnItem$ | undefined) {
    this._item$ = item$
    item$?.requestLoadChildren()
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

  onChangeSelfRating($event: NumericPickerVal) {
    this.numericValue.emit($event)
    if ( this.autoSave ) {
      if ( ! this. item$ ) {
        errorAlert(`cannot onChangeSelfRating on this. item$` + this. item$)
      } else {
        this.item$.setNewSelfRating($event)
      }
    }
  }

}
