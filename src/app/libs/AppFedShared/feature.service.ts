import {Injectable} from '@angular/core';
import {g} from './g'
import {CachedSubject} from './utils/cachedSubject2/CachedSubject2'
import {FeaturesConfig} from './FeaturesConfig'
import {FeaturesProps} from './FeaturesProps'

@Injectable({
  providedIn: 'root'
})
export class FeatureService {

  config$: CachedSubject<FeaturesConfig> = new CachedSubject<FeaturesConfig>()

  constructor() {
    console.log('FeatureService ctor')
    // g.feat = this // DX FTW!
    const featuresConfig = new FeaturesConfig(new FeaturesProps())
    g.feat = featuresConfig
    this.config$.nextWithCache(featuresConfig)
  }

  /** Applies a patch on top of the current props, so toggling one flag doesn't reset the
   * others back to their defaults. */
  private patchProps(patch: Partial<FeaturesProps>) {
    const props = Object.assign(new FeaturesProps(), this.config$.lastVal?.props, patch)
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

  static readonly firestoreEnabledKey = 'firestoreEnabled'

  get firestoreEnabled(): boolean {
    const stored = localStorage.getItem(FeatureService.firestoreEnabledKey)
    return stored === null ? true : stored === 'true'
  }

  setFirestoreEnabled(enabled: boolean) {
    localStorage.setItem(FeatureService.firestoreEnabledKey, String(enabled))
  }
}
