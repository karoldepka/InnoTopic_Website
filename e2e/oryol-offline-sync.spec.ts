import {test, expect} from './fixtures'

/**
 * Covers the offline corner case for OrYoL tree edits: BrowserOdmStorage's durable pending-edits
 * journal (not just the ephemeral in-flight-promise "Unsaved change" indicator, which a reload
 * would wipe out) is what's supposed to make an edit made offline actually persist. OryItem$
 * .patchThrottled() is the legacy facade every OrYoL edit still goes through today, but its
 * actual DB write flows through SupabaseTreeService.patchItemData() -> OryOdmItem$.patchNow()
 * (OdmItem$2), which does call persistPendingEditDurably() - so this should already work, but
 * had never been exercised end-to-end before.
 *
 * Note: this does NOT reload the page while offline. Playwright's context.setOffline(true) blocks
 * *all* network requests, including the dev server serving the page's own JS/HTML back on
 * navigation - there's no service worker caching the app shell here, so a genuine "reload while
 * offline" against localhost isn't reproducible this way. Instead: edit offline, confirm it's
 * durably queued (not just in-flight), go back online, then reload - proving the edit survived
 * as a real durable record rather than living only in an in-memory promise.
 */
test('editing a node while offline durably queues it, and it survives a reload once back online', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const rows = page.locator('.node-content-container')
  const countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  const newRow = rows.nth(countBefore)

  const uniqueTitle = `e2e-offline-${Date.now()}`

  await page.context().setOffline(true)
  try {
    // Must click the actual TinyMCE contenteditable div, not just the app-ory-rich-text-cell
    // wrapper around it - clicking the wrapper doesn't focus the editable region at all, so
    // page.keyboard.type() would silently fall through to the row's global letter-key shortcuts
    // instead of typing into the title (confirmed live: it started a voice-memo recording).
    await newRow.locator('div[contenteditable="true"]').click()
    await page.keyboard.type(uniqueTitle)

    // Sync popover shows this as durably queued while offline (durablePendingSyncItems$, not
    // the ephemeral in-flight promise, which never resolves without a network round trip).
    await page.locator('odm-sync-status-icon .action-icon').first().click()
    const popover = page.locator('ion-popover')
    await expect(popover).toContainText('OryItem', {timeout: 10_000})
    // Backdrop click, not Escape - ion-popover's dismiss animation can leave a stale overlay
    // behind that still intercepts pointer events even once Playwright considers it "hidden"
    // (opacity-based hide, not display:none), which then blocks the very next click below.
    await page.locator('ion-backdrop').click({force: true})
    await expect(popover).toHaveCount(0, {timeout: 10_000})
  } finally {
    // Always restore online state, even if an assertion above fails, so this test doesn't leave
    // the browser context offline for whatever runs after it.
    await page.context().setOffline(false)
  }

  // Back online - the durably-queued edit should retry and clear. Checked via the sync icon's
  // own "fully synced" state (not by reopening the popover a second time, for the same
  // stale-overlay reason as above) - the pending-upload cloud icon gets a "hide" class
  // (opacity: 0) once nothing is left queued.
  const pendingIcon = page.locator('odm-sync-status-icon img[src*="cloud_up_arrow"]')
  await expect(pendingIcon).toHaveClass(/hide/, {timeout: 20_000})

  // Reload (now genuinely online) - the edit must come from a real saved record, not just an
  // in-memory promise that a reload would otherwise have wiped out. .first(): an ancestor row's
  // container also matches hasText since the text appears somewhere in its own subtree - any
  // match is enough to prove the title survived.
  await page.reload({waitUntil: 'commit'})
  await expect(page.locator('.node-content-container', {hasText: uniqueTitle}).first()).toBeVisible({timeout: 20_000})
})
