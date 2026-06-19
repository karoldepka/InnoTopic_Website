import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-range-cell',
  templateUrl: './range-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./range-cell.component.sass']
})
export class RangeCellComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
