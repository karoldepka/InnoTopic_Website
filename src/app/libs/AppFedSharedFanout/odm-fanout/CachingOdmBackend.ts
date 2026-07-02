import {Injectable, Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {OdmItem__OLD__} from '../../AppFedShared/odm/OdmItem__OLD__'
import {CachingOdmCollectionBackend} from './CachingOdmCollectionBackend'

/**
 * Wraps whichever primary `OdmBackend` is actually selected (Supabase today, but this stays
 * backend-agnostic) and mirrors every item it reads or writes into a local IndexedDB cache
 * (`cacheBackend`, a `BrowserOdmBackend`). The cache is best-effort and never blocks or fails
 * the primary read/write - see `CachingOdmCollectionBackend`.
 */
@Injectable()
export class CachingOdmBackend extends OdmBackend {
  constructor(
    injector: Injector,
    readonly primaryBackend: OdmBackend,
    readonly cacheBackend: OdmBackend,
  ) {
    super(injector)
    this.backendReady$ = primaryBackend.backendReady$
  }

  createCollectionBackend<T extends OdmItem__OLD__<T>>(
    injector: Injector,
    className: string,
    opts: { dontStoreVersionHistory: boolean },
  ): CachingOdmCollectionBackend<any> {
    return new CachingOdmCollectionBackend<T>(injector, className, this, opts)
  }
}
