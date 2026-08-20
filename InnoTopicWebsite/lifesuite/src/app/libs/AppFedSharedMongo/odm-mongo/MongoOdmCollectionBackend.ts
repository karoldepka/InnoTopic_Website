import {HttpClient, HttpParams} from '@angular/common/http'
import {Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {assertTruthy} from '../../AppFedShared/utils/assertUtils'
import {errorAlert} from '../../AppFedShared/utils/log'
import {
  PostgresOdmRow,
  rawFromPostgresOdmRow,
} from '../../AppFedSharedPostgres/odm-postgres/PostgresOdmRow'
import {environment} from '../../../../environments/environment'

interface MongoOdmItemsResponse<TRaw> {
  items: PostgresOdmRow<TRaw>[]
}

/** Mirrors NeonOdmCollectionBackend - same HTTP-through-backend shape, since the raw `mongodb`
 * driver speaks a binary wire protocol and can't be used from a browser (and MongoDB shut down
 * the browser-safe Atlas Data API on 2025-09-30), so lifesuite/backend-ts holds the real
 * MONGODB_URI and does the actual read/write. */
export class MongoOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  private http = this.injector.get(HttpClient)
  private apiUrl = ((environment as any).mongo?.odmApiUrl ?? `${environment.aiBackendUrl}/api/odm-mongo`).replace(/\/$/, '')
  private pollIntervalMs = (environment as any).mongo?.pollIntervalMs ?? 5000
  private pollingHandles: number[] = []

  public collectionName = this.className

  constructor(
    injector: Injector,
    className: string,
    odmBackend: OdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean, silentErrors?: boolean },
  ) {
    super(injector, className, odmBackend)
  }

  deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    const owner = this.requireUserId()
    return this.http
      .post(`${this.apiUrl}/items/${encodeURIComponent(this.collectionName)}/${encodeURIComponent(itemId as string)}/delete`, {owner})
      .toPromise()
  }

  saveNowToDb(item: TRaw, id: string, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    const owner = this.requireUserId()
    return this.http
      .put(`${this.apiUrl}/items/${encodeURIComponent(this.collectionName)}/${encodeURIComponent(id)}`, {
        owner,
        data: item,
        parentIds: parentIds ?? (item as any)?.parentIds ?? [],
        ancestorIds: ancestorIds ?? (item as any)?.ancestorIds ?? [],
        storeVersionHistory: !this.opts.dontStoreVersionHistory,
      })
      .toPromise()
  }

  override setListener(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    super.setListener(listener, queryOpts, callback)

    this.collectionBackendReady$.subscribe(() => {
      this.fetchAndEmit(queryOpts, listener, callback, new Map())
      if (!queryOpts.oneTimeGet && this.pollIntervalMs > 0) {
        const seenRows = new Map<string, string>()
        const handle = window.setInterval(() => {
          this.fetchAndEmit(queryOpts, listener, callback, seenRows, true)
        }, this.pollIntervalMs)
        this.pollingHandles.push(handle)
      }
    })
  }

  loadChildrenOf(parentId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    assertTruthy(parentId, 'parentId')
    this.collectionBackendReady$.subscribe(() => {
      this.fetchAndEmit({parentId} as any, listener, () => undefined, new Map())
    })
  }

  loadTreeDescendantsOf(ancestorId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    assertTruthy(ancestorId, 'ancestorId')
    this.collectionBackendReady$.subscribe(() => {
      this.fetchAndEmit({ancestorId} as any, listener, () => undefined, new Map())
    })
  }

  private fetchAndEmit(
    queryOpts: QueryOpts & {parentId?: ItemId, ancestorId?: ItemId},
    listener: OdmCollectionBackendListener<TRaw>,
    callback: () => void,
    seenRows: Map<string, string>,
    diffAgainstSeen = false,
  ): void {
    this.fetchRows(queryOpts)
      .then(rows => {
        this.emitRows(rows, listener, seenRows, diffAgainstSeen)
        callback?.()
      })
      .catch(error => this.errorAlert('fetchAndEmit error', error))
  }

  private async fetchRows(queryOpts: QueryOpts & {parentId?: ItemId, ancestorId?: ItemId}): Promise<PostgresOdmRow<TRaw>[]> {
    const owner = this.requireUserId()
    let params = new HttpParams()
      .set('collection', this.collectionName)
      .set('owner', owner)

    if (queryOpts.limit) {
      params = params.set('limit', String(queryOpts.limit))
    }
    if (queryOpts.parentId) {
      params = params.set('parentId', queryOpts.parentId)
    }
    if (queryOpts.ancestorId) {
      params = params.set('ancestorId', queryOpts.ancestorId)
    }

    const response = await this.http
      .get<MongoOdmItemsResponse<TRaw>>(`${this.apiUrl}/items`, {params})
      .toPromise()
    return response?.items ?? []
  }

  private emitRows(
    rows: PostgresOdmRow<TRaw>[],
    listener: OdmCollectionBackendListener<TRaw>,
    seenRows: Map<string, string>,
    diffAgainstSeen: boolean,
  ): void {
    const receivedIds = new Set<string>()
    for (const row of rows) {
      const id = row.item_id
      const rowJson = JSON.stringify(row)
      receivedIds.add(id)
      if (!diffAgainstSeen || !seenRows.has(id)) {
        listener.onAdded(id as OdmItemId<TRaw>, rawFromPostgresOdmRow(row))
      } else if (seenRows.get(id) !== rowJson) {
        listener.onModified(id as OdmItemId<TRaw>, rawFromPostgresOdmRow(row))
      }
      seenRows.set(id, rowJson)
    }

    if (diffAgainstSeen) {
      for (const id of Array.from(seenRows.keys())) {
        if (!receivedIds.has(id)) {
          listener.onRemoved(id as OdmItemId<TRaw>)
          seenRows.delete(id)
        }
      }
    }

    listener.onFinishedProcessingChangeSet()
  }

  private requireUserId(): string {
    const userId = this.authService.authUser$.lastVal?.uid
    if (!userId) {
      throw this.errorAlertAndThrow('MongoOdmCollectionBackend before query - no userId')
    }
    return userId
  }

  // When used as a fanout peer, other backends are racing/writing alongside this one, so a
  // Mongo-side failure shouldn't interrupt the user with a window.alert() - just log it.
  private errorAlert(...args: any[]) {
    if (this.opts.silentErrors) {
      console.error('[Mongo ODM]', 'collectionName', this.collectionName, ...args)
      return
    }
    errorAlert('collectionName', this.collectionName, ...args)
  }

  private errorAlertAndThrow(...args: any[]): never {
    this.errorAlert(...args)
    throw new Error(['collectionName', this.collectionName, ...args].map(String).join(' '))
  }
}
