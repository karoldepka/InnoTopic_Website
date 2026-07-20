import {OdmItem$2} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {OryOdmItem} from './OryOdmItem'
import {OryOdmItemsService} from './ory-odm-items.service'

/** ODM-backed tree-node content item. GH #89 unify-the-tree-worlds: tree position now lives
 * directly on the item itself, via the generic `inclusionsByParentId` map (`OdmItem$2`) -
 * OrYoL nodes can still be included under several different parents at once, which the base
 * class's `getParentIds()`/`getAncestorIds()` already handle correctly (they union over every
 * entry in `.parents`/`inclusionsByParentId`), so no override is needed here anymore. See
 * `SupabaseTreeService` for how relationships are created/moved. */
export class OryOdmItem$ extends OdmItem$2<OryOdmItem$, OryOdmItem, OryOdmItem, OryOdmItemsService> {
}
