import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {OdmInMemItem, OdmItem$2} from '../odm/OdmItem$2'

/** A bare slot (GH #89's `kind: 'slot'` `SlotDescriptor`, e.g. a former OrYoL/Learn template node
 * like "Plan") has no `dataFieldKey`/scalar value of its own - it only groups real children of
 * its real parent item. A child stays a completely normal child of that real parent (`parentIds`
 * unchanged); only the fabricated slot id (`fieldVirtualNodeId()`) is appended into
 * `manualAncestorIds`, so it's reachable via the exact same `ancestorIds`-containment query as
 * any other descendant - no bespoke backend query needed. Relies on the parent node's own
 * `requestLoadChildren()`/`requestLoadTreeDescendants()` having already bulk-loaded the parent's
 * full descendant tree into `odmService.localItems$` (per "for speed, load all descendants of
 * the visual root up front") - this just client-filters that already-loaded pool, same as
 * `FieldCommentsService`/`TimeTrackingPeriodsService`. */
export function getBareSlotChildren$<TOdmItem$ extends OdmItem$2<any, any, any, any>>(
  parentItem$: TOdmItem$,
  slotTargetNodeId: string,
): Observable<TOdmItem$[]> {
  return parentItem$.odmService.localItems$.pipe(
    // Checks this item's own `manualAncestorIds` directly, NOT the full recursive
    // `getAncestorIds()` - the latter also matches a *grandchild* nested under a direct bare-slot
    // child (e.g. the categories feature's sub-categories), since `getAncestorIds()` walks up
    // through real parents and each of THEIR `manualAncestorIds` too. That would surface a
    // deeply-nested descendant as a spurious extra top-level entry here, on top of it correctly
    // rendering nested under its real parent - confirmed live while building categories. Only an
    // item *directly* tagged under this exact slot belongs in this list; anything nested deeper
    // is reached by the normal parent-child tree walk instead, not this bare-slot query again.
    map((items: TOdmItem$[]) => (items ?? []).filter(item$ =>
      item$.id !== parentItem$.id && !!(item$.val as any)?.manualAncestorIds?.includes(slotTargetNodeId)
    )),
  )
}

/** Creates a new real child of `parentItem$`, additionally tagged so it's found under the
 * fabricated bare-slot id - the same `odmService.newItem()` call any other child creation
 * (`OdmTreeNodePopupComponent.addChild()`) already makes, just with `manualAncestorIds` set. */
export function createChildUnderSlot<TOdmItem$ extends OdmItem$2<any, any, any, any>>(
  parentItem$: TOdmItem$,
  slotTargetNodeId: string,
  initialData?: Partial<OdmInMemItem>,
): TOdmItem$ {
  const child = parentItem$.odmService.newItem(
    undefined,
    {...initialData, manualAncestorIds: [slotTargetNodeId]},
    [parentItem$],
    {createdLocally: true},
  ) as TOdmItem$
  child.saveNowToDb()
  return child
}
