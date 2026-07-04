import {Injectable, Injector} from '@angular/core';

import { Capacitor } from '@capacitor/core';
import {BrowserNotificationsService} from "../notifications-browser/browser-notifications.service";
import {CapacitorNotificationsService} from "../capacitor-notifications.service";
import {NotificationHandle, NotificationInfo, PlatformNotificationsService} from "./PlatformNotificationsService";

@Injectable()
export class NotificationsService {

  notificationsService: PlatformNotificationsService<any>

  constructor(
    public injector: Injector,
  ) {
    if ( Capacitor.isNativePlatform() ) {
      this.notificationsService = injector.get(CapacitorNotificationsService)
    } else {
      this.notificationsService = injector.get(BrowserNotificationsService)
    }
  }

  scheduleNotification(notifInfo: NotificationInfo): NotificationHandle {
    return this.notificationsService.scheduleNotificationImpl(notifInfo)
  }

}
