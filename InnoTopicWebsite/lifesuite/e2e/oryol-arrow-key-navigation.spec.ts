import {test, expect} from './fixtures'
import type {Page} from '@playwright/test'

/**
 * Covers plain-arrow-key focus movement between sibling rows on /tree (node-content.component.html
 * 's (keydown.arrowup)/(keydown.arrowdown)/(keydown.arrowright) bindings). Not covered here:
 * Ctrl+ArrowUp/Down (reorders a node) and Tab/Shift+Tab (indent/outdent), which are different
 * bindings on the same row - see oryol-reorder-node.spec.ts.
 *
 * ArrowLeft is deliberately NOT covered: node-content.component.ts's onArrowLeft() only jumps to
 * the row above once focus is confirmed at the *leftmost column* (isFocusAtLeftmostColumn), but
 * Columns.ts's leftMostColumn resolves to the `estimatedTime` column, not `title` - and that
 * column's CellComponent never mounts (so never registers into mapColumnToComponent) for a plain
 * node with no time estimate set. getCellComponentByColumnOrDefault() then silently falls back to
 * re-focusing the title cell itself, so pressing ArrowLeft from an ordinary title never reaches the
 * row-above jump at all (confirmed live: focus stays exactly where it was, even after repeated
 * presses). This is a real, pre-existing product gap, not a test-authoring issue - see the GH issue
 * filed for it rather than asserting the current no-op as if it were the intended behavior.
 *
 * Leaves the created nodes behind under the test account (no cleanup, same convention as the other
 * OrYoL e2e specs).
 */

/** Returns a locator scoped by the node's own unique title text, not DOM position - a `rows.last()`
 * reference captured before a later sibling gets appended goes stale (silently re-resolves to
 * whatever is *currently* last once more rows exist), which would make a same-element comparison
 * pass for the wrong reason instead of genuinely proving focus moved between two distinct rows. */
async function appendNodeWithTitle(page: Page, title: string) {
  const rows = page.locator('.node-content-container')
  const countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  await rows.last().locator('div[contenteditable="true"]').click()
  await page.keyboard.type(title)
  return page.locator('app-node-content', {hasText: title}).locator('div[contenteditable="true"]')
}

test('ArrowUp/ArrowDown move focus between sibling rows', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const editorA = await appendNodeWithTitle(page, `ArrowNavA-${Date.now()}`)
  const editorB = await appendNodeWithTitle(page, `ArrowNavB-${Date.now()}`)

  // focusNodeAbove()/focusNodeBelow() (node-content.component.ts) move focus unconditionally on a
  // plain ArrowUp/ArrowDown - unlike ArrowRight below, they don't check caret position.
  await editorB.click()
  await expect(editorB).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(editorA).toBeFocused({timeout: 20_000})
  await page.keyboard.press('ArrowDown')
  await expect(editorB).toBeFocused({timeout: 20_000})
})

test('ArrowRight moves focus to the row below once the caret is at the very end of the title', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const editorA = await appendNodeWithTitle(page, `ArrowNavC-${Date.now()}`)
  const editorB = await appendNodeWithTitle(page, `ArrowNavD-${Date.now()}`)

  // onArrowRight() only jumps rows once the caret is confirmed at the very end of the text
  // (getSelectionCursorState().atEnd) AND focus is on the rightmost column - title is always
  // Columns.ts's hardcoded `lastColumn`, so that second condition holds unconditionally for it
  // (unlike the leftmost-column check onArrowLeft() relies on - see this file's header comment).
  await editorA.click()
  await page.keyboard.press('End')
  await expect(editorA).toBeFocused({timeout: 20_000})
  await page.keyboard.press('ArrowRight')
  await expect(editorB).toBeFocused({timeout: 20_000})
})
