import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TreeModel} from '../../tree-model/TreeModel'
import {TreeHostComponent} from '../../tree-host/tree-host/tree-host.component'

@Component({
  standalone: false,
  selector: 'app-prime-ng-tree',
  templateUrl: './prime-ng-tree.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./prime-ng-tree.component.scss']
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
