import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-login-email-password',
    templateUrl: './login-email-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./login-email-password.component.sass'],
    imports: [
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
    ],
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
