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

// Same stub as generic-items.service.spec.ts/BareSlotChildren.spec.ts - OdmItem$2.getParentIds()
// reads appGlobals.feat for a dev-only diagnostic warning outside of real Angular bootstrap.
g.feat = {categoriesTree: {showFixmes: false}} as any

/** Same self-contained fake-backend shape as the other specs in this directory (see
 * vitest.config.ts's comment on why each spec keeps its own copy rather than a shared helper). */
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

describe('OdmItem$2 - descendant rollups (getDescendantsCount/getWhenDescendantLastModified)', () => {
  it('counts a simple, single-parent subtree correctly', async () => {
    const {service} = setup()
    const root$ = service.add(Object.assign(new GenericItem(), {title: 'Root'}))
    await flushMicrotasks()
    const child1$ = root$.createChild({title: 'Child 1'} as any)
    const child2$ = root$.createChild({title: 'Child 2'} as any)
    await flushMicrotasks()
    child1$.createChild({title: 'Grandchild'} as any)
    await flushMicrotasks()

    expect(root$.getDescendantsCount()).toBe(3)
  })

  it('does NOT double-count a descendant reachable via two different parent paths (many-to-many tree)', async () => {
    const {service} = setup()
    const root$ = service.add(Object.assign(new GenericItem(), {title: 'Root'}))
    await flushMicrotasks()
    const branchA$ = root$.createChild({title: 'Branch A'} as any)
    const branchB$ = root$.createChild({title: 'Branch B'} as any)
    await flushMicrotasks()

    // A single item shared under both branches - createChild() only sets one parent, so wire the
    // second parent relationship directly the same way OdmItem$2 itself tracks multi-parent (via
    // `parents`), then re-emit both branches' childrenList$ so getChildren() picks it up.
    const shared$ = branchA$.createChild({title: 'Shared'} as any)
    await flushMicrotasks()
    ;(shared$ as any).parents = [...((shared$ as any).parents ?? []), branchB$]
    branchB$.childrenList$.nextWithCache([...(branchB$.getChildren()), shared$])

    // Root's total descendants: branchA, branchB, shared - NOT branchA, branchB, shared, shared.
    expect(root$.getDescendantsCount()).toBe(3)
  })

  it('getWhenDescendantLastModified returns the latest whenLastModified among descendants, not the item itself', async () => {
    const {service} = setup()
    const root$ = service.add(Object.assign(new GenericItem(), {title: 'Root'}))
    await flushMicrotasks()
    const older$ = root$.createChild({title: 'Older child'} as any)
    await flushMicrotasks()
    const newer$ = root$.createChild({title: 'Newer child'} as any)
    await flushMicrotasks()

    // createChild() already stamps whenLastModified via setLastModifiedIfNecessary() at save
    // time, in creation order - newer$ was created after older$, so it should win.
    const latest = root$.getWhenDescendantLastModified()
    expect(latest).toEqual((newer$.val as any)?.whenLastModified)
  })

  it('an item with no children has zero descendants and no whenDescendantLastModified', async () => {
    const {service} = setup()
    const leaf$ = service.add(Object.assign(new GenericItem(), {title: 'Leaf'}))
    await flushMicrotasks()

    expect(leaf$.getDescendantsCount()).toBe(0)
    expect(leaf$.getWhenDescendantLastModified()).toBeUndefined()
  })
})
