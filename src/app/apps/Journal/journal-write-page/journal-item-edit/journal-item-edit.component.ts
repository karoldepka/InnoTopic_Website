import {Component, Injector, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CachedSubject} from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {JournalEntry} from '../../models/JournalEntry'
import {JournalEntry$} from '../../models/JournalEntry$'
import {JournalNumericDescriptors} from '../../models/JournalNumericDescriptors'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { NgIf, AsyncPipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TimePointComponent } from '../../../../libs/AppFedShared/time/time-point/time-point.component';
import { GeoLocComponent } from '../../../../libs/AppFedShared/geo-location/geo-loc/geo-loc.component';
import { JournalNumericFieldsComponent } from '../journal-numeric-fields/journal-numeric-fields.component';
import { JournalTextFieldsComponent } from '../journal-text-fields/journal-text-fields.component';
import { TranslatePipe } from '@ngx-translate/core';

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
        AsyncPipe,
        TranslatePipe,
    ],
})
export class JournalItemEditComponent extends BaseComponent implements OnInit {

  fieldDescriptors = JournalNumericDescriptors.instance.array

  @Input()
  public item$P ! : JournalEntry$

  get itemVal$(): CachedSubject<JournalEntry | undefined | null> {
    return this.item$P.val$
  }

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

}
