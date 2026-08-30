import {AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {QuizService} from '../core/quiz/quiz.service'
import {Observable} from 'rxjs'
import { IonContent, PopoverController, IonicModule } from '@ionic/angular'
import {QuizTimerPopoverComponent} from './quiz-timer-popover/quiz-timer-popover.component'
import {LearnItem$} from '../models/LearnItem$'
import {debugLog} from '../../../libs/AppFedShared/utils/log'
import {Subject} from 'rxjs/internal/Subject'
import {map, withLatestFrom} from 'rxjs/operators'
import {EditorService} from '../../../libs/AppFedShared/rich-text/rich-text-edit/editor.service'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {isNullish} from '../../../libs/AppFedShared/utils/utils'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import {QuizStatus} from '../core/quiz/QuizStatus'
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { TimePassingComponent } from '../../../libs/AppFedShared/time/time-passing/time-passing.component';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { QuizOptionsComponent } from './quiz-options/quiz-options.component';
import { TimePointComponent } from '../../../libs/AppFedShared/time/time-point/time-point.component';
import { QuizItemsLeftComponent } from './quiz-items-left/quiz-items-left.component';
import { QuizFinishedComponent } from './quiz-finished/quiz-finished.component';
import { QuizItemDetailsComponent } from './quiz-item-details/quiz-item-details.component';
import { ShowAnswerAndRateComponent } from './show-answer-and-rate/show-answer-and-rate.component';
import {QuizAnswerDurationAverage, QuizDailyTrackingTotal, QuizTrackingService} from './quiz-tracking.service'


@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./quiz.page.sass'],
    imports: [
        IonicModule,
        NgIf,
        TimePassingComponent,
        SyncStatusIconComponent,
        QuizOptionsComponent,
        TimePointComponent,
        QuizItemsLeftComponent,
        QuizFinishedComponent,
        NgFor,
        QuizItemDetailsComponent,
        ShowAnswerAndRateComponent,
        AsyncPipe,
    ],
})
export class QuizPage extends BaseComponent implements OnInit, AfterViewInit, OnDestroy  {

  @ViewChild('ionContent')
  private contentScroller?: IonContent

  item$: LearnItem$ | undefined


  // showOptions = true
  showOptions = false
  showTimeTrackingStats = false
  isLoadingTimeTrackingStats = false
  dailyTimeTrackingTotals: QuizDailyTrackingTotal[] = []
  answerDurationAverage: QuizAnswerDurationAverage | null = null

  status$ = this.quizService.quizStatus$

  nextItem$WhenRequested = this.quizService.nextItem$WhenRequested

  constructor(
    public quizService: QuizService,
    public popoverController: PopoverController,
    public editorService: EditorService,
    private quizTrackingService: QuizTrackingService,
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.quizTrackingService.startTracking().catch(error => console.error('Quiz time tracking failed to start', error))
  }

  ionViewWillLeave() {
    this.quizTrackingService.stopTrackingIfNeeded()
  }

  ngOnDestroy() {
    this.quizTrackingService.stopTrackingIfNeeded()
  }

  async toggleTimeTrackingStats(): Promise<void> {
    this.showTimeTrackingStats = !this.showTimeTrackingStats
    if (!this.showTimeTrackingStats || this.isLoadingTimeTrackingStats) {
      return
    }
    this.isLoadingTimeTrackingStats = true
    try {
      const [dailyTimeTrackingTotals, answerDurationAverage] = await Promise.all([
        this.quizTrackingService.getDailyTotals(),
        this.quizTrackingService.getAnswerDurationAverage(),
      ])
      this.dailyTimeTrackingTotals = dailyTimeTrackingTotals
      this.answerDurationAverage = answerDurationAverage
    } catch (error) {
      console.error('Quiz time tracking stats failed to load', error)
    } finally {
      this.isLoadingTimeTrackingStats = false
      this.changeDetectorRef.detectChanges()
    }
  }

  formatTrackingDuration(durationMs: number): string {
    const totalMinutes = Math.floor(durationMs / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  formatAverageAnswerDuration(durationMs: number): string {
    const totalSeconds = Math.round(durationMs / 1_000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  ngAfterViewInit(): void {
    this.quizService.requestNextItem()
  }

  async onClickTimer(event: any) {
    const popover = await this.popoverController.create({
      component: QuizTimerPopoverComponent,
      event: event,
      translucent: true,
      mode: 'ios' /* TODO */,
    });
    return await popover.present();
  }

  openQuizOptions(): void {
    this.showOptions = true
    requestAnimationFrame(() => {
      const prefersReducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      this.contentScroller?.scrollToTop(prefersReducedMotion ? 0 : 300)
    })
  }

  nowMs() {
    return Date.now()
  }

  newDate(number: number | nullish) {
    if ( isNullish(number) ) {
      return number
    }
    return new Date(number)
  }

}
