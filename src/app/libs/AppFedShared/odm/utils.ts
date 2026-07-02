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
