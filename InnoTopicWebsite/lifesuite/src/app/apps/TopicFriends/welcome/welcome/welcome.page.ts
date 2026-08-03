import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [IonicModule],
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./welcome.page.sass'],
})
export class WelcomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
