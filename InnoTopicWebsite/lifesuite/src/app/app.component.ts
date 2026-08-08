import {Component, HostListener, ChangeDetectionStrategy} from '@angular/core';

import {Platform, PopoverController} from '@ionic/angular';
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
import {OdmConflictToastService} from './libs/AppFedSharedBrowser/odm-browser/OdmConflictToastService'
import {IndexedDbHealthToastService} from './libs/AppFedSharedBrowser/odm-browser/IndexedDbHealthToastService'
// import {fakeExportToNotLookUnused} from '../background/background'

@Component({
  standalone: false,
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  /** LifeDvisor navigation, rendered by the official Ionic sidemenu-starter shell. */
  public appPages = [
    {title: 'Home', url: '/lifedvisor', icon: 'home'},
    {title: 'Search', url: '/ask', icon: 'search'},
    {title: 'Rating Log', url: '/ask/log', icon: 'star'},
    {title: 'Rationale', url: '/rationale', icon: 'bulb'},
    {title: 'Life Overviews', url: '/life-overviews', icon: 'bar-chart'},
    {title: 'Occupations', url: '/occupations', icon: 'person'},
    {title: 'About Lifedvisor', url: '/about-lifedvisor', icon: 'information-circle'},
  ]

  public morePages = [
    {title: 'Success Probability', url: '/success-chance', icon: 'analytics'},
    {title: 'Exponential Improvement', url: '/exponential-improvement', icon: 'trending-up'},
    {title: 'What Next', url: '/what-next', icon: 'compass'},
    {title: 'Mindfulness', url: '/mindfulness', icon: 'leaf'},
    {title: 'Sleep', url: '/sleep', icon: 'moon'},
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
    public syncStatusService: SyncStatusService,
    public optionsService: OptionsService,
    public popoverController: PopoverController,
    private router: Router,
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
