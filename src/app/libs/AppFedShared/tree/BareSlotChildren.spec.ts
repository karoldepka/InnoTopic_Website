import {describe, it, expect} from 'vitest'
import {Injector} from '@angular/core'
import {OdmBackend} from '../odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../odm/OdmCollectionBackend'
import {OdmItemId} from '../odm/OdmItemId'
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {AuthService} from '../../../auth/auth.service'
import {SyncStatusService} from '../odm/sync-status.service'
import {ApfGeoLocationService} from '../geo-location/apf-geo-location.service'
import {BrowserOdmStorage} from '../../AppFedSharedBrowser/odm-browser/BrowserOdmStorage'
import {GenericItemsService} from './generic-items.service'
import {GenericItem} from './GenericItem'
import {g} from '../g'
import {createChildUnderSlot, getBareSlotChildren$} from './BareSlotChildren'
import {fieldVirtualNodeId} from './cells/SlotDescriptor'

// See generic-items.service.spec.ts's identical stub - OdmItem$2.getParentIds() reads
// appGlobals.feat for a dev-only diagnostic warning outside of real Angular bootstrap.
g.feat = {categoriesTree: {showFixmes: false}} as any

/** Copied from generic-items.service.spec.ts (kept local/self-contained deliberately - see
 * vitest.config.ts's comment on why these specs aren't swept in via a glob). A plain in-memory
 * backend standing in for Supabase/Firestore, so BareSlotChildren.ts's own logic (not any
 * particular backend) is what's under test. */
class FakeOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  storedItems = new Map<string, any>()

  async saveNowToDb(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    this.storedItems.set(id as string, {...(item as any), parentIds: parentIds ?? [], ancestorIds: ancestorIds ?? []})
    return {ok: true}
  }

  async deleteWithoutConfirmation(): Promise<any> {
  }

  override setListener(listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>, queryOpts: QueryOpts, callback: () => void): void {
    super.setListener(listener, queryOpts, callback)
    for (const [id, item] of this.storedItems) {
      listener.onAdded(id as unknown as OdmItemId<TRaw>, item)
    }
    listener.onFinishedProcessingChangeSet()
    callback?.()
  }

  loadChildrenOf(): void {
  }

  loadTreeDescendantsOf(): void {
  }
}

class FakeBrowserOdmStorage {
  pendingEditsChanged$ = new CachedSubject<void>(undefined as any)
  conflictDetected$ = new CachedSubject<{collection: string, winnerId: string}>(undefined as any)

  async getConflictedItemIds(): Promise<Set<string>> {
    return new Set()
  }

  async getAllPendingEdits() {
    return []
  }

  async getAllPendingEditsEverywhere() {
    return []
  }

  async savePendingEdit() {
  }

  async clearPendingEdit() {
  }

  async get() {
    return undefined
  }
}

function setup() {
  const backends = new Map<string, FakeOdmCollectionBackend<any>>()
  const authService = {authUser$: new CachedSubject<{uid: string} | null>({uid: 'owner1'})}
  const syncStatusService = {
    handleSavingPromise: () => undefined,
    handleUnsavedPromise: () => undefined,
    addPendingDownload: () => undefined,
    removePendingDownload: () => undefined,
  }
  const geoLocationService = {geoLocation$: new CachedSubject<any>(undefined)}
  const odmBackend: OdmBackend = {
    backendReady$: new CachedSubject<boolean>(true),
    createCollectionBackend: (injector: Injector, className: string) => {
      const backend = new FakeOdmCollectionBackend<any>(injector, className, odmBackend)
      backends.set(className, backend)
      return backend
    },
  } as unknown as OdmBackend
  const providers = new Map<any, any>([
    [OdmBackend, odmBackend],
    [AuthService, authService],
    [SyncStatusService, syncStatusService],
    [ApfGeoLocationService, geoLocationService],
    [BrowserOdmStorage, new FakeBrowserOdmStorage()],
  ])
  const injector = {
    get: (token: any) => {
      if (!providers.has(token)) {
        throw new Error(`No fake registered for token: ${token?.name ?? token}`)
      }
      return providers.get(token)
    },
  } as Injector

  return {service: new GenericItemsService(injector)}
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('BareSlotChildren - createChildUnderSlot', () => {
  it('creates a real child of the parent, tagging manualAncestorIds with the fabricated slot id', async () => {
    const {service} = setup()
    const parent$ = service.add(Object.assign(new GenericItem(), {title: 'Parent'}))
    await flushMicrotasks()
    const slotTargetNodeId = fieldVirtualNodeId(parent$.id as string, 'plan')

    const child$ = createChildUnderSlot(parent$, slotTargetNodeId, {title: 'Voice note transcript'})
    await flushMicrotasks()

    // A completely normal child of its real parent - parentIds is untouched.
    expect(child$.getParentIds()).toEqual([parent$.id])
    // ...with the fabricated slot id appended to the computed ancestor set, alongside the real
    // ancestor chain - reachable via the exact same ancestorIds-containment query as any other
    // descendant, per GH #89's design.
    expect(child$.getAncestorIds()).toContain(slotTargetNodeId)
    expect(child$.getAncestorIds()).toContain(parent$.id)
    expect((child$.val as any)?.title).toBe('Voice note transcript')
  })
})

describe('BareSlotChildren - getBareSlotChildren$', () => {
  it('only includes children tagged with this slot\'s id, excluding the parent itself and unrelated children', async () => {
    const {service} = setup()
    const parent$ = service.add(Object.assign(new GenericItem(), {title: 'Parent'}))
    await flushMicrotasks()
    const planSlotId = fieldVirtualNodeId(parent$.id as string, 'plan')
    const otherSlotId = fieldVirtualNodeId(parent$.id as string, 'mood')

    const planChild$ = createChildUnderSlot(parent$, planSlotId, {title: 'Under plan'})
    createChildUnderSlot(parent$, otherSlotId, {title: 'Under mood, not plan'})
    parent$.createChild({title: 'A normal child, not under any slot'} as any)
    await flushMicrotasks()

    let latest: any[] = []
    getBareSlotChildren$(parent$, planSlotId).subscribe(children => latest = children)

    expect(latest.map(c => c.id)).toEqual([planChild$.id])
    expect(latest.map(c => (c.val as any)?.title)).toEqual(['Under plan'])
  })

  it('reflects a newly-added child reactively, without needing to re-subscribe', async () => {
    const {service} = setup()
    const parent$ = service.add(Object.assign(new GenericItem(), {title: 'Parent'}))
    await flushMicrotasks()
    const slotId = fieldVirtualNodeId(parent$.id as string, 'plan')

    let latest: any[] = []
    getBareSlotChildren$(parent$, slotId).subscribe(children => latest = children)
    expect(latest).toEqual([])

    createChildUnderSlot(parent$, slotId, {title: 'Added after subscribing'})
    await flushMicrotasks()

    expect(latest.map(c => (c.val as any)?.title)).toEqual(['Added after subscribing'])
  })

  it('does NOT include a grandchild nested under a direct bare-slot child (regression: getCategoriesTree double-listing)', async () => {
    // Reproduces a real bug found while building the categories feature: a normal (non-slot)
    // grandchild nested under a direct bare-slot child inherits the slot id transitively via
    // getAncestorIds() (which walks through its real parent's own manualAncestorIds too), so it
    // used to leak into this "direct children of the slot" list as a spurious extra entry -
    // on top of correctly rendering nested under its real parent via the normal tree walk.
    const {service} = setup()
    const root$ = service.add(Object.assign(new GenericItem(), {title: 'Root'}))
    await flushMicrotasks()
    const categoriesSlotId = fieldVirtualNodeId(root$.id as string, 'categories')

    const topCategory$ = createChildUnderSlot(root$, categoriesSlotId, {title: 'Top category'})
    await flushMicrotasks()
    // A normal nested child, NOT created via createChildUnderSlot - matches
    // CategoryTreeNodeComponent.addChild()'s plain odmService.newItem([parent$]) call.
    topCategory$.createChild({title: 'Sub-category'} as any)
    await flushMicrotasks()

    let latest: any[] = []
    getBareSlotChildren$(root$, categoriesSlotId).subscribe(children => latest = children)

    expect(latest.map(c => (c.val as any)?.title)).toEqual(['Top category'])
  })
})
