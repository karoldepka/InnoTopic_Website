import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TimerItem} from "../../core/TimerItem";

@Component({
  standalone: false,
  selector: 'app-time-left-or-duration',
  templateUrl: './time-left-or-duration.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./time-left-or-duration.component.sass'],
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
