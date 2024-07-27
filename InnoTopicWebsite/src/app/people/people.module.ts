import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PeoplePageRoutingModule } from './people-routing.module';

import { PeoplePage } from './people.page';
import {TopicsSharedModule} from "../topics-shared/topics-shared.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PeoplePageRoutingModule,
        TopicsSharedModule
    ],
  declarations: [PeoplePage]
})
export class PeoplePageModule {}
