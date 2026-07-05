import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {JournalEntryItemsService} from "../core/journal-entries.service";
import {JournalEntry, JournalEntryId} from "../models/JournalEntry";
import {debugLog} from "../../../libs/AppFedShared/utils/log";
import {ApfGeoLocationService} from "../../../libs/AppFedShared/geo-location/apf-geo-location.service";
import {JournalTextDescriptor, JournalTextDescriptors} from "../models/JournalTextDescriptors";
import {NumericPickerVal} from "../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component";
import {JournalNumericDescriptors} from '../models/JournalNumericDescriptors'
import {JournalEntry$} from '../models/JournalEntry$'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';
import { NgIf, NgFor } from '@angular/common';
import { TimePassingComponent } from '../../../libs/AppFedShared/time/time-passing/time-passing.component';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { JournalItemEditComponent } from './journal-item-edit/journal-item-edit.component';
import { TranslatePipe } from '@ngx-translate/core';
import { MicComponent } from '../../Learn/search-or-add-learnable-item/mic/mic.component';
import { PlayButtonComponent } from '../../Learn/shared/play-button/play-button.component';

@Component({
    selector: 'app-journal-write-page',
    templateUrl: './journal-write.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./journal-write.page.sass'],
    imports: [
        IonicModule,
        RouterLink,
        AppLogoComponent,
        NgIf,
        TimePassingComponent,
        SyncStatusIconComponent,
        NgFor,
        JournalItemEditComponent,
        TranslatePipe,
        MicComponent,
        PlayButtonComponent,
    ],
})
export class JournalWritePage extends BaseComponent implements OnInit {

  public item$ ? : JournalEntry$

  /** annoying coz covers part of the last text field */
  showFab = false

  public itemId: JournalEntryId = this.activatedRoute.snapshot.params['itemId']

  item$FakeArray ! : Array<JournalEntry$>

  constructor(
    public journalEntriesService: JournalEntryItemsService,
    public geoLocationService: ApfGeoLocationService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    injector: Injector,
  ) {
    super(injector)
    debugLog(`JournalWritePage constructor this.activatedRoute.snapshot.params['itemId']`, this.activatedRoute.snapshot.params)
  }

  ngOnInit() {
    debugLog(`JournalWritePage ngOnInit()`,
      `itemId`, this.itemId,
      `this.activatedRoute.snapshot.params['itemId']`, this.activatedRoute.snapshot.params)
    this.initItem();
  }

  public initItem() {
    if ( this.itemId === `new`) {
      // #UX: #Focus: having a special url for `new` entry could actually be good: when browser/page loads, we always start fresh, without getting distracted by what happened to be the previous entry
      // ... (which might be totally irrelevant and distracting now, since we want to write new entry and not make a retrospective
      //
      // Sets the item directly rather than going through newItem()'s router.navigateByUrl - the
      // browser is already sitting at this exact URL (that's how ngOnInit got here), so
      // self-navigating to it is a no-op for the router, but its promise still only resolves
      // asynchronously, landing setItem$() (and the item$FakeArray it populates) inside the very
      // change-detection cycle that's still activating this component - which is what produced
      // NG0100 ("Previous value: undefined, Current value: [object Object]") on this page's first
      // load. newItem() itself still needs to navigate when called later from the "+" button,
      // since this component doesn't subscribe to route param changes (itemId is only a one-time
      // snapshot read below).
      this.setItem$(new JournalEntry$(this.journalEntriesService, undefined, new JournalEntry()))
    } else {
      this.setItem$(this.journalEntriesService.obtainItem$ById(this.itemId))
    }
    // this.journalEntry.saveNowToDb()
  }

  private patch(patch: any) {
    patch.lastModifiedGeo =
      /* this should be interceptor (or at least smth in overwritten method in JournalEntry) outside of UI anyway */
      this.geoLocationService.geoLocation$.lastVal &&
      this.geoLocationService.geoLocation$.lastVal.currentPosition &&
      this.geoLocationService.geoLocation$.lastVal.currentPosition.coords &&
      Object.assign({}, this.geoLocationService.geoLocation$.lastVal.currentPosition.coords)
    // .coords || null // FIXME: use on-save interceptor

    this.item$ ?. patchThrottled(patch)
  }

  newItem() {
    debugLog(`JournalWritePage newItem()`,
      `itemId`, this.itemId,
      `this.activatedRoute.snapshot.params['itemId']`, this.activatedRoute.snapshot.params)

    this.item$?.saveNowToDbIfNeeded()
    // this.item$Replacable
    this.router.navigateByUrl(`/journal/write/new`).then(() => {
      this.setItem$(new JournalEntry$(this.journalEntriesService, undefined, new JournalEntry()))
    })
  }

  private setItem$(item$: JournalEntry$) {
    this.item$ ?. saveNowToDbIfNeeded ?. ()
    this.item$ = item$
    this.item$FakeArray = [ this.item$ ]
  }
}
