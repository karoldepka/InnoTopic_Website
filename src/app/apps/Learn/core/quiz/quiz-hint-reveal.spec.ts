import {describe, it, expect} from 'vitest'
import {QuizService} from './quiz.service'
import {sidesDefsHintsArray} from '../sidesDefs'

/** Mock standing in for LearnItemItemsService - QuizService's constructor only touches
 * nextItemRequests$ synchronously; quizStatus$ (not exercised by these tests) is what actually
 * needs localItems$/itemsLoaded. */
function makeFakeLearnDoService() {
  return {
    localItems$: {pipe: () => ({subscribe: () => ({unsubscribe(){}})})},
    itemsLoaded: false,
  }
}

describe('QuizService — progressive hint reveal (issue #36)', () => {
  it('reveals hint sides one at a time per click, then wraps back to hidden', () => {
    const quizService = new QuizService(makeFakeLearnDoService() as any, {} as any)

    expect(quizService.showHint$.lastVal).toBe(0)

    quizService.toggleShowHint()
    expect(quizService.showHint$.lastVal).toBe(1)

    quizService.toggleShowHint()
    expect(quizService.showHint$.lastVal).toBe(2)
    expect(quizService.showHint$.lastVal).toBe(sidesDefsHintsArray.length)

    // one more click than there are hint sides wraps back to hidden
    quizService.toggleShowHint()
    expect(quizService.showHint$.lastVal).toBe(0)
  })

  it('resets the hint level when the answer is toggled or a new question starts', () => {
    const quizService = new QuizService(makeFakeLearnDoService() as any, {} as any)

    quizService.toggleShowHint()
    quizService.toggleShowHint()
    expect(quizService.showHint$.lastVal).toBe(2)

    quizService.toggleShowAnswer()
    expect(quizService.showHint$.lastVal).toBe(0)

    quizService.toggleShowHint()
    expect(quizService.showHint$.lastVal).toBe(1)

    quizService.onNewQuestion()
    expect(quizService.showHint$.lastVal).toBe(0)
  })
})

describe('QuizItemDetailsComponent.getVisibleHintSides (issue #36)', () => {
  const fakeHintSides = [{id: 'hint'}, {id: 'hint_2'}] as any

  function getVisibleHintSides(itemVal: any, hintLevel: number | undefined | null) {
    return (itemVal?.getSidesWithHints() ?? []).slice(0, hintLevel ?? 0)
  }

  it('shows only the first hint side at level 1, and both at level 2', () => {
    const itemVal = {getSidesWithHints: () => fakeHintSides}

    expect(getVisibleHintSides(itemVal, 0)).toEqual([])
    expect(getVisibleHintSides(itemVal, 1)).toEqual([fakeHintSides[0]])
    expect(getVisibleHintSides(itemVal, 2)).toEqual(fakeHintSides)
  })

  it('returns an empty array when there is no item value yet', () => {
    expect(getVisibleHintSides(undefined, 1)).toEqual([])
  })
})
