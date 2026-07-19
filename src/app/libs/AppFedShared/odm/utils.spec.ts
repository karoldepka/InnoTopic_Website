import {describe, it, expect} from 'vitest'
import {odmTimestampToMillis, odmTimestampToDate} from './utils'

describe('odmTimestampToMillis', () => {
  it('converts a Firestore-Timestamp-like object (has toMillis())', () => {
    const fakeTimestamp = {toMillis: () => 1700000000000}
    expect(odmTimestampToMillis(fakeTimestamp)).toBe(1700000000000)
  })

  it('converts a Date', () => {
    const date = new Date('2024-01-15T00:00:00.000Z')
    expect(odmTimestampToMillis(date)).toBe(date.getTime())
  })

  it('converts a {seconds, nanoseconds} plain object', () => {
    expect(odmTimestampToMillis({seconds: 1700000000, nanoseconds: 500000000})).toBe(1700000000000 + 500)
  })

  it('converts an ISO string', () => {
    expect(odmTimestampToMillis('2024-01-15T00:00:00.000Z')).toBe(new Date('2024-01-15T00:00:00.000Z').getTime())
  })

  it('returns undefined for null/undefined/empty', () => {
    expect(odmTimestampToMillis(null)).toBeUndefined()
    expect(odmTimestampToMillis(undefined)).toBeUndefined()
  })

  it('returns undefined for an unparseable string', () => {
    expect(odmTimestampToMillis('not a date')).toBeUndefined()
  })

  it('returns undefined for a value of an unrecognized shape', () => {
    expect(odmTimestampToMillis(42)).toBeUndefined()
    expect(odmTimestampToMillis({})).toBeUndefined()
  })

  it('a later timestamp compares greater regardless of representation', () => {
    const earlier = odmTimestampToMillis('2024-01-01T00:00:00.000Z')!
    const later = odmTimestampToMillis({seconds: Math.floor(new Date('2024-06-01T00:00:00.000Z').getTime() / 1000), nanoseconds: 0})!
    expect(later).toBeGreaterThan(earlier)
  })
})

describe('odmTimestampToDate', () => {
  it('converts a live Firestore-Timestamp-like object (has toMillis())', () => {
    const fakeTimestamp = {toMillis: () => 1700000000000}
    expect(odmTimestampToDate(fakeTimestamp)).toEqual(new Date(1700000000000))
  })

  it('converts a plain {seconds, nanoseconds} object - e.g. one that lost its Timestamp ' +
    'prototype/toDate() in an IndexedDB structured-clone round-trip (the live crash this guards ' +
    'against: "X.toDate is not a function")', () => {
    expect(odmTimestampToDate({seconds: 1700000000, nanoseconds: 0})).toEqual(new Date(1700000000000))
  })

  it('returns null (never throws) for null/undefined/an unrecognized shape', () => {
    expect(odmTimestampToDate(null)).toBeNull()
    expect(odmTimestampToDate(undefined)).toBeNull()
    expect(odmTimestampToDate({})).toBeNull()
    expect(odmTimestampToDate('not a date')).toBeNull()
  })
})
