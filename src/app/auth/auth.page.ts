import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { LoginEmailPasswordComponent } from './login-email-password/login-email-password.component';
import { SignupEmailPasswordComponent } from './signup-email-password/signup-email-password.component';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./auth.page.scss'],
    imports: [
        IonicModule,
        LoginEmailPasswordComponent,
        SignupEmailPasswordComponent,
    ],
})
export class AuthPage implements OnInit {
  isLogin = true;
  constructor(private AuthService: AuthService, private Router: Router) {}

  ngOnInit() {}
  onLogin() {
    this.AuthService.login();
    this.Router.navigateByUrl('/timers');
  }
  onAuthSwitch() {
    this.isLogin = !this.isLogin;
  }
}
