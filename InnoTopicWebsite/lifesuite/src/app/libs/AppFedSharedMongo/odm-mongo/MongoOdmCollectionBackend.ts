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
  hasMore: boolean
}

interface MongoPendingSave<TRaw> {
  type: 'save'
  id: string
  data: TRaw
  parentIds: ItemId[]
  ancestorIds: ItemId[]
  storeVersionHistory: boolean
  resolve: () => void
  reject: (error: unknown) => void
}

interface MongoPendingDelete {
  type: 'delete'
  id: string
  resolve: () => void
  reject: (error: unknown) => void
}

type MongoPendingMutation<TRaw> = MongoPendingSave<TRaw> | MongoPendingDelete

const ODM_BATCH_SIZE = 200
const ODM_BATCH_DELAY_MS = 25

/** Mirrors NeonOdmCollectionBackend - same HTTP-through-backend shape, since the raw `mongodb`
 * driver speaks a binary wire protocol and can't be used from a browser (and MongoDB shut down
 * the browser-safe Atlas Data API on 2025-09-30), so lifesuite/backend-ts holds the real
 * MONGODB_URI and does the actual read/write. */
export class MongoOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  private http = this.injector.get(HttpClient)
  private apiUrl = ((environment as any).mongo?.odmApiUrl ?? `${environment.aiBackendUrl}/api/odm-mongo`).replace(/\/$/, '')
  private pollIntervalMs = (environment as any).mongo?.pollIntervalMs ?? 5000
  private pollingHandles: number[] = []
  private pendingMutations = new Map<string, MongoPendingMutation<TRaw>[]>()
  private batchFlushTimer: number | undefined

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
    return this.queueMutation(itemId as string, {
      type: 'delete',
      id: itemId as string,
      resolve: () => undefined,
      reject: () => undefined,
    }, owner)
  }

  saveNowToDb(item: TRaw, id: string, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    const owner = this.requireUserId()
    return this.queueMutation(id, {
      type: 'save',
      id,
      data: item,
      parentIds: parentIds ?? (item as any)?.parentIds ?? [],
      ancestorIds: ancestorIds ?? (item as any)?.ancestorIds ?? [],
      storeVersionHistory: !this.opts.dontStoreVersionHistory,
      resolve: () => undefined,
      reject: () => undefined,
    }, owner)
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

    if (queryOpts.parentId) {
      params = params.set('parentId', queryOpts.parentId)
    }
    if (queryOpts.ancestorId) {
      params = params.set('ancestorId', queryOpts.ancestorId)
    }

    const rows: PostgresOdmRow<TRaw>[] = []
    const maxItems = queryOpts.limit ?? Number.POSITIVE_INFINITY
    let offset = 0
    let hasMore = true
    while (hasMore && rows.length < maxItems) {
      const limit = Math.min(ODM_BATCH_SIZE, maxItems - rows.length)
      const response = await this.http
        .get<MongoOdmItemsResponse<TRaw>>(`${this.apiUrl}/items`, {
          params: params.set('limit', String(limit)).set('offset', String(offset)),
        })
        .toPromise()
      const batch = response?.items ?? []
      rows.push(...batch)
      offset += batch.length
      hasMore = response?.hasMore === true && batch.length > 0
    }
    return rows
  }

  private queueMutation(id: string, mutation: MongoPendingMutation<TRaw>, owner: string): Promise<void> {
    return new Promise((resolve, reject) => {
      mutation.resolve = resolve
      mutation.reject = reject
      const pending = this.pendingMutations.get(id) ?? []
      pending.push(mutation)
      this.pendingMutations.set(id, pending)
      if (this.batchFlushTimer === undefined) {
        this.batchFlushTimer = window.setTimeout(() => this.flushMutations(owner), ODM_BATCH_DELAY_MS)
      }
    })
  }

  private async flushMutations(owner: string): Promise<void> {
    this.batchFlushTimer = undefined
    const entries = Array.from(this.pendingMutations.entries()).slice(0, ODM_BATCH_SIZE)
    for (const [id] of entries) this.pendingMutations.delete(id)

    // Only the final mutation for an item needs to reach Mongo; every caller waiting on an older
    // mutation is resolved with that final request, preserving the order seen by the UI.
    const latest = entries.map(([, mutations]) => mutations.at(-1)!).filter(Boolean)
    const saves = latest.filter((mutation): mutation is MongoPendingSave<TRaw> => mutation.type === 'save')
    const deletes = latest.filter((mutation): mutation is MongoPendingDelete => mutation.type === 'delete')
    try {
      await this.http.post(`${this.apiUrl}/items/${encodeURIComponent(this.collectionName)}/batch`, {
        owner,
        items: saves.map(save => ({
          item_id: save.id,
          data: save.data,
          parentIds: save.parentIds,
          ancestorIds: save.ancestorIds,
          storeVersionHistory: save.storeVersionHistory,
        })),
        deleteItemIds: deletes.map(deletion => deletion.id),
      }).toPromise()
      entries.flatMap(([, mutations]) => mutations).forEach(mutation => mutation.resolve())
    } catch (error) {
      entries.flatMap(([, mutations]) => mutations).forEach(mutation => mutation.reject(error))
    }

    if (this.pendingMutations.size && this.batchFlushTimer === undefined) {
      this.batchFlushTimer = window.setTimeout(() => this.flushMutations(owner), 0)
    }
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
