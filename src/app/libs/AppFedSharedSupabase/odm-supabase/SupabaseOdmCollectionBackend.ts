import {Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {errorAlert, errorAlertAndThrow} from '../../AppFedShared/utils/log'
import {assertTruthy} from '../../AppFedShared/utils/assertUtils'
import {
  createPostgresOdmRow,
  PostgresOdmRow,
  rawFromPostgresOdmRow,
} from '../../AppFedSharedPostgres/odm-postgres/PostgresOdmRow'
import {SupabaseOdmClientService} from './supabase-odm-client.service'
import {environment} from '../../../../environments/environment'

export class SupabaseOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  private supabase = this.injector.get(SupabaseOdmClientService).getClient()
  private tableName = (environment as any).supabase?.odmItemsTable ?? 'lifesuite_odm_items'
  private historyTableName = (environment as any).supabase?.odmHistoryTable ?? 'lifesuite_odm_item_history'
  private schema = (environment as any).supabase?.schema ?? 'public'
  private channelNameCounter = 0

  public collectionName = this.className

  constructor(
    injector: Injector,
    className: string,
    odmBackend: OdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean },
  ) {
    super(injector, className, odmBackend)
  }

  async deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    const owner = this.requireUserId()
    const {error} = await this.supabase
      .from(this.tableName)
      .update({when_deleted: new Date().toISOString()})
      .eq('collection', this.collectionName)
      .eq('item_id', itemId as string)
      .eq('owner', owner)
    if (error) {
      throw this.errorAlertAndThrow('deleteWithoutConfirmation error', error)
    }
  }

  async saveNowToDb(item: TRaw, id: string, parentIds?: ItemId[], ancestorIds?: ItemId[]): Promise<any> {
    const owner = this.requireUserId()
    const row = createPostgresOdmRow(this.collectionName, id, owner, item, parentIds, ancestorIds)

    if (!this.opts.dontStoreVersionHistory) {
      await this.saveToHistory(row)
    }

    const {error} = await this.supabase
      .from(this.tableName)
      .upsert(row as any, {onConflict: 'collection,item_id'})

    if (error) {
      throw this.errorAlertAndThrow('saveNowToDb upsert error', error, item, id)
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
      throw this.errorAlertAndThrow('saveToHistory insert error', error)
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

  private async fetchRows(queryOpts: QueryOpts & {parentId?: ItemId, ancestorId?: ItemId}): Promise<PostgresOdmRow<TRaw>[]> {
    const owner = this.requireUserId()
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('collection', this.collectionName)
      .eq('owner', owner)
      .is('when_deleted', null)
      .order('when_last_modified', {ascending: false})

    if (queryOpts.limit) {
      query = query.limit(queryOpts.limit)
    }
    if (queryOpts.parentId) {
      query = query.contains('parent_ids', [queryOpts.parentId])
    }
    if (queryOpts.ancestorId) {
      query = query.contains('ancestor_ids', [queryOpts.ancestorId])
    }

    const {data, error} = await query
    if (error) {
      throw error
    }
    return (data ?? []) as PostgresOdmRow<TRaw>[]
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
          const row = (payload.new ?? payload.old) as PostgresOdmRow<TRaw>
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
          this.errorAlert('Supabase realtime channel error', this.collectionName)
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

  private errorAlert(...args: any[]) {
    errorAlert('collectionName', this.collectionName, ...args)
  }

  private errorAlertAndThrow(...args: any[]) {
    return errorAlertAndThrow('collectionName', this.collectionName, ...args)
  }
}
