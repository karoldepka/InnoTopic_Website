import {describe, it, expect, beforeEach} from 'vitest'
import {Injector} from '@angular/core'
import {AuthService} from '../../../auth/auth.service'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {OdmCollectionBackendListener} from '../../AppFedShared/odm/OdmCollectionBackend'
import {CachedSubject} from '../../AppFedShared/utils/cachedSubject2/CachedSubject2'
import {BrowserOdmCollectionBackend} from './BrowserOdmCollectionBackend'
import {BrowserOdmRow, BrowserOdmStorage} from './BrowserOdmStorage'

interface SutItem {
  title: string
}

/** Mock adapter standing in for `BrowserOdmStorage` - a plain in-memory Map implementing the
 * same put/get/getAllForCollection/delete surface, so `BrowserOdmCollectionBackend`'s own
 * logic (row construction, owner/parent/ancestor filtering, soft-delete) can be tested without
 * touching real IndexedDB at all. */
class MockBrowserOdmStorage {
  private rows = new Map<string, BrowserOdmRow<any>>()

  async put<TRaw>(row: any): Promise<BrowserOdmRow<TRaw>> {
    const key = `${row.collection}::${row.item_id}`
    const existing = this.rows.get(key)
    const now = new Date().toISOString()
    const merged: BrowserOdmRow<TRaw> = {
      ...row,
      key,
      whenFirstStoredLocally: existing?.whenFirstStoredLocally ?? now,
      whenLastStoredLocally: now,
    }
    this.rows.set(key, merged)
    return merged
  }

  async get<TRaw>(collection: string, itemId: string): Promise<BrowserOdmRow<TRaw> | undefined> {
    return this.rows.get(`${collection}::${itemId}`)
  }

  async getAllForCollection<TRaw>(collection: string): Promise<BrowserOdmRow<TRaw>[]> {
    return Array.from(this.rows.values()).filter(row => row.collection === collection)
  }

  async delete(collection: string, itemId: string): Promise<void> {
    this.rows.delete(`${collection}::${itemId}`)
  }
}

function createFakeInjector(storage: MockBrowserOdmStorage, owner = 'owner1'): Injector {
  const authService = {authUser$: new CachedSubject<{uid: string} | null>({uid: owner})}
  const providers = new Map<any, any>()
  providers.set(BrowserOdmStorage, storage)
  providers.set(AuthService, authService)
  return {
    get: (token: any) => {
      if (!providers.has(token)) {
        throw new Error(`No mock registered for token: ${token?.name ?? token}`)
      }
      return providers.get(token)
    },
  } as Injector
}

function createFakeOdmBackend(): OdmBackend {
  return {backendReady$: new CachedSubject<boolean>(true)} as unknown as OdmBackend
}

function collectAdded<TRaw>() {
  const added: Array<{id: string, data: TRaw}> = []
  let finishedCount = 0
  const listener: OdmCollectionBackendListener<TRaw> = {
    onAdded: (id, data) => added.push({id: id as unknown as string, data}),
    onModified: () => undefined,
    onRemoved: () => undefined,
    onFinishedProcessingChangeSet: () => { finishedCount++ },
  }
  return {listener, added, finishedCount: () => finishedCount}
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('BrowserOdmCollectionBackend (mock storage adapter)', () => {
  let storage: MockBrowserOdmStorage
  let backend: BrowserOdmCollectionBackend<SutItem>

  beforeEach(() => {
    storage = new MockBrowserOdmStorage()
    const injector = createFakeInjector(storage)
    backend = new BrowserOdmCollectionBackend<SutItem>(injector, 'SutItem', createFakeOdmBackend(), {dontStoreVersionHistory: false})
  })

  it('saveNowToDb stores the item under (collection, id) via the storage adapter', async () => {
    await backend.saveNowToDb({title: 'hello'} as SutItem, 'item1')

    const stored = await storage.get<SutItem>('SutItem', 'item1')
    expect(stored?.data.title).toBe('hello')
    expect(stored?.owner).toBe('owner1')
    expect(stored?.collection).toBe('SutItem')
  })

  it('setListener emits every stored item for this collection, scoped to the current owner', async () => {
    await backend.saveNowToDb({title: 'mine'} as SutItem, 'mine1')
    await storage.put({collection: 'SutItem', item_id: 'notMine', owner: 'someoneElse', data: {title: 'not mine'}})

    const {listener, added, finishedCount} = collectAdded<SutItem>()
    let callbackCalled = false
    backend.setListener(listener, {comments: 'test', oneTimeGet: true} as any, () => { callbackCalled = true })
    await flushMicrotasks()

    expect(added.map(a => a.id)).toEqual(['mine1'])
    expect(finishedCount()).toBe(1)
    expect(callbackCalled).toBe(true)
  })

  it('loadChildrenOf only emits items whose parent_ids include the given parent', async () => {
    await backend.saveNowToDb({title: 'child'} as SutItem, 'child1', ['parent1' as any])
    await backend.saveNowToDb({title: 'other'} as SutItem, 'other1', ['parent2' as any])

    const {listener, added} = collectAdded<SutItem>()
    backend.loadChildrenOf('parent1' as any, listener)
    await flushMicrotasks()

    expect(added.map(a => a.id)).toEqual(['child1'])
  })

  it('deleteWithoutConfirmation soft-deletes: row is stamped when_deleted and excluded from later reads', async () => {
    await backend.saveNowToDb({title: 'to delete'} as SutItem, 'item1')

    await backend.deleteWithoutConfirmation('item1' as any)

    const {listener, added} = collectAdded<SutItem>()
    backend.setListener(listener, {comments: 'test', oneTimeGet: true} as any, () => undefined)
    await flushMicrotasks()

    expect(added.length).toBe(0)
    const stored = await storage.get<SutItem>('SutItem', 'item1')
    expect(stored?.when_deleted).toBeTruthy()
  })

  it('excludes conflict-archival rows from setListener (GH #73 - these are recovery-only ' +
    'bookkeeping under a synthetic id, and were previously surfacing as duplicate items)', async () => {
    await backend.saveNowToDb({title: 'the real entry'} as SutItem, 'item1')
    // Simulates what BrowserOdmStorage.put() writes for a losing/conflicting edit: its own row,
    // under its own synthetic id, flagged isConflictArchive.
    await storage.put({
      collection: 'SutItem',
      item_id: 'item1_conflict_2024-01-01T00-00-00-000Z',
      owner: 'owner1',
      data: {title: 'the real entry'},
      isConflictArchive: true,
    })

    const {listener, added} = collectAdded<SutItem>()
    backend.setListener(listener, {comments: 'test', oneTimeGet: true} as any, () => undefined)
    await flushMicrotasks()

    expect(added.map(a => a.id)).toEqual(['item1'])
  })
})
