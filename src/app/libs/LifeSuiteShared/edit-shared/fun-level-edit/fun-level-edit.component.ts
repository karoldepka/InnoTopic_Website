import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms'
import {ViewSyncer} from '../../../AppFedShared/odm/ui/ViewSyncer'
import {LearnItem$} from '../../../../apps/Learn/models/LearnItem$'
import {funLevels} from '../../../../apps/Learn/models/fields/fun-level.model'
import {createBalancedIntensityButtonsDescriptor} from '../descriptor-level-edit'


const levels = funLevels

export const buttonsDesc = createBalancedIntensityButtonsDescriptor(
  levels,
  [`😡`, `😡😡`, `😡😡😡`, `😡😡😡😡`],
  [`😊`, `😊😊`, `😊😊😊`, `😊😊😊😊`],
)


@Component({
  standalone: false,
  selector: 'app-fun-level-edit',
  templateUrl: './fun-level-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./fun-level-edit.component.sass'],
})
export class FunLevelEditComponent implements OnInit {

  @Input() formControl1 ! : UntypedFormControl

  buttonsDesc = buttonsDesc

  formGroup ! : UntypedFormGroup

  formControls = {
    /* or funEstimate ? ;;; later there can be field for actual fun (could be lower or higher or equal) */
    funEstimate: new UntypedFormControl(),
  }

  viewSyncer ! : ViewSyncer

  @Input()
  // @Required()
  public item$ ! : LearnItem$

  constructor() { }

  ngOnInit() {
    if ( this.formControl1 ) {
      // can use logical assignment operator to overwrite &&=  /  ||=  /  ??=
      // https://www.typescriptlang.org/play#code/C4TwDgpgBAQg9nANlAvFARgxECGA7KAHyjwFdFljS8ATCAMwEs8IaBuAWAChvtgoAHgC5YWVFGAAnUhE48uAqADIlaejkQBnWVAD0u1AD4o6rRG6KVaMhTZ6DKYzcQXlqqNTpMW7e0Y+0DMys3LwQ-CAi8Ejiptpy3CBuaFIydvr+ceZcSVYk5IjpDsZZickBXsG+GY4mGtrcQA
      this.formControls.funEstimate = this.formControl1
    }
    this.formGroup = new UntypedFormGroup(this.formControls)
    if ( this . item$ ) {
      this.viewSyncer = new ViewSyncer(
        this.formGroup,
        this.item$,
        false,
        'funEstimate'
      ) /* TODO might need to ignore other fields from db */
    }
  }

}
