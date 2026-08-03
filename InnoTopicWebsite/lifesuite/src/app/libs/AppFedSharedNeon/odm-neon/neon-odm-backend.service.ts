import {Injectable, Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {OdmItem__OLD__} from '../../AppFedShared/odm/OdmItem__OLD__'
import {NeonOdmCollectionBackend} from './NeonOdmCollectionBackend'

@Injectable()
export class NeonOdmBackend extends OdmBackend {
  constructor(
    injector: Injector,
  ) {
    super(injector)
    this.initDb()
  }

  createCollectionBackend<T extends OdmItem__OLD__<T>>(
    injector: Injector,
    className: string,
    opts: {dontStoreVersionHistory: boolean},
  ): NeonOdmCollectionBackend<any> {
    return new NeonOdmCollectionBackend<T>(injector, className, this, opts)
  }

  protected initDb() {
    this.authService.authUser$.subscribe(user => {
      if (user) {
        this.backendReady$.nextWithCache(true)
      }
    })
  }
}
