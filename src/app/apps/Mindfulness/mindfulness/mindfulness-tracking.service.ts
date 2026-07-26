import {Injectable, Injector} from '@angular/core'
import {OryItem$} from '../../OrYoL/db/OryItem$'
import {DbTreeService} from '../../OrYoL/tree-model/db-tree-service'
import {TimeTrackingService, date} from '../../OrYoL/time-tracking/time-tracking.service'
import {TimeTrackedEntry} from '../../OrYoL/time-tracking/TimeTrackedEntry'
import {TimeTrackingPeriodsService} from '../../OrYoL/time-tracking/time-tracking-periods.service'
import {AuthService} from '../../../auth/auth.service'

/** Reserved anchor item id (GH issue #27) that all mindfulness sessions time-track onto, in
 * parallel with whatever else is being tracked in OrYoL's tree. Per the issue's follow-up, it's
 * also given a real inclusion under the tree root (upsertRootInclusionIfMissing below) so it
 * shows up as a normal top-level node instead of being hidden.
 *
 * Suffixed per-user (GH #108) - odm_items' primary key is `(collection, id)` globally, not scoped
 * by `owner`, so a bare `'_mindfulness'` collided across accounts as soon as a second real user
 * existed: Postgres' upsert took the UPDATE path against the row's existing (different) owner,
 * and RLS's UPDATE policy (`USING (owner = auth.jwt()->>'sub')`) rejected it - 42501, "new row
 * violates row-level security policy". Same fix as `UserTreeRoot.ts`'s `getUserTreeRootId()`. */
function mindfulnessItemId(userId: string): string {
  return `_mindfulness_${userId}`
}

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
    private authService: AuthService,
  ) {
  }

  private async getEntry(): Promise<TimeTrackedEntry> {
    if (!this.entry) {
      // Every caller of startTracking()/stopTrackingIfNeeded() is already behind an auth-required
      // route (matches CategoriesComponent/ToolbarCommonItemsComponent's identical assumption for
      // the same well-known-id pattern).
      const itemId = mindfulnessItemId(this.authService.userId as string)
      await this.dbTreeService.upsertItemIfMissing(itemId, {
        title: 'Mindfulness',
        isArchived: false,
      })
      // GH #27 follow-up: show the anchor item in the OrYoL tree itself, not just as a hidden
      // time-tracking target.
      await this.dbTreeService.upsertRootInclusionIfMissing(itemId)
      this.mindfulnessItem$ = new OryItem$(this.injector, itemId)
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

  /** Sums every stored TimeTrackingPeriod for the current user's mindfulness anchor item into
   * "today" and "this week" (Monday start) totals. An open period (`end == null`, still running)
   * counts up to "now". */
  async getTodayAndWeekTotals(): Promise<MindfulnessTotals> {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayOfWeekMondayFirst = (now.getDay() + 6) % 7
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfToday.getDate() - dayOfWeekMondayFirst)

    const periods = await this.timeTrackingPeriodsService.getPeriodsForItem(mindfulnessItemId(this.authService.userId as string))

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
