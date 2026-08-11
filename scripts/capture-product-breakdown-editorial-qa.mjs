/**
 * QA capture for Product Breakdown detail redesign.
 * Usage: node scripts/capture-product-breakdown-editorial-qa.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = '/opt/cursor/artifacts/screenshots/product-breakdown-editorial';
const BASE = (process.env.E2E_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const BREAKDOWN_ID = 'product-breakdown-blanco';

mkdirSync(OUT, { recursive: true });

async function enterLearn(page) {
  await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(1500);
  await page.locator('[data-lounge-tv-play]').click();
  await page.waitForTimeout(2500);
  await page.locator('[data-lounge-tv-tab="learn"]').click();
  await page.waitForTimeout(1500);
}

async function openBlancoBreakdown(page) {
  await enterLearn(page);
  await page.locator('[data-lounge-tv-focus-id="product-education-view-all"]').click();
  await page.waitForTimeout(800);
  const card = page.locator('[data-lounge-tv-focus-id="product-guide-signature-units"]').filter({ hasText: 'BLANCO' });
  await card.first().waitFor({ state: 'visible', timeout: 30_000 });
  await card.first().click();
  await page.waitForSelector('.lounge-tv-product-breakdown-editorial__product-name', { timeout: 30_000 });
  await page.waitForTimeout(800);
}

async function scrollArticle(page, ratio) {
  await page.evaluate((r) => {
    const el = document.querySelector('.lounge-tv-product-breakdown-viewer__scroll');
    if (!el) return;
    el.scrollTop = (el.scrollHeight - el.clientHeight) * r;
  }, ratio);
  await page.waitForTimeout(400);
}

console.log(`Capturing Product Breakdown editorial QA from ${BASE}`);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
await openBlancoBreakdown(page);

await page.screenshot({ path: `${OUT}/chrome-A-masthead-hero.png` });
await scrollArticle(page, 0.18);
await page.screenshot({ path: `${OUT}/chrome-B-at-a-glance.png` });
await scrollArticle(page, 0.38);
await page.screenshot({ path: `${OUT}/chrome-C-look-closer.png` });
await scrollArticle(page, 0.55);
await page.screenshot({ path: `${OUT}/chrome-D-inside-unit.png` });
await scrollArticle(page, 0.68);
await page.screenshot({ path: `${OUT}/chrome-E-product-note-why.png` });
await scrollArticle(page, 0.82);
await page.screenshot({ path: `${OUT}/chrome-F-receive-footer.png` });
await scrollArticle(page, 0.94);
await page.screenshot({ path: `${OUT}/chrome-G-cta-engagement.png` });

const playCount = await page.getByText(/^PLAY$/).count();
const readGuideCount = await page.getByText('READ GUIDE').count();
const freePreviewCount = await page.getByText('FREE PREVIEW').count();
console.log(`PLAY:${playCount} READ_GUIDE:${readGuideCount} FREE_PREVIEW:${freePreviewCount}`);

await page.locator('[aria-label*="comments" i]').first().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/chrome-H-comments-drawer.png` });

await browser.close();
console.log(`Done — ${OUT} (${BREAKDOWN_ID})`);
