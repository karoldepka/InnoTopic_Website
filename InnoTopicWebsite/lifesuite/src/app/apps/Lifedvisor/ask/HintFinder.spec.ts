import {HintFinder} from './HintFinder'
import {hint, LiHintImpl} from '../shared-with-testcafe/Hint'
import {Filter} from '../shared-with-testcafe/text_search/Filter'

function findMatchingHint(root: LiHintImpl, filter: Filter): LiHintImpl | undefined {
  if (root.matchesFilter(filter)) {
    return root
  }

  return root.ifYes
    ?.map(child => findMatchingHint(child, filter))
    .find((hint): hint is LiHintImpl => !!hint)
}

describe('HintFinder', () => {
  it('creates a separate result tree with each matching node promoted to a root', () => {
    const finder = new HintFinder()
    const filter = Filter.fromString('XYZZZ')
    const sourceMatch = findMatchingHint(finder.rootHint, filter)

    finder.applySearch(filter)

    expect(sourceMatch).toBeDefined()
    expect(finder.searchResultRoots.length).toBeGreaterThan(0)
    expect(finder.searchResultRoots.every(root => root.matchesFilter(filter))).toBeTrue()
    expect(finder.searchResultRoots).toContain(jasmine.objectContaining({effectiveTitle: sourceMatch?.effectiveTitle}))
    expect(finder.searchResultRoots.find(root => root.effectiveTitle === sourceMatch?.effectiveTitle))
      .not.toBe(sourceMatch)
  })

  it('promotes a shared matching node only once', () => {
    const finder = new HintFinder()
    const sharedMatch = hint({title: 'Shared matching hint'})
    finder.rootHint = hint({
      ifYes: [
        hint({title: 'First branch', ifYes: [sharedMatch]}),
        hint({title: 'Second branch', ifYes: [sharedMatch]}),
      ],
    })

    finder.applySearch(Filter.fromString('Shared matching hint'))

    expect(finder.searchResultRoots.length).toBe(1)
    expect(finder.searchResultRoots[0]).not.toBe(sharedMatch)
    expect(finder.searchResultRoots[0].effectiveTitle).toBe(sharedMatch.effectiveTitle)
  })

  it('does not create promoted roots for an empty search', () => {
    const finder = new HintFinder()

    finder.applySearch(Filter.NONE)

    expect(finder.searchResultRoots).toEqual([])
  })
})