import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeViewComponent } from './time-view/time-view.component'
import { TimePassingComponent } from './time-passing/time-passing.component'

const exports = [
  TimeViewComponent,
  TimePassingComponent,
]

@NgModule({
    imports: [
        CommonModule,
        ...exports
    ],
    exports: exports
})
export class TimeModule { }
