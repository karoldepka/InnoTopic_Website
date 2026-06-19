import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';


import {ApfNonRootTreeNode} from '../../tree-model/TreeNode'
import {OryBaseTreeNode} from '../../tree-model/TreeModel'

@Component({
  standalone: false,
  selector: 'app-test-component-instance-changing-on-input-value-change',
  templateUrl: './test-component-instance-changing-on-input-value-change.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./test-component-instance-changing-on-input-value-change.component.scss']
})
export class TestComponentInstanceChangingOnInputValueChangeComponent implements OnInit {

  @Input() readonly treeNode: OryBaseTreeNode

  whenCreated = new Date()

  constructor() { }

  ngOnInit() {

  }

}
