import {test, expect} from './fixtures'

/**
 * Covers archiving a node via the tree-node-menu popover (TreeNodeMenuPopoverComponent.
 * askArchiveItems() -> a confirmation ion-alert -> patches isArchived/isArchivedWhen on both the
 * item and its inclusion, recursively including children) - previously untested despite being a
 * fully-wired, reachable UI flow (unlike Search, see oryol-navigate-into.spec.ts).
 */
test('archiving a node via the popover marks it Archived in the tree', async ({authenticatedPage: page}) => {
  await page.goto('/tree')

  const rows = page.locator('.node-content-container')
  const countBefore = await rows.count()
  await page.getByRole('button', {name: 'Append', exact: true}).click()
  await expect(rows).not.toHaveCount(countBefore, {timeout: 20_000})
  const newRow = rows.nth(countBefore)

  await newRow.locator('app-node-class-icon').click()
  const popover = page.locator('ion-popover')
  await expect(popover).toBeVisible()

  await popover.getByRole('button', {name: 'Archive', exact: true}).click()
  const alert = page.locator('ion-alert')
  await expect(alert).toBeVisible()
  await expect(alert).toContainText('Archive 1 item(s)?')

  await alert.getByRole('button', {name: 'ARCHIVE'}).click()
  await expect(newRow).toContainText('Archived', {timeout: 10_000})
})
