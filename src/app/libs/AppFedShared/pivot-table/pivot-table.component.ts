import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {PivotTable} from '../utils/pivot/pivot-table'
import {Required} from '../utils/angular/Required.decorator'

@Component({
  standalone: false,
  selector: 'app-pivot-table',
  templateUrl: './pivot-table.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./pivot-table.component.sass'],
})
export class PivotTableComponent implements OnInit {

  @Required()
  @Input()
  pivot ! : PivotTable<any, any, any, any>

  constructor() {

  }

  ngOnInit() {

  }

}
