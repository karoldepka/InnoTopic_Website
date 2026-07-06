import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {LearnItemItemsService} from '../../core/learn-item-items.service'
import {OdmBackend} from '../../../../libs/AppFedShared/odm/OdmBackend'
import {VoiceAttachableItem, VoiceAttachmentService} from '../../../../libs/AppFedShared/audio/voice-attachment.service'
import {LearnItem} from '../../models/LearnItem'
import { IonicModule } from '@ionic/angular';
import { NgIf } from '@angular/common';
import { AudioVisualizerComponent } from '../../../../libs/AppFedShared/audio/audio-visualizer/audio-visualizer.component';

declare const MediaRecorder: any;

@Component({
    selector: 'app-mic',
    templateUrl: './mic.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./mic.component.sass'],
    imports: [
        IonicModule,
        NgIf,
        AudioVisualizerComponent,
    ],
})
export class MicComponent implements OnInit {

  /** Attach the recording to this item instead of the default "create a brand new LearnItem"
   * behavior below - set by any editing surface (Learn item details, Quiz, Journal, OrYoL tree
   * node) that already has a current item to record onto. Left unset only on Learn's quick-add
   * bar, which has no "current item" for a recording to attach to. */
  @Input() item$?: VoiceAttachableItem

  /** Required alongside item$ when it has no odmService.className to infer a collection from
   * (OrYoL's OryItem$ tree nodes) - see VoiceAttachableItem's doc comment. */
  @Input() collection?: string

  /** Emits the live-transcribed text (via the browser's Web Speech API) once recognition ends,
   * shortly after the recording stops. Only fires when the browser supports SpeechRecognition
   * (Chrome/Edge; not Firefox/Safari) and speech was actually recognized - callers should treat
   * this as a best-effort addition, not something every recording is guaranteed to produce. */
  @Output() transcriptReady = new EventEmitter<string>()

  isRecording = false
  private mediaRecorder: any = null
  private audioChunks: any[] = []
  private speechRecognition: any = null
  private transcriptSoFar = ''

  /* TODO: move to service, to ensure reference is not lost on component being re-created (e.g. on mobile) */
  stream: MediaStream | undefined

  constructor(
    public learnDoService: LearnItemItemsService,
    public voiceAttachmentService: VoiceAttachmentService,
  ) { }

  ngOnInit() {}

  onMicClick(event ? : any) {
    if (event) {
      event.preventDefault() // prevent mouse click emulation from touchstart event because we have on-click as well
    }
    // TODO: move to AudioRecordService:
    if ( this.isRecording ) {
      this.stopRecordingIfNeeded()
    } else {
      this.startRecording()
    }
  }

  public stopRecordingIfNeeded() {
    if ( this.isRecording ) {
      this.mediaRecorder.stop()
      this.isRecording = false
      try {
        this.speechRecognition?.stop()
      } catch (e) {
        console.log('speechRecognition.stop() failed', e)
      }
    }
  }

  private startRecording() {
    if ( this.stream ) {
      this.recordUsingStream(this.stream)
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        // http://mdn.github.io/web-dictaphone/
        // https://github.com/mdn/web-dictaphone/
        console.log('getUserMedia supported.');
        navigator.mediaDevices.getUserMedia(
          {
            audio: true, // constraints - only audio needed for this app
          })
          .then((stream) => {
            this.stream = stream
            this.recordUsingStream(stream)
          })
          .catch(function (err) {
              window.alert('The following getUserMedia error occurred: ' + err);
              /* for iOS: https://www.gmass.co/blog/record-audio-mobile-web-page-ios-android/ -- AudioContext: audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                https://developers.google.com/web/fundamentals/media/recording-audio
               */
            },
          );
      } else {
        window.alert('getUserMedia not supported on your browser!');
      }
    }
  }

  private recordUsingStream(stream: MediaStream) {
    this.isRecording = true
    this.mediaRecorder = new MediaRecorder(stream); // not sure if this is needed again after stopping previous
    this.mediaRecorder.start();
    console.log(`MediaRecorder started: this.mediaRecorder.state`, this.mediaRecorder.state);

    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (e: any) => {
      this.audioChunks.push(e.data);
    }
    this.mediaRecorder.onstop = (e: any) => {
      this.onRecordStopped()
    }
    this.startSpeechRecognitionIfSupported()
  }

  /** Live transcription running in parallel with the MediaRecorder blob capture - not derived
   * from the recorded blob afterwards, so it only covers speech recognized while actively
   * recording. Silently does nothing on browsers without SpeechRecognition support (Firefox,
   * older Safari) - transcription is a bonus on top of the recording, never a requirement for it. */
  private startSpeechRecognitionIfSupported() {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if ( ! SpeechRecognitionCtor ) {
      return
    }
    this.transcriptSoFar = ''
    this.speechRecognition = new SpeechRecognitionCtor()
    this.speechRecognition.continuous = true
    this.speechRecognition.interimResults = false
    this.speechRecognition.lang = document.documentElement.lang || undefined
    this.speechRecognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          this.transcriptSoFar += event.results[i][0].transcript + ' '
        }
      }
    }
    this.speechRecognition.onerror = (event: any) => {
      console.log('speechRecognition error (non-fatal, recording is unaffected)', event.error)
    }
    this.speechRecognition.onend = () => {
      const transcript = this.transcriptSoFar.trim()
      if ( transcript ) {
        this.transcriptReady.emit(transcript)
      }
      this.speechRecognition = null
    }
    try {
      this.speechRecognition.start()
    } catch (e) {
      console.log('speechRecognition.start() failed (non-fatal, recording is unaffected)', e)
      this.speechRecognition = null
    }
  }

  private onRecordStopped() {
    console.log("stopping recording");
    const blob = new Blob(this.audioChunks, { 'type' : 'audio/ogg; codecs=opus' });
    this.audioChunks = [];
    const audioURL = window.URL.createObjectURL(blob);
    console.log(`audioURL`, audioURL)

    if ( this.item$ ) {
      this.item$.patchThrottled({hasAudio: true})
      this.voiceAttachmentService.attachRecording(this.collection ?? this.item$.odmService!.className, this.item$.id!, blob)
      return
    }

    console.log(`learnDoService`, this.learnDoService)
    const learnItemData = new LearnItem()
    learnItemData.hasAudio = true
    learnItemData.whenAdded = OdmBackend.nowTimestamp()
    const learnItem$ = this.learnDoService.newItem(undefined, learnItemData)
    learnItem$.saveNowToDb()
    this.voiceAttachmentService.attachRecording(this.learnDoService.className, learnItem$.id!, blob)
  }

  stopRecordingIfNeededAndReleaseMic() {
    this.stopRecordingIfNeeded()
    setTimeout(() => {
      // this.stream.stop() // https://developers.google.com/web/updates/2015/07/mediastream-deprecations?hl=en#stop-ended-and-active
      // https://stackoverflow.com/questions/35977831/removing-the-recording-icon-mediastreamrecorder-js-library
      // https://stackoverflow.com/questions/11642926/stop-close-webcam-which-is-opened-by-navigator-getusermedia
      this.stream ?. getTracks().forEach(function(track) {
        track.stop();
      });
      this.stream = undefined
    }, 300 /* just some instinctual defensive voodoo programming ;) but harmless */)
  }
}
