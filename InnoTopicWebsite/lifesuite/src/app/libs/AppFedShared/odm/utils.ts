export function dateToStringSuitableForId(nowDate: Date) {
  return nowDate.toISOString()
    .replace('T', '__')
    .replace(/:/g, '.')
}

/** Monotonic per-process counter, appended below so two ids generated within the same
 * millisecond are still guaranteed distinct - see `getNowTimePointSuitableForId()`'s doc comment
 * for why `Date`'s own millisecond resolution alone isn't enough. */
let idDisambiguatorCounter = 0

/** GH #122: a tight synchronous loop (e.g. bulk-accepting 100+ AI-generated Q&A items into Learn)
 * can call this many times within the same millisecond - `Date`'s millisecond resolution alone
 * doesn't guarantee distinct ids across those calls. A collision silently loses data twice over:
 * `OdmService2._ensureItemAdded()` only keeps the first item per id in memory (every later one
 * with the same id is dropped from `localItems$`, never shown anywhere), and the DB save is an
 * upsert keyed by that same id, so the last colliding write overwrites every earlier one there
 * too. Confirmed as the exact cause of #122 (121 accepted items collapsed to 7-8 survivors).
 * Appending a monotonic counter guarantees uniqueness without changing the id's existing
 * date-derived prefix (nothing in the app parses it back out, so there's no reason to change its
 * shape more than necessary). */
export function getNowTimePointSuitableForId() {
  const nowDate = new Date()
  idDisambiguatorCounter = (idDisambiguatorCounter + 1) % 1_000_000
  const counterSuffix = String(idDisambiguatorCounter).padStart(6, '0')
  return dateToStringSuitableForId(nowDate) + '_' + counterSuffix
}

/** Converts an `OdmTimestamp` (Firestore `Timestamp`, `Date`, or ISO string) to epoch millis,
 * for comparing "which of these two is newer" regardless of which shape it arrived in. */
export function odmTimestampToMillis(value: any): number | undefined {
  if (!value) {
    return undefined
  }
  if (typeof value.toMillis === 'function') {
    return value.toMillis()
  }
  if (value instanceof Date) {
    return value.getTime()
  }
  if (typeof value.seconds === 'number') {
    return value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1000000)
  }
  if (typeof value === 'string') {
    const millis = new Date(value).getTime()
    return Number.isNaN(millis) ? undefined : millis
  }
  return undefined
}

/** Same shape-tolerance as `odmTimestampToMillis()`, returning a `Date` instead - for templates
 * that used to call `.toDate()` directly on a `whenCreated`/`whenLastModified`-style field. That
 * throws ("X.toDate is not a function") whenever the value isn't a live Firestore `Timestamp`
 * instance - e.g. a plain `{seconds, nanoseconds}` object that a round-trip through IndexedDB's
 * structured clone (which drops the prototype/methods of any non-built-in class instance) or an
 * older/differently-migrated row can produce. Never throws; returns `null` for anything it can't
 * make sense of, same as a genuinely missing timestamp. */
export function odmTimestampToDate(value: any): Date | null {
  const millis = odmTimestampToMillis(value)
  return millis === undefined ? null : new Date(millis)
}
