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
    // The cache is now the real read/write source the app depends on (see setListener below),
    // so a primary (e.g. Supabase) failure means "sync degraded, will catch up later," not
    // "app is broken" - silentErrors on both sides is what makes the app actually work
    // completely offline instead of throwing a blocking window.alert() on every failed request.
    const silentOpts = {...opts, silentErrors: true}
    this.primary = cachingBackend.primaryBackend.createCollectionBackend<TRaw>(injector, className, silentOpts)
    this.cache = cachingBackend.cacheBackend.createCollectionBackend<TRaw>(injector, className, silentOpts)
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
    // Replay everything already known locally first (fast, works offline, and is what makes
    // "app must work completely offline" true even on a launch that hasn't synced yet) - then
    // layer the primary's live/incremental read on top inside the cache's own callback, so the
    // cache replay always lands first. No `limit` on the cache read: that cap exists to bound
    // expensive remote reads, not cheap local ones - the cache should always give everything
    // it has. Cache-sourced items aren't re-mirrored (they just came from there).
    this.cache.setListener(listener, {...queryOpts, limit: undefined, oneTimeGet: true}, () => {
      this.primary.setListener(this.wrapListenerWithMirroring(listener), queryOpts, callback)
    })
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
