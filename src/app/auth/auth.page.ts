import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./auth.page.scss'],
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
