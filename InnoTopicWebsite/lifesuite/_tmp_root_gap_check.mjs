import {chromium} from 'playwright-core'

const browser = await chromium.launch()
const page = await browser.newPage({viewport: {width: 1000, height: 500}, deviceScaleFactor: 2})
page.on('pageerror', err => console.log('pageerror:', err.message))

await page.goto('http://localhost:4207/tree', {waitUntil: 'load', timeout: 60000})
await page.waitForTimeout(3000)

// Create 2 children under the current visual root via APPEND, and give them titles so the
// numeric cells + row heights match a realistic case.
for (let i = 0; i < 2; i++) {
  await page.locator('text=Append').first().click()
  await page.waitForTimeout(700)
}
await page.evaluate(() => {
  const nodes = document.querySelectorAll('app-node-content')
  nodes.forEach((el, i) => {
    if (i === 0) return // skip the visual root row itself
    const comp = (window).ng.getComponent(el)
    comp.treeNode.content.patchThrottled({title: `Child node ${i}`})
  })
})
await page.waitForTimeout(1000)

// Measure: visual root's own row bottom edge vs first child's box (including shadow via
// its own bounding box, which does NOT include box-shadow - need getBoundingClientRect of the
// .nested-tree-node element plus reason about the shadow's own pixel extent from its CSS values).
const info = await page.evaluate(() => {
  const rootRow = document.querySelector('app-node-content > div') // visual root's own content row
  const firstChildNode = document.querySelector('.nested-tree-node')
  if (!rootRow || !firstChildNode) return {found: false, rootRow: !!rootRow, firstChildNode: !!firstChildNode}
  const rootRect = rootRow.getBoundingClientRect()
  const childRect = firstChildNode.getBoundingClientRect()
  const cs = getComputedStyle(firstChildNode)
  return {
    found: true,
    rootBottom: rootRect.bottom,
    childTop: childRect.top,
    gap: childRect.top - rootRect.bottom,
    childMarginTop: cs.marginTop,
    boxShadow: cs.boxShadow,
  }
})
console.log(JSON.stringify(info, null, 2))

await page.screenshot({path: process.argv[2] || 'root-gap.png'})
await browser.close()
