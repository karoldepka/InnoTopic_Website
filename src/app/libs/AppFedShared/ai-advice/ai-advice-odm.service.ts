import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../odm/OdmService2'
import {OdmItem$2CtorOpts} from '../odm/OdmItem$2'
import {AiAdvice, AiAdviceId} from './AiAdvice'
import {AiAdvice$} from './AiAdvice$'

@Injectable({
  providedIn: 'root'
})
export class AiAdviceOdmService extends OdmService2<
  AiAdviceOdmService,
  AiAdvice,
  AiAdvice,
  AiAdvice$
> {

  constructor(
    injector: Injector,
  ) {
    super(
      injector,
      'AiAdvice'
    )
  }

  override convertFromDbFormat(dbItem: AiAdvice): AiAdvice {
    return Object.assign(new AiAdvice(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: AiAdviceId, inMemVal?: AiAdvice): AiAdvice$ {
    return new AiAdvice$(this, itemId, inMemVal)
  }

  override createOdmItem$(id?: AiAdviceId, inMemData?: AiAdvice, parents?: AiAdvice$[], opts?: OdmItem$2CtorOpts): AiAdvice$ {
    return new AiAdvice$(this, id, inMemData, parents, opts)
  }

  /** Creates and immediately saves a new advice row - GH #137's "store on server, reusing our
   * sync code" ask. One row per generation (a running history), not a patch onto a singleton. */
  add(val: AiAdvice): AiAdvice$ {
    const item$ = this.createOdmItem$(undefined, val)
    item$.saveNowToDb()
    return item$
  }

}
