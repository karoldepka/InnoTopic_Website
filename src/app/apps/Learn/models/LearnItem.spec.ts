import { LearnItem } from './LearnItem'
import { OdmTimestamp } from '../../../libs/AppFedShared/odm/OdmBackend'

/** A cheap stand-in for a Firestore Timestamp — the helpers only check truthiness. */
const aTimestamp = { seconds: 1, nanoseconds: 0 } as unknown as OdmTimestamp

describe('LearnItem — AI / draft markers', () => {
  it('isAiGenerated reflects createdByAiAt', () => {
    const item = new LearnItem()
    expect(item.isAiGenerated()).toBe(false)
    item.createdByAiAt = aTimestamp
    expect(item.isAiGenerated()).toBe(true)
  })

  it('isDraft reflects draftedAt', () => {
    const item = new LearnItem()
    expect(item.isDraft()).toBe(false)
    item.draftedAt = aTimestamp
    expect(item.isDraft()).toBe(true)
  })

  it('AI-generated draft category is flagged on all three axes', () => {
    const item = new LearnItem()
    item.createdByAiAt = aTimestamp
    item.draftedAt = aTimestamp
    item.isCategory = true
    expect(item.isAiGenerated()).toBe(true)
    expect(item.isDraft()).toBe(true)
    expect(!!item.isCategory).toBe(true)
  })
})

describe('LearnItem — Q&A detection', () => {
  it('hasQAndA is true only once it has both a question and an answer', () => {
    const item = new LearnItem()
    expect(item.hasQAndA()).toBe(false)
    item.title = 'What is 2 + 2?'
    expect(item.hasQAndA()).toBe(false) // question but no answer yet
    item.answer = '4'
    expect(item.hasQAndA()).toBe(true)
  })

  it('getQuestion returns the title/question side text', () => {
    const item = new LearnItem()
    item.title = 'Capital of France?'
    item.answer = 'Paris'
    expect(item.getQuestion()).toBe('Capital of France?')
  })
})
