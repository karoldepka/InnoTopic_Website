import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-rationale',
    templateUrl: './rationale.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./rationale.component.scss'],
    imports: [IonicModule, RouterLink]
})
export class RationaleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
