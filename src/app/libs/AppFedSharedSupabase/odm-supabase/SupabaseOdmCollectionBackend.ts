import {Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {errorAlert} from '../../AppFedShared/utils/log'
import {assertTruthy} from '../../AppFedShared/utils/assertUtils'
import {
  createPostgresOdmRow,
  PostgresOdmRow,
  rawFromPostgresOdmRow,
} from '../../AppFedSharedPostgres/odm-postgres/PostgresOdmRow'
import {SupabaseOdmClientService} from './supabase-odm-client.service'
import {environment} from '../../../../environments/environment'
import {BrowserOdmStorage} from '../../AppFedSharedBrowser/odm-browser/BrowserOdmStorage'

// Postgres's own now() reflects transaction *start*, not commit, so under concurrent writes
// commit order isn't guaranteed to match server_modified_at order - a strict .gte(cursor)
// could permanently miss a row that commits just after the cursor advances past it. Query
// with a trailing buffer instead; the small overlap of already-seen rows is a harmless,
// idempotent no-op against the cache. See docs/odm-incremental-sync-plan.md.
const SYNC_CURSOR_BUFFER_MS = 10 * 60 * 1000

export class SupabaseOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  private supabase = this.injector.get(SupabaseOdmClientService).getClient()
  private browserOdmStorage = this.injector.get(BrowserOdmStorage)
  private tableName = (environment as any).supabase?.odmItemsTable ?? 'lifesuite_odm_items'
  private historyTableName = (environment as any).supabase?.odmHistoryTable ?? 'lifesuite_odm_item_history'
  private schema = (environment as any).supabase?.schema ?? 'public'
  private channelNameCounter = 0

  public collectionName = this.className

  constructor(
    injector: Injector,
    className: string,
    odmBackend: OdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean, silentErrors?: boolean },
  ) {
    super(injector, className, odmBackend)
  }

  async deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    const owner = this.requireUserId()
    const {error} = await this.supabase
      .from(this.tableName)
      .update({when_deleted: new Date().toISOString()})
      .eq('collection', this.collectionName)
      .eq('id', itemId as string)
      .eq('owner', owner)
    if (error) {
      throw this.errorAlertAndThrow('deleteWithoutConfirmation error', error)
    }
  }

  async saveNowToDb(item: TRaw, id: string, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    const owner = this.requireUserId()
    const row = createPostgresOdmRow(this.collectionName, id, owner, item, parentIds, ancestorIds)
    console.log(`[Supabase ODM] -> ${this.collectionName}/${id}`)

    // odm_items' primary key column is `id` (not `item_id` like odm_item_history) - rename on the way out.
    const {item_id, ...rowWithoutItemId} = row as any
    const {error} = await this.supabase
      .from(this.tableName)
      .upsert({...rowWithoutItemId, id: item_id}, {onConflict: 'collection,id'})

    if (error) {
      throw this.errorAlertAndThrow('saveNowToDb upsert error', error, item, id)
    }

    // History is best-effort - a failure here (e.g. RLS) shouldn't stop the item itself from saving.
    if (!this.opts.dontStoreVersionHistory) {
      await this.saveToHistory(row).catch(error => this.errorAlert('saveToHistory insert error', error))
    }
  }

  private async saveToHistory(row: PostgresOdmRow<TRaw>): Promise<void> {
    const {error} = await this.supabase
      .from(this.historyTableName)
      .insert({
        history_id: this.createHistoryId(row.item_id),
        collection: row.collection,
        item_id: row.item_id,
        owner: row.owner,
        data: row.data,
        parent_ids: row.parent_ids,
        ancestor_ids: row.ancestor_ids,
        snapshot_at: new Date().toISOString(),
      } as any)

    if (error) {
      throw error
    }
  }

  override setListener(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    super.setListener(listener, queryOpts, callback)

    this.collectionBackendReady$.subscribe(() => {
      this.fetchRows(queryOpts)
        .then(rows => {
          this.emitRowsAsAdded(rows, listener)
          callback?.()
        })
        .catch(error => this.errorAlert('setListener fetchRows error', error))

      if (!queryOpts.oneTimeGet) {
        this.subscribeToChanges(listener, callback)
      }
    })
  }

  loadChildrenOf(parentId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    assertTruthy(parentId, 'parentId')
    this.collectionBackendReady$.subscribe(() => {
      this.fetchRows({parentId} as any)
        .then(rows => this.emitRowsAsAdded(rows, listener))
        .catch(error => this.errorAlert('loadChildrenOf error', error))
    })
  }

  loadTreeDescendantsOf(ancestorId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    assertTruthy(ancestorId, 'ancestorId')
    this.collectionBackendReady$.subscribe(() => {
      this.fetchRows({ancestorId} as any)
        .then(rows => this.emitRowsAsAdded(rows, listener))
        .catch(error => this.errorAlert('loadTreeDescendantsOf error', error))
    })
  }

  private buildFetchQuery(queryOpts: QueryOpts & {parentId?: ItemId, ancestorId?: ItemId}, owner: string, cursor: string | undefined) {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('collection', this.collectionName)
      .eq('owner', owner)
      .is('when_deleted', null)
      .order('when_last_modified', {ascending: false})

    if (queryOpts.parentId) {
      query = query.contains('parent_ids', [queryOpts.parentId])
    }
    if (queryOpts.ancestorId) {
      query = query.contains('ancestor_ids', [queryOpts.ancestorId])
    }
    if (cursor) {
      const bufferedCursor = new Date(new Date(cursor).getTime() - SYNC_CURSOR_BUFFER_MS).toISOString()
      query = query.gte('server_modified_at', bufferedCursor)
    }
    return query
  }

  private async fetchRows(queryOpts: QueryOpts & {parentId?: ItemId, ancestorId?: ItemId}): Promise<PostgresOdmRow<TRaw>[]> {
    const owner = this.requireUserId()
    // The sync cursor only makes sense for the general/unscoped query - loadChildrenOf/
    // loadTreeDescendantsOf need completeness for their scoped query, not just recent changes.
    const isScoped = !!(queryOpts.parentId || queryOpts.ancestorId)
    const cursor = isScoped ? undefined : await this.browserOdmStorage.getSyncCursor(this.collectionName)

    let rows: any[]
    if (queryOpts.limit) {
      const offset = queryOpts.offset ?? 0
      let query = this.buildFetchQuery(queryOpts, owner, cursor)
      query = offset > 0 ? query.range(offset, offset + queryOpts.limit - 1) : query.limit(queryOpts.limit)
      const {data, error} = await query
      if (error) {
        throw error
      }
      rows = (data ?? []) as any[]
    } else {
      // No limit means "get everything" (e.g. loadAllItemsFromServer) - PostgREST silently
      // caps unpaginated responses at its own db-max-rows setting (defaults to 1000), so this
      // has to page through with .range() rather than rely on a single unbounded select.
      const pageSize = 1000
      rows = []
      for (let from = 0; ; from += pageSize) {
        const {data, error} = await this.buildFetchQuery(queryOpts, owner, cursor).range(from, from + pageSize - 1)
        if (error) {
          throw error
        }
        const page = (data ?? []) as any[]
        rows.push(...page)
        if (page.length < pageSize) {
          break
        }
      }
    }

    if (!isScoped && rows.length > 0) {
      const maxServerModifiedAt = rows.reduce((max, row) => row.server_modified_at > max ? row.server_modified_at : max, rows[0].server_modified_at)
      this.browserOdmStorage.updateSyncCursor(this.collectionName, maxServerModifiedAt)
        .catch(error => this.errorAlert('updateSyncCursor error', error))
    }

    return rows.map(row => this.fromOdmItemsRow(row))
  }

  /** odm_items' primary key column is `id` (odm_item_history's is still `item_id`) - rename on the way in. */
  private fromOdmItemsRow(row: any): PostgresOdmRow<TRaw> {
    const {id, ...rest} = row
    return {...rest, item_id: id} as PostgresOdmRow<TRaw>
  }

  private subscribeToChanges(listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>, callback: () => void): void {
    const owner = this.requireUserId()
    const channel = this.supabase
      .channel(`${this.collectionName}-odm-${++this.channelNameCounter}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: this.schema,
          table: this.tableName,
          filter: `collection=eq.${this.collectionName}`,
        },
        (payload: any) => {
          const rawRow = payload.new ?? payload.old
          const row = rawRow ? this.fromOdmItemsRow(rawRow) : undefined
          if (!row || row.collection !== this.collectionName || row.owner !== owner) {
            return
          }
          if (payload.eventType === 'DELETE' || row.when_deleted) {
            listener.onRemoved(row.item_id as OdmItemId<TRaw>)
          } else if (payload.eventType === 'INSERT') {
            listener.onAdded(row.item_id as OdmItemId<TRaw>, rawFromPostgresOdmRow(row))
          } else {
            listener.onModified(row.item_id as OdmItemId<TRaw>, rawFromPostgresOdmRow(row))
          }
          listener.onFinishedProcessingChangeSet()
          callback?.()
        }
      )
      .subscribe((status: string) => {
        if (status === 'CHANNEL_ERROR') {
          // Realtime is a live-update enhancement; the initial fetch already loaded data.
          // A channel error is non-fatal, so log only rather than showing a blocking alert.
          console.error('[Supabase ODM] Realtime channel error', 'collectionName', this.collectionName)
        }
      })

    void channel
  }

  private emitRowsAsAdded(rows: PostgresOdmRow<TRaw>[], listener: OdmCollectionBackendListener<TRaw>): void {
    for (const row of rows) {
      listener.onAdded(row.item_id as OdmItemId<TRaw>, rawFromPostgresOdmRow(row))
    }
    listener.onFinishedProcessingChangeSet()
  }

  private requireUserId(): string {
    const userId = this.authService.authUser$.lastVal?.uid
    if (!userId) {
      throw this.errorAlertAndThrow('SupabaseOdmCollectionBackend before query - no userId')
    }
    return userId
  }

  private createHistoryId(itemId: string): string {
    return `${itemId}_${new Date().toISOString().replace(/[:.]/g, '-')}`
  }

  // When used as a fanout secondary, Firestore (or Neon) is already the primary source of
  // truth, so a Supabase-side failure shouldn't interrupt the user with a window.alert() -
  // just log it and let the fanout retry on the next save.
  private errorAlert(...args: any[]) {
    if (this.opts.silentErrors) {
      console.error('[Supabase ODM]', 'collectionName', this.collectionName, ...args)
      return
    }
    errorAlert('collectionName', this.collectionName, ...args)
  }

  private errorAlertAndThrow(...args: any[]): never {
    this.errorAlert(...args)
    throw new Error(['collectionName', this.collectionName, ...args].map(String).join(' '))
  }
}
