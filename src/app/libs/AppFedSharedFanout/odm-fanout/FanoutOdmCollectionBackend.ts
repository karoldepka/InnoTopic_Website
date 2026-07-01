import {Injector} from '@angular/core'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {errorAlert} from '../../AppFedShared/utils/log'
import {FanoutOdmBackend} from './FanoutOdmBackend'

export class FanoutOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  public collectionName = this.className

  /** Reads happen only against this one; it's also the one whose promise/errors callers see. */
  private primary: OdmCollectionBackend<TRaw>
  /** Written to on every save/delete, and backfilled with everything read from `primary`. */
  private secondaries: OdmCollectionBackend<TRaw>[]

  constructor(
    injector: Injector,
    className: string,
    private fanoutBackend: FanoutOdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean },
  ) {
    super(injector, className, fanoutBackend)
    this.primary = fanoutBackend.primaryBackend.createCollectionBackend<TRaw>(injector, className, opts)
    this.secondaries = fanoutBackend.secondaryBackends.map(backend =>
      backend.createCollectionBackend<TRaw>(injector, className, opts)
    )
  }

  saveNowToDb(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[], changedFieldsOnly?: Partial<TRaw>): Promise<any> {
    this.replicateToSecondaries(item, id, parentIds, ancestorIds, changedFieldsOnly)
    return this.primary.saveNowToDb(item, id, parentIds, ancestorIds, changedFieldsOnly)
  }

  deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    for (const secondary of this.secondaries) {
      secondary.deleteWithoutConfirmation(itemId)
        .catch(error => this.errorAlert('fanout secondary deleteWithoutConfirmation failed', error))
    }
    return this.primary.deleteWithoutConfirmation(itemId)
  }

  override setListener(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    super.setListener(listener, queryOpts, callback)
    this.primary.setListener(this.wrapListenerWithReplication(listener), queryOpts, callback)
  }

  loadChildrenOf(parentId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.primary.loadChildrenOf(parentId, this.wrapListenerWithReplication(listener))
  }

  loadTreeDescendantsOf(ancestorId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.primary.loadTreeDescendantsOf(ancestorId, this.wrapListenerWithReplication(listener))
  }

  /** Mirrors every item read from `primary` into the secondary backends, so historical data
   * gets backfilled into Postgres just by being loaded, on top of the write-time fanout. */
  private wrapListenerWithReplication(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
  ): OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>> {
    return {
      onAdded: (id, data) => {
        this.replicateToSecondaries(data, id)
        listener.onAdded(id, data)
      },
      onModified: (id, data) => {
        this.replicateToSecondaries(data, id)
        listener.onModified(id, data)
      },
      onRemoved: id => listener.onRemoved(id),
      onFinishedProcessingChangeSet: () => listener.onFinishedProcessingChangeSet(),
    }
  }

  private replicateToSecondaries(
    item: TRaw,
    id: ItemId | OdmItemId<TRaw>,
    parentIds?: ItemId[],
    ancestorIds?: ItemId[],
    changedFieldsOnly?: Partial<TRaw>,
  ): void {
    for (const secondary of this.secondaries) {
      secondary.saveNowToDb(item, id as ItemId, parentIds, ancestorIds, changedFieldsOnly)
        .catch(error => this.errorAlert('fanout secondary saveNowToDb failed', error))
    }
  }

  private errorAlert(...args: any[]) {
    errorAlert('collectionName', this.collectionName, ...args)
  }
}
