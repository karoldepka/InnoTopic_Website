import {Injectable, Injector} from '@angular/core';
import {LocalNotifications} from '@capacitor/local-notifications';
import {NotificationsCapacitorModule} from "./notifications-capacitor/notifications-capacitor.module";
import {NotificationHandle, NotificationInfo, PlatformNotificationsService} from "./notifications/PlatformNotificationsService";
import {SchedulerHandle, SchedulerService} from "../AppFedShared/scheduler/scheduler.service";
import {AudioService} from "../AppFedShared/audio/audio.service";

class CapacitorNotifHandle extends NotificationHandle {
  constructor(
    notificationInfo: NotificationInfo,
    public intId: number,
    public schedulerHandle: SchedulerHandle,
  ) {
    super(notificationInfo)
  }

  cancel() {
    this.schedulerHandle.unSchedule()
    LocalNotifications.cancel({notifications: [{id: this.intId}]})
  }
}

@Injectable({
  providedIn: NotificationsCapacitorModule,
})
export class CapacitorNotificationsService extends PlatformNotificationsService<CapacitorNotifHandle> {

  /* Note: zero is unused */
  lastIntId = 0

  schedulerService = this.injector.get(SchedulerService)
  audioService = this.injector.get(AudioService)

  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  public scheduleNotificationImpl(notifInfo: NotificationInfo): CapacitorNotifHandle {
    const newIntId = ++ this.lastIntId
    LocalNotifications.schedule({
      notifications: [{
        id: newIntId,
        title: notifInfo.title,
        body: '',
        /* allowWhileIdle preserves the old cordova plugin's wakeup:true intent - fire even
         * during Doze/idle rather than being deferred to the next maintenance window. */
        schedule: {at: notifInfo.when, allowWhileIdle: true},
      }],
    })
    let schedulerHandle = this.schedulerService.schedule(notifInfo.when, () => {
      this.audioService.playAudio('assets/audio/ali-a_intro.mp3')
    });
    return new CapacitorNotifHandle(notifInfo, newIntId, schedulerHandle)
  }
}
