import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JournalWritePageRoutingModule } from './journal-write.page-routing.module';
import {IonicModule} from "@ionic/angular";
import {JournalWritePage} from "./journal-write.page";
import {NumericPickerComponent} from "../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component";
import {FormsModule} from '@angular/forms'
import {OdmModule} from '../../../libs/AppFedShared/odm/odm.module'
import {RatingsModule} from '../../../libs/AppFedSharedIonic/ratings/ratings.module'
import {TimeModule} from '../../../libs/AppFedShared/time/time.module'
import {SharedModule} from '../../../shared/shared.module'
import {JournalItemEditComponent} from './journal-item-edit/journal-item-edit.component'

@NgModule({
    imports: [
        CommonModule,
        JournalWritePageRoutingModule,
        IonicModule,
        FormsModule,
        OdmModule,
        RatingsModule,
        TimeModule,
        SharedModule,
        JournalWritePage,
        JournalItemEditComponent,
    ],
    exports: [],
})
export class JournalWritePageModule { }
