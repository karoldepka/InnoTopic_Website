import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';

@Component({
    selector: 'app-lifedvisor',
    templateUrl: './lifedvisor.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./lifedvisor.page.scss'],
    imports: [IonicModule, AppLogoComponent],
})
export class LifedvisorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
