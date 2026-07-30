import {test, expect} from './fixtures'

/**
 * Covers the basic "modify a node" flow on /tree: typing into a node's title and confirming the
 * edit actually persisted server-side, not just in the in-memory tree.
 *
 * Appends a *suffix* to an already-existing node rather than creating a fresh top-level one:
 * Append-ing a brand new node at the tree's actual root triggers a background write to update the
 * root item's own embedded inclusion data (SupabaseTreeService.upsertRootInclusionIfMissing()) -
 * and the shared root item ('ory_root') is owned by a different real account, so RLS silently
 * rejects that specific write for the e2e test account (confirmed live via the browser console:
 * "[Supabase ODM] ... saveNowToDb upsert error ... ory_root" - and the pre-existing
 * oryol-offline-sync.spec.ts's own "fully synced" check now also fails the same way, with 30+
 * items permanently stuck "pending" on this account). That's a real, separate, pre-existing
 * multi-tenancy bug (filed as a GH issue), not something this test should route around by masking
 * it - editing a node that's already reachable from the tree (so already correctly registered
 * under root, from whenever it was first created) sidesteps it entirely, since only the edited
 * node's own row needs to be written, which the test account does own regardless of who owns root.
 * `rows.last()` specifically (not `.first()`) to land on one of the most-recently-created leftover
 * e2e nodes rather than risk editing something load-bearing like the `_mindfulness` anchor item.
 *
 * Leaves the edit behind under the test account (no cleanup, same convention as the other OrYoL
 * e2e specs).
 */
test('editing an existing node title persists across a reload', async ({authenticatedPage: page}) => {
  // This account has accumulated a growing number of permanently-retrying background writes (the
  // ory_root bug this file's header comment describes - every *other* e2e spec's own top-level
  // Append calls add more of them), which can make a `reload()` here take well past the default
  // 90s test timeout to settle. Not a hang specific to this test - give it more room instead.
  test.setTimeout(180_000)
  await page.goto('/tree')

  const rows = page.locator('.node-content-container')
  await expect(rows.first()).toBeVisible({timeout: 20_000})
  const existingNode = rows.last()

  const suffix = ` [e2e-edit-${Date.now()}]`
  // TinyMCE renders an inline div[contenteditable="true"] - clicking the app-ory-rich-text-cell
  // wrapper itself doesn't focus the editable region (confirmed in oryol-offline-sync.spec.ts).
  const editor = existingNode.locator('div[contenteditable="true"]')
  await editor.click()
  await page.keyboard.press('End')
  await page.keyboard.type(suffix)

  // Give the throttled write time to actually reach the server before reloading. Not using the
  // sync-status icon's "fully synced" class as that signal (like oryol-offline-sync.spec.ts does) -
  // that global icon reflects the *whole account*'s sync state, which on this shared test account
  // can stay permanently "pending" for reasons unrelated to this specific edit (see this file's
  // header comment).
  await page.waitForTimeout(3_000)

  await page.reload({waitUntil: 'commit'})
  await expect(page.locator('.node-content-container', {hasText: suffix}).first())
    .toBeVisible({timeout: 20_000})
})
