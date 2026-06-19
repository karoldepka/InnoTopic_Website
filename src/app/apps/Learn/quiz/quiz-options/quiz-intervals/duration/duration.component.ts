import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {nullish} from '../../../../../../libs/AppFedShared/utils/type-utils'

@Component({
  standalone: false,
  selector: 'app-duration',
  templateUrl: './duration.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./duration.component.sass'],
})
export class DurationComponent implements OnInit {

  @Input()
  intervalDays: number | nullish

  constructor() { }

  ngOnInit() {}

  getMonths() {
    return this.intervalDays ! / 30
  }
}
