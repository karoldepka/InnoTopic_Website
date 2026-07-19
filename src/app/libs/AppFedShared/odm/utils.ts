export function dateToStringSuitableForId(nowDate: Date) {
  return nowDate.toISOString()
    .replace('T', '__')
    .replace(/:/g, '.')
}

export function getNowTimePointSuitableForId() {
  const nowDate = new Date()
  return dateToStringSuitableForId(nowDate)
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
