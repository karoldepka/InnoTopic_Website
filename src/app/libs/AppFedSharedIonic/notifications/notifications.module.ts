import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotificationsCapacitorModule} from "../notifications-capacitor/notifications-capacitor.module";
import {NotificationsBrowserModule} from "../notifications-browser/notifications-browser.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NotificationsCapacitorModule,
    NotificationsBrowserModule,
  ]
})
export class NotificationsModule { }
