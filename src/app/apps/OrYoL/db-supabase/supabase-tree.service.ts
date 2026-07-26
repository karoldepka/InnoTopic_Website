import {Injectable} from '@angular/core'
import {DbTreeService} from '../tree-model/db-tree-service'
import {NodeAddEvent, NodeInclusion} from '../tree-model/TreeListener'
import type {DbTreeListener} from '../tree-model/TreeListener'
// type-only: TreeModel.ts's runtime chain (OryItem$ -> TreeTableNodeContent -> Columns -> cell
// components) is heavy and, via db-firestore.module's eager DbTreeService factory, loads early
// enough to trip a latent circular dependency ("Class extends value undefined") if pulled in as
// a real import here - see the matching note in TreeListener.ts.
import type {OryBaseTreeNode, OryNonRootTreeNode} from '../tree-model/TreeModel'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {OryOdmItemsService} from './ory-odm-items.service'
import {OryOdmItem, OryOdmItemId} from './OryOdmItem'
import type {ItemId} from '../../../libs/AppFedShared/odm/OdmCollectionBackend'
import {odmTimestampToMillis} from '../../../libs/AppFedShared/odm/utils'

/** ODM/Supabase-backed `DbTreeService` - see the OrYoL tree migration plan. GH #89 unify-the-
 * tree-worlds: a parent-child relationship (`NodeInclusion` in old Firestore-era terms) is now
 * embedded directly on the child item (`OdmItem$2.inclusionsByParentId` - see its doc comment),
 * not a separate row in its own collection. This class's job is purely translating between that
 * single-collection world and the `DbTreeListener`/`NodeAddEvent` shape `TreeModel` already
 * expects, so `TreeModel`/`TreeNode`/every UI component under OrYoL needs zero changes. */
@Injectable({providedIn: 'root'})
export class SupabaseTreeService extends DbTreeService {

  // Fixed, not per-user - per-user separation comes from RLS/`owner` scoping on this same id,
  // exactly like OdmService2.treeRootItem ('_root_' + className) already does for Learn/Journal.
  // No auth-timing race, since this id doesn't depend on knowing the uid synchronously.
  override HARDCODED_ROOT_NODE_ITEM_ID = 'ory_root'

  // --- loadNodesTree() delivery-ordering state ---
  // TreeModel.onNodeAddedOrModified silently drops a relationship whose parent TreeNode isn't
  // registered yet, so items can't just be forwarded in arrival order (cache replay, incremental
  // sync, and realtime all deliver with no ordering guarantee). Re-run a fixed-point delivery
  // pass over everything currently known whenever the collection's local list changes, looping
  // each pass until reachability stops growing - a single linear pass can otherwise miss a child
  // whose relationship is iterated before its own parent becomes reachable within that same pass
  // (found via GH #89 Tier 2 testing: a brand-new node's own delivery could get stuck forever
  // since nothing ever re-triggered a follow-up pass once loading settled).
  private reachableItemIds = new Set<string>([this.HARDCODED_ROOT_NODE_ITEM_ID])
  /** Ancestor chain (root..self, inclusive) for every reachable item - needed by
   * patchChildInclusionData(), which only receives a parent *id* (not a TreeNode reference) so
   * can't compute a fresh chain the way addChildNode() can. */
  private ancestorChainByItemId = new Map<string, string[]>([[this.HARDCODED_ROOT_NODE_ITEM_ID, [this.HARDCODED_ROOT_NODE_ITEM_ID]]])
  /** Which parent id(s) each child was last delivered under - lets a routine redelivery be told
   * apart from a genuine reparent (single parent -> a different single parent), which needs
   * `onNodeInclusionModified` (relocate the existing node) rather than a second `onNodeAddedOrModified`
   * (which would leave the stale copy under the old parent, since nothing else ever removes it -
   * see the "onRemoved... ignoring" note in OdmService2.createBackendListener()). */
  private deliveredParentIdsByChildId = new Map<string, Set<string>>()
  /** `whenLastModified` (as millis) at the time each child was last delivered - lets a pass skip
   * re-delivering a node whose data genuinely hasn't changed since then (see its use in
   * flushDeliverable() below). Every real mutation path (patchNow/patchThrottled/saveNowToDb, via
   * setLastModifiedIfNecessary()) bumps whenLastModified, including inclusion-only changes
   * (setParentInclusion() is always immediately followed by one of those) - so this is a reliable
   * "did anything actually change" signal, not just a content-only one. */
  private lastDeliveredWhenLastModifiedMsByChildId = new Map<string, number | undefined>()
  private listener?: DbTreeListener
  private loadStarted = false

  /** `NodeInclusion.nodeInclusionId` needs to be stable across a plain reorder/no-op redelivery
   * (so it's found again the next pass) but distinguishable per (child, parent) pair once a child
   * has more than one parent simultaneously (multi-parent - the composite form). A single-parent
   * child (the overwhelming common case) keeps the plain child id as its inclusion id for its
   * whole life unless/until a second parent is added. */
  private static readonly COMPOSITE_ID_SEP = '::'

  constructor(
    public oryItemsService: OryOdmItemsService,
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
  }

  override loadSubtreeFast(itemId: string): void {
    // Same pipeline as the normal load (populates mapIdToItem$/localItems$, which
    // flushDeliverable is already subscribed to) - this just seeds it faster for one subtree via
    // a single ancestor_ids-contains() query, on top of the whole-tree background sync already
    // running from loadNodesTree().
    this.oryItemsService.odmCollectionBackend.loadTreeDescendantsOf(itemId as OryOdmItemId, this.oryItemsService.createBackendListener())
  }

  /** True when `childItemId` needs no redelivery this pass: same parent set as last delivered
   * (so not even a same-parent reorder - orderNum changes go through patchNow() too, see
   * lastDeliveredWhenLastModifiedMsByChildId's doc comment) and whenLastModified hasn't moved
   * since. Perf-only guard - every branch here fails open to "deliver" (parent-set check requires
   * a *prior* delivery to compare against; missing/tied whenLastModified never counts as
   * unchanged), so a bug here costs a redundant redelivery, never a missed one. Split out of
   * flushDeliverable() so this non-obvious "why is it safe to skip" reasoning has its own home,
   * separate from the delivery loop's own logic. */
  private isUnchangedSinceLastDelivery(childItemId: string, currentParentIds: string[], cleanSingleParentMove: boolean, whenLastModifiedMs: number | undefined): boolean {
    if (cleanSingleParentMove) {
      return false // always a genuine relocation - must go through onNodeInclusionModified
    }
    const previousParentIds = this.deliveredParentIdsByChildId.get(childItemId)
    const parentSetUnchanged = !!previousParentIds && previousParentIds.size === currentParentIds.length
      && currentParentIds.every(pid => previousParentIds.has(pid))
    return parentSetUnchanged
      && whenLastModifiedMs !== undefined
      && whenLastModifiedMs === this.lastDeliveredWhenLastModifiedMsByChildId.get(childItemId)
  }

  private flushDeliverable(): void {
    if (!this.listener) {
      return
    }
    let reachableSizeBeforePass: number
    do {
      reachableSizeBeforePass = this.reachableItemIds.size
      for (const item$ of this.oryItemsService.mapIdToItem$.values()) {
        const childItemId = item$.id as string
        const itemData = item$.val
        const inclusions = itemData?.inclusionsByParentId
        if (!itemData || !inclusions) {
          continue // item content hasn't arrived yet, or has no parent (e.g. the root itself)
        }
        const currentParentIds = Object.keys(inclusions).filter(pid => this.reachableItemIds.has(pid))
        if (currentParentIds.length === 0) {
          continue // parent(s) not registered as a TreeNode yet - retry on a later pass
        }

        const previousParentIds = this.deliveredParentIdsByChildId.get(childItemId)
        const useCompositeIds = currentParentIds.length > 1
        const cleanSingleParentMove = !useCompositeIds && previousParentIds?.size === 1 && !previousParentIds.has(currentParentIds[0])
        const whenLastModifiedMs = odmTimestampToMillis((itemData as any).whenLastModified)

        // GH: flushDeliverable() re-runs on *every* patch anywhere in the tree (it's the only
        // hook that can react to newly-reachable parents), so without this guard a single edit to
        // one item redelivers every other already-stable reachable node too - each redelivery
        // doing real work downstream (TreeModel change detection, onItemAddedOrModified$
        // subscribers) - causing tree-wide lag that scales with tree size on every keystroke.
        if (!this.isUnchangedSinceLastDelivery(childItemId, currentParentIds, cleanSingleParentMove, whenLastModifiedMs)) {
          for (const parentId of currentParentIds) {
            const orderNum = inclusions[parentId].orderNum
            const inclusionId = useCompositeIds ? childItemId + SupabaseTreeService.COMPOSITE_ID_SEP + parentId : childItemId
            const nodeInclusion = new NodeInclusion(inclusionId, parentId, orderNum)
            if (cleanSingleParentMove) {
              // Re-parented (a move) - TreeModel needs the dedicated inclusion-moved path, not
              // onNodeAddedOrModified, to actually relocate the existing node.
              this.listener.onNodeInclusionModified(inclusionId, nodeInclusion, parentId)
            } else {
              // First delivery, or a routine content/order refresh of an already-delivered node -
              // TreeModel.onNodeAddedOrModified handles both (see its "existingNodes" branch), same
              // as Firestore's onSnapshot repeatedly redelivering current state.
              this.listener.onNodeAddedOrModified(
                new NodeAddEvent([], parentId, itemData, childItemId, 0, nodeInclusion))
            }
          }
          this.lastDeliveredWhenLastModifiedMsByChildId.set(childItemId, whenLastModifiedMs)
        }
        this.deliveredParentIdsByChildId.set(childItemId, new Set(currentParentIds))
        this.reachableItemIds.add(childItemId)
        const anyParentId = currentParentIds[0]
        this.ancestorChainByItemId.set(childItemId, [...(this.ancestorChainByItemId.get(anyParentId) ?? [anyParentId]), childItemId])
      }
    } while (this.reachableItemIds.size > reachableSizeBeforePass)
  }

  deleteWithoutConfirmation(itemId: string): void {
    // Relationships live on the item itself now - deleting it (soft-delete, already excluded
    // from every fetch/listener automatically) is enough, no separate rows to clean up.
    this.oryItemsService.deleteWithoutConfirmationById(itemId as OryOdmItemId)
  }

  /** Unlike Firestore's updateDoc()-based patchItemData (which fails outright on a genuinely
   * missing doc), Supabase's saveNowToDb() is an upsert on every write - so any *subsequent*
   * patchItemData() call for this id would already create the row if needed. This still writes
   * eagerly rather than relying on that, so the anchor item's initial fields (e.g. Mindfulness's
   * title) are present from the start rather than only appearing after the first real patch.
   *
   * Must reuse the shared obtainItem$ById() instance (like every other method in this file) rather
   * than createOdmItem$()'ing a fresh, disconnected object: for a well-known fixed id (e.g.
   * Mindfulness's per-user anchor, see mindfulnessItemId()), the item is typically *already* loaded
   * via the tree's normal sync by the time this runs, so a second freestanding object for the same
   * id collides with the cached one in OdmService2._ensureItemAdded() (GH #125/#126 - surfaced live
   * via its errorAlert) and, worse, silently wins the write with only this call's minimal itemData,
   * clobbering whatever real fields (e.g. whenLastModifiedHistory) the existing row had already
   * accumulated. */
  override async upsertItemIfMissing(itemId: string, itemData: any): Promise<void> {
    await this.waitUntilItemsLoaded()
    const item$ = this.oryItemsService.obtainItem$ById(itemId as OryOdmItemId)
    if (item$.val) {
      return // already exists - don't clobber it with just this call's minimal itemData
    }
    item$.currentVal ??= {} as OryOdmItem
    item$.patchNow(itemData)
  }

  /** See DbTreeService.upsertRootInclusionIfMissing's doc comment. Waits for the items
   * collection's initial load (same reasoning as TimeTrackingPeriodsService.waitUntilLoaded) so a
   * call made right after app boot doesn't race an empty in-memory list and create a duplicate
   * relationship every time. */
  override async upsertRootInclusionIfMissing(itemId: string): Promise<void> {
    await this.waitUntilItemsLoaded()
    const item$ = this.oryItemsService.obtainItem$ById(itemId as OryOdmItemId)
    if (item$.getParentIds().length > 0) {
      return // already included somewhere
    }
    const rootItem$ = this.oryItemsService.obtainItem$ById(this.HARDCODED_ROOT_NODE_ITEM_ID as OryOdmItemId)
    item$.setParentInclusion(rootItem$, 0)
    item$.patchNow({})
  }

  private waitUntilItemsLoaded(): Promise<void> {
    if (this.oryItemsService.itemsLoaded) {
      return Promise.resolve()
    }
    return new Promise<void>(resolve => {
      this.oryItemsService.localItems$.subscribe(() => {
        if (this.oryItemsService.itemsLoaded) {
          resolve()
        }
      })
    })
  }

  addChildNode(parentNode: OryBaseTreeNode, newNode: OryNonRootTreeNode): void {
    // OdmItem$2.saveNowToDb() already tracks its own sync-status promise internally
    // (OdmService2.saveNowToDb -> syncStatusService.handleSavingPromise) - nothing more to do
    // here.
    const item$ = this.oryItemsService.createOdmItem$(newNode.itemId as OryOdmItemId, Object.assign(new OryOdmItem(), newNode.content.itemData))
    const parentItem$ = this.oryItemsService.obtainItem$ById(parentNode.itemId as OryOdmItemId)
    item$.setParentInclusion(parentItem$, newNode.nodeInclusion?.orderNum ?? 0)
    item$.saveNowToDb()
  }

  addAssociateSiblingAfterNode(parentNode: OryBaseTreeNode, nodeToAssociate: OryNonRootTreeNode, associateAfterNode: OryNonRootTreeNode | nullish): void {
    // The item already exists (this links it under an *additional* parent) - patch, don't
    // re-save the whole document.
    const item$ = this.oryItemsService.obtainItem$ById(nodeToAssociate.itemId as OryOdmItemId)
    const parentItem$ = this.oryItemsService.obtainItem$ById(parentNode.itemId as OryOdmItemId)
    item$.setParentInclusion(parentItem$, nodeToAssociate.nodeInclusion?.orderNum ?? 0)
    item$.patchNow({})
  }

  /** Creates a real relationship for an `OryOdmItem` that already exists (created directly
   * through the generic ODM system, not via `TreeModel`'s own `addChild()`/
   * `addAssociationsHere()`) - GH #89's unify-the-tree-worlds Tier 2: a voice-memo-created bare-
   * slot child (`FieldVoiceMemoChildController`) additionally becomes an ordinary row in OrYoL's
   * own primary tree, not just grouped under its field in whatever popover created it. Always
   * appended last among `parentNode`'s current children (no `afterExistingNode` concept here -
   * the caller has no `OryNonRootTreeNode` to place it relative to, only a plain item id). */
  createInclusionForExistingItem(parentNode: OryBaseTreeNode, childItemId: string): void {
    const item$ = this.oryItemsService.obtainItem$ById(childItemId as OryOdmItemId)
    const parentItem$ = this.oryItemsService.obtainItem$ById(parentNode.itemId as OryOdmItemId)
    const lastOrderNum = Math.max(0, ...parentNode.children.map(child => child.nodeInclusion?.orderNum ?? 0))
    item$.setParentInclusion(parentItem$, lastOrderNum + 1_000_000)
    item$.patchNow({})
  }

  /** Awaitable one-shot write of a single already-loaded (Firestore-sourced) node - used by
   * `OryolFirestoreBackfillService` to migrate the whole tree. Unlike `addChildNode()` (fire-and-
   * forget, for live UI-driven creation, which doesn't return a promise since
   * `OdmItem$2.saveNowToDb()` tracks its own sync-status internally instead), this calls the
   * collection backend directly so the backfill can await it, bound concurrency, and report
   * accurate progress. Reuses the *existing* id/orderNum from the loaded node rather than
   * generating new ones, so it's an upsert - safe to re-run, and correlates 1:1 with the source
   * Firestore data (owner/whenCreated/whenLastModified are also preserved as-is from
   * `node.content.itemData`, or set by the backend the same way a fresh save would).
   *
   * `parentNode`/its ancestors come from the *Firestore-backed* tree being walked, whose root
   * has Firestore's own hardcoded root item id (`DbTreeService.HARDCODED_ROOT_NODE_ITEM_ID`) -
   * not this service's own `'ory_root'`. Every real (non-root) item keeps the same id across
   * both backends, but the synthetic root id itself differs, so it must be remapped wherever it
   * appears in the relationship/ancestor chain - otherwise every top-level node (and everything
   * under it) would be written with a parent id that never matches 'ory_root', and the whole
   * migrated tree would sit permanently unreachable once the Supabase backend is live. */
  async backfillNode(parentNode: OryBaseTreeNode, node: OryNonRootTreeNode): Promise<void> {
    const remappedParentId = this.remapSourceRootItemId(parentNode)
    const ancestorIds = [
      ...parentNode.getAncestorsPathArray().map(n => this.remapSourceRootItemId(n)),
      remappedParentId,
    ]
    const itemData: any = Object.assign(new OryOdmItem(), node.content.itemData)
    itemData.inclusionsByParentId = {[remappedParentId]: {orderNum: node.nodeInclusion?.orderNum ?? 0}}

    await this.oryItemsService.odmCollectionBackend.saveNowToDb(
      itemData, node.itemId as ItemId, [remappedParentId] as ItemId[], ancestorIds as ItemId[])
  }

  /** The source (Firestore) tree's root node has that tree's own hardcoded root id, not this
   * service's `'ory_root'` - every other node keeps its real id unchanged across backends. */
  private remapSourceRootItemId(node: {itemId: string, parent2?: unknown}): string {
    return node.parent2 ? node.itemId : this.HARDCODED_ROOT_NODE_ITEM_ID
  }

  patchItemData(itemId: string, itemData: any): { onPatchSentToRemote: Promise<void> } {
    const item$ = this.oryItemsService.obtainItem$ById(itemId as OryOdmItemId)
    item$.patchNow(itemData)
    return {onPatchSentToRemote: Promise.resolve()}
  }

  /** `itemInclusionId` is whatever `flushDeliverable()` last handed out as this node's
   * `nodeInclusionId` (see its doc comment above `COMPOSITE_ID_SEP`) - stable across a move, so
   * splitting off its parent-id suffix (when composite) reliably identifies which specific
   * parent-relationship is being moved/reordered, even for a multi-parent item. */
  patchChildInclusionData(parentItemId: string, itemInclusionId: string, itemInclusionData: NodeInclusion, childItemId: string): void {
    const item$ = this.oryItemsService.obtainItem$ById(childItemId as OryOdmItemId)
    const newParentId = itemInclusionData.parentItemId ?? parentItemId
    const currentParentIds = item$.getParentIds() as string[]
    // Single current parent (the overwhelming common case): that's unambiguously the one being
    // moved away from, regardless of whether nodeInclusionId happens to be composite. Only a
    // genuinely multi-parent item needs the composite id to disambiguate *which* parent-
    // relationship this specific move refers to.
    const compositePrefix = childItemId + SupabaseTreeService.COMPOSITE_ID_SEP
    const oldParentId = currentParentIds.length === 1
      ? currentParentIds[0]
      : (itemInclusionId.startsWith(compositePrefix) ? itemInclusionId.slice(compositePrefix.length) : undefined)
    if (oldParentId && oldParentId !== newParentId) {
      item$.removeParentInclusion(oldParentId)
    }
    const parentItem$ = this.oryItemsService.obtainItem$ById(newParentId as OryOdmItemId)
    item$.setParentInclusion(parentItem$, itemInclusionData.orderNum ?? 0)
    item$.patchNow({})
  }
}
