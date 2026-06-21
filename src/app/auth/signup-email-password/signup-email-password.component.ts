import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../auth.service';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-signup-email-password',
    templateUrl: './signup-email-password.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./signup-email-password.component.sass'],
    imports: [
        ReactiveFormsModule,
        FormsModule,
        IonicModule,
    ],
})
export class SignupEmailPasswordComponent implements OnInit {
  constructor(
    public afAuth: AngularFireAuth,
    private AuthService: AuthService
  ) {}

  ngOnInit() {}

  signupEmailAndPassword(form: NgForm) {
    const email = form.value.email as string;
    const password = form.value.password as string;
    const password2 = form.value.password2 as string;
    if (password === password2) {
      this.AuthService.signUpWithEmailAndPassword(email, password);
    } else {
      // To finish: Adding cutom validators
      console.log("Passwords don't match");
    }
  }
}
