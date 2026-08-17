import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-lifedvisor',
    templateUrl: './lifedvisor.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./lifedvisor.page.scss'],
    imports: [IonicModule],
})
export class LifedvisorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
