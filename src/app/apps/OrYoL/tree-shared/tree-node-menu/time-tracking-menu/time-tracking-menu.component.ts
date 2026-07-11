import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  date,
  TimeTrackingService,
} from '../../../time-tracking/time-tracking.service'
import {ApfBaseTreeNode, OryBaseTreeNode} from '../../../tree-model/TreeModel'
import { NodeContentTimeTrackingComponent } from '../../node-content-time-tracking/node-content-time-tracking.component';
import { TimeViewComponent } from '../../../../../libs/AppFedShared/time/time-view/time-view.component';
import { TimePointComponent } from '../../../../../libs/AppFedShared/time/time-point/time-point.component';
import { TimeTrackingPeriodsService } from '../../../time-tracking/time-tracking-periods.service'
import { TimeTrackingPeriodOdm } from '../../../time-tracking/TimeTrackingPeriodOdm'

function timeTrackedMsFunc ( node: ApfBaseTreeNode ) {
  const itemData = node.content.itemData
  const timeTrack = itemData ?.timeTrack
  return ((timeTrack ?.previousTrackingsMs) || 0) +
    ((timeTrack?.nowTrackingSince) ? (
    Date.now() - date(timeTrack.nowTrackingSince)!.getTime()
  ) : 0)
}

@Component({
    selector: 'app-time-tracking-menu',
    templateUrl: './time-tracking-menu.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./time-tracking-menu.component.scss'],
    imports: [NodeContentTimeTrackingComponent, TimeViewComponent, TimePointComponent, NgIf, NgFor, IonicModule]
})
export class TimeTrackingMenuComponent implements OnInit {

  @Input() treeNode!: OryBaseTreeNode

  /** Computed once on open rather than bound live in the template - the popover is a short-lived
   * glance, and recomputing this every change-detection pass (it depends on Date.now() while
   * tracking is in progress) is exactly what trips ExpressionChangedAfterItHasBeenCheckedError. */
  subtreeTrackedMs = 0

  // get isTimeTrackingThis() { return this.timeTrackingService.isTimeTracking(this.timeTrackable) }
  get timeTrackable() { return this.treeNode.itemId }

  /** Rudimentary per-item time-segments view (GH #27 follow-up), openable from this popover
   * (itself opened from the node's class-icon). Collapsed and unloaded by default, matching the
   * Mindfulness page's "show more" convention - lazy-loaded on first expand, not kept live. */
  showSegments = false
  loadingSegments = false
  segments: TimeTrackingPeriodOdm[] = []

  constructor(
    public timeTrackingService: TimeTrackingService,
    private timeTrackingPeriodsService: TimeTrackingPeriodsService,
  ) { }

  ngOnInit() {
    this.subtreeTrackedMs = this.treeNode.getSumRecursivelyIncludingThisNode(timeTrackedMsFunc)
  }

  startTimeTracking() {
    // this.timeTrackingService.startTimeTrackingOf(this.timeTrackable)
  }

  stopTimeTracking() {
    // this.timeTrackingService.stopTimeTrackingOf(this.timeTrackable)
  }

  async toggleShowSegments() {
    this.showSegments = !this.showSegments
    if (this.showSegments && !this.segments.length) {
      this.loadingSegments = true
      try {
        const periods = await this.timeTrackingPeriodsService.getPeriodsForItem(this.treeNode.itemId)
        this.segments = periods.sort((a, b) => (date(b.start)?.getTime() ?? 0) - (date(a.start)?.getTime() ?? 0))
      } finally {
        this.loadingSegments = false
      }
    }
  }

  startOf(segment: TimeTrackingPeriodOdm): Date | null {
    return date(segment.start)
  }

  endOf(segment: TimeTrackingPeriodOdm): Date | null {
    return segment.end ? date(segment.end) : null
  }

  durationMsOf(segment: TimeTrackingPeriodOdm): number {
    const start = date(segment.start)
    const end = this.endOf(segment) ?? new Date()
    return start ? Math.max(0, end.getTime() - start.getTime()) : 0
  }

}


