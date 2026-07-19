import {Component, Injector, OnInit, OnDestroy, ChangeDetectionStrategy} from '@angular/core';
import {JournalEntryItemsService} from "../core/journal-entries.service";
import {JournalEntry, JournalEntryId} from "../models/JournalEntry";
import {debugLog} from "../../../libs/AppFedShared/utils/log";
import {ApfGeoLocationService} from "../../../libs/AppFedShared/geo-location/apf-geo-location.service";
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
    ],
})
export class JournalWritePage extends BaseComponent implements OnInit, OnDestroy {

  public item$ ? : JournalEntry$

  /** annoying coz covers part of the last text field */
  showFab = false

  public itemId: JournalEntryId = this.activatedRoute.snapshot.params['itemId']

  item$FakeArray ! : Array<JournalEntry$>

  private readonly onWindowBeforeUnload = () => this.flushPendingEdits()

  /** Mobile Safari/WKWebView (the realistic runtime for this app backgrounded via home button,
   * app-switch, or screen lock) doesn't reliably fire `beforeunload` - `visibilitychange` going
   * `hidden` is the standard, reliable signal for "the app is about to be suspended/killed" on
   * mobile, so it needs its own flush rather than relying on beforeunload alone. */
  private readonly onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.flushPendingEdits()
    }
  }

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
    // Covers an actual tab/app close, not just in-app navigation - the throttled ViewSyncer
    // subscriptions below wouldn't otherwise get a chance to flush their trailing edge at all.
    window.addEventListener('beforeunload', this.onWindowBeforeUnload)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  ngOnDestroy() {
    // Covers in-app navigation away from this page (back button, tapping some other link) that
    // doesn't go through newItem()/onBackClicked() below.
    this.flushPendingEdits()
    window.removeEventListener('beforeunload', this.onWindowBeforeUnload)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }

  /** Forces the item's own pending-patch throttle to save immediately. Without this, typing
   * something and immediately navigating away (or backgrounding the app) within the DB-save
   * throttle window could silently drop that last edit - the throttle's trailing edge is still
   * waiting to fire and never gets the chance to. Used to need a separate per-field flush too
   * (the old `ViewSyncer`-based text fields had their own throttle layer above this one) - GH
   * #89's unified `RichTextEditCellComponent`/`MinMidMaxCellComponent` cells call
   * `OdmItem$2.patchThrottled()` directly on every change with no additional debounce of their
   * own, so this one call already covers everything. */
  private flushPendingEdits() {
    this.item$ ?. saveNowToDbIfNeeded ?. ()
  }

  onBackClicked() {
    this.flushPendingEdits()
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

    this.flushPendingEdits()
    // this.item$Replacable
    this.router.navigateByUrl(`/journal/write/new`).then(() => {
      this.setItem$(new JournalEntry$(this.journalEntriesService, undefined, new JournalEntry()))
    })
  }

  private setItem$(item$: JournalEntry$) {
    this.flushPendingEdits()
    this.item$ = item$
    this.item$FakeArray = [ this.item$ ]
  }
}
