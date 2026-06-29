export interface DayPlanTemplateNode {
  /** Human-readable node id, used inside generated item id */
  id: string
  title: string
  /** Can differ from existing note/task classes and be mapped to a custom icon */
  templateNodeClass: string
  isTask?: boolean
  children?: DayPlanTemplateNode[]
}

export interface DayPlanTemplate {
  id: string
  label: string
  description?: string
  icon: string
  nodes: DayPlanTemplateNode[]
}

/**
 * Builds ids in the required format:
 * <parent-id>_template_<human-readable-template-item-id>
 */
export function buildTemplateItemId(parentId: string, templateNodeId: string): string {
  return `${parentId}_template_${templateNodeId}`
}

/** Hardcoded templates for day plans (initial version). */
export const DAY_PLAN_TEMPLATES: DayPlanTemplate[] = [
  {
    id: 'default_day_plan',
    label: 'Default Day Plan',
    icon: 'calendar-outline',
    description: 'Balanced plan for work, focus, admin and recovery.',
    nodes: [
      { id: 'morning_boot', title: 'Morning boot sequence', templateNodeClass: 'dayplan_routine' },
      { id: 'deep_work_1', title: 'Deep work block 1', templateNodeClass: 'dayplan_focus', isTask: true },
      { id: 'ops_admin', title: 'Ops / admin batch', templateNodeClass: 'dayplan_ops', isTask: true },
      { id: 'deep_work_2', title: 'Deep work block 2', templateNodeClass: 'dayplan_focus', isTask: true },
      { id: 'review_wrap', title: 'Wrap-up and review', templateNodeClass: 'dayplan_review' },
      { id: 'wind_down', title: 'Evening wind-down', templateNodeClass: 'dayplan_recovery' },
    ],
  },
  {
    id: 'maker_day',
    label: 'Maker Day',
    icon: 'construct-outline',
    description: 'Long focus blocks, minimal context switching.',
    nodes: [
      { id: 'maker_prime', title: 'Prime context and goals', templateNodeClass: 'dayplan_routine' },
      { id: 'maker_block_a', title: 'Maker block A', templateNodeClass: 'dayplan_focus', isTask: true },
      { id: 'maker_block_b', title: 'Maker block B', templateNodeClass: 'dayplan_focus', isTask: true },
      { id: 'maker_block_c', title: 'Maker block C', templateNodeClass: 'dayplan_focus', isTask: true },
      { id: 'maker_logbook', title: 'Learning logbook', templateNodeClass: 'dayplan_review' },
    ],
  },
  {
    id: 'meeting_day',
    label: 'Meeting Day',
    icon: 'people-outline',
    description: 'Communication-heavy day with prep and follow-ups.',
    nodes: [
      { id: 'meeting_prep', title: 'Meeting prep batch', templateNodeClass: 'dayplan_ops', isTask: true },
      { id: 'meeting_blocks', title: 'Meetings', templateNodeClass: 'dayplan_meetings', isTask: true },
      { id: 'followups', title: 'Follow-ups and decisions', templateNodeClass: 'dayplan_ops', isTask: true },
      { id: 'next_actions', title: 'Define next actions', templateNodeClass: 'dayplan_review' },
    ],
  },
]
