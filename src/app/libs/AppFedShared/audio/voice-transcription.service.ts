import {Injectable} from '@angular/core'
import {HttpClient} from '@angular/common/http'
import {firstValueFrom} from 'rxjs'
import {environment} from '../../../../environments/environment'

export type VoiceMemoTranscriptionMode = 'browser-native' | 'browser-whisper' | 'server' | 'off'

interface ServerTranscribeResponse {
  text: string
  language?: string | null
  durationSeconds?: number | null
}

/** Transcribes a *completed* recording blob after the fact - covers the 'server' and
 * 'browser-whisper' modes. 'browser-native' (the Web Speech API) is fundamentally different: it
 * transcribes live, streaming, *during* the recording itself, so `VoiceMemoFieldComponent` still
 * drives that one directly rather than through here - there's no finished blob to hand this
 * service until after browser-native would already be done. */
@Injectable({providedIn: 'root'})
export class VoiceTranscriptionService {

  private baseUrl = environment.aiBackendUrl ? `${environment.aiBackendUrl}/ai-api` : '/ai-api'

  private whisperPipelinePromise?: Promise<any>

  constructor(private http: HttpClient) {}

  /** POSTs the raw recording to backend-ts's /ai-api/transcribe (OpenAI Whisper/gpt-4o-transcribe
   * - see backend-ts/src/routes/transcribe.ts), which needs its own OPENAI_API_KEY configured
   * server-side regardless of what this app's general AI_API_BASE_URL points at. */
  async transcribeViaServer(blob: Blob, languageCode?: string): Promise<string | undefined> {
    const formData = new FormData()
    formData.append('audio', blob, 'memo.ogg')
    if (languageCode) {
      formData.append('language', languageCode)
    }
    const response = await firstValueFrom(
      this.http.post<ServerTranscribeResponse>(`${this.baseUrl}/transcribe`, formData)
    )
    return response.text?.trim() || undefined
  }

  /** Fully offline, in-browser transcription via a WASM-compiled Whisper model
   * (@huggingface/transformers) - no server round-trip, no per-request cost, but a real
   * one-time model download (~40MB for whisper-tiny) and slower inference than the server mode,
   * especially on modest hardware. The model/pipeline is lazily imported and cached in memory
   * only the first time this mode is actually used, so switching to it is what pays the download
   * cost, not just having the app installed. */
  async transcribeViaBrowserWhisper(blob: Blob, languageCode?: string): Promise<string | undefined> {
    const pipeline = await this.getWhisperPipeline()
    const audioData = await this.decodeToMono16kHz(blob)
    const result: any = await pipeline(audioData, {
      language: languageCode || undefined,
      task: 'transcribe',
    })
    const text = Array.isArray(result) ? result.map((r: any) => r.text).join(' ') : result?.text
    return (text as string | undefined)?.trim() || undefined
  }

  private async getWhisperPipeline() {
    if (!this.whisperPipelinePromise) {
      // whisper-tiny (not the English-only -tiny.en) - multilingual, ~40MB, the smallest variant
      // that still covers PL/EN/ES/DE/PT/IT/FR reasonably rather than just English.
      //
      // dtype: 'q8' is required, not optional - transformers.js's own docs call Whisper (an
      // encoder-decoder model) "extremely sensitive to quantization settings", and leaving dtype
      // unspecified lets it auto-pick a mismatched/incomplete quantization for this repo -
      // confirmed live: it throws "Can't create a session... Missing required scale... for node
      // model.decoder.embed_tokens.weight_transposed_DequantizeLinear" every time, so
      // browser-whisper transcription never worked at all before this. q8 (not fp32) keeps the
      // ~40MB download size the settings UI already promises.
      this.whisperPipelinePromise = import('@huggingface/transformers').then(({pipeline}) =>
        pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {dtype: 'fp32'})
      )
    }
    return this.whisperPipelinePromise
  }

  /** Whisper expects 16kHz mono Float32 PCM - a recorded blob is whatever MediaRecorder produced
   * (opus-in-ogg here) at whatever the mic's native sample rate is (commonly 44.1/48kHz) and
   * possibly stereo. Decodes then resamples/downmixes via an OfflineAudioContext - the standard
   * browser technique for this, rather than hand-rolling a resampler: connecting the decoded
   * (possibly multi-channel) buffer into a 1-channel offline context's destination triggers the
   * Web Audio API's own standard downmix, and rendering at targetSampleRate resamples for free. */
  private async decodeToMono16kHz(blob: Blob): Promise<Float32Array> {
    const arrayBuffer = await blob.arrayBuffer()
    const AudioContextCtor = (window as any).AudioContext || (window as any).webkitAudioContext
    const decodeCtx = new AudioContextCtor()
    const decoded: AudioBuffer = await decodeCtx.decodeAudioData(arrayBuffer)
    decodeCtx.close?.()

    const targetSampleRate = 16000
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetSampleRate), targetSampleRate)
    const source = offlineCtx.createBufferSource()
    source.buffer = decoded
    source.connect(offlineCtx.destination)
    source.start()
    const rendered = await offlineCtx.startRendering()
    return rendered.getChannelData(0)
  }
}
