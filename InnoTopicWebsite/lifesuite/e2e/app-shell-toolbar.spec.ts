import {test, expect} from './fixtures'

/**
 * Regression test for a real bug: AppComponent's persistent shell header (hamburger menu button,
 * logo, ToolbarCommonItemsComponent's mic/recording icons - see app.component.html) sits as a
 * sibling of <ion-router-outlet>, which Ionic gives `position: absolute; inset: 0`. global.scss
 * offsets the outlet by the shell header's height so routed pages start below it instead of
 * overlapping it (see that rule's own GH #92 comment) - every routed page's *own* header (e.g.
 * journal's back-arrow/title/sync-icon row) then silently painted on top of the shell header
 * whenever that offset rule's selector stopped matching the outlet.
 *
 * That happened for real: the selector was scoped to `ion-app > ion-router-outlet` (a direct-child
 * match, deliberately not a blanket rule - see the comment), and adding the side-menu/split-pane
 * shell nested the outlet one level deeper, silently breaking the match. No test caught it because
 * the existing suite never asserted anything about the shell header's geometry - only this file
 * does. `toBeVisible()` alone would NOT have caught this: both the shell header and the page's own
 * header report "visible" to Playwright even while one opaque toolbar paints over the other -
 * this asserts actual screen position instead.
 */
test('the app-shell header is not covered by the routed page and both toolbars are independently visible', async ({page}) => {
  await page.goto('/journal')

  const shellMenuButton = page.locator('ion-menu-button')
  await expect(shellMenuButton).toBeVisible()

  // journal-entries-list.page.html's own ion-toolbar - title on the left, odm-sync-status-icon at
  // the end. Picking a page with its own <ion-header> is the point: the bug only shows up when a
  // routed page has header content competing for the same screen region as the shell's.
  const pageTitle = page.locator('ion-title').first()
  const pageSyncIcon = page.locator('odm-sync-status-icon')
  await expect(pageTitle).toBeVisible()
  await expect(pageSyncIcon).toBeVisible()

  // Scoped to the outer div.action-icon specifically (same locator convention as
  // journal-image-paste.spec.ts) since odm-sync-status-icon's host also contains an unrelated
  // fullscreen-toggle ion-button plus several .action-icon-classed <img> status icons inside the
  // div - only the div itself has the (click) handler that opens the popover.
  const pageSyncIconClickTarget = pageSyncIcon.locator('div.action-icon')

  // toBeVisible() above only checks CSS (display/visibility/non-empty box) - it does NOT check
  // whether something else is painted on top, so both the shell header and an occluding routed-
  // page header would equally report "visible" throughout the actual regression. `{trial: true}`
  // runs Playwright's full actionability check - attached, visible, stable, enabled, AND "receives
  // pointer events" (hit-tests at the element's own coordinates and confirms it, not something
  // else, is the top-most target there) - without performing the click itself, so this catches
  // real occlusion with no side effects to clean up (no popover left open).
  await shellMenuButton.click({trial: true})
  await pageSyncIconClickTarget.click({trial: true})

  // Belt-and-suspenders: also assert the actual geometry, which pins down *why* (the CSS offset
  // rule not applying, specifically) rather than just *that* something's wrong.
  const shellBox = await shellMenuButton.boundingBox()
  const pageTitleBox = await pageTitle.boundingBox()
  expect(shellBox).not.toBeNull()
  expect(pageTitleBox).not.toBeNull()
  expect(pageTitleBox!.y).toBeGreaterThanOrEqual(shellBox!.y + shellBox!.height - 1)

  // And confirm the real interaction still works end-to-end, not just the actionability probe.
  await pageSyncIconClickTarget.click()
  await expect(page.locator('.sync-status-popover')).toBeVisible()
})
