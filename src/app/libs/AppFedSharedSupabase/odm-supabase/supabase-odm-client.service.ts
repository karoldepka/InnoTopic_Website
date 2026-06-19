import {Injectable} from '@angular/core'
import {createClient, SupabaseClient} from '@supabase/supabase-js'
import {environment} from '../../../../environments/environment'

@Injectable()
export class SupabaseOdmClientService {
  private client?: SupabaseClient

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
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    )
    return this.client
  }
}
