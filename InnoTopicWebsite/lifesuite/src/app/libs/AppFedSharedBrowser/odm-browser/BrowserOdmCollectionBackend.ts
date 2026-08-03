import {Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {errorAlert} from '../../AppFedShared/utils/log'
import {
  createPostgresOdmRow,
  rawFromPostgresOdmRow,
} from '../../AppFedSharedPostgres/odm-postgres/PostgresOdmRow'
import {BrowserOdmRow, BrowserOdmStorage} from './BrowserOdmStorage'

export class BrowserOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  private storage = this.injector.get(BrowserOdmStorage)

  public collectionName = this.className

  constructor(
    injector: Injector,
    className: string,
    odmBackend: OdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean, silentErrors?: boolean },
  ) {
    super(injector, className, odmBackend)
  }

  async saveNowToDb(item: TRaw, id: string, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    await this.waitUntilReady()
    const owner = this.requireUserId()
    const row = createPostgresOdmRow(this.collectionName, id, owner, item, parentIds, ancestorIds)
    try {
      await this.storage.put(row)
    } catch (error) {
      this.errorAlert('saveNowToDb IndexedDB put error', error, item, id)
    }
  }

  async deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    await this.waitUntilReady()
    const existing = await this.storage.get<TRaw>(this.collectionName, itemId as string)
    if (!existing) {
      return
    }
    try {
      await this.storage.put({...existing, when_deleted: new Date().toISOString()})
    } catch (error) {
      this.errorAlert('deleteWithoutConfirmation IndexedDB put error', error, itemId)
    }
  }

  override setListener(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    super.setListener(listener, queryOpts, callback)

    this.collectionBackendReady$.subscribe(() => {
      this.fetchRows()
        .then(rows => {
          this.emitRowsAsAdded(rows, listener, queryOpts.limit)
          callback?.()
        })
        .catch(error => this.errorAlert('setListener IndexedDB read error', error))
    })
  }

  loadChildrenOf(parentId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.collectionBackendReady$.subscribe(() => {
      this.fetchRows()
        .then(rows => this.emitRowsAsAdded(rows.filter(row => row.parent_ids?.includes(parentId)), listener))
        .catch(error => this.errorAlert('loadChildrenOf IndexedDB read error', error))
    })
  }

  loadTreeDescendantsOf(ancestorId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.collectionBackendReady$.subscribe(() => {
      this.fetchRows()
        .then(rows => this.emitRowsAsAdded(rows.filter(row => row.ancestor_ids?.includes(ancestorId)), listener))
        .catch(error => this.errorAlert('loadTreeDescendantsOf IndexedDB read error', error))
    })
  }

  /** One-shot snapshot read - IndexedDB has no built-in live-change feed across tabs/contexts.
   * Nothing reads from this backend as a primary source today; it's kept fully functional so
   * it's a real, usable OdmCollectionBackend if it's ever wired in as a fallback/recovery source. */
  private async fetchRows(): Promise<BrowserOdmRow<TRaw>[]> {
    console.log(`[ODM query started] dbType=indexeddb collection=${this.collectionName}`)
    const owner = this.requireUserId()
    const rows = await this.storage.getAllForCollection<TRaw>(this.collectionName)
    // Conflict-archival rows (see BrowserOdmStorage.put()) are recovery-only bookkeeping under a
    // synthetic id, not real items - surfacing them here duplicated the winning item as a second,
    // near-identical entry with garbage metadata (GH #73).
    const filtered = rows.filter(row => row.owner === owner && !row.when_deleted && !row.isConflictArchive)
    console.log(`[ODM query ended] dbType=indexeddb collection=${this.collectionName}`, 'yielded', filtered.length, 'rows')
    return filtered
  }

  private emitRowsAsAdded(rows: BrowserOdmRow<TRaw>[], listener: OdmCollectionBackendListener<TRaw>, limit?: number): void {
    const limited = limit ? rows.slice(0, limit) : rows
    for (const row of limited) {
      listener.onAdded(row.item_id as OdmItemId<TRaw>, rawFromPostgresOdmRow(row))
    }
    listener.onFinishedProcessingChangeSet()
  }

  private requireUserId(): string {
    const userId = this.authService.authUser$.lastVal?.uid
    if (!userId) {
      throw this.errorAlertAndThrow('BrowserOdmCollectionBackend before query - no userId')
    }
    return userId
  }

  // Cache writes are best-effort mirrors, not the source of truth the user's save depends on -
  // a failure here shouldn't interrupt them with a window.alert().
  private errorAlert(...args: any[]) {
    if (this.opts.silentErrors) {
      console.error('[Browser ODM]', 'collectionName', this.collectionName, ...args)
      return
    }
    errorAlert('collectionName', this.collectionName, ...args)
  }

  private errorAlertAndThrow(...args: any[]): never {
    this.errorAlert(...args)
    const cause = args.find(a => a && typeof a === 'object' && typeof a.message === 'string')
    throw new Error(['collectionName', this.collectionName, ...args].map(String).join(' '), cause ? {cause} : undefined)
  }
}
