import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {SyncStatusService} from '../sync-status.service'
import {PopoverController} from '@ionic/angular'
import {SyncPopoverComponent} from './sync-popover/sync-popover.component'
import {combineLatest} from 'rxjs'
import {map} from 'rxjs/operators'
import {AuthService} from '../../../../auth/auth.service'
import { NgClass, AsyncPipe } from '@angular/common';
import {FullscreenService} from '../../fullscreen/fullscreen.service'
import {IonicModule} from '@ionic/angular'
import { addIcons } from 'ionicons'
import { expandOutline, contractOutline } from 'ionicons/icons'

@Component({
    selector: 'odm-sync-status-icon',
    templateUrl: './sync-status-icon.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./sync-status-icon.component.sass'],
    imports: [NgClass, AsyncPipe, IonicModule],
})
export class SyncStatusIconComponent implements OnInit {

  showShadow = true

  /** workaround for logo disappearing on page navigation */
  fillSuffix = (''+Math.random()).replace('.', '')

  fill1Id = 'fill1-' + this.fillSuffix

  get pendingUploadsCount$() { return this.syncStatus$.pipe(map(s => s.pendingUploadsCount))}

  get pendingDownloadsCount$() { return this.syncStatus$.pipe(map(s => s.pendingDownloadsCount))}

  get syncStatus$() { return this.syncStatusService.syncStatus$ }

  /** durablePendingSyncItems$ (survives reload, stays populated while offline/failed and
   * waiting to retry) is the more accurate "still needs to sync" signal; pendingUploadsCount
   * (in-memory-only, this session) still catches non-ODM saves (OrYoL, media uploads) that
   * aren't durably journaled. Badge shows whichever is non-zero, summed - a save actively in
   * flight can transiently count in both, which just means the badge briefly reads one higher
   * than strictly necessary rather than under-counting. */
  get totalPendingCount$() {
    return combineLatest([this.pendingUploadsCount$, this.syncStatusService.durablePendingSyncItems$]).pipe(
      map(([ephemeralCount, durableItems]) => (ephemeralCount ?? 0) + durableItems.length)
    )
  }

  /** Up-arrow visibility: something is queued to upload (whether actively retrying, waiting
   * offline, or just about to be sent) - static/non-moving. */
  get needsUpload$() {
    return this.totalPendingCount$.pipe(map(count => count > 0))
  }

  /** Up-arrow animation: an upload is actually in flight *right now* (as opposed to durably
   * queued but not currently being attempted, e.g. while offline) - bobs while true. */
  get isUploading$() {
    return this.pendingUploadsCount$.pipe(map(count => !!count))
  }

  get isDownloading$() {
    return this.pendingDownloadsCount$.pipe(map(count => !!count))
  }

  /** Checkmark visibility. Previously based on syncStatus$.isAllSynced, which only reflects the
   * ephemeral in-flight-promise tracking - it could read true (nothing currently in flight)
   * while needsUpload$ was also true (something durably queued but not actively retrying, e.g.
   * offline), showing the checkmark and the up-arrow on top of each other at once. */
  get isFullySynced$() {
    return combineLatest([this.needsUpload$, this.pendingDownloadsCount$]).pipe(
      map(([needsUpload, downloadsCount]) => !needsUpload && !downloadsCount)
    )
  }

  constructor(
    public syncStatusService: SyncStatusService,
    public popoverController: PopoverController,
    public fullscreenService: FullscreenService,
  ) {
    addIcons({ expandOutline, contractOutline })
  }

  ngOnInit() {}

  async onClick(event: any) {

    const popover = await this.popoverController.create({
      component: SyncPopoverComponent,
      event: event,
      translucent: true,
      mode: 'ios',
    });
    return await popover.present();
  }
}
