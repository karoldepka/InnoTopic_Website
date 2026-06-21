import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {QuizService} from '../../core/quiz/quiz.service'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-quiz-button',
    templateUrl: './quiz-button.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-button.component.sass'],
    imports: [
        IonicModule,
        RouterLink,
        NgIf,
    ],
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
