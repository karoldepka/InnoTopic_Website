import {Injectable} from '@angular/core'
import {SupabaseOdmClientService} from '../../../AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {AuthService} from '../../../../auth/auth.service'

export interface LinkPreviewResult {
  url: string
  canonicalUrl?: string | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  imageUrl?: string | null
  siteName?: string | null
  fetchStatus: 'ok' | 'error' | 'blocked'
  fetchedAt: string
}

/** Calls the `link-preview` Supabase Edge Function to fetch a pasted URL's title/description/
 * thumbnail server-side (avoiding CORS, and keeping the SSRF-sensitive scraping logic off the
 * client). The function itself caches results in `link_preview_cache`, so repeated pastes of the
 * same URL (by this user or any other) don't re-fetch it. */
@Injectable({providedIn: 'root'})
export class LinkPreviewService {

  constructor(
    private supabaseOdmClientService: SupabaseOdmClientService,
    private authService: AuthService,
  ) {}

  /** Never throws - a fetch/network failure resolves to a `fetchStatus: 'error'` result instead,
   * so a caller inserting a rich-text paste can always fall back to a plain link on failure
   * without needing its own try/catch. Waits for auth first: the Edge Function has
   * `verify_jwt: true`, so invoking it before the first post-login auth signal arrives gets
   * rejected at the gateway before the function body ever runs (no server-side log, indistinguishable
   * from a generic network failure) - confirmed live: a URL paste right after a fresh page load
   * silently fell into the plain-link fallback every time (GH #63). */
  async fetchPreview(url: string): Promise<LinkPreviewResult> {
    try {
      await this.authService.waitUntilAuthReady()
      const {data, error} = await this.supabaseOdmClientService.getClient()
        .functions.invoke('link-preview', {body: {url}})
      if (error) {
        return {url, fetchStatus: 'error', fetchedAt: new Date().toISOString()}
      }
      return data as LinkPreviewResult
    } catch {
      return {url, fetchStatus: 'error', fetchedAt: new Date().toISOString()}
    }
  }
}
