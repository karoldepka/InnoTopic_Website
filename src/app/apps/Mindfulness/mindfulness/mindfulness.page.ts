import {ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
        FormsModule,
        TimePassingComponent,
    ],
})
export class MindfulnessPage extends BaseComponent implements OnInit, OnDestroy {

  readonly timerPresets: { label: string; durationSeconds: number }[] = [
    { label: '10s', durationSeconds: 10 },
    { label: '20s', durationSeconds: 20 },
    { label: '30s', durationSeconds: 30 },
    { label: '1m',  durationSeconds:  1 * 60 },
    { label: '2m',  durationSeconds:  2 * 60 },
    { label: '3m',  durationSeconds:  3 * 60 },
    { label: '5m',  durationSeconds:  5 * 60 },
    { label: '10m', durationSeconds: 10 * 60 },
    { label: '15m', durationSeconds: 15 * 60 },
    { label: '20m', durationSeconds: 20 * 60 },
    { label: '30m', durationSeconds: 30 * 60 },
  ]

  selectedDurationSeconds = 5 * 60

  remainingSeconds = this.selectedDurationSeconds

  isTimerRunning = false

  manualMinutes: number | null = null

  manualSeconds: number | null = null

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

  selectTimerDuration(durationSeconds: number) {
    this.selectedDurationSeconds = durationSeconds
    this.resetTimer()
  }

  applyManualDuration() {
    const minutes = Math.max(0, Math.floor(this.manualMinutes ?? 0))
    const seconds = Math.max(0, Math.min(59, Math.floor(this.manualSeconds ?? 0)))
    const durationSeconds = minutes * 60 + seconds
    if (durationSeconds <= 0) {
      return
    }
    this.selectTimerDuration(durationSeconds)
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
      this.playCompletionChime()
    }

    this.changeDetectorRef.detectChanges()
  }

  private clearTimerInterval() {
    if (this.timerIntervalHandle) {
      clearInterval(this.timerIntervalHandle)
      this.timerIntervalHandle = undefined
    }
  }

  /** Neither existing audio asset (a phone ring, an intro clip) fits a meditation timer ending,
   * so this synthesizes a soft bell-like tone via the Web Audio API instead of forcing a
   * mismatched sound effect. */
  private playCompletionChime() {
    try {
      const AudioContextCtor = window.AudioContext ?? (window as any).webkitAudioContext
      const audioContext: AudioContext = new AudioContextCtor()
      const now = audioContext.currentTime
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(660, now)
      gainNode.gain.setValueAtTime(0.0001, now)
      gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.5)
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.start(now)
      oscillator.stop(now + 2.5)
      oscillator.onended = () => audioContext.close()
    } catch (error) {
      console.error('playCompletionChime failed', error)
    }
  }

}
