import { Injectable } from '@angular/core';
import {QuizAnswerForHistory, QuizHistoryService} from './quiz-history.service'
import {QuizService} from './quiz.service'
import {catchReportDontRethrow, debugLog} from '../../../../libs/AppFedShared/utils/log'
import {NumericPickerVal} from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {LearnItem$} from '../../models/LearnItem$'
import {SelfRating} from '../../models/fields/self-rating.model'
import {WhatNextService} from '../../../../shared/scheduler/what-next.service'
import {QuizTrackingService} from '../../quiz/quiz-tracking.service'

const answeredTodayStorageKey = 'lifesuite.quiz.answeredToday'

function localDateKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}


@Injectable({
  providedIn: 'root'
})
export class QuizAnswersService {

  /** Answer being prepared */
  answer ? : QuizAnswerForHistory

  whenQuestionShowed ? : Date

  constructor(
    private quizService: QuizService,
    private quizHistoryService: QuizHistoryService,
    private whatNextService: WhatNextService,
    private quizTrackingService: QuizTrackingService,
  ) {
    this.quizService.quizStatus$.subscribe(status => {
      if ( status ?. nextItem$ ) {
        this.answer = new QuizAnswerForHistory()
        this.answer.itemId = status.nextItem$ !. id !
        this.answer.userAgent = navigator.userAgent
        this.whenQuestionShowed = new Date()
        this.quizTrackingService.startQuestionTiming()
        this.quizTrackingService.recordQuizActivity()
        // FIXME: finish
      }
    })
  }

  onShowAnswer() {
    this.quizTrackingService.recordQuizActivity()
    this.answer !. msToShowAnswer = this.getMsSinceQuestionShowed()
    debugLog(`onShowAnswer`, this.answer)
  }

  /** Single interaction path for the toolbar button and direct ABCD-option clicks. */
  toggleShowAnswer(): void {
    this.quizService.toggleShowAnswer()
    this.onShowAnswer()
  }

  onShowHint() {
    this.quizTrackingService.recordQuizActivity()
    this.answer !. msToShowHint = this.getMsSinceQuestionShowed()
  }

  onSelfRate() {
    this.quizTrackingService.recordQuizActivity()
    this.answer !. msToSelfRate = this.getMsSinceQuestionShowed()
  }


  private getMsSinceQuestionShowed() {
    return this.whenQuestionShowed
      ? this.quizTrackingService.getCurrentQuestionActiveDurationMs()
      : 0
  }

  /** Items rated since the app was opened (this service is a root singleton). */
  answeredThisSession = 0

  /** Items rated today on this device; kept in localStorage so it survives reloads. */
  get answeredToday(): number {
    try {
      const stored = JSON.parse(localStorage.getItem(answeredTodayStorageKey) ?? 'null')
      return stored?.date === localDateKey() ? stored.count : 0
    } catch {
      return 0
    }
  }

  private countAnswer() {
    this.answeredThisSession++
    try {
      localStorage.setItem(answeredTodayStorageKey, JSON.stringify({date: localDateKey(), count: this.answeredToday + 1}))
    } catch {
      // Storage unavailable (private mode etc.) - the per-session count still works.
    }
  }

  onApplyAndNext(item$: LearnItem$, selfRating: NumericPickerVal) {
    this.countAnswer()
    this.storeAnswerForHistory(selfRating)
    item$ ?. setNewSelfRating(selfRating !)
    this.quizService.recordExperimentalSchedulerRating(item$?.id, selfRating)
    this.whatNextService.whatNext()
    this.quizService.requestNextItem()
  }

  private storeAnswerForHistory(selfRating: number) {
    catchReportDontRethrow('storeAnswerForHistory', () => {
      this.answer !.quizOptions = Object.assign({}, this.quizService.options$.lastVal !)
      this.answer !.msToApplyAndNext = this.getMsSinceQuestionShowed()
      this.answer !.selfRating = selfRating as SelfRating
      this.quizTrackingService.recordCompletedAnswer(this.answer !.itemId, this.answer !.msToApplyAndNext)

      this.quizHistoryService.onAnswer(
        this.answer !,
      )
    })
  }

}
