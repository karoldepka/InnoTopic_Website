import { test, expect } from '@playwright/test';

test.describe('InnoTopic Website', () => {
  test('should have the correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/InnoTopic/);
  });

  test('should display the main app component', async ({ page }) => {
    // We go to the specific path to avoid redirect delays in tests
    await page.goto('/karol-depka', { waitUntil: 'networkidle' });
    
    // Check for "Karol" which is expected in the Personal Data section
    const name = page.getByText('Karol').first();
    await expect(name).toBeVisible({ timeout: 15000 });
  });

  test('should have a three-d-text component or fallback shiny-effect', async ({ page }) => {
    await page.goto('/karol-depka', { waitUntil: 'networkidle' });
    
    // The components are in defer blocks. Scroll to the placeholder to trigger loading.
    const placeholder = page.locator('.work-experience-placeholder');
    await placeholder.scrollIntoViewIfNeeded();
    
    // Wait for the defer block to load. It might take a moment.
    // Check for either threed-text or the shiny-effect class
    const threeDText = page.locator('threed-text');
    const shinyEffect = page.locator('.shiny-effect');
    
    // Wait for at least one to be visible
    await expect(threeDText.or(shinyEffect).first()).toBeVisible({ timeout: 20000 });
  });
});
