import {describe, it, expect, beforeEach} from 'vitest'
import {Injector} from '@angular/core'
import {OdmBackend} from '../../../libs/AppFedShared/odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../../libs/AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../../libs/AppFedShared/odm/OdmItemId'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {AuthService} from '../../../auth/auth.service'
import {SyncStatusService} from '../../../libs/AppFedShared/odm/sync-status.service'
import {ApfGeoLocationService} from '../../../libs/AppFedShared/geo-location/apf-geo-location.service'
import {BrowserOdmStorage} from '../../../libs/AppFedSharedBrowser/odm-browser/BrowserOdmStorage'
import {DbTreeListener, NodeAddEvent, NodeInclusion} from '../tree-model/TreeListener'
import {OryOdmItemsService} from './ory-odm-items.service'
import {OryNodeInclusionsOdmService} from './ory-node-inclusions-odm.service'
import {SupabaseTreeService} from './supabase-tree.service'
import {OryolFirestoreBackfillService} from './oryol-firestore-backfill.service'

/** In-memory fake standing in for a real OdmCollectionBackend (Supabase/Browser) - stores raw
 * item data plus parent_ids/ancestor_ids the same way a real backend round-trips them (see
 * PostgresOdmRow.rawFromPostgresOdmRow), so SupabaseTreeService sees the same shape it would
 * against a real backend. */
class FakeOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  storedItems = new Map<string, any>()
  saveNowToDbCalls: Array<{id: string, item: any}> = []

  /** Simulates a network-down/connection-interrupted backend: every saveNowToDb rejects until
   * this is cleared. Set/clear mid-test to simulate "offline, then back online". */
  shouldFailSave = false

  async saveNowToDb(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    this.saveNowToDbCalls.push({id: id as string, item})
    if (this.shouldFailSave) {
      throw new Error('simulated network failure')
    }
    const merged = {...(item as any), parentIds: parentIds ?? [], ancestorIds: ancestorIds ?? []}
    this.storedItems.set(id as string, merged)
    this.pushRealtime(id as string, merged)
    return {ok: true}
  }

  async deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    if (this.shouldFailSave) {
      throw new Error('simulated network failure')
    }
    this.storedItems.delete(itemId as string)
  }

  override setListener(listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>, queryOpts: QueryOpts, callback: () => void): void {
    super.setListener(listener, queryOpts, callback)
    for (const [id, item] of this.storedItems) {
      listener.onAdded(id as unknown as OdmItemId<TRaw>, item)
    }
    listener.onFinishedProcessingChangeSet()
    callback?.()
  }

  loadChildrenOf(parentId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    for (const [id, item] of this.storedItems) {
      if (item.parentIds?.includes(parentId)) {
        listener.onAdded(id as unknown as OdmItemId<TRaw>, item)
      }
    }
    listener.onFinishedProcessingChangeSet()
  }

  loadTreeDescendantsOf(ancestorId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    for (const [id, item] of this.storedItems) {
      if (item.ancestorIds?.includes(ancestorId)) {
        listener.onAdded(id as unknown as OdmItemId<TRaw>, item)
      }
    }
    listener.onFinishedProcessingChangeSet()
  }

  /** Simulates the item already being present remotely - independent of saveNowToDb. If a
   * listener is already attached (OdmService2's own setListener() already ran, which happens
   * synchronously in its constructor - real construction order, not a test artifact), also
   * pushes it as a realtime-style event so it's actually seen, matching how a real backend
   * would deliver a row that appeared after the initial snapshot. */
  seed(id: string, item: any, parentIds: string[] = [], ancestorIds: string[] = []): void {
    const merged = {...item, parentIds, ancestorIds}
    this.storedItems.set(id, merged)
    this.pushRealtime(id, merged)
  }

  private pushRealtime(id: string, item: any): void {
    if (this.listener) {
      this.listener.onAdded(id as unknown as OdmItemId<TRaw>, item)
      this.listener.onFinishedProcessingChangeSet()
    }
  }
}

function fakeOdmBackend(backends: Map<string, FakeOdmCollectionBackend<any>>): OdmBackend {
  const odmBackend: OdmBackend = {
    backendReady$: new CachedSubject<boolean>(true),
    createCollectionBackend: (injector: Injector, className: string) => {
      const backend = new FakeOdmCollectionBackend<any>(injector, className, odmBackend)
      backends.set(className, backend)
      return backend
    },
  } as unknown as OdmBackend
  return odmBackend
}

/** Records pending edits in memory (unlike a stub returning empty arrays), so offline/durable-
 * journal behavior (does a failed save get journaled? does it get cleared once confirmed?) is
 * actually observable in tests, not just assumed. */
class FakeBrowserOdmStorage {
  pendingEdits = new Map<string, {collection: string, item_id: string, patch: any, whenLastModified: string}>()
  pendingEditsChanged$ = new CachedSubject<void>(undefined as any)

  async getAllPendingEdits(collection: string) {
    return Array.from(this.pendingEdits.values()).filter(e => e.collection === collection)
  }

  async getAllPendingEditsEverywhere() {
    return Array.from(this.pendingEdits.values())
  }

  async savePendingEdit(collection: string, itemId: string, patch: any, whenLastModified: string) {
    this.pendingEdits.set(`${collection}::${itemId}`, {collection, item_id: itemId, patch, whenLastModified})
  }

  async clearPendingEdit(collection: string, itemId: string) {
    this.pendingEdits.delete(`${collection}::${itemId}`)
  }

  async get() {
    return undefined
  }
}

function createFakeInjector(backends: Map<string, FakeOdmCollectionBackend<any>>, browserOdmStorage: FakeBrowserOdmStorage = new FakeBrowserOdmStorage()): Injector {
  const authService = {authUser$: new CachedSubject<{uid: string} | null>({uid: 'owner1'})}
  const syncStatusService = {
    handleSavingPromise: () => undefined,
    handleUnsavedPromise: () => undefined,
    addPendingDownload: () => undefined,
    removePendingDownload: () => undefined,
  }
  const geoLocationService = {geoLocation$: new CachedSubject<any>(undefined)}
  const odmBackend = fakeOdmBackend(backends)
  const providers = new Map<any, any>([
    [OdmBackend, odmBackend],
    [AuthService, authService],
    [SyncStatusService, syncStatusService],
    [ApfGeoLocationService, geoLocationService],
    [BrowserOdmStorage, browserOdmStorage],
  ])
  const injector = {
    get: (token: any) => {
      if (!providers.has(token)) {
        throw new Error(`No fake registered for token: ${token?.name ?? token}`)
      }
      return providers.get(token)
    },
  } as Injector
  return injector
}

/** Records everything SupabaseTreeService delivers, keyed by nodeInclusionId, mirroring the
 * bits of TreeModel.onNodeAddedOrModified/onNodeInclusionModified relevant to these tests -
 * without needing a real TreeModel/TreeNode tree. */
class RecordingDbTreeListener implements DbTreeListener {
  addedOrModified: NodeAddEvent[] = []
  inclusionModified: Array<{nodeInclusionId: string, data: any, newParentItemId: string}> = []

  onNodeAddedOrModified(e: NodeAddEvent): void {
    this.addedOrModified.push(e)
  }

  onNodeInclusionModified(nodeInclusionId: string, nodeInclusionData: any, newParentItemId: string): void {
    this.inclusionModified.push({nodeInclusionId, data: nodeInclusionData, newParentItemId})
  }
}

function setup() {
  const backends = new Map<string, FakeOdmCollectionBackend<any>>()
  const browserOdmStorage = new FakeBrowserOdmStorage()
  const injector = createFakeInjector(backends, browserOdmStorage)
  const oryItemsService = new OryOdmItemsService(injector)
  const oryNodeInclusionsService = new OryNodeInclusionsOdmService(injector)
  const treeService = new SupabaseTreeService(oryItemsService, oryNodeInclusionsService)
  const itemsBackend = backends.get('OryItem') as FakeOdmCollectionBackend<any>
  const inclusionsBackend = backends.get('OryNodeInclusion') as FakeOdmCollectionBackend<any>
  const listener = new RecordingDbTreeListener()
  return {treeService, oryItemsService, oryNodeInclusionsService, itemsBackend, inclusionsBackend, listener, browserOdmStorage}
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('SupabaseTreeService.loadNodesTree - delivery ordering', () => {
  it('delivers a direct child of the root immediately', async () => {
    const {treeService, itemsBackend, inclusionsBackend, listener} = setup()
    itemsBackend.seed('child1', {title: 'Child'})
    inclusionsBackend.seed('inclusion1', {childItemId: 'child1', orderNum: 1}, [treeService.HARDCODED_ROOT_NODE_ITEM_ID], [treeService.HARDCODED_ROOT_NODE_ITEM_ID])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    // A node may legitimately be redelivered more than once (e.g. once per collection's
    // CachedSubject replaying on subscribe) - TreeModel.onNodeAddedOrModified's existing-node
    // branch is idempotent-safe for that, same as Firestore's onSnapshot repeatedly redelivering
    // current state. What matters: it was delivered, with the right parent, and never dropped.
    const childEvents = listener.addedOrModified.filter(e => e.itemId === 'child1')
    expect(childEvents.length).toBeGreaterThan(0)
    expect(childEvents.every(e => e.directParentItemId === treeService.HARDCODED_ROOT_NODE_ITEM_ID)).toBe(true)
  })

  it('delivers a grandchild whose parent inclusion arrives after it, in parent-before-child order once both are known', async () => {
    const {treeService, itemsBackend, inclusionsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    // Seed out of order: grandchild's own item + inclusion arrive fully before the parent's.
    itemsBackend.seed('grandchild1', {title: 'Grandchild'})
    inclusionsBackend.seed('inclusionGrandchild', {childItemId: 'grandchild1', orderNum: 1}, ['child1'], ['child1'])
    itemsBackend.seed('child1', {title: 'Child'})
    inclusionsBackend.seed('inclusionChild', {childItemId: 'child1', orderNum: 1}, [root], [root])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    const deliveredIds = listener.addedOrModified.map(e => e.itemId)
    expect(deliveredIds).toContain('child1')
    expect(deliveredIds).toContain('grandchild1')
    expect(deliveredIds.indexOf('child1')).toBeLessThan(deliveredIds.indexOf('grandchild1'))
  })

  it('does not deliver an inclusion whose parent has not arrived yet', async () => {
    const {treeService, itemsBackend, inclusionsBackend, listener} = setup()
    itemsBackend.seed('orphan1', {title: 'Orphan'})
    inclusionsBackend.seed('inclusionOrphan', {childItemId: 'orphan1', orderNum: 1}, ['missingParent'], ['missingParent'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    expect(listener.addedOrModified).toEqual([])
  })

  it('a later-arriving parent flushes its previously-buffered children', async () => {
    const {treeService, itemsBackend, inclusionsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    itemsBackend.seed('grandchild1', {title: 'Grandchild'})
    inclusionsBackend.seed('inclusionGrandchild', {childItemId: 'grandchild1', orderNum: 1}, ['child1'], ['child1'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()
    expect(listener.addedOrModified.map(e => e.itemId)).not.toContain('grandchild1')

    // Parent arrives afterwards (e.g. a slower incremental-sync page).
    itemsBackend.seed('child1', {title: 'Child'})
    inclusionsBackend.seed('inclusionChild', {childItemId: 'child1', orderNum: 1}, [root], [root])
    treeService.loadNodesTree(listener) // re-entrant call, as ngOnInit-driven re-subscription would be
    await flushMicrotasks()

    expect(listener.addedOrModified.map(e => e.itemId)).toEqual(expect.arrayContaining(['child1', 'grandchild1']))
  })

  it('the same item included under two different parents is delivered as two separate inclusions, each with its own orderNum', async () => {
    const {treeService, itemsBackend, inclusionsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    itemsBackend.seed('parentA', {title: 'Parent A'})
    itemsBackend.seed('parentB', {title: 'Parent B'})
    inclusionsBackend.seed('inclusionA', {childItemId: 'parentA', orderNum: 1}, [root], [root])
    inclusionsBackend.seed('inclusionB', {childItemId: 'parentB', orderNum: 2}, [root], [root])

    itemsBackend.seed('shared1', {title: 'Shared item'})
    inclusionsBackend.seed('inclusionSharedUnderA', {childItemId: 'shared1', orderNum: 5}, ['parentA'], ['parentA'])
    inclusionsBackend.seed('inclusionSharedUnderB', {childItemId: 'shared1', orderNum: 9}, ['parentB'], ['parentB'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    const sharedEvents = listener.addedOrModified.filter(e => e.itemId === 'shared1')
    // Redundant redelivery of the *same* (itemId, parent) pair is fine (see the comment in the
    // previous test) - what must hold is that both distinct parent occurrences are represented,
    // each with its own independent orderNum.
    const distinctParents = new Set(sharedEvents.map(e => e.directParentItemId))
    expect(distinctParents).toEqual(new Set(['parentA', 'parentB']))
    const orderNumsByParent = Object.fromEntries(sharedEvents.map(e => [e.directParentItemId, e.nodeInclusion.orderNum]))
    expect(orderNumsByParent['parentA']).toBe(5)
    expect(orderNumsByParent['parentB']).toBe(9)
  })

  it('a re-parented inclusion is delivered via onNodeInclusionModified, not a duplicate onNodeAddedOrModified', async () => {
    const {treeService, itemsBackend, inclusionsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    itemsBackend.seed('parentA', {title: 'Parent A'})
    itemsBackend.seed('parentB', {title: 'Parent B'})
    inclusionsBackend.seed('inclusionA', {childItemId: 'parentA', orderNum: 1}, [root], [root])
    inclusionsBackend.seed('inclusionB', {childItemId: 'parentB', orderNum: 2}, [root], [root])
    itemsBackend.seed('movable1', {title: 'Movable'})
    inclusionsBackend.seed('inclusionMovable', {childItemId: 'movable1', orderNum: 1}, ['parentA'], ['parentA'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()
    expect(listener.addedOrModified.some(e => e.itemId === 'movable1' && e.directParentItemId === 'parentA')).toBe(true)
    const addedOrModifiedCountBeforeMove = listener.addedOrModified.length

    // Re-parent movable1's inclusion from parentA to parentB.
    inclusionsBackend.seed('inclusionMovable', {childItemId: 'movable1', orderNum: 1}, ['parentB'], ['parentB'])
    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    // The move must actually go through onNodeInclusionModified (the only path TreeModel uses
    // to relocate an existing node) with the correct new parent.
    expect(listener.inclusionModified.length).toBeGreaterThan(0)
    expect(listener.inclusionModified[0]).toMatchObject({nodeInclusionId: 'inclusionMovable', newParentItemId: 'parentB'})
    // Once moved, any *new* onNodeAddedOrModified redelivery (routine/idempotent, see the
    // earlier test) must reflect the new parent, not the stale one - only look at events added
    // after the move, since the pre-move parentA event legitimately stays in history.
    const eventsAfterMove = listener.addedOrModified.slice(addedOrModifiedCountBeforeMove)
    expect(eventsAfterMove.every(e => !(e.itemId === 'movable1' && e.directParentItemId === 'parentA'))).toBe(true)
  })
})

/** Minimal duck-typed stand-in for an OryBaseTreeNode/OryNonRootTreeNode - only the surface
 * SupabaseTreeService actually reads (itemId, content.itemData, nodeInclusion, parent2,
 * getAncestorsPathArray()). Building a real TreeModel/TreeNode here would drag in most of
 * OrYoL's tree layer just to get a node reference. `ancestors` is root-first (ancestors[0] is
 * the tree root); a real parent2 chain is built so `remapSourceRootItemId()` (which checks
 * `!node.parent2` to recognize the root) sees the same shape a real TreeNode would - the root's
 * ancestor node has no parent2, every other ancestor's parent2 points at the previous one. */
function fakeTreeNode(itemId: string, ancestors: string[], itemData: any = {}, nodeInclusion?: NodeInclusion) {
  let previous: any = undefined
  const ancestorNodes = ancestors.map(ancestorId => {
    const node = {itemId: ancestorId, parent2: previous}
    previous = node
    return node
  })
  return {
    itemId,
    content: {itemData},
    nodeInclusion,
    parent2: previous, // last ancestor, or undefined if this node has none (i.e. it IS the root)
    getAncestorsPathArray: () => ancestorNodes,
  } as any
}

describe('SupabaseTreeService - writes', () => {
  it('patchItemData patches the existing item in place', async () => {
    const {treeService, itemsBackend, oryItemsService} = setup()
    itemsBackend.seed('item1', {title: 'Original'})
    oryItemsService.obtainItem$ById('item1' as any).applyDataFromDbAndEmit({title: 'Original'} as any)

    treeService.patchItemData('item1', {title: 'Patched'})
    await flushMicrotasks()

    expect(itemsBackend.storedItems.get('item1')?.title).toBe('Patched')
  })

  it('deleteWithoutConfirmation removes the item and every inclusion referencing it as a child', async () => {
    const {treeService, itemsBackend, inclusionsBackend} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    itemsBackend.seed('parentA', {title: 'Parent A'})
    itemsBackend.seed('parentB', {title: 'Parent B'})
    inclusionsBackend.seed('inclusionA', {childItemId: 'parentA', orderNum: 1}, [root], [root])
    inclusionsBackend.seed('inclusionB', {childItemId: 'parentB', orderNum: 2}, [root], [root])
    itemsBackend.seed('shared1', {title: 'Shared'})
    inclusionsBackend.seed('inclusionSharedA', {childItemId: 'shared1'}, ['parentA'], ['parentA'])
    inclusionsBackend.seed('inclusionSharedB', {childItemId: 'shared1'}, ['parentB'], ['parentB'])

    treeService.deleteWithoutConfirmation('shared1')
    await flushMicrotasks()

    expect(itemsBackend.storedItems.has('shared1')).toBe(false)
    expect(inclusionsBackend.storedItems.has('inclusionSharedA')).toBe(false)
    expect(inclusionsBackend.storedItems.has('inclusionSharedB')).toBe(false)
    // Unrelated inclusions untouched.
    expect(inclusionsBackend.storedItems.has('inclusionA')).toBe(true)
  })

  it('addChildNode persists both the item and an inclusion carrying the full ancestor chain', async () => {
    const {treeService, itemsBackend, inclusionsBackend} = setup()
    const parentNode = fakeTreeNode('grandparent1', [treeService.HARDCODED_ROOT_NODE_ITEM_ID])
    const newNode = fakeTreeNode('newChild1', [], {title: 'New child'}, new NodeInclusion('newInclusion1', 'grandparent1', 3))

    treeService.addChildNode(parentNode, newNode)
    await flushMicrotasks()

    expect(itemsBackend.storedItems.get('newChild1')?.title).toBe('New child')
    const inclusion = inclusionsBackend.storedItems.get('newInclusion1')
    expect(inclusion?.childItemId).toBe('newChild1')
    expect(inclusion?.orderNum).toBe(3)
    expect(inclusion?.parentIds).toEqual(['grandparent1'])
    expect(inclusion?.ancestorIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID, 'grandparent1'])
  })

  it('addAssociateSiblingAfterNode links an existing item under a second parent without duplicating the item', async () => {
    const {treeService, itemsBackend, inclusionsBackend} = setup()
    itemsBackend.seed('existingItem1', {title: 'Existing'})
    const parentB = fakeTreeNode('parentB', [treeService.HARDCODED_ROOT_NODE_ITEM_ID])
    const nodeToAssociate = fakeTreeNode('existingItem1', [], {title: 'Existing'}, new NodeInclusion('newInclusionUnderB', 'parentB', 7))

    treeService.addAssociateSiblingAfterNode(parentB, nodeToAssociate, undefined)
    await flushMicrotasks()

    expect(itemsBackend.storedItems.size).toBe(1) // no duplicate item row created
    const inclusion = inclusionsBackend.storedItems.get('newInclusionUnderB')
    expect(inclusion?.childItemId).toBe('existingItem1')
    expect(inclusion?.parentIds).toEqual(['parentB'])
  })

  it('patchChildInclusionData moving a node to a new parent updates parentIds/ancestorIds to the new parent chain', async () => {
    const {treeService, itemsBackend, inclusionsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    itemsBackend.seed('parentA', {title: 'Parent A'})
    itemsBackend.seed('parentB', {title: 'Parent B'})
    inclusionsBackend.seed('inclusionA', {childItemId: 'parentA', orderNum: 1}, [root], [root])
    inclusionsBackend.seed('inclusionB', {childItemId: 'parentB', orderNum: 2}, [root], [root])
    itemsBackend.seed('movable1', {title: 'Movable'})
    inclusionsBackend.seed('inclusionMovable', {childItemId: 'movable1', orderNum: 1}, ['parentA'], ['parentA'])
    // Make parentA/parentB "reachable" (as if already rendered) via a normal load pass first.
    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    treeService.patchChildInclusionData('parentA', 'inclusionMovable', new NodeInclusion('inclusionMovable', 'parentB', 4), 'movable1')
    await flushMicrotasks()

    const inclusion = inclusionsBackend.storedItems.get('inclusionMovable')
    expect(inclusion?.parentIds).toEqual(['parentB'])
    expect(inclusion?.ancestorIds).toEqual([root, 'parentB'])
    expect(inclusion?.orderNum).toBe(4)
  })
})

describe('SupabaseTreeService.backfillNode - source (Firestore) tree root id remapping', () => {
  // Regression coverage for a real bug: the tree being walked during a backfill is the
  // *Firestore*-backed TreeModel, whose root has Firestore's own hardcoded root item id - not
  // this service's 'ory_root'. Every real item keeps the same id across both backends, but the
  // synthetic root id itself differs, so it has to be remapped wherever it appears in
  // parent_ids/ancestor_ids. Getting this wrong means every top-level node (and everything
  // under it) is written with a parent id that never matches 'ory_root' once the Supabase
  // backend goes live - the entire migrated tree silently unreachable.
  const firestoreRootId = 'item_firestore_hardcoded_root'

  it('remaps a top-level node\'s parent to this service\'s own root id, not the source tree\'s', async () => {
    const {treeService, inclusionsBackend} = setup()
    const firestoreRoot = fakeTreeNode(firestoreRootId, [])
    const topLevelNode = fakeTreeNode('topLevel1', [], {title: 'Top level'}, new NodeInclusion('topLevelInclusion', firestoreRootId, 1))

    await treeService.backfillNode(firestoreRoot, topLevelNode)

    const inclusion = inclusionsBackend.storedItems.get('topLevelInclusion')
    expect(inclusion?.parentIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID])
    expect(inclusion?.ancestorIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID])
  })

  it('leaves a real (non-root) ancestor id unchanged while still remapping the root at the base of the chain', async () => {
    const {treeService, inclusionsBackend} = setup()
    const realParent = fakeTreeNode('realParent1', [firestoreRootId], {title: 'Parent'})
    const deepNode = fakeTreeNode('deepChild1', [], {title: 'Deep child'}, new NodeInclusion('deepInclusion', 'realParent1', 1))

    await treeService.backfillNode(realParent, deepNode)

    const inclusion = inclusionsBackend.storedItems.get('deepInclusion')
    // parent id is the real item id, unchanged
    expect(inclusion?.parentIds).toEqual(['realParent1'])
    // ancestor chain: [remapped root, real parent] - the root remapped, the real ancestor kept as-is
    expect(inclusion?.ancestorIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID, 'realParent1'])
  })

  it('writes the item itself unchanged regardless of the source root id mismatch', async () => {
    const {treeService, itemsBackend} = setup()
    const firestoreRoot = fakeTreeNode(firestoreRootId, [])
    const topLevelNode = fakeTreeNode('topLevel1', [], {title: 'Top level'}, new NodeInclusion('topLevelInclusion', firestoreRootId, 1))

    await treeService.backfillNode(firestoreRoot, topLevelNode)

    expect(itemsBackend.storedItems.get('topLevel1')?.title).toBe('Top level')
    // items never carry parent/ancestor ids themselves (see OryOdmItem$'s doc comment) - only
    // the inclusion does, so there's nothing root-id-shaped to get wrong here.
    expect(itemsBackend.storedItems.get('topLevel1')?.parentIds).toEqual([])
  })
})

describe('OryolFirestoreBackfillService', () => {
  function backfillSetup() {
    const base = setup()
    const backfillService = new OryolFirestoreBackfillService(base.treeService)
    return {...base, backfillService}
  }

  it('walks the whole source tree and writes every non-root node, remapping top-level parents to this service\'s root id', async () => {
    const {treeService, itemsBackend, inclusionsBackend, backfillService} = backfillSetup()
    const firestoreRootId = 'item_firestore_hardcoded_root'
    const root = fakeTreeNode(firestoreRootId, [])
    const child = fakeTreeNode('child1', [firestoreRootId], {title: 'Child'}, new NodeInclusion('inclusionChild', firestoreRootId, 1))
    const grandchild = fakeTreeNode('grandchild1', [firestoreRootId, 'child1'], {title: 'Grandchild'}, new NodeInclusion('inclusionGrandchild', 'child1', 1))
    ;(root as any).children = [child]
    ;(child as any).children = [grandchild]
    ;(grandchild as any).children = []

    await backfillService.run(root)

    expect(itemsBackend.storedItems.has('child1')).toBe(true)
    expect(itemsBackend.storedItems.has('grandchild1')).toBe(true)
    expect(inclusionsBackend.storedItems.get('inclusionChild')?.parentIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID])
    expect(inclusionsBackend.storedItems.get('inclusionGrandchild')?.parentIds).toEqual(['child1'])
    expect(backfillService.progress$.lastVal).toMatchObject({written: 2, failed: 0, total: 2, done: true})
  })

  it('a node that fails to write is counted as failed without aborting the rest of the batch', async () => {
    const {itemsBackend, backfillService} = backfillSetup()
    const firestoreRootId = 'item_firestore_hardcoded_root'
    const root = fakeTreeNode(firestoreRootId, [])
    const willFail = fakeTreeNode('willFail1', [], {title: 'Will fail'}, new NodeInclusion('inclusionFail', firestoreRootId, 1))
    const willSucceed = fakeTreeNode('willSucceed1', [], {title: 'Will succeed'}, new NodeInclusion('inclusionOk', firestoreRootId, 2))
    ;(root as any).children = [willFail, willSucceed]
    ;(willFail as any).children = []
    ;(willSucceed as any).children = []

    let failNext = true
    const originalSave = itemsBackend.saveNowToDb.bind(itemsBackend)
    itemsBackend.saveNowToDb = async (item: any, id: any, ...rest: any[]) => {
      if (id === 'willFail1' && failNext) {
        failNext = false
        throw new Error('simulated network failure for this node only')
      }
      return originalSave(item, id, ...rest)
    }

    await backfillService.run(root)

    expect(itemsBackend.storedItems.has('willSucceed1')).toBe(true)
    expect(itemsBackend.storedItems.has('willFail1')).toBe(false)
    expect(backfillService.progress$.lastVal).toMatchObject({written: 1, failed: 1, total: 2, done: true})
  })

  it('is safe to re-run - a retried node upserts instead of duplicating', async () => {
    const {itemsBackend, inclusionsBackend, backfillService} = backfillSetup()
    const firestoreRootId = 'item_firestore_hardcoded_root'
    const root = fakeTreeNode(firestoreRootId, [])
    const node = fakeTreeNode('item1', [], {title: 'Original'}, new NodeInclusion('inclusion1', firestoreRootId, 1))
    ;(root as any).children = [node]
    ;(node as any).children = []

    await backfillService.run(root)
    node.content.itemData.title = 'Updated on second pass'
    await backfillService.run(root)

    expect(itemsBackend.storedItems.size).toBe(1)
    expect(inclusionsBackend.storedItems.size).toBe(1)
    expect(itemsBackend.storedItems.get('item1')?.title).toBe('Updated on second pass')
  })
})

describe('SupabaseTreeService - offline/network-failure resilience', () => {
  it('a failed addChildNode item save is durably journaled for retry (survives reload/crash)', async () => {
    const {treeService, itemsBackend, browserOdmStorage} = setup()
    itemsBackend.shouldFailSave = true
    const parentNode = fakeTreeNode(treeService.HARDCODED_ROOT_NODE_ITEM_ID, [])
    const newNode = fakeTreeNode('offlineChild1', [], {title: 'Created offline'}, new NodeInclusion('offlineInclusion1', treeService.HARDCODED_ROOT_NODE_ITEM_ID, 1))

    treeService.addChildNode(parentNode, newNode)
    await flushMicrotasks()

    expect(itemsBackend.storedItems.has('offlineChild1')).toBe(false) // the save genuinely failed
    const journaled = await browserOdmStorage.getAllPendingEdits('OryItem')
    expect(journaled.some(edit => edit.item_id === 'offlineChild1')).toBe(true)
  })

  it('reconnecting and resuming the journaled edit succeeds once the network is back', async () => {
    const {treeService, itemsBackend, oryItemsService, browserOdmStorage} = setup()
    itemsBackend.shouldFailSave = true
    const parentNode = fakeTreeNode(treeService.HARDCODED_ROOT_NODE_ITEM_ID, [])
    const newNode = fakeTreeNode('offlineChild2', [], {title: 'Created offline'}, new NodeInclusion('offlineInclusion2', treeService.HARDCODED_ROOT_NODE_ITEM_ID, 1))
    treeService.addChildNode(parentNode, newNode)
    await flushMicrotasks()
    expect(itemsBackend.storedItems.has('offlineChild2')).toBe(false)

    // "Back online" - resume exactly like OdmService2.resumePendingEditsNow() does on reconnect.
    itemsBackend.shouldFailSave = false
    const journaled = await browserOdmStorage.getAllPendingEdits('OryItem')
    const edit = journaled.find(e => e.item_id === 'offlineChild2')!
    const item$ = oryItemsService.obtainItem$ById('offlineChild2' as any)
    await item$.resumeUnsyncedPatch(edit.patch)
    await flushMicrotasks()

    expect(itemsBackend.storedItems.get('offlineChild2')?.title).toBe('Created offline')
    const stillJournaled = await browserOdmStorage.getAllPendingEdits('OryItem')
    expect(stillJournaled.some(e => e.item_id === 'offlineChild2')).toBe(false) // cleared once confirmed
  })

  it('a successful patchItemData clears any previously-journaled pending edit for that item', async () => {
    const {treeService, itemsBackend, oryItemsService, browserOdmStorage} = setup()
    itemsBackend.seed('item1', {title: 'Original'})
    oryItemsService.obtainItem$ById('item1' as any).applyDataFromDbAndEmit({title: 'Original'} as any)

    treeService.patchItemData('item1', {title: 'Patched while online'})
    await flushMicrotasks()

    expect(itemsBackend.storedItems.get('item1')?.title).toBe('Patched while online')
    const journaled = await browserOdmStorage.getAllPendingEdits('OryItem')
    expect(journaled.some(e => e.item_id === 'item1')).toBe(false)
  })
})
