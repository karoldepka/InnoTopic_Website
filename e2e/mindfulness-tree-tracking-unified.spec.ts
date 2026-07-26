import {test, expect} from './fixtures'

/**
 * Regression test for the OryItem$/OryOdmItemsService unification fix: starting mindfulness
 * tracking via the /mindfulness page must be visible on the /tree row for the same
 * `_mindfulness_<uid>` anchor item, in a completely fresh page load. Before the fix,
 * MindfulnessTrackingService constructed its own disconnected `OryItem$` (never fed real synced
 * data), separate from the one TreeModel builds when rendering that same item as a tree row - two
 * independent TimeTrackedEntry objects for the same id, each able to silently clobber the other's
 * `timeTrack` state (the root cause of recurring "edit conflict" reports on /tree/_mindfulness).
 *
 * Split into two `test()`s (not one test doing both navigations) - two `page.goto()` calls with a
 * long wait in between, inside a single test, intermittently hit unrelated `Failed to fetch`
 * network errors in this dev environment; two independent page loads (this file's actual
 * approach) don't.
 */
test.describe.serial('mindfulness tracking is unified with its /tree row', () => {
  test('start tracking via /mindfulness', async ({authenticatedPage: page}) => {
    await page.goto('/mindfulness')
    const pauseButton = page.getByRole('button', {name: 'Pause mindfulness timer'})
    if (await pauseButton.isVisible().catch(() => false)) {
      await pauseButton.click()
      await expect(page.getByRole('button', {name: 'Start mindfulness timer'})).toBeVisible({timeout: 10_000})
    }
    await page.getByRole('button', {name: 'Start mindfulness timer'}).click()
    await expect(page.getByRole('button', {name: 'Pause mindfulness timer'})).toBeVisible({timeout: 10_000})
    // Let the patch actually reach Supabase before this test's page tears down - otherwise the
    // next test's fresh load can race ahead of the write.
    await page.waitForTimeout(5000)
  })

  test('a fresh /tree load shows it as currently tracking', async ({authenticatedPage: page}) => {
    await page.goto('/tree')
    // The shared e2e account may have other, unrelated Mindfulness-titled/tracked rows left over
    // from real usage (potentially hours-long) - narrow to one just started by this test (a
    // fresh, sub-hour duration) so this never touches a genuinely long-running tracked item.
    const trackingMindfulnessRow = page.locator('.node-content-container', {hasText: 'Mindfulness'})
      .filter({has: page.locator('.timeTrackingNow')})
      .filter({hasNotText: /\dh/})
      .first()
    await expect(trackingMindfulnessRow).toBeVisible({timeout: 20_000})

    // Cleanup (best-effort, not itself an assertion of the fix) - stop it via the tree row so
    // this doesn't leave a dangling tracked item in the shared test account.
    await trackingMindfulnessRow.locator('ion-icon[name="pause"]').first().click().catch(() => {})
  })
})
