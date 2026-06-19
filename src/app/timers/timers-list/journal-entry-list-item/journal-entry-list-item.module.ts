import {CommonModule} from '@angular/common'
import {NgModule} from '@angular/core'
import {RouterModule} from '@angular/router'
import {IonicModule} from '@ionic/angular'
import {SharedModule} from '../../../shared/shared.module'
import {TimeModule} from '../../../libs/AppFedShared/time/time.module'
import {JournalEntryListItemComponent} from './journal-entry-list-item.component'
import {JournalNumFieldsViewComponent} from './journal-num-fields-view/journal-num-fields-view.component'
import {JournalTextFieldsViewComponent} from './journal-text-fields-view/journal-text-fields-view.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    SharedModule,
    TimeModule,
  ],
  declarations: [
    JournalEntryListItemComponent,
    JournalNumFieldsViewComponent,
    JournalTextFieldsViewComponent,
  ],
  exports: [
    JournalEntryListItemComponent,
    JournalNumFieldsViewComponent,
    JournalTextFieldsViewComponent,
  ],
})
export class JournalEntryListItemModule {}
