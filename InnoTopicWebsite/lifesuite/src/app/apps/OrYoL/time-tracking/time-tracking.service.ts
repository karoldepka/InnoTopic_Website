import {Injectable, Injector} from '@angular/core';

import {TimeService} from '../core/time.service'
import {HasItemData, HasPatchThrottled} from '../tree-model/has-item-data'
import {OryItemsService} from '../core/ory-items.service'
import {OryItem$} from '../db/OryItem$'
import {TimeTrackingPeriod, TimeTrackingPeriodsService} from './time-tracking-periods.service'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {TimeTrackedEntry} from './TimeTrackedEntry'
import {TimeTrackingPersistentData} from './TimeTrackingPersistentData'
import {map} from 'rxjs/operators'
import {maxBy, uniqBy} from 'lodash-es'
import {odmTimestampToMillis} from '../../../libs/AppFedShared/odm/utils'


export interface TimeTrackableItemData {
  timeTrack?: TimeTrackingPersistentData
}

/** A time-trackable item - either OrYoL's own tree-item wrapper (`OryItem$`) or a generic
 * `OdmItem$2`-based item (Journal entries, Learn's Task items, ...). Both already satisfy this
 * shape structurally: `OdmItem$2` grew matching `getId()`/`getItemData()`/`data$`/
 * `obtainDomainItem()` members (see `libs/AppFedShared/odm/OdmItem$2.ts`) specifically so
 * `TimeTrackedEntry` - the domain item this type exists for - works identically over either kind
 * of item, without needing to know which one it has. Broadened from the OrYoL-only `OryItem$`
 * this used to be pinned to. */
export interface TimeTrackable extends HasPatchThrottled<TimeTrackableItemData> {
  /** Loosely typed deliberately - real usages need both `.subscribe(fn)` (`TimeTrackedEntry.ts`)
   * and `.lastVal` (`emitTimeTrackedEntry()` below), and `OryItem$.data$`/`OdmItem$2.data$` are
   * each a slightly different concrete `CachedSubject<T>` instantiation that don't need to unify
   * exactly here - matches how loosely the rest of this mixin is already typed
   * (`ItemData = any` in `has-item-data.ts`). */
  data$: any
  obtainDomainItem<TCtor extends new (injector: Injector, item$: any) => any>(ctor: TCtor): InstanceType<TCtor>
  /** Present on `OdmItem$2`-based items (Journal/Learn/...), absent on OrYoL's own `OryItem$` -
   * lets callers like the time-tracking toolbar's navigation pick a route without needing to
   * import each app's model class (see `TimeTrackingToolbarComponent.navigateTo()`). */
  getCollectionName?(): string
}

/** Timestamps stored on OrYoL time-tracking data can arrive as a Firestore `Timestamp`
 * (`.toDate()`), a real `Date`, or (since the Supabase cutover) a plain serialized
 * `{seconds, nanoseconds}` object - the last of which used to fall through this function
 * unconverted, since it has neither `.toDate` nor is a `Date` instance, later crashing callers
 * like TimePassingComponent with "referenceTime.getTime is not a function". */
export function date(obj: any): Date | null {
  const millis = odmTimestampToMillis(obj)
  return millis === undefined ? null : new Date(millis)
}

export type TTPatch = Partial<TimeTrackingPersistentData> & {
  // /** whenLastTouched is mandatory for all operations */
  // whenLastTouched: Date | null
}

export class TTFirstStartPatch implements TTPatch {
  nowTrackingSince = this.whenFirstStarted
  constructor(
    public whenFirstStarted : Date
  ) {}
}

export class TTResumePatch implements TTPatch {
  nowTrackingSince ! : Date
  previousPausesMs ! : number
  whenCurrentPauseStarted = null as any as undefined
}

export class TTPausePatch implements TTPatch {
  previousTrackingsMs! : number
  /** TODO: rename to whenCurrentTrackingStarted ? */
  nowTrackingSince = null // as any as undefined /* FIXME */
  whenCurrentPauseStarted ! : Date // TODO use this to still show it on toolbar
}

/** ================================================================================================ */
@Injectable({providedIn: 'root'})
export class TimeTrackingService {

  private static _the: TimeTrackingService

  // private mapItemToEntry = new Map<TimeTrackable, TimeTrackedEntry>()

  // static get the() {
  //   // console.log('TimeTrackingService the()')
  //   // console.trace('TimeTrackingService the()')
  //   return this._the || (this._the = new TimeTrackingService(new TimeService()))
  // }

  // timeTrackingOf$ = new CachedSubject<TimeTrackable>()

  timeTrackedEntries$ = new CachedSubject<TimeTrackedEntry[]>()

  /* Here fix items duplicated on toolbar;
   * could rename to runningOrRecentEntries$ */
  toolbarEntries$ = this.timeTrackedEntries$.pipe(
    map((entries: TimeTrackedEntry[]) => {
      const debug_uniqEntries = [... new Set(entries)]
      if ( debug_uniqEntries.length !== entries.length ) {
        console.error(`time-tracking.service.ts - toolbarEntries$ = this.timeTrackedEntries$.pipe(`,
          `debug_uniqEntries.length !== entries.length`,
          entries, debug_uniqEntries
        )
      }
      // console.log('toolbarEntries$ entries', entries)

      const opts = {
        showLastPausedItemIfNoItemCurrentlyTracking: true
      }

      // TODO if not more than 1 item nowTrackingSince  :
      // 1 MRU paused
      // --- if not more than 1 item:
      // 1 MRU DONE item
      const retEntries = entries.filter(entry => entry.isTrackingNow)

      if (retEntries.length < 1 && opts.showLastPausedItemIfNoItemCurrentlyTracking) {
        const lastPaused = this.getLastPausedItem(entries)
        if (lastPaused) {
          retEntries.push(lastPaused)
        }
      }

      return uniqBy(retEntries, entry => entry.timeTrackable.getId())
    })
  )

  private getLastPausedItem(entries: TimeTrackedEntry[]) {
    return maxBy(entries,
      (e: TimeTrackedEntry) => date(e.whenCurrentPauseStarted)?.getTime())
  }

  /** undefined would mean in the future that no value has arrived yet */
  get currentEntries(): TimeTrackedEntry[] | undefined {
    return this.timeTrackedEntries$.lastVal
  }

  // TODO: currentlyTrackingEntries$
  // TODO: currentlyTrackingAndMruEntries$

  constructor(
    public timeService: TimeService,
    public dataItemsService: OryItemsService,
    private timeTrackingPeriodsService: TimeTrackingPeriodsService,
    private injector: Injector,
  ) {
    // console.log('TimeTrackingService constructor()')
    // console.trace('TimeTrackingService constructor()')
    if ( TimeTrackingService._the ) {
      return TimeTrackingService._the
      // throw new Error('TimeTrackingService._the already exists')
    } else {
      TimeTrackingService._the = this
    }

    // GH: boot-time discovery of what's currently tracked, without needing /tree's full sync.
    // TimeTrackingPeriodsService.activePeriods$ is derived from TimeTrackingPeriodsOdmService's
    // own (much smaller) collection, which already loads independently of /tree - see that
    // service's constructor. Building an OryItem$ per active period's itemId here (a) triggers
    // OryOdmItemsService's own construction+load if nothing else has yet (this service is already
    // constructed at boot via the always-present app-wide toolbar), and (b) reuses the exact same
    // shared-object caching the OryItem$ unification already gives every other consumer, so this
    // is never a second, disconnected mirror of an item some other UI is also showing.
    this.timeTrackingPeriodsService.activePeriods$.subscribe((periods: TimeTrackingPeriod[] | null | undefined) => {
      for (const period of periods ?? []) {
        const item$ = new OryItem$(this.injector, period.itemId) as unknown as TimeTrackable
        const entry = this.obtainEntryForItem(item$)
        // Re-broadcast to timeTrackedEntries$/the toolbar whenever this item's own real data
        // arrives (it may well be undefined right now, immediately after construction) - entries
        // are plain object references in that array, so nothing else re-emits it on our behalf.
        entry.timeTrackVal$.subscribe(() => this.emitTimeTrackedEntry(entry))
      }
    })

    // pause tracking of items which are done:
    this.dataItemsService.onItemWithDataPatchedByUserLocally$.subscribe((event: [HasItemData<TimeTrackableItemData>, any]) => {
      const patch = event[1]
      if ( patch.isDone /* truthy is enough; because it could be also timestamp */ ) {
        // console.log('TimeTrackingService onItemWithDataPatchedByUserLocally$', event[1].isDone)
        const eventElement: HasItemData<TimeTrackableItemData> = event[0]
        this.pauseOrNoop(eventElement as TimeTrackable /* HACK */)
      }
    })

    // Live updates while /tree's own sync pipeline is actually running (edits, or another
    // machine's changes arriving) - the activePeriods$ subscription above is what covers boot
    // time / before /tree has ever loaded, this one keeps handling the rest.
    this.dataItemsService.onItemAddedOrModified$.subscribe((addedOrModifiedDataItem: HasItemData<TimeTrackableItemData>) => {
      const itemData = addedOrModifiedDataItem.getItemData()
      const ttData: TimeTrackingPersistentData | undefined = itemData?.timeTrack
      const id = addedOrModifiedDataItem.getId()
      const existingEntry = this.currentEntries?.find(entry => entry.timeTrackable.getId() === id)

      if (ttData?.nowTrackingSince || ttData?.whenFirstStarted) {
        const timeTrackedEntry = existingEntry || this.obtainEntryForItem(addedOrModifiedDataItem as TimeTrackable)
        timeTrackedEntry.updateFromTimeTrackData(ttData)
        this.emitTimeTrackedEntry(timeTrackedEntry)
      } else if (existingEntry) {
        // console.log(`onItemAddedOrModified$.subscribe: item was on list of time tracked entries`, addedOrModifiedDataItem)
        if (ttData) {
          existingEntry.updateFromTimeTrackData(ttData)
        }
        this.emitTimeTrackedEntry(existingEntry)
      }
    })
  }

  // isTimeTracking(timeTrackable: TimeTrackable) {
  //   // return this.timeTrackingOf$.lastVal === timeTrackable
  // }

  emitTimeTrackedEntry(entry: TimeTrackedEntry) {
    const previousEntries = this.currentEntries || []
    const entryId = entry.timeTrackable.getId()

    // 1. Add or update the entry
    let newEntriesArr = previousEntries.some(e => e.timeTrackable.getId() === entryId)
      ? previousEntries.map(e => e.timeTrackable.getId() === entryId ? entry : e)
      : [...previousEntries, entry]

    // 2. Apply cleanup logic if multiple entries exist
    if (newEntriesArr.length > 1) {
      newEntriesArr = newEntriesArr.filter(e => {
        const isDone = e.timeTrackable.data$.lastVal?.isDone
        return e.isTrackingNow || !isDone
      })
    }

    this.timeTrackedEntries$.nextWithCache(newEntriesArr)
  }

  now() {
    return this.timeService.now()
  }

  public obtainEntryForItem(timeTrackedItem: TimeTrackable): TimeTrackedEntry {
    return timeTrackedItem.obtainDomainItem(TimeTrackedEntry)
    // let entry = this.mapItemToEntry.get(timeTrackedItem)
    // if ( ! entry ) {
    //   entry = new TimeTrackedEntry(this., timeTrackedItem)
    //   this.mapItemToEntry.set(timeTrackedItem, entry)
    // }
    // return entry
  }

  pauseCurrentOrNoop(opts?: { skipEmit: boolean }) {
    if ( this.currentEntries /* FIxME this is array so will always be non-nullish, e.g. []; also could contain MRU items; mruAndCurrentlyTrackingEntries */ ) {
      for ( let entryToPause of this.currentEntries ) {
        entryToPause.pauseOrNoop(opts)
      }
    }
  }

  public pauseOrNoop(timeTrackable: TimeTrackable) {
    this.obtainEntryForItem(timeTrackable).pauseOrNoop()
  }

}
