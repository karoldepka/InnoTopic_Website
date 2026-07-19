import {describe, it, expect} from 'vitest'
import {fieldVirtualNodeId, isSlotVisible, slotDescriptorMatchesSearch, SlotDescriptor} from './SlotDescriptor'

function descriptor(overrides: Partial<SlotDescriptor> = {}): SlotDescriptor {
  return {id: 'mood', label: 'Mood', kind: 'numeric', dataFieldKey: 'mood', ...overrides}
}

describe('fieldVirtualNodeId', () => {
  it('joins the parent item id and slot id with the GH #89 `_field_` convention', () => {
    expect(fieldVirtualNodeId('abcdefgh', 'mood')).toBe('abcdefgh_field_mood')
  })
})

describe('isSlotVisible', () => {
  it('a bare slot (kind: slot) is always visible regardless of item value', () => {
    expect(isSlotVisible(descriptor({kind: 'slot', dataFieldKey: undefined}), undefined)).toBe(true)
    expect(isSlotVisible(descriptor({kind: 'slot', dataFieldKey: undefined}), {})).toBe(true)
  })

  it('an isShortListed descriptor is always visible even with no value', () => {
    expect(isSlotVisible(descriptor({isShortListed: true}), undefined)).toBe(true)
    expect(isSlotVisible(descriptor({isShortListed: true}), {})).toBe(true)
  })

  it('a non-shortlisted descriptor with no value and not manually added is hidden', () => {
    expect(isSlotVisible(descriptor(), undefined)).toBe(false)
    expect(isSlotVisible(descriptor(), {})).toBe(false)
    expect(isSlotVisible(descriptor(), {mood: undefined})).toBe(false)
  })

  it('a text/scalar field with a non-empty trimmed string value is visible', () => {
    expect(isSlotVisible(descriptor({kind: 'text', dataFieldKey: 'general'}), {general: 'hello'})).toBe(true)
    expect(isSlotVisible(descriptor({kind: 'text', dataFieldKey: 'general'}), {general: '   '})).toBe(false)
    expect(isSlotVisible(descriptor({kind: 'text', dataFieldKey: 'general'}), {general: ''})).toBe(false)
  })

  it('a numeric composite {numVal, comment} counts as filled if either half is set', () => {
    expect(isSlotVisible(descriptor(), {mood: {numVal: 5}})).toBe(true)
    expect(isSlotVisible(descriptor(), {mood: {comment: 'a note'}})).toBe(true)
    expect(isSlotVisible(descriptor(), {mood: {numVal: 0}})).toBe(true) // 0 is a real rating, not "unset"
  })

  it('a numeric composite left as an empty {} (e.g. after clearing) does NOT count as filled', () => {
    expect(isSlotVisible(descriptor(), {mood: {}})).toBe(false)
    expect(isSlotVisible(descriptor(), {mood: {numVal: null, comment: ''}})).toBe(false)
  })

  it('a descriptor listed in manuallyAddedSlotIds is visible even with no value', () => {
    expect(isSlotVisible(descriptor(), {manuallyAddedSlotIds: ['mood']})).toBe(true)
    expect(isSlotVisible(descriptor(), {manuallyAddedSlotIds: ['something-else']})).toBe(false)
  })
})

describe('slotDescriptorMatchesSearch', () => {
  it('matches on id, label, and searchTerms case-insensitively', () => {
    const d = descriptor({id: 'mood', label: 'Mood', searchTerms: ['happiness']})
    expect(slotDescriptorMatchesSearch(d, 'MOOD')).toBe(true)
    expect(slotDescriptorMatchesSearch(d, 'happiness')).toBe(true)
    expect(slotDescriptorMatchesSearch(d, 'unrelated')).toBe(false)
  })

  it('an empty/whitespace search matches everything', () => {
    expect(slotDescriptorMatchesSearch(descriptor(), '')).toBe(true)
    expect(slotDescriptorMatchesSearch(descriptor(), '   ')).toBe(true)
  })
})
