import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {AuthService} from '../../../../../auth/auth.service'
import {SyncStatus, SyncStatusService} from '../../sync-status.service'
// import {LearnStatsService} from '../../../../../apps/Learn/core/learn-stats.service'
import {OptionsService} from '../../../../../apps/Learn/core/options.service'
import {BaseComponent} from '../../../base/base.component'
import {CachedSubject} from '../../../utils/cachedSubject2/CachedSubject2'
import { User } from 'firebase/auth'
import { AboutAppComponent } from './about-app/about-app.component';
import { FeatureConfigComponent } from '../../../feature-config/feature-config.component';
import { LanguageSwitcherComponent } from '../../../i18n/language-switcher/language-switcher.component';
import { NgIf, NgForOf, NgTemplateOutlet, AsyncPipe, JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertController, IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import {stripHtml} from '../../../utils/html-utils'
import {BrowserOdmStorage} from '../../../../AppFedSharedBrowser/odm-browser/BrowserOdmStorage'
import {VoiceMemoService} from '../../../audio/voice-memo.service'
import {summarizePatch} from '../../OdmItem$2'
import {TimeTrackingService} from '../../../../../apps/OrYoL/time-tracking/time-tracking.service'
import {TimeTrackingToolbarComponent} from '../../../../../apps/OrYoL/time-tracking/time-tracking-toolbar/time-tracking-toolbar.component'
import {environment} from '../../../../../../environments/environment'

@Component({
    selector: 'app-sync-popover',
    templateUrl: './sync-popover.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./sync-popover.component.sass'],
    imports: [
        AboutAppComponent,
        FeatureConfigComponent,
        LanguageSwitcherComponent,
        NgIf,
        NgForOf,
        NgTemplateOutlet,
        IonicModule,
        AsyncPipe,
        JsonPipe,
        TranslatePipe,
        TimeTrackingToolbarComponent,
    ],
})
export class SyncPopoverComponent extends BaseComponent implements OnInit {


  syncStatus$: CachedSubject<SyncStatus> = this.syncStatusService.syncStatus$

  authUser$: CachedSubject<User | null> = this.authService.authUser$

  aboutAppExpanded = false

  /** GH #61: the user's email is PII shown in a popover reachable with a single tap from
   * anywhere in the app (e.g. over someone's shoulder) - hidden by default, click to reveal. */
  emailRevealed = false

  private static readonly clicksToRevealFeatureConfig = 5

  private aboutAppClickCount = 0

  showFeatureConfig = false

  /** Kept with the developer-only feature options to avoid exposing deployment details in the
   * normal sync menu. */
  readonly backendUrl = environment.aiBackendUrl || '/ai-api (local development proxy)'

  constructor(
    public authService: AuthService,
    public syncStatusService: SyncStatusService,
    // public learnStatsService: LearnStatsService,
    public optionsService: OptionsService,
    private popoverController: PopoverController,
    private router: Router,
    private alertController: AlertController,
    private browserOdmStorage: BrowserOdmStorage,
    public voiceMemoService: VoiceMemoService,
    // GH #78: reuses the same toolbarEntries$ the app-root toolbar's mic/time-tracking bar
    // already shows, so this popover's "currently tracking" section stays in sync with it for
    // free instead of re-deriving its own view of what's being tracked.
    public timeTrackingService: TimeTrackingService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  onClickAboutAppToggle() {
    this.aboutAppExpanded = ! this.aboutAppExpanded
    if ( ! this.showFeatureConfig ) {
      this.aboutAppClickCount++
      this.showFeatureConfig = this.aboutAppClickCount >= SyncPopoverComponent.clicksToRevealFeatureConfig
    }
  }

  async logIn() {
    await this.popoverController.dismiss()
    await this.router.navigateByUrl('/auth')
  }

  /** Clears the local IndexedDB cache on logout (see BrowserOdmStorage.clearAllLocalData's doc
   * comment) so a different user signing in on the same shared device never sees a previous
   * user's cached rows - but warns first if anything is still unsynced, since wiping the cache
   * would otherwise silently lose exactly the kind of not-yet-saved edit this whole app is built
   * to protect. */
  async logOut() {
    const pendingCount =
      (this.syncStatusService.durablePendingSyncItems$.lastVal?.length ?? 0) +
      (this.syncStatusService.durablePendingBlobUploads$.lastVal?.length ?? 0)

    if (pendingCount > 0) {
      const alert = await this.alertController.create({
        header: 'Unsynced changes',
        message: `You have ${pendingCount} change(s) that haven't finished syncing yet. Logging out now will lose them. Log out anyway?`,
        buttons: [
          {text: 'Cancel', role: 'cancel'},
          {text: 'Log Out Anyway', role: 'destructive', handler: () => this.performLogout()},
        ],
      })
      await alert.present()
      return
    }

    await this.performLogout()
  }

  private async performLogout() {
    this.authService.logout()
    await this.browserOdmStorage.clearAllLocalData()
    window.location.reload()
  }

  openOptions() {
    this.optionsService.openOptions()
  }

  forceReload() {
    window.location.reload()
  }

  /** Escape hatch for a mic left open (recording or just warm-kept) on a field the user has
   * since navigated away from - releases every currently-open microphone stream app-wide,
   * regardless of which field(s) opened them, without needing to find that field again. */
  releaseMic() {
    this.voiceMemoService.releaseAllActiveMics()
  }

  toArray(t: any) {
    return Array.from(t)
  }

  /** User-visible descriptions of the changes still waiting to be uploaded. */
  pendingUploadDescriptions(status: SyncStatus | null | undefined): string[] {
    if ( ! status ?. pendingUploads ) {
      return []
    }
    return Array.from(status.pendingUploads).map(
      upload => upload.titleOfChange || 'Unsaved change'
    )
  }

  /** durablePendingSyncItems$ - unlike pendingUploads above, this survives a page reload and
   * stays populated while an edit is offline/failed and waiting to retry, not just while a save
   * is actively in flight this session. */
  get durablePendingSyncItems$() { return this.syncStatusService.durablePendingSyncItems$ }

  /** Falls back through title/name/question (works well for OryItem/LearnItem etc.) down to the
   * item's own id plus a summarized field-level patch (e.g. JournalEntry, which has none of
   * those fields) - previously fell all the way back to the bare collection name with no
   * indication of which item or what changed. */
  describePendingSyncItem(patch: Record<string, any>, collection: string, itemId?: string): string {
    const title = patch?.['title'] ?? patch?.['name'] ?? patch?.['question']
    const plainTitle = stripHtml(title)?.trim()
    if (plainTitle) {
      return `${collection}: "${plainTitle}"`
    }
    const patchSummary = summarizePatch(patch)
    const idPart = itemId ? ` ${itemId}` : ''
    return patchSummary ? `${collection}${idPart} (${patchSummary})` : `${collection}${idPart}`
  }
}
