import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TimerItem} from "../../core/TimerItem";
import { NgIf } from '@angular/common';
import { TimePassingComponent } from '../../libs/AppFedShared/time/time-passing/time-passing.component';
import { TimeViewComponent } from '../../libs/AppFedShared/time/time-view/time-view.component';

@Component({
    selector: 'app-time-left-or-duration',
    templateUrl: './time-left-or-duration.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./time-left-or-duration.component.sass'],
    imports: [
        NgIf,
        TimePassingComponent,
        TimeViewComponent,
    ],
})
export class TimeLeftOrDurationComponent implements OnInit {

  @Input()
  timer ! : TimerItem

  get endTime() {
    return this.timer.endTime !
  }

  constructor() { }

  ngOnInit() {}

}
