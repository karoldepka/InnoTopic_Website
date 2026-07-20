import {Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core'
import {AlertController, IonicModule, ToastController} from '@ionic/angular'
import {NgIf, NgFor} from '@angular/common'
import {AudioVisualizerComponent} from '../audio-visualizer/audio-visualizer.component'
import {ActiveMicHolder, readVoiceMemos, readVoiceMemosForField, VoiceAttachableItem, VoiceMemoRecord, VoiceMemoRef, VoiceMemoService} from '../voice-memo.service'
import {VoiceTranscriptionService} from '../voice-transcription.service'
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
export class VoiceMemoFieldComponent implements OnInit, OnDestroy, ActiveMicHolder {

  /** Item these memos are attached to. Left unset only on Learn's quick-add bar, which has no
   * "current item" yet - see `createItemIfMissing` below. */
  @Input() item$?: VoiceAttachableItem

  /** Required alongside item$ when it has no odmService.className to infer a collection from
   * (OrYoL's OryItem$ tree nodes) - see VoiceAttachableItem's doc comment. */
  @Input() collection?: string

  /** Identifies which field on the item these memos belong to (a Journal text/numeric descriptor
   * id, a Learn side id, OrYoL's 'title', etc.) - lets one item have independent memo lists per
   * field instead of a single item-wide recording. Not required when `allFields` is set. */
  @Input() fieldId?: string

  /** Shows every memo on the item regardless of which field it's on, and forces recording off
   * (there's no single field to attach a new one to) - for compact summary contexts like a list
   * row, where showing/recording into one specific field doesn't make sense. Mutually exclusive
   * with `fieldId`/`includeLegacy` in practice (the legacy single-recording fallback is already
   * field-specific and wouldn't mean anything here). */
  @Input() allFields = false

  /** Hides the mic and each memo's delete button, leaving only playback - for read-only summary
   * contexts (e.g. a list row) where recording/deleting isn't appropriate. */
  @Input() readOnly = false

  /** Only for the one field on each surface the old single-recording-per-item mic used to write
   * to (Journal's 'general' field, OrYoL's per-node popover note) - see
   * `VoiceMemoService.getLegacyMemoRef`'s doc comment for why this must not be set anywhere else. */
  @Input() includeLegacy = false

  /** Quick-add's "no current item yet" case (generalizes MicComponent's original hardcoded
   * "create a new LearnItem" behavior). Called lazily right when recording stops (unless
   * `createItemEagerlyOnRecordStart` is set - see below), so a blank item isn't created just
   * because the user tapped the mic and then changed their mind. Left unset everywhere else,
   * which already has a real item$ to record onto. */
  @Input() createItemIfMissing?: () => VoiceAttachableItem

  /** Opt-in: calls `createItemIfMissing` as soon as recording *starts* instead of waiting for it
   * to stop, so the very same item ends up owning both the live-updating title
   * (`interimTranscriptChanged`, only meaningful once something exists to patch) and the actual
   * recording, rather than the recording attaching to a different (or no) item than whatever a
   * caller does with the transcript. `FieldVoiceMemoChildController` (`BareSlotChildren.ts`) is
   * the intended pairing - GH #89's unify-the-tree-worlds "voice memo becomes a real child node"
   * flow. Ignored (has no effect) when `createItemIfMissing` isn't also set. Defaults to `false`
   * so existing lazy-at-stop callers (Learn's quick-add bar) are unaffected - creating an item
   * just because the mic was tapped, before any audio exists, would be wrong there. */
  @Input() createItemEagerlyOnRecordStart = false

  /** Emits the live-transcribed text (via the browser's Web Speech API) once recognition ends,
   * shortly after the recording stops. Only fires when the browser supports SpeechRecognition
   * (Chrome/Edge; not Firefox/Safari) and speech was actually recognized - callers should treat
   * this as a best-effort addition, not something every recording is guaranteed to produce. The
   * caller decides how to splice the text into its own field (rich text vs. a plain textarea). */
  @Output() transcriptReady = new EventEmitter<string>()

  /** Live, not-yet-final transcript text as it's recognized - the same value bound to
   * `interimTranscript` in this component's own template (for showing transcription live while
   * recording), just also surfaced to callers who want to reflect it somewhere of their own (e.g.
   * a real tree node's title, live). Only fires in `browser-native` transcription mode - the only
   * mode with interim results at all (see `interimTranscript`'s doc comment). */
  @Output() interimTranscriptChanged = new EventEmitter<string>()

  isRecording = false
  playingBlobId?: string
  currentTimeSec = 0
  durationSec = 0
  /** Live elapsed-time display while isRecording (GH #65) - separate from currentTimeSec, which
   * is the played-back position of a finished memo, not the in-progress recording. */
  recordingElapsedSec = 0

  private mediaRecorder: any = null
  private audioChunks: any[] = []
  private speechRecognition: any = null
  /** Bound directly in the template (alongside interimTranscript) to show transcription live
   * while recording - see interimTranscript's doc comment. */
  transcriptSoFar = ''
  /** Not-yet-finalized tail of the current utterance (bound in the template alongside
   * transcriptSoFar) - only set when interimResults is on, so live transcription can show text
   * as it's spoken instead of only once the whole recording stops (see beginSpeechRecognitionSession). */
  interimTranscript = ''
  private audioEl?: HTMLAudioElement
  private objectUrl?: string
  private recordingStartedAtMs?: number
  private recordingTimerHandle?: ReturnType<typeof setInterval>

  /** Resolved once at init (see ngOnInit) when `includeLegacy` is set - `undefined` until that
   * check resolves, and stays `undefined` forever if there's nothing to fall back to. */
  private legacyMemoRef?: VoiceMemoRef

  /* TODO: move to service, to ensure reference is not lost on component being re-created (e.g. on mobile) */
  stream: MediaStream | undefined

  constructor(
    private voiceMemoService: VoiceMemoService,
    private voiceTranscriptionService: VoiceTranscriptionService,
    private featureService: FeatureService,
    private changeDetectorRef: ChangeDetectorRef,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {}

  get recordingEnabled(): boolean {
    return !this.allFields && !this.readOnly && this.featureService.voiceMemoRecordingEnabled
  }

  get playbackEnabled(): boolean {
    return this.featureService.voiceMemoPlaybackEnabled
  }

  get showDeleteButton(): boolean {
    return !this.readOnly
  }

  /** Read live off `item$` on every check (cheap - a small array filter) rather than cached
   * component state, so a memo just attached (or deleted) by this same component instance shows
   * up immediately without a manual "optimistic update" step. */
  get memos(): VoiceMemoRef[] {
    const real = this.allFields ? readVoiceMemos(this.item$) : readVoiceMemosForField(this.item$, this.fieldId!)
    return (this.legacyMemoRef && real.length === 0) ? [this.legacyMemoRef, ...real] : real
  }

  private get resolvedCollection(): string | undefined {
    return this.voiceMemoService.resolveCollection(this.item$, this.collection)
  }

  ngOnInit() {
    this.eagerlyCacheMemosLocally()
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

  /** Pulls every existing memo's audio onto this device as soon as the field renders, rather than
   * waiting for the user to tap play - `resolveMemoBlob()` is already cache-first (a no-op if
   * it's already local), so this just makes "recorded on another device" or "loaded fresh after
   * sign-in" memos playable offline immediately instead of on first tap. Fire-and-forget: a failed
   * prefetch (offline, blob deleted server-side, etc.) just means the field falls back to fetching
   * on-demand at play time like before, same as any other cache-miss. */
  private eagerlyCacheMemosLocally() {
    const collection = this.resolvedCollection
    const itemId = this.item$?.id
    if (!collection || !itemId) {
      return
    }
    const memosToCache = this.allFields ? readVoiceMemos(this.item$) : readVoiceMemosForField(this.item$, this.fieldId!)
    for (const memo of memosToCache) {
      this.voiceMemoService.resolveMemoBlob(collection, itemId, memo)
        .catch(error => console.error('VoiceMemoFieldComponent eager cache failed for memo', memo.blobId, error))
    }
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
      clearInterval(this.recordingTimerHandle)
      this.recordingTimerHandle = undefined
      try {
        this.speechRecognition?.stop()
      } catch (e) {
        console.log('speechRecognition.stop() failed', e)
      }
      this.changeDetectorRef.markForCheck()
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.recordingTimerHandle)
  }

  private startRecording() {
    if (this.stream) {
      this.recordUsingStream(this.stream)
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true}})
        .then(stream => {
          this.stream = stream
          this.voiceMemoService.registerActiveMic(this)
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
    if (this.createItemEagerlyOnRecordStart && !this.item$ && this.createItemIfMissing) {
      this.item$ = this.createItemIfMissing()
    }
    this.isRecording = true
    this.recordingStartedAtMs = Date.now()
    this.recordingElapsedSec = 0
    this.recordingTimerHandle = setInterval(() => {
      this.recordingElapsedSec = Math.floor((Date.now() - this.recordingStartedAtMs!) / 1000)
      this.changeDetectorRef.markForCheck()
    }, 1000)
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

  /** How many times startSpeechRecognitionIfSupported() will silently restart a `continuous: true`
   * session after it drops with a `'network'` error (see below) before giving up on transcription
   * for the rest of the current recording. */
  private static readonly MAX_SPEECH_RECOGNITION_RETRIES = 3

  private speechRecognitionRetriesLeft = 0

  /** Live transcription running in parallel with the MediaRecorder blob capture - not derived
   * from the recorded blob afterwards, so it only covers speech recognized while actively
   * recording. Silently does nothing on browsers without SpeechRecognition support (Firefox,
   * older Safari) - transcription is a bonus on top of the recording, never a requirement for it.
   * Only runs at all in 'browser-native' mode - 'server'/'browser-whisper' transcribe the
   * finished blob instead (see onRecordStopped()), and 'off' skips transcription entirely. */
  private startSpeechRecognitionIfSupported() {
    if (this.featureService.voiceMemoTranscriptionMode !== 'browser-native') {
      return
    }
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      return
    }
    this.transcriptSoFar = ''
    this.interimTranscript = ''
    this.speechRecognitionRetriesLeft = VoiceMemoFieldComponent.MAX_SPEECH_RECOGNITION_RETRIES
    this.beginSpeechRecognitionSession(SpeechRecognitionCtor)
  }

  /** Split out from startSpeechRecognitionIfSupported() so a dropped session can be restarted
   * without resetting transcriptSoFar/the retry budget. Chrome's `continuous: true` recognition is
   * known to be fragile in practice - it frequently drops with a `'network'` error after a short
   * time even on a perfectly good connection (a well-documented, long-standing Chrome quirk, not
   * something specific to this app or an actual connectivity problem most of the time) - silently
   * reconnecting a few times covers that instead of losing the rest of the recording's transcript
   * to one blip. */
  private beginSpeechRecognitionSession(SpeechRecognitionCtor: any) {
    this.speechRecognition = new SpeechRecognitionCtor()
    this.speechRecognition.continuous = true
    this.speechRecognition.interimResults = true
    this.speechRecognition.lang = document.documentElement.lang || undefined
    let hadNetworkError = false
    this.speechRecognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          this.transcriptSoFar += event.results[i][0].transcript + ' '
        } else {
          interim += event.results[i][0].transcript
        }
      }
      this.interimTranscript = interim
      // Same concatenation this component's own template shows live (transcriptSoFar + the
      // not-yet-final interim tail) - a caller patching a title from just the interim part alone
      // would see it visually reset/shrink each time a word gets finalized.
      const combined = (this.transcriptSoFar + interim).trim()
      if (combined) {
        this.interimTranscriptChanged.emit(combined)
      }
      this.changeDetectorRef.markForCheck()
    }
    this.speechRecognition.onerror = (event: any) => {
      console.log('speechRecognition error (non-fatal, recording is unaffected)', event.error)
      hadNetworkError = event.error === 'network'
    }
    this.speechRecognition.onend = () => {
      this.speechRecognition = null
      this.interimTranscript = ''
      if (hadNetworkError && this.isRecording && this.speechRecognitionRetriesLeft > 0) {
        this.speechRecognitionRetriesLeft--
        this.beginSpeechRecognitionSession(SpeechRecognitionCtor)
        return
      }
      const transcript = this.transcriptSoFar.trim()
      if (transcript) {
        this.transcriptReady.emit(transcript)
      }
      this.changeDetectorRef.markForCheck()
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

    this.transcribeCompletedRecordingIfNeeded(blob)

    if (!this.item$ && this.createItemIfMissing) {
      this.item$ = this.createItemIfMissing()
    }
    const item = this.item$
    const collection = this.voiceMemoService.resolveCollection(item, this.collection)
    if (!item || !collection) {
      return
    }
    // patchThrottled() is what actually assigns a brand-new item's id in the first place (see
    // OdmItem$2.setIdAndWhenCreatedIfNecessary(), called synchronously at the top of it) - reading
    // item.id *before* this call is what silently dropped a memo recorded on a never-typed-into
    // new Journal entry (id was still undefined at that point). Call it first, then read the id
    // fresh, exactly like RichTextEditComponent's own itemRef.id resolution does for the same
    // "brand new item" case.
    item.patchThrottled({hasAudio: true})
    const itemId = item.id
    if (!itemId) {
      return
    }
    // Only reachable via the mic button, which recordingEnabled hides whenever allFields/readOnly
    // is set - fieldId is guaranteed real (non-null) here by that same gating.
    this.voiceMemoService.attachMemo(collection, itemId, this.fieldId!, blob).then(blobId => {
      const newRecord: VoiceMemoRecord = {fieldId: this.fieldId!, blobId, durationMs, whenCreated: new Date().toISOString()}
      item.patchThrottled({voiceMemos: [...readVoiceMemos(item), newRecord]})
      this.changeDetectorRef.markForCheck()
    })
  }

  /** 'server' and 'browser-whisper' transcribe the *finished* recording, unlike 'browser-native'
   * (which already ran live during recording, driven separately by
   * startSpeechRecognitionIfSupported()/beginSpeechRecognitionSession() above) - dispatched here
   * rather than blocking attachMemo() above on it, since transcription failing/being slow should
   * never hold up the recording itself actually getting saved. */
  private transcribeCompletedRecordingIfNeeded(blob: Blob) {
    const mode = this.featureService.voiceMemoTranscriptionMode
    const language = this.featureService.voiceMemoTranscriptionLanguage || undefined
    const transcribePromise = mode === 'server' ? this.voiceTranscriptionService.transcribeViaServer(blob, language)
      : mode === 'browser-whisper' ? this.voiceTranscriptionService.transcribeViaBrowserWhisper(blob, language)
      : undefined
    if (!transcribePromise) {
      return
    }
    transcribePromise
      .then(text => {
        if (text) {
          this.transcriptReady.emit(text)
        }
      })
      .catch(error => console.error(`VoiceMemoFieldComponent transcription (mode: ${mode}) failed`, error))
  }

  /** True only while waiting out the flush-safety delay below (stopping a live recording) - the
   * button stays visible-but-disabled during that window instead of looking unresponsive. Never
   * true when just releasing an already-idle, warm-kept stream (see below), since there's nothing
   * to wait for in that case. */
  releasingMic = false

  /** `ActiveMicHolder` interface, for the sync popover's global "release mic" action - just
   * delegates to the field's own release button logic below. */
  releaseMicIfActive(): void {
    this.stopRecordingIfNeededAndReleaseMic()
  }

  stopRecordingIfNeededAndReleaseMic() {
    const wasRecording = this.isRecording
    this.stopRecordingIfNeeded()
    if (!wasRecording) {
      this.releaseMicTracksNow()
      return
    }
    // `mediaRecorder.stop()` above is async - it still needs to fire a final `dataavailable` (the
    // last audio chunk) before `onstop`, so stopping the underlying tracks immediately risks
    // truncating that tail end on some browsers. This short delay just lets that flush finish
    // first; it's not needed at all when releasing an idle stream (the `!wasRecording` branch
    // above), only when actually stopping a live recording.
    this.releasingMic = true
    this.changeDetectorRef.markForCheck()
    setTimeout(() => {
      this.releaseMicTracksNow()
      this.releasingMic = false
      this.changeDetectorRef.markForCheck()
    }, 300)
  }

  private releaseMicTracksNow() {
    this.stream?.getTracks().forEach(track => track.stop())
    this.stream = undefined
    this.voiceMemoService.unregisterActiveMic(this)
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

  async deleteMemo(memoRef: VoiceMemoRef, event?: Event) {
    event?.stopPropagation()
    if (memoRef.legacy) {
      return // predates per-memo storage; nothing on the item itself to remove
    }
    const alert = await this.alertController.create({
      header: 'Delete this recording?',
      message: 'This cannot be undone once the "Undo" toast disappears.',
      buttons: [
        {text: 'Cancel', role: 'cancel'},
        {text: 'Delete', role: 'destructive', handler: () => this.removeMemoWithUndo(memoRef)},
      ],
    })
    await alert.present()
  }

  /** Removes the memo from the item immediately (so it disappears from the list right away), but
   * only physically deletes its blob/row once the "Undo" toast dismisses without being tapped -
   * once that storage delete happens there's no getting the audio back, so the undo window has to
   * cover the real deletion, not just the list entry. */
  private removeMemoWithUndo(memoRef: VoiceMemoRef) {
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
    this.changeDetectorRef.markForCheck()

    let restored = false
    this.toastController.create({
      message: 'Recording deleted.',
      duration: 6000,
      color: 'medium',
      position: 'bottom',
      buttons: [{
        text: 'Undo',
        role: 'cancel',
        handler: () => {
          restored = true
          item.patchThrottled({voiceMemos: [...readVoiceMemos(item), memoRef]})
          this.changeDetectorRef.markForCheck()
        },
      }],
    }).then(async toast => {
      await toast.present()
      await toast.onDidDismiss()
      if (!restored) {
        this.voiceMemoService.deleteMemo(collection, itemId, memoRef)
      }
    })
  }
}
