import {OdmItem$2} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {OryNodeInclusionData, OryNodeInclusionId} from './OryNodeInclusionData'
import {OryNodeInclusionsOdmService} from './ory-node-inclusions-odm.service'

/** One parent/child link. `OdmItem$2`'s generic `getParentIds()`/`getAncestorIds()` walk
 * `.parents` recursively assuming a single-parent tree - that doesn't hold here: the *item*
 * (`OryOdmItem$`) being linked never has its own `.parents` set (an item can be included under
 * several different parents at once, so it has no single ancestor chain of its own - see
 * `OryOdmItem$`'s doc comment). The ancestor chain that's actually meaningful is "root down to
 * this inclusion's parent item", and that's a property of *this specific inclusion/occurrence*,
 * not derivable generically - so `SupabaseTreeService` computes it client-side from the already-
 * correct, per-occurrence `TreeNode` ancestor path and sets it explicitly before saving. */
export class OryNodeInclusion$ extends OdmItem$2<
  OryNodeInclusion$,
  OryNodeInclusionData,
  OryNodeInclusionData,
  OryNodeInclusionsOdmService
> {
  /** Set by SupabaseTreeService before the first save - the item this inclusion is nested
   * under. */
  public explicitParentItemId?: OryNodeInclusionId

  /** Set by SupabaseTreeService before the first save - item ids from the tree root down to
   * (and including) explicitParentItemId, for this specific occurrence. */
  public explicitAncestorItemIds?: OryNodeInclusionId[]

  override getParentIds(): OryNodeInclusionId[] {
    return this.explicitParentItemId ? [this.explicitParentItemId] : []
  }

  override getAncestorIds(): OryNodeInclusionId[] {
    return this.explicitAncestorItemIds ?? []
  }
}
