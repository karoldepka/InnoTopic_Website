import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core'
import {OdmItem$2} from '../../../../libs/AppFedShared/odm/OdmItem$2'
import {TimeTrackedEntry} from '../TimeTrackedEntry'
import {TimeTrackingCellComponent} from '../time-tracking-cell/time-tracking-cell.component'

/** Drop-in time-tracking play/pause + elapsed-time widget for any `OdmItem$2`-based item
 * (Journal entries, Learn's Task items, ...) - the non-tree counterpart to OrYoL's own
 * `NodeContentTimeTrackingComponent`, which does the same thing for a tree node. Both just obtain
 * (or create) the item's `TimeTrackedEntry` domain item and hand it to the same
 * `TimeTrackingCellComponent`. */
@Component({
  selector: 'app-time-tracked-item-cell',
  templateUrl: './time-tracked-item-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TimeTrackingCellComponent],
})
export class TimeTrackedItemCellComponent implements OnInit {

  @Input() item$!: OdmItem$2<any, any, any, any>

  /** Passed straight through to TimeTrackingCellComponent - see its own @Input for what this
   * actually changes (compact icon+timer, no title, no full-width look). */
  @Input() toolBarMode = false

  timeTrackedEntry!: TimeTrackedEntry

  ngOnInit() {
    this.timeTrackedEntry = this.item$.obtainDomainItem(TimeTrackedEntry)
  }

}
