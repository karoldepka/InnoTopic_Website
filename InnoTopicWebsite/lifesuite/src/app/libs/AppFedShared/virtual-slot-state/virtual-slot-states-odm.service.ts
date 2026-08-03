import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../odm/OdmService2'
import {OdmItem$2CtorOpts} from '../odm/OdmItem$2'
import {VirtualSlotState, VirtualSlotStateId} from './VirtualSlotState'
import {VirtualSlotState$} from './VirtualSlotState$'

@Injectable({
  providedIn: 'root'
})
export class VirtualSlotStatesOdmService extends OdmService2<
  VirtualSlotStatesOdmService,
  VirtualSlotState,
  VirtualSlotState,
  VirtualSlotState$
> {

  constructor(
    injector: Injector,
  ) {
    super(
      injector,
      'VirtualSlotState'
    )
  }

  override convertFromDbFormat(dbItem: VirtualSlotState): VirtualSlotState {
    return Object.assign(new VirtualSlotState(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: VirtualSlotStateId, inMemVal?: VirtualSlotState): VirtualSlotState$ {
    return new VirtualSlotState$(this, itemId, inMemVal)
  }

  override createOdmItem$(id?: VirtualSlotStateId, inMemData?: VirtualSlotState, parents?: VirtualSlotState$[], opts?: OdmItem$2CtorOpts): VirtualSlotState$ {
    return new VirtualSlotState$(this, id, inMemData, parents, opts)
  }

}
