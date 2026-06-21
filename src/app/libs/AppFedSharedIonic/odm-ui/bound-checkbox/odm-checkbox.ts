import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms'
import {ViewSyncer} from '../../../../libs/AppFedShared/odm/ui/ViewSyncer'
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {OdmItem$2} from '../../../AppFedShared/odm/OdmItem$2'
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'odm-checkbox',
    templateUrl: './odm-checkbox.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./odm-checkbox.sass'],
    imports: [IonicModule, ReactiveFormsModule],
})
export class OdmCheckbox implements OnInit {

  @Input()
  @Required()
  fieldName!: string

  @Input()
  @Required()
  public item$ ! : OdmItem$2<any, any, any, any>

  formControls!: any

  formGroup!: UntypedFormGroup

  viewSyncer ! : ViewSyncer

  constructor() { }

  ngOnInit() {
    this.formControls = {
      [this.fieldName]: new UntypedFormControl(),
    }
    this.formGroup = new UntypedFormGroup(this.formControls)
    this.viewSyncer = new ViewSyncer(
      this.formGroup,
      this.item$,
      false,
      this.fieldName
    )
  }
}
