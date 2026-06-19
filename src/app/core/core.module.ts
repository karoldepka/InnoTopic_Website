import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OdmBackendModule} from "../libs/AppFedShared/odm/odm-backend.module";
import {TimerNotificationsService} from "./timer-notifications.service";
import {TimersService} from "./timers.service";
import {NotificationsService} from "../libs/AppFedSharedIonic/notifications/notifications.service";
import {AngularFireAuthModule} from "@angular/fire/compat/auth";
import {NotificationsModule} from "../libs/AppFedSharedIonic/notifications/notifications.module";
import {TimersPageModule} from "../timers/timers.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OdmBackendModule,
    AngularFireAuthModule,
    NotificationsModule,
    TimersPageModule /* for TimerEndedService; not circular dep? */,
  ],
  providers: [
    NotificationsService,
    TimerNotificationsService,
    TimersService,
  ]
})
export class CoreModule { }
