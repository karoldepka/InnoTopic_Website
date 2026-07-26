import {ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimePassingComponent } from '../../../libs/AppFedShared/time/time-passing/time-passing.component';
import { MindfulnessTrackingService } from './mindfulness-tracking.service'
import { MindfulnessSettingsService } from './mindfulness-settings.service'
import { mindfulnessMantras } from './mindfulness-mantras.data'

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
    { label: '5s',  durationSeconds: 5 },
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

  /** GH issue #27: expandable "show more" with today/this-week totals + goals. Collapsed by
   * default so the page stays focused on the timer itself. */
  showMore = false

  todayMs = 0

  weekMs = 0

  goalMinutesPerDay: number | null = null

  goalMinutesPerWeek: number | null = null

  private isLoadingTotals = false

  currentMantra = this.pickRandomMantra()

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private mindfulnessTrackingService: MindfulnessTrackingService,
    private mindfulnessSettingsService: MindfulnessSettingsService,
    injector: Injector,
  ) {
    super(injector)
  }

  async ngOnInit() {
    const settings = await this.mindfulnessSettingsService.getSettings()
    if (settings.lastDurationSeconds && settings.lastDurationSeconds > 0 && !this.isTimerRunning) {
      this.selectedDurationSeconds = settings.lastDurationSeconds
      this.remainingSeconds = this.selectedDurationSeconds
      this.changeDetectorRef.detectChanges()
    }
  }

  ngOnDestroy() {
    this.clearTimerInterval()
    // Avoid leaving an open (never-ended) time-tracking period if the user navigates away while
    // the timer is still running, rather than explicitly pausing/completing it first.
    this.mindfulnessTrackingService.stopTrackingIfNeeded()
  }

  toggleShowMore() {
    this.showMore = !this.showMore
    if (this.showMore) {
      this.refreshTotalsAndGoals()
    }
  }

  private async refreshTotalsAndGoals() {
    if (this.isLoadingTotals) {
      return
    }
    this.isLoadingTotals = true
    try {
      const [totals, goals] = await Promise.all([
        this.mindfulnessTrackingService.getTodayAndWeekTotals(),
        this.mindfulnessSettingsService.getSettings(),
      ])
      this.todayMs = totals.todayMs
      this.weekMs = totals.weekMs
      this.goalMinutesPerDay = goals.goalMinutesPerDay
      this.goalMinutesPerWeek = goals.goalMinutesPerWeek
    } catch (error) {
      console.error('MindfulnessPage.refreshTotalsAndGoals failed', error)
    } finally {
      this.isLoadingTotals = false
      this.changeDetectorRef.detectChanges()
    }
  }

  saveGoals() {
    this.mindfulnessSettingsService.saveGoals({
      goalMinutesPerDay: this.goalMinutesPerDay,
      goalMinutesPerWeek: this.goalMinutesPerWeek,
    })
  }

  /** Picks a different mantra than the one currently shown (when there's more than one to choose
   * from) so clicking "shuffle" always visibly changes something. */
  shuffleMantra() {
    let next = this.pickRandomMantra()
    while (next === this.currentMantra && mindfulnessMantras.length > 1) {
      next = this.pickRandomMantra()
    }
    this.currentMantra = next
  }

  private pickRandomMantra(): string {
    return mindfulnessMantras[Math.floor(Math.random() * mindfulnessMantras.length)]
  }

  /** e.g. 90 minutes -> "1h 30m", 45 minutes -> "45m". */
  /** Split so the template can render the seconds in a smaller font (GH #54) - deriving both
   * from the same floored totalSeconds keeps them consistent (independent rounding of minutes
   * and seconds could otherwise disagree, e.g. 90s rounding to "2m" but seconds showing "30s"). */
  formatDurationParts(ms: number): { main: string, seconds: string } {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const main = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    return { main, seconds: `${String(seconds).padStart(2, '0')}s` }
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
    this.mindfulnessSettingsService.saveLastDurationSeconds(durationSeconds)
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
    // GH issue #27: time-track the session on the reserved `_mindfulness` item, in parallel with
    // whatever else OrYoL might already be tracking.
    this.mindfulnessTrackingService.startTracking()
  }

  pauseTimer() {
    this.updateTimer()
    this.isTimerRunning = false
    this.clearTimerInterval()
    this.mindfulnessTrackingService.stopTrackingIfNeeded()
  }

  resetTimer() {
    this.isTimerRunning = false
    this.clearTimerInterval()
    this.timerEndsAtMs = undefined
    this.remainingSeconds = this.selectedDurationSeconds
    this.mindfulnessTrackingService.stopTrackingIfNeeded()
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
      this.mindfulnessTrackingService.stopTrackingIfNeeded()
      if (this.showMore) {
        this.refreshTotalsAndGoals()
      }
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
