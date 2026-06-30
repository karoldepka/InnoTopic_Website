import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../auth.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { addIcons } from 'ionicons';
import { logoGoogle, logoFacebook, mailOutline } from 'ionicons/icons';

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
export class SignupEmailPasswordComponent implements OnInit, OnDestroy {
  showPassword = false
  showLinkModal = false
  pendingEmail = ''
  pendingNewPassword = '' // Password they tried to sign up with
  existingAccountPassword = '' // Password for existing account (what they enter in modal)
  isLinkingWithPassword = false
  linkingError = ''
  signupError = ''
  isSigningUp = false
  showExistingPassword = false
  isGoogleInProgress = false
  isFacebookInProgress = false
  private destroy$ = new Subject<void>()

  constructor(
    public afAuth: AngularFireAuth,
    private AuthService: AuthService,
    private modalController: ModalController
  ) {
    addIcons({ logoGoogle, logoFacebook, mailOutline })
  }

  ngOnInit() {}

  async signupViaGoogle() {
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

  async signupViaFacebook() {
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

  private isEmailAlreadyInUseError(error: any): boolean {
    const code = String(error?.code ?? '').toLowerCase()
    const message = String(error?.message ?? '').toLowerCase()
    return code.includes('auth/email-already-in-use') || message.includes('email address is already in use')
  }

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

        if (this.isEmailAlreadyInUseError(error)) {
          this.signupError = ''
          this.showAccountLinkModal(email, password)
        } else {
          this.signupError = error?.message || 'Error signing up'
        }
      })
  }

  private showAccountLinkModal(email: string, password: string) {
    this.pendingEmail = email
    this.pendingNewPassword = password
    this.existingAccountPassword = ''
    this.showLinkModal = true
    this.linkingError = ''
    this.showExistingPassword = false
  }

  openDirectLinkModal() {
    this.pendingEmail = ''
    this.pendingNewPassword = ''
    this.existingAccountPassword = ''
    this.showLinkModal = true
    this.linkingError = ''
    this.showExistingPassword = false
  }

  private ensureLinkInputs(): boolean {
    const email = this.pendingEmail?.trim() ?? ''
    const password = this.pendingNewPassword ?? ''

    if (!email || !email.includes('@')) {
      this.linkingError = 'Enter the email you want to link.'
      return false
    }

    if (!password || password.length < 8) {
      this.linkingError = 'Enter a new password with at least 8 characters.'
      return false
    }

    this.linkingError = ''
    return true
  }

  closeLinkModal() {
    this.showLinkModal = false
    this.pendingEmail = ''
    this.pendingNewPassword = ''
    this.existingAccountPassword = ''
    this.isLinkingWithPassword = false
    this.linkingError = ''
    this.showExistingPassword = false
  }

  async linkWithPassword() {
    if (!this.ensureLinkInputs()) {
      return
    }

    // If no password entered, offer to authenticate with Google first
    if (!this.existingAccountPassword) {
      this.linkingError = ''
      try {
        this.isLinkingWithPassword = true
        // Log in with Google to authenticate the existing account
        await this.AuthService.logInViaGoogle()
        // Wait for auth state to update (handles redirect flow)
        await this.waitForAuthentication()
        // Then link the new email/password credential they wanted to sign up with
        await this.AuthService.linkWithEmailPassword(this.pendingEmail, this.pendingNewPassword)
        this.closeLinkModal()
      } catch (error: any) {
        this.linkingError = error?.message || 'Error linking account. Try using Google or Facebook instead.'
      } finally {
        this.isLinkingWithPassword = false
      }
      return
    }

    this.isLinkingWithPassword = true
    this.linkingError = ''
    try {
      // Log in with existing account credentials
      await this.AuthService.logInViaEmailAndPassword(this.pendingEmail, this.existingAccountPassword)
      this.closeLinkModal()
    } catch (error: any) {
      this.linkingError = error?.message || 'Incorrect password or email'
    } finally {
      this.isLinkingWithPassword = false
    }
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  /** Wait for user to be authenticated (handles both popup and redirect flows) */
  private waitForAuthentication(): Promise<void> {
    return new Promise((resolve) => {
      let settled = false
      let subscription: { unsubscribe(): void } | undefined
      const finish = () => {
        if (settled) {
          return
        }
        settled = true
        // subscription may not be assigned yet if emission is synchronous
        subscription?.unsubscribe()
        resolve()
      }
      subscription = this.AuthService.authUser$.subscribe((user) => {
        if (user) {
          finish()
        }
      })
      // In case the value was emitted synchronously before assignment above
      if (settled) {
        subscription.unsubscribe()
      }
    })
  }

  async linkWithGoogle() {
    if (!this.ensureLinkInputs()) {
      return
    }

    this.isLinkingWithPassword = true
    this.linkingError = ''
    try {
      // Sign in with Google first (this logs them in)
      await this.AuthService.logInViaGoogle()
      // Wait for auth state to update (handles redirect flow)
      await this.waitForAuthentication()
      // Now link the email/password credential they wanted to sign up with
      await this.AuthService.linkWithEmailPassword(this.pendingEmail, this.pendingNewPassword)
      this.closeLinkModal()
    } catch (error: any) {
      this.linkingError = error?.message || 'Error linking Google account'
    } finally {
      this.isLinkingWithPassword = false
    }
  }

  async linkExistingGoogleAccountAndSetPassword() {
    await this.linkWithGoogle()
  }

  async linkWithFacebook() {
    if (!this.ensureLinkInputs()) {
      return
    }

    this.isLinkingWithPassword = true
    this.linkingError = ''
    try {
      // Sign in with Facebook first (this logs them in)
      await this.AuthService.logInViaFacebook()
      // Wait for auth state to update (handles redirect flow)
      await this.waitForAuthentication()
      // Now link the email/password credential they wanted to sign up with
      await this.AuthService.linkWithEmailPassword(this.pendingEmail, this.pendingNewPassword)
      this.closeLinkModal()
    } catch (error: any) {
      this.linkingError = error?.message || 'Error linking Facebook account'
    } finally {
      this.isLinkingWithPassword = false
    }
  }
}
