import {OdmItemId} from '../../../libs/AppFedShared/odm/OdmItemId'
import {OdmInMemItem} from '../../../libs/AppFedShared/odm/OdmItem$2'

export type JournalAiAdviceSettingsId = OdmItemId<JournalAiAdviceSettings>

/** GH #137: one fixed-id row per user (see JOURNAL_AI_ADVICE_SETTINGS_ID) holding the "get AI
 * advice" popover's history-window settings - synced local+server the same way as any other ODM
 * item, so the same choice follows the user across devices instead of staying per-browser. */
export class JournalAiAdviceSettings extends OdmInMemItem {
  maxDaysHistory?: number
  maxEntriesHistory?: number
}
