import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { TreeHostComponent } from '../../tree-host/tree-host/tree-host.component'
import { DialogService } from '../../core/dialog.service'
import { DbTreeService } from '../../tree-model/db-tree-service'
// import {
//   NgbModal,
//   NgbPopover,
// } from '@ng-bootstrap/ng-bootstrap'
import { ConfirmDeleteTreeNodeComponent } from '../confirm-delete-tree-node/confirm-delete-tree-node.component'
import { NodeContentComponent } from '../node-content/node-content.component'
import { Router } from '@angular/router'
import { ClipboardService } from '../../core/clipboard.service'
import { AlertController, PopoverController, IonicModule } from '@ionic/angular'
import {INodeContentComponent} from '../node-content/INodeContentComponent'

import {OryBaseTreeNode, OryNonRootTreeNode} from '../../tree-model/TreeModel'
import {ApfNonRootTreeNode} from '../../tree-model/TreeNode'
import { NodeClassIconComponent } from '../node-content/node-class-icon/node-class-icon.component';
import { NgIf } from '@angular/common';
import { NodeClassPickerComponent } from './node-class-picker/node-class-picker.component';
import {
  buildTemplateItemId,
  DAY_PLAN_TEMPLATES,
  DayPlanTemplate,
  DayPlanTemplateNode,
} from '../../plan-execution/templates/day-plan-templates'
import {NodeInclusion} from '../../tree-model/TreeListener'
import {generateNewInclusionId} from '../../tree-model/TreeModel'


@Component({
    selector: 'app-tree-node-menu-popover',
    templateUrl: './tree-node-menu-popover.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./tree-node-menu-popover.component.sass'],
    imports: [NodeClassIconComponent, IonicModule, NgIf, NodeClassPickerComponent]
})
export class TreeNodeMenuPopoverComponent implements OnInit {

  private readonly defaultTemplateId = 'default_day_plan'

  @Input() treeNode!: OryBaseTreeNode

  @Input() treeHost!: TreeHostComponent

  @Input() nodeContentComponent!: INodeContentComponent

  // @Input() popOver!: NgbPopover

  constructor(
    public dialogService: DialogService,
    // private modalService: NgbModal,
    public dbService: DbTreeService,
    public router: Router,
    public clipboardService: ClipboardService,
    public popoverController: PopoverController,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
  }

  openDeleteConfirmationDialog() {
    // this.popOver.close()
    console.log('openDeleteConfirmationDialog()')
    // this.dialogService.showDeleteDialog(() => {
    //   // TODO: delete node inclusion and the node itself
    //   this.dbService.delete(this.treeNode.itemId)
    // })
    // const modalRef = this.modalService.open(ConfirmDeleteTreeNodeComponent);
    // const component = modalRef.componentInstance as ConfirmDeleteTreeNodeComponent
    // component.treeNode = this.treeNode;
  }

  async addChild() {
    // this.popOver.close()
    // this.treeNode.addChild()
    this.nodeContentComponent.addChild()
    await this.popoverController.dismiss()
  }

  navigateInto() {
    console.log('navigateInto', this.treeNode)
    // this.router.navigate(['/tree', this.treeNode!.nodeInclusion!.nodeInclusionId
    // /* note: inclusion id, because give item can be in multiple places */]);
    // FIXME: router.navigate might be causing problem with this sometimes working and sometimes not; maybe race condition?
    // maybe multiple instances of page component
    this.treeNode.navigateInto()
  }

  toClipboard() {
    this.clipboardService.setNodesInClipboard([this.treeNode])
    // this.popOver.close()
  }

  pasteCopyHereFromClipboard() {
    this.treeNode.addAssociationsHere(this.clipboardService.nodesInClipboard as any, undefined)
  }

  pasteMoveHereFromClipboard() {
    this.treeNode.moveInclusionsHere(this.clipboardService.nodesInClipboard as any, {beforeNode: undefined})
  }

  getWhenCreated() {
    let whenCreated = this.treeNode.content.itemData.whenCreated
    if ( whenCreated ) {
      whenCreated = whenCreated.toDate() // TODO: move this to FirestoreTimeStamper::onAfterLoadFromDb
    }
    return whenCreated
  }


  toggleDone() {
    this.treeNode.content.toggleDone()
  }

  async applyTemplate() {
    const template = this.getTemplateToApply()
    if (!template) {
      console.warn('No day-plan template found to apply.')
      return
    }
    this.addTemplateNodesToParent(this.treeNode, template.nodes)
    await this.popoverController.dismiss()
  }

  private getTemplateToApply(): DayPlanTemplate | undefined {
    return DAY_PLAN_TEMPLATES.find(t => t.id === this.defaultTemplateId) ?? DAY_PLAN_TEMPLATES[0]
  }

  /** Inserts template nodes at the top of parentNode.children, preserving template order. */
  private addTemplateNodesToParent(
    parentNode: OryBaseTreeNode,
    templateNodes: DayPlanTemplateNode[],
  ) {
    // Capture the first existing child before any insertions so template nodes are prepended.
    const firstExistingChild = parentNode.children[0] as OryNonRootTreeNode | undefined
    let lastInserted: OryNonRootTreeNode | undefined
    for (const templateNode of templateNodes) {
      const node = this.createOrGetTemplateNode(parentNode, templateNode, lastInserted, firstExistingChild)
      if (node) {
        lastInserted = node
        if (templateNode.children?.length) {
          this.addTemplateNodesToParent(node as any, templateNode.children)
        }
      }
    }
  }

  /**
   * Returns existing node if the template ID already exists under parentNode,
   * otherwise creates and inserts it before firstExistingChild (after afterNode).
   */
  private createOrGetTemplateNode(
    parentNode: OryBaseTreeNode,
    templateNode: DayPlanTemplateNode,
    afterNode: OryNonRootTreeNode | undefined,
    beforeNode: OryNonRootTreeNode | undefined,
  ): OryNonRootTreeNode | undefined {
    const templateItemId = buildTemplateItemId(parentNode.itemId, templateNode.id)
    const existing = parentNode.children.find(child => child.itemId === templateItemId) as OryNonRootTreeNode | undefined
    if (existing) return existing

    const nodeInclusion = new NodeInclusion(generateNewInclusionId(), parentNode.itemId)
    const treeModel = (parentNode as any).treeModel
    treeModel.nodeOrderer.addOrderMetadataToInclusion(
      {
        inclusionBefore: afterNode?.nodeInclusion,
        inclusionAfter: beforeNode?.nodeInclusion,
      },
      nodeInclusion,
    )

    const itemData: any = {
      title: templateNode.title,
      isTask: !!templateNode.isTask,
      templateNodeClass: templateNode.templateNodeClass,
    }
    const nodeContent = parentNode.createNodeContent(templateItemId, itemData)
    const newNode = parentNode.createChildNode(nodeInclusion as any, nodeContent as any)

    treeModel.permissionsManager.onAfterCreated(newNode as any)
    treeModel.treeService.addChildNode(parentNode as any, newNode as any)

    const insertIndex = afterNode ? (afterNode.getIndexInParent() + 1) : 0
    parentNode._appendChildAndSetThisAsParent(newNode as any, insertIndex)

    return newNode as any as OryNonRootTreeNode
  }

  async askArchiveItems() {
    // TODO what sub-items are not yet loaded (could archive parent without children)
    const count = this.treeNode.countSubItemsIncludingThis()
    // const count = this.treeNode.treeModel.root.countSubItemsIncludingThis()
    console.log('count to archive', count)

    const alert = await this.alertController.create({
      header: `Archive ${count} item(s)?`,
      // message: 'Delete <strong>' + this.item$ ?. currentVal ?. joinedSides ?. () + '</strong>!!!?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'ARCHIVE',
          handler: async () => {
            this.treeNode.callRecursivelyIncludingThisNode((node: OryNonRootTreeNode) => {
              node.content.patchThrottled({
                isArchived: true,
                isArchivedWhen: new Date(),
              })
              node.nodeInclusion$?.patchThrottled({
                isArchived: true,
                isArchivedWhen: new Date(),
              })

            }) /* TODO depth-first calling, to preserve invariant that parents always exist */
            // this.doc.update({
            //   whenDeleted: new Date(),
            // })
            // await this.doc.delete() // TODO: listen to promise for sync status
            // await this.angularFirestore.collection(`LearnDoAudio`).doc(this.id).delete() // TODO: listen to promise for sync status
            // ignorePromise(this.router.navigate([`/learn`]))
          }
        }
      ]
    })
    await alert.present()
  }

}
