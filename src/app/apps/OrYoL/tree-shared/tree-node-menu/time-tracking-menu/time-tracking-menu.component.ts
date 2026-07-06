import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  date,
  TimeTrackingService,
} from '../../../time-tracking/time-tracking.service'
import {ApfBaseTreeNode, OryBaseTreeNode} from '../../../tree-model/TreeModel'
import { NodeContentTimeTrackingComponent } from '../../node-content-time-tracking/node-content-time-tracking.component';
import { TimeViewComponent } from '../../../../../libs/AppFedShared/time/time-view/time-view.component';

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
    imports: [NodeContentTimeTrackingComponent, TimeViewComponent]
})
export class TimeTrackingMenuComponent implements OnInit {

  @Input() treeNode!: OryBaseTreeNode

  /** Computed once on open rather than bound live in the template - the popover is a short-lived
   * glance, and recomputing this every change-detection pass (it depends on Date.now() while
   * tracking is in progress) is exactly what trips ExpressionChangedAfterItHasBeenCheckedError. */
  subtreeTrackedMs = 0

  // get isTimeTrackingThis() { return this.timeTrackingService.isTimeTracking(this.timeTrackable) }
  get timeTrackable() { return this.treeNode.itemId }

  constructor(
    public timeTrackingService: TimeTrackingService,
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

}


