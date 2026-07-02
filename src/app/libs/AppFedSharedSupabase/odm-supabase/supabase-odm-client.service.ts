import {Injectable} from '@angular/core'
import {createClient, SupabaseClient} from '@supabase/supabase-js'
import {environment} from '../../../../environments/environment'
import {AuthService} from '../../../auth/auth.service'

@Injectable()
export class SupabaseOdmClientService {
  private client?: SupabaseClient

  constructor(private authService: AuthService) {
  }

  getClient(): SupabaseClient {
    if (this.client) {
      return this.client
    }
    const supabaseConfig = (environment as any).supabase
    if (!supabaseConfig?.url || !supabaseConfig?.publishableKey) {
      throw new Error('Missing environment.supabase.url or environment.supabase.publishableKey')
    }
    this.client = createClient(
      supabaseConfig.url,
      supabaseConfig.publishableKey,
      {
        db: {
          schema: supabaseConfig.schema ?? 'public',
        },
        // Bridges the existing Firebase session into Supabase (Supabase "Third-Party Auth"
        // for Firebase must be configured in the Supabase dashboard) so auth.uid() in RLS
        // policies resolves to the same uid already used as `owner` everywhere else, instead
        // of requiring a separate Supabase login. Setting this disables supabase.auth.* on
        // this client - it's only used for table/realtime access here, never for auth itself.
        // supabase-js types this as () => Promise<string>, but at runtime a nullish
        // return just falls back to the publishable key (see fetchWithAuth) - which is
        // exactly what we want while signed out.
        accessToken: (() => this.getFirebaseIdToken()) as unknown as () => Promise<string>,
      }
    )
    return this.client
  }

  private async getFirebaseIdToken(): Promise<string | null> {
    const user = this.authService.authUser$.lastVal
    if (!user) {
      return null
    }
    try {
      const token = await user.getIdToken()
      this.debugLogTokenSubMismatch(user.uid, token)
      return token
    } catch (error) {
      console.error('[Supabase Auth Bridge] getIdToken failed', error)
      return null
    }
  }

  /** Temporary diagnostic: RLS policies compare `owner` (Firebase uid) against
   * auth.jwt()->>'sub' on the Postgres side. Confirms here whether the token we're
   * sending actually carries that same uid as its `sub` claim. */
  private debugLogTokenSubMismatch(uid: string, token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (payload.sub !== uid) {
        console.error('[Supabase Auth Bridge] token sub MISMATCH', {uid, tokenSub: payload.sub, payload})
      }
    } catch (error) {
      console.error('[Supabase Auth Bridge] failed to decode token for debug check', error)
    }
  }
}
