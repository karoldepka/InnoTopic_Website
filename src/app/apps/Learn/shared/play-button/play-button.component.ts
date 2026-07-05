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
  private source ? : AudioBufferSourceNode

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
        return
      }
      // todo maybe reuse ctx / source
      const audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)()
      const source = audioCtx.createBufferSource()
      this.source = source

      audioCtx.decodeAudioData(audioBytes,
        (buffer: AudioBuffer) => {
          if ( ! this.isPlaying ) {
            return
          }
          source.buffer = buffer;
          console.log(`source.buffer`, source.buffer)

          source.connect(audioCtx.destination);
          // source.loop = true;
          source.onended = () => this.onSoundEnded()
          source.start(0)
        },

        (e: DOMException) => {
          window.alert("Error with decoding audio data: " + (e as any).err + ' ' + e);
        }
      );
    })
  }

  private onSoundEnded() {
    this.isPlaying = false
    this.changeDetectorRef.detectChanges()
  }

  stopPlaying() {
    this.isPlaying = false
    this.source ?. stop()
    this.changeDetectorRef.detectChanges()
  }
}
