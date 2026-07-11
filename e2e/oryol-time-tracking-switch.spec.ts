import {test, expect} from './fixtures'

/**
 * Covers switching which item is being time-tracked via the Ctrl+Enter/Cmd+Enter keyboard
 * shortcut (node-content.component.ts's keyPressMetaEnter(), bound to both
 * keydown.control.enter and keydown.meta.enter on each row). Starting to track a second item
 * auto-pauses whichever item was already tracking -
 * TimeTrackedEntry.startOrResumeTrackingIfNeeded() calls TimeTrackingService.pauseCurrentOrNoop()
 * (a plain pause, not the same-row "mark done" path) unless explicitly told to run inParallel -
 * this is the single-active-tracker "switching" behavior a real user relies on.
 */
test('Ctrl+Enter on a second item stops tracking the first and starts tracking the second', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const rows = page.locator('.node-content-container')
  const titleEditor = 'app-ory-rich-text-cell, app-contenteditable-cell'

  // ---- Create item A and start tracking it ----
  // rows.nth(indexA), not rows.last(): .last() is a lazy, re-evaluating locator (not a snapshot
  // of a specific element) - once item B is appended below, rows.last() would silently start
  // resolving to B instead of A. A new append always lands after every existing row, so A's
  // index stays stable even once B exists.
  let countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  const rowA = rows.nth(countBefore)

  await rowA.locator(titleEditor).click()
  await page.keyboard.press('Control+Enter')
  await expect(rowA.locator('ion-icon[name="pause"]')).toBeVisible({timeout: 10_000})

  // ---- Create item B and start tracking it - this must stop A ----
  countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  const rowB = rows.last()

  await rowB.locator(titleEditor).click()
  await page.keyboard.press('Control+Enter')
  await expect(rowB.locator('ion-icon[name="pause"]')).toBeVisible({timeout: 10_000})

  // ---- A was switched off, not marked done ----
  await expect(rowA.locator('ion-icon[name="play"]')).toBeVisible({timeout: 10_000})
  await expect(rowA.locator('ion-icon[name="pause"]')).toHaveCount(0)

  // Clean up: stop tracking B (A is already stopped) - avoids leaving an actively-tracking
  // stray node behind in the shared test account.
  await rowB.locator('ion-icon[name="pause"]').click()
})
