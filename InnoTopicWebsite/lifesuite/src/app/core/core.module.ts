import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OdmBackendModule} from "../libs/AppFedShared/odm/odm-backend.module";
import {TimerNotificationsService} from "./timer-notifications.service";
import {TimersService} from "./timers.service";
import {NotificationsService} from "../libs/AppFedSharedIonic/notifications/notifications.service";
import {NotificationsModule} from "../libs/AppFedSharedIonic/notifications/notifications.module";
import {TimersPageModule} from "../timers/timers.module";
import {OdmFullSyncService} from '../libs/AppFedShared/odm/odm-full-sync.service'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OdmBackendModule,
    NotificationsModule,
    TimersPageModule /* for TimerEndedService; not circular dep? */,
  ],
  providers: [
    NotificationsService,
    TimerNotificationsService,
    TimersService,
  ]
})
export class CoreModule {
  constructor(
    _odmFullSyncService: OdmFullSyncService,
  ) {
  }
}
