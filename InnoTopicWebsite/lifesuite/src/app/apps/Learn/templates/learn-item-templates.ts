export interface TemplateNodeDef {
  /** Human-readable ID; used in DB node ID: `<parent-id>_template_<id>` */
  id: string
  title: string
  /** Semantic class of this template-origin node, e.g. 'goal', 'action', 'review' */
  templateNodeClass: string
  isTask?: boolean
  children?: TemplateNodeDef[]
}

export interface TemplateDef {
  id: string
  label: string
  /** Ionic icon name */
  icon: string
  description?: string
  children: TemplateNodeDef[]
}

/** Maps templateNodeClass -> Ionic icon name */
export const TEMPLATE_NODE_CLASS_ICONS: Record<string, string> = {
  goal:        'flag',
  milestone:   'checkmark-circle',
  research:    'search',
  planning:    'map',
  execution:   'hammer',
  review:      'telescope',
  motivation:  'heart',
  obstacle:    'warning',
  action:      'flash',
  notes:       'document-text',
  practice:    'barbell',
  flashcard:   'school',
  habit:       'repeat',
  trigger:     'notifications',
  reward:      'trophy',
  default:     'layers',
}

export function getTemplateNodeClassIcon(templateNodeClass: string): string {
  return TEMPLATE_NODE_CLASS_ICONS[templateNodeClass] ?? TEMPLATE_NODE_CLASS_ICONS['default']
}

export const HARDCODED_TEMPLATES: TemplateDef[] = [
  {
    id: 'project',
    label: 'Project',
    icon: 'briefcase',
    description: 'Structured project with phases',
    children: [
      { id: 'research',  title: 'Research',  templateNodeClass: 'research',  isTask: true },
      { id: 'planning',  title: 'Planning',  templateNodeClass: 'planning',  isTask: true },
      { id: 'execution', title: 'Execution', templateNodeClass: 'execution', isTask: true },
      { id: 'review',    title: 'Review',    templateNodeClass: 'review',    isTask: true },
    ],
  },
  {
    id: 'goal',
    label: 'Goal',
    icon: 'flag',
    description: 'Goal with motivation, milestones and concrete actions',
    children: [
      { id: 'motivation', title: 'Motivation (why)',  templateNodeClass: 'motivation' },
      { id: 'milestones', title: 'Milestones',        templateNodeClass: 'milestone', isTask: true },
      { id: 'obstacles',  title: 'Obstacles & risks', templateNodeClass: 'obstacle' },
      { id: 'actions',    title: 'Actions',           templateNodeClass: 'action', isTask: true },
    ],
  },
  {
    id: 'study_topic',
    label: 'Study Topic',
    icon: 'school',
    description: 'Structured learning with notes, practice and flashcards',
    children: [
      { id: 'notes',      title: 'Notes',      templateNodeClass: 'notes' },
      { id: 'practice',   title: 'Practice',   templateNodeClass: 'practice', isTask: true },
      { id: 'flashcards', title: 'Flashcards', templateNodeClass: 'flashcard' },
    ],
  },
  {
    id: 'habit',
    label: 'Habit',
    icon: 'repeat',
    description: 'Habit loop: trigger, routine and reward',
    children: [
      { id: 'trigger', title: 'Trigger (cue)',    templateNodeClass: 'trigger' },
      { id: 'routine', title: 'Routine (action)', templateNodeClass: 'action', isTask: true },
      { id: 'reward',  title: 'Reward',           templateNodeClass: 'reward' },
    ],
  },
]
