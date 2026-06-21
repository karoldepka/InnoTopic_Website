import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {debugLog} from '../../../../libs/AppFedShared/utils/log'
import {LearnItem} from '../../models/LearnItem'
import {Observable} from 'rxjs'
import {NumericPickerVal} from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {LearnItem$} from '../../models/LearnItem$'
import {QuizService} from '../../core/quiz/quiz.service'
import {Subscription} from 'rxjs'
import {nullish} from '../../../../libs/AppFedShared/utils/type-utils'
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ImportanceBannerComponent } from '../../shared/importance-banner/importance-banner.component';
import { PlayButtonComponent } from '../../shared/play-button/play-button.component';
import { BreadcrumbsComponent } from '../../../../libs/AppFedShared/breadcrumbs/breadcrumbs.component';
import { ItemSideComponent } from '../../shared/item-side/item-side.component';

@Component({
    selector: 'app-quiz-item-details',
    templateUrl: './quiz-item-details.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz-item-details.component.sass'],
    imports: [
        NgIf,
        ImportanceBannerComponent,
        PlayButtonComponent,
        BreadcrumbsComponent,
        ItemSideComponent,
        NgFor,
        AsyncPipe,
    ],
})
export class QuizItemDetailsComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input()
  item$ ? : LearnItem$ | null | undefined

  @Input()
  ionContent: any

  @ViewChild(`answers`) answersChild ! : ElementRef


  get itemVal$(): Observable<LearnItem | undefined | null> | undefined {
    return this.item$ ?. locallyVisibleChanges$
  }

  get showAnswer$() { return this.quizService.showAnswer$ }

  get showHint$() { return this.quizService.showHint$ }


  private subscriptionToShowAnswer ? : Subscription

  constructor(
    public quizService: QuizService,
  ) {
    // debugLog('QuizItemDetailsComponent ctor')
  }

  ngOnInit() {
    this.quizService.onNewQuestion()
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
      }
    })
  }
}
