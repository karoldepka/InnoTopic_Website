import {test, expect} from './fixtures'

/** Smallest possible valid PNG (1x1, transparent) - real pixel dimensions so
 * RichTextEditComponent's thumbnail-generation canvas has something to draw. */
const ONE_PX_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

/** Simulates a real OS-clipboard image paste (e.g. a screenshot) via a synthetic ClipboardEvent
 * carrying a File - TinyMCE's own paste plugin (paste_data_images: true) reads clipboardData.items
 * exactly the same way for a real paste, landing the image through its internal blob: URI path
 * (see uploadPastedImage()'s doc comment), not the data:-URI path a pasted-HTML-with-<img> would
 * take. */
async function pasteImageInto(editable: import('@playwright/test').Locator) {
  await editable.click()
  await editable.evaluate((el, base64) => {
    const byteChars = atob(base64)
    const bytes = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i)
    const file = new File([bytes], 'pasted.png', {type: 'image/png'})
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    const event = new ClipboardEvent('paste', {bubbles: true, cancelable: true, clipboardData: dataTransfer})
    el.dispatchEvent(event)
  }, ONE_PX_PNG_BASE64)
}

test('pasting an image uploads it, shows in the sync icon, survives reload, and opens full-size on click', async ({authenticatedPage: page}) => {
  await page.goto('/journal/write/new')

  // A unique marker lets this test find its own entry back in the list later, rather than
  // assuming "the first row" is the one just created (the list re-sorts/re-syncs independently).
  const marker = 'e2e-image-test-' + Date.now()

  const editable = page.locator('app-rich-text-edit div[contenteditable="true"]').first()
  await expect(editable).toBeVisible({timeout: 15_000})
  await editable.click()
  await page.keyboard.type(marker)

  await pasteImageInto(editable)

  const img = editable.locator('img')
  await expect(img).toHaveAttribute('data-blob-id', /.+/, {timeout: 20_000})
  await expect(img).toHaveAttribute('data-original-blob-id', /.+/)

  // ---- Sync icon reflects the in-flight upload (GH request), then settles ----
  await page.locator('odm-sync-status-icon div.action-icon').click()
  await expect(page.locator('ion-popover').last()).toContainText('Uploading image', {timeout: 5_000})
  await page.mouse.click(5, 5) // dismiss popover via backdrop click, not Escape (unreliable for ion-popover)

  await expect(page.locator('odm-sync-status-icon img[alt="uploading"], odm-sync-status-icon img[alt="pending uploads"]'))
    .toHaveClass(/hide/, {timeout: 20_000})

  // ---- Reload-survival (GH #53): navigate to the entry's own dedicated URL and reload it ----
  await page.goto('/journal', {waitUntil: 'commit'})
  await page.getByPlaceholder('Search journal').fill(marker)
  const firstRow = page.locator('app-journal-entry-list-item').first()
  await expect(firstRow).toContainText(marker, {timeout: 10_000})
  await firstRow.click()
  await page.waitForURL(/\/journal\/entry\//, {timeout: 15_000})

  await page.reload({waitUntil: 'commit'})
  const reloadedImg = page.locator('app-rich-text-edit img').first()
  await expect(reloadedImg).toHaveAttribute('data-blob-hydrated', 'true', {timeout: 15_000})
  await expect(reloadedImg).toHaveAttribute('src', /^blob:/)

  // ---- Click-to-view full-size modal (GH #32/#53) ----
  await reloadedImg.click()
  const modalImg = page.locator('app-image-viewer-modal img')
  await expect(modalImg).toBeVisible({timeout: 10_000})
  await expect(modalImg).toHaveAttribute('src', /^blob:/)
})
