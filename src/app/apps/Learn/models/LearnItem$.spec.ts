import { LearnItem$ } from './LearnItem$'
import { LearnItem } from './LearnItem'
import { importanceDescriptors } from './fields/importance.model'
import { funLevels, funLevelsDescriptors } from './fields/fun-level.model'
import { mentalEffortLevels } from './fields/mental-effort-level.model'
import { OdmBackend } from '../../../libs/AppFedShared/odm/OdmBackend'

const aTimestamp = { seconds: 1, nanoseconds: 0 } as unknown as ReturnType<typeof OdmBackend.nowTimestamp>

function makeFakeService(): any {
  return {
    className: 'LearnItem',
    throttleSaveToDbMs: 3000,
    throttleIntervalMs: 500,
    treeRootItemId: 'ROOT',
    saveNowToDb: jasmine.createSpy('saveNowToDb'),
    emitLocalItems: jasmine.createSpy('emitLocalItems'),
    itemHistoryService: { onPatch: jasmine.createSpy('onPatch') },
    syncStatusService: { handleSavingPromise: jasmine.createSpy('handleSavingPromise') },
    authService: { authUser$: { lastVal: { uid: 'user-1' } } },
  }
}

/** Construct a LearnItem$ with a real LearnItem data instance so methods like matchesSearch() work. */
function makeItem$(svc: any, data?: Partial<LearnItem>, parents?: LearnItem$[], id?: string): LearnItem$ {
  const learnItem = Object.assign(new LearnItem(), data ?? {})
  return new LearnItem$(svc, id as any, learnItem, parents as any)
}

// ---------------------------------------------------------------------------

describe('LearnItem$ — getEffectiveImportance()', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('falls back to importanceDescriptors.undefined when no importance is set', () => {
    const item$ = makeItem$(svc, {})
    expect(item$.getEffectiveImportance()).toBe(importanceDescriptors.undefined)
  })

  it('returns importance when importanceCurrent is absent', () => {
    const item$ = makeItem$(svc, { importance: importanceDescriptors.high })
    expect(item$.getEffectiveImportance()).toBe(importanceDescriptors.high)
  })

  it('importanceCurrent takes priority over importance', () => {
    const item$ = makeItem$(svc, {
      importance: importanceDescriptors.low,
      importanceCurrent: importanceDescriptors.very_high,
    })
    expect(item$.getEffectiveImportance()).toBe(importanceDescriptors.very_high)
  })

  it('de field yields low importance (language hack)', () => {
    const item$ = makeItem$(svc, { de: 'Hund' })
    expect(item$.getEffectiveImportance()).toBe(importanceDescriptors.low)
  })

  it('en field yields medium importance', () => {
    const item$ = makeItem$(svc, { en: 'Dog' })
    expect(item$.getEffectiveImportance()).toBe(importanceDescriptors.medium)
  })

  it('de field takes priority over en when both present', () => {
    const item$ = makeItem$(svc, { de: 'Hund', en: 'Dog' })
    expect(item$.getEffectiveImportance()).toBe(importanceDescriptors.low)
  })

  it('getEffectiveImportanceNumeric returns numeric value of effective importance', () => {
    const item$ = makeItem$(svc, { importance: importanceDescriptors.high })
    expect(item$.getEffectiveImportanceNumeric()).toBe(importanceDescriptors.high.numeric)
  })
})

// ---------------------------------------------------------------------------

describe('LearnItem$ — getEffectiveFunLevel() / getEffectiveMentalEffort()', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('getEffectiveFunLevel falls back to undefined descriptor when funEstimate not set', () => {
    const item$ = makeItem$(svc, {})
    expect(item$.getEffectiveFunLevel()).toBe(funLevelsDescriptors.descriptors.undefined)
  })

  it('getEffectiveFunLevel returns funEstimate when set', () => {
    const item$ = makeItem$(svc, { funEstimate: funLevels.high })
    expect(item$.getEffectiveFunLevel()).toBe(funLevels.high)
  })

  it('getEffectiveMentalEffort falls back to undefined descriptor when mentalLevelEstimate not set', () => {
    const item$ = makeItem$(svc, {})
    expect(item$.getEffectiveMentalEffort()).toBe(mentalEffortLevels.undefined)
  })

  it('getEffectiveMentalEffort returns mentalLevelEstimate when set', () => {
    const item$ = makeItem$(svc, { mentalLevelEstimate: mentalEffortLevels.high })
    expect(item$.getEffectiveMentalEffort()).toBe(mentalEffortLevels.high)
  })
})

// ---------------------------------------------------------------------------

describe('LearnItem$ — getRoi()', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('returns undefined when there is no time estimate', () => {
    const item$ = makeItem$(svc, { importance: importanceDescriptors.high })
    expect(item$.getRoi()).toBeUndefined()
  })

  it('returns undefined when there is no importance set', () => {
    const item$ = makeItem$(svc, { time_estimate: '1h' })
    expect(item$.getRoi()).toBeUndefined()
  })

  it('calculates importance.numeric / durationMs when both are present', () => {
    const item$ = makeItem$(svc, {
      importance: importanceDescriptors.medium, // numeric = 5
      time_estimate: '1h',                      // 3 600 000 ms
    })
    const roi = item$.getRoi()
    expect(roi).toBeDefined()
    expect(roi as number).toBeGreaterThan(0)
    expect(roi as number).toBeCloseTo(5 / (60 * 60 * 1000), 15)
  })
})

// ---------------------------------------------------------------------------

describe('LearnItem$ — getEffectiveCategories()', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('returns empty string when no categories exist anywhere in the chain', () => {
    const item$ = makeItem$(svc, {})
    expect(item$.getEffectiveCategories()).toBe('')
  })

  it('includes the item's own categories', () => {
    const item$ = makeItem$(svc, { categories: 'Polish' })
    expect(item$.getEffectiveCategories()).toContain('Polish')
  })

  it('walks up the parent chain and accumulates categories', () => {
    const parent$ = makeItem$(svc, { categories: 'Spanish' }, undefined, 'parent')
    const child$  = makeItem$(svc, { categories: 'Vocabulary' }, [parent$], 'child')
    const result = child$.getEffectiveCategories()
    expect(result).toContain('Vocabulary')
    expect(result).toContain('Spanish')
  })

  it('returns only parent categories when the child has none of its own', () => {
    const parent$ = makeItem$(svc, { categories: 'German' }, undefined, 'parent')
    const child$  = makeItem$(svc, {}, [parent$], 'child')
    expect(child$.getEffectiveCategories()).toContain('German')
  })
})

// ---------------------------------------------------------------------------

describe('LearnItem$ — matchesAnyFilterText() / hasAnyCategory()', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('matchesAnyFilterText returns true for an empty filter list', () => {
    const item$ = makeItem$(svc, { title: 'Hello' })
    expect(item$.matchesAnyFilterText([])).toBe(true)
  })

  it('matchesAnyFilterText returns true when at least one filter matches', () => {
    const item$ = makeItem$(svc, { title: 'What is TypeScript?' })
    expect(item$.matchesAnyFilterText(['typescript'])).toBe(true)
  })

  it('matchesAnyFilterText returns false when no filter matches', () => {
    const item$ = makeItem$(svc, { title: 'Angular components' })
    expect(item$.matchesAnyFilterText(['react', 'vue'])).toBe(false)
  })

  it('hasAnyCategory returns true for an empty category list', () => {
    const item$ = makeItem$(svc, {})
    expect(item$.hasAnyCategory([])).toBe(true)
  })

  it('hasAnyCategory returns true when the item has the searched category (case-insensitive)', () => {
    const item$ = makeItem$(svc, { categories: 'Polish, Verbs' })
    expect(item$.hasAnyCategory(['polish'])).toBe(true)
  })

  it('hasAnyCategory returns false when the item does not have any of the searched categories', () => {
    const item$ = makeItem$(svc, { categories: 'Polish' })
    expect(item$.hasAnyCategory(['spanish', 'german'])).toBe(false)
  })
})

// ---------------------------------------------------------------------------

describe('LearnItem$ — hasEffectiveFunLevelAtLeast() / hasEffectiveImportanceLevelAtLeast()', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('hasEffectiveFunLevelAtLeast returns true when min is the undefined sentinel', () => {
    const item$ = makeItem$(svc, {})
    expect(item$.hasEffectiveFunLevelAtLeast(funLevels.undefined)).toBe(true)
  })

  it('hasEffectiveFunLevelAtLeast returns true when item fun ≥ min fun', () => {
    const item$ = makeItem$(svc, { funEstimate: funLevels.high }) // numeric = 10
    expect(item$.hasEffectiveFunLevelAtLeast(funLevels.medium)).toBe(true)
  })

  it('hasEffectiveFunLevelAtLeast returns false when item fun < min fun', () => {
    const item$ = makeItem$(svc, { funEstimate: funLevels.low }) // numeric = 2
    expect(item$.hasEffectiveFunLevelAtLeast(funLevels.high)).toBe(false) // numeric = 10
  })

  it('hasEffectiveImportanceLevelAtLeast returns true when min is the undefined sentinel', () => {
    const item$ = makeItem$(svc, {})
    expect(item$.hasEffectiveImportanceLevelAtLeast(importanceDescriptors.undefined)).toBe(true)
  })

  it('hasEffectiveImportanceLevelAtLeast returns true when item importance ≥ min', () => {
    const item$ = makeItem$(svc, { importance: importanceDescriptors.high })
    expect(item$.hasEffectiveImportanceLevelAtLeast(importanceDescriptors.low)).toBe(true)
  })

  it('hasEffectiveImportanceLevelAtLeast returns false when item importance < min', () => {
    const item$ = makeItem$(svc, { importance: importanceDescriptors.low })
    expect(item$.hasEffectiveImportanceLevelAtLeast(importanceDescriptors.high)).toBe(false)
  })
})

// ---------------------------------------------------------------------------

describe('LearnItem$ — setNewSelfRating()', () => {
  let svc: any
  beforeEach(() => {
    svc = makeFakeService()
    spyOn(OdmBackend, 'nowTimestamp').and.returnValue(aTimestamp)
  })

  it('saves the rating as-is when there is no prior rating (no boost)', () => {
    const item$ = makeItem$(svc, {}, undefined, 'i')
    item$.setNewSelfRating(1.5 as any)
    expect(item$.currentVal?.lastSelfRating).toBe(1.5)
    expect(item$.currentVal?.selfRatingsCount).toBe(1)
  })

  it('no boost when new rating < 2, even if previous rating was ≥ 2', () => {
    const item$ = makeItem$(svc, { lastSelfRating: 2 as any, selfRatingsCount: 1 as any }, undefined, 'i')
    item$.setNewSelfRating(1.5 as any)
    expect(item$.currentVal?.lastSelfRating).toBe(1.5)
  })

  it('applies confidence boost (+1) when new rating = 2 and previous ≥ 2', () => {
    // boost: newEffective = previousRating (2) + 1 = 3
    const item$ = makeItem$(svc, { lastSelfRating: 2 as any, selfRatingsCount: 1 as any }, undefined, 'i')
    item$.setNewSelfRating(2 as any)
    expect(item$.currentVal?.lastSelfRating).toBe(3)
  })

  it('applies confidence boost (+2) when new rating = 2.5 and previous ≥ 2', () => {
    // boost: newEffective = previousRating (3) + 2 = 5
    const item$ = makeItem$(svc, { lastSelfRating: 3 as any, selfRatingsCount: 2 as any }, undefined, 'i')
    item$.setNewSelfRating(2.5 as any)
    expect(item$.currentVal?.lastSelfRating).toBe(5)
  })

  it('increments selfRatingsCount on each call', () => {
    const item$ = makeItem$(svc, { selfRatingsCount: 3 as any }, undefined, 'i')
    item$.setNewSelfRating(1 as any)
    expect(item$.currentVal?.selfRatingsCount).toBe(4)
  })
})
