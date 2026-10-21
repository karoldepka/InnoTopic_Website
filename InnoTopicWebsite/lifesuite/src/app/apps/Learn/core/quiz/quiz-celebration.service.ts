import {Injectable} from '@angular/core'
import {ToastController} from '@ionic/angular'

const congratulations = ['Correct!', 'Nailed it!', 'Well done!', 'Spot on!', 'Brilliant!']

/** Short toast + synthesized fanfare for a correctly answered ABCD question. */
@Injectable({providedIn: 'root'})
export class QuizCelebrationService {

  constructor(private toastController: ToastController) {}

  celebrateCorrectAnswer(): void {
    this.playFanfare()
    void this.toastController.create({
      message: congratulations[Math.floor(Math.random() * congratulations.length)],
      icon: 'sparkles',
      duration: 1200,
      position: 'top',
    }).then(toast => toast.present())
  }

  /** Brassy "ta-ta-ta-taaa" (G4 C5 E5, then a held C major chord), synthesized via the Web
   * Audio API so no audio asset needs to be shipped. */
  private playFanfare(): void {
    try {
      const AudioContextCtor = window.AudioContext ?? (window as any).webkitAudioContext
      const audioContext: AudioContext = new AudioContextCtor()
      const start = audioContext.currentTime + 0.02
      const master = audioContext.createGain()
      master.gain.value = 0.18
      master.connect(audioContext.destination)

      const notes: Array<[frequencies: number[], offset: number, duration: number]> = [
        [[392.00], 0, 0.11],
        [[523.25], 0.13, 0.11],
        [[659.25], 0.26, 0.11],
        [[523.25, 659.25, 783.99, 1046.50], 0.4, 0.75],
      ]
      for (const [frequencies, offset, duration] of notes) {
        for (const frequency of frequencies) {
          this.playBrassNote(audioContext, master, frequency, start + offset, duration)
        }
      }
      setTimeout(() => audioContext.close(), 1500)
    } catch (error) {
      console.error('QuizCelebrationService.playFanfare failed', error)
    }
  }

  private playBrassNote(audioContext: AudioContext, destination: AudioNode, frequency: number, at: number, duration: number): void {
    const oscillator = audioContext.createOscillator()
    const filter = audioContext.createBiquadFilter()
    const gain = audioContext.createGain()
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, at)
    // A brief filter "blat" on the attack is what makes a sawtooth read as brass.
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(frequency * 2, at)
    filter.frequency.exponentialRampToValueAtTime(frequency * 6, at + 0.04)
    filter.frequency.exponentialRampToValueAtTime(frequency * 3, at + duration)
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(0.5, at + 0.02)
    gain.gain.setValueAtTime(0.4, at + duration * 0.7)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(destination)
    oscillator.start(at)
    oscillator.stop(at + duration + 0.05)
  }
}
