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
import {FeatureService} from '../feature.service'
import {ConfigService} from '../../../apps/OrYoL/core/config.service'
import {g} from '../g'
import {FieldCommentsOdmService} from './field-comments-odm.service'
import {FieldCommentsService} from './field-comments.service'

// Same stub as generic-items.service.spec.ts/BareSlotChildren.spec.ts - OdmItem$2.getParentIds()
// reads appGlobals.feat for a dev-only diagnostic warning outside of real Angular bootstrap.
g.feat = {categoriesTree: {showFixmes: false}} as any

/** Same self-contained fake-backend shape as generic-items.service.spec.ts/BareSlotChildren.spec.ts
 * (see vitest.config.ts's comment on why these specs each keep their own copy rather than a
 * shared glob-swept helper). */
class FakeOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  storedItems = new Map<string, any>()

  async saveNowToDb(item: TRaw, id: ItemId): Promise<any> {
    this.storedItems.set(id as string, {...(item as any)})
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
  const authService = {authUser$: new CachedSubject<{uid: string} | null>({uid: 'owner1'})}
  const syncStatusService = {
    handleSavingPromise: () => undefined,
    handleUnsavedPromise: () => undefined,
    addPendingDownload: () => undefined,
    removePendingDownload: () => undefined,
  }
  const geoLocationService = {geoLocation$: new CachedSubject<any>(undefined)}
  const featureService = {config$: new CachedSubject<any>(g.feat)}
  const configService = {config$: new CachedSubject<any>({})}
  const odmBackend: OdmBackend = {
    backendReady$: new CachedSubject<boolean>(true),
    createCollectionBackend: (injector: Injector, className: string) =>
      new FakeOdmCollectionBackend<any>(injector, className, odmBackend),
  } as unknown as OdmBackend
  const providers = new Map<any, any>([
    [OdmBackend, odmBackend],
    [AuthService, authService],
    [SyncStatusService, syncStatusService],
    [ApfGeoLocationService, geoLocationService],
    [BrowserOdmStorage, new FakeBrowserOdmStorage()],
    [FeatureService, featureService],
    [ConfigService, configService],
  ])
  const injector = {
    get: (token: any) => {
      if (!providers.has(token)) {
        throw new Error(`No fake registered for token: ${token?.name ?? token}`)
      }
      return providers.get(token)
    },
  } as Injector

  const odmService = new FieldCommentsOdmService(injector)
  const service = new FieldCommentsService(injector, odmService)
  return {service}
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('FieldCommentsService', () => {
  it('getCommentsForNode$ only returns comments targeting that node, oldest first', async () => {
    const {service} = setup()

    // Subscribed before any comment exists (matches the other two tests below) - localItems$
    // only reliably reflects a just-added item to a subscriber that was already listening when
    // it landed, not to one that subscribes afterward and expects the accumulated backlog.
    let latest: any[] = []
    service.getCommentsForNode$('item1_field_mood').subscribe(comments => latest = comments)

    service.addComment('item1_field_mood', 'second comment')
    await flushMicrotasks()
    service.addComment('item1_field_mood', 'first comment') // stored after, but whenCreated will still sort by creation order
    await flushMicrotasks()
    service.addComment('item2_field_mood', 'comment on a different node')
    await flushMicrotasks()

    expect(latest.map(c => c.text)).toEqual(['second comment', 'first comment'])
    expect(latest.every(c => c.targetNodeId === 'item1_field_mood')).toBe(true)
  })

  it('addComment trims whitespace and ignores an empty/whitespace-only comment', async () => {
    const {service} = setup()

    service.addComment('item1_field_mood', '   ')
    await flushMicrotasks()

    let latest: any[] = []
    service.getCommentsForNode$('item1_field_mood').subscribe(comments => latest = comments)
    expect(latest).toEqual([])

    service.addComment('item1_field_mood', '  padded text  ')
    await flushMicrotasks()
    expect(latest.map(c => c.text)).toEqual(['padded text'])
  })

  it('reflects a newly-added comment reactively, without needing to re-subscribe', async () => {
    const {service} = setup()

    let latest: any[] = []
    service.getCommentsForNode$('item1_field_mood').subscribe(comments => latest = comments)
    expect(latest).toEqual([])

    service.addComment('item1_field_mood', 'arrived later')
    await flushMicrotasks()

    expect(latest.map(c => c.text)).toEqual(['arrived later'])
  })
})
