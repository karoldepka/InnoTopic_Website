import {Injector} from '@angular/core'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {ConcurrencyLimiter} from '../../AppFedShared/utils/promiseUtils'
import {FanoutOdmBackend} from './FanoutOdmBackend'

export class FanoutOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  public collectionName = this.className

  /** Reads happen only against this one; it's also the one whose promise/errors callers see. */
  private primary: OdmCollectionBackend<TRaw>
  /** Written to on every save/delete, and backfilled with everything read from `primary`. */
  private secondaries: OdmCollectionBackend<TRaw>[]

  // A full-collection load can stream thousands of items in one burst - without a cap,
  // one fetch() per secondary per item exhausts the browser's connection pool
  // (net::ERR_INSUFFICIENT_RESOURCES) and writes past that point just fail.
  private replicationLimiter = new ConcurrencyLimiter(6)

  constructor(
    injector: Injector,
    className: string,
    private fanoutBackend: FanoutOdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean },
  ) {
    super(injector, className, fanoutBackend)
    this.primary = fanoutBackend.primaryBackend.createCollectionBackend<TRaw>(injector, className, opts)
    // Secondaries are best-effort mirrors - Firestore staying the primary is what the user's
    // save actually depends on, so a Supabase/Neon hiccup shouldn't pop a window.alert().
    const secondaryOpts = {...opts, silentErrors: true}
    this.secondaries = fanoutBackend.secondaryBackends.map(backend =>
      backend.createCollectionBackend<TRaw>(injector, className, secondaryOpts)
    )
  }

  saveNowToDb(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[], changedFieldsOnly?: Partial<TRaw>): Promise<any> {
    this.replicateToSecondaries(item, id, parentIds, ancestorIds, changedFieldsOnly)
    return this.primary.saveNowToDb(item, id, parentIds, ancestorIds, changedFieldsOnly)
  }

  deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    for (const secondary of this.secondaries) {
      // Secondaries already log their own failures (silentErrors) - nothing more to do here.
      this.replicationLimiter.run(() => secondary.deleteWithoutConfirmation(itemId)).catch(() => undefined)
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
      // Secondaries already log their own failures (silentErrors) - nothing more to do here.
      this.replicationLimiter
        .run(() => secondary.saveNowToDb(item, id as ItemId, parentIds, ancestorIds, changedFieldsOnly))
        .catch(() => undefined)
    }
  }
}
