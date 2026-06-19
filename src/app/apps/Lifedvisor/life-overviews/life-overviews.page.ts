import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-life-overviews',
  templateUrl: './life-overviews.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./life-overviews.page.scss'],
})
export class LifeOverviewsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
