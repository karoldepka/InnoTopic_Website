import {Injectable} from '@angular/core';
import {g} from './g'
import {CachedSubject} from './utils/cachedSubject2/CachedSubject2'
import {FeaturesConfig} from './FeaturesConfig'
import {FeaturesProps} from './FeaturesProps'
import type {VoiceMemoTranscriptionMode} from './audio/voice-transcription.service'

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  config$: CachedSubject<FeaturesConfig> = new CachedSubject<FeaturesConfig>()

  private static readonly featuresPropsKey = 'featuresProps'

  constructor() {
    // g.feat = this // DX FTW!
    const featuresConfig = new FeaturesConfig(this.loadPersistedProps())
    g.feat = featuresConfig
    this.config$.nextWithCache(featuresConfig)
  }

  /** Toggles under "App & Sync Status" (enableAll, beforeProductization, showWhatIUse,
   * niceLooking, voiceMemoRecordingEnabled, voiceMemoPlaybackEnabled) used to reset to their
   * class defaults on every reload - only firestoreEnabled/timeTrackingEnabled/voice-memo-
   * transcription-mode below were ever actually persisted. Stored as one JSON blob (all of
   * `FeaturesProps`, not a key per flag) so any flag added to that class in the future persists
   * for free. `Object.assign(new FeaturesProps(), ...)` covers a stored blob missing a
   * newer field - it falls back to that field's class default rather than `undefined`. */
  private loadPersistedProps(): FeaturesProps {
    const stored = localStorage.getItem(FeatureService.featuresPropsKey)
    if (!stored) {
      return new FeaturesProps()
    }
    try {
      return Object.assign(new FeaturesProps(), JSON.parse(stored))
    } catch (error) {
      console.error('FeatureService: failed to parse persisted featuresProps, using defaults', error)
      return new FeaturesProps()
    }
  }

  /** Applies a patch on top of the current props, so toggling one flag doesn't reset the
   * others back to their defaults. */
  private patchProps(patch: Partial<FeaturesProps>) {
    const props = Object.assign(new FeaturesProps(), this.config$.lastVal?.props, patch)
    localStorage.setItem(FeatureService.featuresPropsKey, JSON.stringify(props))
    const featuresConfig = new FeaturesConfig(props)
    g.feat = featuresConfig
    this.config$.nextWithCache(featuresConfig)
  }

  get enableAll(): boolean {
    return this.config$.lastVal?.props?.enableAll ?? false
  }

  setEnableAll(enabled: boolean) {
    console.log('FeaturesConfig setEnableAll', enabled)
    this.patchProps({enableAll: enabled})
  }

  get beforeProductization(): boolean {
    return this.config$.lastVal?.props?.beforeProductization ?? false
  }

  setBeforeProductization(enabled: boolean) {
    this.patchProps({beforeProductization: enabled})
  }

  get showWhatIUse(): boolean {
    return this.config$.lastVal?.props?.showWhatIUse ?? true
  }

  setShowWhatIUse(enabled: boolean) {
    this.patchProps({showWhatIUse: enabled})
  }

  get niceLooking(): boolean {
    return this.config$.lastVal?.props?.niceLooking ?? false
  }

  setNiceLooking(enabled: boolean) {
    this.patchProps({niceLooking: enabled})
  }

  get voiceMemoRecordingEnabled(): boolean {
    return this.config$.lastVal?.props?.voiceMemoRecordingEnabled ?? true
  }

  setVoiceMemoRecordingEnabled(enabled: boolean) {
    this.patchProps({voiceMemoRecordingEnabled: enabled})
  }

  get voiceMemoPlaybackEnabled(): boolean {
    return this.config$.lastVal?.props?.voiceMemoPlaybackEnabled ?? true
  }

  setVoiceMemoPlaybackEnabled(enabled: boolean) {
    this.patchProps({voiceMemoPlaybackEnabled: enabled})
  }

  get journalCompactStarRatings(): boolean {
    return this.config$.lastVal?.props?.journalCompactStarRatings ?? true
  }

  setJournalCompactStarRatings(enabled: boolean) {
    this.patchProps({journalCompactStarRatings: enabled})
  }

  get experimentalQuizSchedulerEnabled(): boolean {
    return this.config$.lastVal?.props?.experimentalQuizSchedulerEnabled ?? false
  }

  setExperimentalQuizSchedulerEnabled(enabled: boolean) {
    this.patchProps({experimentalQuizSchedulerEnabled: enabled})
  }

  static readonly firestoreEnabledKey = 'firestoreEnabled'

  get firestoreEnabled(): boolean {
    const stored = localStorage.getItem(FeatureService.firestoreEnabledKey)
    return stored === null ? true : stored === 'true'
  }

  setFirestoreEnabled(enabled: boolean) {
    localStorage.setItem(FeatureService.firestoreEnabledKey, String(enabled))
  }

  // ---- Voice memo transcription mode/language - a user preference that should survive a
  // reload, unlike the rest of this file's dev-facing toggles (patchProps() above never persists
  // to localStorage at all) - stored directly, same pattern as firestoreEnabled above. ----

  static readonly voiceMemoTranscriptionModeKey = 'voiceMemoTranscriptionMode'

  get voiceMemoTranscriptionMode(): VoiceMemoTranscriptionMode {
    const stored = localStorage.getItem(FeatureService.voiceMemoTranscriptionModeKey)
    return (stored as VoiceMemoTranscriptionMode | null) ?? 'browser-native'
  }

  setVoiceMemoTranscriptionMode(mode: VoiceMemoTranscriptionMode) {
    localStorage.setItem(FeatureService.voiceMemoTranscriptionModeKey, mode)
  }

  static readonly voiceMemoTranscriptionLanguageKey = 'voiceMemoTranscriptionLanguage'

  /** ISO-639-1 code, or '' for auto-detect (browser-native's SpeechRecognition doesn't actually
   * support auto-detect - it falls back to the page's own `lang` for that mode specifically). */
  get voiceMemoTranscriptionLanguage(): string {
    return localStorage.getItem(FeatureService.voiceMemoTranscriptionLanguageKey) ?? ''
  }

  setVoiceMemoTranscriptionLanguage(languageCode: string) {
    localStorage.setItem(FeatureService.voiceMemoTranscriptionLanguageKey, languageCode)
  }

  // ---- Global on/off for the time-tracking widget on Journal entries and Learn's Task items
  // (OrYoL's own time-tracking stays on regardless - this only gates the newer surfaces) - a real
  // user preference that should survive a reload, so localStorage-persisted like
  // firestoreEnabled above rather than the in-memory-only patchProps() toggles. ----

  static readonly timeTrackingEnabledKey = 'timeTrackingEnabled'

  get timeTrackingEnabled(): boolean {
    const stored = localStorage.getItem(FeatureService.timeTrackingEnabledKey)
    return stored === null ? true : stored === 'true'
  }

  setTimeTrackingEnabled(enabled: boolean) {
    localStorage.setItem(FeatureService.timeTrackingEnabledKey, String(enabled))
  }
}
