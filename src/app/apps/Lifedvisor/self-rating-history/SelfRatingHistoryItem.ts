import {OdmItemId} from '../../../libs/AppFedShared/odm/OdmItemId'
import {OdmInMemItem} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {OdmTimestamp} from '../../../libs/AppFedShared/odm/OdmBackend'

export type SelfRatingHistoryItemId = OdmItemId<SelfRatingHistoryItem>

/** A single 5-star self-rating event against a rateable subject (currently only /ask hints,
 * identified by their stable `LiHint.id`) - flat, append-only log, one row per rating given,
 * never overwritten, so a subject's rating history over time is preserved (GH issue #31). */
export class SelfRatingHistoryItem extends OdmInMemItem {
  subjectId?: string
  /** 0-5 star value (StarRatingComponent's own scale), stored as given - no rescaling. */
  rating?: number
  whenRated?: OdmTimestamp
}
