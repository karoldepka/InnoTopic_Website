import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./welcome.page.sass'],
})
export class WelcomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
