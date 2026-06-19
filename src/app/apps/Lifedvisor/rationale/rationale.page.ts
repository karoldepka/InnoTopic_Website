import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-rationale-page',
  templateUrl: './rationale.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./rationale.page.scss'],
})
export class RationalePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
