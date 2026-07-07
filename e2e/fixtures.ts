import {test as base, expect, Page} from '@playwright/test'

/** Logs in through the real email/password form (`/auth`) using the dedicated e2e test account -
 * there's no auth-bypass mechanism anywhere in this app, so this drives the actual UI a real user
 * would use. Fails fast with a clear message if the credentials aren't loaded (see
 * playwright.config.ts's `process.loadEnvFile('.env.e2e')`), rather than letting every test in the
 * suite fail one-by-one with a confusing "element not found" once the form never gets filled in. */
async function loginAsTestUser(page: Page): Promise<void> {
  const email = process.env.E2E_TEST_EMAIL
  const password = process.env.E2E_TEST_PASSWORD
  if (!email || !password) {
    throw new Error(
      'E2E_TEST_EMAIL/E2E_TEST_PASSWORD are not set - create .env.e2e at the repo root ' +
      '(gitignored) with those two values, or set them as CI secrets.'
    )
  }

  await page.goto('/auth')
  // ion-input is a custom element - Playwright's locators pierce its (open) shadow DOM to reach
  // the real <input> inside, same as a user typing into what's visually a plain text field.
  await page.locator('ion-input[name="email"] input').fill(email)
  await page.locator('ion-input[name="password"] input').fill(password)
  await page.locator('form button[type="submit"]').click()
  // Firebase's email/password sign-in is a real network round-trip - give it real time, and
  // confirm success by the app navigating away from /auth (it never does that on failure; a
  // failed login instead surfaces an alert and stays put).
  await page.waitForURL(url => !url.pathname.startsWith('/auth'), {timeout: 20_000})
}

export const test = base.extend<{authenticatedPage: Page}>({
  authenticatedPage: async ({page}, use) => {
    await loginAsTestUser(page)
    await use(page)
  },
})

export {expect}
