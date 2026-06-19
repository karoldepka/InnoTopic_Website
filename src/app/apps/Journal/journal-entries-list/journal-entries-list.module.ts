import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JournalEntriesListPageRoutingModule } from './journal-entries-list-routing.module';

import { JournalEntriesListPage } from './journal-entries-list.page';
import {OdmModule} from '../../../libs/AppFedShared/odm/odm.module'
import {SharedModule} from '../../../shared/shared.module'
import {ScrollingModule} from '@angular/cdk/scrolling'
import { ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling';
import {TimeModule} from '../../../libs/AppFedShared/time/time.module'
import {TimelineListOptionsComponent} from './timeline-list-options/timeline-list-options.component'
import {JournalEntryListItemModule} from '../../../timers/timers-list/journal-entry-list-item/journal-entry-list-item.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JournalEntriesListPageRoutingModule,
    OdmModule,
    SharedModule,
    ScrollingModule,
    ExperimentalScrollingModule,
    TimeModule,
    JournalEntryListItemModule,
  ],
  declarations: [
    JournalEntriesListPage,
    TimelineListOptionsComponent,
  ],
})
export class JournalEntriesListPageModule {}
