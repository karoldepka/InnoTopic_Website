import {Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core'
import {IonicModule} from '@ionic/angular'
import {NgIf, NgFor} from '@angular/common'
import {AudioVisualizerComponent} from '../audio-visualizer/audio-visualizer.component'
import {readVoiceMemos, readVoiceMemosForField, VoiceAttachableItem, VoiceMemoRecord, VoiceMemoRef, VoiceMemoService} from '../voice-memo.service'
import {FeatureService} from '../../feature.service'

declare const MediaRecorder: any

/** Unified recording + playback control for one field's voice memos - supersedes the old
 * `MicComponent`/`PlayButtonComponent` pair (one recording per whole item) with a per-field list,
 * backed by `VoiceMemoService`. Drop this next to any persisted text field (TinyMCE or a plain
 * textarea/input) that should support voice memos and live transcription. The memo list itself is
 * read straight off `item$` (its `voiceMemos` array, see `VoiceMemoRecord`) rather than a separate
 * query - already reactive and offline-safe for free, since it rides the same patch/sync mechanism
 * every other field on the item already uses. */
@Component({
    selector: 'app-voice-memo-field',
    templateUrl: './voice-memo-field.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./voice-memo-field.component.sass'],
    imports: [IonicModule, NgIf, NgFor, AudioVisualizerComponent],
})
export class VoiceMemoFieldComponent implements OnInit {

  /** Item these memos are attached to. Left unset only on Learn's quick-add bar, which has no
   * "current item" yet - see `createItemIfMissing` below. */
  @Input() item$?: VoiceAttachableItem

  /** Required alongside item$ when it has no odmService.className to infer a collection from
   * (OrYoL's OryItem$ tree nodes) - see VoiceAttachableItem's doc comment. */
  @Input() collection?: string

  /** Identifies which field on the item these memos belong to (a Journal text/numeric descriptor
   * id, a Learn side id, OrYoL's 'title', etc.) - lets one item have independent memo lists per
   * field instead of a single item-wide recording. */
  @Input() fieldId!: string

  /** Only for the one field on each surface the old single-recording-per-item mic used to write
   * to (Journal's 'general' field, OrYoL's per-node popover note) - see
   * `VoiceMemoService.getLegacyMemoRef`'s doc comment for why this must not be set anywhere else. */
  @Input() includeLegacy = false

  /** Quick-add's "no current item yet" case (generalizes MicComponent's original hardcoded
   * "create a new LearnItem" behavior). Called lazily right when recording stops, so a blank item
   * isn't created just because the user tapped the mic and then changed their mind. Left unset
   * everywhere else, which already has a real item$ to record onto. */
  @Input() createItemIfMissing?: () => VoiceAttachableItem

  /** Emits the live-transcribed text (via the browser's Web Speech API) once recognition ends,
   * shortly after the recording stops. Only fires when the browser supports SpeechRecognition
   * (Chrome/Edge; not Firefox/Safari) and speech was actually recognized - callers should treat
   * this as a best-effort addition, not something every recording is guaranteed to produce. The
   * caller decides how to splice the text into its own field (rich text vs. a plain textarea). */
  @Output() transcriptReady = new EventEmitter<string>()

  isRecording = false
  playingBlobId?: string
  currentTimeSec = 0
  durationSec = 0

  private mediaRecorder: any = null
  private audioChunks: any[] = []
  private speechRecognition: any = null
  private transcriptSoFar = ''
  private audioEl?: HTMLAudioElement
  private objectUrl?: string
  private recordingStartedAtMs?: number

  /** Resolved once at init (see ngOnInit) when `includeLegacy` is set - `undefined` until that
   * check resolves, and stays `undefined` forever if there's nothing to fall back to. */
  private legacyMemoRef?: VoiceMemoRef

  /* TODO: move to service, to ensure reference is not lost on component being re-created (e.g. on mobile) */
  stream: MediaStream | undefined

  constructor(
    private voiceMemoService: VoiceMemoService,
    private featureService: FeatureService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  get recordingEnabled(): boolean {
    return this.featureService.voiceMemoRecordingEnabled
  }

  get playbackEnabled(): boolean {
    return this.featureService.voiceMemoPlaybackEnabled
  }

  /** Read live off `item$` on every check (cheap - a small array filter) rather than cached
   * component state, so a memo just attached (or deleted) by this same component instance shows
   * up immediately without a manual "optimistic update" step. */
  get memos(): VoiceMemoRef[] {
    const real = readVoiceMemosForField(this.item$, this.fieldId)
    return (this.legacyMemoRef && real.length === 0) ? [this.legacyMemoRef, ...real] : real
  }

  private get resolvedCollection(): string | undefined {
    return this.voiceMemoService.resolveCollection(this.item$, this.collection)
  }

  ngOnInit() {
    if (!this.includeLegacy) {
      return
    }
    const collection = this.resolvedCollection
    const itemId = this.item$?.id
    if (!collection || !itemId) {
      return
    }
    this.voiceMemoService.getLegacyMemoRef(collection, itemId).then(ref => {
      this.legacyMemoRef = ref
      this.changeDetectorRef.markForCheck()
    })
  }

  onMicClick(event?: any) {
    if (event) {
      event.preventDefault() // prevent mouse click emulation from touchstart event because we have on-click as well
    }
    if (this.isRecording) {
      this.stopRecordingIfNeeded()
    } else {
      this.startRecording()
    }
  }

  public stopRecordingIfNeeded() {
    if (this.isRecording) {
      this.mediaRecorder.stop()
      this.isRecording = false
      try {
        this.speechRecognition?.stop()
      } catch (e) {
        console.log('speechRecognition.stop() failed', e)
      }
      this.changeDetectorRef.markForCheck()
    }
  }

  private startRecording() {
    if (this.stream) {
      this.recordUsingStream(this.stream)
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true}})
        .then(stream => {
          this.stream = stream
          this.recordUsingStream(stream)
        })
        .catch(err => {
          window.alert('The following getUserMedia error occurred: ' + err)
        })
    } else {
      window.alert('getUserMedia not supported on your browser!')
    }
  }

  private recordUsingStream(stream: MediaStream) {
    try {
      this.mediaRecorder = new MediaRecorder(stream)
      this.mediaRecorder.start()
    } catch (e) {
      window.alert('Could not start recording: ' + e)
      this.changeDetectorRef.markForCheck()
      return
    }
    this.isRecording = true
    this.recordingStartedAtMs = Date.now()
    this.audioChunks = []
    this.mediaRecorder.ondataavailable = (e: any) => {
      this.audioChunks.push(e.data)
    }
    this.mediaRecorder.onstop = () => {
      this.onRecordStopped()
    }
    this.startSpeechRecognitionIfSupported()
    this.changeDetectorRef.markForCheck()
  }

  /** Live transcription running in parallel with the MediaRecorder blob capture - not derived
   * from the recorded blob afterwards, so it only covers speech recognized while actively
   * recording. Silently does nothing on browsers without SpeechRecognition support (Firefox,
   * older Safari) - transcription is a bonus on top of the recording, never a requirement for it. */
  private startSpeechRecognitionIfSupported() {
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
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
      if (transcript) {
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
    const blob = new Blob(this.audioChunks, {type: 'audio/ogg; codecs=opus'})
    this.audioChunks = []
    const durationMs = this.recordingStartedAtMs ? (Date.now() - this.recordingStartedAtMs) : 0
    this.recordingStartedAtMs = undefined

    if (!this.item$ && this.createItemIfMissing) {
      this.item$ = this.createItemIfMissing()
    }
    const item = this.item$
    const collection = this.voiceMemoService.resolveCollection(item, this.collection)
    const itemId = item?.id
    if (!item || !collection || !itemId) {
      return
    }
    item.patchThrottled({hasAudio: true})
    this.voiceMemoService.attachMemo(collection, itemId, this.fieldId, blob).then(blobId => {
      const newRecord: VoiceMemoRecord = {fieldId: this.fieldId, blobId, durationMs, whenCreated: new Date().toISOString()}
      item.patchThrottled({voiceMemos: [...readVoiceMemos(item), newRecord]})
      this.changeDetectorRef.markForCheck()
    })
  }

  stopRecordingIfNeededAndReleaseMic() {
    this.stopRecordingIfNeeded()
    setTimeout(() => {
      this.stream?.getTracks().forEach(track => track.stop())
      this.stream = undefined
    }, 300 /* just some instinctual defensive voodoo programming ;) but harmless */)
  }

  // ---- Playback (only one memo at a time; starting another stops whatever was playing) ----

  playOrStopMemo(memoRef: VoiceMemoRef) {
    if (this.playingBlobId === memoRef.blobId) {
      this.stopPlaying()
      return
    }
    this.stopPlaying()
    const collection = this.resolvedCollection
    const itemId = this.item$?.id
    if (!collection || !itemId) {
      return
    }
    this.playingBlobId = memoRef.blobId
    this.voiceMemoService.resolveMemoBlob(collection, itemId, memoRef).then(blob => {
      if (this.playingBlobId !== memoRef.blobId || !blob) {
        this.playingBlobId = undefined
        this.changeDetectorRef.markForCheck()
        return
      }
      this.objectUrl = URL.createObjectURL(blob)
      const audio = new Audio(this.objectUrl)
      this.audioEl = audio
      audio.addEventListener('loadedmetadata', () => {
        this.durationSec = isFinite(audio.duration) ? audio.duration : 0
        this.changeDetectorRef.markForCheck()
      })
      audio.addEventListener('timeupdate', () => {
        this.currentTimeSec = audio.currentTime
        this.changeDetectorRef.markForCheck()
      })
      audio.addEventListener('ended', () => this.stopPlaying())
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
    if (this.audioEl) {
      this.audioEl.currentTime = newTimeSec
    }
    this.currentTimeSec = newTimeSec
  }

  formatTime(totalSeconds: number): string {
    if (!isFinite(totalSeconds) || totalSeconds < 0) {
      return '0:00'
    }
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /** "1 min ago"-style label for a memo's `whenCreated` - deliberately coarse (rounds to the
   * nearest unit, no seconds granularity) since precision doesn't matter here. */
  formatRelativeTime(whenCreated: string): string {
    const elapsedMs = Date.now() - new Date(whenCreated).getTime()
    const minutes = Math.round(elapsedMs / 60_000)
    if (minutes < 1) {
      return 'just now'
    }
    if (minutes < 60) {
      return `${minutes} min ago`
    }
    const hours = Math.round(minutes / 60)
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    }
    const days = Math.round(hours / 24)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  stopPlaying() {
    this.playingBlobId = undefined
    this.audioEl?.pause()
    this.audioEl = undefined
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl)
      this.objectUrl = undefined
    }
    this.currentTimeSec = 0
    this.durationSec = 0
    this.changeDetectorRef.markForCheck()
  }

  deleteMemo(memoRef: VoiceMemoRef, event?: Event) {
    event?.stopPropagation()
    if (memoRef.legacy) {
      return // predates per-memo storage; nothing on the item itself to remove
    }
    if (this.playingBlobId === memoRef.blobId) {
      this.stopPlaying()
    }
    const item = this.item$
    const collection = this.resolvedCollection
    const itemId = item?.id
    if (!item || !collection || !itemId) {
      return
    }
    item.patchThrottled({voiceMemos: readVoiceMemos(item).filter(m => m.blobId !== memoRef.blobId)})
    this.voiceMemoService.deleteMemo(collection, itemId, memoRef)
  }
}
