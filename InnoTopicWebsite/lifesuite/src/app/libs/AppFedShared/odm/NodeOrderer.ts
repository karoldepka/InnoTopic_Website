import {debugLog} from '../utils/log'
import {nullOrUndef} from '../utils/utils-from-oryol'
import {nullish} from '../utils/type-utils'

export const ORDER_STEP = 1000 * 1000

/** Anything with a fractional sibling-order key - OrYoL's `NodeInclusion` and every `OdmInMemItem`
 * (`OdmItem$2.orderNum`) both already satisfy this structurally. */
export interface Ordered {
  orderNum?: number
}

export interface NodeOrderRepair<TNode> {
  node: TNode
  inclusion: Ordered
  previousOrderNum: number | undefined
  orderNum: number
}

export interface NodeOrderInfo {
  /* Note: naming: before&after is better than above&below because it is decoupled from spatial projection (imagine e.g. a graph in the future; or left-right flow of order) */
  inclusionBefore?: Ordered | nullish,
  inclusionAfter?: Ordered | nullish,
}

/** Fractional-midpoint sibling ordering (`ORDER_STEP`-spaced, so a new node can always be
 * inserted between two neighbours by averaging) - originally OrYoL's `TreeModel.nodeOrderer`,
 * generalized (GH #89's unify-the-tree-worlds effort) so `OdmItem$2`'s own sibling ordering
 * (`orderNum`, `calculateOrderNumBetween()`) is the exact same algorithm instead of a parallel
 * reimplementation. Deliberately structural (`Ordered = {orderNum?: number}`) rather than typed
 * against OrYoL's `NodeInclusion` specifically - a `NodeInclusion` and a plain `OdmItem$2` child
 * are both just "a thing with an orderNum" as far as this class is concerned. Identity for
 * `findIndexByInclusion()` is reference equality (`===`) rather than an id field - both
 * `NodeInclusion` and `OdmItem$2` instances are stable, cached object references for as long as
 * they're in use, so this doesn't need a per-caller id accessor. */
export class NodeOrderer {

  calculateNewOrderNumber(
    previousOrderNumber: number | nullish,
    nextOrderNumber: number | nullish,
  ): number {
    debugLog('calculateNewOrderNumber: ', previousOrderNumber, nextOrderNumber)
    let newOrderNumber
    if (nullOrUndef(previousOrderNumber) && nextOrderNumber != null) {
      newOrderNumber = nextOrderNumber - ORDER_STEP
    } else if (previousOrderNumber != null && nullOrUndef(nextOrderNumber)) {
      newOrderNumber = previousOrderNumber + ORDER_STEP
    } else if (nullOrUndef(previousOrderNumber) && nullOrUndef(nextOrderNumber)) {
      newOrderNumber = 0
    } else { /* both next and previous is defined */
      newOrderNumber = ( previousOrderNumber! + nextOrderNumber! ) / 2;
    }

    return newOrderNumber
  }

  addOrderMetadataToInclusion(
    order: NodeOrderInfo,
    inclusionToEnrich: Ordered
  ) {
    const previousOrderNumber = order.inclusionBefore?.orderNum
    const nextOrderNumber = order.inclusionAfter?.orderNum
    const newOrderNumber = this.calculateNewOrderNumber(previousOrderNumber, nextOrderNumber);
    inclusionToEnrich.orderNum = newOrderNumber
  }

  canCalculateOrderNumberBetween(
    previousInclusion: Ordered | nullish,
    nextInclusion: Ordered | nullish,
  ): boolean {
    const previousOrderNumber = previousInclusion?.orderNum
    const nextOrderNumber = nextInclusion?.orderNum
    const newOrderNumber = this.calculateNewOrderNumber(previousOrderNumber, nextOrderNumber)
    if (previousOrderNumber != null && newOrderNumber <= previousOrderNumber) {
      return false
    }
    if (nextOrderNumber != null && newOrderNumber >= nextOrderNumber) {
      return false
    }
    return true
  }

  hasUnsafeOrderNumbers<TNode>(
    nodes: TNode[],
    accessInclusionFn: ((node: TNode) => Ordered)
  ): boolean {
    let previousOrderNum: number | undefined
    const seenOrderNums = new Set<number>()

    for (const node of nodes) {
      const orderNum = accessInclusionFn(node)?.orderNum
      if (orderNum == null) {
        return true
      }
      if (seenOrderNums.has(orderNum)) {
        return true
      }
      if (previousOrderNum != null && orderNum <= previousOrderNum) {
        return true
      }
      seenOrderNums.add(orderNum)
      previousOrderNum = orderNum
    }

    return false
  }

  findInsertionIndexForOrder<TNode>(
    nodes: TNode[],
    order: NodeOrderInfo,
    accessInclusionFn: ((node: TNode) => Ordered)
  ): number {
    const inclusionAfter = order.inclusionAfter
    if (inclusionAfter) {
      const index = this.findIndexByInclusion(nodes, inclusionAfter, accessInclusionFn)
      if (index >= 0) {
        return index
      }
    }

    const inclusionBefore = order.inclusionBefore
    if (inclusionBefore) {
      const index = this.findIndexByInclusion(nodes, inclusionBefore, accessInclusionFn)
      if (index >= 0) {
        return index + 1
      }
    }

    return nodes.length
  }

  normalizeOrderNumbers<TNode>(
    nodes: TNode[],
    accessInclusionFn: ((node: TNode) => Ordered)
  ): NodeOrderRepair<TNode>[] {
    const repairs: NodeOrderRepair<TNode>[] = []

    nodes.forEach((node, index) => {
      const inclusion = accessInclusionFn(node)
      const previousOrderNum = inclusion?.orderNum
      const orderNum = index * ORDER_STEP
      if (previousOrderNum !== orderNum) {
        inclusion.orderNum = orderNum
        repairs.push({node, inclusion, previousOrderNum, orderNum})
      }
    })

    return repairs
  }

  findInsertionIndexForNewInclusion<TNode>(
    nodes: TNode[],
    newInclusion: Ordered,
    accessInclusionFn: ((node: TNode) => Ordered)
  ): number {
    const newOrderNum = newInclusion.orderNum

    let foundIndex = nodes.findIndex((node) => {
      const existingOrderNum = accessInclusionFn(node)?.orderNum
      return existingOrderNum! > newOrderNum!
    })
    if ( foundIndex < 0 ) {
      // newIndex is higher than any existing
      foundIndex = nodes.length
    }
    return foundIndex
  }

  private findIndexByInclusion<TNode>(
    nodes: TNode[],
    inclusion: Ordered,
    accessInclusionFn: ((node: TNode) => Ordered)
  ): number {
    return nodes.findIndex(node => accessInclusionFn(node) === inclusion)
  }

}
