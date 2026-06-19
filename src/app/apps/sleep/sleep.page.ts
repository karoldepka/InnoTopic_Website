import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-sleep',
  templateUrl: './sleep.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./sleep.page.sass'],
})
export class SleepPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
