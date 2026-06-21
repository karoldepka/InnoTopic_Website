import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RationaleComponent } from './rationale/rationale.component';

@Component({
    selector: 'app-rationale-page',
    templateUrl: './rationale.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./rationale.page.scss'],
    imports: [IonicModule, RationaleComponent],
})
export class RationalePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
