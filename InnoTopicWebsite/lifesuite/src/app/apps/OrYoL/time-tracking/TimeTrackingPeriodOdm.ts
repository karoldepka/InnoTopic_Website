import {OdmItemId} from '../../../libs/AppFedShared/odm/OdmItemId'
import {OdmInMemItem} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {OdmTimestamp} from '../../../libs/AppFedShared/odm/OdmBackend'

export type TimeTrackingPeriodOdmId = OdmItemId<TimeTrackingPeriodOdm>

/** A single tracked start->end interval for a time-trackable item (tree node, or a reserved
 * non-tree anchor like Mindfulness's `_mindfulness`) - flat collection, no tree/parent structure. */
export class TimeTrackingPeriodOdm extends OdmInMemItem {
  itemId?: string
  start?: OdmTimestamp
  /** null (not just missing) while still running, so it's distinguishable from "not yet set". */
  end?: OdmTimestamp | null
  /** Quiz-only aggregate for completed Q&As during this tracked period. */
  quizAnswerCount?: number
  quizAnswerDurationMs?: number
}
