import {describe, it, expect, beforeEach} from 'vitest'
import {Injector} from '@angular/core'
import {CachedSubject} from '../../AppFedShared/utils/cachedSubject2/CachedSubject2'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {FanoutOdmCollectionBackend} from './FanoutOdmCollectionBackend'
import {FanoutPeerConfig} from './FanoutOdmBackend'
import {OdmBackfillProgressService} from '../../AppFedShared/odm/odm-backfill-progress.service'

interface SutItem {
  title: string
}

class FakeOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  saveNowToDbCalls: Array<{item: TRaw, id: ItemId}> = []
  deleteWithoutConfirmationCalls: OdmItemId[] = []
  shouldFail = false

  constructor(injector: Injector, className: string, odmBackend: OdmBackend, private readonly label: string) {
    super(injector, className, odmBackend)
  }

  async saveNowToDb(item: TRaw, id: ItemId): Promise<any> {
    this.saveNowToDbCalls.push({item, id})
    if (this.shouldFail) {
      throw new Error(`${this.label} connection interrupted`)
    }
    return {ok: true, label: this.label}
  }

  async deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    this.deleteWithoutConfirmationCalls.push(itemId)
    if (this.shouldFail) {
      throw new Error(`${this.label} connection interrupted`)
    }
  }

  override setListener(listener: OdmCollectionBackendListener<TRaw>, _queryOpts: any, callback: () => void): void {
    listener.onFinishedProcessingChangeSet()
    callback?.()
  }

  loadChildrenOf(): void {}
  loadTreeDescendantsOf(): void {}
}

function fakeOdmBackend<TRaw>(label: string, holder: {instances: FakeOdmCollectionBackend<TRaw>[]}): OdmBackend {
  const odmBackend = {
    backendReady$: new CachedSubject<boolean>(true),
    createCollectionBackend: (injector: Injector, className: string) => {
      const backend = new FakeOdmCollectionBackend<TRaw>(injector, className, odmBackend as unknown as OdmBackend, label)
      holder.instances.push(backend)
      return backend
    },
  } as unknown as OdmBackend
  return odmBackend
}

function createFakeInjector(): Injector {
  const backfillProgress = {
    start: () => undefined,
    finish: () => undefined,
    fail: () => undefined,
    setTotal: () => undefined,
    incrementDone: () => undefined,
  }
  return {
    get(token: any) {
      if (token === OdmBackfillProgressService) {
        return backfillProgress
      }
      return undefined
    },
  } as unknown as Injector
}

function setup() {
  localStorage.setItem('fanoutBackfilled_mongoCollectionsV2_SutItem', 'true')
  const injector = createFakeInjector()
  const supabaseHolder: {instances: FakeOdmCollectionBackend<SutItem>[]} = {instances: []}
  const neonHolder: {instances: FakeOdmCollectionBackend<SutItem>[]} = {instances: []}
  const mongoHolder: {instances: FakeOdmCollectionBackend<SutItem>[]} = {instances: []}
  const supabaseBackend = fakeOdmBackend<SutItem>('supabase', supabaseHolder)
  const peerConfigs: FanoutPeerConfig[] = [
    {backend: supabaseBackend, name: 'Supabase', required: true},
    {backend: fakeOdmBackend<SutItem>('neon', neonHolder), name: 'Neon', required: false},
    {backend: fakeOdmBackend<SutItem>('mongo', mongoHolder), name: 'Mongo', required: false},
  ]
  const fanoutBackend = {
    backendReady$: new CachedSubject<boolean>(true),
    peerBackends: peerConfigs.map(({backend}) => backend),
    peerConfigs,
    backfillSourceBackend: supabaseBackend,
  }
  const collectionBackend = new FanoutOdmCollectionBackend<SutItem>(
    injector,
    'SutItem',
    fanoutBackend as any,
    {dontStoreVersionHistory: false},
  )
  return {
    collectionBackend,
    supabase: supabaseHolder.instances[0],
    neon: neonHolder.instances[0],
    mongo: mongoHolder.instances[0],
  }
}

describe('FanoutOdmCollectionBackend - optional replica failures', () => {
  beforeEach(() => localStorage.removeItem('fanoutBackfilled_mongoCollectionsV2_SutItem'))

  it('saveNowToDb resolves when Supabase succeeds and optional HTTP replicas are unavailable', async () => {
    const {collectionBackend, supabase, neon, mongo} = setup()
    neon.shouldFail = true
    mongo.shouldFail = true

    await expect(collectionBackend.saveNowToDb({title: 'Mission Statements'}, 'item1' as ItemId)).resolves.toBeTruthy()
    expect(supabase.saveNowToDbCalls.length).toBe(1)
    expect(neon.saveNowToDbCalls.length).toBe(1)
    expect(mongo.saveNowToDbCalls.length).toBe(1)
  })

  it('saveNowToDb rejects when the required Supabase peer fails', async () => {
    const {collectionBackend, supabase} = setup()
    supabase.shouldFail = true

    await expect(collectionBackend.saveNowToDb({title: 'Mission Statements'}, 'item1' as ItemId)).rejects.toThrow(/required peer/)
  })
})
