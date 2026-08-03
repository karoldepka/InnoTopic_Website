import {Injectable, Injector} from '@angular/core'
import {OdmService2} from '../../../libs/AppFedShared/odm/OdmService2'
import {OdmItem$2CtorOpts} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {JournalAiAdviceSettings, JournalAiAdviceSettingsId} from './JournalAiAdviceSettings'
import {JournalAiAdviceSettings$} from './JournalAiAdviceSettings$'

/** GH #137: one fixed-id row per user - see JOURNAL_AI_ADVICE_SETTINGS_ID. */
export const JOURNAL_AI_ADVICE_SETTINGS_ID = 'singleton' as JournalAiAdviceSettingsId

@Injectable({
  providedIn: 'root'
})
export class JournalAiAdviceSettingsOdmService extends OdmService2<
  JournalAiAdviceSettingsOdmService,
  JournalAiAdviceSettings,
  JournalAiAdviceSettings,
  JournalAiAdviceSettings$
> {

  constructor(
    injector: Injector,
  ) {
    super(
      injector,
      'JournalAiAdviceSettings'
    )
  }

  override convertFromDbFormat(dbItem: JournalAiAdviceSettings): JournalAiAdviceSettings {
    return Object.assign(new JournalAiAdviceSettings(), dbItem)
  }

  protected createOdmItem$ForExisting(itemId: JournalAiAdviceSettingsId, inMemVal?: JournalAiAdviceSettings): JournalAiAdviceSettings$ {
    return new JournalAiAdviceSettings$(this, itemId, inMemVal)
  }

  override createOdmItem$(id?: JournalAiAdviceSettingsId, inMemData?: JournalAiAdviceSettings, parents?: JournalAiAdviceSettings$[], opts?: OdmItem$2CtorOpts): JournalAiAdviceSettings$ {
    return new JournalAiAdviceSettings$(this, id, inMemData, parents, opts)
  }

}
