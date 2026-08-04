import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  OryBaseTreeNode,
  TreeModel,
} from '../../tree-model/TreeModel'
import { TreeHostComponent } from '../../tree-host/tree-host/tree-host.component'
import { NgFor } from '@angular/common';
import { NestedTreeNodeComponent } from '../nested-tree-node/nested-tree-node.component';

@Component({
    selector: 'app-nested-tree',
    templateUrl: './nested-tree.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./nested-tree.component.scss'],
    imports: [NgFor, NestedTreeNodeComponent]
})
export class NestedTreeComponent implements OnInit {

  @Input()
  treeModel!: TreeModel<any>

  @Input()
  treeHost!: TreeHostComponent

  wrapperHackArrayWasForNode!: OryBaseTreeNode
  /* For forcing new component instance every time visualRoot changes */
  wrapperHackArray!: any

  constructor() {
  }

  /** GH #142 "visual root does not show": reproduced live (navigate into a top-level node via
   * node-class-icon's long-press - URL changes to /tree/item_..., but nothing renders except
   * APPEND/ADD PLAN, no title/breadcrumb for the node you're now inside).
   * createTreeNodeWrapperHackArrayIfNecessary() below IS called with the correct new visualRoot
   * (confirmed: visualRoot$ is a CachedSubject, which replays synchronously to subscribers, and
   * navigateInto() does call .next() before this point) and DOES rebuild wrapperHackArray with
   * {wrapperHack: <correct node>} - `wrapperHackArrayWasForNode` is declared but never assigned,
   * so the "IfNecessary" guard is dead code (always true), which just means an unnecessary
   * rebuild on every emission, not the cause of nothing rendering. Root cause not found further
   * than this - either NestedTreeNodeComponent's ngOnInit (which reads treeNode.isRoot to decide
   * whether to render <app-node-content> at all) isn't being told to re-run after this class'
   * *ngFor input changes, or something about the freshly-navigated-to node's own isRoot/
   * isVisualRoot state is wrong. Not fixed inline - needs someone who can step through Angular
   * 22's ChangeDetectionStrategy.Eager here with devtools, which is past what static reading can
   * settle confidently. */
  ngOnInit() {
    this.treeModel.navigation.visualRoot$.subscribe(() => {
      this.createTreeNodeWrapperHackArrayIfNecessary()
    })
  }

  /* For forcing new component instance every time visualRoot changes */
  createTreeNodeWrapperHackArrayIfNecessary() {
    const visualRoot = this.treeModel.navigation.visualRoot
    if ( this.wrapperHackArrayWasForNode !== visualRoot ) {
      this.wrapperHackArray = [
        {wrapperHack: visualRoot}
      ]
    }
    return this.wrapperHackArray
  }
}
