import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {Router} from '@angular/router'

@Component({
  standalone: false,
  selector: 'app-app-logo',
  templateUrl: './app-logo.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./app-logo.component.sass'],
})
export class AppLogoComponent implements OnInit {

  @Input()
  withText = true

  @Input()
  hideTextOnSmallScreens = false

  /** workaround for logo disappearing on page navigation */
  fillSuffix = (''+Math.random()).replace('.', '')

  fill1Id = 'fill1-' + this.fillSuffix
  fill2Id = 'fill2-' + this.fillSuffix

  constructor(
    public router: Router,
  ) { }

  ngOnInit() {
  }

}
