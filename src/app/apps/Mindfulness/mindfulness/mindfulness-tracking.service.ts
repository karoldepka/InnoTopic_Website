import {Injectable, Injector} from '@angular/core'
import {OryItem$} from '../../OrYoL/db/OryItem$'
import {DbTreeService} from '../../OrYoL/tree-model/db-tree-service'
import {TimeTrackingService, date} from '../../OrYoL/time-tracking/time-tracking.service'
import {TimeTrackedEntry} from '../../OrYoL/time-tracking/TimeTrackedEntry'
import {TimeTrackingPeriodsService} from '../../OrYoL/time-tracking/time-tracking-periods.service'

/** Reserved anchor item id (GH issue #27) that all mindfulness sessions time-track onto, in
 * parallel with whatever else is being tracked in OrYoL's tree. Per the issue's follow-up, it's
 * also given a real inclusion under the tree root (upsertRootInclusionIfMissing below) so it
 * shows up as a normal top-level node instead of being hidden. */
export const MINDFULNESS_ITEM_ID = '_mindfulness'

export interface MindfulnessTotals {
  todayMs: number
  weekMs: number
}

@Injectable({providedIn: 'root'})
export class MindfulnessTrackingService {

  private mindfulnessItem$?: OryItem$
  private entry?: TimeTrackedEntry

  constructor(
    private injector: Injector,
    private dbTreeService: DbTreeService,
    private timeTrackingService: TimeTrackingService,
    private timeTrackingPeriodsService: TimeTrackingPeriodsService,
  ) {
  }

  private async getEntry(): Promise<TimeTrackedEntry> {
    if (!this.entry) {
      await this.dbTreeService.upsertItemIfMissing(MINDFULNESS_ITEM_ID, {
        title: 'Mindfulness',
        isArchived: false,
      })
      // GH #27 follow-up: show the anchor item in the OrYoL tree itself, not just as a hidden
      // time-tracking target.
      await this.dbTreeService.upsertRootInclusionIfMissing(MINDFULNESS_ITEM_ID)
      this.mindfulnessItem$ = new OryItem$(this.injector, MINDFULNESS_ITEM_ID, {})
      this.entry = this.timeTrackingService.obtainEntryForItem(this.mindfulnessItem$)
    }
    return this.entry
  }

  /** Starts (or resumes) tracking the mindfulness session - `inParallel: true` since OrYoL
   * deliberately allows multiple items to be tracked at once (per the issue), so this must never
   * pause whatever tree item the user already has running. */
  async startTracking(): Promise<void> {
    const entry = await this.getEntry()
    entry.startOrResumeTrackingIfNeeded({inParallel: true})
  }

  async stopTrackingIfNeeded(): Promise<void> {
    if (!this.entry) {
      return
    }
    this.entry.pauseOrNoop()
  }

  /** Sums every stored TimeTrackingPeriod for `_mindfulness` into "today" and "this week" (Monday
   * start) totals. An open period (`end == null`, still running) counts up to "now". */
  async getTodayAndWeekTotals(): Promise<MindfulnessTotals> {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayOfWeekMondayFirst = (now.getDay() + 6) % 7
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - dayOfWeekMondayFirst)

    const periods = await this.timeTrackingPeriodsService.getPeriodsForItem(MINDFULNESS_ITEM_ID)

    let todayMs = 0
    let weekMs = 0
    for (const raw of periods) {
      const start = date(raw.start)
      const end = raw.end ? date(raw.end) : now
      if (!start || !end) {
        continue
      }
      todayMs += this.overlapMs(start, end, startOfToday, now)
      weekMs += this.overlapMs(start, end, startOfWeek, now)
    }
    return {todayMs, weekMs}
  }

  private overlapMs(periodStart: Date, periodEnd: Date, rangeStart: Date, rangeEnd: Date): number {
    const overlapStart = Math.max(periodStart.getTime(), rangeStart.getTime())
    const overlapEnd = Math.min(periodEnd.getTime(), rangeEnd.getTime())
    return Math.max(0, overlapEnd - overlapStart)
  }
}
