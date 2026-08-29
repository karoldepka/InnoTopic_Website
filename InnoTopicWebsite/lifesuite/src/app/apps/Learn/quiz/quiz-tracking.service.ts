import {Injectable, Injector, OnDestroy} from '@angular/core'
import {AuthService} from '../../../auth/auth.service'
import {OryItem$} from '../../OrYoL/db/OryItem$'
import {DbTreeService} from '../../OrYoL/tree-model/db-tree-service'
import {TimeTrackedEntry} from '../../OrYoL/time-tracking/TimeTrackedEntry'
import {TimeTrackingService} from '../../OrYoL/time-tracking/time-tracking.service'
import {date} from '../../OrYoL/time-tracking/time-tracking.service'
import {TimeTrackingPeriodsService} from '../../OrYoL/time-tracking/time-tracking-periods.service'

function quizItemId(userId: string): string {
  return `_quiz_${userId}`
}

const QUIZ_INACTIVITY_PAUSE_MS = 2 * 60_000

export interface QuizDailyTrackingTotal {
  dateLabel: string
  durationMs: number
}

export interface QuizAnswerDurationAverage {
  answerCount: number
  durationMs: number
}

/** Persists Quiz sessions in the shared time-tracking history without interrupting another task. */
@Injectable({providedIn: 'root'})
export class QuizTrackingService implements OnDestroy {

  private entry?: TimeTrackedEntry
  private inactivityPauseTimer?: ReturnType<typeof setTimeout>
  private hasCurrentQuestion = false
  private questionActiveDurationMs = 0
  private questionActiveSegmentStartedAtMs?: number
  /** Prevents async startup or late QuizStatus emissions from resuming tracking after the page's
   * leave hook has fired. Ionic may cache the page, so component destruction alone is too late. */
  private quizRouteActive = false

  private readonly onVisibilityChange = () => {
    if (document.hidden) {
      this.pauseTrackingSession()
    } else if (this.quizRouteActive) {
      if (this.entry) {
        this.resumeTrackingSession()
      } else {
        void this.startTracking().catch(error => console.error('Quiz time tracking failed to resume after visibility change', error))
      }
    }
  }

  constructor(
    private injector: Injector,
    private dbTreeService: DbTreeService,
    private timeTrackingService: TimeTrackingService,
    private timeTrackingPeriodsService: TimeTrackingPeriodsService,
    private authService: AuthService,
  ) {
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.pauseTrackingSession()
  }

  async startTracking(): Promise<void> {
    this.quizRouteActive = true
    if (!this.entry) {
      const itemId = quizItemId(this.authService.userId as string)
      await this.dbTreeService.upsertItemIfMissing(itemId, {
        title: 'Quiz',
        isArchived: false,
      })
      await this.dbTreeService.upsertRootInclusionIfMissing(itemId)
      this.entry = this.timeTrackingService.obtainEntryForItem(new OryItem$(this.injector, itemId))
    }
    // Navigation may have completed while the item/root setup above was awaiting persistence.
    if (!this.quizRouteActive || document.hidden) {
      return
    }
    this.resumeTrackingSession()
  }

  stopTrackingIfNeeded(): void {
    this.quizRouteActive = false
    this.pauseTrackingSession()
  }

  /** Counts as active Quiz work and resumes a session that was paused for inactivity. */
  recordQuizActivity(): void {
    if (!this.quizRouteActive || document.hidden) {
      return
    }
    if (!this.entry) {
      void this.startTracking().catch(error => console.error('Quiz time tracking failed to resume', error))
      return
    }

    this.resumeTrackingSession()
  }

  /** Starts a fresh per-item clock. Only intervals during which aggregate Quiz tracking is
   * actually active are accumulated, so hidden tabs, route absence, and inactivity are excluded. */
  startQuestionTiming(): void {
    this.hasCurrentQuestion = true
    this.questionActiveDurationMs = 0
    this.questionActiveSegmentStartedAtMs = undefined
    if (this.quizRouteActive && !document.hidden) {
      this.resumeQuestionTiming()
    }
  }

  getCurrentQuestionActiveDurationMs(): number {
    return this.questionActiveDurationMs + (this.questionActiveSegmentStartedAtMs === undefined
      ? 0
      : Math.max(0, Date.now() - this.questionActiveSegmentStartedAtMs))
  }

  /** Records a completed Q&A both in the aggregate Quiz session and on its actual Learn item. */
  recordCompletedAnswer(itemId: string, durationMs: number): void {
    if (!this.quizRouteActive || document.hidden) {
      return
    }
    this.recordQuizActivity()
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      return
    }

    // The aggregate Quiz tracker pauses after this long without an action. A later answer
    // resumes it, so do not attribute the unattended portion to either this item or the Q&A
    // average.
    const activeDurationMs = Math.min(durationMs, QUIZ_INACTIVITY_PAUSE_MS)

    const period = this.entry?.currentPeriod
    if (period) {
      const current = period.odmItem$.val
      period.odmItem$.patchNow({
        quizAnswerCount: (current?.quizAnswerCount ?? 0) + 1,
        quizAnswerDurationMs: (current?.quizAnswerDurationMs ?? 0) + activeDurationMs,
      })
    }
    this.timeTrackingPeriodsService.recordCompletedPeriodForItem(itemId, activeDurationMs)
    this.finishQuestionTiming()
  }

  /** Weighted average from every tracked Quiz period that contains completed Q&As. */
  async getAnswerDurationAverage(): Promise<QuizAnswerDurationAverage | null> {
    const periods = await this.timeTrackingPeriodsService.getPeriodsForItem(quizItemId(this.authService.userId as string))
    const totals = periods.reduce((result, period) => {
      const answerCount = period.quizAnswerCount ?? 0
      const answerDurationMs = period.quizAnswerDurationMs ?? 0
      if (answerCount > 0 && answerDurationMs >= 0) {
        result.answerCount += answerCount
        result.durationMs += answerDurationMs
      }
      return result
    }, {answerCount: 0, durationMs: 0})

    return totals.answerCount > 0
      ? {answerCount: totals.answerCount, durationMs: totals.durationMs / totals.answerCount}
      : null
  }

  private resetInactivityPauseTimer(): void {
    this.clearInactivityPauseTimer()
    this.inactivityPauseTimer = setTimeout(() => {
      this.inactivityPauseTimer = undefined
      this.pauseTrackingSession()
    }, QUIZ_INACTIVITY_PAUSE_MS)
  }

  private resumeTrackingSession(): void {
    if (!this.quizRouteActive || document.hidden) {
      return
    }
    this.entry?.startOrResumeTrackingIfNeeded({inParallel: true})
    this.resumeQuestionTiming()
    this.resetInactivityPauseTimer()
  }

  private pauseTrackingSession(): void {
    this.clearInactivityPauseTimer()
    this.pauseQuestionTiming()
    this.entry?.pauseOrNoop()
  }

  private resumeQuestionTiming(): void {
    if (this.hasCurrentQuestion && this.questionActiveSegmentStartedAtMs === undefined) {
      this.questionActiveSegmentStartedAtMs = Date.now()
    }
  }

  private pauseQuestionTiming(): void {
    if (this.questionActiveSegmentStartedAtMs === undefined) {
      return
    }
    this.questionActiveDurationMs += Math.max(0, Date.now() - this.questionActiveSegmentStartedAtMs)
    this.questionActiveSegmentStartedAtMs = undefined
  }

  private finishQuestionTiming(): void {
    this.pauseQuestionTiming()
    this.hasCurrentQuestion = false
  }

  private clearInactivityPauseTimer(): void {
    if (this.inactivityPauseTimer) {
      clearTimeout(this.inactivityPauseTimer)
      this.inactivityPauseTimer = undefined
    }
  }

  /** Returns totals for the most recent calendar days, including an in-progress Quiz session. */
  async getDailyTotals(days = 7): Promise<QuizDailyTrackingTotal[]> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const periods = await this.timeTrackingPeriodsService.getPeriodsForItem(quizItemId(this.authService.userId as string))

    return Array.from({length: days}, (_, index) => {
      const dayStart = new Date(todayStart)
      dayStart.setDate(todayStart.getDate() - index)
      const dayEnd = index === 0 ? now : new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - index + 1)
      const durationMs = periods.reduce((total, period) => {
        const periodStart = date(period.start)
        const periodEnd = period.end ? date(period.end) : now
        if (!periodStart || !periodEnd) {
          return total
        }
        return total + Math.max(0, Math.min(periodEnd.getTime(), dayEnd.getTime()) - Math.max(periodStart.getTime(), dayStart.getTime()))
      }, 0)
      return {
        dateLabel: dayStart.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'}),
        durationMs,
      }
    })
  }
}
