import type {DbTreeListener} from './TreeListener'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'

// type-only - see the note in TreeListener.ts/SupabaseTreeService.ts: a real import here pulls
// in TreeModel.ts's heavy runtime chain (OryItem$ -> ... -> cell components -> CellComponent),
// which is fine only as long as nothing loads this file before that chain is fully defined.
import type {OryBaseTreeNode} from './TreeModel'

/* TODO: write new db code in such a way to not depend on tree-model stuff (e.g. pass ItemId (==string) instead of OryTreeNode) */
/* TODO: use ItemData and ItemInclusionData (== any) placeholder types instead of `any` */

export abstract class DbTreeService {

  // HARDCODED_ROOT_NODE_ITEM_ID = 'KarolNodesHardcoded2'
  // HARDCODED_ROOT_NODE_ITEM_ID = 'item_373328df-e59d-4b90-99e1-7e3eee5f50ef'
  HARDCODED_ROOT_NODE_ITEM_ID = 'item_5026a2c6-948c-4875-8ff4-762ca845ae93'

  /* TODO: should be called *create*, because it is a completely new node/item involving db, vs addChild just looks like tree-only operation */
  abstract addChildNode(parentNode: OryBaseTreeNode, newNode: OryBaseTreeNode): void

  abstract addAssociateSiblingAfterNode(
    parentNode: OryBaseTreeNode,
    nodeToAssociate: OryBaseTreeNode,
    associateAfterNode: OryBaseTreeNode | nullish
  ): void

  abstract loadNodesTree(listener: DbTreeListener): void

  abstract patchItemData(itemId: string, itemData: any): { onPatchSentToRemote: Promise<void> }

  abstract patchChildInclusionData(
    parentItemId: string,
    itemInclusionId: string,
    itemInclusionData: any,
    childItemId: string
  ): void

  // abstract patchChildInclusionDataWithNewParent(nodeInclusionId: string, newParentNode: OryTreeNode): void

  abstract deleteWithoutConfirmation(itemId: string): void

  /** Optional fast path: when navigating into a subtree, fetch just that subtree first (a
   * single `ancestor_ids`-`.contains()` query) so it paints quickly, layered on top of
   * `loadNodesTree`'s normal whole-tree cache-then-incremental-sync (which keeps running in the
   * background regardless, so the app stays offline-capable beyond just this subtree). Default
   * no-op - `loadNodesTree` alone is already a complete implementation (e.g. Firestore's
   * load-everything-upfront), this is purely an optimization some backends can opt into. */
  loadSubtreeFast(itemId: string): void {
  }

  /** Ensures a reserved/anchor item exists with at least these fields, without requiring it to
   * already be loaded/visible as a TreeNode - e.g. Mindfulness's `_mindfulness` tracking anchor,
   * which deliberately never appears in any tree/inclusion structure. Firestore's updateDoc()
   * (patchItemData) fails outright on a genuinely missing doc, unlike Supabase's upsert-on-every-
   * save semantics, so backends that don't need an explicit "ensure exists" step default to a
   * no-op here. */
  async upsertItemIfMissing(itemId: string, itemData: any): Promise<void> {
  }

  /** Ensures a reserved/anchor item (see upsertItemIfMissing) is actually visible as a normal
   * top-level tree node, by giving it a real inclusion under the tree root if it doesn't already
   * have one under any parent - e.g. Mindfulness's `_mindfulness` anchor (GH #27), which started
   * out deliberately invisible but was later asked to show up in the tree like any other item.
   * Default no-op, matching upsertItemIfMissing's convention - Firestore doesn't implement this
   * (it's the legacy/inactive OrYoL backend now that `environment.oryolTreeBackend` is
   * 'supabase'). Safe to call repeatedly. */
  async upsertRootInclusionIfMissing(itemId: string): Promise<void> {
  }

}

