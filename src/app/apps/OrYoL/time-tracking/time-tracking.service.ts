import {Injectable} from '@angular/core';
import {TimeService} from '../core/time.service'
import {HasItemData} from '../tree-model/has-item-data'
import {OryItemsService} from '../core/ory-items.service'
import {TimeTrackingPeriod, TimeTrackingPeriodsService} from './time-tracking-periods.service'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {TimeTrackedEntry} from './TimeTrackedEntry'
import {OryItem$} from '../db/OryItem$'
import {TimeTrackingPersistentData} from './TimeTrackingPersistentData'
import {map} from 'rxjs/operators'
import {maxBy, uniqBy} from 'lodash-es'


export interface TimeTrackableItemData {
  timeTrack?: TimeTrackingPersistentData
}

export type TimeTrackable = OryItem$ //= HasPatchThrottled<TimeTrackableItemData>

export function date(obj: any): Date | null {
  if ( ! obj ) {
    return null
  }
  if ( obj.toDate ) {
    return obj.toDate()
  }
  return obj
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
  ) {
    this.timeTrackingPeriodsService.activePeriods$.subscribe((periods: TimeTrackingPeriod[] | null | undefined) => {
      // this.
    })
    // console.log('TimeTrackingService constructor()')
    // console.trace('TimeTrackingService constructor()')
    if ( TimeTrackingService._the ) {
      return TimeTrackingService._the
      // throw new Error('TimeTrackingService._the already exists')
    } else {
      TimeTrackingService._the = this
    }

    // pause tracking of items which are done:
    this.dataItemsService.onItemWithDataPatchedByUserLocally$.subscribe((event: [HasItemData<TimeTrackableItemData>, any]) => {
      const patch = event[1]
      if ( patch.isDone /* truthy is enough; because it could be also timestamp */ ) {
        // console.log('TimeTrackingService onItemWithDataPatchedByUserLocally$', event[1].isDone)
        const eventElement: HasItemData<TimeTrackableItemData> = event[0]
        this.pauseOrNoop(eventElement as TimeTrackable /* HACK */)
      }
    })

    // detect item being tracked when loading from DB: (probably this is not needed anymore since we query periods)
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
        console.log(`onItemAddedOrModified$.subscribe item was on list of time tracked entries`, addedOrModifiedDataItem)
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

  pauseCurrentOrNoop() {
    if ( this.currentEntries /* FIxME this is array so will always be non-nullish, e.g. []; also could contain MRU items; mruAndCurrentlyTrackingEntries */ ) {
      for ( let entryToPause of this.currentEntries ) {
        entryToPause.pauseOrNoop()
      }
    }
  }

  public pauseOrNoop(timeTrackable: TimeTrackable) {
    this.obtainEntryForItem(timeTrackable).pauseOrNoop()
  }

}
