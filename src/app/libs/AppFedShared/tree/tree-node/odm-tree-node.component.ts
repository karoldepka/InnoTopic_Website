import {Component, Input, OnInit, ChangeDetectionStrategy, forwardRef, ViewChild, ViewChildren, QueryList} from '@angular/core';
import {OdmTreeNode} from './OdmTreeNode'
import {OdmItem$2} from '../../odm/OdmItem$2'
import {OdmService2} from '../../odm/OdmService2'
import {AuthService} from '../../../../auth/auth.service'
import {LearnItem} from '../../../../apps/Learn/models/LearnItem'
import { ToastController, IonicModule } from '@ionic/angular'
import { OdmTreeNodeContentComponent } from './tree-node-content/odm-tree-node-content.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-tree-node',
    templateUrl: './odm-tree-node.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./odm-tree-node.component.css'],
    imports: [
        OdmTreeNodeContentComponent,
        NgIf,
        IonicModule,
        NgFor,
        forwardRef(() => OdmTreeNodeComponent),
        AsyncPipe,
    ]
})
export class OdmTreeNodeComponent implements OnInit {

  @Input()
  treeNode!: OdmTreeNode<OdmItem$2<any, any, any, any>>

  @ViewChild(OdmTreeNodeContentComponent)
  private nodeContent!: OdmTreeNodeContentComponent

  /** Direct <app-tree-node> children rendered by this node's own *ngFor - used to locate a
   * just-created child so its title can be focused once it has actually mounted. */
  @ViewChildren(forwardRef(() => OdmTreeNodeComponent))
  private childTreeNodes!: QueryList<OdmTreeNodeComponent>

  constructor(
    public authService: AuthService,
    private toastController: ToastController,
  ) { }

  ngOnInit(): void {
    // this.authService.authUser$.subscribe((user) => {
    //   console.log(`user`, user)
    //   if ( user ) {
        this.treeNode.requestLoadChildren()
    //   }
    // })
  }

  focusTitle() {
    this.nodeContent.focusTitle()
  }

  /** The new child's item is inserted into childrenList$ synchronously (see
   * OdmItem$2's constructor), but its <app-tree-node> only actually mounts on the next
   * change-detection pass, so childTreeNodes won't have it yet on this call stack - wait a
   * tick, matching the setTimeout-based focus pattern used elsewhere (e.g.
   * JournalNumericFieldsComponent.focusComment()). */
  private focusNewChildTitleWhenRendered(newItemId: unknown) {
    setTimeout(() => {
      const newChild = this.childTreeNodes?.find(child => child.treeNode.item$.id === newItemId)
      newChild?.focusTitle()
    })
  }

  async addChild() {
    const item$ = this.treeNode.item$
    const odmService = item$.odmService as OdmService2<any, any, any, any>
    const newItemData = new LearnItem()
    newItemData.title = 'New learn item'
    newItemData.isToLearn = true
    const newItem = odmService.newItem(undefined, newItemData, [item$], {createdLocally: true})
    try {
      newItem.saveNowToDb()
      this.treeNode.isExpanded = true
      this.focusNewChildTitleWhenRendered(newItem.id)
      console.log('newItem', newItem)
      const toast = await this.toastController.create({
        message: 'Draft learn item added.',
        duration: 5000,
        color: 'success',
        position: 'bottom',
        buttons: [
          {
            text: 'Undo',
            role: 'cancel',
            handler: () => {
              newItem.deleteWithoutConfirmation()
              this.presentToast('Draft removed.', 'medium')
            },
          },
        ],
      })
      await toast.present()
    } catch (error: any) {
      console.error('Unable to add child from shortcut', error)
      const toast = await this.toastController.create({
        message: error?.message ?? 'Could not add a child item.',
        duration: 2400,
        color: 'danger',
        position: 'bottom',
      })
      await toast.present()
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color,
      position: 'bottom',
    })
    await toast.present()
  }

  trackById(index: number, node: OdmTreeNode) {
    return node.item$.id
  }
}
