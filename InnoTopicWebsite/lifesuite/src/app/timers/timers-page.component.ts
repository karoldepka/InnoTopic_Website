import {Component, ChangeDetectionStrategy} from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import {TimerItem} from '../core/TimerItem';
import {TimersService} from '../core/timers.service';
import {TimerDetailsComponent} from "./timer-details/timer-details.component";
import {debugLog} from "../libs/AppFedShared/utils/log";
import { RouterLink } from '@angular/router';
import { SyncStatusIconComponent } from '../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { TimersListComponent } from './timers-list/timers-list.component';

@Component({
    selector: 'app-tab2',
    templateUrl: 'timers-page.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['timers-page.component.scss'],
    imports: [IonicModule, RouterLink, SyncStatusIconComponent, TimersListComponent]
})
export class TimersPageComponent {

  constructor(
    private modalController: ModalController,
    private timersService: TimersService,
  ) {
  }

  async onAddTimer() {
    debugLog('onAddTimer')
    let timerItem = new TimerItem(this.timersService, undefined, undefined, 5, 'new timer')
    // timerItem
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: TimerDetailsComponent,
        componentProps: {
          timer: timerItem,
        }
      });
    await modal.present()
  }
}
