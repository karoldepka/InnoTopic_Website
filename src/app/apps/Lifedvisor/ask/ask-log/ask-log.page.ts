import {ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy} from '@angular/core'
import {IonicModule} from '@ionic/angular'
import {NgFor, NgIf} from '@angular/common'
import {AppLogoComponent} from '../../../Common/app-logo/app-logo.component'
import {SelfRatingHistoryService} from '../../self-rating-history/self-rating-history.service'
import {SelfRatingHistoryItem} from '../../self-rating-history/SelfRatingHistoryItem'
import {HintFinder} from '../HintFinder'
import {TimePointComponent} from '../../../../libs/AppFedShared/time/time-point/time-point.component'
import {odmTimestampToMillis} from '../../../../libs/AppFedShared/odm/utils'

/** GH issue #31: a simple, read-only log of every 5-star rating given on /ask hints, newest
 * first - the counterpart to HintComponent.onRate()'s writes. */
@Component({
  selector: 'app-ask-log-page',
  templateUrl: './ask-log.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonicModule, NgFor, NgIf, AppLogoComponent, TimePointComponent],
})
export class AskLogPage implements OnInit {

  ratings: SelfRatingHistoryItem[] = []

  loading = true

  constructor(
    private selfRatingHistoryService: SelfRatingHistoryService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.selfRatingHistoryService.getAllRatings()
      .then(ratings => {
        this.ratings = ratings
        this.loading = false
        this.changeDetectorRef.detectChanges()
      })
      .catch(error => {
        console.error('AskLogPage failed to load ratings', error)
        this.loading = false
        this.changeDetectorRef.detectChanges()
      })
  }

  titleFor(rating: SelfRatingHistoryItem): string {
    if (!rating.subjectId) {
      return '(unknown)'
    }
    return HintFinder.instance.findHintById(rating.subjectId)?.effectiveTitle ?? rating.subjectId
  }

  dateOf(rating: SelfRatingHistoryItem): Date | undefined {
    const millis = odmTimestampToMillis(rating.whenRated)
    return millis === undefined ? undefined : new Date(millis)
  }
}
