import {Injector} from '@angular/core'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {ConcurrencyLimiter} from '../../AppFedShared/utils/promiseUtils'
import {CachingOdmBackend} from './CachingOdmBackend'

/** Same wrap-and-mirror shape as `FanoutOdmCollectionBackend`, but with a single fixed
 * secondary (the local IndexedDB cache) instead of a configurable list of remote mirrors. */
export class CachingOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  public collectionName = this.className

  private primary: OdmCollectionBackend<TRaw>
  private cache: OdmCollectionBackend<TRaw>

  // A full-collection load can stream thousands of items in one burst - cap how many
  // IndexedDB writes run at once rather than firing them all simultaneously.
  private mirrorLimiter = new ConcurrencyLimiter(6)

  constructor(
    injector: Injector,
    className: string,
    private cachingBackend: CachingOdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean },
  ) {
    super(injector, className, cachingBackend)
    this.primary = cachingBackend.primaryBackend.createCollectionBackend<TRaw>(injector, className, opts)
    // A cache-write failure must never block or alert on the primary save/read.
    const cacheOpts = {...opts, silentErrors: true}
    this.cache = cachingBackend.cacheBackend.createCollectionBackend<TRaw>(injector, className, cacheOpts)
  }

  saveNowToDb(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[], changedFieldsOnly?: Partial<TRaw>): Promise<any> {
    this.mirrorToCache(item, id, parentIds, ancestorIds)
    return this.primary.saveNowToDb(item, id, parentIds, ancestorIds, changedFieldsOnly)
  }

  deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    // The cache already logs its own failures (silentErrors) - nothing more to do here.
    this.mirrorLimiter.run(() => this.cache.deleteWithoutConfirmation(itemId)).catch(() => undefined)
    return this.primary.deleteWithoutConfirmation(itemId)
  }

  override setListener(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    super.setListener(listener, queryOpts, callback)
    this.primary.setListener(this.wrapListenerWithMirroring(listener), queryOpts, callback)
  }

  loadChildrenOf(parentId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.primary.loadChildrenOf(parentId, this.wrapListenerWithMirroring(listener))
  }

  loadTreeDescendantsOf(ancestorId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.primary.loadTreeDescendantsOf(ancestorId, this.wrapListenerWithMirroring(listener))
  }

  /** Mirrors every item read from `primary` into the local cache, so it stays populated just
   * from normal app usage, on top of the write-time mirroring in `mirrorToCache`. */
  private wrapListenerWithMirroring(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
  ): OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>> {
    return {
      onAdded: (id, data) => {
        this.mirrorToCache(data, id as ItemId)
        listener.onAdded(id, data)
      },
      onModified: (id, data) => {
        this.mirrorToCache(data, id as ItemId)
        listener.onModified(id, data)
      },
      onRemoved: id => {
        // Cache already logs its own failures (silentErrors) - nothing more to do here.
        this.mirrorLimiter.run(() => this.cache.deleteWithoutConfirmation(id)).catch(() => undefined)
        listener.onRemoved(id)
      },
      onFinishedProcessingChangeSet: () => listener.onFinishedProcessingChangeSet(),
    }
  }

  private mirrorToCache(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[]): void {
    this.mirrorLimiter.run(() => this.cache.saveNowToDb(item, id, parentIds, ancestorIds)).catch(() => undefined)
  }
}
