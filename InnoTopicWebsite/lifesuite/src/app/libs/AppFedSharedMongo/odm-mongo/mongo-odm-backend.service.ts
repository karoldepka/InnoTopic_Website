import {Injectable, Injector} from '@angular/core'
import {OdmBackend} from '../../AppFedShared/odm/OdmBackend'
import {OdmItem__OLD__} from '../../AppFedShared/odm/OdmItem__OLD__'
import {MongoOdmCollectionBackend} from './MongoOdmCollectionBackend'

@Injectable()
export class MongoOdmBackend extends OdmBackend {
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
  ): MongoOdmCollectionBackend<any> {
    return new MongoOdmCollectionBackend<T>(injector, className, this, opts)
  }

  protected initDb() {
    this.authService.authUser$.subscribe(user => {
      if (user) {
        this.backendReady$.nextWithCache(true)
      }
    })
  }
}
