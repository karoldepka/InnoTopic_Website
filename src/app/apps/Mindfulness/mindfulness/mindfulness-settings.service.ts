import {Injectable} from '@angular/core'
import {SupabaseOdmClientService} from '../../../libs/AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {AuthService} from '../../../auth/auth.service'

/** Reuses the existing generic `odm_items` table (collection/id/owner/data jsonb, already RLS-
 * scoped to `owner`) for a single settings row instead of a new migration/table - same reserved-
 * singleton-id convention as `treeRootItemId`/`_mindfulness` elsewhere in this issue. */
const SETTINGS_COLLECTION = 'MindfulnessGoals'
const SETTINGS_ROW_ID = '_singleton'

export interface MindfulnessSettings {
  goalMinutesPerDay: number | null
  goalMinutesPerWeek: number | null
  /** The timer duration (seconds) last picked via a preset or the manual minutes/seconds
   * inputs, restored the next time the page is opened. */
  lastDurationSeconds: number | null
}

const DEFAULT_SETTINGS: MindfulnessSettings = {
  goalMinutesPerDay: null,
  goalMinutesPerWeek: null,
  lastDurationSeconds: null,
}

@Injectable({providedIn: 'root'})
export class MindfulnessSettingsService {

  constructor(
    private supabaseOdmClientService: SupabaseOdmClientService,
    private authService: AuthService,
  ) {
  }

  async getSettings(): Promise<MindfulnessSettings> {
    // Guards the same race documented on waitUntilAuthReady(): right after a hard page reload,
    // authUser$ hasn't received the rehydrated Supabase session yet, so reading .lastVal?.uid here
    // synchronously would silently fall through to DEFAULT_SETTINGS every time.
    await this.authService.waitUntilAuthReady()
    const owner = this.authService.authUser$.lastVal?.uid
    if (!owner) {
      return {...DEFAULT_SETTINGS}
    }
    const {data, error} = await this.supabaseOdmClientService.getClient()
      .from('odm_items')
      .select('data')
      .eq('collection', SETTINGS_COLLECTION)
      .eq('id', SETTINGS_ROW_ID)
      .eq('owner', owner)
      .maybeSingle()
    if (error) {
      console.error('MindfulnessSettingsService.getSettings failed', error)
      return {...DEFAULT_SETTINGS}
    }
    return {
      goalMinutesPerDay: data?.data?.goalMinutesPerDay ?? null,
      goalMinutesPerWeek: data?.data?.goalMinutesPerWeek ?? null,
      lastDurationSeconds: data?.data?.lastDurationSeconds ?? null,
    }
  }

  async saveGoals(goals: Pick<MindfulnessSettings, 'goalMinutesPerDay' | 'goalMinutesPerWeek'>): Promise<void> {
    await this.patchSettings(goals)
  }

  async saveLastDurationSeconds(lastDurationSeconds: number): Promise<void> {
    await this.patchSettings({lastDurationSeconds})
  }

  /** Merges with whatever is already stored so saving one slice (goals vs. the last-used timer
   * duration) never clobbers the other - upsert replaces the row's `data` jsonb column wholesale,
   * so a naive "save only what changed" would silently wipe out unrelated fields. */
  private async patchSettings(partial: Partial<MindfulnessSettings>): Promise<void> {
    const current = await this.getSettings() // also waits for auth to be ready
    const owner = this.authService.authUser$.lastVal?.uid
    if (!owner) {
      return
    }
    const {error} = await this.supabaseOdmClientService.getClient()
      .from('odm_items')
      .upsert({
        collection: SETTINGS_COLLECTION,
        id: SETTINGS_ROW_ID,
        owner,
        data: {...current, ...partial},
      })
    if (error) {
      console.error('MindfulnessSettingsService.patchSettings failed', error)
    }
  }
}
