import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-rating-cell',
  templateUrl: './rating-cell.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./rating-cell.component.sass'],
})
export class RatingCellComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
