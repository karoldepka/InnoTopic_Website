import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CvPagePrintPageRoutingModule } from './cv-page-print-routing.module';

import { CvPagePrintPage } from './cv-page-print.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CvPagePrintPageRoutingModule,
    CvPagePrintPage,
  ],
  exports: [
    CvPagePrintPage
  ],
})
export class CvPagePrintPageModule {}
