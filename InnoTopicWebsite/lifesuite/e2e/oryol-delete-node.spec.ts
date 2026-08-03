import {test, expect} from './fixtures'

/**
 * Covers the OrYoL tree's only reachable node-delete flow: backspace-to-delete on an empty node
 * (node-content.component.ts's deleteOnBackspaceIfEmpty()/deleteNodeWithUndoToast()). The
 * tree-node-menu popover also has a "Delete" button in its template, but it's commented out
 * (openDeleteConfirmationDialog() is a stub that only console.logs) - not a reachable UI path, so
 * not tested here.
 *
 * The shared test account has accumulated 180+ leftover nodes from repeat e2e runs (no cleanup
 * flow exists for any of them), so `.node-content-container`'s total count keeps drifting from
 * background sync independent of anything a test does here - every row-count check below compares
 * against a count captured immediately beforehand (not once at the top of the test) to keep that
 * drift window as small as possible, same principle the other OrYoL e2e specs already rely on for
 * their own Append-then-`rows.last()` step.
 *
 * Leaves the second test's guard-case parent+child behind under the test account (no cleanup, same
 * convention as the other OrYoL e2e specs) - the first test's node is fully deleted for real by
 * its own end.
 */

test('backspace deletes an empty node, Undo restores it, and letting the toast expire finalizes the delete', async ({authenticatedPage: page}) => {
  await page.goto('/tree')
  const rows = page.locator('.node-content-container')

  const countBeforeAppend = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBeforeAppend, {timeout: 20_000})
  const newRow = rows.last()

  // Focus the title without typing anything - deleteOnBackspaceIfEmpty() only fires for a node
  // whose title is already empty/whitespace.
  await newRow.locator('div[contenteditable="true"]').click()
  const countBeforeDelete = await rows.count()
  await page.keyboard.press('Backspace')
  await expect(rows).not.toHaveCount(countBeforeDelete, {timeout: 10_000})

  const toast = page.locator('ion-toast')
  await expect(toast).toBeVisible()
  await expect(toast).toContainText('Item deleted.')

  // ---- Undo ----
  const countBeforeUndo = await rows.count()
  await toast.locator('button', {hasText: 'Undo'}).click()
  await expect(rows).not.toHaveCount(countBeforeUndo, {timeout: 10_000})

  // ---- Delete for real this time (let the undo toast time out without tapping it) ----
  const restoredRow = rows.last()
  await restoredRow.locator('div[contenteditable="true"]').click()
  const countBeforeRedelete = await rows.count()
  await page.keyboard.press('Backspace')
  await expect(rows).not.toHaveCount(countBeforeRedelete, {timeout: 10_000})
  await expect(toast).toBeVisible()
  // 6s auto-dismiss + margin - the toast's own dismissal is what finalizes the delete (same
  // real-account-proven pattern as oryol-voice-memo.spec.ts's equivalent recording-delete flow).
  await expect(toast).toBeHidden({timeout: 10_000})
})

test('backspace does not delete a node that still has children', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const rows = page.locator('.node-content-container')
  const countBeforeAppend = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBeforeAppend, {timeout: 20_000})
  const parentRow = rows.last()

  // "Add Sub-Item" (via the parent's node-menu popover) gives the parent a real child and
  // auto-expands it (NodeContentComponent.addChild() sets treeNode.expanded = true), so the new
  // child row is immediately visible - no need to separately handle a collapsed state here.
  await parentRow.locator('app-node-class-icon').click()
  const popover = page.locator('ion-popover')
  await expect(popover).toBeVisible()
  // addChild() explicitly dismisses the popover itself (popoverController.dismiss()) once done.
  await popover.getByRole('button', {name: 'Add Sub-Item'}).click()
  await expect(popover).toBeHidden({timeout: 10_000})

  // Give the child a unique title so it (and therefore the parent/child relationship) can be
  // tracked directly by content rather than by the account's overall row count, which drifts as
  // its many pre-existing items stream in from background sync independent of this test. addChild()
  // auto-focuses the new child's title, but click explicitly rather than relying on ambient focus.
  const childTitle = `ChildGuard-${Date.now()}`
  const childNode = page.locator('app-node-content', {hasText: childTitle})
  await rows.last().locator('div[contenteditable="true"]').click()
  await page.keyboard.type(childTitle)
  await expect(childNode).toBeVisible({timeout: 10_000})

  // parentRow was `rows.last()` (a live locator, re-resolving on every use) - now that the child
  // row exists, `.last()` would resolve to the *child*, not the parent, if used again. The parent
  // stays untitled (can't be tagged with unique text - deleteOnBackspaceIfEmpty() requires an empty
  // title), so re-find it structurally instead: walk up from the child to the .node-children div
  // that holds it, then to that div's preceding sibling - the parent's own app-node-content.
  const parentNode = childNode.locator(
    'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " node-children ")][1]' +
    '/preceding-sibling::app-node-content[1]'
  )

  // Backspace on the (still-empty-titled) parent must no-op: deleteOnBackspaceIfEmpty() bails out
  // whenever treeNode.hasChildren is true, specifically so a delete never silently orphans children.
  await parentNode.locator('div[contenteditable="true"]').click()
  await page.keyboard.press('Backspace')
  await page.waitForTimeout(1000) // nothing to wait on - just give a would-be delete time to happen

  // Guard held: parent row and its child are both still there, and no delete toast appeared.
  await expect(parentNode).toBeAttached()
  await expect(childNode).toBeVisible()
  await expect(page.locator('ion-toast')).toBeHidden()
})
