import {test, expect} from './fixtures'

/**
 * Drives the actual mic/playback/delete UI end-to-end against a real signed-in session and a
 * real Supabase Storage backend - Chrome's `--use-fake-device-for-media-stream` (see
 * playwright.config.ts) makes `getUserMedia()`/`MediaRecorder` capture a real (synthetic) audio
 * stream instead of erroring or needing a physical mic, so the whole record -> upload -> list ->
 * play -> delete pipeline gets exercised for real, not mocked.
 *
 * Deliberately doesn't assert on live transcription (SpeechRecognition): it needs real speech
 * (the fake audio device produces a synthetic tone, not words) and a reachable Google speech
 * service, neither of which this test can guarantee - see VoiceMemoFieldComponent's own doc
 * comments on why that's treated as best-effort everywhere else too.
 *
 * Leaves the created Journal entry behind under the test account (no "delete entry" UI exists
 * to clean it up with) - the recording itself IS deleted by the end of the test.
 */
test('record, play back, and delete a voice memo on a Journal field', async ({authenticatedPage: page}) => {
  await page.goto('/journal/write/new')

  // The 'general' field is always the first-rendered text field (and the only voice-memo-field
  // in the DOM at all on a fresh load - the numeric-ratings section starts collapsed and doesn't
  // render its own mic controls until "Show All"/"Show core ratings" is toggled).
  const voiceMemoField = page.locator('app-voice-memo-field').first()
  await expect(voiceMemoField).toBeVisible()

  const recordButton = voiceMemoField.locator('ion-button').first()
  const memoRows = voiceMemoField.locator('.voice-memo-row')

  // ---- Record ----
  await recordButton.click()
  await expect(voiceMemoField.locator('ion-icon[name="stop"]')).toBeVisible()
  await page.waitForTimeout(1500) // let the fake audio device capture a non-trivial amount of audio
  await recordButton.click()

  // Uploading to Supabase Storage is a real network round-trip - give it real time.
  await expect(memoRows).toHaveCount(1, {timeout: 15_000})
  const memoRow = memoRows.first()
  await expect(memoRow.locator('.voice-memo-meta')).toContainText(/ago|just now/)
  await expect(memoRow.locator('ion-icon[name="play"]')).toBeVisible()

  // ---- Play ----
  const playButton = memoRow.locator('ion-button').first()
  await playButton.click()
  await expect(memoRow.locator('ion-icon[name="stop"]')).toBeVisible()
  await expect(memoRow.locator('ion-range')).toBeVisible()
  await page.waitForTimeout(500)
  await playButton.click() // stop playback before deleting
  await expect(memoRow.locator('ion-icon[name="play"]')).toBeVisible()

  // ---- Delete, then Undo ----
  // Click the ion-button itself (title-scoped, robust to icon markup changes) - clicking the
  // inner ion-icon directly is flaky, since Ionic's own ion-button intercepts the pointer event.
  await memoRow.locator('ion-button[title="Delete this recording"]').click()
  const alert = page.locator('ion-alert')
  await expect(alert).toBeVisible()
  await alert.locator('button', {hasText: 'Delete'}).click()
  await expect(memoRows).toHaveCount(0)

  const toast = page.locator('ion-toast')
  await expect(toast).toBeVisible()
  await toast.locator('button', {hasText: 'Undo'}).click()
  await expect(memoRows).toHaveCount(1) // restored - the physical delete never happened

  // ---- Delete for real (let the undo toast time out without tapping it) ----
  // Click the ion-button itself (title-scoped, robust to icon markup changes) - clicking the
  // inner ion-icon directly is flaky, since Ionic's own ion-button intercepts the pointer event.
  await memoRow.locator('ion-button[title="Delete this recording"]').click()
  await expect(alert).toBeVisible()
  await alert.locator('button', {hasText: 'Delete'}).click()
  await expect(memoRows).toHaveCount(0)
  await expect(toast).toBeVisible()
  await expect(toast).toBeHidden({timeout: 10_000}) // 6s auto-dismiss + margin
  await expect(memoRows).toHaveCount(0) // still gone - confirms the toast dismissal actually triggered the real delete
})
