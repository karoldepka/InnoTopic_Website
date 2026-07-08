import {test, expect} from './fixtures'

/**
 * Drives the voice memo on a Learn item's "question" side (`item-side.component.html`'s
 * `<app-voice-memo-field [fieldId]="side.id">`), reached by creating a new blank Learn item.
 * Uses the same fake-audio-device pipeline as journal-voice-memo.spec.ts - see that file's doc
 * comment for why transcription assertions are deliberately skipped.
 *
 * Leaves the created Learn item behind under the test account (no "delete item" e2e flow exists) -
 * the recording itself IS deleted by the end of the test.
 */
test('record, play back, and delete a voice memo on a Learn item question side', async ({authenticatedPage: page}) => {
  await page.goto('/learn')

  // With the add-input left empty, "LEARN" always creates a brand-new blank LearnItem and
  // navigates straight into it (search-or-add-learnable-item.page.ts's add()), regardless of
  // click vs. long-press.
  await page.getByRole('button', {name: 'LEARN', exact: true}).click()
  await page.waitForURL(/\/learn\/item\//, {timeout: 15_000})

  // A fresh non-task item renders almost every side (isVisible() only hides `hideByDefault`
  // sides), so many <app-voice-memo-field>s coexist in the DOM immediately - unlike Journal,
  // there's no "Show All" gate to rely on. Scope to the side whose collapsed-state label is
  // exactly "question" (anchored, so it doesn't also match "question2"/"question3").
  const questionSide = page.locator('app-item-side-editor').filter({
    has: page.locator('ion-note', {hasText: /^question$/}),
  })
  await expect(questionSide).toBeVisible()

  const voiceMemoField = questionSide.locator('app-voice-memo-field')
  await expect(voiceMemoField).toBeVisible()

  const recordButton = voiceMemoField.locator('ion-button').first()
  const memoRows = voiceMemoField.locator('.voice-memo-row')

  // ---- Record ----
  await recordButton.click({timeout: 5_000})
  await expect(voiceMemoField.locator('ion-icon[name="stop"]')).toBeVisible()
  await page.waitForTimeout(1500) // let the fake audio device capture a non-trivial amount of audio
  await recordButton.click({timeout: 5_000})

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
  await memoRow.locator('ion-button[title="Delete this recording"]').click()
  await expect(alert).toBeVisible()
  await alert.locator('button', {hasText: 'Delete'}).click()
  await expect(memoRows).toHaveCount(0)
  await expect(toast).toBeVisible()
  await expect(toast).toBeHidden({timeout: 10_000}) // 6s auto-dismiss + margin
  await expect(memoRows).toHaveCount(0) // still gone - confirms the toast dismissal actually triggered the real delete
})
