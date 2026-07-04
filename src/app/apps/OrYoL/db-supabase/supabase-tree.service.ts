import {Injectable} from '@angular/core'
import {DbTreeService} from '../tree-model/db-tree-service'
import {NodeAddEvent, NodeInclusion} from '../tree-model/TreeListener'
import type {DbTreeListener} from '../tree-model/TreeListener'
// type-only: TreeModel.ts's runtime chain (OryItem$ -> TreeTableNodeContent -> Columns -> cell
// components) is heavy and, via db-firestore.module's eager DbTreeService factory, loads early
// enough to trip a latent circular dependency ("Class extends value undefined") if pulled in as
// a real import here - see the matching note in TreeListener.ts. generateNewInclusionId is
// trivial enough to inline below rather than value-import TreeModel.ts just for it.
import type {OryBaseTreeNode, OryNonRootTreeNode} from '../tree-model/TreeModel'
import {uuidv4} from '../../../libs/AppFedShared/utils/utils-from-oryol'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {OryOdmItemsService} from './ory-odm-items.service'
import {OryNodeInclusionsOdmService} from './ory-node-inclusions-odm.service'
import {OryOdmItem, OryOdmItemId} from './OryOdmItem'
import {OryNodeInclusion$} from './OryNodeInclusion$'
import {OryNodeInclusionId} from './OryNodeInclusionData'
import type {ItemId} from '../../../libs/AppFedShared/odm/OdmCollectionBackend'

/** ODM/Supabase-backed `DbTreeService` - see the OrYoL tree migration plan. Storage is split
 * across two ODM collections (`OryOdmItemsService`/`OryNodeInclusionsOdmService`); this class's
 * job is purely translating between that flat, collection-based world and the
 * `DbTreeListener`/`NodeAddEvent` shape `TreeModel` already expects, so `TreeModel`/`TreeNode`/
 * every UI component under OrYoL needs zero changes. */
@Injectable({providedIn: 'root'})
export class SupabaseTreeService extends DbTreeService {

  // Fixed, not per-user - per-user separation comes from RLS/`owner` scoping on this same id,
  // exactly like OdmService2.treeRootItem ('_root_' + className) already does for Learn/Journal.
  // No auth-timing race, since this id doesn't depend on knowing the uid synchronously.
  override HARDCODED_ROOT_NODE_ITEM_ID = 'ory_root'

  // --- loadNodesTree() delivery-ordering state ---
  // TreeModel.onNodeAddedOrModified silently drops an inclusion whose parent TreeNode isn't
  // registered yet, so inclusions can't just be forwarded in arrival order (cache replay,
  // incremental sync, and realtime all deliver with no ordering guarantee, especially with
  // multi-parent items). Re-run a fixed-point delivery pass over everything currently known
  // whenever either collection's local list changes - simple and correct regardless of arrival
  // order; an O(items) rescan per batch is fine at OrYoL's scale.
  private reachableItemIds = new Set<string>([this.HARDCODED_ROOT_NODE_ITEM_ID])
  /** Ancestor chain (root..self, inclusive) for every reachable item - needed by
   * patchChildInclusionData(), which only receives a parent *id* (not a TreeNode reference) so
   * can't compute a fresh chain the way createInclusion() does. */
  private ancestorChainByItemId = new Map<string, string[]>([[this.HARDCODED_ROOT_NODE_ITEM_ID, [this.HARDCODED_ROOT_NODE_ITEM_ID]]])
  private deliveredParentIdByInclusionId = new Map<string, string>()
  private listener?: DbTreeListener
  private loadStarted = false

  constructor(
    public oryItemsService: OryOdmItemsService,
    public oryNodeInclusionsService: OryNodeInclusionsOdmService,
  ) {
    super()
  }

  loadNodesTree(listener: DbTreeListener): void {
    this.listener = listener
    if (this.loadStarted) {
      this.flushDeliverable()
      return
    }
    this.loadStarted = true
    this.oryItemsService.localItems$.subscribe(() => this.flushDeliverable())
    this.oryNodeInclusionsService.localItems$.subscribe(() => this.flushDeliverable())
  }

  override loadSubtreeFast(itemId: string): void {
    // Same pipeline as the normal load (populates mapIdToItem$/localItems$, which
    // flushDeliverable is already subscribed to) - this just seeds it faster for one subtree via
    // a single ancestor_ids-contains() query, on top of the whole-tree background sync already
    // running from loadNodesTree().
    this.oryItemsService.odmCollectionBackend.loadTreeDescendantsOf(itemId as OryOdmItemId, this.oryItemsService.createBackendListener())
    this.oryNodeInclusionsService.odmCollectionBackend.loadTreeDescendantsOf(itemId as OryNodeInclusionId, this.oryNodeInclusionsService.createBackendListener())
  }

  private flushDeliverable(): void {
    if (!this.listener) {
      return
    }
    for (const inclusion$ of this.oryNodeInclusionsService.mapIdToItem$.values()) {
      const inclusionId = inclusion$.id as string
      const data = inclusion$.val
      const parentId = data?.parentIds?.[0]
      const childItemId = data?.childItemId
      if (!data || !parentId || !childItemId) {
        continue // inclusion data hasn't arrived/finished loading yet
      }
      if (!this.reachableItemIds.has(parentId)) {
        continue // parent not registered as a TreeNode yet - retry on a later pass
      }
      const childItem = this.oryItemsService.mapIdToItem$.get(childItemId as OryOdmItemId)?.val
      if (!childItem) {
        continue // item content hasn't arrived yet
      }

      const previousParentId = this.deliveredParentIdByInclusionId.get(inclusionId)
      const nodeInclusion = new NodeInclusion(inclusionId, parentId, data.orderNum)

      if (previousParentId !== undefined && previousParentId !== parentId) {
        // Re-parented (a move) - TreeModel needs the dedicated inclusion-moved path, not
        // onNodeAddedOrModified, to actually relocate the existing node.
        this.listener.onNodeInclusionModified(inclusionId, nodeInclusion, parentId)
      } else {
        // First delivery, or a routine content/order refresh of an already-delivered node -
        // TreeModel.onNodeAddedOrModified handles both (see its "existingNodes" branch), same
        // as Firestore's onSnapshot repeatedly redelivering current state.
        this.listener.onNodeAddedOrModified(
          new NodeAddEvent([], parentId, childItem, childItemId, 0, nodeInclusion))
      }
      this.deliveredParentIdByInclusionId.set(inclusionId, parentId)
      this.reachableItemIds.add(childItemId)
      this.ancestorChainByItemId.set(childItemId, [...(this.ancestorChainByItemId.get(parentId) ?? [parentId]), childItemId])
    }
  }

  deleteWithoutConfirmation(itemId: string): void {
    this.oryItemsService.deleteWithoutConfirmationById(itemId as OryOdmItemId)
    // Also drop every inclusion that references this item as a child, across every parent it
    // was included under.
    for (const inclusion$ of this.oryNodeInclusionsService.mapIdToItem$.values()) {
      if (inclusion$.val?.childItemId === itemId) {
        this.oryNodeInclusionsService.deleteWithoutConfirmationById(inclusion$.id as OryNodeInclusionId)
      }
    }
  }

  addChildNode(parentNode: OryBaseTreeNode, newNode: OryNonRootTreeNode): void {
    // OdmItem$2.saveNowToDb() already tracks its own sync-status promise internally
    // (OdmService2.saveNowToDb -> syncStatusService.handleSavingPromise) - nothing more to do
    // here for either save.
    const item$ = this.oryItemsService.createOdmItem$(newNode.itemId as OryOdmItemId, Object.assign(new OryOdmItem(), newNode.content.itemData))
    item$.saveNowToDb()

    this.createInclusion(parentNode, newNode).saveNowToDb()
  }

  addAssociateSiblingAfterNode(parentNode: OryBaseTreeNode, nodeToAssociate: OryNonRootTreeNode, associateAfterNode: OryNonRootTreeNode | nullish): void {
    this.createInclusion(parentNode, nodeToAssociate).saveNowToDb()
  }

  private createInclusion(parentNode: OryBaseTreeNode, node: OryNonRootTreeNode): OryNodeInclusion$ {
    const nodeInclusionId = (node.nodeInclusion?.nodeInclusionId ?? ('inclusion_' + uuidv4())) as OryNodeInclusionId
    const inclusion$ = this.oryNodeInclusionsService.createOdmItem$(nodeInclusionId, {
      childItemId: node.itemId,
      orderNum: node.nodeInclusion?.orderNum,
    } as any)
    inclusion$.explicitParentItemId = parentNode.itemId as OryNodeInclusionId
    inclusion$.explicitAncestorItemIds = this.ancestorItemIdsOf(parentNode)
    return inclusion$
  }

  /** Awaitable one-shot write of a single already-loaded (Firestore-sourced) node's item +
   * inclusion - used by `OryolFirestoreBackfillService` to migrate the whole tree. Unlike
   * `addChildNode()` (fire-and-forget, for live UI-driven creation, which doesn't return a
   * promise since `OdmItem$2.saveNowToDb()` tracks its own sync-status internally instead), this
   * calls the collection backends directly so the backfill can await it, bound concurrency, and
   * report accurate progress. Reuses the *existing* ids/orderNum from the loaded node rather than
   * generating new ones, so it's an upsert - safe to re-run, and correlates 1:1 with the source
   * Firestore data (owner/whenCreated/whenLastModified are also preserved as-is from
   * `node.content.itemData`, or set by the backend the same way a fresh save would).
   *
   * `parentNode`/its ancestors come from the *Firestore-backed* tree being walked, whose root
   * has Firestore's own hardcoded root item id (`DbTreeService.HARDCODED_ROOT_NODE_ITEM_ID`) -
   * not this service's own `'ory_root'`. Every real (non-root) item keeps the same id across
   * both backends, but the synthetic root id itself differs, so it must be remapped wherever it
   * appears in parent_ids/ancestor_ids - otherwise every top-level node (and everything under
   * it) would be written with a parent id that never matches 'ory_root', and the whole migrated
   * tree would sit permanently unreachable once the Supabase backend is live. */
  async backfillNode(parentNode: OryBaseTreeNode, node: OryNonRootTreeNode): Promise<void> {
    const itemData = Object.assign(new OryOdmItem(), node.content.itemData)
    const nodeInclusionId = (node.nodeInclusion?.nodeInclusionId ?? ('inclusion_' + uuidv4())) as OryNodeInclusionId
    const inclusionData: any = {
      childItemId: node.itemId,
      orderNum: node.nodeInclusion?.orderNum,
    }
    const remappedParentId = this.remapSourceRootItemId(parentNode) as OryNodeInclusionId
    const ancestorIds = [
      ...parentNode.getAncestorsPathArray().map(n => this.remapSourceRootItemId(n) as OryNodeInclusionId),
      remappedParentId,
    ]

    await Promise.all([
      this.oryItemsService.odmCollectionBackend.saveNowToDb(itemData as any, node.itemId as ItemId, [], []),
      this.oryNodeInclusionsService.odmCollectionBackend.saveNowToDb(inclusionData, nodeInclusionId as ItemId, [remappedParentId as ItemId], ancestorIds as ItemId[]),
    ])
  }

  /** The source (Firestore) tree's root node has that tree's own hardcoded root id, not this
   * service's `'ory_root'` - every other node keeps its real id unchanged across backends. */
  private remapSourceRootItemId(node: {itemId: string, parent2?: unknown}): string {
    return node.parent2 ? node.itemId : this.HARDCODED_ROOT_NODE_ITEM_ID
  }

  private ancestorItemIdsOf(node: OryBaseTreeNode): OryNodeInclusionId[] {
    return [
      ...node.getAncestorsPathArray().map(n => n.itemId as OryNodeInclusionId),
      node.itemId as OryNodeInclusionId,
    ]
  }

  patchItemData(itemId: string, itemData: any): { onPatchSentToRemote: Promise<void> } {
    const item$ = this.oryItemsService.obtainItem$ById(itemId as OryOdmItemId)
    item$.patchNow(itemData)
    return {onPatchSentToRemote: Promise.resolve()}
  }

  patchChildInclusionData(parentItemId: string, itemInclusionId: string, itemInclusionData: NodeInclusion, childItemId: string): void {
    const inclusion$ = this.oryNodeInclusionsService.obtainItem$ById(itemInclusionId as OryNodeInclusionId)
    const newParentId = itemInclusionData.parentItemId ?? parentItemId
    inclusion$.explicitParentItemId = newParentId as OryNodeInclusionId
    // ancestorChainByItemId is populated as nodes are delivered (flushDeliverable) - the new
    // parent is necessarily already-delivered/visible for the user to have moved this node onto
    // it, so its chain is already known here.
    inclusion$.explicitAncestorItemIds = (this.ancestorChainByItemId.get(newParentId) ?? [newParentId]) as OryNodeInclusionId[]
    inclusion$.patchNow({
      childItemId,
      orderNum: itemInclusionData.orderNum,
    } as any)
  }
}
