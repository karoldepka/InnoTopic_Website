import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { CongratsQuizFinishedComponent } from './congrats-quiz-finished/congrats-quiz-finished.component';
import { IonicModule } from '@ionic/angular';
import { ProcessButtonComponent } from '../../shared/process-button/process-button.component';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { QuizService } from '../../core/quiz/quiz.service';
import { QuizAnswersService } from '../../core/quiz/quiz-answers.service';

@Component({
    selector: 'app-quiz-finished',
    templateUrl: './quiz-finished.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-finished.component.sass'],
    imports: [
        AsyncPipe,
        CongratsQuizFinishedComponent,
        IonicModule,
        ProcessButtonComponent,
        RouterLink,
    ],
})
export class QuizFinishedComponent {

  /** With nothing left now, the status's next item is the soonest one scheduled for later. */
  readonly nextDueMsEpoch$ = this.quizService.quizStatus$.pipe(
    map(status => status.nextItem$ ? this.quizService.calculateWhenNextRepetitionMsEpoch(status.nextItem$) : undefined),
  )

  constructor(
    private quizService: QuizService,
    public quizAnswers: QuizAnswersService,
  ) { }

  formatTimeUntil(msEpoch: number | undefined): string {
    if (msEpoch === undefined || !Number.isFinite(msEpoch)) {
      return '—'
    }
    const minutes = Math.max(0, Math.round((msEpoch - Date.now()) / 60_000))
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${Math.floor(hours / 24)}d ${hours % 24}h`
  }
}
