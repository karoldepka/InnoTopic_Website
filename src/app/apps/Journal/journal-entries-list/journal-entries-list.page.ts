import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {JournalEntryItemsService} from '../core/journal-entries.service'
import {JournalEntry$} from '../models/JournalEntry$'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {of} from 'rxjs'
import {combineLatest} from 'rxjs'
import {BehaviorSubject} from 'rxjs'
import {map} from 'rxjs/operators'
import Fuse from 'fuse.js'
import {debugLog} from '../../../libs/AppFedShared/utils/log'
import {JournalEntry} from '../models/JournalEntry'
import {ListOptionsComponent} from '../../Learn/search-or-add-learnable-item/list-options/list-options.component'
import { PopoverController, IonicModule } from '@ionic/angular'
import {LocalOptionsPatchableObservable} from '../../Learn/core/options.service'
import {ListOptionsData} from '../../Learn/search-or-add-learnable-item/list-options'
import {TimelineListOptionsComponent} from './timeline-list-options/timeline-list-options.component'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { RouterLink } from '@angular/router';
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { CdkVirtualScrollViewport, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { CdkAutoSizeVirtualScroll } from '@angular/cdk-experimental/scrolling';
import { JournalEntryListItemComponent } from '../../../timers/timers-list/journal-entry-list-item/journal-entry-list-item.component';
import {AuthService} from '../../../auth/auth.service'

export class TimelineListOptionsData {
  sortAscending ? : boolean
}

@Component({
    selector: 'app-journal-entries-list',
    templateUrl: './journal-entries-list.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./journal-entries-list.page.sass'],
    imports: [
        IonicModule,
        RouterLink,
        AppLogoComponent,
        NgIf,
        SyncStatusIconComponent,
        CdkVirtualScrollViewport,
        CdkAutoSizeVirtualScroll,
        CdkVirtualForOf,
        JournalEntryListItemComponent,
        NgFor,
        AsyncPipe,
    ],
})
export class JournalEntriesListPage extends BaseComponent implements OnInit {

  useVirtualScroll = true

  listOptions$P = new LocalOptionsPatchableObservable<TimelineListOptionsData>({
      sortAscending: false
    },
    'TimelineList_Options'
  )

  // itemsTest$ = of(    Array(100).fill(0).map((val) => {
  //     return 'test'+val
  //   })
  // ).pipe(delay(3000))

  items$: CachedSubject<JournalEntry$[]> = this.journalEntriesService.localItems$
  // itemsHack ? : JournalEntry$[]
  items$Sorted = combineLatest(this.listOptions$P.val$, this.items$, (options, item$s) => {
      return item$s
        // .filter(x => (x.val?.importance?.numVal ?? 0) > 7)
        .sort((item$1, item$2) => {
          const number = ((item$2.val?.whenCreated ?? (item$2.val as any)?.whenAdded)?.toDate().getTime() ?? 0) -
            ((item$1.val?.whenCreated ?? (item$1.val as any)?.whenAdded)?.toDate().getTime() ?? 0)
          return options.sortAscending ? number : -number
        })
    })

  /** Runs entirely client-side against whatever's already loaded in items$ (the local ODM
   * cache), so it works offline exactly like the rest of the list does - no network involved. */
  searchTerm$ = new BehaviorSubject<string>('')

  private searchableTextFor(item$: JournalEntry$): string {
    const entry = item$.val
    if ( ! entry ) {
      return ''
    }
    const textFieldValues = entry.getPresentTextFieldEntries().map(([, text]) => text)
    const numericFieldComments = entry.getPresentCompositeFieldEntries()
      .map(([, , comment]) => comment)
      .filter((comment): comment is string => !!comment)
    return [entry.general, entry.text, ...textFieldValues, ...numericFieldComments]
      .filter((part): part is string => !!part)
      .join(' \n ')
  }

  items$Filtered = combineLatest([this.items$Sorted, this.searchTerm$]).pipe(
    map(([items, searchTerm]) => {
      const trimmedTerm = searchTerm.trim()
      if ( ! trimmedTerm ) {
        return items
      }
      const searchableItems = items.map(item$ => ({item$, text: this.searchableTextFor(item$)}))
      // Fuzzy/typo-tolerant: threshold 0.4 (0 = exact match only, 1 = matches anything) is
      // Fuse's own suggested starting point for forgiving free-text search.
      const fuse = new Fuse(searchableItems, {keys: ['text'], threshold: 0.4, ignoreLocation: true})
      return fuse.search(trimmedTerm).map(result => result.item.item$)
    })
  )

  onSearchInput(event: CustomEvent) {
    this.searchTerm$.next((event.detail as any)?.value ?? '')
  }

  constructor(
    public journalEntriesService: JournalEntryItemsService,
    public popoverController: PopoverController,
    public authService: AuthService,
    injector: Injector,
  ) {
    super(injector)
    this.listOptions$P.val$.subscribe(x => {
      console.log(`listOptions$P`, x)
    })
    // this.items$.subscribe(val => {
    //   this.itemsHack = val.slice(0, 20)
    //   // debugLog(`this.items$.subscribe(val => {`, val)
    //
    // })
  }

  ngOnInit() {
  }

  trackById(index: number, item: JournalEntry$) {
    return item.id
  }

  async onClickListOptions(event: any) {
    const popover = await this.popoverController.create({
      component: TimelineListOptionsComponent,
      componentProps: {
        listOptions$P: this.listOptions$P,
        itemsService: this.journalEntriesService,
      },
      event: event,
      translucent: true,
      mode: 'ios',
      cssClass: `my-popover`,
    });
    return await popover.present();
  }
}
