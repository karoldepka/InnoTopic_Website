import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-moderation-timers-page',
  templateUrl: './moderation-timers-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./moderation-timers-page.component.sass']
})
export class ModerationTimersPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
