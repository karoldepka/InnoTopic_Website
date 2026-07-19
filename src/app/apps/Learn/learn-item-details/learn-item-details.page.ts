import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {sidesDefsArray} from '../core/sidesDefs'
import {ActivatedRoute, NavigationStart, Router} from '@angular/router'
import {LearnItemItemsService} from '../core/learn-item-items.service'
import {DocumentReference, collection, doc, getDoc} from 'firebase/firestore'
import {getAppFirestore} from '../../../libs/AppFedSharedFirebase/firebase-app'
import { AlertController, IonicModule, ToastController } from '@ionic/angular'
import {LearnItem, LearnItemId} from '../models/LearnItem'
import {ignorePromise} from '../../../libs/AppFedShared/utils/promiseUtils'
import {stripHtml} from '../../../libs/AppFedShared/utils/html-utils'
import {Observable, from} from 'rxjs'
import {take} from 'rxjs/operators'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {LearnItem$} from '../models/LearnItem$'
import {NavigationService} from '../../../shared/navigation.service'
import {filter} from 'rxjs/operators'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import {FeatureService} from '../../../libs/AppFedShared/feature.service'
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { TimePassingComponent } from '../../../libs/AppFedShared/time/time-passing/time-passing.component';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { LearnItemDetailsHintsComponent } from './learn-item-details-hints/learn-item-details-hints.component';
import { TimePointComponent } from '../../../libs/AppFedShared/time/time-point/time-point.component';
import { GeoLocComponent } from '../../../libs/AppFedShared/geo-location/geo-loc/geo-loc.component';
import { ItemClassEditComponent } from './item-class-edit/item-class-edit.component';
import { ItemClassToLearnEditComponent } from './item-class-to-learn-edit/item-class-edit.component';
import { OdmCheckbox } from '../../../libs/AppFedSharedIonic/odm-ui/bound-checkbox/odm-checkbox';
import { ImportanceEditComponent } from '../../../libs/LifeSuiteShared/edit-shared/importance-edit/importance-edit.component';
import { FunLevelEditComponent } from '../../../libs/LifeSuiteShared/edit-shared/fun-level-edit/fun-level-edit.component';
import { MentalEffortLevelEditComponent } from './mental-effort-level-edit/mental-effort-level-edit.component';
import { PhysicalHealthImpactLevelEditComponent } from './physical-health-impact-level-edit/physical-health-impact-level-edit.component';
import { MentalHealthImpactLevelEditComponent } from './mental-health-impact-level-edit/mental-health-impact-level-edit.component';
import { StatusesEditComponent } from './statuses-edit/statuses-edit.component';
import { SelfRatingComponent } from '../shared/self-rating/self-rating.component';
import { ItemSubItemsComponent } from './item-sub-items/item-sub-items.component';
import { ItemSideComponent } from '../shared/item-side/item-side.component';
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
        ImportanceEditComponent,
        FunLevelEditComponent,
        MentalEffortLevelEditComponent,
        PhysicalHealthImpactLevelEditComponent,
        MentalHealthImpactLevelEditComponent,
        StatusesEditComponent,
        SelfRatingComponent,
        ItemSubItemsComponent,
        NgFor,
        ItemSideComponent,
        TimeTrackedItemCellComponent,
        AsyncPipe,
        OdmTimestampToDatePipe,
    ],
})
export class LearnItemDetailsPage extends BaseComponent implements OnInit {

  featureService = this.injector.get(FeatureService)

  get val$(): Observable<LearnItem | nullish> {
    return this.item$.locallyVisibleChanges$
  }

  window = window

  sidesDefsArray = sidesDefsArray

  public id: LearnItemId = this.activatedRoute.snapshot.params['itemId']
  public item$: LearnItem$ = this.learnDoService.obtainItem$ById(this.id)
  public title? : string
  public itemLoadFinished = false
  public itemLoadError = ''

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
    const toast = await this.toastController.create({
      message: title ? `"${title}" restored.` : 'Item restored.',
      duration: 2400,
      color: 'success',
      position: 'bottom',
    })
    await toast.present()
  }

  private async confirmArchive(title: string) {
    this.item$.archive()
    const toast = await this.toastController.create({
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
    await toast.present()
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
