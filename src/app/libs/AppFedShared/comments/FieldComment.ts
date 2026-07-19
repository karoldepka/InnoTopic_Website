import {OdmItemId} from '../odm/OdmItemId'
import {OdmInMemItem} from '../odm/OdmItem$2'

export type FieldCommentId = OdmItemId<FieldComment>

/** A single comment attached to a node - real (a normal item) or virtual (a fabricated slot id
 * like `abcdefgh_field_mood`, per GH #89 "every field should be commentable-on"). Flat
 * collection, no tree/parent structure - same shape as `TimeTrackingPeriodOdm`. */
export class FieldComment extends OdmInMemItem {
  targetNodeId?: string
  text?: string
}
