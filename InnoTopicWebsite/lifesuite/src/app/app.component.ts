import {Component, HostListener, ChangeDetectionStrategy} from '@angular/core';
import Fuse from 'fuse.js'

import {MenuController, Platform, PopoverController} from '@ionic/angular';
import {Router} from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import {TimerNotificationsService} from "./core/timer-notifications.service";
import {SyncStatusService} from './libs/AppFedShared/odm/sync-status.service'
// import {LearnStatsService} from './apps/Learn/core/learn-stats.service'
import {AuthService} from './auth/auth.service'
import {OptionsService} from './apps/Learn/core/options.service'
import {SyncPopoverComponent} from './libs/AppFedShared/odm/sync-status/sync-popover/sync-popover.component'
import {OptionsComponent} from './libs/AppFedShared/options/options.component'
import {ThemeUiService} from '@innotopic/theme-ui-angular'
import {environment} from '../environments/environment'
import {FeatureService} from './libs/AppFedShared/feature.service'
import {g} from './libs/AppFedShared/g'
import {OdmConflictToastService} from './libs/AppFedSharedBrowser/odm-browser/OdmConflictToastService'
import {IndexedDbHealthToastService} from './libs/AppFedSharedBrowser/odm-browser/IndexedDbHealthToastService'
import {WhatNextActionsService} from './apps/Learn/what-next/what-next-actions.service'
// import {fakeExportToNotLookUnused} from '../background/background'

interface SideMenuPage {
  title: string
  icon: string
  /** Either this (a plain routerLink)... */
  url?: string
  /** ...or this (an arbitrary action, e.g. the What Next shortcuts that prime some state before
   * navigating rather than just linking straight to a route) - never both. */
  action?: () => void
  /** Mirrors WhatNextDestination's own gating (what-next-destination-ranking.ts) - evaluated
   * fresh on every access (not cached), same reasoning as WhatNextPage.visibleDestinations. */
  visibleIf?: () => boolean
}

@Component({
  standalone: false,
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  /** LifeDvisor navigation, rendered by the official Ionic sidemenu-starter shell. */
  public appPages: SideMenuPage[] = [
    {title: 'Home', url: '/lifedvisor', icon: 'home'},
    {title: 'What Next', url: '/what-next', icon: 'compass'},
    {title: 'Search', url: '/ask', icon: 'search'},
    {title: 'Rating Log', url: '/ask/log', icon: 'star'},
    {title: 'Rationale', url: '/rationale', icon: 'bulb'},
    {title: 'Life Overviews', url: '/life-overviews', icon: 'bar-chart'},
    {title: 'Occupations', url: '/occupations', icon: 'person'},
    {title: 'About Lifedvisor', url: '/about-lifedvisor', icon: 'information-circle'},
  ]

  /** Every other WhatNextPage destination (what-next.page.ts's own `destinations`), so the same
   * shortcuts are reachable straight from the side menu too - kept in the same order as that
   * page's own list. Skips the handful already covered above/below under a different label for
   * the exact same route (Search=/ask, Mindfulness, Sleep, Success Probability, Exponential
   * Improvement) rather than listing the same destination twice. `action`-based entries
   * (craving-fun, why-bother) delegate to the same WhatNextActionsService WhatNextPage itself
   * uses, so there's exactly one implementation of each to keep in sync. */
  public morePages: SideMenuPage[] = [
    {title: 'Success Probability', url: '/success-chance', icon: 'analytics'},
    {title: 'Exponential Improvement', url: '/exponential-improvement', icon: 'trending-up'},
    {title: 'Mindfulness', url: '/mindfulness', icon: 'leaf'},
    {title: 'Sleep', url: '/sleep', icon: 'moon'},
    {
      title: 'Affirmations',
      url: '/learn/item/LearnItem__2022-05-26__17.33.46.061Z_',
      icon: 'happy',
      visibleIf: () => g.feat.showExperimental,
    },
    {title: 'Craving fun Panic Button', icon: 'flash', action: () => this.whatNextActions.cravingFun()},
    {title: 'Generate questions, answers', url: '/ai/qa', icon: 'help-circle'},
    {title: 'AI Chat', url: '/learn/ai-chat', icon: 'chatbubbles'},
    {title: 'CopilotKit', url: '/copilotkit', icon: 'construct'},
    {title: 'Bow Quiz', url: '/learn/bow-quiz', icon: 'ribbon'},
    {title: 'Why Bother?', icon: 'heart', action: () => this.whatNextActions.whyBother()},
    {title: 'Lifedvisor', url: '/lifedvisor', icon: 'navigate', visibleIf: () => g.feat.tutorial.unpolished},
    {title: 'Plan', url: '/tree', icon: 'list'},
    {title: 'LifeSuite App Tutorial', url: '/tutorial', icon: 'book', visibleIf: () => g.feat.tutorial.unpolished},
    {title: 'Contemplate', url: '/contemplate-life', icon: 'infinite', visibleIf: () => g.feat.showExperimental},
    {
      title: 'Process Learn Items (& tasks)',
      url: '/item-processing',
      icon: 'file-tray-full',
      visibleIf: () => g.feat.showExperimental,
    },
    {title: 'Categories', url: '/categories', icon: 'pricetags', visibleIf: () => g.feat.showExperimental},
    {
      title: 'Categories Stats',
      url: '/categories-stats',
      icon: 'stats-chart',
      visibleIf: () => g.feat.showExperimental,
    },
    {title: 'Learn & Do', url: '/learn', icon: 'school'},
    {title: 'Quiz', url: '/learn/quiz', icon: 'help-circle'},
    {title: 'Write Journal', url: '/journal/write', icon: 'create'},
    {title: 'RETROSPECTIVE', url: '/journal', icon: 'time'},
    {title: 'Check Your progress', url: '/learn/stats', icon: 'podium', visibleIf: () => g.feat.showExperimental},
  ]

  constructor(
    private platform: Platform,
    private featureService /* force the service to run */: FeatureService,
    private themeUiService: ThemeUiService,
    private timerNotificationService /* force the service to run */: TimerNotificationsService /* FIXME commenting this out causes errors */,
    private authService  /* force the service to run */: AuthService,
    private odmConflictToastService /* force the service to run */: OdmConflictToastService,
    private indexedDbHealthToastService /* force the service to run */: IndexedDbHealthToastService,
    // private learnStatsService  /* force the service to run */: LearnStatsService,
    private whatNextActions: WhatNextActionsService,
    public syncStatusService: SyncStatusService,
    public optionsService: OptionsService,
    public popoverController: PopoverController,
    private router: Router,
    private menuCtrl: MenuController,
  ) {
    this.initializeApp();
  }

  // fakeExportToNotLookUnused = fakeExportToNotLookUnused + 'dummy' // causes `background.ts:7 Uncaught ReferenceError: firebase is not defined`

  initializeApp() {
    // A fresh, non-repeating theme per visit (ported from ThemeService's old constructor, which
    // called applyRandomTheme() unconditionally on construction) - theme-ui's own store otherwise
    // just persists+restores the same theme across launches, which would silently drop this.
    this.themeUiService.applyRandomTheme({ includeExperimental: environment.showExperimentalThemes })

    this.platform.ready().then(() => {
      if (Capacitor.isNativePlatform()) {
        StatusBar.setStyle({style: Style.Default});
        StatusBar.setOverlaysWebView({overlay: false})
      }

      SplashScreen.hide();
      this.setupOptionsHandler()
      console.log('initializeApp ...')
    });
  }

  /** Whatever had focus right before the side menu opened (e.g. a page's own input/button) -
   * restored on close so opening the menu, searching, and dismissing it without picking anything
   * doesn't strand focus on a now-hidden search field. Captured on ionWillOpen (before Ionic moves
   * focus into the menu itself) rather than ionDidOpen. */
  private elementFocusedBeforeSideMenuOpened: HTMLElement | null = null

  onSideMenuWillOpen(): void {
    this.elementFocusedBeforeSideMenuOpened = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }

  onSideMenuDidClose(): void {
    this.elementFocusedBeforeSideMenuOpened?.focus()
    this.elementFocusedBeforeSideMenuOpened = null
  }

  /** Side-menu search box (title-only, no MRU ranking - unlike WhatNextPage's own
   * rankDestinations(), this menu has no usage-tracking to rank by, just plain filtering). */
  searchTerm = ''

  onSearchChange(term: string): void {
    this.searchTerm = term
  }

  /** Same reasoning as WhatNextPage.visibleDestinations - evaluated fresh on every access (not
   * cached), so toggling a feature flag while the menu is open takes effect immediately. */
  visiblePages(pages: SideMenuPage[]): SideMenuPage[] {
    return pages.filter(page => !page.visibleIf || page.visibleIf())
  }

  /** visiblePages() + search-term filtering, in that order - a page hidden behind a feature flag
   * should never resurface just because its title happens to match what was typed. Same
   * fuzzy-match approach (Fuse.js, same threshold) as WhatNextPage's rankDestinations() for a
   * consistent search feel across the app, just without that one's MRU ranking. */
  filteredPages(pages: SideMenuPage[]): SideMenuPage[] {
    const visible = this.visiblePages(pages)
    const trimmed = this.searchTerm.trim()
    if (!trimmed) {
      return visible
    }
    const fuse = new Fuse(visible, {keys: ['title'], threshold: 0.2, ignoreLocation: true})
    return fuse.search(trimmed).map(result => result.item)
  }

  /** `action`-based entries (ported from WhatNextPage's own destinations) have no route to link
   * to directly - ion-menu-toggle still needs to close the menu either way, so this always runs
   * (even for a plain `url` entry, where it's a no-op) rather than only wiring `(click)` on the
   * action-only branch. */
  go(page: SideMenuPage): void {
    page.action?.()
  }

  /** Enter in the search box jumps straight to the top result (appPages ranked before morePages,
   * same top-to-bottom order they're rendered in) - same "just hit enter" convenience as a
   * command palette, instead of having to reach for the mouse once the list is down to one match.
   * Bypasses ion-menu-toggle's click-based close (Enter never fires a click on the item), so the
   * menu is closed here explicitly instead. */
  async onSearchEnter(event?: KeyboardEvent): Promise<void> {
    event?.preventDefault()
    event?.stopPropagation()
    const first = this.filteredPages(this.appPages)[0] ?? this.filteredPages(this.morePages)[0]
    if (!first) {
      return
    }
    // Close the overlay before routing. Navigating first can replace the page underneath while
    // Ionic is still animating the menu, leaving the side menu visibly open on the destination.
    await this.menuCtrl.close()
    this.go(first)
    if (first.url) {
      await this.router.navigateByUrl(first.url)
    }
  }

  private setupOptionsHandler() {
    this.optionsService.openOptions$.subscribe(async (isOpen) => {
      if (isOpen) {
        const popover = await this.popoverController.create({
          component: OptionsComponent,
          event: event /* FIXME some global event object */,
          translucent: true,
          mode: 'ios',
        });
        return await popover.present();
      }
    })
  }

  /** Bare "j" (mnemonic for Journal) jumps straight to a new journal entry from anywhere in the
   * app - no modifier needed, since every modifier combo that reads as "J" is already taken by
   * the browser itself (Ctrl+J opens Chrome/Firefox/Edge's Downloads, Ctrl+Shift+J opens Chrome
   * DevTools' console) and Ctrl+Alt+J risks colliding with AltGr on non-US keyboard layouts. A
   * bare unmodified letter is exactly the convention Gmail/GitHub/Linear/Notion/Trello already use
   * for their own primary "create new" shortcut, and browsers never reserve it.
   *
   * `event.composedPath()[0]` (not `event.target`) - keydown is a composed event, so `target` on a
   * `document`-level listener gets retargeted to the shadow-DOM *host* (e.g. `<ion-input>`, not
   * its inner native `<input>`), which would silently defeat a `tagName === 'INPUT'` check. */
  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key !== 'j' || event.ctrlKey || event.metaKey || event.altKey) {
      return
    }
    const target = event.composedPath()[0] as HTMLElement | undefined
    if (target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')) {
      return
    }
    event.preventDefault()
    this.router.navigateByUrl('/journal/write/new')
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload($event: any) {
    if ( this.syncStatusService.hasPendingUploads ) {
      // TODO: record throttled patches too
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
      // Cancel the event as stated by the standard.
      $event.preventDefault();
      // Chrome requires returnValue to be set.
      $event.returnValue = 'Your data will be lost!';
      /// TODO: https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event
    }
  }

}
