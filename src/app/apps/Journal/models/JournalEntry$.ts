import {OdmItem$2, OdmPatch} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {JournalEntry} from './JournalEntry'
import {JournalEntryItemsService} from '../core/journal-entries.service'

export class JournalEntry$ extends OdmItem$2<
  JournalEntry$,
  JournalEntry,
  JournalEntry,
  JournalEntryItemsService
  >
{
  public override patchThrottled(patch: OdmPatch<JournalEntry>) {
    super.patchThrottled(patch);
  }

}
