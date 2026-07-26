import {test, expect} from './fixtures'

/**
 * Covers MindfulnessSettingsService's lastDurationSeconds persistence (server-synced via the
 * same odm_items singleton row as MindfulnessGoals, not localStorage) - previously the timer
 * always reset to the hardcoded 5m default on every page load.
 */
test('mindfulness timer remembers the last-selected duration across reloads', async ({authenticatedPage: page}) => {
  await page.goto('/mindfulness')

  const onePreset = page.locator('.timer-preset', {hasText: '1m'})
  // selectTimerDuration() fires MindfulnessSettingsService.saveLastDurationSeconds() without
  // awaiting it - wait for that background upsert to actually reach Supabase before reloading, or
  // the reload races ahead of the save and the assertion below fails for a reason unrelated to the
  // feature under test.
  const savedResponse = page.waitForResponse(resp =>
    resp.url().includes('/rest/v1/odm_items') && resp.request().method() === 'POST')
  await onePreset.click()
  await expect(onePreset).toHaveClass(/is-selected/)
  await expect(page.locator('.timer-display')).toContainText('01')
  await savedResponse

  await page.reload()

  await expect(page.locator('.timer-preset', {hasText: '1m'})).toHaveClass(/is-selected/, {timeout: 10_000})
  await expect(page.locator('.timer-display')).toContainText('01')
})
