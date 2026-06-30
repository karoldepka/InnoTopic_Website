import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ignorePromise } from '../libs/AppFedShared/utils/promiseUtils';
import { Router } from '@angular/router';

// import * as firebase from 'firebase/app';
import {errorAlert} from '../libs/AppFedShared/utils/log'
import {CachedSubject} from '../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
// import {User} from 'firebase/compat/app'
import {ChromeExtensionService} from '../apps/Learn/shared/utils/chrome-extension.service'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import User = firebase.User
import {nullish} from '../libs/AppFedShared/utils/type-utils'
import {AuthFacadeService} from './auth-facade.service'


export type UserId = string

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  authUser$ = new CachedSubject<User | null>();

  private _userIsAuthenticated = false;

  get userIsAuthenticated() {
    return this._userIsAuthenticated;
  }

  /** this was required by stuff OrYoL AuthService */
  get userId(): UserId | nullish {
    return this.authUser$.lastVal?.uid
  }

  constructor(
    private angularFirestore: AngularFirestore,
    private authFacade: AuthFacadeService,
    private Router: Router
  ) {
    this.authFacade.observeAuthState(authState => {
      console.log('authState', authState?.uid, authState);
      this.authUser$.next(authState)
    });
    // ignorePromise(
    //   /* TODO: only use this if User chooses this instead of Google, to avoid creating data somewhere where it is not gonna be accessible on another device */
    //   this.afAuth.auth.signInAnonymously(),
    //   'this.angularFireAuth.auth.signInAnonymously()'
    // );
  }

  login() {
    this._userIsAuthenticated = true;
  }

  private isGooglePopupCancelled(error: any): boolean {
    const code = String(error?.code ?? '').toLowerCase();
    const message = String(error?.message ?? error ?? '').toLowerCase();
    const combined = `${code} ${message}`;
    return (
      combined.includes('auth/popup-closed-by-user')
      || combined.includes('auth/cancelled-popup-request')
      || combined.includes('popup_closed_by_user')
      || combined.includes('popup has been closed by the user')
    );
  }

  logout() {
    this._userIsAuthenticated = false;
    ignorePromise(this.authFacade.signOut())
    this.authUser$.next(null)
  }

  signUpWithEmailAndPassword(email: string, password: string) {
    return this.authFacade
      .signUpWithEmailAndPassword(email, password)
      .then((response: any) => (this.login()/*, this.Router.navigateByUrl('/timers') /!* TODO why comma expression *!/)*/))
      .catch((error: any) => console.log('Error on creating account', error));
  }

  logInViaEmailAndPassword(email: string, password: string) {
    return this.authFacade
      .logInViaEmailAndPassword(email, password)
      .then((response: any) => (this.login()/*, this.Router.navigateByUrl('/timers'))*/))
      .catch((error: any) => console.log('Error logging in', error));
  }

  logInViaGoogle() {
    if (ChromeExtensionService.isApplicationRunAsChromeExtension()) {
      // @ts-ignore
      chrome.runtime.sendMessage({
        command: 'login'
      }, (response) => {
        console.log('Log  in response===', response);
      });
    } else {
      return this.authFacade
        .logInViaGoogle()
        .then((response: any) => (this.login()/*, this.Router.navigateByUrl('/timers')*/)
          /* TODO: emit authUser$ */
        )
        .catch((error: any) => {
          if (this.isGooglePopupCancelled(error)) {
            console.info('Google sign-in popup was closed by the user.');
            return null;
          }
          errorAlert('Error logging in via Google ' + error);
          return null;
        });
    }
  }
}
