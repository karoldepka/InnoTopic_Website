import {ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { NgFor, NgIf } from '@angular/common';
import { TimePassingComponent } from '../../../libs/AppFedShared/time/time-passing/time-passing.component';

@Component({
    selector: 'app-mindfulness',
    templateUrl: './mindfulness.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./mindfulness.page.sass'],
    imports: [
        IonicModule,
        NgFor,
        NgIf,
        TimePassingComponent,
    ],
})
export class MindfulnessPage extends BaseComponent implements OnInit, OnDestroy {

  readonly timerPresetsMinutes = [1, 3, 5, 10, 15]

  selectedDurationSeconds = 5 * 60

  remainingSeconds = this.selectedDurationSeconds

  isTimerRunning = false

  private timerEndsAtMs?: number

  private timerIntervalHandle?: ReturnType<typeof setInterval>

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.clearTimerInterval()
  }

  get timerMinutesText() {
    return String(Math.floor(this.remainingSeconds / 60)).padStart(2, '0')
  }

  get timerSecondsText() {
    return String(this.remainingSeconds % 60).padStart(2, '0')
  }

  get timerProgressPercent() {
    const elapsedSeconds = this.selectedDurationSeconds - this.remainingSeconds
    return Math.max(0, Math.min(100, elapsedSeconds / this.selectedDurationSeconds * 100))
  }

  get timerStatusText() {
    if (this.remainingSeconds <= 0) {
      return 'Complete'
    }
    if (this.isTimerRunning) {
      return 'In progress'
    }
    if (this.remainingSeconds < this.selectedDurationSeconds) {
      return 'Paused'
    }
    return 'Ready'
  }

  selectTimerDuration(minutes: number) {
    this.selectedDurationSeconds = minutes * 60
    this.resetTimer()
  }

  startTimer() {
    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.selectedDurationSeconds
    }
    this.timerEndsAtMs = Date.now() + this.remainingSeconds * 1000
    this.isTimerRunning = true
    this.clearTimerInterval()
    this.timerIntervalHandle = setInterval(() => this.updateTimer(), 250)
    this.updateTimer()
  }

  pauseTimer() {
    this.updateTimer()
    this.isTimerRunning = false
    this.clearTimerInterval()
  }

  resetTimer() {
    this.isTimerRunning = false
    this.clearTimerInterval()
    this.timerEndsAtMs = undefined
    this.remainingSeconds = this.selectedDurationSeconds
  }

  private updateTimer() {
    if (!this.timerEndsAtMs) {
      return
    }

    this.remainingSeconds = Math.max(0, Math.ceil((this.timerEndsAtMs - Date.now()) / 1000))

    if (this.remainingSeconds <= 0) {
      this.isTimerRunning = false
      this.clearTimerInterval()
    }

    this.changeDetectorRef.detectChanges()
  }

  private clearTimerInterval() {
    if (this.timerIntervalHandle) {
      clearInterval(this.timerIntervalHandle)
      this.timerIntervalHandle = undefined
    }
  }

}
