export default async function recordLifeSuiteHome({ page, sleep }) {
  await page.waitForLoadState('domcontentloaded');
  await sleep(1000);

  await page.mouse.wheel(0, 500);
  await sleep(1000);

  await page.mouse.wheel(0, -500);
  await sleep(1000);
}
