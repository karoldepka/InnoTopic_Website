import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  standalone: true,
  imports: [IonicModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
