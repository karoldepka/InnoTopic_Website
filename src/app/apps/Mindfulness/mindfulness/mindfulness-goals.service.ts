import {Injectable} from '@angular/core'
import {SupabaseOdmClientService} from '../../../libs/AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {AuthService} from '../../../auth/auth.service'

/** Reuses the existing generic `odm_items` table (collection/id/owner/data jsonb, already RLS-
 * scoped to `owner`) for a single settings row instead of a new migration/table - same reserved-
 * singleton-id convention as `treeRootItemId`/`_mindfulness` elsewhere in this issue. */
const GOALS_COLLECTION = 'MindfulnessGoals'
const GOALS_ROW_ID = '_singleton'

export interface MindfulnessGoals {
  goalMinutesPerDay: number | null
  goalMinutesPerWeek: number | null
}

@Injectable({providedIn: 'root'})
export class MindfulnessGoalsService {

  constructor(
    private supabaseOdmClientService: SupabaseOdmClientService,
    private authService: AuthService,
  ) {
  }

  async getGoals(): Promise<MindfulnessGoals> {
    const owner = this.authService.authUser$.lastVal?.uid
    if (!owner) {
      return {goalMinutesPerDay: null, goalMinutesPerWeek: null}
    }
    const {data, error} = await this.supabaseOdmClientService.getClient()
      .from('odm_items')
      .select('data')
      .eq('collection', GOALS_COLLECTION)
      .eq('id', GOALS_ROW_ID)
      .eq('owner', owner)
      .maybeSingle()
    if (error) {
      console.error('MindfulnessGoalsService.getGoals failed', error)
      return {goalMinutesPerDay: null, goalMinutesPerWeek: null}
    }
    return {
      goalMinutesPerDay: data?.data?.goalMinutesPerDay ?? null,
      goalMinutesPerWeek: data?.data?.goalMinutesPerWeek ?? null,
    }
  }

  async saveGoals(goals: MindfulnessGoals): Promise<void> {
    const owner = this.authService.authUser$.lastVal?.uid
    if (!owner) {
      return
    }
    const {error} = await this.supabaseOdmClientService.getClient()
      .from('odm_items')
      .upsert({
        collection: GOALS_COLLECTION,
        id: GOALS_ROW_ID,
        owner,
        data: goals,
      })
    if (error) {
      console.error('MindfulnessGoalsService.saveGoals failed', error)
    }
  }
}
