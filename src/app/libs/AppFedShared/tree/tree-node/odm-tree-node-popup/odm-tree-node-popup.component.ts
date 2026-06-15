import {Component, HostListener, Input, OnInit} from '@angular/core';
import {OdmTreeNode} from '../OdmTreeNode'
import {OdmService2} from '../../../odm/OdmService2'
import {LearnItem} from '../../../../../apps/Learn/models/LearnItem'
import {LearnItem$} from '../../../../../apps/Learn/models/LearnItem$'
import {stripHtml} from '../../../utils/html-utils'
import {ToastController} from '@ionic/angular'
import {Router} from '@angular/router'

type NewTreeChildType = 'learn' | 'task' | 'category'

@Component({
  selector: 'app-odm-tree-node-popup',
  templateUrl: './odm-tree-node-popup.component.html',
  styleUrls: ['./odm-tree-node-popup.component.scss'],
})
export class OdmTreeNodePopupComponent implements OnInit {

  stripHtml = stripHtml

  newChildTitle = ''
  newChildType: NewTreeChildType = 'learn'
  isAddingChild = false
  childTitleError?: string
  isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false

  @Input()
  treeNode ! : OdmTreeNode

  get item$() {
    return this.treeNode.item$ as LearnItem$
  }

  constructor(
    private toastController: ToastController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.restoreDraft()
  }

  updateNewChildTitle(event: any) {
    this.newChildTitle = event?.detail?.value ?? event?.target?.value ?? ''
    if (this.childTitleError && this.getNormalizedChildTitle()) {
      this.childTitleError = undefined
    }
    this.persistDraft()
  }

  setNewChildType(type: NewTreeChildType) {
    this.newChildType = type
    this.persistDraft()
  }

  canAddChild() {
    return !!this.getNormalizedChildTitle() && !this.isAddingChild
  }

  async addChild($event?: Event) {
    const title = this.getNormalizedChildTitle()
    if (!title) {
      this.childTitleError = 'Name this child before adding it.'
      await this.presentToast(this.childTitleError, 'warning')
      return
    }

    this.isAddingChild = true
    this.childTitleError = undefined

    const duplicate = this.findDuplicateChild(title)
    if (duplicate) {
      this.isAddingChild = false
      await this.presentDuplicateToast(duplicate, () => this.addChildAnyway(title))
      return
    }

    await this.addChildAnyway(title)
  }

  private async addChildAnyway(title: string) {
    this.isAddingChild = true

    try {
      const item$ = this.treeNode.item$
      const odmService = item$.odmService as OdmService2<any, any, any, any>
      const newItemData = this.createNewChildData(title)
      const newItem = odmService.newItem(undefined, newItemData, [item$], {createdLocally: true})
      newItem.saveNowToDb()
      this.treeNode.isExpanded = true
      this.newChildTitle = ''
      this.clearDraft()
      console.log('newItem', newItem)
      await this.presentAddedToast(newItem, this.getSuccessMessage())
    } catch (error) {
      console.error('Unable to add tree child', error)
      const message = this.formatError(error, 'Could not add this child.')
      this.childTitleError = message
      await this.presentToast(message, 'danger')
    } finally {
      this.isAddingChild = false
    }

  }

  private createNewChildData(title: string) {
    const newItemData = new LearnItem() // FIXME this should be smth like odmService.createNewItemData or automatically handled by odmService.newItem() -- to create new empty item - which is prolly a very common operation
    newItemData.title = title

    if (this.newChildType === 'task') {
      newItemData.isTask = true
      newItemData.isToLearn = false
    } else if (this.newChildType === 'category') {
      newItemData.isTask = true
      newItemData.isToLearn = false
      newItemData.categories = title
    } else {
      newItemData.isTask = undefined
      newItemData.isToLearn = true
    }

    return newItemData
  }

  private getNormalizedChildTitle() {
    return stripHtml(this.newChildTitle)?.trim() ?? ''
  }

  private getSuccessMessage() {
    if (this.newChildType === 'task') {
      return 'Task added to this branch.'
    }
    if (this.newChildType === 'category') {
      return 'Category branch added.'
    }
    return 'Learn item added to this branch.'
  }

  clearNewChild() {
    this.newChildTitle = ''
    this.childTitleError = undefined
    this.clearDraft()
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      color,
      position: 'top',
    })
    await toast.present()
  }

  private async presentAddedToast(item$: LearnItem$, message: string) {
    const toast = await this.toastController.create({
      message: this.withOfflineSaveHint(message),
      duration: 5000,
      color: 'success',
      position: 'top',
      buttons: [
        {
          text: 'Open',
          handler: () => this.router.navigateByUrl(item$.getRouterLinkUrl()),
        },
        {
          text: 'Undo',
          role: 'cancel',
          handler: () => {
            item$.deleteWithoutConfirmation()
            this.presentToast('Child removed.', 'medium')
          },
        },
      ],
    })
    await toast.present()
  }

  private async presentDuplicateToast(existingItem$: LearnItem$, addAnyway: () => void) {
    const title = this.getPlainItemTitle(existingItem$) || 'that child'
    const toast = await this.toastController.create({
      message: `"${title}" is already in this branch.`,
      duration: 7000,
      color: 'warning',
      position: 'top',
      buttons: [
        {
          text: 'Open',
          handler: () => this.router.navigateByUrl(existingItem$.getRouterLinkUrl()),
        },
        {
          text: 'Add anyway',
          handler: addAnyway,
        },
      ],
    })
    await toast.present()
  }

  private formatError(error: any, fallback: string) {
    return error?.error?.message
      ?? error?.message
      ?? fallback
  }

  private findDuplicateChild(title: string): LearnItem$ | undefined {
    const normalized = this.normalizeForDuplicateCheck(title)
    return (this.treeNode.item$.childrenList$.lastVal ?? []).find((child$: LearnItem$) => {
      return this.normalizeForDuplicateCheck(this.getPlainItemTitle(child$)) === normalized
    }) as LearnItem$ | undefined
  }

  private normalizeForDuplicateCheck(text?: string | null): string {
    return stripHtml(text)?.replace(/\s+/g, ' ').trim().toLowerCase() ?? ''
  }

  private getPlainItemTitle(item$: LearnItem$) {
    const item = item$.currentVal
    return stripHtml(item?.title || (item as any)?.question)?.trim()
  }

  private withOfflineSaveHint(message: string) {
    return this.isOffline
      ? `${message} Saved on this device; it will sync when you are online.`
      : message
  }

  private getDraftStorageKey() {
    return `LifeSuite.Learn.treeChildDraft.${this.treeNode?.item$?.id ?? 'unknown'}`
  }

  private persistDraft() {
    const title = this.getNormalizedChildTitle()
    if (!title) {
      this.clearDraft()
      return
    }
    localStorage.setItem(this.getDraftStorageKey(), JSON.stringify({
      title: this.newChildTitle,
      type: this.newChildType,
    }))
  }

  private restoreDraft() {
    const rawDraft = localStorage.getItem(this.getDraftStorageKey())
    if (!rawDraft) {
      return
    }

    try {
      const draft = JSON.parse(rawDraft)
      this.newChildTitle = draft?.title ?? ''
      this.newChildType = draft?.type ?? this.newChildType
      if (this.newChildTitle) {
        this.presentToast('Child draft restored.', 'medium')
      }
    } catch (error) {
      this.clearDraft()
    }
  }

  private clearDraft() {
    localStorage.removeItem(this.getDraftStorageKey())
  }

  @HostListener('window:online')
  onOnline() {
    this.isOffline = false
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOffline = true
  }

  deleteWithConfirmation() {

  }
}
