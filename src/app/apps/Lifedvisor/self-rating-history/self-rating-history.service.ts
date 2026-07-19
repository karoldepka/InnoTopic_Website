import {Injectable} from '@angular/core'
import {SelfRatingHistoryOdmService} from './self-rating-history-odm.service'
import {SelfRatingHistoryItem} from './SelfRatingHistoryItem'
import {OdmBackend} from '../../../libs/AppFedShared/odm/OdmBackend'
import {odmTimestampToMillis} from '../../../libs/AppFedShared/odm/utils'

@Injectable({providedIn: 'root'})
export class SelfRatingHistoryService {

  constructor(
    private selfRatingHistoryOdmService: SelfRatingHistoryOdmService,
  ) {
  }

  addRating(subjectId: string, rating: number): void {
    this.selfRatingHistoryOdmService.add(Object.assign(new SelfRatingHistoryItem(), {
      subjectId,
      rating,
      whenRated: OdmBackend.nowTimestamp(),
    }))
  }

  /** All logged ratings, newest first - used by the /ask/log page. Waits for the collection's
   * initial load, matching TimeTrackingPeriodsService.getPeriodsForItem's same reasoning. */
  async getAllRatings(): Promise<SelfRatingHistoryItem[]> {
    await this.waitUntilLoaded()
    return (this.selfRatingHistoryOdmService.localItems$.lastVal ?? [])
      .map(item$ => item$.val)
      .filter((val): val is SelfRatingHistoryItem => !!val)
      .sort((a, b) => (odmTimestampToMillis(b.whenRated) ?? 0) - (odmTimestampToMillis(a.whenRated) ?? 0))
  }

  private waitUntilLoaded(): Promise<void> {
    if (this.selfRatingHistoryOdmService.itemsLoaded) {
      return Promise.resolve()
    }
    return new Promise<void>(resolve => {
      this.selfRatingHistoryOdmService.localItems$.subscribe(() => {
        if (this.selfRatingHistoryOdmService.itemsLoaded) {
          resolve()
        }
      })
    })
  }
}
