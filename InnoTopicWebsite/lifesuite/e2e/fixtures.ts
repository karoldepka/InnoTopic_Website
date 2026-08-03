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
  // Scoped to app-login-email-password specifically - app-signup-email-password sits right next
  // to it in the DOM (just [hidden], not removed) with the same field names, so an unscoped
  // locator matches both and Playwright's strict mode rejects the ambiguity. ion-input is a
  // custom element - Playwright's locators pierce its (open) shadow DOM to reach the real
  // <input> inside, same as a user typing into what's visually a plain text field.
  const loginForm = page.locator('app-login-email-password')
  await loginForm.locator('ion-input[name="email"] input').fill(email)
  await loginForm.locator('ion-input[name="password"] input').fill(password)

  // A failed login calls errorAlert(), which is a *native* window.alert() (not an ion-alert) -
  // capture and auto-dismiss it so the test doesn't hang waiting on a browser dialog Playwright
  // won't otherwise resolve on its own.
  let failureMessage: string | undefined
  page.once('dialog', dialog => {
    failureMessage = dialog.message()
    void dialog.dismiss()
  })

  // ion-button[type="submit"] renders both its own visible shadow-DOM button (accessible name
  // "Login") and a bare native <button type="submit"> for real form-submit semantics - target the
  // former specifically by role/name rather than an ambiguous element selector.
  await loginForm.getByRole('button', {name: 'Login'}).click()
  // Confirmed live: on success this app *does* eventually navigate away from /auth on its own
  // (something reacts to the auth state settling), but it's a client-side route change (no real
  // page 'load' event follows it) and can take surprisingly long in this environment - `commit`
  // is the earliest lifecycle stage, so this resolves as soon as the URL itself actually changes
  // instead of waiting on a 'load' event that a pure SPA navigation never fires.
  await page.waitForURL(url => !url.pathname.startsWith('/auth'), {timeout: 40_000, waitUntil: 'commit'})
  if (failureMessage) {
    throw new Error(`Login failed: ${failureMessage}`)
  }
}

export const test = base.extend<{authenticatedPage: Page}>({
  authenticatedPage: async ({page}, use) => {
    await loginAsTestUser(page)
    await use(page)
  },
})

export {expect}
