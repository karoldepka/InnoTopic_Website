import {Component, Injector, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {QuizService} from '../../core/quiz/quiz.service'
import {NumericPickerVal} from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {LearnItem$} from '../../models/LearnItem$'
import {nullish} from '../../../../libs/AppFedShared/utils/type-utils'
import {QuizHistoryService} from '../../core/quiz/quiz-history.service'
import {QuizAnswersService} from '../../core/quiz/quiz-answers.service'
import {Store} from '@ngrx/store'
import {requestNextQuizItem} from '../../core/quiz/quiz.actions'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { TimePassingComponent } from '../../../../libs/AppFedShared/time/time-passing/time-passing.component';
import { SelfRatingComponent } from '../../shared/self-rating/self-rating.component';

@Component({
    selector: 'app-show-answer-and-rate',
    templateUrl: './show-answer-and-rate.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./show-answer-and-rate.component.sass'],
    imports: [
        IonicModule,
        RouterLink,
        NgIf,
        TimePassingComponent,
        SelfRatingComponent,
        AsyncPipe,
    ],
})
export class ShowAnswerAndRateComponent extends BaseComponent implements OnInit {

  @Input()
  set item$(item$: LearnItem$ | nullish) {
    this._item$ = item$
    item$?.requestLoadChildren()
  }

  get item$(): LearnItem$ | nullish {
    return this._item$
  }

  private _item$ ? : LearnItem$ | nullish

  public selfRating: NumericPickerVal | undefined = undefined

  hide = false

  get showAnswer$() { return this.quizService.showAnswer$ }

  get showHint$() { return this.quizService.showHint$ }

  get showChoices$() { return this.quizService.showChoices$ }

  get hasMultipleChoiceAnswers(): boolean {
    return !!this.item$?.currentVal?.multipleChoiceAnswers?.length
  }

  get quizStatus$() { return this.quizService.quizStatus$ }

  quizSelector$ = this.store.select(store => {
    console.log('store select', store)
    return store.count.quizItemId
  })

  constructor(
    public quizService: QuizService,
    public quizHistoryService: QuizHistoryService,
    public quizAnswersService: QuizAnswersService,
    private store: Store<{count: {quizItemId: {}}}>,
    injector: Injector,
  ) {
    super(injector)
  }


  ngOnInit() {
    this.showAnswer$.subscribe(showAnswer => {
      this.hide = ! showAnswer
    })
  }

  showAnswer() {
    this.quizService.toggleShowAnswer()
    this.quizAnswersService.onShowAnswer() // TODO maybe move to quizService. ...
    // https://www.w3schools.com/jsref/met_element_scrollintoview.asp
    // this.scrollToBottom()
    // window.scrollTo(0,document.body.scrollHeight);
    // window.scrollTo(0,document.querySelector(".scrollingContainer").scrollHeight);
  }

  showChoices() {
    this.quizService.showChoices()
  }

  showHint() {
    this.quizService.toggleShowHint()
    this.quizAnswersService.onShowHint() // TODO maybe move to quizService. ...
  }

  // onChangeSelfRating($event: NumericPickerVal) {
  // }

  applyAndNext() {
    this.quizAnswersService.onApplyAndNext(this.item$ !, this.selfRating !)
    this.store.dispatch(requestNextQuizItem())
  }

  toggleHide() {
    this.hide = ! this.hide

  }
}
