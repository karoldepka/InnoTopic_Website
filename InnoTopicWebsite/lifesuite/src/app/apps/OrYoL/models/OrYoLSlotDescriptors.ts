import {SlotDescriptor} from '../../../libs/AppFedShared/tree/cells/SlotDescriptor'
import {DAY_PLAN_TEMPLATES, DayPlanTemplate} from '../plan-execution/templates/day-plan-templates'

/** GH #89: "Replace OrYoL's template nodes with the new virtual nodes." Applying a day-plan
 * template used to create a real, separately-persisted child item + `NodeInclusion` per template
 * node (`createOrGetTemplateNode()` in `tree-node-menu-popover.component.ts`, now removed) - a
 * real second tree row for "Plan", "General", etc., fully participating in OrYoL's drag-drop/
 * reorder/multi-parent machinery whether or not that was ever wanted for what's really just a
 * checklist heading. Every day-plan template node across all 4 `DAY_PLAN_TEMPLATES` becomes one
 * `kind: 'slot'` bare-slot descriptor here instead (deduplicated by id - none actually collide
 * across templates in the current data, checked directly). "Applying a template" now just marks
 * the corresponding descriptors `manuallyAddedSlotIds` on the *real* node they were applied to,
 * making them appear as bare slots (real children addressable via `BareSlotChildren.ts`,
 * commentable, time-trackable) in that node's `<app-tree-node-cells>` area - no second real item,
 * no `NodeInclusion`, and deliberately no changes to `TreeModel`/`NodeInclusion`/OrYoL's own
 * drag-drop tree (see the GH #89 plan doc for why: OrYoL's tree is genuinely multi-parent via
 * detached, independently-orderable `NodeInclusion` objects, a real structural difference from
 * the single-parent-with-order-on-item model every other unified slot relies on - out of scope
 * for this pass). */
export const ORYOL_SLOT_DESCRIPTORS: SlotDescriptor[] = (() => {
  const byId = new Map<string, SlotDescriptor>()
  for (const template of DAY_PLAN_TEMPLATES) {
    for (const node of template.nodes) {
      if (!byId.has(node.id)) {
        byId.set(node.id, {
          id: node.id,
          label: node.title,
          kind: 'slot',
          searchTerms: template.label,
        })
      }
    }
  }
  return Array.from(byId.values())
})()

/** The day-plan template ids each bare slot belongs to (a slot can appear in more than one
 * template) - used by `applyDayPlanTemplate()` to know which slots to mark
 * `manuallyAddedSlotIds` for a given template choice. */
export function getSlotIdsForTemplate(template: DayPlanTemplate): string[] {
  return template.nodes.map(node => node.id)
}
