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
    const timeTrackable = entry.timeTrackable
    const collectionName = timeTrackable.getCollectionName?.()
    const buildRoute = collectionName ? COLLECTION_ROUTES[collectionName] : undefined

    if (!buildRoute) {
      // OrYoL tree item - navigateToNodeByItemId() finds it anywhere in the tree and keyboard-
      // focuses it once its DOM element exists (TreeHostComponent.tryNavigateToNodeId()) - more
      // precise than createdAtUrl below, which only replays whatever view happened to be active
      // when tracking started, with no notion of "and focus this specific node". navigation$ is a
      // CachedSubject that replays its last value to a not-yet-mounted TreeHostComponent too, so
      // it's safe to call this before routing to '/tree' when we're not already there - and
      // skipping that extra navigation while already on '/tree' avoids a visible root-then-node
      // flash from resetting to the bare route first.
      const alreadyOnTree = this.router.url.startsWith('/tree')
      this.navigationService.navigateToNodeByItemId(timeTrackable.getId())
      if (!alreadyOnTree) {
        this.router.navigateByUrl('/tree')
      }
      return
    }

    // Non-tree item (Journal/Learn) - prefer the URL tracking was actually started from
    // (TimeTrackedEntry.startOrResumeTrackingIfNeeded() captures it once, the first time an item
    // starts tracking), falling back to the generic per-collection route for entries tracked
    // before that field existed.
    const url = entry.val?.createdAtUrl ?? buildRoute(timeTrackable.getId())
    this.router.navigateByUrl(url).then(() => this.focusMainFieldBestEffort())
  }

  /** No tree-node-precise focus mechanism exists for Journal/Learn item pages, so this is a
   * best-effort fallback once routing settles: focus whatever looks like the page's primary
   * editable field. Doesn't reach into TinyMCE's fields (rendered inside a same-origin iframe,
   * not reachable via a plain document query) - only the plain-contenteditable/ion-input/
   * ion-textarea cases. */
  private focusMainFieldBestEffort(): void {
    setTimeout(() => {
      const contentEditable = document.querySelector('[contenteditable="true"]') as HTMLElement | null
      if (contentEditable) {
        contentEditable.focus()
        return
      }
      const ionField = document.querySelector('ion-textarea, ion-input') as (HTMLElement & {setFocus?: () => Promise<void>}) | null
      ionField?.setFocus?.()
    }, 300)
  }
}
