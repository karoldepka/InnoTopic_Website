import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../odm/OdmService2'
import {OdmItem$2CtorOpts} from '../odm/OdmItem$2'
import {FieldComment, FieldCommentId} from './FieldComment'
import {FieldComment$} from './FieldComment$'

@Injectable({
  providedIn: 'root'
})
export class FieldCommentsOdmService extends OdmService2<
  FieldCommentsOdmService,
  FieldComment,
  FieldComment,
  FieldComment$
> {

  constructor(
    injector: Injector,
  ) {
    super(
      injector,
      'FieldComment'
    )
  }

  override convertFromDbFormat(dbItem: FieldComment): FieldComment {
    return Object.assign(new FieldComment(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: FieldCommentId, inMemVal?: FieldComment): FieldComment$ {
    return new FieldComment$(this, itemId, inMemVal)
  }

  add(val?: FieldComment) {
    const item$ = this.createOdmItem$(undefined, val)
    item$.saveNowToDb()
    return item$
  }

  override createOdmItem$(id?: FieldCommentId, inMemData?: FieldComment, parents?: FieldComment$[], opts?: OdmItem$2CtorOpts): FieldComment$ {
    return new FieldComment$(this, id, inMemData, parents, opts)
  }

}
