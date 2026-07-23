import {describe, it, expect} from 'vitest'
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
  conflictDetected$ = new CachedSubject<{collection: string, winnerId: string}>(undefined as any)

  async getConflictedItemIds(collection: string): Promise<Set<string>> {
    return new Set()
  }

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
  const treeService = new SupabaseTreeService(oryItemsService)
  const itemsBackend = backends.get('OryItem') as FakeOdmCollectionBackend<any>
  const listener = new RecordingDbTreeListener()
  return {treeService, oryItemsService, itemsBackend, listener, browserOdmStorage}
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/** Seeds an item that already carries an embedded relationship - the GH #89 unify-the-tree-
 * worlds replacement for a separate `OryNodeInclusion` row. */
function seedItemWithInclusion(itemsBackend: FakeOdmCollectionBackend<any>, itemId: string, itemData: any, parentId: string, orderNum: number, ancestorIds: string[]) {
  itemsBackend.seed(itemId, {
    ...itemData,
    inclusionsByParentId: {[parentId]: {orderNum}},
  }, [parentId], ancestorIds)
}

describe('SupabaseTreeService.loadNodesTree - delivery ordering', () => {
  it('delivers a direct child of the root immediately', async () => {
    const {treeService, itemsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    seedItemWithInclusion(itemsBackend, 'child1', {title: 'Child'}, root, 1, [root])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    const childEvents = listener.addedOrModified.filter(e => e.itemId === 'child1')
    expect(childEvents.length).toBeGreaterThan(0)
    expect(childEvents.every(e => e.directParentItemId === root)).toBe(true)
  })

  it('delivers a grandchild whose parent arrives after it, in parent-before-child order once both are known', async () => {
    const {treeService, itemsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    // Seed out of order: grandchild arrives fully before its parent.
    seedItemWithInclusion(itemsBackend, 'grandchild1', {title: 'Grandchild'}, 'child1', 1, ['child1'])
    seedItemWithInclusion(itemsBackend, 'child1', {title: 'Child'}, root, 1, [root])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    const deliveredIds = listener.addedOrModified.map(e => e.itemId)
    expect(deliveredIds).toContain('child1')
    expect(deliveredIds).toContain('grandchild1')
    expect(deliveredIds.indexOf('child1')).toBeLessThan(deliveredIds.indexOf('grandchild1'))
  })

  it('does not deliver an item whose parent has not arrived yet', async () => {
    const {treeService, itemsBackend, listener} = setup()
    seedItemWithInclusion(itemsBackend, 'orphan1', {title: 'Orphan'}, 'missingParent', 1, ['missingParent'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    expect(listener.addedOrModified).toEqual([])
  })

  it('a later-arriving parent flushes its previously-buffered children', async () => {
    const {treeService, itemsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    seedItemWithInclusion(itemsBackend, 'grandchild1', {title: 'Grandchild'}, 'child1', 1, ['child1'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()
    expect(listener.addedOrModified.map(e => e.itemId)).not.toContain('grandchild1')

    // Parent arrives afterwards (e.g. a slower incremental-sync page).
    seedItemWithInclusion(itemsBackend, 'child1', {title: 'Child'}, root, 1, [root])
    treeService.loadNodesTree(listener) // re-entrant call, as ngOnInit-driven re-subscription would be
    await flushMicrotasks()

    expect(listener.addedOrModified.map(e => e.itemId)).toEqual(expect.arrayContaining(['child1', 'grandchild1']))
  })

  it('the same item included under two different parents is delivered as two separate occurrences, each with its own orderNum', async () => {
    const {treeService, itemsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    seedItemWithInclusion(itemsBackend, 'parentA', {title: 'Parent A'}, root, 1, [root])
    seedItemWithInclusion(itemsBackend, 'parentB', {title: 'Parent B'}, root, 2, [root])

    itemsBackend.seed('shared1', {
      title: 'Shared item',
      inclusionsByParentId: {parentA: {orderNum: 5}, parentB: {orderNum: 9}},
    }, ['parentA', 'parentB'], ['parentA'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    const sharedEvents = listener.addedOrModified.filter(e => e.itemId === 'shared1')
    const distinctParents = new Set(sharedEvents.map(e => e.directParentItemId))
    expect(distinctParents).toEqual(new Set(['parentA', 'parentB']))
    const orderNumsByParent = Object.fromEntries(sharedEvents.map(e => [e.directParentItemId, e.nodeInclusion.orderNum]))
    expect(orderNumsByParent['parentA']).toBe(5)
    expect(orderNumsByParent['parentB']).toBe(9)
  })

  it('a re-parented item is delivered via onNodeInclusionModified, not a duplicate onNodeAddedOrModified', async () => {
    const {treeService, itemsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    seedItemWithInclusion(itemsBackend, 'parentA', {title: 'Parent A'}, root, 1, [root])
    seedItemWithInclusion(itemsBackend, 'parentB', {title: 'Parent B'}, root, 2, [root])
    seedItemWithInclusion(itemsBackend, 'movable1', {title: 'Movable'}, 'parentA', 1, ['parentA'])

    treeService.loadNodesTree(listener)
    await flushMicrotasks()
    expect(listener.addedOrModified.some(e => e.itemId === 'movable1' && e.directParentItemId === 'parentA')).toBe(true)
    const addedOrModifiedCountBeforeMove = listener.addedOrModified.length

    // Re-parent movable1 from parentA to parentB - same shape a real setParentInclusion()/
    // removeParentInclusion() pair produces.
    seedItemWithInclusion(itemsBackend, 'movable1', {title: 'Movable'}, 'parentB', 1, ['parentB'])
    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    // The move must actually go through onNodeInclusionModified (the only path TreeModel uses
    // to relocate an existing node) with the correct new parent.
    expect(listener.inclusionModified.length).toBeGreaterThan(0)
    expect(listener.inclusionModified[0]).toMatchObject({nodeInclusionId: 'movable1', newParentItemId: 'parentB'})
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
    children: [],
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

  it('deleteWithoutConfirmation removes the item (relationships live on it, nothing else to clean up)', async () => {
    const {treeService, itemsBackend} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    seedItemWithInclusion(itemsBackend, 'parentA', {title: 'Parent A'}, root, 1, [root])
    seedItemWithInclusion(itemsBackend, 'shared1', {title: 'Shared'}, 'parentA', 1, ['parentA'])

    treeService.deleteWithoutConfirmation('shared1')
    await flushMicrotasks()

    expect(itemsBackend.storedItems.has('shared1')).toBe(false)
    expect(itemsBackend.storedItems.has('parentA')).toBe(true) // unrelated item untouched
  })

  it('addChildNode persists the item with its relationship embedded, carrying the full ancestor chain', async () => {
    const {treeService, itemsBackend, oryItemsService} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    const grandparentItem$ = oryItemsService.obtainItem$ById('grandparent1' as any)
    grandparentItem$.applyDataFromDbAndEmit({title: 'Grandparent', inclusionsByParentId: {[root]: {orderNum: 0}}} as any)
    const parentNode = fakeTreeNode('grandparent1', [root])
    const newNode = fakeTreeNode('newChild1', [], {title: 'New child'}, new NodeInclusion('newChild1', 'grandparent1', 3))

    treeService.addChildNode(parentNode, newNode)
    await flushMicrotasks()

    const stored = itemsBackend.storedItems.get('newChild1')
    expect(stored?.title).toBe('New child')
    expect(stored?.inclusionsByParentId).toEqual({grandparent1: {orderNum: 3}})
    expect(stored?.parentIds).toEqual(['grandparent1'])
    // getAncestorIds() walks nearest-parent-first (order doesn't matter for the ancestor_ids
    // containment query itself) - just needs to contain both.
    expect(stored?.ancestorIds).toEqual(expect.arrayContaining([root, 'grandparent1']))
  })

  it('addAssociateSiblingAfterNode links an existing item under a second parent without duplicating the item', async () => {
    const {treeService, itemsBackend, oryItemsService} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    itemsBackend.seed('existingItem1', {title: 'Existing'})
    oryItemsService.obtainItem$ById('existingItem1' as any).applyDataFromDbAndEmit({title: 'Existing'} as any)
    seedItemWithInclusion(itemsBackend, 'parentB', {title: 'Parent B'}, root, 0, [root])
    const parentB = fakeTreeNode('parentB', [root])
    const nodeToAssociate = fakeTreeNode('existingItem1', [], {title: 'Existing'}, new NodeInclusion('existingItem1', 'parentB', 7))

    treeService.addAssociateSiblingAfterNode(parentB, nodeToAssociate, undefined)
    await flushMicrotasks()

    expect(itemsBackend.storedItems.size).toBe(2) // existingItem1 + parentB - no duplicate item row created
    const stored = itemsBackend.storedItems.get('existingItem1')
    expect(stored?.inclusionsByParentId).toEqual({parentB: {orderNum: 7}})
    expect(stored?.parentIds).toEqual(['parentB'])
  })

  it('patchChildInclusionData moving a node to a new parent updates parentIds/ancestorIds to the new parent chain', async () => {
    const {treeService, itemsBackend, listener} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    seedItemWithInclusion(itemsBackend, 'parentA', {title: 'Parent A'}, root, 1, [root])
    seedItemWithInclusion(itemsBackend, 'parentB', {title: 'Parent B'}, root, 2, [root])
    seedItemWithInclusion(itemsBackend, 'movable1', {title: 'Movable'}, 'parentA', 1, ['parentA'])
    // Make parentA/parentB "reachable" (as if already rendered) via a normal load pass first.
    treeService.loadNodesTree(listener)
    await flushMicrotasks()

    treeService.patchChildInclusionData('parentA', 'movable1', new NodeInclusion('movable1', 'parentB', 4), 'movable1')
    await flushMicrotasks()

    const stored = itemsBackend.storedItems.get('movable1')
    expect(stored?.inclusionsByParentId).toEqual({parentB: {orderNum: 4}})
    expect(stored?.parentIds).toEqual(['parentB'])
    expect(stored?.ancestorIds).toEqual(expect.arrayContaining([root, 'parentB']))
  })
})

describe('SupabaseTreeService.upsertItemIfMissing', () => {
  it('creates the item, with the given data, when it does not exist yet', async () => {
    const {treeService, itemsBackend} = setup()

    await treeService.upsertItemIfMissing('newAnchor1', {title: 'Mindfulness', isArchived: false})
    await flushMicrotasks()

    expect(itemsBackend.storedItems.get('newAnchor1')).toMatchObject({title: 'Mindfulness', isArchived: false})
  })

  it('does not overwrite or duplicate an item that is already loaded (GH #125/#126 - used to createOdmItem$() a second, disconnected object for the same id, which collided in OdmService2._ensureItemAdded() and silently clobbered the existing row with only this call\'s minimal itemData)', async () => {
    const {treeService, itemsBackend, oryItemsService} = setup()
    itemsBackend.seed('existingAnchor1', {title: 'Mindfulness', accumulatedField: 'keep-me'})
    oryItemsService.obtainItem$ById('existingAnchor1' as any).applyDataFromDbAndEmit({title: 'Mindfulness', accumulatedField: 'keep-me'} as any)
    const itemCountBefore = oryItemsService.itemsCount()

    await treeService.upsertItemIfMissing('existingAnchor1', {title: 'Mindfulness', isArchived: false})
    await flushMicrotasks()

    // Already exists - left untouched, not overwritten with just this call's minimal itemData.
    expect(itemsBackend.saveNowToDbCalls.some(c => c.id === 'existingAnchor1')).toBe(false)
    expect(itemsBackend.storedItems.get('existingAnchor1')).toMatchObject({accumulatedField: 'keep-me'})
    // No duplicate object was registered for the same id.
    expect(oryItemsService.itemsCount()).toBe(itemCountBefore)
  })
})

describe('SupabaseTreeService.backfillNode - source (Firestore) tree root id remapping', () => {
  // Regression coverage for a real bug: the tree being walked during a backfill is the
  // *Firestore*-backed TreeModel, whose root has Firestore's own hardcoded root item id - not
  // this service's 'ory_root'. Every real item keeps the same id across both backends, but the
  // synthetic root id itself differs, so it has to be remapped wherever it appears in the
  // relationship/ancestor chain. Getting this wrong means every top-level node (and everything
  // under it) is written with a parent id that never matches 'ory_root' once the Supabase
  // backend goes live - the entire migrated tree silently unreachable.
  const firestoreRootId = 'item_firestore_hardcoded_root'

  it('remaps a top-level node\'s parent to this service\'s own root id, not the source tree\'s', async () => {
    const {treeService, itemsBackend} = setup()
    const firestoreRoot = fakeTreeNode(firestoreRootId, [])
    const topLevelNode = fakeTreeNode('topLevel1', [], {title: 'Top level'}, new NodeInclusion('topLevelInclusion', firestoreRootId, 1))

    await treeService.backfillNode(firestoreRoot, topLevelNode)

    const stored = itemsBackend.storedItems.get('topLevel1')
    expect(stored?.parentIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID])
    expect(stored?.ancestorIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID])
    expect(stored?.inclusionsByParentId).toEqual({[treeService.HARDCODED_ROOT_NODE_ITEM_ID]: {orderNum: 1}})
  })

  it('leaves a real (non-root) ancestor id unchanged while still remapping the root at the base of the chain', async () => {
    const {treeService, itemsBackend} = setup()
    const realParent = fakeTreeNode('realParent1', [firestoreRootId], {title: 'Parent'})
    const deepNode = fakeTreeNode('deepChild1', [], {title: 'Deep child'}, new NodeInclusion('deepInclusion', 'realParent1', 1))

    await treeService.backfillNode(realParent, deepNode)

    const stored = itemsBackend.storedItems.get('deepChild1')
    // parent id is the real item id, unchanged
    expect(stored?.parentIds).toEqual(['realParent1'])
    // ancestor chain: [remapped root, real parent] - the root remapped, the real ancestor kept as-is
    expect(stored?.ancestorIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID, 'realParent1'])
  })
})

describe('OryolFirestoreBackfillService', () => {
  function backfillSetup() {
    const base = setup()
    const backfillService = new OryolFirestoreBackfillService(base.treeService)
    return {...base, backfillService}
  }

  it('walks the whole source tree and writes every non-root node, remapping top-level parents to this service\'s root id', async () => {
    const {treeService, itemsBackend, backfillService} = backfillSetup()
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
    expect(itemsBackend.storedItems.get('child1')?.parentIds).toEqual([treeService.HARDCODED_ROOT_NODE_ITEM_ID])
    expect(itemsBackend.storedItems.get('grandchild1')?.parentIds).toEqual(['child1'])
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
    const {itemsBackend, backfillService} = backfillSetup()
    const firestoreRootId = 'item_firestore_hardcoded_root'
    const root = fakeTreeNode(firestoreRootId, [])
    const node = fakeTreeNode('item1', [], {title: 'Original'}, new NodeInclusion('inclusion1', firestoreRootId, 1))
    ;(root as any).children = [node]
    ;(node as any).children = []

    await backfillService.run(root)
    node.content.itemData.title = 'Updated on second pass'
    await backfillService.run(root)

    expect(itemsBackend.storedItems.size).toBe(1)
    expect(itemsBackend.storedItems.get('item1')?.title).toBe('Updated on second pass')
  })
})

describe('SupabaseTreeService - offline/network-failure resilience', () => {
  it('a failed addChildNode item save is durably journaled for retry (survives reload/crash)', async () => {
    const {treeService, itemsBackend, browserOdmStorage, oryItemsService} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    oryItemsService.obtainItem$ById(root as any).applyDataFromDbAndEmit({title: 'Root', inclusionsByParentId: {}} as any)
    itemsBackend.shouldFailSave = true
    const parentNode = fakeTreeNode(root, [])
    const newNode = fakeTreeNode('offlineChild1', [], {title: 'Created offline'}, new NodeInclusion('offlineChild1', root, 1))

    treeService.addChildNode(parentNode, newNode)
    await flushMicrotasks()

    expect(itemsBackend.storedItems.has('offlineChild1')).toBe(false) // the save genuinely failed
    const journaled = await browserOdmStorage.getAllPendingEdits('OryItem')
    expect(journaled.some(edit => edit.item_id === 'offlineChild1')).toBe(true)
  })

  it('reconnecting and resuming the journaled edit succeeds once the network is back', async () => {
    const {treeService, itemsBackend, oryItemsService, browserOdmStorage} = setup()
    const root = treeService.HARDCODED_ROOT_NODE_ITEM_ID
    oryItemsService.obtainItem$ById(root as any).applyDataFromDbAndEmit({title: 'Root', inclusionsByParentId: {}} as any)
    itemsBackend.shouldFailSave = true
    const parentNode = fakeTreeNode(root, [])
    const newNode = fakeTreeNode('offlineChild2', [], {title: 'Created offline'}, new NodeInclusion('offlineChild2', root, 1))
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
