import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  TimeTrackingService,
} from '../time-tracking.service'
import { NavigationService } from '../../core/navigation.service'
import { PlanExecutionService } from '../../plan-execution/plan-execution.service'
import { TimeTrackingPeriodsService } from '../time-tracking-periods.service'

import {DbTreeService} from '../../tree-model/db-tree-service'
import {TimeTrackedEntry} from '../TimeTrackedEntry'
import {CachedSubject} from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {Observable} from 'rxjs/internal/Observable'
import { NgFor, NgStyle, AsyncPipe } from '@angular/common';
import { TimeTrackingCellComponent } from '../time-tracking-cell/time-tracking-cell.component';
import { Router } from '@angular/router'

/** Per-collection route builder for a tracked item that isn't an OrYoL tree node - same pattern
 * (and same route strings) as `OdmConflictToastService.COLLECTION_ROUTES`, keyed by
 * `OdmItem$2.getCollectionName()`. An item with no entry here (or with no `getCollectionName()`
 * at all, i.e. an actual OrYoL tree item) falls back to OrYoL's own tree-focus navigation below. */
const COLLECTION_ROUTES: Record<string, (id: string) => string> = {
  JournalEntry: id => `/journal/entry/${id}`,
  LearnItem: id => `/learn/item/${id}`,
}

@Component({
    selector: 'app-time-tracking-toolbar',
    templateUrl: './time-tracking-toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./time-tracking-toolbar.component.sass'],
    imports: [NgFor, TimeTrackingCellComponent, NgStyle, AsyncPipe]
})
export class TimeTrackingToolbarComponent implements OnInit {

  timeTrackedEntries$: Observable<TimeTrackedEntry[]> = this.timeTrackingService.toolbarEntries$

  constructor(
    public timeTrackingService: TimeTrackingService,
    public treeService: DbTreeService,
    public navigationService: NavigationService,
    public planExecutionService: PlanExecutionService /* just to instantiate and later to track % */,
    public timeTrackingPeriodsService: TimeTrackingPeriodsService,
    public router: Router,
  ) {}

  ngOnInit() {
  }

  navigateTo(entry: TimeTrackedEntry) {
    // Prefer the URL tracking was actually started from (TimeTrackedEntry.
    // startOrResumeTrackingIfNeeded() captures it once, the first time an item starts tracking) -
    // exact and works for any page, not just the two collections COLLECTION_ROUTES happens to
    // know about. Entries tracked before that field existed have no createdAtUrl, so the old
    // per-collection/tree-focus logic stays as the fallback for those.
    const createdAtUrl = entry.val?.createdAtUrl
    if (createdAtUrl) {
      this.router.navigateByUrl(createdAtUrl)
      return
    }
    const timeTrackable = entry.timeTrackable
    const collectionName = timeTrackable.getCollectionName?.()
    const buildRoute = collectionName ? COLLECTION_ROUTES[collectionName] : undefined
    if (buildRoute) {
      this.router.navigateByUrl(buildRoute(timeTrackable.getId()))
    } else {
      this.navigationService.navigateToNodeByItemId(timeTrackable.getId())
    }
  }
}
