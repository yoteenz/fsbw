/**
 * QA capture for PSA Answer detail redesign.
 * Usage: node scripts/capture-psa-answer-editorial-qa.mjs
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = '/opt/cursor/artifacts/screenshots/psa-answer-editorial';
const BASE = (process.env.E2E_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const ANSWER_ID = 'psa-answer-lace-lift';

mkdirSync(OUT, { recursive: true });

async function enterLearn(page) {
  await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(1500);
  await page.locator('[data-lounge-tv-play]').click();
  await page.waitForTimeout(2500);
  await page.locator('[data-lounge-tv-tab="learn"]').click();
  await page.waitForTimeout(1500);
}

async function openAnswer(page) {
  await enterLearn(page);
  const card = page.locator(`[data-lounge-tv-focus-id="psa-answer-${ANSWER_ID}"]`);
  await card.first().waitFor({ state: 'visible', timeout: 30_000 });
  await card.first().click();
  await page.waitForSelector('.lounge-tv-psa-answer-editorial__question', { timeout: 30_000 });
  await page.waitForTimeout(800);
}

async function scrollArticle(page, ratio) {
  await page.evaluate((r) => {
    const el = document.querySelector('.lounge-tv-psa-answer-viewer__scroll');
    if (!el) return;
    el.scrollTop = (el.scrollHeight - el.clientHeight) * r;
  }, ratio);
  await page.waitForTimeout(400);
}

console.log(`Capturing PSA Answer editorial QA from ${BASE}`);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
await openAnswer(page);

await page.screenshot({ path: `${OUT}/refine-1-opening-question-image.png` });
await scrollArticle(page, 0.22);
await page.screenshot({ path: `${OUT}/refine-2-psa-says-causes.png` });
await scrollArticle(page, 0.42);
await page.screenshot({ path: `${OUT}/refine-3-look-here.png` });
await scrollArticle(page, 0.58);
await page.screenshot({ path: `${OUT}/refine-4-psa-note-try-first.png` });
await scrollArticle(page, 0.72);
await page.screenshot({ path: `${OUT}/refine-5-escalation.png` });
await scrollArticle(page, 0.86);
await page.screenshot({ path: `${OUT}/refine-6-related-deeper.png` });
await scrollArticle(page, 1);
await page.screenshot({ path: `${OUT}/refine-7-engagement.png` });

/* legacy names retained for comparison */
await scrollArticle(page, 0);
await page.screenshot({ path: `${OUT}/chrome-A-masthead-psa-says.png` });
await scrollArticle(page, 0.25);
await page.screenshot({ path: `${OUT}/chrome-B-likely-causes.png` });
await scrollArticle(page, 0.45);
await page.screenshot({ path: `${OUT}/chrome-C-look-here.png` });
await scrollArticle(page, 0.62);
await page.screenshot({ path: `${OUT}/chrome-D-psa-note-try-first.png` });
await scrollArticle(page, 0.82);
await page.screenshot({ path: `${OUT}/chrome-E-escalation-related.png` });
await scrollArticle(page, 1);
await page.screenshot({ path: `${OUT}/chrome-F-helpful-engagement.png` });

const playCount = await page.getByText(/^PLAY$/).count();
const readGuideCount = await page.getByText('READ GUIDE').count();
const freePreviewCount = await page.getByText('FREE PREVIEW').count();
console.log(`PLAY:${playCount} READ_GUIDE:${readGuideCount} FREE_PREVIEW:${freePreviewCount}`);

await page.locator('[aria-label*="comments" i]').first().click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/chrome-G-comments-drawer.png` });

await browser.close();
console.log(`Done — ${OUT}`);
