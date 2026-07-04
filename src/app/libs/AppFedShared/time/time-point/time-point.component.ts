import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {nullish} from '../../utils/type-utils'
import { NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-time-point',
    templateUrl: './time-point.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./time-point.component.sass'],
    imports: [NgIf, IonicModule],
})
export class TimePointComponent implements OnInit {

  @Input()
  time ? : Date | nullish

  dayNames = [
    // 0 steht für Sonntag
    `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`,
  ]

  get isInFuture() {
    return (this.time ?. getTime() ?? 0) - 1000 > Date.now()
  }

  constructor() { }

  ngOnInit() {}

  process(time ? : Date) {
    try {
      if ( ! time ) {
        return undefined
      }
      const pad = (n: number) => String(n).padStart(2, '0')
      const datePart = `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())}`
      const timePart = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
      return `${datePart} ${timePart}`
    } catch (e) {
      return 'invalid-date'
    }
    //
  }
}
