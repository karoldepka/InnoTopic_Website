import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-cells-group',
    templateUrl: './cells-group.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./cells-group.component.sass']
})
export class CellsGroupComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
