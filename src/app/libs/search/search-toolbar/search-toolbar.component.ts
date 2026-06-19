import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./search-toolbar.component.sass'],
})
export class SearchToolbarComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
