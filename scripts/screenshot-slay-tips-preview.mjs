/**
 * Capture TV-glass screenshot of Slay Tips board on live preview.
 * Usage: node scripts/screenshot-slay-tips-preview.mjs [baseUrl]
 */
import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] || 'https://preview.fsbw-dev.com';
const OUT = '/opt/cursor/artifacts/screenshots';

async function openLearnSlayTips(page) {
  await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.evaluate(() => {
    sessionStorage.setItem('loungeTvSessionOpen', '1');
    sessionStorage.setItem('loungeTvSessionMainTab', 'learn');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const pinboard = page.locator('.lounge-tv-slay-tips-pinboard').first();
  if (!(await pinboard.isVisible().catch(() => false))) {
    const play = page.locator('[data-lounge-tv-play]').first();
    if (await play.count()) {
      await play.click({ force: true, timeout: 10000 });
      await page.waitForTimeout(2000);
    }
    const learnTab = page.locator('[data-lounge-tv-tab="learn"]').first();
    if (await learnTab.count()) {
      await learnTab.click({ timeout: 10000 });
      await page.waitForTimeout(1000);
    }
  }
  await pinboard.waitFor({ state: 'visible', timeout: 25000 });
  await pinboard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();

try {
  await openLearnSlayTips(page);

  const metrics = await page.evaluate(() => {
    const pinboard = document.querySelector('.lounge-tv-slay-tips-pinboard');
    const cs = pinboard ? getComputedStyle(pinboard) : null;
    const wraps = [...document.querySelectorAll('.lounge-tv-slay-tip-pin-wrap')];
    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };
    const archetypes = wraps.slice(0, 6).map((w) => {
      const pin = w.querySelector('.lounge-tv-slay-tip-pin');
      return pin?.className.match(/lounge-tv-slay-tip-pin--(\w+)/)?.[1] ?? null;
    });
    return {
      boardVersion: document.querySelector('[data-slay-tips-board-version]')?.getAttribute('data-slay-tips-board-version'),
      display: cs?.display,
      gridTemplateColumns: cs?.gridTemplateColumns,
      pinCount: wraps.length,
      uniqueLefts: [...new Set(wraps.map((w) => Math.round(w.getBoundingClientRect().left)))].sort((a, b) => a - b),
      archetypes,
      wraps: wraps.slice(0, 6).map((w, i) => ({
        i,
        archetype: archetypes[i],
        wrap: rect(w),
        pin: rect(w.querySelector('.lounge-tv-slay-tip-pin')),
      })),
    };
  });

  await mkdir(OUT, { recursive: true });
  const glass = page.locator('[data-lounge-tv-glass]').first();
  await glass.screenshot({ path: `${OUT}/slay-tips-tv-glass.png` });
  await page.locator('.lounge-tv-slay-tips-pinboard').first().screenshot({ path: `${OUT}/slay-tips-pinboard.png` });

  await writeFile(`${OUT}/slay-tips-metrics.json`, JSON.stringify({ base: BASE, ...metrics }, null, 2));
  console.log(JSON.stringify({ base: BASE, out: OUT, ...metrics }, null, 2));
} finally {
  await browser.close();
}
