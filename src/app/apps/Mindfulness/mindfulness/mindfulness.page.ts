import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { NgIf } from '@angular/common';
import { TimePassingComponent } from '../../../libs/AppFedShared/time/time-passing/time-passing.component';

@Component({
    selector: 'app-mindfulness',
    templateUrl: './mindfulness.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./mindfulness.page.sass'],
    imports: [
        IonicModule,
        NgIf,
        TimePassingComponent,
    ],
})
export class MindfulnessPage extends BaseComponent implements OnInit {

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
  }

}
