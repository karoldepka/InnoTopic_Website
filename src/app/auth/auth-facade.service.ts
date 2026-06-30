import { Injectable } from '@angular/core'
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { GoogleAuthProvider } from '@angular/fire/auth'
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { environment } from '../../environments/environment'

export type AuthBackendName = 'firebase' | 'supabase'
export type AuthFacadeUser = firebase.User

type AuthStateCallback = (user: AuthFacadeUser | null) => void

interface AuthProviderAdapter {
  observeAuthState(callback: AuthStateCallback): () => void
  signOut(): Promise<void>
  signUpWithEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null>
  logInViaEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null>
  logInViaGoogle(): Promise<AuthFacadeUser | null>
}

class FirebaseAuthAdapter implements AuthProviderAdapter {
  constructor(private afAuth: AngularFireAuth) {}

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
    const sub = this.afAuth.authState.subscribe(callback)
    return () => sub.unsubscribe()
  }

  async signOut(): Promise<void> {
    await this.afAuth.signOut()
  }

  async signUpWithEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const result = await this.afAuth.createUserWithEmailAndPassword(email, password)
    return result.user ?? null
  }

  async logInViaEmailAndPassword(email: string, password: string): Promise<AuthFacadeUser | null> {
    const result = await this.afAuth.signInWithEmailAndPassword(email, password)
    return result.user ?? null
  }

  async logInViaGoogle(): Promise<AuthFacadeUser | null> {
    const authProvider = new GoogleAuthProvider()
    try {
      const result = await this.afAuth.signInWithPopup(authProvider)
      return result.user ?? null
    } catch (error: any) {
      if (this.isPopupInterrupted(error)) {
        await this.afAuth.signInWithRedirect(authProvider)
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
}

@Injectable({
  providedIn: 'root',
})
export class AuthFacadeService {
  private readonly backend: AuthBackendName = (environment as any).authBackend ?? 'firebase'
  private readonly adapter: AuthProviderAdapter

  constructor(private afAuth: AngularFireAuth) {
    this.adapter = this.backend === 'supabase'
      ? new SupabaseAuthAdapter()
      : new FirebaseAuthAdapter(this.afAuth)
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
}
