import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {QuizService} from '../../core/quiz/quiz.service'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'

@Component({
  standalone: false,
  selector: 'app-quiz-button',
  templateUrl: './quiz-button.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./quiz-button.component.sass'],
})
export class QuizButtonComponent extends BaseComponent implements OnInit {

  constructor(
    // public quizService: QuizService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

}
