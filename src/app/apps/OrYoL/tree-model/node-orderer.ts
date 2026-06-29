import {
  debugLog,
} from '../utils/log'
import { NodeInclusion } from './TreeListener'
import {nullOrUndef} from '../../../libs/AppFedShared/utils/utils-from-oryol'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'


export const ORDER_STEP = 1000 * 1000

interface NodeInclusionWithOrderNum extends NodeInclusion {
  orderNum: number
}

export interface NodeOrderRepair<TNode> {
  node: TNode
  inclusion: NodeInclusion
  previousOrderNum: number | undefined
  orderNum: number
}

export interface NodeOrderInfo {
  /* Note: naming: before&after is better than above&below because it is decoupled from spatial projection (imagine e.g. a graph in the future; or left-right flow of order) */
  inclusionBefore?: NodeInclusion | nullish,
  inclusionAfter?: NodeInclusion | nullish,
}

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
    inclusionToEnrich: NodeInclusion
  ) {
    const inclusionBefore = order.inclusionBefore as NodeInclusionWithOrderNum
    const inclusionAfter = order.inclusionAfter as NodeInclusionWithOrderNum
    const previousOrderNumber = inclusionBefore && inclusionBefore.orderNum

    // console.log('addChild: previousOrderNumber', previousOrderNumber)
    const nextOrderNumber = inclusionAfter && inclusionAfter.orderNum
    // console.log('addChild: nextOrderNumber', nextOrderNumber)
    const newOrderNumber = this.calculateNewOrderNumber(previousOrderNumber, nextOrderNumber);
    // console.log('addChild: newOrderNumber', newOrderNumber)
    (<NodeInclusionWithOrderNum> inclusionToEnrich).orderNum = newOrderNumber
  }

  canCalculateOrderNumberBetween(
    previousInclusion: NodeInclusion | nullish,
    nextInclusion: NodeInclusion | nullish,
  ): boolean {
    const previousOrderNumber = this.orderNum(previousInclusion)
    const nextOrderNumber = this.orderNum(nextInclusion)
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
    accessInclusionFn: ((node: TNode) => NodeInclusion)
  ): boolean {
    let previousOrderNum: number | undefined
    const seenOrderNums = new Set<number>()

    for (const node of nodes) {
      const orderNum = this.orderNum(accessInclusionFn(node))
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
    accessInclusionFn: ((node: TNode) => NodeInclusion)
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
    accessInclusionFn: ((node: TNode) => NodeInclusion)
  ): NodeOrderRepair<TNode>[] {
    const repairs: NodeOrderRepair<TNode>[] = []

    nodes.forEach((node, index) => {
      const inclusion = accessInclusionFn(node)
      const previousOrderNum = this.orderNum(inclusion)
      const orderNum = index * ORDER_STEP
      if (previousOrderNum !== orderNum) {
        ;(inclusion as NodeInclusionWithOrderNum).orderNum = orderNum
        repairs.push({node, inclusion, previousOrderNum, orderNum})
      }
    })

    return repairs
  }

  findInsertionIndexForNewInclusion<TNode>(
    nodes: TNode[],
    newInclusion: NodeInclusion,
    accessInclusionFn: ((node: TNode) => NodeInclusion)
  ): number {
    const newOrderNum = (newInclusion as NodeInclusionWithOrderNum).orderNum

    let foundIndex = nodes.findIndex((node) => {
      const existingOrderNum = (accessInclusionFn(node) as NodeInclusionWithOrderNum).orderNum
      return existingOrderNum > newOrderNum
    })
    if ( foundIndex < 0 ) {
      // newIndex is higher than any existing
      foundIndex = nodes.length
    }
    return foundIndex
  }

  private findIndexByInclusion<TNode>(
    nodes: TNode[],
    inclusion: NodeInclusion,
    accessInclusionFn: ((node: TNode) => NodeInclusion)
  ): number {
    return nodes.findIndex(node =>
      accessInclusionFn(node)?.nodeInclusionId === inclusion.nodeInclusionId
    )
  }

  private orderNum(inclusion: NodeInclusion | nullish): number | undefined {
    return (inclusion as NodeInclusionWithOrderNum | nullish)?.orderNum
  }

}
