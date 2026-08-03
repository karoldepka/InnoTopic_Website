import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Required} from '../../../../../libs/AppFedShared/utils/angular/Required.decorator'
import {UntypedFormControl} from '@angular/forms'
import {QuizService} from '../../../core/quiz/quiz.service'
import { SliderComponent } from '../../../shared/slider/slider.component';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
    selector: 'app-quiz-focus-level',
    templateUrl: './quiz-focus-level.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-focus-level.component.sass'],
    imports: [
        SliderComponent,
        AsyncPipe,
        JsonPipe,
    ],
})
export class QuizFocusLevelComponent implements OnInit {

  quizStatus$ = this.quizService.quizStatus$

  @Input()
  @Required()
  control ! : UntypedFormControl

  constructor(
    public quizService: QuizService,
  ) { }

  ngOnInit() {}

  removeQuotes(s: string) {
    return s.replace(/"/g, '')
  }
}
