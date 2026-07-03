/**
 * Created by kd on 2017-10-28.
 */
// type-only: ItemId/NodeInclusionId are plain `string` aliases, but a regular import here
// pulled in OryItem$.ts's whole runtime dependency chain (TreeTableNodeContent -> Columns ->
// cell components -> CellComponent -> TreeModel) just for two type names - fine as long as
// nothing else eagerly imports this file before that chain's classes are defined, but adding a
// new eager entry point (SupabaseTreeService, wired into the always-loaded db-firestore.module)
// exposed the latent circular dependency ("Class extends value undefined"). `import type` is
// erased entirely, so it can't do that regardless of load order.
import type {
  ItemId,
  NodeInclusionId,
} from '../db/OryItem$'

/** Idea: inclusion could be treated similarly to OdmItem$; in simplest case, object's inclusion object would be itself (.patch({order... parent})}
 * this would ensure protection from delayed updates coming from firestore, etc.
 *
 * In multi-parent case, inclusion would be a virtual OdmItem$-like object with a simple subset interface, which would handle parents array, etc.
 * Third case would be someone including someone else's item into their item (no permission to modify the included obj).
 * */
export class NodeInclusion {
  public isArchived = false
  public isArchivedWhen: Date | null = null
  constructor(
    // public orderThisBeforeId,
    // public orderThisAfterId,
    public nodeInclusionId: NodeInclusionId,
    public parentItemId/*?*/: ItemId,
    /** note other ordering implementations might not use orderNum */
    public orderNum?: number,
  ) {}
}

export class NodeAddEvent {
  constructor (
    public parents: any /* FIXME any */,
    public directParentItemId: ItemId,
    public itemData: any,
    public itemId: ItemId,
    public pendingListeners: number,
    public nodeInclusion: NodeInclusion
  ) {}
}

export abstract class DbTreeListener {
  abstract onNodeAddedOrModified(e: NodeAddEvent): void
  abstract onNodeInclusionModified(nodeInclusionId: string, nodeInclusionData: any, newParentItemId: string): void
}
