import {Component, Injector, Input, OnChanges, ChangeDetectionStrategy} from '@angular/core';
import {CachedSubject} from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {JournalEntry} from '../../models/JournalEntry'
import {JournalEntry$} from '../../models/JournalEntry$'
import {JOURNAL_SLOT_DESCRIPTORS} from '../../models/JournalSlotDescriptors'
import {OdmTreeNode} from '../../../../libs/AppFedShared/tree/tree-node/OdmTreeNode'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import {FeatureService} from '../../../../libs/AppFedShared/feature.service'
import {AuthService} from '../../../../auth/auth.service'
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TimePointComponent } from '../../../../libs/AppFedShared/time/time-point/time-point.component';
import { GeoLocComponent } from '../../../../libs/AppFedShared/geo-location/geo-loc/geo-loc.component';
import { TreeNodeCellsComponent } from '../../../../libs/AppFedShared/tree/tree-node/tree-node-content/tree-node-cells/tree-node-cells.component';
import { TimeTrackedItemCellComponent } from '../../../OrYoL/time-tracking/time-tracked-item-cell/time-tracked-item-cell.component';
import { TranslatePipe } from '@ngx-translate/core';
import { OdmTimestampToDatePipe } from '../../../../libs/AppFedShared/odm/odm-timestamp-to-date.pipe';

/** GH #89's unified rendering for a Journal entry - `TreeNodeCellsComponent` (shared with Learn/
 * OrYoL once ported) replaces the old `<app-journal-numeric-fields>`/`<app-journal-text-fields>`
 * pair. A Journal entry isn't part of any real tree UI today, so `treeNode` is a standalone
 * `OdmTreeNode` (`parentNode: undefined`) wrapping just this one item - `OdmTreeNode`/`OdmCell`
 * don't require an actual tree view to exist, only a real `OdmItem$2` to read/write through. */
@Component({
    selector: 'app-journal-item-edit',
    templateUrl: './journal-item-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./journal-item-edit.component.sass'],
    imports: [
        NgIf,
        IonicModule,
        TimePointComponent,
        GeoLocComponent,
        TreeNodeCellsComponent,
        TimeTrackedItemCellComponent,
        AsyncPipe,
        TranslatePipe,
        OdmTimestampToDatePipe,
        RouterLink,
    ],
})
export class JournalItemEditComponent extends BaseComponent implements OnChanges {

  descriptors = JOURNAL_SLOT_DESCRIPTORS

  /** `general` is Journal's primary/anchor field (GH #104: auto-expanded+focused on a brand-new
   * entry) - it should stay visible even on an existing, otherwise-filled-in entry where it
   * itself has no value yet, not get clutter-hidden like any other shortlisted field would. */
  alwaysVisibleDescriptorIds = ['general']

  featureService = this.injector.get(FeatureService)

  authService = this.injector.get(AuthService)

  @Input()
  public item$P ! : JournalEntry$

  /** See `TreeNodeCellsComponent.autoExpandDescriptorId`'s doc comment - Journal passes `general`
   * for every opened entry so its primary text field is immediately ready for writing. */
  @Input()
  public autoExpandDescriptorId?: string

  treeNode ! : OdmTreeNode<JournalEntry$>

  get itemVal$(): CachedSubject<JournalEntry | undefined | null> {
    return this.item$P.val$
  }

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnChanges() {
    // Rebuilt (not just constructed once) so navigating between entries within the same page
    // instance (item$P input rebound) doesn't leave TreeNodeCellsComponent pointed at the stale
    // previous entry.
    this.treeNode = new OdmTreeNode(undefined, this.item$P)
  }

}
