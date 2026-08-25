import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {Subject} from 'rxjs'
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {OdmBackend} from './OdmBackend'
import {OdmCollectionBackend, ItemId} from './OdmCollectionBackend'
import {OdmService2, OdmServiceOpts} from './OdmService2'
import {OdmItem$2} from './OdmItem$2'
import {SyncStatusService} from './sync-status.service'
import {AuthService} from '../../../auth/auth.service'
import {ApfGeoLocationService} from '../geo-location/apf-geo-location.service'
import {BrowserOdmStorage} from '../../AppFedSharedBrowser/odm-browser/BrowserOdmStorage'

class FakeCollectionBackend extends OdmCollectionBackend<any> {
  saveNowToDb = vi.fn()
  deleteWithoutConfirmation = vi.fn()
  override setListener() {}
  loadChildrenOf() {}
  loadTreeDescendantsOf() {}
}

class FakeOdmBackend extends OdmBackend {
  readonly collectionBackend = new FakeCollectionBackend({get: () => undefined} as any, 'TestItem', this)

  constructor() {
    super({get: () => undefined} as any)
    this.backendReady$.next(true)
  }

  createCollectionBackend() {
    return this.collectionBackend
  }
}

class TestOdmService extends OdmService2<any, any, any, any, any> {
  protected createOdmItem$ForExisting(itemId: ItemId): any {
    return new (OdmItem$2 as any)(this, itemId)
  }
}

function makeService() {
  const authUser$ = new CachedSubject<any>()
  const backend = new FakeOdmBackend()
  const pendingEdits = [{
    key: 'TestItem::item-1',
    collection: 'TestItem',
    item_id: 'item-1',
    patch: {title: 'queued'},
    whenLastModified: new Date().toISOString(),
  }]
  const browserOdmStorage = {
    pendingEditsChanged$: new Subject<void>(),
    conflictDetected$: new Subject<void>(),
    getAllPendingEdits: vi.fn(async () => pendingEdits),
    getAllPendingEditsEverywhere: vi.fn(async () => pendingEdits),
    get: vi.fn(async () => undefined),
    savePendingEdit: vi.fn(async () => undefined),
    clearPendingEdit: vi.fn(async () => undefined),
    getConflictedItemIds: vi.fn(async () => new Set()),
  }
  const syncStatusService = {handleSavingPromise: vi.fn()}
  const injector = {
    get(token: any) {
      if (token === OdmBackend) return backend
      if (token === AuthService) return {authUser$}
      if (token === SyncStatusService) return syncStatusService
      if (token === ApfGeoLocationService) return {geoLocation$: {lastVal: undefined}}
      if (token === BrowserOdmStorage) return browserOdmStorage
      throw new Error(`Unexpected token: ${token?.name ?? token}`)
    },
  } as any
  const opts = new OdmServiceOpts()
  opts.dontLoadAllAutomatically = true
  const service = new TestOdmService(injector, 'TestItem', opts)
  return {service, backend, browserOdmStorage, authUser$}
}

describe('OdmService2 pending edit retry', () => {
  let navigatorOnLineSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    navigatorOnLineSpy = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  })
  afterEach(() => {
    navigatorOnLineSpy.mockRestore()
    vi.useRealTimers()
  })

  it('retries durably queued edits after a failed save without waiting for another online event', async () => {
    const {backend, authUser$} = makeService()
    backend.collectionBackend.saveNowToDb
      .mockRejectedValueOnce(new Error('network interrupted'))
      .mockResolvedValueOnce(undefined)

    authUser$.next({uid: 'user-1'})
    await vi.advanceTimersByTimeAsync(0)
    expect(backend.collectionBackend.saveNowToDb).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(5_000)
    expect(backend.collectionBackend.saveNowToDb).toHaveBeenCalledTimes(2)
  })
})
