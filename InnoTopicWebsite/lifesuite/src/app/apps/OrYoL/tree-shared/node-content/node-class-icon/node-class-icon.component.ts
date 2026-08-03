import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { IonicModule } from '@ionic/angular';

import {OryBaseTreeNode} from '../../../tree-model/TreeModel'

@Component({
    selector: 'app-node-class-icon',
    templateUrl: './node-class-icon.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./node-class-icon.component.sass'],
    imports: [IonicModule],
})
export class NodeClassIconComponent implements OnInit {

  @Input() treeNode!: OryBaseTreeNode

  constructor() { }

  ngOnInit() {
  }

  /** TODO: move to NodeIconCellComponent */
  getIconName() {
    if ( this.treeNode.content.isTask) {
      return 'settings'
    } else if ( this.treeNode.isChildOfRoot ) {
      return 'folder'
    } else if ( this.treeNode.content.isDayPlan ) {
      return 'today'
    } else if ( this.treeNode.content.isMilestone ) {
      return 'calendar'
    } else if ( this.treeNode.content.isJournalEntry ) {
      return 'create'
    } else {
      return 'document-text'
    }
  }

}
