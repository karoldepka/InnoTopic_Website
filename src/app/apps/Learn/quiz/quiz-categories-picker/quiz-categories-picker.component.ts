import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {FormGroup} from '@angular/forms'
import {ViewSyncer} from '../../../../libs/AppFedShared/odm/ui/ViewSyncer'
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-quiz-categories-picker',
    templateUrl: './quiz-categories-picker.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-categories-picker.component.sass'],
    imports: [IonicModule],
})
export class QuizCategoriesPickerComponent implements OnInit {

  // formGroup = new FormGroup(this.controls)
  //
  // viewSyncer = new ViewSyncer(this.formGroup, this.quizService.options2$, false, 'powBaseX100')


  constructor() { }

  ngOnInit() {}

}
