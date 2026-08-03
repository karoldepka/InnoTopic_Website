import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Router, RouterLink } from '@angular/router'
import { IonicModule } from '@ionic/angular';
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'app-app-logo',
    templateUrl: './app-logo.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./app-logo.component.sass'],
    imports: [
        IonicModule,
        RouterLink,
        NgIf,
        NgClass,
    ],
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
