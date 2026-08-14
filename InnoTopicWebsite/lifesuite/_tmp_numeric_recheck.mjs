import {chromium} from 'playwright-core'

const browser = await chromium.launch()
const page = await browser.newPage({viewport: {width: 1000, height: 500}, deviceScaleFactor: 2})
page.on('pageerror', err => console.log('pageerror:', err.message))

await page.goto('http://localhost:4207/tree', {waitUntil: 'load', timeout: 60000})
await page.waitForTimeout(3000)

// Call NodeContentComponent.addChild() directly on the visual root's own row - this is the exact
// method the tree-node-menu-popover's "Add Sub-Item" button calls, guaranteed to create a true
// child (not a root-level sibling the way the page-level "Append" button apparently does).
await page.evaluate(() => {
  const el = document.querySelector('app-node-content')
  const comp = (window).ng.getComponent(el)
  comp.addChild()
})
await page.waitForTimeout(1200)
await page.evaluate(() => {
  const nodes = document.querySelectorAll('app-node-content')
  const last = nodes[nodes.length - 1]
  const comp = (window).ng.getComponent(last)
  comp.treeNode.content.patchThrottled({title: 'Real grandchild', estimatedTime: '25m'})
})
await page.waitForTimeout(1200)

const debug = await page.evaluate(() => {
  const nodes = document.querySelectorAll('app-node-content')
  return Array.from(nodes).map((el, i) => {
    const comp = (window).ng.getComponent(el)
    const tn = comp.treeNode
    return {index: i, title: tn.title, isChildOfRoot: tn.isChildOfRoot, isEstimatedTimeShown: comp.isEstimatedTimeShown}
  })
})
console.log(JSON.stringify(debug, null, 2))

const cellInfo = await page.evaluate(() => {
  const nodes = document.querySelectorAll('app-node-content')
  const last = nodes[nodes.length - 1]
  const rowDiv = last.querySelector(':scope > div')
  const rowRect = rowDiv.getBoundingClientRect()
  const input = last.querySelector('app-node-cell input')
  if (!input) return {found: false}
  const inputRect = input.getBoundingClientRect()
  const wrapperDiv = last.querySelector('app-node-cell > div')
  return {
    found: true,
    rowHeight: rowRect.height,
    rowCenterY: rowRect.height / 2,
    inputCenterYRelRow: (inputRect.top - rowRect.top) + inputRect.height / 2,
    wrapperDisplay: getComputedStyle(wrapperDiv).display,
  }
})
console.log('cell centering:', JSON.stringify(cellInfo))

await page.screenshot({path: process.argv[2] || 'real-grandchild.png'})
await browser.close()
