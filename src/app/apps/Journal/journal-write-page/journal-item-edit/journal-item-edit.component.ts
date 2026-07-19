import {Component, Injector, Input, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {CachedSubject} from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {JournalEntry} from '../../models/JournalEntry'
import {JournalEntry$} from '../../models/JournalEntry$'
import {JournalNumericDescriptors} from '../../models/JournalNumericDescriptors'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import {FeatureService} from '../../../../libs/AppFedShared/feature.service'
import { NgIf, AsyncPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TimePointComponent } from '../../../../libs/AppFedShared/time/time-point/time-point.component';
import { GeoLocComponent } from '../../../../libs/AppFedShared/geo-location/geo-loc/geo-loc.component';
import { JournalNumericFieldsComponent } from '../journal-numeric-fields/journal-numeric-fields.component';
import { JournalTextFieldsComponent } from '../journal-text-fields/journal-text-fields.component';
import { TimeTrackedItemCellComponent } from '../../../OrYoL/time-tracking/time-tracked-item-cell/time-tracked-item-cell.component';
import { TranslatePipe } from '@ngx-translate/core';
import { OdmTimestampToDatePipe } from '../../../../libs/AppFedShared/odm/odm-timestamp-to-date.pipe';

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
        JournalNumericFieldsComponent,
        JournalTextFieldsComponent,
        TimeTrackedItemCellComponent,
        AsyncPipe,
        TranslatePipe,
        OdmTimestampToDatePipe,
    ],
})
export class JournalItemEditComponent extends BaseComponent implements OnInit {

  fieldDescriptors = JournalNumericDescriptors.instance.array

  featureService = this.injector.get(FeatureService)

  @Input()
  public item$P ! : JournalEntry$

  get itemVal$(): CachedSubject<JournalEntry | undefined | null> {
    return this.item$P.val$
  }

  /** Optional (undefined until the *ngIf around <app-journal-text-fields> resolves, e.g. before
   * the entry has loaded) - see flushAllTextFields() below. */
  @ViewChild(JournalTextFieldsComponent)
  private textFieldsComponent ? : JournalTextFieldsComponent

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  /** Flushes every text field's possibly-still-throttled pending edit immediately - see
   * ViewSyncer.flush()'s doc comment for why this matters. */
  flushAllTextFields() {
    this.textFieldsComponent ?. flushAll()
  }

}
