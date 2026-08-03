import { Injectable } from '@angular/core'
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  Auth,
  User,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  linkWithRedirect,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth'
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js'
import { environment } from '../../environments/environment'
import { errorAlert } from '../libs/AppFedShared/utils/log'
import { Capacitor } from '@capacitor/core'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { getFirebaseApp } from '../libs/AppFedSharedFirebase/firebase-app'

export type AuthBackendName = 'firebase' | 'supabase'
export type AuthFacadeUser = User

type AuthStateCallback = (user: AuthFacadeUser | null) => void

interface AuthProviderAdapter {
  observeAuthState(callback: AuthStateCallback): () => void
  signOut(): Promise<void>
  signUpWithEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null>
  logInViaEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null>
  logInViaGoogle(): Promise<AuthFacadeUser | null>
  logInViaFacebook(): Promise<AuthFacadeUser | null>
  linkWithEmailPassword(email: string, password: string): Promise<AuthFacadeUser | null>
  linkWithGoogle(): Promise<AuthFacadeUser | null>
  linkWithFacebook(): Promise<AuthFacadeUser | null>
}

class FirebaseAuthAdapter implements AuthProviderAdapter {
  private auth: Auth

  constructor() {
    try {
      const app = getFirebaseApp()
      // On native, the JS SDK's default persistence is unreliable inside the Capacitor
      // WebView; the plugin's docs (capacitor-firebase/authentication) recommend IndexedDB
      // persistence explicitly for the native-sign-in-synced-into-JS-SDK flow below.
      // Guard against auth/already-initialized in case something else in the app ever calls
      // getAuth()/initializeAuth() on this app before this constructor runs - initializeAuth()
      // throws if called twice with different options, so just adopt whatever's already there.
      try {
        this.auth = Capacitor.isNativePlatform()
          ? initializeAuth(app, {persistence: indexedDBLocalPersistence})
          : getAuth(app)
      } catch (error: any) {
        if (String(error?.code) !== 'auth/already-initialized') {
          throw error
        }
        this.auth = getAuth(app)
      }
    } catch (error: any) {
      errorAlert('Firebase initialization failed: ' + error?.message)
      throw error
    }
  }

  private isPopupInterrupted(error: any): boolean {
    const code = String(error?.code ?? '').toLowerCase()
    const message = String(error?.message ?? '').toLowerCase()
    const combined = `${code} ${message}`
    return (
      combined.includes('auth/popup-closed-by-user')
      || combined.includes('auth/cancelled-popup-request')
      || combined.includes('auth/popup-blocked')
      || combined.includes('popup_closed_by_user')
      || combined.includes('popup has been closed by the user')
    )
  }

  observeAuthState(callback: AuthStateCallback): () => void {
    const unsubscribe = onAuthStateChanged(this.auth, callback)
    return unsubscribe
  }

  async signOut(): Promise<void> {
    await signOut(this.auth)
  }

  async signUpWithEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password)
    return result.user ?? null
  }

  async logInViaEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const result = await signInWithEmailAndPassword(this.auth, email, password)
    return result.user ?? null
  }

  private isNoCredentialAvailable(error: any): boolean {
    const message = String(error?.message ?? '').toLowerCase()
    return message.includes('no credentials available') || message.includes('nocredentialexception')
  }

  private async signInWithGoogleNative(useCredentialManager: boolean): Promise<AuthFacadeUser | null> {
    const nativeResult = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager })
    const idToken = nativeResult.credential?.idToken
    if (!idToken) {
      throw new Error('Google sign-in did not return an ID token')
    }
    const credential = GoogleAuthProvider.credential(idToken)
    const result = await signInWithCredential(this.auth, credential)
    return result.user ?? null
  }

  async logInViaGoogle(): Promise<AuthFacadeUser | null> {
    if (Capacitor.isNativePlatform()) {
      // The web SDK's popup/redirect flow below doesn't work in a native WebView: Google
      // blocks OAuth inside embedded WebViews and kicks the flow out to the system browser,
      // which then has no way to hand control back to the app (the "missing initial state"
      // error on the firebaseapp.com page after redirecting to an external browser). Use the
      // native Google Sign-In SDK instead, then mirror the result into the JS SDK's Auth
      // instance so the rest of the app (onAuthStateChanged, Firestore, etc.) sees the user
      // as logged in too - see capacitor-firebase/authentication's firebase-js-sdk.md.
      try {
        return await this.signInWithGoogleNative(true)
      } catch (error: any) {
        // Android's Credential Manager can report "No credentials available" for reasons that
        // have nothing to do with the account actually being missing (an outdated Play Services
        // build, or no Credential Manager provider being registered on the device at all) - fall
        // back to the older, more broadly-compatible intent-based Google Sign-In picker rather
        // than dead-ending here.
        if (!this.isNoCredentialAvailable(error)) {
          throw error
        }
        return await this.signInWithGoogleNative(false)
      }
    }
    const authProvider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(this.auth, authProvider)
      return result.user ?? null
    } catch (error: any) {
      if (this.isPopupInterrupted(error)) {
        await signInWithRedirect(this.auth, authProvider)
        return null
      }
      throw error
    }
  }

  async logInViaFacebook(): Promise<AuthFacadeUser | null> {
    const authProvider = new FacebookAuthProvider()
    try {
      const result = await signInWithPopup(this.auth, authProvider)
      return result.user ?? null
    } catch (error: any) {
      if (this.isPopupInterrupted(error)) {
        await signInWithRedirect(this.auth, authProvider)
        return null
      }
      throw error
    }
  }

  async linkWithEmailPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const user = this.auth.currentUser
    if (!user) {
      throw new Error('No user currently logged in')
    }
    const credential = EmailAuthProvider.credential(email, password)
    const result = await linkWithCredential(user, credential)
    return result.user ?? null
  }

  async linkWithGoogle(): Promise<AuthFacadeUser | null> {
    const user = this.auth.currentUser
    if (!user) {
      throw new Error('No user currently logged in')
    }
    const authProvider = new GoogleAuthProvider()
    try {
      const result = await linkWithPopup(user, authProvider)
      return result.user ?? null
    } catch (error: any) {
      if (this.isPopupInterrupted(error)) {
        await linkWithRedirect(user, authProvider)
        return null
      }
      throw error
    }
  }

  async linkWithFacebook(): Promise<AuthFacadeUser | null> {
    const user = this.auth.currentUser
    if (!user) {
      throw new Error('No user currently logged in')
    }
    const authProvider = new FacebookAuthProvider()
    try {
      const result = await linkWithPopup(user, authProvider)
      return result.user ?? null
    } catch (error: any) {
      if (this.isPopupInterrupted(error)) {
        await linkWithRedirect(user, authProvider)
        return null
      }
      throw error
    }
  }
}

class SupabaseAuthAdapter implements AuthProviderAdapter {
  private client?: SupabaseClient

  private getClient(): SupabaseClient {
    if (this.client) {
      return this.client
    }

    const supabaseConfig = (environment as any).supabase
    if (!supabaseConfig?.url || !supabaseConfig?.publishableKey) {
      throw new Error('Missing environment.supabase.url or environment.supabase.publishableKey')
    }

    this.client = createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      db: {
        schema: supabaseConfig.schema ?? 'public',
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

    return this.client
  }

  private toAuthFacadeUser(user: SupabaseUser | null | undefined): AuthFacadeUser | null {
    if (!user) {
      return null
    }
    return {
      uid: user.id,
      email: user.email ?? null,
    } as unknown as AuthFacadeUser
  }

  observeAuthState(callback: AuthStateCallback): () => void {
    const client = this.getClient()
    client.auth.getUser().then(({ data }) => {
      callback(this.toAuthFacadeUser(data.user))
    }).catch(() => {
      callback(null)
    })

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      callback(this.toAuthFacadeUser(session?.user))
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }

  async signOut(): Promise<void> {
    const client = this.getClient()
    const { error } = await client.auth.signOut()
    if (error) {
      throw error
    }
  }

  async signUpWithEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const client = this.getClient()
    const { data, error } = await client.auth.signUp({ email, password })
    if (error) {
      throw error
    }
    return this.toAuthFacadeUser(data.user)
  }

  async logInViaEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const client = this.getClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }
    return this.toAuthFacadeUser(data.user)
  }

  async logInViaGoogle(): Promise<AuthFacadeUser | null> {
    const client = this.getClient()
    const { error } = await client.auth.signInWithOAuth({ provider: 'google' })
    if (error) {
      throw error
    }
    return null
  }

  async logInViaFacebook(): Promise<AuthFacadeUser | null> {
    const client = this.getClient()
    const { error } = await client.auth.signInWithOAuth({ provider: 'facebook' })
    if (error) {
      throw error
    }
    return null
  }

  async linkWithEmailPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const client = this.getClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      throw error
    }
    return this.toAuthFacadeUser(data.user)
  }

  async linkWithGoogle(): Promise<AuthFacadeUser | null> {
    const client = this.getClient()
    const { error } = await client.auth.linkIdentity({ provider: 'google' })
    if (error) {
      throw error
    }
    return null
  }

  async linkWithFacebook(): Promise<AuthFacadeUser | null> {
    const client = this.getClient()
    const { error } = await client.auth.linkIdentity({ provider: 'facebook' })
    if (error) {
      throw error
    }
    return null
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthFacadeService {
  private readonly backend: AuthBackendName = (environment as any).authBackend ?? 'firebase'
  private readonly adapter: AuthProviderAdapter

  constructor() {
    this.adapter = this.backend === 'supabase'
      ? new SupabaseAuthAdapter()
      : new FirebaseAuthAdapter()
  }

  get backendName(): AuthBackendName {
    return this.backend
  }

  observeAuthState(callback: AuthStateCallback): () => void {
    return this.adapter.observeAuthState(callback)
  }

  signOut(): Promise<void> {
    return this.adapter.signOut()
  }

  signUpWithEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    return this.adapter.signUpWithEmailAndPassword(email, password)
  }

  logInViaEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    return this.adapter.logInViaEmailAndPassword(email, password)
  }

  logInViaGoogle(): Promise<AuthFacadeUser | null> {
    return this.adapter.logInViaGoogle()
  }

  logInViaFacebook(): Promise<AuthFacadeUser | null> {
    return this.adapter.logInViaFacebook()
  }

  linkWithEmailPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    return this.adapter.linkWithEmailPassword(email, password)
  }

  linkWithGoogle(): Promise<AuthFacadeUser | null> {
    return this.adapter.linkWithGoogle()
  }

  linkWithFacebook(): Promise<AuthFacadeUser | null> {
    return this.adapter.linkWithFacebook()
  }
}
