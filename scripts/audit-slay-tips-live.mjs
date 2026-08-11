/**
 * Live preview Slay Tips audit — WebKit + Chromium, local + preview.fsbw-dev.com
 * Usage: node scripts/audit-slay-tips-live.mjs [baseUrl]
 */
import { chromium, webkit, devices } from '@playwright/test';

const BASE = process.argv[2] || process.env.E2E_BASE_URL || 'http://127.0.0.1:3001';

async function auditPage(page, label) {
  await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.evaluate(() => {
    sessionStorage.setItem('loungeTvSessionOpen', '1');
    sessionStorage.setItem('loungeTvSessionMainTab', 'learn');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const pinboard = page.locator('.lounge-tv-slay-tips-pinboard').first();
  if (!(await pinboard.count())) {
    const play = page.locator('[data-lounge-tv-play]').first();
    if (await play.count()) {
      await play.click({ force: true });
      await page.waitForTimeout(2000);
      await page.locator('[data-lounge-tv-tab="learn"]').first().click();
      await page.waitForTimeout(1000);
    }
  }
  await pinboard.waitFor({ state: 'visible', timeout: 25000 });

  const data = await page.evaluate(() => {
    const pinboardEl = document.querySelector('.lounge-tv-slay-tips-pinboard');
    const shell = document.querySelector('.lounge-tv-slay-tips-board-shell');
    const wraps = [...document.querySelectorAll('.lounge-tv-slay-tip-pin-wrap')];
    const pins = [...document.querySelectorAll('.lounge-tv-slay-tip-pin')];
    const images = [...document.querySelectorAll('.lounge-tv-slay-tip-pin__image')];

    const cs = (el) => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return {
        display: s.display,
        width: s.width,
        maxWidth: s.maxWidth,
        minWidth: s.minWidth,
        height: s.height,
        columnCount: s.columnCount || s.webkitColumnCount,
        columnGap: s.columnGap,
        overflow: s.overflow,
        contain: s.contain,
        containerType: s.containerType,
        containerName: s.containerName,
        position: s.position,
        transform: s.transform,
        zoom: s.zoom,
        breakInside: s.breakInside,
      };
    };

    const rect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    };

    return {
      route: location.pathname,
      userAgent: navigator.userAgent.slice(0, 80),
      dpr: window.devicePixelRatio,
      viewport: { w: window.innerWidth, h: window.innerHeight },
      glass: rect(document.querySelector('[data-lounge-tv-glass]')),
      shell: { style: cs(shell), rect: rect(shell) },
      pinboard: { style: cs(pinboardEl), rect: rect(pinboardEl) },
      pinCount: wraps.length,
      wraps: wraps.slice(0, 6).map((w, i) => ({
        i,
        wrap: rect(w),
        pin: rect(w.querySelector('.lounge-tv-slay-tip-pin')),
        image: rect(w.querySelector('.lounge-tv-slay-tip-pin__image')),
        media: rect(w.querySelector('.lounge-tv-slay-tip-pin__media')),
        pinStyle: cs(w.querySelector('.lounge-tv-slay-tip-pin')),
        imageStyle: cs(w.querySelector('.lounge-tv-slay-tip-pin__image')),
      })),
      uniqueWrapLefts: [...new Set(wraps.map((w) => Math.round(w.getBoundingClientRect().left)))].sort((a, b) => a - b),
      renderPath: {
        section: Boolean(document.querySelector('.lounge-tv-slay-tips-discovery-section')),
        boardShell: Boolean(shell),
        pinboard: Boolean(pinboardEl),
        discoveryRail: document.querySelector('[data-lounge-tv-rail]')?.getAttribute('data-lounge-tv-rail'),
      },
    };
  });

  return { label, base: BASE, ...data };
}

async function run(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  try {
    return await auditPage(page, `${name} @ ${BASE}`);
  } finally {
    await browser.close();
  }
}

const results = [];
for (const [name, browserType] of [
  ['chromium-local', chromium],
  ['webkit-local', webkit],
]) {
  try {
    results.push(await run(browserType, name));
  } catch (e) {
    results.push({ label: name, base: BASE, error: e.message });
  }
}

console.log(JSON.stringify(results, null, 2));
