import {Injectable, Injector} from '@angular/core'
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
export class QuizTrackingService {

  private entry?: TimeTrackedEntry

  constructor(
    private injector: Injector,
    private dbTreeService: DbTreeService,
    private timeTrackingService: TimeTrackingService,
    private timeTrackingPeriodsService: TimeTrackingPeriodsService,
    private authService: AuthService,
  ) {
  }

  async startTracking(): Promise<void> {
    if (!this.entry) {
      const itemId = quizItemId(this.authService.userId as string)
      await this.dbTreeService.upsertItemIfMissing(itemId, {
        title: 'Quiz',
        isArchived: false,
      })
      await this.dbTreeService.upsertRootInclusionIfMissing(itemId)
      this.entry = this.timeTrackingService.obtainEntryForItem(new OryItem$(this.injector, itemId))
    }
    this.entry.startOrResumeTrackingIfNeeded({inParallel: true})
  }

  stopTrackingIfNeeded(): void {
    this.entry?.pauseOrNoop()
  }

  /** Records the elapsed time for one completed Q&A on the currently tracked Quiz period. */
  recordCompletedAnswer(durationMs: number): void {
    const period = this.entry?.currentPeriod
    if (!period || !Number.isFinite(durationMs) || durationMs < 0) {
      return
    }

    const current = period.odmItem$.val
    period.odmItem$.patchNow({
      quizAnswerCount: (current?.quizAnswerCount ?? 0) + 1,
      quizAnswerDurationMs: (current?.quizAnswerDurationMs ?? 0) + durationMs,
    })
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
