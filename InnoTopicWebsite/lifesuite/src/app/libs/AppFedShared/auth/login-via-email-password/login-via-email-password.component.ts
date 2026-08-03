import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-login-via-email-password',
  templateUrl: './login-via-email-password.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login-via-email-password.component.sass'],
})
export class LoginViaEmailPasswordComponent implements OnInit {

  constructor() { }

  ngOnInit() {}

}
