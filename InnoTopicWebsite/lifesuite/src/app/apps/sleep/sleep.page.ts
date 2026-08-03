import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-sleep',
    templateUrl: './sleep.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./sleep.page.sass'],
    imports: [IonicModule],
})
export class SleepPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
