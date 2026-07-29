import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgIf } from '@angular/common'
import { Form, UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms'
import {QuizService} from '../../core/quiz/quiz.service'
import {ViewSyncer} from '../../../../libs/AppFedShared/odm/ui/ViewSyncer'
import {OptionsService} from '../../core/options.service'
import {throttleTimeWithLeadingTrailing_ReallyThrottle} from '../../../../libs/AppFedShared/utils/rxUtils'
import {buttonsDesc} from '../../../../libs/LifeSuiteShared/edit-shared/fun-level-edit/fun-level-edit.component'
import {importanceButtonsDesc} from '../../../../libs/LifeSuiteShared/edit-shared/importance-edit/importance-edit.component'
import {QuizOptions} from '../../core/quiz/QuizOptions'
import { IonicModule } from '@ionic/angular';
import { NumericPickerComponent } from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component';
import { QuizIntervalsComponent } from './quiz-intervals/quiz-intervals.component';
import { QuizDiligenceLevelComponent } from './quiz-diligence-level/quiz-diligence-level.component';
import { QuizIntervalImportanceScalingComponent } from './quiz-interval-importance-scaling/quiz-interval-importance-scaling.component';
import { QuizFocusLevelComponent } from './quiz-focus-level/quiz-focus-level.component';

@Component({
    selector: 'app-quiz-options',
    templateUrl: './quiz-options.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-options.component.sass'],
    imports: [
        NgIf,
        IonicModule,
        ReactiveFormsModule,
        NumericPickerComponent,
        QuizIntervalsComponent,
        QuizDiligenceLevelComponent,
        QuizIntervalImportanceScalingComponent,
        QuizFocusLevelComponent,
    ],
})
export class QuizOptionsComponent implements OnInit {

  funButtonsDesc = buttonsDesc
  importanceButtonsDesc = importanceButtonsDesc

  categoriesExpanded = false

  toggleCategories() {
    this.categoriesExpanded = !this.categoriesExpanded
  }

  /** Top-level sections of the options panel - collapsed by default so the panel opens compact;
   * each is expanded independently by clicking its own header. */
  groupsExpanded: {[group in 'filters' | 'scheduling' | 'stats']: boolean} = {
    filters: false,
    scheduling: false,
    stats: false,
  }

  toggleGroup(group: 'filters' | 'scheduling' | 'stats') {
    this.groupsExpanded[group] = !this.groupsExpanded[group]
  }

  /* TODO use some options syncer util, maybe OptionsFormControl directive */
  controls: { [k in keyof QuizOptions]: UntypedFormControl} = {
    dePrioritizeNewMaterial: new UntypedFormControl(false),
    onlyWithQA: new UntypedFormControl(true),
    skipTasks: new UntypedFormControl(true),
    powBaseX100: new UntypedFormControl(),
    scaleIntervalsByImportance: new UntypedFormControl(1),
    focusLevelProbabilities: new UntypedFormControl(1),
    categories: new UntypedFormControl(''),
    textFilter: new UntypedFormControl(''),
    minFunLevel: new UntypedFormControl(),
    minImportanceLevel: new UntypedFormControl(),
    skipAiGenerated: new UntypedFormControl(false),
    onlyAiGenerated: new UntypedFormControl(false),
  }

  formGroup = new UntypedFormGroup(this.controls)

  viewSyncer = new ViewSyncer(this.formGroup, this.quizService.options2$, false,
    'powBaseX100' /* FIXME why just 1 field */)

  constructor(
    public quizService: QuizService,
    public optionsService: OptionsService,
  ) {
    this.controls.minFunLevel.valueChanges.subscribe(v => {
      console.log('minfun', v)
      console.log('minfun val', this.controls.minFunLevel.value)
      console.log('grp val', this.formGroup.value)
    })
    this.formGroup.valueChanges.subscribe(v => console.log('formGroup valueChanges', v))
    this.formGroup.valueChanges.pipe(
      throttleTimeWithLeadingTrailing_ReallyThrottle(200)
    ).subscribe((options: QuizOptions) => {
      console.log('quiz options', options)
      this.quizService.setOptions(options)
    })
    // this.formGroup.setValue({
    //   dePrioritizeNewMaterial: false,
    //   onlyWithQA: true,
    // })
    // this.quizService.options$.subscribe (TODO 2-way binding)
  }

  ngOnInit() {}

}
