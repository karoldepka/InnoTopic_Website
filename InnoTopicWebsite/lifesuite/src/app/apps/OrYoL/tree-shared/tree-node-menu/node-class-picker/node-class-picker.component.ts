import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { OryBaseTreeNode } from '../../../tree-model/TreeModel'
import {
  OryNodeClass,
  ALL_NODE_CLASSES,
  NODE_CLASS_ICON_NAMES,
  NODE_CLASS_LABELS,
  getNodeClass,
} from '../../node-content/node-class-icon/node-class-icon.component'

@Component({
    selector: 'app-node-class-picker',
    templateUrl: './node-class-picker.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./node-class-picker.component.sass'],
    imports: [NgFor, NgClass, NgIf, IonicModule]
})
export class NodeClassPickerComponent {

  @Input() treeNode!: OryBaseTreeNode

  readonly classes = ALL_NODE_CLASSES

  readonly icons = NODE_CLASS_ICON_NAMES

  readonly labels = NODE_CLASS_LABELS

  get effectiveClass(): OryNodeClass {
    return getNodeClass(this.treeNode)
  }

  /** Whether the effective class above came from a manual pick rather than the tree-position
   * derivation - only then is there anything for clearOverride() to actually clear. */
  get hasOverride(): boolean {
    return ALL_NODE_CLASSES.includes((this.treeNode.content.itemData as any)?.classOverride)
  }

  pick(nodeClass: OryNodeClass): void {
    this.treeNode.content.patchThrottled({classOverride: nodeClass})
  }

  clearOverride(): void {
    this.treeNode.content.patchThrottled({classOverride: null})
  }

}
