import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../../../libs/AppFedShared/odm/OdmService2'
import {TimeTrackingPeriodOdm, TimeTrackingPeriodOdmId} from './TimeTrackingPeriodOdm'
import {TimeTrackingPeriod$} from './TimeTrackingPeriod$'

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingPeriodsOdmService extends OdmService2<
  TimeTrackingPeriodsOdmService,
  TimeTrackingPeriodOdm,
  TimeTrackingPeriodOdm,
  TimeTrackingPeriod$
> {

  constructor(
    injector: Injector,
  ) {
    super(
      injector,
      'TimeTrackingPeriod'
    )
  }

  override convertFromDbFormat(dbItem: TimeTrackingPeriodOdm): TimeTrackingPeriodOdm {
    return Object.assign(new TimeTrackingPeriodOdm(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: TimeTrackingPeriodOdmId, inMemVal?: TimeTrackingPeriodOdm): TimeTrackingPeriod$ {
    return new TimeTrackingPeriod$(this, itemId, inMemVal)
  }

  add(val?: TimeTrackingPeriodOdm) {
    const item$ = this.createOdmItem$(undefined, val)
    item$.saveNowToDb()
    return item$
  }

  override createOdmItem$(id?: TimeTrackingPeriodOdmId, inMemData?: TimeTrackingPeriodOdm, parents?: TimeTrackingPeriod$[]): TimeTrackingPeriod$ {
    return new TimeTrackingPeriod$(this, id, inMemData, parents)
  }

}
