import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-categories-stats',
  templateUrl: './categories-stats.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./categories-stats.component.sass'],
})
export class CategoriesStatsComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
