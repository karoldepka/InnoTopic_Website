import {describe, it, expect} from 'vitest'
import {Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {CachedSubject} from '../../AppFedShared/utils/cachedSubject2/CachedSubject2'
import {CachingOdmBackend} from './CachingOdmBackend'
import {CachingOdmCollectionBackend} from './CachingOdmCollectionBackend'

interface SutItem {
  title: string
}

/** Bare-bones fake standing in for a real backend (Supabase/Neon/Browser) - just enough surface
 * for CachingOdmCollectionBackend to drive it, with hooks to simulate an interrupted
 * connection (a save/read that rejects). */
class FakeOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  saveNowToDbCalls: Array<{item: TRaw, id: ItemId}> = []
  shouldFailSave = false
  storedItems = new Map<string, TRaw>()

  constructor(injector: Injector, className: string, odmBackend: OdmBackend, private readonly label: string) {
    super(injector, className, odmBackend)
  }

  async saveNowToDb(item: TRaw, id: ItemId): Promise<any> {
    this.saveNowToDbCalls.push({item, id})
    if (this.shouldFailSave) {
      throw new Error(`${this.label} connection interrupted`)
    }
    this.storedItems.set(id as string, item)
    return {ok: true, label: this.label}
  }

  deleteWithoutConfirmationCalls: OdmItemId[] = []

  async deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    this.deleteWithoutConfirmationCalls.push(itemId)
    if (this.shouldFailSave) {
      throw new Error(`${this.label} connection interrupted`)
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

  loadChildrenOf(): void {
  }

  loadTreeDescendantsOf(): void {
  }

  /** Simulates a realtime event arriving after setListener() already ran - mirrors how
   * SupabaseOdmCollectionBackend.subscribeToChanges pushes postgres_changes events into the
   * same listener over time, independent of the initial snapshot fetch. */
  pushRealtimeAdded(id: string, item: TRaw): void {
    this.listener!.onAdded(id as unknown as OdmItemId<TRaw>, item)
    this.listener!.onFinishedProcessingChangeSet()
  }

  pushRealtimeModified(id: string, item: TRaw): void {
    this.listener!.onModified(id as unknown as OdmItemId<TRaw>, item)
    this.listener!.onFinishedProcessingChangeSet()
  }

  pushRealtimeRemoved(id: string): void {
    this.listener!.onRemoved(id as unknown as OdmItemId<TRaw>)
    this.listener!.onFinishedProcessingChangeSet()
  }
}

function fakeOdmBackend<TRaw>(label: string, backendInstance: {current?: FakeOdmCollectionBackend<TRaw>}): OdmBackend {
  const odmBackend: OdmBackend = {
    backendReady$: new CachedSubject<boolean>(true),
    createCollectionBackend: (injector: Injector, className: string) => {
      const backend = new FakeOdmCollectionBackend<TRaw>(injector, className, odmBackend, label)
      backendInstance.current = backend
      return backend
    },
  } as unknown as OdmBackend
  return odmBackend
}

function createFakeInjector(): Injector {
  return {get: () => undefined} as unknown as Injector
}

function setup() {
  const primaryHolder: {current?: FakeOdmCollectionBackend<SutItem>} = {}
  const cacheHolder: {current?: FakeOdmCollectionBackend<SutItem>} = {}
  const injector = createFakeInjector()
  const primaryBackend = fakeOdmBackend<SutItem>('primary', primaryHolder)
  const cacheBackend = fakeOdmBackend<SutItem>('cache', cacheHolder)
  const cachingBackend = new CachingOdmBackend(injector, primaryBackend, cacheBackend)
  const collectionBackend = new CachingOdmCollectionBackend<SutItem>(injector, 'SutItem', cachingBackend, {dontStoreVersionHistory: false})
  return {collectionBackend, primary: primaryHolder.current!, cache: cacheHolder.current!}
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('CachingOdmCollectionBackend - resilience to an interrupted cache/secondary connection', () => {
  it('saveNowToDb still resolves using the primary result when the cache write fails', async () => {
    const {collectionBackend, primary, cache} = setup()
    cache.shouldFailSave = true

    const result = await collectionBackend.saveNowToDb({title: 'hello'} as SutItem, 'item1' as ItemId)

    expect(result).toEqual({ok: true, label: 'primary'})
    expect(primary.saveNowToDbCalls.length).toBe(1)
  })

  it('a failing cache write does not throw an unhandled rejection or block subsequent saves', async () => {
    const {collectionBackend, cache} = setup()
    cache.shouldFailSave = true

    await collectionBackend.saveNowToDb({title: 'first'} as SutItem, 'item1' as ItemId)
    await collectionBackend.saveNowToDb({title: 'second'} as SutItem, 'item2' as ItemId)
    await flushMicrotasks()

    expect(cache.saveNowToDbCalls.map(c => c.id)).toEqual(['item1', 'item2'])
  })

  it('setListener still delivers primary items to the caller even when mirroring to cache fails', async () => {
    const {collectionBackend, primary, cache} = setup()
    primary.storedItems.set('existing1', {title: 'already there'} as SutItem)
    cache.shouldFailSave = true

    const added: string[] = []
    let finished = false
    collectionBackend.setListener(
      {
        onAdded: id => added.push(id as unknown as string),
        onModified: () => undefined,
        onRemoved: () => undefined,
        onFinishedProcessingChangeSet: () => { finished = true },
      },
      {comments: 'test', oneTimeGet: true},
      () => undefined,
    )
    await flushMicrotasks()

    expect(added).toEqual(['existing1'])
    expect(finished).toBe(true)
  })

  it('deleteWithoutConfirmation still resolves via the primary when the cache delete fails', async () => {
    const {collectionBackend, cache} = setup()
    cache.shouldFailSave = true

    await expect(collectionBackend.deleteWithoutConfirmation('item1' as OdmItemId)).resolves.toBeUndefined()
  })
})

describe('CachingOdmCollectionBackend - mirrors realtime events (not just the initial read) into the cache', () => {
  it('a realtime INSERT (onAdded) is mirrored into the cache', async () => {
    const {collectionBackend, primary, cache} = setup()
    collectionBackend.setListener({onAdded: () => undefined, onModified: () => undefined, onRemoved: () => undefined, onFinishedProcessingChangeSet: () => undefined}, {comments: 'test', oneTimeGet: false}, () => undefined)

    primary.pushRealtimeAdded('newItem', {title: 'from realtime insert'})
    await flushMicrotasks()

    expect(cache.saveNowToDbCalls.map(c => c.id)).toContain('newItem')
    expect(cache.storedItems.get('newItem')).toEqual({title: 'from realtime insert'})
  })

  it('a realtime UPDATE (onModified) is mirrored into the cache', async () => {
    const {collectionBackend, primary, cache} = setup()
    collectionBackend.setListener({onAdded: () => undefined, onModified: () => undefined, onRemoved: () => undefined, onFinishedProcessingChangeSet: () => undefined}, {comments: 'test', oneTimeGet: false}, () => undefined)

    primary.pushRealtimeModified('item1', {title: 'updated via realtime'})
    await flushMicrotasks()

    expect(cache.storedItems.get('item1')).toEqual({title: 'updated via realtime'})
  })

  it('a realtime DELETE (onRemoved) removes the row from the cache too', async () => {
    const {collectionBackend, primary, cache} = setup()
    cache.storedItems.set('item1', {title: 'will be deleted'})
    collectionBackend.setListener({onAdded: () => undefined, onModified: () => undefined, onRemoved: () => undefined, onFinishedProcessingChangeSet: () => undefined}, {comments: 'test', oneTimeGet: false}, () => undefined)

    primary.pushRealtimeRemoved('item1')
    await flushMicrotasks()

    expect(cache.deleteWithoutConfirmationCalls).toContain('item1')
    expect(cache.storedItems.has('item1')).toBe(false)
  })

  it('a realtime DELETE still reaches the caller even if the cache delete fails', async () => {
    const {collectionBackend, primary, cache} = setup()
    cache.shouldFailSave = true

    let removedId: string | undefined
    collectionBackend.setListener(
      {onAdded: () => undefined, onModified: () => undefined, onRemoved: id => { removedId = id as unknown as string }, onFinishedProcessingChangeSet: () => undefined},
      {comments: 'test', oneTimeGet: false},
      () => undefined,
    )

    primary.pushRealtimeRemoved('item1')
    await flushMicrotasks()

    expect(removedId).toBe('item1')
  })
})
