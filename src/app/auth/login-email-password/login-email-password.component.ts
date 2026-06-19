import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-login-email-password',
  templateUrl: './login-email-password.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./login-email-password.component.sass'],
})
export class LoginEmailPasswordComponent implements OnInit {
  constructor(private AuthService: AuthService) {}

  ngOnInit() {}

  loginEmailAndPassword(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    this.AuthService.logInViaEmailAndPassword(email, password);
  }
}
