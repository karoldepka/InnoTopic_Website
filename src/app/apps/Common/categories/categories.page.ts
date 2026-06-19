import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-categories-page',
  templateUrl: './categories.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./categories.page.sass'],
})
export class CategoriesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
