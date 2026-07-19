import {SlotDescriptor} from '../../../libs/AppFedShared/tree/cells/SlotDescriptor'
import {JournalNumericDescriptors} from './JournalNumericDescriptors'
import {JournalTextDescriptors} from './JournalTextDescriptors'

/** GH #89's unified slot registry for Journal - one array replacing the separate hardcoded
 * rendering paths `JournalNumericFieldsComponent`/`JournalTextFieldsComponent` used to walk.
 * Deliberately a thin adapter over the *existing* `JournalNumericDescriptors`/
 * `JournalTextDescriptors` (kept, not deleted) rather than a from-scratch retyping of all 254
 * entries - those two files hold hand-curated domain knowledge (search terms, antonyms, which
 * ~50 of 236 mood/health/productivity fields are "shortlisted") that has no replacement source;
 * losing it would be a pure regression, not a cleanup. Only the thin *rendering* shape
 * (`SlotDescriptor`) is unified; the rich underlying data stays where it already was. */
export const JOURNAL_SLOT_DESCRIPTORS: SlotDescriptor[] = [
  ...JournalNumericDescriptors.instance.array.map((descriptor): SlotDescriptor => ({
    id: descriptor.id!,
    label: descriptor.title ?? descriptor.id!,
    icon: descriptor.iconName,
    kind: 'numeric',
    dataFieldKey: descriptor.id,
    searchTerms: descriptor.searchTerms,
    isShortListed: descriptor.isShortListed,
  })),
  ...JournalTextDescriptors.instance.array.map((descriptor): SlotDescriptor => ({
    id: descriptor.id!,
    label: descriptor.title ?? descriptor.id!,
    icon: descriptor.iconName,
    kind: 'text',
    dataFieldKey: descriptor.id,
    // The old text-fields UI showed every descriptor by default except ones marked `hide`
    // (only `text`, "temporary for retrospective") - preserve that as always-visible here too.
    isShortListed: !descriptor.hide,
  })),
]
