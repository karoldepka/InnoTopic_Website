import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {nullish} from '../../../../../../libs/AppFedShared/utils/type-utils'
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-duration',
    templateUrl: './duration.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./duration.component.sass'],
    imports: [NgIf],
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
