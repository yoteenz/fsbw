/**
 * Capture Mastery Detail season preview inside Lounge TV.
 * Usage: node scripts/screenshot-mastery-detail-preview.mjs [baseUrl]
 */
import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] || 'http://127.0.0.1:3001';
const OUT = '/opt/cursor/artifacts/screenshots';

async function openCareMasteryDetail(page) {
  await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.evaluate(() => {
    sessionStorage.setItem('loungeTvSessionOpen', '1');
    sessionStorage.setItem('loungeTvSessionMainTab', 'learn');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const play = page.locator('[data-lounge-tv-play]').first();
  if (await play.count()) {
    await play.click({ force: true, timeout: 10000 });
    await page.waitForTimeout(1500);
  }

  const learnTab = page.locator('[data-lounge-tv-tab="learn"]').first();
  if (await learnTab.count()) {
    await learnTab.click({ timeout: 10000 });
    await page.waitForTimeout(800);
  }

  const careCard = page.locator('[data-lounge-tv-focus-id="learn-mastery-care"]').first();
  if (await careCard.count()) {
    await careCard.click({ force: true });
    await page.waitForTimeout(1000);
  } else {
    const anyMastery = page.locator('[data-lounge-tv-focus-id^="learn-mastery-"]').first();
    await anyMastery.click({ force: true });
    await page.waitForTimeout(1000);
  }

  await page.locator('.lounge-tv-season-preview-panel').first().waitFor({ state: 'visible', timeout: 25000 });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();

try {
  await openCareMasteryDetail(page);
  await mkdir(OUT, { recursive: true });

  const metrics = await page.evaluate(() => {
    const panel = document.querySelector('.lounge-tv-season-preview-panel');
    const rail = document.querySelector('.lounge-tv-season-episode-rail');
    const cells = [...document.querySelectorAll('.lounge-tv-season-episode-rail__cell')];
    const thumbs = [...document.querySelectorAll('.lounge-tv-season-episode-thumb')];
    const panelRect = panel?.getBoundingClientRect();
    const railRect = rail?.getBoundingClientRect();
    const cellWidths = cells.map((c) => Math.round(c.getBoundingClientRect().width));
    const visibleInRail = cells.filter((c) => {
      const r = c.getBoundingClientRect();
      return r.left >= (railRect?.left ?? 0) - 2 && r.left < (railRect?.right ?? 9999);
    }).length;
    const states = thumbs.map((t) => {
      const cls = [...t.classList].find((x) => x.startsWith('lounge-tv-season-episode-thumb--'));
      return cls?.replace('lounge-tv-season-episode-thumb--', '') ?? null;
    });
    return {
      panelWidth: panelRect ? Math.round(panelRect.width) : null,
      railScrollWidth: rail?.scrollWidth ?? null,
      railClientWidth: railRect ? Math.round(railRect.width) : null,
      cellWidths,
      visibleThumbsApprox: visibleInRail,
      thumbCount: thumbs.length,
      states,
      pageScrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  const glass = page.locator('[data-lounge-tv-glass]').first();
  await glass.screenshot({ path: `${OUT}/mastery-detail-tv-glass.png` });
  await page.locator('.lounge-tv-season-preview-panel').first().screenshot({
    path: `${OUT}/mastery-detail-season-panel.png`,
  });

  const rail = page.locator('.lounge-tv-season-episode-rail').first();
  if (await rail.count()) {
    await rail.evaluate((el) => {
      el.scrollLeft = Math.min(el.scrollWidth, el.clientWidth * 0.5);
    });
    await page.waitForTimeout(400);
    await page.locator('.lounge-tv-season-preview-panel').first().screenshot({
      path: `${OUT}/mastery-detail-rail-scrolled.png`,
    });
  }

  await writeFile(`${OUT}/mastery-detail-metrics.json`, JSON.stringify({ base: BASE, ...metrics }, null, 2));
  console.log(JSON.stringify({ base: BASE, out: OUT, ...metrics }, null, 2));
} finally {
  await browser.close();
}
