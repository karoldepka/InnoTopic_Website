export function splitAndTrim(string: string, splitMark: string | RegExp) {
    return string.split(splitMark)
      .map(
        chunk => chunk ?. trim()
      )
}

/** `M:SS`, e.g. a voice memo's recording length - shared between the playback scrubber
 * (VoiceMemoFieldComponent) and the "Uploading voice memo" sync-status text (BlobSyncService). */
export function formatDurationMmSs(totalSeconds: number): string {
  if (!isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00'
  }
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
