import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../auth.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-signup-email-password',
    templateUrl: './signup-email-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./signup-email-password.component.sass'],
    imports: [
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
        CommonModule,
    ],
})
export class SignupEmailPasswordComponent implements OnInit {
  showPassword = false
  showLinkModal = false
  pendingEmail = ''
  pendingPassword = ''
  isLinkingWithPassword = false
  linkingError = ''
  signupError = ''
  isSigningUp = false

  constructor(
    public afAuth: AngularFireAuth,
    private AuthService: AuthService,
    private modalController: ModalController
  ) {}

  ngOnInit() {}

  signupEmailAndPassword(form: NgForm) {
    const email = form.value.email as string;
    const password = form.value.password as string;
    const password2 = form.value.password2 as string;
    
    this.signupError = ''
    
    if (password !== password2) {
      this.signupError = "Passwords don't match"
      console.log("Passwords don't match");
      return
    }
    
    this.isSigningUp = true
    this.AuthService.signUpWithEmailAndPassword(email, password)
      .then(() => {
        this.isSigningUp = false
        console.log('Signup successful')
      })
      .catch((error: any) => {
        this.isSigningUp = false
        console.error('Signup error:', error)
        
        if (error?.code === 'auth/email-already-in-use') {
          this.showAccountLinkModal(email, password)
        } else {
          this.signupError = error?.message || 'Error signing up'
        }
      })
  }

  private showAccountLinkModal(email: string, password: string) {
    this.pendingEmail = email
    this.pendingPassword = password
    this.showLinkModal = true
    this.linkingError = ''
  }

  closeLinkModal() {
    this.showLinkModal = false
    this.pendingEmail = ''
    this.pendingPassword = ''
    this.isLinkingWithPassword = false
    this.linkingError = ''
  }

  async linkWithPassword() {
    this.isLinkingWithPassword = true
    this.linkingError = ''
    try {
      await this.AuthService.logInViaEmailAndPassword(this.pendingEmail, this.pendingPassword)
      this.closeLinkModal()
    } catch (error: any) {
      this.linkingError = error?.message || 'Error linking account'
    } finally {
      this.isLinkingWithPassword = false
    }
  }

  async linkWithGoogle() {
    try {
      await this.AuthService.linkWithGoogle()
      this.closeLinkModal()
    } catch (error: any) {
      this.linkingError = error?.message || 'Error linking Google account'
    }
  }

  async linkWithFacebook() {
    try {
      await this.AuthService.linkWithFacebook()
      this.closeLinkModal()
    } catch (error: any) {
      this.linkingError = error?.message || 'Error linking Facebook account'
    }
  }
}
