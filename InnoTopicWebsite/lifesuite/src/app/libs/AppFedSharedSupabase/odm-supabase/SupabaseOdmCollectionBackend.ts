import {Injector} from '@angular/core'
import {HttpClient} from '@angular/common/http'
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
import {stripHtml} from '../../AppFedShared/utils/html-utils'
import {appGlobals} from '../../AppFedShared/g'

interface EmbeddingResponse {
  embedding: number[]
  model: string
  dimensions: number
}

// Postgres's own now() reflects transaction *start*, not commit, so under concurrent writes
// commit order isn't guaranteed to match server_modified_at order - a strict .gte(cursor)
// could permanently miss a row that commits just after the cursor advances past it. Query
// with a trailing buffer instead; the small overlap of already-seen rows is a harmless,
// idempotent no-op against the cache. See docs/odm-incremental-sync-plan.md.
const SYNC_CURSOR_BUFFER_MS = 10 * 60 * 1000

export class SupabaseOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  private static realtimeChannelErrorCollectionsLogged = new Set<string>()

  private supabase = this.injector.get(SupabaseOdmClientService).getClient()
  private http = this.injector.get(HttpClient)
  private browserOdmStorage = this.injector.get(BrowserOdmStorage)
  private tableName = (environment as any).supabase?.odmItemsTable ?? 'lifesuite_odm_items'
  private historyTableName = (environment as any).supabase?.odmHistoryTable ?? 'lifesuite_odm_item_history'
  private schema = (environment as any).supabase?.schema ?? 'public'
  private channelNameCounter = 0
  /** Shared by the browser's `online` event and Supabase's `SUBSCRIBED` callback, which often
   * arrive together after a brief outage. */
  private reconnectCatchUpPromise?: Promise<void>

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
    await this.waitUntilReady()
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

  async saveNowToDb(item: TRaw, id: string, parentIds?: ItemId[], ancestorIds?: ItemId[], changedFieldsOnly?: Partial<TRaw>): Promise<any> {
    await this.waitUntilReady()
    const owner = this.requireUserId()
    const row = createPostgresOdmRow(this.collectionName, id, owner, item, parentIds, ancestorIds)
    this.debugSave(item, id, parentIds, ancestorIds, changedFieldsOnly)

    // odm_items' primary key column is `id` (not `item_id` like odm_item_history) - rename on the way out.
    const {item_id, ...rowWithoutItemId} = row as any
    const {error} = await this.supabase
      .from(this.tableName)
      .upsert({...rowWithoutItemId, id: item_id}, {onConflict: 'collection,id'})

    if (error) {
      throw this.errorAlertAndThrow('saveNowToDb upsert error', error, item, id)
    }

    // Embeddings are derived data. Save the user's item first, then update pgvector in the
    // background so an unavailable AI provider never blocks the offline-first persistence path.
    if (this.collectionName === 'LearnItem') {
      void this.syncLearnItemQuestionEmbedding(item, id, owner)
    }

    // History is best-effort - a failure here (e.g. RLS) shouldn't stop the item itself from saving.
    if (!this.opts.dontStoreVersionHistory) {
      await this.saveToHistory(row).catch(error => this.errorAlert('saveToHistory insert error', error))
    }
  }

  private async syncLearnItemQuestionEmbedding(item: TRaw, id: string, owner: string): Promise<void> {
    const raw = item as any
    const rawQuestion = typeof raw?.title === 'string' ? raw.title : ''
    const rawAnswer = typeof raw?.answer === 'string' ? raw.answer : ''
    const question = stripHtml(rawQuestion)?.replace(/\s+/g, ' ').trim() ?? ''
    const isQuestionAndAnswer = !!question && !!stripHtml(rawAnswer)?.trim()

    try {
      const {data: current, error: readError} = await this.supabase
        .from(this.tableName)
        .select('embedding_text,embedding_model')
        .eq('collection', this.collectionName)
        .eq('id', id)
        .eq('owner', owner)
        .maybeSingle()
      if (readError) throw readError

      if (!isQuestionAndAnswer) {
        if (current?.embedding_text) {
          const {error} = await this.supabase
            .from(this.tableName)
            .update({embedding: null, embedding_text: null, embedding_model: null} as any)
            .eq('collection', this.collectionName)
            .eq('id', id)
            .eq('owner', owner)
          if (error) throw error
        }
        return
      }

      const embeddingModel = 'nomic-embed-text'
      if (current?.embedding_text === question && current?.embedding_model === embeddingModel) return

      const response = await this.http
        .post<EmbeddingResponse>(environment.backendUrl ? `${environment.backendUrl}/embeddings` : '/api/embeddings', {text: question})
        .toPromise()
      if (!response?.embedding?.length) throw new Error('Embedding API returned no vector')

      const {error} = await this.supabase
        .from(this.tableName)
        .update({
          embedding: `[${response.embedding.join(',')}]`,
          embedding_text: question,
          embedding_model: response.model,
        } as any)
        .eq('collection', this.collectionName)
        .eq('id', id)
        .eq('owner', owner)
        // Prevent an older embedding request from winning if this item changed while in flight.
        .contains('data', {title: rawQuestion, answer: rawAnswer})
      if (error) throw error
    } catch (error) {
      this.errorAlert('syncLearnItemQuestionEmbedding error', error)
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
        this.subscribeToChanges(listener, queryOpts, callback)
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

  private buildFetchQuery(
    queryOpts: QueryOpts & {parentId?: ItemId, ancestorId?: ItemId},
    owner: string,
    cursor: string | undefined,
    includeDeleted = false,
  ) {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('collection', this.collectionName)
      .eq('owner', owner)
      .order('when_last_modified', {ascending: false})

    if (!includeDeleted) {
      query = query.is('when_deleted', null)
    }

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

  private async fetchRows(
    queryOpts: QueryOpts & {parentId?: ItemId, ancestorId?: ItemId},
    includeDeleted = false,
  ): Promise<PostgresOdmRow<TRaw>[]> {
    const owner = this.requireUserId()
    // The sync cursor only makes sense for the general/unscoped query - loadChildrenOf/
    // loadTreeDescendantsOf need completeness for their scoped query, not just recent changes.
    const isScoped = !!(queryOpts.parentId || queryOpts.ancestorId)
    const cursor = isScoped || queryOpts.ignoreSyncCursor
      ? undefined
      : await this.browserOdmStorage.getSyncCursor(this.collectionName)
    this.debugLog(`[ODM query started] dbType=supabase collection=${this.collectionName}`, {...queryOpts, cursor})

    let rows: any[]
    if (queryOpts.limit) {
      const offset = queryOpts.offset ?? 0
      let query = this.buildFetchQuery(queryOpts, owner, cursor, includeDeleted)
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
        const {data, error} = await this.buildFetchQuery(queryOpts, owner, cursor, includeDeleted).range(from, from + pageSize - 1)
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

    // Only a full, unlimited pass (the .range()-paginated branch above) actually saw every row
    // up to "now" and can safely advance the cursor. A limited/`queryOpts.limit` fetch (e.g.
    // opts1's fast "most recently modified N" preview, ordered by when_last_modified desc) only
    // saw the newest rows - advancing the cursor from its max server_modified_at would make the
    // very next unscoped fetch's `.gte(cursor - buffer)` skip everything older than ~10 minutes
    // before that preview's newest row, silently hiding the rest of the collection.
    if (!isScoped && !queryOpts.limit && rows.length > 0) {
      const maxServerModifiedAt = rows.reduce((max, row) => row.server_modified_at > max ? row.server_modified_at : max, rows[0].server_modified_at)
      this.browserOdmStorage.updateSyncCursor(this.collectionName, maxServerModifiedAt)
        .catch(error => this.errorAlert('updateSyncCursor error', error))
    }

    this.debugLog(`[ODM query ended] dbType=supabase collection=${this.collectionName}`, {...queryOpts, cursor}, 'yielded', rows.length, 'rows')
    return rows.map(row => this.fromOdmItemsRow(row))
  }

  /** odm_items' primary key column is `id` (odm_item_history's is still `item_id`) - rename on the way in. */
  private fromOdmItemsRow(row: any): PostgresOdmRow<TRaw> {
    const {id, ...rest} = row
    return {...rest, item_id: id} as PostgresOdmRow<TRaw>
  }

  private subscribeToChanges(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    const owner = this.requireUserId()
    // Set once the channel first reaches SUBSCRIBED - distinguishes the initial connect (the
    // setListener() fetchRows() call above already loaded the starting state) from a later
    // reconnect after a drop.
    let hasConnectedBefore = false
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
          // A channel error is non-fatal, so keep it out of the normal console stream.
          this.debugRealtimeChannelError()
        } else if (status === 'SUBSCRIBED') {
          if (hasConnectedBefore) {
            // Reconnecting after a drop (network hiccup, tab backgrounded and throttled, etc.).
            // Realtime does not replay events missed while disconnected, so anything changed in
            // that window (e.g. an item another device synced while this one was offline) would
            // otherwise be silently missed until the next full page reload. Re-run the same
            // incremental, cursor-based fetch used on initial load to catch up.
            void this.catchUpAfterReconnect(queryOpts, listener, callback)
          }
          hasConnectedBefore = true
        }
      })

    // Belt-and-suspenders alongside the channel's own SUBSCRIBED-after-a-drop path above: the
    // browser's `online` event is the more reliable/immediate signal on mobile/backgrounded tabs,
    // where the OS can suspend the realtime WebSocket for a while after connectivity actually
    // returns before it gets around to reconnecting on its own. Same pattern as
    // OdmService2.resumePendingEditsNow()'s outbound-edit counterpart. Only fires once this
    // backend has connected at least once (skips a redundant, merely-idempotent catch-up racing
    // the initial setListener() fetch on a normal online page load).
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (hasConnectedBefore) {
          void this.catchUpAfterReconnect(queryOpts, listener, callback)
        }
      })
    }

    void channel
  }

  /** The realtime *channel* reconnecting (SUBSCRIBED firing again) is a separate concern from the
   * plain REST catch-up fetchRows() call above actually succeeding - a transient blip on the
   * PostgREST endpoint right at that moment would otherwise silently and permanently miss whatever
   * changed during the disconnect window, since nothing else re-triggers this catch-up until
   * another full channel disconnect/reconnect cycle happens (which may never happen again). Retry
   * a few times with a short backoff before giving up and surfacing an error. */
  private async catchUpAfterReconnect(
    queryOpts: QueryOpts,
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    callback: () => void,
  ): Promise<void> {
    if (!this.reconnectCatchUpPromise) {
      this.reconnectCatchUpPromise = this.performReconnectCatchUp(queryOpts, listener, callback)
        .finally(() => {
          this.reconnectCatchUpPromise = undefined
        })
    }
    return this.reconnectCatchUpPromise
  }

  private async performReconnectCatchUp(
    queryOpts: QueryOpts,
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    callback: () => void,
  ): Promise<void> {
    const maxAttempts = 3
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Include soft-deleted rows too: Realtime cannot replay deletes that happened while the
        // WebSocket was disconnected, so the incremental server fetch must turn those tombstones
        // into local removes as well as upserting changed live rows.
        const rows = await this.fetchRows(queryOpts, true)
        this.emitRowsAsChanges(rows, listener)
        callback?.()
        return
      } catch (error) {
        if (attempt === maxAttempts) {
          this.errorAlert(`subscribeToChanges reconnect catch-up error (gave up after ${maxAttempts} attempts)`, error)
          return
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  private emitRowsAsAdded(rows: PostgresOdmRow<TRaw>[], listener: OdmCollectionBackendListener<TRaw>): void {
    for (const row of rows) {
      listener.onAdded(row.item_id as OdmItemId<TRaw>, rawFromPostgresOdmRow(row))
    }
    listener.onFinishedProcessingChangeSet()
  }

  private emitRowsAsChanges(rows: PostgresOdmRow<TRaw>[], listener: OdmCollectionBackendListener<TRaw>): void {
    for (const row of rows) {
      const itemId = row.item_id as OdmItemId<TRaw>
      if ((row as any).when_deleted) {
        listener.onRemoved(itemId)
      } else {
        // `onAdded` is deliberately an upsert in OdmService2, so it covers both a new server row
        // and a modification to one that was already in the local cache.
        listener.onAdded(itemId, rawFromPostgresOdmRow(row))
      }
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
    // Stringifying an object arg (e.g. Supabase's {message, details, hint, code} error) via
    // String(...) collapses it to "[object Object]", losing the actual failure reason (e.g.
    // "TypeError: Failed to fetch" for an offline write) - preserve it as `cause` so callers
    // further up (SyncStatusService's network-error detection) can still see it.
    const cause = args.find(a => a && typeof a === 'object' && typeof a.message === 'string')
    throw new Error(['collectionName', this.collectionName, ...args].map(String).join(' '), cause ? {cause} : undefined)
  }

  private debugLog(...args: any[]) {
    if (appGlobals.feat?.showDebug) {
      console.log(...args)
    }
  }

  private debugSave(
    item: TRaw,
    id: string,
    parentIds?: ItemId[],
    ancestorIds?: ItemId[],
    changedFieldsOnly?: Partial<TRaw>,
  ) {
    if (!appGlobals.feat?.showDebug) {
      return
    }
    const changedFieldNames = changedFieldsOnly ? Object.keys(changedFieldsOnly as object) : undefined
    const fieldNames = Object.keys((changedFieldsOnly ?? item ?? {}) as object)
    const fieldsSummary = fieldNames.length
      ? `${fieldNames.slice(0, 12).join(', ')}${fieldNames.length > 12 ? `, +${fieldNames.length - 12} more` : ''}`
      : '(no enumerable fields)'
    console.log(
      `[Supabase ODM] saveNowToDb: full-row upsert for ${this.collectionName}/${id}`,
      {
        what: `Writing ${this.collectionName}/${id} to Supabase table ${this.tableName}.`,
        why: 'OdmService2 is flushing a local item change to the remote sync backend; any durable pending edit for this item can be cleared after the write succeeds.',
        requestedBy: changedFieldNames
          ? 'incremental local patch path (Supabase backend still stores a full row snapshot)'
          : 'full document save path (new item or explicit full save)',
        fields: fieldsSummary,
        parentIdsCount: parentIds?.length ?? 0,
        ancestorIdsCount: ancestorIds?.length ?? 0,
      },
    )
  }

  private debugRealtimeChannelError() {
    if (!appGlobals.feat?.showDebug || SupabaseOdmCollectionBackend.realtimeChannelErrorCollectionsLogged.has(this.collectionName)) {
      return
    }
    SupabaseOdmCollectionBackend.realtimeChannelErrorCollectionsLogged.add(this.collectionName)
    console.warn('[Supabase ODM] Realtime channel error', 'collectionName', this.collectionName)
  }
}
