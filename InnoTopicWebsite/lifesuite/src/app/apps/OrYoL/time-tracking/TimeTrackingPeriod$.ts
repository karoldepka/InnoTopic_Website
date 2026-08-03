import {OdmItem$2} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {TimeTrackingPeriodsOdmService} from './time-tracking-periods-odm.service'
import {TimeTrackingPeriodOdm} from './TimeTrackingPeriodOdm'

export class TimeTrackingPeriod$ extends OdmItem$2<
  TimeTrackingPeriod$,
  TimeTrackingPeriodOdm,
  TimeTrackingPeriodOdm,
  TimeTrackingPeriodsOdmService
> {
}
