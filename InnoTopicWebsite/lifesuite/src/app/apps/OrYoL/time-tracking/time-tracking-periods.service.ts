import {Injectable, Injector} from '@angular/core';
import { ItemId } from '../db/OryItem$'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {BaseService} from '../../../libs/AppFedShared/base.service'
import {OdmBackend, OdmTimestamp} from '../../../libs/AppFedShared/odm/OdmBackend'
import {TimeTrackedEntry} from './TimeTrackedEntry'
import {TimeTrackingPeriodsOdmService} from './time-tracking-periods-odm.service'
import {TimeTrackingPeriodOdm} from './TimeTrackingPeriodOdm'
import {TimeTrackingPeriod$} from './TimeTrackingPeriod$'

// https://lifesuite.innotopic.com/learn/item/lmm0ETQ1dvl9x6mJnNs5

export type TimeTrackingPeriodId = string

/** Ranges, (time) intervals, time period - public-facing shape held on
 * TimeTrackedEntry.currentPeriod. Carries its own backing ODM item ($) so onPeriodEnd() can patch
 * it directly, without needing a separate lookup by id. */
export class TimeTrackingPeriod {

  constructor(
    public id: TimeTrackingPeriodId,
    public itemId: ItemId,
    public start: OdmTimestamp,
    public end : OdmTimestamp | null /* null instead of missing, to be able to query for non-finished periods ! */,
    public odmItem$: TimeTrackingPeriod$,
    // TODO: approximate duration (in case manually entered
    // TODO: cancelled / is*Revoked* for when user forgets to stop tracking; but we still wanna show that tracking was started, in timeline
    // -- or `revoke` to save bytes
    // TODO: deleted / archived (undoable)
  ) {
  }
}



@Injectable({
  providedIn: 'root'
})
export class TimeTrackingPeriodsService extends BaseService {

  activePeriods$ = new CachedSubject<TimeTrackingPeriod[] | null | undefined>(undefined)

  constructor(
    injector: Injector,
    private periodsOdmService: TimeTrackingPeriodsOdmService,
  ) {
    super(injector)
    this.featLocal = this.g.feat.timeTrackingPeriods

    // GH: TimeTrackingPeriodsOdmService's own (much smaller) collection already loads
    // independently of /tree's full sync - OdmService2's constructor kicks off
    // setBackendListenerIfNecessary() unconditionally as soon as this service is first injected
    // anywhere (e.g. via the app-wide toolbar), regardless of whether /tree has ever been visited.
    // Deriving activePeriods$ here (previously declared but never populated) is what actually lets
    // TimeTrackingService discover what's currently tracked from this - see its constructor.
    this.periodsOdmService.localItems$.subscribe(items => {
      const active = items
        .filter(item$ => item$.val?.itemId && item$.val?.start && item$.val?.end == null)
        .map(item$ => new TimeTrackingPeriod(
          item$.id as string,
          item$.val!.itemId as string,
          item$.val!.start!,
          null,
          item$,
        ))
      this.activePeriods$.nextWithCache(active)
    })
  }

  onPeriodEnd(entry: TimeTrackedEntry) {
    let period: TimeTrackingPeriod | undefined = entry.currentPeriod
    if ( ! period ) {
      if ( this.feat.unfinished && this.feat.showFixmes /* though; this.feat should already handle the `.timetracking.periods` */ ) {
        console.error('timetracking ! entry.currentPeriod -- TODO: need to load from DB (any periods with end==null and set at beginning')
      }
      return
    }
    const end = OdmBackend.nowTimestamp()
    period.end = end
    period.odmItem$.patchNow({end} as Partial<TimeTrackingPeriodOdm>)
  }

  onPeriodStart(entry: TimeTrackedEntry): TimeTrackingPeriod {
    const itemId = entry.timeTrackable.getId()
    const start = OdmBackend.nowTimestamp()
    const item$ = this.periodsOdmService.add(Object.assign(new TimeTrackingPeriodOdm(), {
      itemId,
      start,
      end: null,
    }))
    return new TimeTrackingPeriod(item$.id as string, itemId, start, null, item$)
  }

  /** Stores one already-finished interval against an item. This is for discrete work such as a
   * completed quiz Q&A, where opening a separate live timer would only create UI noise. */
  recordCompletedPeriodForItem(itemId: ItemId, durationMs: number): void {
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      return
    }

    const end = OdmBackend.nowTimestamp()
    const start = OdmBackend.timestampFromMillis(end.toMillis() - durationMs)
    this.periodsOdmService.add(Object.assign(new TimeTrackingPeriodOdm(), {
      itemId,
      start,
      end,
    }))
  }

  /** All stored periods for a given itemId - client-side filtered from the already-loaded
   * collection (same reasoning as before this was ODM-backed: a single-field equality lookup
   * doesn't need a composite index/server-side query, fine at the volume a personal time-tracking
   * log actually produces). Waits for the collection's initial load so a call made right after
   * app boot doesn't race an empty in-memory list. */
  async getPeriodsForItem(itemId: ItemId): Promise<TimeTrackingPeriodOdm[]> {
    await this.waitUntilLoaded()
    return (this.periodsOdmService.localItems$.lastVal ?? [])
      .map(period$ => period$.val)
      .filter((val): val is TimeTrackingPeriodOdm => !!val && val.itemId === itemId)
  }

  private waitUntilLoaded(): Promise<void> {
    if (this.periodsOdmService.itemsLoaded) {
      return Promise.resolve()
    }
    // No unsubscribe - matching OdmCollectionBackend.waitUntilReady()'s convention: CachedSubject
    // replays synchronously to a new subscriber, so a `const sub` handle referenced inside this
    // same callback would be read mid-initialization.
    return new Promise<void>(resolve => {
      this.periodsOdmService.localItems$.subscribe(() => {
        if (this.periodsOdmService.itemsLoaded) {
          resolve()
        }
      })
    })
  }
}
