import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NumericPickerComponent} from './numeric-picker/numeric-picker.component'
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {IonicModule} from '@ionic/angular'

const exports = [
  NumericPickerComponent,
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        ...exports,
    ],
    exports: exports
})
export class RatingsModule { }
