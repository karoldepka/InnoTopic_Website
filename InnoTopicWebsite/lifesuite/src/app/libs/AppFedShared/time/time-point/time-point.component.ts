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

  /** `time` can be a genuinely invalid Date object (truthy, but every get*() call on it returns
   * NaN) rather than null/undefined - see process()'s doc comment. Used in the template so the
   * whole "(no timestamp)" fallback (day name included) applies consistently, not just the date
   * text. */
  get hasValidTime(): boolean {
    return !!this.time && !isNaN(this.time.getTime())
  }

  constructor() { }

  ngOnInit() {}

  process(time ? : Date | nullish) {
    try {
      // `time` can be a genuinely invalid Date object (e.g. constructed from a malformed/missing
      // timestamp upstream) rather than null/undefined - truthy, so it still renders below, but
      // every get*() call on it returns NaN, which then interpolated straight into the template
      // literal produced the literal string "NaN-NaN-NaN NaN:NaN:NaN" (GH #55). Falls through to
      // the same "no timestamp" fallback the caller already uses for a missing time.
      if ( ! time || isNaN(time.getTime()) ) {
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
