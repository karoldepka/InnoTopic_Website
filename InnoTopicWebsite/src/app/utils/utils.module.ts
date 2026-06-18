import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyValOrderedPipe } from './KeyValueOrderedPipe';

@NgModule({
  imports: [
    CommonModule,
    KeyValOrderedPipe,
  ],
  exports: [
    KeyValOrderedPipe,
  ]
})
export class UtilsModule { }
