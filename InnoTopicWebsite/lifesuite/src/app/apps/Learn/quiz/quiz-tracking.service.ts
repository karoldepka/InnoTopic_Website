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
