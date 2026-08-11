import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { IonicModule } from '@ionic/angular';

import {OryBaseTreeNode} from '../../../tree-model/TreeModel'

/** A node's "class" here is normally purely derived from tree position (which well-known root
 * its ancestors sit under - see OryTreeTableNodeContent's isTask/isDayPlan/isMilestone/
 * isJournalEntry getters), not an explicit stored field - so this is the one place that decides
 * it, shared between the icon (getNodeClassIconName()) and the human-readable label
 * (getNodeClassLabel(), used by TreeNodeMenuPopoverComponent) so the two can't drift out of sync
 * with each other the way two separately-maintained if/else chains eventually would.
 *
 * `classOverride` (NodeClassPickerComponent) lets a user manually pin a node's class without
 * moving it in the tree - a plain stored field on itemData, checked first below, so an override
 * always wins over the positional derivation until explicitly cleared. */
export type OryNodeClass = 'task' | 'folder' | 'day-plan' | 'milestone' | 'journal-entry' | 'note'

export const ALL_NODE_CLASSES: OryNodeClass[] = ['task', 'folder', 'day-plan', 'milestone', 'journal-entry', 'note']

export function getNodeClass(treeNode: OryBaseTreeNode): OryNodeClass {
  const override = (treeNode.content.itemData as any)?.classOverride
  if (ALL_NODE_CLASSES.includes(override)) {
    return override
  }
  if (treeNode.content.isTask) {
    return 'task'
  } else if (treeNode.isChildOfRoot) {
    return 'folder'
  } else if (treeNode.content.isDayPlan) {
    return 'day-plan'
  } else if (treeNode.content.isMilestone) {
    return 'milestone'
  } else if (treeNode.content.isJournalEntry) {
    return 'journal-entry'
  } else {
    return 'note'
  }
}

export const NODE_CLASS_ICON_NAMES: Record<OryNodeClass, string> = {
  'task': 'settings',
  'folder': 'folder',
  'day-plan': 'today',
  'milestone': 'calendar',
  'journal-entry': 'create',
  'note': 'document-text',
}

export const NODE_CLASS_LABELS: Record<OryNodeClass, string> = {
  'task': 'Task',
  'folder': 'Folder',
  'day-plan': 'Day Plan',
  'milestone': 'Milestone',
  'journal-entry': 'Journal Entry',
  'note': 'Note',
}

export function getNodeClassLabel(treeNode: OryBaseTreeNode): string {
  return NODE_CLASS_LABELS[getNodeClass(treeNode)]
}

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
    return NODE_CLASS_ICON_NAMES[getNodeClass(this.treeNode)]
  }

}
