import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CvPageComponent } from './cv-page.component';

@NgModule({
  exports: [
    CvPageComponent,
  ],
  imports: [
    CommonModule,
    CvPageComponent,
  ],
})
export class CvPageModule1 { }
