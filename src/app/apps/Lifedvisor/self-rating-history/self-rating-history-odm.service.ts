import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../../../libs/AppFedShared/odm/OdmService2'
import {SelfRatingHistoryItem, SelfRatingHistoryItemId} from './SelfRatingHistoryItem'
import {SelfRatingHistoryItem$} from './SelfRatingHistoryItem$'

/** ODM collection `'SelfRatingHistoryItem'` - see SelfRatingHistoryItem.ts's doc comment. */
@Injectable({
  providedIn: 'root'
})
export class SelfRatingHistoryOdmService extends OdmService2<
  SelfRatingHistoryOdmService,
  SelfRatingHistoryItem,
  SelfRatingHistoryItem,
  SelfRatingHistoryItem$
> {

  constructor(
    injector: Injector,
  ) {
    super(
      injector,
      'SelfRatingHistoryItem'
    )
  }

  override convertFromDbFormat(dbItem: SelfRatingHistoryItem): SelfRatingHistoryItem {
    return Object.assign(new SelfRatingHistoryItem(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: SelfRatingHistoryItemId, inMemVal?: SelfRatingHistoryItem): SelfRatingHistoryItem$ {
    return new SelfRatingHistoryItem$(this, itemId, inMemVal)
  }

  add(val?: SelfRatingHistoryItem) {
    const item$ = this.createOdmItem$(undefined, val)
    item$.saveNowToDb()
    return item$
  }

  override createOdmItem$(id?: SelfRatingHistoryItemId, inMemData?: SelfRatingHistoryItem, parents?: SelfRatingHistoryItem$[]): SelfRatingHistoryItem$ {
    return new SelfRatingHistoryItem$(this, id, inMemData, parents)
  }

}
