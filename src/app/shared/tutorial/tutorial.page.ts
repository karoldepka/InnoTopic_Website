import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-tutorial',
    templateUrl: './tutorial.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./tutorial.page.sass'],
    imports: [IonicModule],
})
export class TutorialPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
