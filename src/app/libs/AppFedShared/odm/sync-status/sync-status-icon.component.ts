import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {SyncStatusService} from '../sync-status.service'
import {PopoverController} from '@ionic/angular'
import {SyncPopoverComponent} from './sync-popover/sync-popover.component'
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
