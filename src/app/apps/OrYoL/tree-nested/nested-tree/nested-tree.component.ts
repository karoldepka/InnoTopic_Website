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

@Component({
  standalone: false,
  selector: 'app-nested-tree',
  templateUrl: './nested-tree.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./nested-tree.component.scss']
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
