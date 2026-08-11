/**
 * Audit Slay Tips masonry layout — computed styles on ancestor chain.
 * Usage: node scripts/audit-slay-tips-layout.mjs
 */
import { chromium, devices } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3001';

async function audit(page) {
  await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    sessionStorage.setItem('loungeTvSessionOpen', '1');
    sessionStorage.setItem('loungeTvSessionMainTab', 'learn');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const pinboard = page.locator('.lounge-tv-slay-tips-pinboard').first();
  if (!(await pinboard.count())) {
    const play = page.locator('[data-lounge-tv-play]').first();
    if (await play.count()) {
      await play.click({ force: true });
      await page.waitForTimeout(2000);
    }
    const learnTab = page.locator('[data-lounge-tv-tab="learn"]').first();
    if (await learnTab.count()) {
      await learnTab.click();
      await page.waitForTimeout(1000);
    }
  }

  await pinboard.waitFor({ state: 'visible', timeout: 20000 });

  const audit = await page.evaluate(() => {
    const pin = document.querySelector('.lounge-tv-slay-tip-pin-wrap');
    const pinboardEl = document.querySelector('.lounge-tv-slay-tips-pinboard');
    if (!pin || !pinboardEl) return { error: 'missing pin or pinboard' };

    const props = [
      'display', 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight',
      'overflow', 'overflowX', 'overflowY', 'position', 'flexDirection', 'flexGrow',
      'flexShrink', 'flexBasis', 'alignItems', 'justifyContent', 'gridTemplateColumns',
      'gridAutoFlow', 'gridAutoColumns', 'gridAutoRows', 'gridColumn', 'gridRow', 'gap',
      'columnCount', 'columnGap', 'columnWidth', 'columns', 'aspectRatio', 'contain', 'containerType', 'containerName',
      'transform', 'zoom',
    ];

    const snapshot = (el, label) => {
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const out = { label, tag: el.tagName, className: el.className, rect: { w: rect.width, h: rect.height } };
      for (const p of props) {
        const v = cs[p];
        if (v && v !== 'normal' && v !== 'none' && v !== 'auto' && v !== 'static' && v !== 'visible' && v !== '0px' && v !== 'row' && v !== 'stretch' && v !== 'start' && v !== 'baseline' && v !== 'flow' && v !== '0' && v !== 'false') {
          out[p] = v;
        }
      }
      return out;
    };

    const chain = [];
    let el = pin;
    while (el) {
      chain.push(snapshot(el, el.className?.split?.(' ')?.[0] || el.tagName));
      if (el.classList?.contains('lounge-tv-screen-root') || el.hasAttribute?.('data-lounge-tv-glass')) break;
      el = el.parentElement;
    }

    const pins = [...document.querySelectorAll('.lounge-tv-slay-tip-pin-wrap')];
    const pinRects = pins.map((p, i) => {
      const r = p.getBoundingClientRect();
      return { i, left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    });

    const glass = document.querySelector('[data-lounge-tv-glass]');
    const glassRect = glass?.getBoundingClientRect();

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      glass: glassRect ? { w: Math.round(glassRect.width), h: Math.round(glassRect.height) } : null,
      pinCount: pins.length,
      pinRects,
      uniqueLefts: [...new Set(pinRects.map((p) => p.left))].sort((a, b) => a - b),
      pinboard: snapshot(pinboardEl, 'pinboard'),
      chain,
    };
  });

  console.log(JSON.stringify(audit, null, 2));
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();
try {
  await audit(page);
} catch (e) {
  console.error('AUDIT FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
