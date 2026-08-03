import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../../../libs/AppFedShared/odm/OdmService2'
import {OdmItem$2CtorOpts} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {OryOdmItem, OryOdmItemId} from './OryOdmItem'
import {OryOdmItem$} from './OryOdmItem$'

/** Content items for the ODM-backed OrYoL tree (`SupabaseTreeService`) - one row per tree node,
 * collection `'OryItem'`. Tree position/ordering lives on `OryNodeInclusionsOdmService`
 * instead, not here (see `OryOdmItem$`). */
@Injectable({providedIn: 'root'})
export class OryOdmItemsService extends OdmService2<
  OryOdmItemsService,
  OryOdmItem,
  OryOdmItem,
  OryOdmItem$
> {
  constructor(injector: Injector) {
    super(injector, 'OryItem')
  }

  override convertFromDbFormat(dbItem: OryOdmItem): OryOdmItem {
    return Object.assign(new OryOdmItem(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: OryOdmItemId, inMemVal?: OryOdmItem): OryOdmItem$ {
    return new OryOdmItem$(this, itemId, inMemVal)
  }

  override createOdmItem$(id?: OryOdmItemId, inMemData?: OryOdmItem, parents?: OryOdmItem$[], opts?: OdmItem$2CtorOpts): OryOdmItem$ {
    return new OryOdmItem$(this, id, inMemData, parents, opts)
  }

  add(val?: OryOdmItem): OryOdmItem$ {
    const item$ = this.createOdmItem$(undefined, val ?? new OryOdmItem())
    item$.saveNowToDb()
    return item$
  }
}
