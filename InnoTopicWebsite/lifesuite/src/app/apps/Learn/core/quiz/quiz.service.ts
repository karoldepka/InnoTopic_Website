import {Injectable} from '@angular/core';
import {LearnItemItemsService} from '../learn-item-items.service'

import {countBy} from 'lodash-es'
// import * as _ from "lodash";
// import {Observable} from 'rxjs'
import {combineLatest, Observable, timer} from 'rxjs'
import {ImportanceVal} from '../../models/LearnItem'
import {LearnItem$} from '../../models/LearnItem$'
import {debugLog} from '../../../../libs/AppFedShared/utils/log'
import {DurationMs, nullish, TimeMsEpoch} from '../../../../libs/AppFedShared/utils/type-utils'
import {CachedSubject} from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
import {countBy2} from '../../../../libs/AppFedShared/utils/utils'
import {hoursAsMs, isInFuture, secondsAsMs} from '../../../../libs/AppFedShared/utils/time/date-time-utils'
import {filter, map, shareReplay, tap} from 'rxjs/operators'
import {throttleTimeWithLeadingTrailing_ReallyThrottle} from '../../../../libs/AppFedShared/utils/rxUtils'
import {LocalOptionsPatchableObservable, OptionsService} from '../options.service'
import {Rating} from '../../models/fields/self-rating.model'
import {ImportanceDescriptors} from '../../models/fields/importance.model'
import {QuizIntervalCalculator} from './quiz-interval-calculator'
import {mentalEffortLevels} from '../../models/fields/mental-effort-level.model'
import {funLevels} from '../../models/fields/fun-level.model'
import {QuizItemChooser} from './quiz-item-chooser'
import {QuizStatus} from './QuizStatus'
import {QuizOptions} from './QuizOptions'
import {sidesDefsHintsArray} from '../sidesDefs'

/* TODO units; rename to DurationMs or TimeDurationMs;
*   !!! actually this is used as hours, confusingly! WARNING! */
export type Duration = number


export type CountsByImportance = { [key in keyof ImportanceDescriptors]: number}


@Injectable({
  providedIn: 'root'
})
export class QuizService {

  quizIntervalCalculator = new QuizIntervalCalculator()

  options2$ = new LocalOptionsPatchableObservable<QuizOptions>(
    new QuizOptions(false, true), 'QuizOptions'
  )

  private isNextItemRequested = true

  get options$(): CachedSubject<QuizOptions> {
    return this.options2$.locallyVisibleChanges$
  }

  showAnswer$ = new CachedSubject<boolean>(false)

  /** 0 = hidden; N = the first N hint sides (in sidesDefsHintsArray order) are revealed */
  showHint$ = new CachedSubject<number>(0)

  constructor(
    private learnDoService: LearnItemItemsService,
    private optionsService: OptionsService,
  ) {
    console.log('QuizService service constructor')
    // throw new Error(`QuizService service constructor`)
    this.nextItemRequests$.next()
  }

  setOptions(newOptions: QuizOptions) {
    this.options$.next(newOptions)
  }

  nextItemRequests$ = new CachedSubject<void>()

  /** TODO make into a member field to ensure no-one calls this spuriously by accident */
  readonly quizStatus$: Observable<QuizStatus> = combineLatest([
    // TODO:  take into account: this.isWaitingForNextItem = true ; and set to false once new item provided; might need to change approach to a more pull-based
    // https://stackoverflow.com/questions/50276165/combinelatest-deprecated-in-favor-of-static-combinelatest
    this.options$,
    (this.learnDoService.localItems$.pipe(
      // localItems$ is seeded with `[]` synchronously at construction, before the local-cache/
      // server load has actually run (see OdmService2.localItems$) - so its very first
      // replayed-on-subscribe value is indistinguishable from "genuinely empty collection".
      // Once quizStatus$ started emitting immediately (the #10 fix below), that pre-load `[]`
      // became visible as a real "0 items pending" status, surfacing as "No quiz item" instead
      // of "Loading Quiz..." (issue #23). Wait for the flag OdmService2.emitLocalItems() sets
      // once the initial load has actually completed at least once, so combineLatest doesn't
      // produce any status until then.
      filter(() => this.learnDoService.itemsLoaded),
      // Was debounceTime(4000): debounce only emits once the source goes quiet, so with the
      // collection's always-on realtime listener it could get reset indefinitely under active
      // sync (another device editing, the initial local-cache-then-server two-phase load
      // landing <4s apart, etc.) and never emit at all - permanently stuck "Loading Quiz...".
      // throttleTime with leading:true guarantees an immediate first value while still capping
      // recompute frequency to ~once per 4s under heavy churn.
      throttleTimeWithLeadingTrailing_ReallyThrottle(secondsAsMs(4))) as Observable<LearnItem$[]>
    ),
    combineLatest([
      timer(0, secondsAsMs(60) /* FIXME make the timer longer for performance/battery */),
      this.nextItemRequests$,
    ]),
  ]).pipe(map(([quizOptions, item$s]) => {
      // debugLog(`quizStatus$ combineLatest; FIXME this runs multiple times; use smth like publish() / shareReplay`)
      item$s = this.filterByOptions(quizOptions, item$s)

      let pendingItems = this.filterByIsPendingRepetition(item$s)

      const quizItemChooser = new QuizItemChooser(pendingItems, quizOptions)

      let chooserOutput = quizItemChooser.chooseItemFromPending()
      const nextItem$ = chooserOutput.item

      const retStatus = new QuizStatus(
        pendingItems.length,
        nextItem$,
        this.calculatePendingItemsTodayCount(item$s),
        nextItem$ ? isInFuture(this.calculateWhenNextRepetitionMsEpoch(nextItem$)) : undefined,
        undefined,
        countBy(pendingItems, (item$) => item$.getEffectiveImportanceId()) as CountsByImportance,
        countBy(item$s, (item$) => item$.getEffectiveImportanceId()) as CountsByImportance,
        chooserOutput.chooserParams
        // pendingItems[0] /* TODO: ensure sorted or minBy */,
      );

      return retStatus

      // return minBy(item$s,
      //   (item$: LearnItem$) => this.calculateWhenNextRepetitionMsEpoch(item$, quizOptions.dePrioritizeNewMaterial))
    }
  ), shareReplay(1))


  private calculatePendingItemsTodayCount(item$s: LearnItem$[]) {
    const endOfDayMs = Date.now() + hoursAsMs(12)
    const pendingItemsTodayCount = countBy2(item$s, item$ => {
      const msEpochRepetition = this.calculateWhenNextRepetitionMsEpoch(item$)
      return msEpochRepetition <= endOfDayMs
    }) /* If it's low, we could suggest adding new material, based on how much time user wants to spend per day */
    /* TODO: performance: make util method countMatchingAndSummarizeAndReturnFirst to not allocate array and not traverse twice
       summarize - estimatedTimeLeft
     */
    return pendingItemsTodayCount
  }

  /** Potentially move to QuizItemChooser or QuizItemsFilter... */
  private filterByIsPendingRepetition(item$s: LearnItem$[]) {
    // filter remaining until now
    const nowMs: TimeMsEpoch = Date.now()

    let pendingItems: LearnItem$[] = item$s.filter(item$ => {
      const msEpochRepetition = this.calculateWhenNextRepetitionMsEpoch(item$)
      // if ( ! (typeof msEpochRepetition === 'number') ) {
      //   return false
      // }
      return msEpochRepetition <= nowMs
    })
    return pendingItems
  }

  /** Potentially move to QuizItemChooser or QuizItemsFilter... */
  private filterByOptions(quizOptions: QuizOptions, item$s: LearnItem$[]) {

    // Category nodes are organizational only — never quizzed.
    item$s = item$s.filter(item => ! item.val?.isCategory)
    // AI-generated items can be optionally excluded from the quiz.
    if (quizOptions.skipAiGenerated) {
      item$s = item$s.filter(item => ! item.val?.isAiGenerated())
    }
    // ...or, inversely, the quiz can be restricted to *only* AI-generated items (GH #100).
    if (quizOptions.onlyAiGenerated) {
      item$s = item$s.filter(item => !! item.val?.isAiGenerated())
    }

    // FIXME: perf: one .filter() call, with multiple predicates
    if (quizOptions.onlyWithQA) {
      item$s = item$s.filter(item => item.val?.hasQAndA())
    } // TODO: performance - join the .filters
    if (quizOptions.skipTasks) {
      item$s = item$s.filter(item => !(item.val?.isTask))
    }
    // item$s = this.filterByMentalLevel(item$s)
    // item$s = this.filterByFunLevel(item$s)

    // slowest: last?
    item$s = item$s.filter(
      (item$) => {
        return item$.hasEffectiveFunLevelAtLeast(quizOptions.minFunLevel)
      }
    )
    item$s = item$s.filter(
      (item$) => {
        return item$.hasEffectiveImportanceLevelAtLeast(quizOptions.minImportanceLevel)
      }
    )
    item$s = this.filterByCategories(item$s, quizOptions)
    return item$s
  }

  /** too imperative style, but quick workaround for now, in the face of withLatestFrom approach not showing quiz item on page load */
  nextItem$WhenRequested: Observable<LearnItem$ | nullish> = this.quizStatus$.pipe(
    map(status => status?.nextItem$),
    filter((item) => !! item && this.isNextItemRequested /* hack (via external field) ? */),
    tap(() => {
      debugLog(`nextItem$WhenRequested ver2`)
      this.isNextItemRequested = false
    }),
    shareReplay(1),
  )

  /* ==== Approach with withLatestFrom - worked when pressing Apply&Next button, but NOT showing any quiz item at the loading of quiz page.
   * Maybe putting it with combineLatest with timer has already helped. Need testing. I leave it like that for now.
   * Need to get deeper into understanding semantics of when pipes before someone subscribes, multiple subscribers, and shareReplay(1) */
  // could combine the nextItemRequests$ with timer operator
  // nextItem$WhenRequested: Observable<LearnItem$ | undefined> = this.nextItemRequests$.pipe(
  //   tap(x => debugLog(`nextItemRequests$`, x)),
  //   shareReplay(1),
  //   withLatestFrom(this.quizStatus$.pipe(
  //     filter(status => !! status.nextItem$),
  //     tap(x => debugLog(`withLatestFrom filter`, x)),
  //     shareReplay(1),
  //   )),
  //   map((merged: [void, QuizStatus]) => merged[1].nextItem$),
  //   shareReplay(1),
  //   tap(x => debugLog(`nextItem$WhenRequested`, x))
  // )


  calculateWhenNextRepetitionMsEpoch(item$: LearnItem$): TimeMsEpoch {
    return item$?.quiz?.calculateWhenNextRepetitionMsEpoch(this.options$.lastVal)
  }

  calculateWhenNextRepetitionMsEpochOrNullish(item$: LearnItem$ | nullish): TimeMsEpoch | nullish {
    if ( ! item$ ) {
      return item$ as nullish
    }
    return this.calculateWhenNextRepetitionMsEpoch(item$)
  }


  calculateIntervalMs(rating: Rating, importance?: ImportanceVal): DurationMs {
    if ( importance ) { // TODO move this "if" into quizIntervalCalculator
      return this.quizIntervalCalculator.calculateIntervalMs(rating, this.options$?.lastVal !, importance)
    }
    return this.quizIntervalCalculator.calculateIntervalHours(rating, this.options$?.lastVal !)
  }

  toggleShowAnswer() {
    const showAnswer = ! this.showAnswer$.lastVal
    this.showAnswer$.next(showAnswer)
    this.showHint$.next(0)
  }

  toggleShowHint() {
    const nextLevel = (this.showHint$.lastVal ?? 0) + 1
    this.showHint$.next(nextLevel > sidesDefsHintsArray.length ? 0 : nextLevel)
  }

  onNewQuestion() {
    this.showAnswer$.next(false)
    this.showHint$.next(0)
  }

  requestNextItem() {
    debugLog(`QuizService: requestNextItem()`)
    this.isNextItemRequested = true
    this.nextItemRequests$.next()

    /// whatnext
  }

  /** Potentially move to QuizItemChooser or QuizItemsFilter... */
  private filterByCategories(item$s: LearnItem$[], quizOptions: QuizOptions) {
    const useRegex = !! quizOptions.useRegexFilters
    const trimAllFunc = (strings?: string[]) => strings ?. map(string => string ?.trim())
    // Regex mode: the whole field is one pattern - no comma-splitting (a literal comma is common
    // in real patterns, e.g. `\d{1,3}`) and no lowercasing (would corrupt case-sensitive escapes
    // like \D/\S/\W/\B; case-insensitivity comes from the 'i' flag downstream instead).
    const getArr = (inputStr?: string) => {
      const trimmed = inputStr ?. trim()
      if ( ! trimmed ) {
        return []
      }
      return useRegex ? [trimmed] : (trimAllFunc(trimmed.toLowerCase().split(',')) ?? [])
    }
    const filterCategories: string[] = getArr(quizOptions.categories)
    const textFilterStrings: string[] = getArr(quizOptions.textFilter)
    console.log(`textFilterStrings`, textFilterStrings) /* FIXME: this could be the slowdown during typing; as it prolly string-filters all thousands of items on every save */

    // const categories = [`health`, `interview`]
    // const categories = [
    //   `#codility`,
    //   `#interview`,
    //   // `angular`,
    //   // `js`,
    //   // `html`,
    //   // `web`,
    // ]
    // #Toptal
    // #ForInterview
    // sleep
    // health
    // strategy

    // note: not using word "tags" ; let's reserve this word for #SomeCategory hashtag occurrence maybe.
    if ( item$s ?. length && (filterCategories.length || textFilterStrings.length) ) {
      item$s = item$s.filter(
        (item$) => {
          // return true
          const hasAnyCategory = item$.hasAnyCategory(filterCategories, useRegex)
          // console.log('hasAnyCategory', hasAnyCategory, item$.val?.title, filterCategories)
          return hasAnyCategory && item$.matchesAnyFilterText(textFilterStrings, useRegex)
        }
      )
    }

    return item$s
  }

  /** Potentially move to QuizItemChooser or QuizItemsFilter... */
  private filterByMentalLevel(item$s: LearnItem$[]) {
    return item$s.filter(
      item$ =>
        item$.getEffectiveMentalEffort().numeric
        < mentalEffortLevels.somewhat_high.numeric
    )
  }

  /** Potentially move to QuizItemChooser or QuizItemsFilter... */
  private filterByFunLevel(item$s: LearnItem$[]) {
    return item$s.filter(
      item$ =>
        item$.getEffectiveFunLevel().numeric
        > funLevels.somewhat_high.numeric
    )
  }
}
