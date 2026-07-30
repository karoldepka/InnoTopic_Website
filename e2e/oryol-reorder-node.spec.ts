import {test, expect} from './fixtures'
import type {Page} from '@playwright/test'

/**
 * Covers the three live ways to move a node on /tree:
 *  1. Ctrl+ArrowUp/Ctrl+ArrowDown - reorder among siblings (node-content.component.ts's
 *     reorderUp()/reorderDown() -> TreeNode.ts's ApfNonRootTreeNode.reorderUp()/reorderDown()).
 *  2. Tab/Shift+Tab - indent/outdent, i.e. reparent under the sibling above / back out to the
 *     grandparent (indentIncrease()/indentDecrease() -> TreeNode.ts's moveInclusionsHere()).
 *  3. Clipboard cut/paste via the node-menu popover ("To Clipboard" on one node, then a different
 *     node's "Move Here From Clipboard") - a cross-subtree move, not limited to adjacent siblings.
 *
 * NOT covered: native HTML5 drag-and-drop. nested-tree-node.component.ts wires dragstart/dragover/
 * drop handlers reaching the same moveInclusionsHere() primitive, but every draggable wrapper in
 * its template is hardcoded draggable="false" (dragging doesn't currently appear to actually
 * initiate from a live row) - Playwright's dragTo() also doesn't reliably trigger dragstart/drop on
 * elements not marked draggable="true". The three mechanisms above are the reliable, currently-
 * reachable ones.
 *
 * Leaves all created nodes behind under the test account (no cleanup, same convention as the other
 * OrYoL e2e specs).
 */

/** Returns a locator scoped by the node's own unique title text, not DOM position - a `rows.last()`
 * reference captured before a *later* sibling gets appended goes stale (silently re-resolves to
 * whatever is *currently* last once that next append happens), which bit an earlier version of the
 * clipboard test below: it captured node C's row, then appended D before ever clicking into C's
 * row, so that click silently landed on D instead. */
async function appendNodeWithTitle(page: Page, title: string) {
  const rows = page.locator('.node-content-container')
  const countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  await rows.last().locator('div[contenteditable="true"]').click()
  await page.keyboard.type(title)
  return page.locator('app-node-content', {hasText: title})
}

test('Ctrl+ArrowUp reorders a node above its previous sibling', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const titleA = `ReorderA-${Date.now()}`
  const titleB = `ReorderB-${Date.now()}`
  const nodeA = await appendNodeWithTitle(page, titleA)
  const nodeB = await appendNodeWithTitle(page, titleB)

  // Compare vertical screen position rather than scanning a page-wide text array: this shared test
  // account has 180+ leftover nodes from repeat e2e runs, so a full-tree .allTextContents() scan is
  // slow and its indices can shift from unrelated background-streamed rows landing mid-poll. A and
  // B's own bounding boxes are unambiguous regardless of how many other rows exist elsewhere.
  const yPositions = async () => ({a: (await nodeA.boundingBox())!.y, b: (await nodeB.boundingBox())!.y})

  const before = await yPositions() // Append always sorts a new node last among its siblings
  expect(before.a).toBeLessThan(before.b)

  await nodeB.locator('div[contenteditable="true"]').click()
  await page.keyboard.press('Control+ArrowUp')

  await expect(async () => {
    const after = await yPositions()
    expect(after.b).toBeLessThan(after.a)
  }).toPass({timeout: 10_000})
})

test('Tab indents a node under its previous sibling, Shift+Tab outdents it back out', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const titleA = `IndentA-${Date.now()}`
  const titleB = `IndentB-${Date.now()}`
  const nodeA = await appendNodeWithTitle(page, titleA)
  const nodeB = await appendNodeWithTitle(page, titleB)

  // app-node-content doesn't nest inside itself (a node's children render in a sibling
  // .node-children div, not inside its own app-node-content), so matching on hasText here is
  // unambiguous - exactly one app-node-content contains A's own title text.
  const nodeAChildren = nodeA.locator('xpath=..').locator('.node-children')
  const bInsideA = nodeAChildren.locator('app-node-content', {hasText: titleB})

  // indentIncrease() refocuses the moved node afterward (focusNewlyCreatedNode() ->
  // treeHost.focusNode() -> TreeModel.Focus.ensureNodeVisibleAndFocusIt(), which calls
  // expansion.setExpansionOnParentsRecursively(true)) - A auto-expands as B's new ancestor (a
  // fresh node otherwise starts collapsed, TreeNode.ts's `expanded` has no default), so there's no
  // need to click A's collapse chevron manually here.
  await nodeB.locator('div[contenteditable="true"]').click()
  await page.keyboard.press('Tab')
  await expect(bInsideA).toBeVisible({timeout: 10_000})

  // indentDecrease() refocuses the same way, so no manual expand-handling needed on the way back
  // out either. Refocus B explicitly first rather than assuming DOM focus survived the reparent.
  await bInsideA.locator('div[contenteditable="true"]').click()
  await page.keyboard.press('Shift+Tab')
  await expect(bInsideA).toHaveCount(0, {timeout: 10_000})
  await expect(page.locator('app-node-content', {hasText: titleB})).toBeVisible() // still exists, just moved back out
})

test('cutting a node to the clipboard and pasting "Move Here" on a different node reparents it there', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const titleC = `ClipC-${Date.now()}`
  const titleD = `ClipD-${Date.now()}`
  const nodeC = await appendNodeWithTitle(page, titleC)
  const nodeD = await appendNodeWithTitle(page, titleD)

  await nodeC.locator('app-node-class-icon').click()
  const popover = page.locator('ion-popover')
  await expect(popover).toBeVisible()
  await popover.getByRole('button', {name: 'To Clipboard'}).click()
  // toClipboard() doesn't dismiss the popover itself - close it manually (backdrop, not Escape,
  // per oryol-offline-sync.spec.ts's note on a stale-overlay pointer-interception issue on this
  // same popover component) so a second node's popover can be opened next. That spec only ever
  // dismisses one popover per test though - this test opens a second one right after, and waiting
  // for the popover to merely report "hidden" (CSS opacity, not real DOM removal) isn't enough: the
  // dismissed backdrop can still intercept the *next* click even once Playwright considers it
  // gone, so wait for the backdrop element to be fully removed from the DOM instead.
  await page.locator('ion-backdrop').click({force: true})
  await expect(page.locator('ion-backdrop')).toHaveCount(0, {timeout: 10_000})
  await expect(popover).toBeHidden({timeout: 10_000})

  await nodeD.locator('app-node-class-icon').click()
  await expect(popover).toBeVisible()
  // Only rendered once ClipboardService.hasContent is true, i.e. after the "To Clipboard" click above.
  await popover.getByRole('button', {name: 'Move Here From Clipboard'}).click()
  // pasteMoveHereFromClipboard() doesn't dismiss the popover either - same manual close as above.
  await page.locator('ion-backdrop').click({force: true})
  await expect(page.locator('ion-backdrop')).toHaveCount(0, {timeout: 10_000})
  await expect(popover).toBeHidden({timeout: 10_000})

  // Unlike indentIncrease/indentDecrease, pasteMoveHereFromClipboard() doesn't refocus/re-expand
  // anything afterward - expand D's chevron manually if it's still showing collapsed.
  const expandIcon = nodeD.locator('app-node-expansion-icon ion-icon[name="chevron-down"]')
  if (await expandIcon.evaluate(el => el.classList.contains('collapsedIcon'))) {
    await expandIcon.click()
  }

  const nodeDChildren = nodeD.locator('xpath=..').locator('.node-children')
  await expect(nodeDChildren.locator('app-node-content', {hasText: titleC})).toBeVisible({timeout: 10_000})
})
