import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-audio',
    templateUrl: './audio.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./audio.page.scss'],
    imports: [IonicModule],
})
export class AudioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
