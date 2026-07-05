import { Injectable } from '@angular/core';
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'

export class Config {
  showMinMaxColumns = true
  showMissingValuesCount = true
  showAggregateValues = true /* aggregate -> https://www.thesaurus.com/browse/aggregate e.g. combined or total */
  showTimeTrackedValue = true
  planExecutionNotificationsEnabled = true
  planExecutionNotificationTimePercentages: Array<number> = [75, 95, 100, 110, 150]
  /** Rollout switch for OryRichTextCellComponent (TinyMCE, shared with LearnDo/Quiz/Journal) vs.
   * the older ContenteditableCellComponent for tree node titles - kept alongside each other so
   * either can be switched back to instantly from the toolbar popover if the new editor
   * regresses something (e.g. its slightly different caret-position/focus behavior). */
  useTinyMceTitleEditor = true
}

const ORYOL_CONFIG_KEY = 'OrYoL_Config'

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public readonly config$ = new CachedSubject<Config>(
    JSON.parse(localStorage.getItem(ORYOL_CONFIG_KEY) || 'null') || new Config()
  )

  constructor() { }

  patchConfig(patch: any) {
    const newValuePatched = {
      ... this.config$.lastVal,
      ... patch
    }
    this.config$.next(newValuePatched)
    localStorage.setItem(ORYOL_CONFIG_KEY, JSON.stringify(newValuePatched))
  }
}
