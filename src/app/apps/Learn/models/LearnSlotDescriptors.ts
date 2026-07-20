import {SlotDescriptor} from '../../../libs/AppFedShared/tree/cells/SlotDescriptor'
import {sidesDefsArray} from '../core/sidesDefs'
import {LearnItem} from './LearnItem'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {buttonsDesc as mentalEffortButtonsDesc} from '../learn-item-details/mental-effort-level-edit/mental-effort-level-edit.component'
import {buttonsDesc as physicalHealthImpactButtonsDesc} from '../learn-item-details/physical-health-impact-level-edit/physical-health-impact-level-edit.component'
import {buttonsDesc as mentalHealthImpactButtonsDesc} from '../learn-item-details/mental-health-impact-level-edit/mental-health-impact-level-edit.component'
import {buttonsDesc as funButtonsDesc} from '../../../libs/LifeSuiteShared/edit-shared/fun-level-edit/fun-level-edit.component'
import {importanceButtonsDesc} from '../../../libs/LifeSuiteShared/edit-shared/importance-edit/importance-edit.component'

/** GH #89's unified slot registry for Learn - replaces `learn-item-details.page.html`'s hand-
 * wired `*ngFor="let side of sidesDefsArray"` (`<app-item-side-editor>`) plus its 5 separately
 * hardcoded numeric-bucket components (`app-fun-level-edit`, `app-mental-effort-level-edit`,
 * `app-physical-health-impact-level-edit`, `app-mental-health-impact-level-edit`,
 * `app-importance-edit`). `ItemSideComponent`/those 5 components are all KEPT, not deleted - the
 * quiz-taking page and `quiz-options`/`selection-popup` still use them directly, same reasoning
 * `JournalSlotDescriptors.ts` used for keeping `JournalNumericDescriptors`/`JournalTextDescriptors`
 * (hand-curated data with no replacement source) - only this ONE page's *rendering* is unified.
 *
 * `Side.onlyForLearn` has no `SlotDescriptor` equivalent (it's an item-*type* gate - "hide on a
 * plain task, not something to-learn" - with no analog in Journal, which has no such item-type
 * split) - deliberately NOT folded into `SlotDescriptor`/`isSlotVisible()`, which stay item-type-
 * agnostic. Instead, `getVisibleLearnSlotDescriptors(item)` below pre-filters the array a caller
 * passes to `TreeNodeCellsComponent`, so both it and `SlotPickerComponent` only ever see slots
 * that are actually allowed for this item's type. */
export const LEARN_SLOT_DESCRIPTORS: SlotDescriptor[] = [
  ...sidesDefsArray.map((side): SlotDescriptor => ({
    id: side.id,
    label: side.title,
    icon: side.flag ? undefined : side.icon,
    imageSrc: side.flag ? side.iconFullPath : undefined,
    imageOpacity: side.flagTransparent ? 0.3 : undefined,
    kind: 'text',
    dataFieldKey: side.id,
    searchTerms: side.searchTerms,
    // The old side-editors-flow showed every side as an always-present collapsed "+" button
    // regardless of value (no shortlist/hidden-unless-filled concept existed) - `hideByDefault`
    // (just `it`/Italian today) was the one exception. Preserve that as closely as the new
    // filled-or-shortlisted-or-picked model allows: shortlist everything except hideByDefault
    // sides, which fall back to isSlotVisible()'s normal "has a value, or manually added" rule -
    // an actual improvement over the old unconditional hide (an `it` value from old data becomes
    // reachable again instead of hard-suppressed).
    isShortListed: !side.hideByDefault,
    aiFillable: side.id === 'answer',
  })),
  {
    id: 'funEstimate', label: 'Fun', kind: 'intensity', dataFieldKey: 'funEstimate',
    buttonsDescriptor: funButtonsDesc, isShortListed: true,
  },
  {
    id: 'mentalLevelEstimate', label: 'Mental effort', kind: 'intensity', dataFieldKey: 'mentalLevelEstimate',
    buttonsDescriptor: mentalEffortButtonsDesc, isShortListed: true,
  },
  {
    id: 'physicalHealthImpact', label: 'Physical health impact', kind: 'intensity', dataFieldKey: 'physicalHealthImpact',
    buttonsDescriptor: physicalHealthImpactButtonsDesc, isShortListed: true,
  },
  {
    id: 'mentalHealthImpact', label: 'Mental health impact', kind: 'intensity', dataFieldKey: 'mentalHealthImpact',
    buttonsDescriptor: mentalHealthImpactButtonsDesc, isShortListed: true,
  },
  {
    id: 'importance', label: 'Importance', kind: 'intensity', dataFieldKey: 'importance',
    buttonsDescriptor: importanceButtonsDesc, isShortListed: true,
  },
  {
    id: 'importanceCurrent', label: 'Importance (current)', kind: 'intensity', dataFieldKey: 'importanceCurrent',
    buttonsDescriptor: importanceButtonsDesc, isShortListed: true,
  },
]

const ONLY_FOR_LEARN_SIDE_IDS = new Set<string>(sidesDefsArray.filter(side => side.onlyForLearn).map(side => side.id))

/** Ports `ItemSideComponent.isVisible()`'s item-type gate ("a plain task, not something to-learn,
 * doesn't show language/quiz-only sides") - see this file's own doc comment for why it isn't
 * folded into `SlotDescriptor`/`isSlotVisible()` directly. Apply this BEFORE passing descriptors
 * to `TreeNodeCellsComponent`, so `SlotPickerComponent` (which only offers what it's given) also
 * never offers an inapplicable side. */
export function getVisibleLearnSlotDescriptors(item: LearnItem | nullish): SlotDescriptor[] {
  if (item?.isTask && !item?.isToLearn) {
    return LEARN_SLOT_DESCRIPTORS.filter(descriptor => !ONLY_FOR_LEARN_SIDE_IDS.has(descriptor.id))
  }
  return LEARN_SLOT_DESCRIPTORS
}
