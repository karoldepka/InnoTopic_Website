import {test, expect} from './fixtures'

/**
 * Drives the OrYoL tree's per-node "note" voice memo, reached through the tree-node-menu
 * popover (see `tree-node-menu-popover.component.html`'s `<app-voice-memo-field fieldId="note">`).
 * Uses the same fake-audio-device pipeline as journal-voice-memo.spec.ts - see that file's doc
 * comment for why transcription assertions are deliberately skipped.
 *
 * Leaves the created tree node behind under the test account (no delete-node e2e flow exists) -
 * the recording itself IS deleted by the end of the test.
 */
test('record, play back, and delete a voice memo on an OrYoL tree node note', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  // "Append" adds a new child at the current visual root (default: the actual tree root) and
  // focuses it - it needs no pre-existing focused row, unlike Enter/"Add Sub-Item". A newly
  // appended node is created locally (no network round-trip needed for it to render) and always
  // sorts after every pre-existing sibling, so it reliably ends up the *last* `.node-content-
  // container` row regardless of how many pre-existing siblings the shared test account already
  // has or how slowly any of them are still streaming in (IndexedDB replay, then live ODM sync) -
  // waiting for an exact `countBefore + 1` is what's actually unreliable here, since a
  // still-arriving pre-existing row can land in that same window and get miscounted as ours.
  const rows = page.locator('.node-content-container')
  const countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  const newRow = rows.last()

  // The node-class icon (folder/document icon at the start of the row) opens the tree-node-menu
  // popover on a plain click - its inner ion-icon also has a long-press (`press`) gesture bound to
  // a different action (navigateInto), so a plain click is safe here.
  await newRow.locator('app-node-class-icon').click()
  const popover = page.locator('ion-popover')
  await expect(popover).toBeVisible()

  // Only one app-voice-memo-field renders in this popover (fieldId 'note'), so no further scoping
  // is needed once inside it.
  const voiceMemoField = popover.locator('app-voice-memo-field')
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
