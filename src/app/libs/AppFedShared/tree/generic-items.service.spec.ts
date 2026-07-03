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

// GenericItem$ (unlike OryOdmItem$) doesn't override getParentIds() - it's a real single-parent
// tree item, so it correctly uses OdmItem$2's base implementation. That implementation reads
// appGlobals.feat (== g.feat here) for a dev-only diagnostic warning; g.feat is normally
// populated by FeatureService during real app bootstrap (via Angular DI), which nothing in this
// isolated unit test triggers - stub the one field it reads so that's a no-op instead of a crash.
g.feat = {categoriesTree: {showFixmes: false}} as any

/** Same shape as SupabaseTreeService.spec.ts's fake - a plain in-memory backend with
 * network-failure injection, standing in for Supabase/Firestore/whatever real OdmCollectionBackend
 * is active, so GenericItemsService/GenericItem$'s own logic (not any particular backend) is
 * what's under test. */
class FakeOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  storedItems = new Map<string, any>()
  shouldFailSave = false

  async saveNowToDb(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    if (this.shouldFailSave) {
      throw new Error('simulated network failure')
    }
    const merged = {...(item as any), parentIds: parentIds ?? [], ancestorIds: ancestorIds ?? []}
    this.storedItems.set(id as string, merged)
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

  loadTreeDescendantsOf(): void {
  }

  /** Simulates a realtime postgres_changes/onSnapshot push arriving after the initial load. */
  pushRealtimeModified(id: string, item: any): void {
    this.storedItems.set(id, item)
    this.listener?.onModified(id as unknown as OdmItemId<TRaw>, item)
    this.listener?.onFinishedProcessingChangeSet()
  }
}

/** Same shape as SupabaseTreeService.spec.ts's fake - records pending edits in memory so
 * offline/durable-journal behavior is actually observable, not just assumed. */
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

function setup() {
  const backends = new Map<string, FakeOdmCollectionBackend<any>>()
  const browserOdmStorage = new FakeBrowserOdmStorage()
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

  const service = new GenericItemsService(injector)
  const backend = backends.get('GenericItem') as FakeOdmCollectionBackend<any>
  return {service, backend, browserOdmStorage}
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('GenericItemsService/GenericItem$ - CRUD', () => {
  it('add() persists a new item with owner/whenCreated set', async () => {
    const {service, backend} = setup()

    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Hello'}))
    await flushMicrotasks()

    const stored = backend.storedItems.get(item$.id as string)
    expect(stored?.title).toBe('Hello')
    expect(stored?.owner).toBe('owner1')
    expect(stored?.whenCreated).toBeTruthy()
  })

  it('patchThrottled/patchNow updates an existing item in place', async () => {
    const {service, backend} = setup()
    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Original'}))
    await flushMicrotasks()

    item$.patchNow({title: 'Updated'} as any)
    await flushMicrotasks()

    expect(backend.storedItems.get(item$.id as string)?.title).toBe('Updated')
  })

  it('deleteWithoutConfirmationById removes the item from the backend', async () => {
    const {service, backend} = setup()
    const item$ = service.add(Object.assign(new GenericItem(), {title: 'To delete'}))
    await flushMicrotasks()

    service.deleteWithoutConfirmationById(item$.id as any)
    await flushMicrotasks()

    expect(backend.storedItems.has(item$.id as string)).toBe(false)
  })
})

describe('GenericItemsService/GenericItem$ - tree operations', () => {
  it('createChild() persists the child with the parent in parentIds and an orderNum', async () => {
    const {service, backend} = setup()
    const parent$ = service.add(Object.assign(new GenericItem(), {title: 'Parent'}))
    await flushMicrotasks()

    const child$ = parent$.createChild({title: 'Child'} as any)
    await flushMicrotasks()

    const stored = backend.storedItems.get(child$.id as string)
    expect(stored?.title).toBe('Child')
    expect(stored?.parentIds).toEqual([parent$.id])
    expect(typeof stored?.orderNum).toBe('number')
    expect(parent$.getChildren()).toContain(child$)
  })

  it('successive createChild() calls order children increasingly (append-at-end semantics)', async () => {
    const {service} = setup()
    const parent$ = service.add(Object.assign(new GenericItem(), {title: 'Parent'}))
    await flushMicrotasks()

    const first$ = parent$.createChild({title: 'First'} as any)
    const second$ = parent$.createChild({title: 'Second'} as any)
    const third$ = parent$.createChild({title: 'Third'} as any)
    await flushMicrotasks()

    const ordered = parent$.getChildrenOrdered()
    expect(ordered.map(c => c.id)).toEqual([first$.id, second$.id, third$.id])
  })

  it('requestLoadChildren() populates childrenList$ from the backend, scoped to this item as parent', async () => {
    const {service, backend} = setup()
    const parent$ = service.add(Object.assign(new GenericItem(), {title: 'Parent'}))
    await flushMicrotasks()
    // Seed a pre-existing child directly in the backend (as if created on another device).
    backend.storedItems.set('remoteChild1', {title: 'Remote child', parentIds: [parent$.id], owner: 'owner1'})

    parent$.requestLoadChildren()
    await flushMicrotasks()

    expect(parent$.getChildren().map(c => c.id)).toContain('remoteChild1')
  })
})

describe('GenericItemsService/GenericItem$ - offline/network-failure resilience', () => {
  it('a failed add() is durably journaled (hasUnsyncedChanges stays true, survives a simulated reload)', async () => {
    const {service, backend, browserOdmStorage} = setup()
    backend.shouldFailSave = true

    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Created offline'}))
    await flushMicrotasks()

    expect(backend.storedItems.has(item$.id as string)).toBe(false) // the save genuinely failed
    expect(item$.hasUnsyncedChanges).toBe(true)
    const journaled = await browserOdmStorage.getAllPendingEdits('GenericItem')
    expect(journaled.some(e => e.item_id === item$.id)).toBe(true)
  })

  it('resuming a journaled edit after reconnecting succeeds and clears the journal', async () => {
    const {service, backend, browserOdmStorage} = setup()
    backend.shouldFailSave = true
    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Created offline'}))
    await flushMicrotasks()
    expect(backend.storedItems.has(item$.id as string)).toBe(false)

    // "Back online" - resume exactly like OdmService2.resumePendingEditsNow() does.
    backend.shouldFailSave = false
    const journaled = await browserOdmStorage.getAllPendingEdits('GenericItem')
    const edit = journaled.find(e => e.item_id === item$.id)!
    const resumedItem$ = service.obtainItem$ById(item$.id as any)
    await resumedItem$.resumeUnsyncedPatch(edit.patch)
    await flushMicrotasks()

    expect(backend.storedItems.get(item$.id as string)?.title).toBe('Created offline')
    expect(resumedItem$.hasUnsyncedChanges).toBe(false)
    const stillJournaled = await browserOdmStorage.getAllPendingEdits('GenericItem')
    expect(stillJournaled.some(e => e.item_id === item$.id)).toBe(false)
  })

  it('a patch made while a previous save is still failing keeps accumulating in the journal rather than being lost', async () => {
    const {service, backend, browserOdmStorage} = setup()
    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Original'}))
    await flushMicrotasks()
    backend.shouldFailSave = true

    item$.patchNow({title: 'Edited while offline'} as any)
    await flushMicrotasks()

    expect(backend.storedItems.get(item$.id as string)?.title).toBe('Original') // save failed, backend unchanged
    expect(item$.val?.title).toBe('Edited while offline') // local state still reflects the edit
    const journaled = await browserOdmStorage.getAllPendingEdits('GenericItem')
    expect(journaled.find(e => e.item_id === item$.id)?.patch).toMatchObject({title: 'Edited while offline'})
  })
})

describe('GenericItemsService/GenericItem$ - sync (realtime) reactivity', () => {
  it('a newer realtime update is applied', async () => {
    const {service, backend} = setup()
    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Original'}))
    await flushMicrotasks()
    item$.applyDataFromDbAndEmit({...item$.val, whenLastModified: new Date(Date.now() - 10_000)} as any) // simulate confirmed baseline

    backend.pushRealtimeModified(item$.id as string, {title: 'Updated remotely', whenLastModified: new Date()})
    await flushMicrotasks()

    expect(item$.val?.title).toBe('Updated remotely')
  })

  it('a stale (older) realtime update never regresses already-shown newer data', async () => {
    const {service, backend} = setup()
    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Original'}))
    await flushMicrotasks()
    const recentTimestamp = new Date()
    item$.applyDataFromDbAndEmit({...item$.val, title: 'Recent', whenLastModified: recentTimestamp} as any)

    backend.pushRealtimeModified(item$.id as string, {title: 'Stale echo', whenLastModified: new Date(recentTimestamp.getTime() - 60_000)})
    await flushMicrotasks()

    expect(item$.val?.title).toBe('Recent')
  })

  it('an incoming update is skipped entirely while a local edit is still unconfirmed (in-flight), regardless of timestamp', async () => {
    const {service, backend} = setup()
    const item$ = service.add(Object.assign(new GenericItem(), {title: 'Original'}))
    await flushMicrotasks()
    backend.shouldFailSave = true // keep this device's next edit permanently "in flight"
    item$.patchNow({title: 'My unsynced edit'} as any)
    await flushMicrotasks()
    expect(item$.hasUnsyncedChanges).toBe(true)

    // A delayed server echo arrives, even with a *newer* timestamp than our edit - must not win.
    backend.pushRealtimeModified(item$.id as string, {title: 'Someone else won the race', whenLastModified: new Date(Date.now() + 60_000)})
    await flushMicrotasks()

    expect(item$.val?.title).toBe('My unsynced edit')
  })
})
