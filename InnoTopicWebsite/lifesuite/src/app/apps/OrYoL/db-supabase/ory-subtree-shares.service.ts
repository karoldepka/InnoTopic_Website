import {Injectable} from '@angular/core'
import {SupabaseOdmClientService} from '../../../libs/AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {AuthService} from '../../../auth/auth.service'

export type OrySubtreePermission = 'read' | 'write'

export interface OrySubtreeShare {
  id: string
  subtree_root_item_id: string
  granted_to_uid: string | null
  granted_to_group_id: string | null
  granted_by_uid: string
  permission: OrySubtreePermission
  created_at: string
}

/** Client for `ory_subtree_shares` (see the OrYoL tree migration plan) - a subtree-level grant
 * that RLS on `odm_items` reads directly (see the policies added alongside this table), letting a
 * second user read/write everything under a shared `OryItem`/`OryNodeInclusion` subtree without
 * owning it. Only meaningful once `environment.oryolTreeBackend === 'supabase'` - under Firestore,
 * items have no `owner` at all, so there's nothing for a share to grant access to yet. Group-based
 * sharing is schema-reserved (`granted_to_group_id`) but not implemented here - direct-uid grants
 * only, matching the plan's explicitly minimal scope for this pass. */
@Injectable({providedIn: 'root'})
export class OrySubtreeSharesService {

  constructor(
    private supabaseClient: SupabaseOdmClientService,
    private authService: AuthService,
  ) {
  }

  /** RLS only allows this to succeed if the caller actually owns `subtreeRootItemId` (see the
   * "Users can grant access to subtrees they own" INSERT policy) - a non-owner's attempt fails
   * server-side regardless of what the UI shows. */
  async grantShare(subtreeRootItemId: string, grantedToUid: string, permission: OrySubtreePermission): Promise<void> {
    const grantedByUid = this.authService.authUser$.lastVal?.uid
    if (!grantedByUid) {
      throw new Error('Not signed in.')
    }
    const {error} = await this.supabaseClient.getClient()
      .from('ory_subtree_shares')
      .insert({
        subtree_root_item_id: subtreeRootItemId,
        granted_to_uid: grantedToUid,
        granted_by_uid: grantedByUid,
        permission,
      })
    if (error) {
      throw error
    }
  }

  /** RLS ("Users can read shares involving them") only ever returns shares the caller granted or
   * was granted - the `.eq()` below just narrows that further to one specific subtree. */
  async listSharesForSubtree(subtreeRootItemId: string): Promise<OrySubtreeShare[]> {
    const {data, error} = await this.supabaseClient.getClient()
      .from('ory_subtree_shares')
      .select('*')
      .eq('subtree_root_item_id', subtreeRootItemId)
      .order('created_at', {ascending: false})
    if (error) {
      throw error
    }
    return (data ?? []) as OrySubtreeShare[]
  }

  /** RLS ("Users can revoke shares they granted") only lets the granter revoke - not the grantee. */
  async revokeShare(shareId: string): Promise<void> {
    const {error} = await this.supabaseClient.getClient()
      .from('ory_subtree_shares')
      .delete()
      .eq('id', shareId)
    if (error) {
      throw error
    }
  }
}
