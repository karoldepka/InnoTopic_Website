import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms'
import {ViewSyncer} from '../../../../libs/AppFedShared/odm/ui/ViewSyncer'
import {Required} from '../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {LearnItem$} from '../../models/LearnItem$'
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-item-class-edit',
    templateUrl: './item-class-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./item-class-edit.component.sass'],
    imports: [IonicModule, ReactiveFormsModule],
})
export class ItemClassEditComponent implements OnInit {

  readonly fieldName = 'isTask'

  formControls = {
    isTask: new UntypedFormControl(),
  }

  formGroup = new UntypedFormGroup(this.formControls)

  viewSyncer ! : ViewSyncer

  @Input()
  @Required()
  public item$ ! : LearnItem$

  constructor() { }

  ngOnInit() {
    this.viewSyncer = new ViewSyncer(
      this.formGroup,
      this.item$,
      false,
      this.fieldName
    )
  }
}
