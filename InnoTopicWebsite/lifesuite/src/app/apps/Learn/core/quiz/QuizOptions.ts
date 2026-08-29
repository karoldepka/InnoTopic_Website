import {funLevels, FunLevelVal} from '../../models/fields/fun-level.model'
import {importanceDescriptors} from '../../models/fields/importance.model'
import {ImportanceVal} from '../../models/LearnItem'
import type {ExperimentalQuizSchedulerMode} from './experimental-quiz-scheduler'

/** FIXME: keep in mind that if options existed, they will not be overridden, and will be missing fields; so should {...defaultOptions, ...options}*/
export class QuizOptions {
  constructor(
    public dePrioritizeNewMaterial: boolean,
    public onlyWithQA: boolean,
    public minFunLevel: FunLevelVal = funLevels.undefined,
    public powBaseX100: number = 300,
    public skipTasks: boolean = true,
    public scaleIntervalsByImportance = 1, // 0 .. 1 (0 no scale, 1: current default: scale per importance multiplier. >1 scale even more)
    public focusLevelProbabilities = 1, // 0 .. 1 (0 no scale, 1: current default: scale per importance multiplier. >1 scale even more)
    public categories = '',
    public textFilter = '',
    public minImportanceLevel: ImportanceVal = importanceDescriptors.undefined,
    /** Skip AI-generated items in the quiz (categories are always skipped regardless). */
    public skipAiGenerated: boolean = false,
    /** GH #100: the inverse of skipAiGenerated - quiz *only* AI-generated items, e.g. to review
     * freshly-generated questions specifically. Not mutually exclusive with skipAiGenerated at
     * the type level (both are just independent predicates in QuizService.filterByOptions()),
     * but enabling both together would always yield zero items - the UI doesn't currently guard
     * against that combination. */
    public onlyAiGenerated: boolean = false,
    /** GH #128: reads the question/answer aloud via the browser's SpeechSynthesis API. */
    public textToSpeechEnabled: boolean = false,
    /** When TTS is enabled, also reads the quiz item's categories before its question. */
    public textToSpeechCategoriesEnabled: boolean = false,
    /** Interpret `categories` as one case-insensitive regex instead of comma-separated substrings. */
    public useRegexCategories: boolean = false,
    /** Interpret `textFilter` as one case-insensitive regex instead of comma-separated substrings. */
    public useRegexTextFilter: boolean = false,
    /** Maximum number of simultaneously active items in the experimental working-set scheduler. */
    public experimentalWorkingSetSize: number = 20,
    /** Visible-star rating every item must reach before the experimental scheduler opens a new batch. */
    public experimentalMasteryStars: number = 2,
    /** Whether mastered items are replaced immediately or only after the whole batch is mastered. */
    public experimentalSchedulerMode: ExperimentalQuizSchedulerMode = 'strict-batches',
    /** Minimum time before an item shown in the experimental scheduler can be selected again. */
    public sameItemMinDelaySeconds: number = 60,
    // TODO: priorityByImportances: 0 .. 1 -- 0 - ignore importances, 1 - items of highest importance go first
    // in-between - probabilities
  ) {
  }
}
