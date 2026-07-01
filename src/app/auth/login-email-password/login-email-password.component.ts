import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, describeAuthError } from '../auth.service';
import { NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logoGoogle, logoFacebook } from 'ionicons/icons';
import { errorAlert } from '../../libs/AppFedShared/utils/log';

@Component({
    selector: 'app-login-email-password',
    templateUrl: './login-email-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./login-email-password.component.sass'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
    ],
})
export class LoginEmailPasswordComponent implements OnInit {
  showPassword = false
  isEmailPasswordInProgress = false
  isGoogleInProgress = false
  isFacebookInProgress = false

  get isAnyInProgress() {
    return this.isEmailPasswordInProgress || this.isGoogleInProgress || this.isFacebookInProgress
  }

  constructor(private AuthService: AuthService) {
    addIcons({ logoGoogle, logoFacebook })
  }

  ngOnInit() {}

  async loginEmailAndPassword(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;
    this.isEmailPasswordInProgress = true
    try {
      await this.AuthService.logInViaEmailAndPassword(email, password);
    } catch (error: any) {
      errorAlert('Error logging in: ' + describeAuthError(error, 'Error logging in'));
    } finally {
      this.isEmailPasswordInProgress = false
    }
  }

  async loginViaGoogle() {
    if (this.isGoogleInProgress || this.isFacebookInProgress) {
      return
    }
    this.isGoogleInProgress = true
    try {
      await this.AuthService.logInViaGoogle()
    } finally {
      this.isGoogleInProgress = false
    }
  }

  async loginViaFacebook() {
    if (this.isGoogleInProgress || this.isFacebookInProgress) {
      return
    }
    this.isFacebookInProgress = true
    try {
      await this.AuthService.logInViaFacebook()
    } finally {
      this.isFacebookInProgress = false
    }
  }
}
