import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
// import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'

import {OryBaseTreeNode} from '../../tree-model/TreeModel'

@Component({
  standalone: false,
  selector: 'app-confirm-delete-tree-node',
  templateUrl: './confirm-delete-tree-node.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./confirm-delete-tree-node.component.scss']
})
export class ConfirmDeleteTreeNodeComponent implements OnInit {

  treeNode!: OryBaseTreeNode

  constructor(
    // public activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {
  }

  deleteNode() {
    // this.activeModal.close('Ok click')
    console.log('confirmed delete node itemId ' + this.treeNode.itemId)
    this.treeNode.deleteWithoutConfirmation()
  }

}
