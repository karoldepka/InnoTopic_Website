import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {debugLog} from '../../../../libs/AppFedShared/utils/log'
import {LearnItem} from '../../models/LearnItem'
import {Side} from '../../core/sidesDefs'
import {Observable, Subscription, filter, take} from 'rxjs'
import {NumericPickerVal} from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {LearnItem$} from '../../models/LearnItem$'
import {QuizService} from '../../core/quiz/quiz.service'
import {QuizSpeechService} from '../../core/quiz/quiz-speech.service'
import {nullish} from '../../../../libs/AppFedShared/utils/type-utils'
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { BreadcrumbsComponent } from '../../../../libs/AppFedShared/breadcrumbs/breadcrumbs.component';
import { ItemSideComponent } from '../../shared/item-side/item-side.component';
import { OdmTreeComponent } from '../../../../libs/AppFedShared/tree/tree/odm-tree.component';
import {IonicModule} from '@ionic/angular'
import {funLevels} from '../../models/fields/fun-level.model'
import {importanceDescriptors} from '../../models/fields/importance.model'
import {MultipleChoiceAnswer} from '../../models/LearnItem'
import {shuffleAbcdAnswerChoices} from '../../../Ai/shared/abcd-answers.util'
import {QuizAnswersService} from '../../core/quiz/quiz-answers.service'

@Component({
    selector: 'app-quiz-item-details',
    templateUrl: './quiz-item-details.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-item-details.component.sass'],
    imports: [
        NgIf,
        BreadcrumbsComponent,
        ItemSideComponent,
        NgFor,
        AsyncPipe,
        OdmTreeComponent,
        IonicModule,
    ],
})
export class QuizItemDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  set item$(item$: LearnItem$ | null | undefined) {
    this._item$ = item$
    item$?.requestLoadChildren()
  }

  get item$(): LearnItem$ | null | undefined {
    return this._item$
  }

  private _item$ ? : LearnItem$ | null
  private choiceSource?: MultipleChoiceAnswer[]
  private shuffledChoices: MultipleChoiceAnswer[] = []

  @Input()
  quizLoaded = false

  @Input()
  ionContent: any

  @ViewChild(`answers`) answersChild ! : ElementRef


  get itemVal$(): Observable<LearnItem | undefined | null> | undefined {
    return this.item$ ?. locallyVisibleChanges$
  }

  get showAnswer$() { return this.quizService.showAnswer$ }

  get showHint$() { return this.quizService.showHint$ }

  get showChoices$() { return this.quizService.showChoices$ }

  private get shouldReadCategories(): boolean {
    // Strictly require the checkbox's boolean true value. This also protects users whose
    // persisted options may contain the legacy string value "false".
    return this.quizService.options2$.val?.textToSpeechCategoriesEnabled === true
  }

  /** Keeps an answer order stable while this question is on screen, but randomizes it for every new question. */
  getMultipleChoiceAnswers(itemVal: LearnItem | undefined | null): MultipleChoiceAnswer[] {
    const choices = itemVal?.multipleChoiceAnswers
    if (!choices?.length) return []
    if (choices !== this.choiceSource) {
      this.choiceSource = choices
      this.shuffledChoices = shuffleAbcdAnswerChoices(choices)
    }
    return this.shuffledChoices
  }

  getVisibleHintSides(itemVal: LearnItem | undefined | null, hintLevel: number | undefined | null): Side[] {
    return (itemVal?.getSidesWithHints() ?? []).slice(0, hintLevel ?? 0)
  }


  private subscriptionToShowAnswer ? : Subscription

  constructor(
    public quizService: QuizService,
    private quizSpeech: QuizSpeechService,
    private quizAnswersService: QuizAnswersService,
  ) {
    // debugLog('QuizItemDetailsComponent ctor')
  }

  onAbcdChoiceClick(): void {
    this.quizAnswersService.toggleShowAnswer()
  }

  ngOnInit() {
    this.quizService.onNewQuestion()
    if (this.quizService.options2$.val?.textToSpeechEnabled) {
      // This whole component is recreated per quiz item (see the *ngFor "hack" in quiz.page.html),
      // so ngOnInit fires exactly once per item - take(1) on the first non-null emission reads the
      // question aloud once, rather than re-speaking on every unrelated itemVal$ update.
      this.itemVal$ ?. pipe(
        filter(itemVal => !! itemVal),
        take(1),
      ).subscribe(itemVal => {
        const question = itemVal?.getQuestion() || itemVal?.title
        const categories = this.shouldReadCategories
          ? this.item$?.getEffectiveCategories().replace(/^,\s*/, '')
          : ''
        this.quizSpeech.speak([categories, question].filter(Boolean).join('. '))
      })
    }
  }

  // private scrollToBottom() {
  //   // TODO: scroll to beginning of answer; as rate/next is gonna be in footer anyway
  //   setTimeout(() => {
  //     this.ionContent.scrollToBottom(300)
  //   }, 0)
  // }

  ngOnDestroy(): void {
    this.subscriptionToShowAnswer ?. unsubscribe()
  }

  ngAfterViewInit(): void {
    this.subscriptionToShowAnswer = this.quizService.showAnswer$.subscribe(showAnswer => {
      if ( showAnswer ) {
        setTimeout(() => {
          this.answersChild?.nativeElement?.scrollIntoView()
        }, 200)
        if (this.quizService.options2$.val?.textToSpeechEnabled) {
          const itemVal = this.item$?.currentVal
          const answerText = itemVal
            ?.getSidesWithAnswers()
            .filter(side => this.shouldReadCategories || side.id !== 'categories')
            .map(side => itemVal.getSideVal(side))
            .filter(val => !! val)
            .join('. ')
          this.quizSpeech.speak(answerText)
        }
      }
    })
  }

  loadAll() {
    this.quizService.setOptions({
      ...this.quizService.options$.lastVal!,
      categories: '',
      textFilter: '',
      minFunLevel: funLevels.undefined,
      minImportanceLevel: importanceDescriptors.undefined,
      onlyWithQA: false,
    } as any)
  }
}
