import {Component, Input, OnInit, ChangeDetectionStrategy, forwardRef} from '@angular/core';
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
