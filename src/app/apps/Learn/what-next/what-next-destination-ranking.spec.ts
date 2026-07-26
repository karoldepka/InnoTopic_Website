import {describe, it, expect} from 'vitest'
import {rankDestinations, WhatNextDestination} from './what-next-destination-ranking'

function d(id: string, label: string, note?: string): WhatNextDestination {
  return {id, label, note, route: '/' + id}
}

describe('rankDestinations', () => {
  const destinations = [d('a', 'Write Journal'), d('b', 'Mindfulness'), d('c', 'Do tasks')]

  it('with no search term and no usage history, keeps the caller-supplied order', () => {
    expect(rankDestinations(destinations, '', [])).toEqual(destinations)
  })

  it('with no search term, sorts most-recently-used first', () => {
    const ranked = rankDestinations(destinations, '', ['c', 'a'])
    expect(ranked.map(x => x.id)).toEqual(['c', 'a', 'b'])
  })

  it('items with no usage history sort after every used item, keeping their relative order', () => {
    const ranked = rankDestinations(destinations, '', ['b'])
    expect(ranked.map(x => x.id)).toEqual(['b', 'a', 'c'])
  })

  it('with a search term, fuzzy-matches on label', () => {
    const ranked = rankDestinations(destinations, 'journal', [])
    expect(ranked.map(x => x.id)).toEqual(['a'])
  })

  it('with a search term, also matches on note', () => {
    const withNote = [d('a', 'Craving fun Panic Button', '(Quiz/Tasks)'), d('b', 'Mindfulness')]
    const ranked = rankDestinations(withNote, 'quiz', [])
    expect(ranked.map(x => x.id)).toEqual(['a'])
  })

  it('a search term matching nothing returns an empty array', () => {
    expect(rankDestinations(destinations, 'xyzzy-nonexistent', [])).toEqual([])
  })

  it('ignores usage history entirely while actively searching (search relevance wins, not MRU)', () => {
    // 'b' (Mindfulness) is MRU-first, but the search term only matches 'a'.
    const ranked = rankDestinations(destinations, 'journal', ['b', 'a'])
    expect(ranked.map(x => x.id)).toEqual(['a'])
  })
})
