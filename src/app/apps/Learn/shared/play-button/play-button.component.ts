import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {LearnItem, LearnItemId} from '../../models/LearnItem'
import {LearnItem$} from '../../models/LearnItem$'
import {VoiceAttachableItem, VoiceAttachmentService} from '../../../../libs/AppFedShared/audio/voice-attachment.service'
import { NgIf } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-play-button',
    templateUrl: './play-button.component.html',
    styleUrls: ['./play-button.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush /* keep in mind when implementing more features */,
    imports: [NgIf, IonicModule],
})
export class PlayButtonComponent implements OnInit {

  /** Preferred over item/itemId below - lets this generalize to any collection (Quiz/Journal/
   * OrYoL reuse the same LearnItem-only item/itemId inputs otherwise, which would look up the
   * recording under the wrong collection prefix). */
  @Input()
  item$ ? : VoiceAttachableItem

  /** Required alongside item$ when it has no odmService.className to infer a collection from
   * (OrYoL's OryItem$ tree nodes) - see VoiceAttachableItem's doc comment. */
  @Input()
  collection ? : string

  @Input()
  item ? : any // LearnItem | null

  @Input()
  private itemId ? : LearnItemId

  isPlaying = false
  currentTimeSec = 0
  durationSec = 0

  /** A plain <audio> element rather than Web Audio API's AudioBufferSourceNode (the previous
   * implementation) - AudioBufferSourceNode has no currentTime/duration/seek support at all, so
   * there'd be no way to drive the timeline scrubber below without reimplementing all of that by
   * hand. */
  private audioEl ? : HTMLAudioElement
  private objectUrl ? : string

  constructor(
    protected changeDetectorRef: ChangeDetectorRef,
    protected voiceAttachmentService: VoiceAttachmentService,
  ) { }

  ngOnInit() {}

  private get recordingTarget(): {collection: string, itemId: string} | undefined {
    if ( this.item$ ) {
      return {collection: this.collection ?? this.item$.odmService!.className, itemId: this.item$.id as string}
    }
    const id = this.itemId || this.item?.id
    return id ? {collection: 'LearnItem', itemId: id} : undefined
  }

  playOrStopAudio() {
    if ( this.isPlaying ) {
      this.stopPlaying()
      return
      // (will be pause ; and long-press to stop)
    }
    const target = this.recordingTarget
    if ( ! target ) {
      return
    }
    this.isPlaying = true
    this.voiceAttachmentService.getRecording(target.collection, target.itemId).then(audioBytes => {
      if ( ! this.isPlaying || ! audioBytes ) {
        this.isPlaying = false
        this.changeDetectorRef.detectChanges()
        return
      }
      const blob = new Blob([audioBytes], {type: 'audio/ogg; codecs=opus'})
      this.objectUrl = URL.createObjectURL(blob)
      const audio = new Audio(this.objectUrl)
      this.audioEl = audio

      audio.addEventListener('loadedmetadata', () => {
        this.durationSec = isFinite(audio.duration) ? audio.duration : 0
        this.changeDetectorRef.detectChanges()
      })
      audio.addEventListener('timeupdate', () => {
        this.currentTimeSec = audio.currentTime
        this.changeDetectorRef.detectChanges()
      })
      audio.addEventListener('ended', () => this.onSoundEnded())
      audio.play().catch((e: any) => {
        window.alert('Error playing audio: ' + e)
        this.stopPlaying()
      })
    })
  }

  /** Bound to the timeline ion-range's (ionChange) - seeks playback to wherever the user dropped
   * the thumb. */
  onSeek(event: any) {
    const newTimeSec = Number(event?.detail?.value ?? 0)
    if ( this.audioEl ) {
      this.audioEl.currentTime = newTimeSec
    }
    this.currentTimeSec = newTimeSec
  }

  formatTime(totalSeconds: number): string {
    if ( ! isFinite(totalSeconds) || totalSeconds < 0 ) {
      return '0:00'
    }
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  private onSoundEnded() {
    this.stopPlaying()
  }

  stopPlaying() {
    this.isPlaying = false
    this.audioEl ?. pause()
    this.audioEl = undefined
    if ( this.objectUrl ) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = undefined
    }
    this.currentTimeSec = 0
    this.durationSec = 0
    this.changeDetectorRef.detectChanges()
  }
}
