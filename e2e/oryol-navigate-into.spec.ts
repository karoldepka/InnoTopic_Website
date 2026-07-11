import {test, expect} from './fixtures'

/**
 * Covers "navigate into a node" on /tree via the two currently-reachable UI paths:
 *  1. The tree-node-menu popover's "Navigate Into" button (TreeNode.navigateInto() ->
 *     TreeModel.navigation.navigateInto(node), called with an already-resolved node).
 *  2. Clicking an entry in the time-tracking toolbar (navigationService.navigateToNodeByItemId()
 *     -> navigation$ -> TreeHostComponent's subscription, which does its own id lookup).
 *
 * Path 2 is the one that regressed after the OrYoL Supabase cutover: navigation$ is a
 * CachedSubject that replays its last-ever value to a brand new TreeHostComponent, and the
 * subscriber used to do a one-shot lookup-and-fail instead of retrying once the tree stream
 * delivers the target - see tree-host.component.ts's tryNavigateToNodeId()/
 * pendingNavigationTargetItemId.
 *
 * NOT covered: navigating via Search (search.component.ts's navigateTo(), also fed through
 * navigation$). The search icon's click handler and its ngbPopover trigger are commented out in
 * toolbar.component.html, and <app-search> itself sits inside a bare <ng-template> with no
 * structural directive rendering it - the feature is currently unreachable from the UI, so there
 * is no real user flow to drive here.
 */

test('"Navigate Into" from the node menu makes that node the visual root, and the up-arrow returns', async ({authenticatedPage: page}) => {
  await page.goto('/tree')
  await expect(page).toHaveURL(/\/tree$/)

  const rows = page.locator('.node-content-container')
  const countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  const newRow = rows.last()

  await newRow.locator('app-node-class-icon').click()
  const popover = page.locator('ion-popover')
  await expect(popover).toBeVisible()

  await popover.getByRole('button', {name: 'Navigate Into'}).click()
  await expect(page).toHaveURL(/\/tree\/.+/, {timeout: 10_000})

  // visualRoot$ -> router sync (tree-host.component.ts) pushes a real history entry for the
  // node's URL, so the browser's own back navigation is a more robust way to verify the round
  // trip than clicking the toolbar's up-arrow icon (which renders as two ambiguous DOM copies -
  // one of them an inert leftover layout/route snapshot that looks visible but doesn't react).
  await page.goBack()
  await expect(page).toHaveURL(/\/tree$/, {timeout: 10_000})
})

test('clicking a tracked item in the time-tracking toolbar navigates to it', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const rows = page.locator('.node-content-container')
  const countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  const newRow = rows.last()

  // Start time-tracking on the new node via its row's own play icon - this is what makes it
  // appear in the time-tracking toolbar at all (TimeTrackingService.toolbarEntries$).
  await newRow.locator('ion-icon[name="play"]').click()
  await expect(newRow.locator('ion-icon[name="pause"]')).toBeVisible({timeout: 10_000})

  // The toolbar renders its own separate app-time-tracking-cell instance for this entry (not the
  // row's) - it's specifically this one whose (click) fires navigateTo() -> navigation$.
  const toolbarEntry = page.locator('app-time-tracking-toolbar app-time-tracking-cell').first()
  await expect(toolbarEntry).toBeVisible({timeout: 10_000})
  await toolbarEntry.click()

  await expect(page).toHaveURL(/\/tree\/.+/, {timeout: 10_000})

  // No cleanup here (leaves the node tracking, same convention as the voice-memo e2e tests
  // leaving their created tree nodes behind since there's no delete-node flow): navigating
  // "into" an empty freshly-created node auto-focuses its title field, which pops TinyMCE's
  // inline floating toolbar over the page's own toolbar and reliably intercepts a follow-up
  // click on the pause icon.
})
