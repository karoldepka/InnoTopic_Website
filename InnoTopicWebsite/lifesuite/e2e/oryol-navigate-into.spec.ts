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

  // GH #142 "visual root does not show": the URL changing is necessary but not sufficient - a
  // past regression left the tree area completely blank after this exact navigation (URL updated
  // fine, but the navigated-into node's own <app-node-content> never rendered). Root cause:
  // TreeService.getRootTreeModel() constructed a brand new, initially-empty TreeModel (+ a fresh
  // loadNodesTree() reload of the *entire* tree) every time Ionic's IonRouterOutlet created a new
  // TreeHostComponent for its page stack - which happens on every /tree -> /tree/:rootNodeId
  // navigation, since IonRouterOutlet gives each route match its own page even though Angular
  // routes both to the same TreePageComponent. The freshly deep-linked node hadn't streamed into
  // that new, empty model yet, so it was never found and the view fell back to the model's own
  // (also-just-created, essentially empty) default root - asserting only the URL here would have
  // missed that entirely, exactly as this suite in fact did the first time around.
  //
  // Scoped via :not(.ion-page-hidden *): Ionic's IonRouterOutlet keeps the previous /tree page
  // parked in the DOM (class "ion-page-hidden", for its swipe-back stack) rather than destroying
  // it, so an unscoped 'app-node-content' locator can resolve to that stale, invisible copy
  // instead of the new page's - a plain .first() is not reliable here since DOM order (not
  // visibility) decides which one it picks. Note this can't be ".ion-page:not(.ion-page-hidden)
  // app-node-content" (a seemingly obvious fix): app.component.html's own div#main-content also
  // carries the "ion-page" class and is never hidden, and it's an ancestor of *both* the old and
  // new inner pages - so that selector matches every app-node-content via that always-visible
  // outer page regardless of which inner page is actually showing. :not(.ion-page-hidden *)
  // instead checks the element itself isn't a descendant of anything hidden, which is what's
  // actually needed here - confirmed empirically both ways (0 matches with the bug reproduced,
  // 1 visible match once TreeService.getRootTreeModel() is fixed to cache the model).
  await expect(page.locator('app-node-content:not(.ion-page-hidden *)').first()).toBeVisible({timeout: 10_000})

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

  // Start time-tracking on the new node via its row's own start icon - this is what makes it
  // appear in the time-tracking toolbar at all (TimeTrackingService.toolbarEntries$). A custom
  // SVG (record-circle-with-clock-cutout), not a named ionicon - selector matches on src instead.
  await newRow.locator('ion-icon[src*="time-track-start"]').click()
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
