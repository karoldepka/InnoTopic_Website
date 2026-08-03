import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TreeModel} from '../../tree-model/TreeModel'
import {TreeHostComponent} from '../../tree-host/tree-host/tree-host.component'
import { Bind } from 'primeng/bind';
import { Tree } from 'primeng/tree';
import { PrimeTemplate } from 'primeng/api';
import { NodeContentComponent } from '../../tree-shared/node-content/node-content.component';

@Component({
    selector: 'app-prime-ng-tree',
    templateUrl: './prime-ng-tree.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./prime-ng-tree.component.scss'],
    imports: [Bind, Tree, PrimeTemplate, NodeContentComponent]
})
export class PrimeNgTreeComponent implements OnInit {

  @Input()
  treeModel!: TreeModel<any>

  @Input()
  treeHost!: TreeHostComponent

  constructor() { }

  ngOnInit() {
  }

  nodeDrop(event: any) {
    console.log('nodeDrop', event)
    // this.dbService.moveNode(event.dragNode.dbId, event.dropNode.dbId) // FIXME
  }

}
