import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../../../libs/AppFedShared/odm/OdmService2'
import {OdmItem$2CtorOpts} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {OryNodeInclusionData, OryNodeInclusionId} from './OryNodeInclusionData'
import {OryNodeInclusion$} from './OryNodeInclusion$'

/** Parent/child links for the ODM-backed OrYoL tree, collection `'OryNodeInclusion'` - see
 * `OryNodeInclusion$` for why this is a separate collection from the items themselves. */
@Injectable({providedIn: 'root'})
export class OryNodeInclusionsOdmService extends OdmService2<
  OryNodeInclusionsOdmService,
  OryNodeInclusionData,
  OryNodeInclusionData,
  OryNodeInclusion$
> {
  constructor(injector: Injector) {
    super(injector, 'OryNodeInclusion')
  }

  override convertFromDbFormat(dbItem: OryNodeInclusionData): OryNodeInclusionData {
    return Object.assign(new OryNodeInclusionData(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: OryNodeInclusionId, inMemVal?: OryNodeInclusionData): OryNodeInclusion$ {
    return new OryNodeInclusion$(this, itemId, inMemVal)
  }

  override createOdmItem$(id?: OryNodeInclusionId, inMemData?: OryNodeInclusionData, parents?: OryNodeInclusion$[], opts?: OdmItem$2CtorOpts): OryNodeInclusion$ {
    return new OryNodeInclusion$(this, id, inMemData, parents, opts)
  }
}
