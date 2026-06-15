import { Injectable } from '@angular/core';
import {LearnItemItemsService} from './learn-item-items.service'
import {LearnItem$} from '../models/LearnItem$'
import {map, shareReplay} from 'rxjs/operators'
import {BehaviorSubject, Observable} from 'rxjs'
import {findPreferred} from '../../../libs/AppFedShared/utils/cachedSubject2/collectionUtils'
import {countBy} from 'lodash-es'
import {LearnItem} from '../models/LearnItem'
import {sidesDefsArray} from './sidesDefs'
import {stripHtml} from '../../../libs/AppFedShared/utils/html-utils'
import {AiBackendService} from './ai-backend.service'

export interface FillQuestionsWithAiProgress {
  running: boolean
  total: number
  done: number
  filled: number
  errors: number
  percent: number
  currentQuestion?: string
  lastError?: string
}

const emptyFillQuestionsProgress: FillQuestionsWithAiProgress = {
  running: false,
  total: 0,
  done: 0,
  filled: 0,
  errors: 0,
  percent: 0,
}

@Injectable({
  providedIn: 'root'
})
export class ItemProcessingService {

  fillQuestionsWithAiProgress$ = new BehaviorSubject<FillQuestionsWithAiProgress>(emptyFillQuestionsProgress)

  constructor(
    private learnDoService: LearnItemItemsService,
    private aiBackend: AiBackendService,
  ) {
    console.log('ItemProcessingService service constructor')
  }

  nextItemToProcess$: Observable<LearnItem$ | undefined> = this.learnDoService.localItems$.pipe(
      map(item$s => {
        // return item$s ?. find(item$ => item$ ?. currentVal ?. needsProcessing())
        return this.findItemForProcessing(item$s)

      }, shareReplay(1)
    )
  )

  private findItemForProcessing(item$s?: LearnItem$[]): LearnItem$ | undefined {
    if ( ! item$s ) {
      return undefined
    }
    return findPreferred(item$s,
      // item$ => item$?.currentVal?.hasAudio ?? false,
      item$ => item$?.currentVal?.needsProcessing() ?? false,
      // item$ => true,
      [
        (item$1, item$2) => item$2.getEffectiveImportanceNumeric() - item$1.getEffectiveImportanceNumeric(),
        (item$1, item$2) => (item$2?.currentVal?.hasAudio ? 1 : 0) - (item$1?.currentVal?.hasAudio ? 1 : 0),
      ]
    )
  }

  /* this later could be by category */
  public getNextItemToProcess(): LearnItem$ | undefined {

    const found = this.findItemForProcessing(this.learnDoService.localItems$.lastVal)
    console.log(`found`, found)
    return found
  }

  public getCountsByImportance() {
    return countBy(
      this.getItemsNeedingProcessing() ?? [],
      (item$: LearnItem$) => item$.getEffectiveImportanceShortId()
    )
  }

  public getItemsNeedingProcessing() {
    return this.learnDoService.localItems$.lastVal?.filter(
      item => item.currentVal?.needsProcessing()
    )
  }

  getCountNeedingProcessing() {
    return this.getItemsNeedingProcessing()?.length
  }

  public getQuestionsWithoutAnswers() {
    return this.learnDoService.localItems$.lastVal?.filter(item$ => this.isQuestionWithoutAnswer(item$)) ?? []
  }

  public getCountQuestionsWithoutAnswers() {
    return this.getQuestionsWithoutAnswers().length
  }

  public async fillQuestionsWithoutAnswersWithAi() {
    if (this.fillQuestionsWithAiProgress$.value.running) {
      return
    }

    const itemsToFill = this.getQuestionsWithoutAnswers()
    this.setFillQuestionsProgress({
      ...emptyFillQuestionsProgress,
      running: true,
      total: itemsToFill.length,
    })

    for (const item$ of itemsToFill) {
      const item = item$.currentVal
      const question = this.getQuestionForAi(item)
      this.setFillQuestionsProgress({
        currentQuestion: question,
      })

      try {
        const filled = await this.fillAnswerWithAi(item$)
        this.setFillQuestionsProgress({
          done: this.fillQuestionsWithAiProgress$.value.done + 1,
          filled: this.fillQuestionsWithAiProgress$.value.filled + (filled ? 1 : 0),
        })
      } catch (e) {
        console.error('Error filling question with AI', e)
        this.setFillQuestionsProgress({
          done: this.fillQuestionsWithAiProgress$.value.done + 1,
          errors: this.fillQuestionsWithAiProgress$.value.errors + 1,
          lastError: (e as any)?.message || `${e}`,
        })
      }
    }

    this.setFillQuestionsProgress({
      running: false,
      currentQuestion: undefined,
    })
  }

  public async fillAnswerWithAi(item$: LearnItem$): Promise<boolean> {
    if (!this.isQuestionWithoutAnswer(item$)) {
      return false
    }

    const item = item$.currentVal
    const response = await this.aiBackend.generateAnswerWithWebSearch(
      this.getQuestionForAi(item),
      this.getContextForAi(item),
    ).toPromise()
    const modelName = response?.modelName || 'unknown-model'
    const answer = this.withFilledByAiMarker(response?.answer || '', modelName)
    item$.patchThrottled({answer})
    return true
  }

  private setFillQuestionsProgress(patch: Partial<FillQuestionsWithAiProgress>) {
    const next = {
      ...this.fillQuestionsWithAiProgress$.value,
      ...patch,
    }
    next.percent = next.total ? Math.round((next.done / next.total) * 100) : 0
    this.fillQuestionsWithAiProgress$.next(next)
  }

  public isQuestionWithoutAnswer(item$: LearnItem$): boolean {
    const item = item$.currentVal
    if (!item || item.isTask || item.whenDeleted || item.isDeleted) {
      return false
    }

    const filledSides = sidesDefsArray.filter(side => {
      const val = item.getSideVal(side)
      return !!(stripHtml(val || '') || '').trim()
    })

    return filledSides.length > 0
      && filledSides.every(side => side.id === 'title' || side.id === 'question')
  }

  private getQuestionForAi(item?: LearnItem | null) {
    return (stripHtml(item?.getQuestion?.() || item?.title || '') || '').trim()
  }

  private getContextForAi(item?: LearnItem | null) {
    return (stripHtml(item?.joinedSides?.() || '') || '').trim()
  }

  private withFilledByAiMarker(answer: string, modelName: string) {
    const trimmed = (answer || '').trim()
    const marker = `#FilledByAI:(${modelName})`
    return trimmed.includes(marker) ? trimmed : `${trimmed}\n\n${marker}`.trim()
  }
}
