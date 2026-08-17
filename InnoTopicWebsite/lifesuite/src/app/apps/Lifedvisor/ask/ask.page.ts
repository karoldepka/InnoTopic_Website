import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { HintFinder } from './HintFinder';
import {questionsProblemsWishes, rootHint} from '../shared-with-testcafe/hints';
import {SearchService} from '../core/search.service';
import {LiHintImpl} from '../shared-with-testcafe/Hint';
import {Filter} from '../shared-with-testcafe/text_search/Filter';
import {sortBy} from 'lodash-es';
import { IonicModule } from '@ionic/angular';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HintComponent } from './hint/hint.component';

@Component({
    selector: 'app-ask-page',
    templateUrl: './ask.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./ask.page.scss'],
    imports: [IonicModule, SyncStatusIconComponent, ReactiveFormsModule, FormsModule, NgFor, NgIf, HintComponent, NgClass, RouterLink]
})
export class AskPage implements OnInit {

  rootHint = rootHint

  textField = ''
  textFieldDummy = ''

  filter = Filter.NONE

  get displayedRoots(): LiHintImpl[] {
    return this.filter.wordsNormalized.length > 0
      ? this.hintFinder.searchResultRoots
      : this.rootHint.ifYesSortedByScoreFiltered
  }

  get filteredProblems(): LiHintImpl[] {
    return sortBy(Object.values(questionsProblemsWishes), (hint: LiHintImpl) => - hint.getScoreForFilter(this.filter))
  }

  isExpandAll = false /* better for debugging */

  filterToThrottle$ = new EventEmitter<string>()

  hintFinder = HintFinder.instance

  constructor(
    public searchService: SearchService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.filterToThrottle$.pipe(
      debounceTime(300)
    ).subscribe(search => {
      this.textField = search
      this.filter = Filter.fromString(this.textField ?? '')
      this.hintFinder.applySearch(Filter.fromString(search))
      // Without this, the debounced RxJS callback above never triggers a view refresh - typing a
      // search term visibly updates nothing (rootHint/filter are correctly updated internally,
      // confirmed by forcing change detection manually) until some unrelated Angular-bound event
      // elsewhere happens to trigger one incidentally. Same fix BaseComponent already applies for
      // its own FeatureService subscription, for the same reason.
      this.changeDetectorRef.markForCheck()
    })

    this.filterToThrottle$.pipe(
      debounceTime(1000)
    ).subscribe(search => {
      this.searchService.onSearchConfirmed(search)
    })
  }

  ngOnInit() {
  }

  onChangeFilterText(ev: any) {
    // console.log('ev', ev)
    if ( typeof ev === 'string' ) {
      this.textField = ev
      // this.filteredProblems = this.hintFinder.getFilteredHints(ev)
      this.filterToThrottle$.emit(ev)
    }
  }

  isVisibleViaFilter(hint: LiHintImpl) {
    // return hint.isVisibleViaFilter(Filter.fromString(this.textField))
    return hint.isVisibleViaFilter(this.filter)
  }
}
