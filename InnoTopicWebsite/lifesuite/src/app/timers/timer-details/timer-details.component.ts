import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TimerItem} from "../../core/TimerItem";
import { AlertController, ModalController, IonicModule } from "@ionic/angular";
import {TimersService} from "../../core/timers.service";
import { UntypedFormControl, ReactiveFormsModule } from "@angular/forms";
import {ignorePromise} from "../../libs/AppFedShared/utils/promiseUtils";
import { TimePickerComponent } from '../../libs/AppFedSharedIonic/time/time-picker/time-picker.component';
import { NgIf, DatePipe } from '@angular/common';

@Component({
    selector: 'app-timer-details',
    templateUrl: './timer-details.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./timer-details.component.scss'],
    imports: [
        IonicModule,
        ReactiveFormsModule,
        TimePickerComponent,
        NgIf,
        DatePipe,
    ],
})
export class TimerDetailsComponent implements OnInit {

  @Input()
  timer ! : TimerItem

  timerTitleControl = new UntypedFormControl('');

  get endTime() {
    return new Date(Date.now() + (this.timer.durationSeconds)! * 1000)
  }

  constructor(
      public alertController: AlertController,
      // public timersService: TimersService,
      private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.timerTitleControl.setValue(this.timer.title)
    this.timerTitleControl.valueChanges.subscribe(titleValue => {
      this.timer.patchThrottled({
        title: titleValue
      })
    })
  }

  onDurationSecondsChanged($event: number) {
    this.timer.patchThrottled({
      durationSeconds: $event
    })
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      header: 'Delete timer ' + this.timer.title + "?",
      // message: 'Delete <strong>text</strong>!!!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'DELETE',
          handler: () => {
            this.timer.deleteWithoutConfirmation()
            this.dismissModal()
          }
        }
      ]
    })
    await alert.present()
  }

  private dismissModal() {
    return ignorePromise(this.modalController.dismiss())
  }

  async askStopTimer() {
    const alert = await this.alertController.create({
      header: 'STOP timer ' + this.timer.title + "?",
      // message: 'Delete <strong>text</strong>!!!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'STOP',
          handler: () => {
            this.timer.stopTimer()
          }
        }
      ]
    })
    await alert.present()
  }

  onClickDismiss() {
    this.dismissModal()
  }

  askPauseTimer() {
    // FIXME
  }
}
