import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MerchGenPageRoutingModule } from './merch-gen-routing.module';

import { MerchGenPage } from './merch-gen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MerchGenPageRoutingModule
  ],
  declarations: [MerchGenPage]
})
export class MerchGenPageModule {}
