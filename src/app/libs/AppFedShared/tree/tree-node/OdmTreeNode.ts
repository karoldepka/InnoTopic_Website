import {OdmItem$2} from '../../odm/OdmItem$2'
import {CachedSubject} from '../../utils/cachedSubject2/CachedSubject2'
import {map} from 'rxjs/operators'
import {Observable} from 'rxjs/internal/Observable'

export class OdmTreeNode<
  TOdmItem$ extends
    OdmItem$2<any, any, any, any> =
    OdmItem$2<any, any, any, any>
  > {

  isExpanded = true

  /** One `OdmTreeNode` wrapper per child, reused across `childNodesList$` re-emissions (keyed by
   * item id) - a fresh wrapper each emission would reset `isExpanded` on every child whenever
   * ANY sibling's own field changed, not just genuine membership changes (GH #89's unify-the-
   * tree-worlds effort surfaced this - reorder/indent now `reEmit()` this list on every move). */
  private childNodeCache = new Map<string, OdmTreeNode<TOdmItem$>>()

  /* TODO use OdmList$ */
  childNodesList$: Observable<OdmTreeNode<TOdmItem$>[] | undefined> = this.item$.childrenList$.pipe(map((children: TOdmItem$[] | undefined) => {
    if (!children) {
      return undefined
    }
    // Sorted by orderNum (OrYoL-style fractional ordering, GH #89 unify-the-tree-worlds) -
    // childrenList$ itself is arrival-order, not display-order.
    const ordered = (this.item$ as unknown as OdmItem$2<any, any, any, any>).getChildrenOrdered() as unknown as TOdmItem$[]
    const orderedIds = new Set(ordered.map(child => child.id as string))
    for (const id of this.childNodeCache.keys()) {
      if (!orderedIds.has(id)) {
        this.childNodeCache.delete(id)
      }
    }
    return ordered.map((childItem: TOdmItem$) => {
      const id = childItem.id as string
      let node = this.childNodeCache.get(id)
      if (!node) {
        node = new OdmTreeNode(this, childItem)
        this.childNodeCache.set(id, node)
      }
      return node
    })
  }))// new CachedSubject<TreeNode[] | undefined>(undefined)

  constructor(
    /** an item can have multiple parents, but a node only has one parent (or no parent, for root node) */
    public parentNode: OdmTreeNode<any> | undefined,
    public item$: TOdmItem$
  ) {
  }

  /** True for the root / top-level node (no parent node). */
  get isRoot(): boolean {
    return ! this.parentNode
  }

  /** Number of ancestor nodes above this one — the indentation level (0 = top-level). */
  getDepth(): number {
    let depth = 0
    let node: OdmTreeNode<any> | undefined = this.parentNode
    let guard = 0
    while ( node && guard++ < 10_000 ) {
      depth++
      node = node.parentNode
    }
    return depth
  }

  /** Ancestor nodes ordered root-first (excludes this node). */
  getAncestorNodes(): OdmTreeNode<any>[] {
    const path: OdmTreeNode<any>[] = []
    let node: OdmTreeNode<any> | undefined = this.parentNode
    let guard = 0
    while ( node && guard++ < 10_000 ) {
      path.push(node)
      node = node.parentNode
    }
    return path.reverse()
  }

  requestLoadChildren(depth = 1) {
    this.item$.requestLoadChildren()
    this.item$.requestLoadTreeDescendants()
    /* This could preload a number of levels recursively */
    // setTimeout(() => {
    //   this.childNodesList$.nextWithCache([
    //     new TreeNode(this, undefined as any),
    //     new TreeNode(this, undefined as any),
    //     new TreeNode(this, undefined as any),
    //     new TreeNode(this, undefined as any),
    //     new TreeNode(this, undefined as any),
    //     new TreeNode(this, undefined as any),
    //     new TreeNode(this, undefined as any),
    //     new TreeNode(this, undefined as any),
    //   ])
    // }, 2_000)
  }

}
