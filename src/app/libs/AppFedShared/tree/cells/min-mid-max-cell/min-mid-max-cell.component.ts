import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {OdmCell} from '../OdmCell'

@Component({
    selector: 'app-min-mid-max-cell',
    templateUrl: './min-mid-max-cell.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./min-mid-max-cell.component.sass'],
})
export class MinMidMaxCellComponent implements OnInit {

  @Input()
  cell !: OdmCell

  constructor() { }

  ngOnInit() {}

}
