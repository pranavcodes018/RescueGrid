const { chromium } = require('playwright-core')

const BASE = 'http://127.0.0.1:5173/'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

function log(...args) {
  console.log(...args)
}

async function main() {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  log('TITLE:', await page.title())
  log('TILE COUNT:', await page.locator('.leaflet-tile-loaded').count())
  log('OVERFLOW DESKTOP:', await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))

  await page.screenshot({ path: 'screenshots/01-overview.png' })

  // Select Ward 2 on the map
  const w2 = page.locator('.leaflet-marker-icon[title^="Ward 2"]').first()
  await w2.click()
  await page.waitForTimeout(300)
  const rightPanelText = await page.locator('.app-rightpanel').innerText()
  log('WARD SELECT UPDATES PANEL:', rightPanelText.includes('Ward 2 — Old Town'))
  await page.screenshot({ path: 'screenshots/02-ward-selected.png' })

  // Offline fallback
  await page.getByRole('button', { name: 'Offline', exact: true }).click()
  await page.waitForTimeout(500)
  log('VECTOR MAP VISIBLE:', await page.locator('svg[aria-hidden="true"]').first().isVisible().catch(() => false))
  await page.screenshot({ path: 'screenshots/03-vector-map.png' })

  // Road label + popover in vector map
  const roadLabel = page.getByRole('button', { name: /Inspect Old Town Spine/ }).first()
  await roadLabel.click()
  await page.waitForTimeout(250)
  const popover = page.getByRole('dialog', { name: /Road status/ })
  log('ROAD POPOVER:', await popover.count(), await popover.isVisible().catch(() => false))
  const popoverText = (await popover.innerText().catch(() => '')) || ''
  log('ROAD POPOVER CONTENT:', popoverText.includes('Old Town Spine'))
  await page.screenshot({ path: 'screenshots/04-road-popover.png' })
  await popover.getByRole('button', { name: 'Close road details' }).click()

  // Back to OSM
  await page.getByRole('button', { name: 'OSM tiles', exact: true }).click()
  await page.waitForTimeout(900)

  // Allocation Lab draft + apply
  await page.locator('.app-sidebar button[aria-label^="Allocation Lab"]').click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'screenshots/05-allocation-lab.png' })
  const waterSlider = page.locator('input[type="range"]').first()
  await waterSlider.evaluate((element) => {
    const input = element
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, '3600')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await page.waitForTimeout(250)
  const labText = await page.locator('main').innerText()
  log('LAB DRAFT DETECTED:', labText.includes('unsaved input value') || labText.includes('unsaved input'))
  await page.getByRole('button', { name: 'Apply changes' }).first().click()
  await page.waitForTimeout(900)
  const appliedText = await page.locator('main').innerText()
  log('LAB APPLY OK:', appliedText.includes('Draft matches the applied plan'))
  log('LAB APPLY EVENT:', /scenario inputs applied/i.test(appliedText))

  // Reset scenario via Lab
  await page.getByRole('button', { name: 'Reset scenario' }).first().click()
  const resetDialog = page.getByRole('dialog', { name: /Reset/ })
  log('RESET DIALOG:', await resetDialog.isVisible())
  await resetDialog.getByRole('button', { name: 'Reset scenario' }).click()
  await page.waitForTimeout(900)
  log('RESET EVENT:', /scenario reset to preset/i.test(await page.locator('main').innerText()))

  // Road network: block a road
  await page.locator('.app-sidebar button[aria-label^="Road Network"]').click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'screenshots/06-road-network.png' })
  const beforeHeader = await page.locator('main').innerText()
  await page.getByRole('group', { name: 'Set state for Beach Road' }).getByRole('button', { name: 'Blocked' }).click()
  await page.waitForTimeout(900)
  const afterHeader = await page.locator('main').innerText()
  log('ROAD BLOCK EVENT:', afterHeader.includes('Road blocked · Beach Road'))
  log('ROAD BLOCK COUNT CHANGED:', beforeHeader.match(/(\d+) blocked/)?.[1], '->', afterHeader.match(/(\d+) blocked/)?.[1])

  // Scenarios
  await page.locator('.app-sidebar button[aria-label^="Scenarios"]').click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'screenshots/07-scenarios.png' })
  await page.getByRole('button', { name: /Load scenario/ }).first().click()
  await page.waitForTimeout(1100)
  const scenarioText = await page.locator('main').innerText()
  log('SCENARIO SWITCHED:', scenarioText.includes('Flood Escalation'))
  await page.screenshot({ path: 'screenshots/08-scenario-switched.png' })

  // Reports
  await page.locator('.app-sidebar button[aria-label^="Reports"]').click()
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    window.__printCalled = false
    window.print = () => {
      window.__printCalled = true
    }
  })
  await page.getByRole('button', { name: 'Print report' }).click()
  log('PRINT CALLED:', await page.evaluate(() => window.__printCalled))
  await page.screenshot({ path: 'screenshots/09-reports.png', fullPage: true })

  // Right panel tabs
  await page.locator('.app-sidebar button[aria-label^="Overview"]').click()
  await page.waitForTimeout(200)
  await page.getByRole('tab', { name: 'Compare' }).click()
  await page.waitForTimeout(200)
  const compareText = await page.locator('.app-rightpanel').innerText()
  log('COMPARE TAB:', compareText.includes('Coverage equity'))
  await page.getByRole('tab', { name: 'Explain' }).click()
  await page.waitForTimeout(200)
  const explainText = await page.locator('.app-rightpanel').innerText()
  log('EXPLAIN TAB:', /why this allocation/i.test(explainText))
  await page.screenshot({ path: 'screenshots/10-explain.png' })

  // Mobile
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const mobileErrors = []
  mobile.on('console', (message) => {
    if (message.type() === 'error') mobileErrors.push(`console: ${message.text()}`)
  })
  mobile.on('pageerror', (error) => mobileErrors.push(`pageerror: ${error.message}`))
  await mobile.goto(BASE, { waitUntil: 'networkidle' })
  await mobile.waitForTimeout(1200)
  log('MOBILE OVERFLOW:', await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
  log('MOBILE MAP HEIGHT:', await mobile.locator('.leaflet-container').evaluate((element) => Math.round(element.getBoundingClientRect().height)))
  await mobile.screenshot({ path: 'screenshots/11-mobile-overview.png' })
  await mobile.locator('.leaflet-marker-icon[title^="Ward 4"]').first().click()
  await mobile.waitForTimeout(250)
  log('MOBILE SHEET SELECTION:', (await mobile.locator('.app-sheet').innerText()).includes('Ward 4 — Coastal Colony'))
  await mobile.locator('.app-sheet > button').first().click()
  await mobile.waitForTimeout(400)
  await mobile.screenshot({ path: 'screenshots/12-mobile-sheet.png' })
  await mobile.locator('.app-mobilenav button[aria-label^="Allocation Lab"]').click()
  await mobile.waitForTimeout(500)
  await mobile.screenshot({ path: 'screenshots/13-mobile-lab.png', fullPage: false })
  log('MOBILE LAB:', (await mobile.locator('main').innerText()).includes('Tune the inputs'))

  log('DESKTOP ERRORS:', JSON.stringify(errors))
  log('MOBILE ERRORS:', JSON.stringify(mobileErrors))

  await browser.close()
}

main().catch((error) => {
  console.error('VERIFY FAILED:', error)
  process.exit(1)
})
