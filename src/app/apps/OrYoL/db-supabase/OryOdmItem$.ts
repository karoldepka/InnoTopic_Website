import {OdmItem$2} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {OryOdmItem} from './OryOdmItem'
import {OryOdmItemsService} from './ory-odm-items.service'

/** ODM-backed tree-node content item. Unlike a plain single-parent ODM item, this never sets
 * `.parents` / relies on `getParentIds()`/`getAncestorIds()` - OrYoL nodes can be included under
 * several different parents at once (see `OryNodeInclusion$`), so "this item's ancestors" isn't
 * a single well-defined chain at the item level. Reachability and tree position both live on the
 * inclusion, not here. */
export class OryOdmItem$ extends OdmItem$2<OryOdmItem$, OryOdmItem, OryOdmItem, OryOdmItemsService> {
  // Base OdmItem$2.getParentIds() logs a diagnostic warning whenever .parents is empty on a
  // non-root item, assuming that's always a mistake in a single-parent tree - not true here by
  // design (see class doc comment above), so every OryOdmItem$ save would otherwise trip it.
  override getParentIds() {
    return []
  }

  override getAncestorIds() {
    return []
  }
}
