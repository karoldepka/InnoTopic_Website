import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {sidesDefsArray} from '../core/sidesDefs'
import {ActivatedRoute, NavigationStart, Router} from '@angular/router'
import {LearnItemItemsService} from '../core/learn-item-items.service'
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/compat/firestore'
import { AlertController, IonicModule } from '@ionic/angular'
import {LearnItem, LearnItemId} from '../models/LearnItem'
import {ignorePromise} from '../../../libs/AppFedShared/utils/promiseUtils'
import {Observable} from 'rxjs'
import {take} from 'rxjs/operators'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {LearnItem$} from '../models/LearnItem$'
import {NavigationService} from '../../../shared/navigation.service'
import {filter} from 'rxjs/operators'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
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
import { PlayButtonComponent } from '../shared/play-button/play-button.component';
import { ItemSubItemsComponent } from './item-sub-items/item-sub-items.component';
import { ItemSideComponent } from '../shared/item-side/item-side.component';

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
        PlayButtonComponent,
        ItemSubItemsComponent,
        NgFor,
        ItemSideComponent,
        AsyncPipe,
    ],
})
export class LearnItemDetailsPage extends BaseComponent implements OnInit {

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
    public angularFirestore: AngularFirestore,
    public alertController: AlertController,
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

  private doc: AngularFirestoreDocument<LearnItem> = this.angularFirestore.collection<LearnItem>(`LearnItem`).doc(this.id)
  private audioDoc = this.angularFirestore.collection(`LearnDoAudio`).doc(this.id)

  ngOnInit() {
    this.doc.get().pipe(take(1)).subscribe({
      next: snapshot => {
        this.itemLoadFinished = true
        const rawItem = snapshot.exists ? snapshot.data() : undefined
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
            // this.doc.update({
            //   whenDeleted: new Date(),
            // })
            await this.doc.delete() // TODO: listen to promise for sync status
            await this.audioDoc.delete() // TODO: listen to promise for sync status
            ignorePromise(this.router.navigate([`/learn`]))
          }
        }
      ]
    })
    await alert.present()
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
