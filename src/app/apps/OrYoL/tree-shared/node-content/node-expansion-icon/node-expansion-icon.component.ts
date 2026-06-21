import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { debugLog } from '../../../utils/log'
import {ApfBaseTreeNode, OryBaseTreeNode} from '../../../tree-model/TreeModel'
import { NgIf, NgClass } from '@angular/common';

@Component({
    selector: 'app-node-expansion-icon',
    templateUrl: './node-expansion-icon.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./node-expansion-icon.component.sass'],
    imports: [NgIf, NgClass]
})
export class NodeExpansionIconComponent implements OnInit {

  @Input() treeNode!: OryBaseTreeNode

  constructor() { }

  ngOnInit() {
  }

  toggleExpand(event: any) {
    debugLog('toggleExpand', event)
    this.treeNode.expansion.setExpanded(! this.treeNode.expanded, event.altKey)
  }

  onPress(event: any) {
    debugLog('onPress', event)
    this.treeNode.expansion.toggleExpansion(true)
  }

}
