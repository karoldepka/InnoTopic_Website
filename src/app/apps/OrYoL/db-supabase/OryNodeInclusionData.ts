import {OdmItemId} from '../../../libs/AppFedShared/odm/OdmItemId'
import {OdmInMemItem} from '../../../libs/AppFedShared/odm/OdmItem$2'

export type OryNodeInclusionId = OdmItemId<OryNodeInclusionData>

/** One parent/child link in the OrYoL tree - the ODM-backed replacement for Firestore's
 * separate `_inclusions` collection. `orderNum` (inherited from `OdmInMemItem`) is the sibling
 * order *under this specific parent* - since the same item can be included under several
 * different parents (see OryOdmItem$'s doc comment), order is a property of the link, not the
 * item. `parentIds`/`ancestorIds` (also inherited, populated by `OdmItem$2.saveNowToDb` in the
 * normal way) point at the *parent item*, i.e. `parentIds = [parentItemId]`. Removing a node
 * from a parent (or deleting it outright) uses the generic `deleteWithoutConfirmation()`/
 * `when_deleted` soft-delete already built into the ODM backends - no separate archived flag
 * needed, and deleted rows are already excluded from every fetch/listener automatically. */
export class OryNodeInclusionData extends OdmInMemItem {
  childItemId!: string
}
