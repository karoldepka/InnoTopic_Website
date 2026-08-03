import {OdmItemId} from '../odm/OdmItemId'
import {OdmInMemItem} from '../odm/OdmItem$2'
import {TimeTrackingPersistentData} from '../../../apps/OrYoL/time-tracking/TimeTrackingPersistentData'

export type VirtualSlotStateId = OdmItemId<VirtualSlotState>

/** Per-slot state for a fabricated/virtual node id (e.g. `abcdefgh_field_mood`) that has no real
 * `OdmItem$2` row of its own to store data on - currently just time-tracking (GH #89 "ensure
 * everything is commentable and time-trackable"; comments already have their own flat
 * `FieldComment` collection for the same reason). One row per slot id, unlike `FieldComment`
 * (many rows per target) - the slot id doubles as this item's own id via `obtainItem$ById()`,
 * so no separate `targetNodeId` field/client-filter is needed. */
export class VirtualSlotState extends OdmInMemItem {
  timeTrack?: TimeTrackingPersistentData
}
