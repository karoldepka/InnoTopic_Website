import {OdmItemId} from '../../../libs/AppFedShared/odm/OdmItemId'
import {OdmInMemItem} from '../../../libs/AppFedShared/odm/OdmItem$2'

export type OryOdmItemId = OdmItemId<OryOdmItem>

/** A tree node's content, ODM-backed replacement for the Firestore-only `OryItem$`'s
 * `itemData`. OrYoL's domain schema spans many node "classes" (tasks, notes, day plans,
 * categories, ...) with quite different field sets, so - like the original `OryItem$<TData =
 * any>` - this stays loosely typed rather than modeling every field precisely. */
export class OryOdmItem extends OdmInMemItem {
  title?: string
  [key: string]: any
}
