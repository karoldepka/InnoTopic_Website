import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-search-result-row',
  templateUrl: './search-result-row.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./search-result-row.component.sass']
})
export class SearchResultRowComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
