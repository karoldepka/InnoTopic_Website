import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

export class RangeFilterVal {
  active: boolean
  min: number
  max: number
}

@Component({
  standalone: true,
  imports: [],
  selector: 'app-range-filter',
  templateUrl: './range-filter.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./range-filter.component.sass'],
})
export class RangeFilterComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
