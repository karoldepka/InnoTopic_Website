import {test, expect} from './fixtures'

/**
 * journal-voice-memo.spec.ts deliberately skips asserting on transcription itself, since the fake
 * audio device produces a synthetic tone (not words) and depends on a reachable Google speech
 * service. This test sidesteps both problems by stubbing out `window.SpeechRecognition` entirely
 * with a fake that fires a scripted interim result, then a final result, on its own timers - so it
 * exercises VoiceMemoFieldComponent's actual onresult/markForCheck wiring deterministically,
 * without depending on real STT accuracy or network reachability.
 *
 * Guards the live-transcription behavior specifically: the transcript should appear incrementally
 * *while still recording*, not only once after the recording stops.
 */
test('shows transcription live, while still recording, on a Journal field', async ({authenticatedPage: page}) => {
  await page.addInitScript(() => {
    class FakeSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ''
      onresult: ((event: any) => void) | null = null
      onerror: ((event: any) => void) | null = null
      onend: (() => void) | null = null
      private timers: ReturnType<typeof setTimeout>[] = []

      start() {
        this.timers.push(setTimeout(() => {
          const interimResult = Object.assign([{transcript: 'hello wor'}], {isFinal: false})
          this.onresult?.({resultIndex: 0, results: [interimResult]})
        }, 200))
        this.timers.push(setTimeout(() => {
          const finalResult = Object.assign([{transcript: 'hello world '}], {isFinal: true})
          this.onresult?.({resultIndex: 0, results: [finalResult]})
        }, 700))
      }

      stop() {
        this.timers.forEach(clearTimeout)
        this.onend?.()
      }
    }
    ;(window as any).SpeechRecognition = FakeSpeechRecognition
    ;(window as any).webkitSpeechRecognition = FakeSpeechRecognition
  })

  await page.goto('/journal/write/new')

  const voiceMemoField = page.locator('app-voice-memo-field').first()
  await expect(voiceMemoField).toBeVisible()
  const recordButton = voiceMemoField.locator('ion-button').first()
  const liveTranscript = voiceMemoField.locator('.voice-memo-live-transcript')

  await recordButton.click()
  await expect(voiceMemoField.locator('ion-icon[name="stop"]')).toBeVisible()

  // ---- Interim result should show up live, before the recording stops ----
  await expect(liveTranscript).toContainText('hello wor', {timeout: 5_000})
  await expect(voiceMemoField.locator('ion-icon[name="stop"]')).toBeVisible() // still recording

  // ---- Final result should replace it, still before stopping ----
  await expect(liveTranscript).toContainText('hello world', {timeout: 5_000})
  await expect(voiceMemoField.locator('ion-icon[name="stop"]')).toBeVisible() // still recording

  await recordButton.click() // stop
  await expect(liveTranscript).toBeHidden() // only shown while isRecording

  // ---- Clean up the recording this test created ----
  const memoRows = voiceMemoField.locator('.voice-memo-row')
  await expect(memoRows).toHaveCount(1, {timeout: 15_000})
  const memoRow = memoRows.first()
  await memoRow.locator('ion-button[title="Delete this recording"]').click()
  await page.locator('ion-alert').getByRole('button', {name: 'Delete'}).click()
  await expect(memoRows).toHaveCount(0)
})
