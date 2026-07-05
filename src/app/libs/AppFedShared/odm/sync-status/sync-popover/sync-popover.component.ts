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
import { ThemeConfigComponent } from '../../../theme-config/theme-config.component';
import { LanguageSwitcherComponent } from '../../../i18n/language-switcher/language-switcher.component';
import { NgIf, NgForOf, AsyncPipe, JsonPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import {stripHtml} from '../../../utils/html-utils'

@Component({
    selector: 'app-sync-popover',
    templateUrl: './sync-popover.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./sync-popover.component.sass'],
    imports: [
        AboutAppComponent,
        FeatureConfigComponent,
        ThemeConfigComponent,
        LanguageSwitcherComponent,
        NgIf,
        NgForOf,
        IonicModule,
        AsyncPipe,
        JsonPipe,
        TranslatePipe,
    ],
})
export class SyncPopoverComponent extends BaseComponent implements OnInit {


  syncStatus$: CachedSubject<SyncStatus> = this.syncStatusService.syncStatus$

  authUser$: CachedSubject<User | null> = this.authService.authUser$

  aboutAppExpanded = false

  private static readonly clicksToRevealFeatureConfig = 5

  private aboutAppClickCount = 0

  showFeatureConfig = false

  constructor(
    public authService: AuthService,
    public syncStatusService: SyncStatusService,
    // public learnStatsService: LearnStatsService,
    public optionsService: OptionsService,
    private popoverController: PopoverController,
    private router: Router,
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

  logOut() {
    this.authService.logout()
  }

  openOptions() {
    this.optionsService.openOptions()
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

  describePendingSyncItem(patch: Record<string, any>, collection: string): string {
    const title = patch?.['title'] ?? patch?.['name'] ?? patch?.['question']
    const plainTitle = stripHtml(title)?.trim()
    return plainTitle ? `${collection}: "${plainTitle}"` : collection
  }
}
