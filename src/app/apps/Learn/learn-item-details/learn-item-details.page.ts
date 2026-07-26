import {Component, Injector, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, NavigationStart, Router} from '@angular/router'
import {LearnItemItemsService} from '../core/learn-item-items.service'
import {DocumentReference, collection, doc, getDoc} from 'firebase/firestore'
import {getAppFirestore} from '../../../libs/AppFedSharedFirebase/firebase-app'
import { AlertController, IonicModule, ToastController } from '@ionic/angular'
import {presentDismissableToast} from '../../../libs/AppFedShared/utils/toast-utils'
import {LearnItem, LearnItemId} from '../models/LearnItem'
import {ignorePromise} from '../../../libs/AppFedShared/utils/promiseUtils'
import {stripHtml} from '../../../libs/AppFedShared/utils/html-utils'
import {Observable, from, Subscription} from 'rxjs'
import {take, finalize} from 'rxjs/operators'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {LearnItem$} from '../models/LearnItem$'
import {NavigationService} from '../../../shared/navigation.service'
import {filter} from 'rxjs/operators'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import {FeatureService} from '../../../libs/AppFedShared/feature.service'
import {AiBackendService} from '../core/ai-backend.service'
import {getVisibleLearnSlotDescriptors} from '../models/LearnSlotDescriptors'
import {SlotDescriptor} from '../../../libs/AppFedShared/tree/cells/SlotDescriptor'
import {OdmTreeNode} from '../../../libs/AppFedShared/tree/tree-node/OdmTreeNode'
import {OdmBackend} from '../../../libs/AppFedShared/odm/OdmBackend'
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { TimePassingComponent } from '../../../libs/AppFedShared/time/time-passing/time-passing.component';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { LearnItemDetailsHintsComponent } from './learn-item-details-hints/learn-item-details-hints.component';
import { TimePointComponent } from '../../../libs/AppFedShared/time/time-point/time-point.component';
import { GeoLocComponent } from '../../../libs/AppFedShared/geo-location/geo-loc/geo-loc.component';
import { ItemClassEditComponent } from './item-class-edit/item-class-edit.component';
import { ItemClassToLearnEditComponent } from './item-class-to-learn-edit/item-class-edit.component';
import { OdmCheckbox } from '../../../libs/AppFedSharedIonic/odm-ui/bound-checkbox/odm-checkbox';
import { StatusesEditComponent } from './statuses-edit/statuses-edit.component';
import { SelfRatingComponent } from '../shared/self-rating/self-rating.component';
import { ItemSubItemsComponent } from './item-sub-items/item-sub-items.component';
import { TreeNodeCellsComponent } from '../../../libs/AppFedShared/tree/tree-node/tree-node-content/tree-node-cells/tree-node-cells.component';
import { TimeTrackedItemCellComponent } from '../../OrYoL/time-tracking/time-tracked-item-cell/time-tracked-item-cell.component';
import { OdmTimestampToDatePipe } from '../../../libs/AppFedShared/odm/odm-timestamp-to-date.pipe';

@Component({
    selector: 'app-learn-item-details',
    templateUrl: './learn-item-details.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./learn-item-details.page.sass'],
    imports: [
        IonicModule,
        AppLogoComponent,
        NgIf,
        TimePassingComponent,
        SyncStatusIconComponent,
        LearnItemDetailsHintsComponent,
        TimePointComponent,
        GeoLocComponent,
        ItemClassEditComponent,
        ItemClassToLearnEditComponent,
        OdmCheckbox,
        StatusesEditComponent,
        SelfRatingComponent,
        ItemSubItemsComponent,
        TreeNodeCellsComponent,
        TimeTrackedItemCellComponent,
        AsyncPipe,
        OdmTimestampToDatePipe,
    ],
})
export class LearnItemDetailsPage extends BaseComponent implements OnInit, OnDestroy {

  featureService = this.injector.get(FeatureService)
  private aiBackend = this.injector.get(AiBackendService)

  get val$(): Observable<LearnItem | nullish> {
    return this.item$.locallyVisibleChanges$
  }

  window = window

  public id: LearnItemId = this.activatedRoute.snapshot.params['itemId']
  public item$: LearnItem$ = this.learnDoService.obtainItem$ById(this.id)
  public title? : string
  public itemLoadFinished = false
  public itemLoadError = ''

  /** GH #89's unified slot rendering, replacing the old fixed `<app-importance-edit>`/numeric-
   * bucket `<ion-grid>`/`*ngFor="let side of sidesDefsArray"` block. Not part of any real tree
   * view (same reasoning as Journal's `journal-item-edit.component.ts`) - a standalone
   * `OdmTreeNode` wrapping just this one item is enough for `OdmCell`/`TreeNodeCellsComponent`. */
  treeNode: OdmTreeNode<LearnItem$> = new OdmTreeNode(undefined, this.item$)

  visibleDescriptors: SlotDescriptor[] = getVisibleLearnSlotDescriptors(this.item$.currentVal)

  aiFillLoadingDescriptorId: string | null = null

  private valSubscription?: Subscription

  private readonly onWindowBeforeUnload = () => this.flushPendingEdits()

  /** Mobile Safari/WKWebView doesn't reliably fire `beforeunload` - `visibilitychange` going
   * `hidden` is the reliable signal there. Learn never had this data-loss-prevention safeguard
   * before this unification (confirmed: no ngOnDestroy/beforeunload/flush of any kind existed on
   * this page) - ported from Journal's `journal-write.page.ts`, not merely preserved. */
  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.flushPendingEdits()
    }
  }

  constructor(
    public activatedRoute: ActivatedRoute,
    public learnDoService: LearnItemItemsService,
    public alertController: AlertController,
    public toastController: ToastController,
    public router: Router,
    public navigationService: NavigationService,
    injector: Injector,
  ) {
    super(injector)
    // router.events.pipe(
    //   filter(event => event instanceof NavigationStart) /* Using NavigationStart coz could be good if quickly clicking next next */
    // ).subscribe((event: NavigationStart) => {
    //   this.navigationService.currentItemId = event.
    // });
    this.activatedRoute.params.subscribe((params)=>{
      this.navigationService.setCurrenItemId(params['itemId'])
    });
  }

  private doc: DocumentReference<LearnItem> = doc(collection(getAppFirestore(), `LearnItem`), this.id) as DocumentReference<LearnItem>

  ngOnInit() {
    from(getDoc(this.doc)).pipe(take(1)).subscribe({
      next: snapshot => {
        this.itemLoadFinished = true
        const rawItem = snapshot.exists() ? snapshot.data() : undefined
        if (rawItem) {
          this.item$.applyDataFromDbAndEmit(this.learnDoService.convertFromDbFormat(rawItem))
        }
      },
      error: error => {
        this.itemLoadFinished = true
        this.itemLoadError = error?.message ?? `${error}`
        console.error('Failed to load routed learn item', this.id, error)
      },
    })

    // Re-filter onlyForLearn sides whenever isTask/isToLearn actually change - see
    // LearnSlotDescriptors.ts's doc comment for why this can't just be a static array.
    this.valSubscription = this.item$.val$.subscribe(val => {
      this.visibleDescriptors = getVisibleLearnSlotDescriptors(val)
    })

    window.addEventListener('beforeunload', this.onWindowBeforeUnload)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  ngOnDestroy() {
    this.flushPendingEdits()
    this.valSubscription?.unsubscribe()
    window.removeEventListener('beforeunload', this.onWindowBeforeUnload)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }

  /** Forces this item's pending-patch throttle to save immediately before navigating away - see
   * `journal-write.page.ts`'s identical `flushPendingEdits()` for the full rationale. */
  private flushPendingEdits() {
    this.item$?.saveNowToDbIfNeeded?.()
  }

  /** Ported from the old `ItemSideComponent.fillWithAI()` (which only ever actually ran for the
   * `answer` side - see `SlotDescriptor.aiFillable`) - ` TreeNodeCellsComponent` only forwards
   * *which* descriptor asked; the actual generation call and where the result gets written stay
   * here, same as before. */
  onAiFillRequested(descriptor: SlotDescriptor) {
    if (this.aiFillLoadingDescriptorId) {
      return
    }
    const item = this.item$.currentVal
    if (!item) {
      return
    }
    const question = stripHtml(item.getQuestion?.() || item.title || '') || ''
    const context = (item.joinedSides ? stripHtml(item.joinedSides()) : '') ?? ''

    this.aiFillLoadingDescriptorId = descriptor.id
    this.item$.patchThrottled({[descriptor.id]: ''} as any)

    this.aiBackend.generateAnswerWithWebSearch(question, context).pipe(
      finalize(() => this.aiFillLoadingDescriptorId = null)
    ).subscribe({
      next: response => {
        const modelName = (response as any)?.modelName || 'unknown-model'
        const marker = `#FilledByAI:(${modelName})`
        const answer = `${((response as any)?.answer || '').trim()}\n\n${marker}`.trim()
        this.item$.patchThrottled({[descriptor.id]: answer, whenGeneratedByAi: OdmBackend.nowTimestamp()} as any)
      },
      error: e => console.error('Error filling with AI', e),
    })
  }

  async askDelete() {
    const alert = await this.alertController.create({
      header: 'Delete item ' + this.item$ ?. currentVal ?. title + " ?",
      message: 'Delete <strong>' + this.item$ ?. currentVal ?. joinedSides ?. () + '</strong>!!!?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'DELETE',
          handler: async () => {
            this.item$.patchThrottled({whenDeleted: new Date()})
            ignorePromise(this.router.navigate([`/learn`]))
          }
        }
      ]
    })
    await alert.present()
  }

  async askArchive() {
    const title = this.getShortTitle()
    const alert = await this.alertController.create({
      header: 'Archive item?',
      message: title
        ? `"${title}" will be hidden from active lists.`
        : 'This item will be hidden from active lists.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Archive',
          role: 'destructive',
          handler: () => this.confirmArchive(title),
        },
      ],
    })
    await alert.present()
  }

  async restore() {
    const title = this.getShortTitle()
    this.item$.unarchive()
    await presentDismissableToast(this.toastController, {
      message: title ? `"${title}" restored.` : 'Item restored.',
      duration: 2400,
      color: 'success',
      position: 'bottom',
    })
  }

  private async confirmArchive(title: string) {
    this.item$.archive()
    await presentDismissableToast(this.toastController, {
      message: title ? `"${title}" archived.` : 'Item archived.',
      duration: 6000,
      color: 'medium',
      position: 'bottom',
      buttons: [
        {
          text: 'Undo',
          role: 'cancel',
          handler: () => this.item$.unarchive(),
        },
      ],
    })
  }

  private getShortTitle(): string {
    const item = this.item$.currentVal
    const title = stripHtml(item?.title || (item as any)?.question || item?.joinedSides?.())
      ?.replace(/\s+/g, ' ')
      .trim() ?? ''
    return title.length > 80 ? title.slice(0, 77) + '...' : title
  }

  toggleWhenDone() {
    this.setWhenDone(!this.item$.currentVal?.whenDone)
  }

  setWhenDone(isDone: boolean) {
    this.item$.patchThrottled({
      whenDone: isDone ? new Date() : null,
    })
  }

}
