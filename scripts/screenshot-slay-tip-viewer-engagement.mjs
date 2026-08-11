/**
 * Capture Slay Tip viewer engagement states inside Lounge TV glass.
 * Usage: node scripts/screenshot-slay-tip-viewer-engagement.mjs [baseUrl]
 */
import { chromium, devices } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.argv[2] || 'http://127.0.0.1:3001';
const OUT = '/opt/cursor/artifacts/screenshots';

async function openLoungeLearnSlayTips(page) {
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
}

async function openFirstSlayTip(page) {
  const pin = page.locator('.lounge-tv-slay-tip-pin').first();
  await pin.waitFor({ state: 'visible', timeout: 15000 });
  await pin.click({ force: true, timeout: 10000 });
  await page.waitForTimeout(1200);
  await page.locator('.lounge-tv-slay-tip-viewer').first().waitFor({ state: 'visible', timeout: 15000 });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'] });
const page = await context.newPage();

try {
  await mkdir(OUT, { recursive: true });
  await openLoungeLearnSlayTips(page);
  await openFirstSlayTip(page);

  const glass = page.locator('[data-lounge-tv-glass]').first();
  const viewer = page.locator('.lounge-tv-slay-tip-viewer').first();
  const bar = page.locator('[data-lounge-engagement-bar]').first();

  await glass.screenshot({ path: `${OUT}/slay-tip-viewer-default.png` });
  await viewer.screenshot({ path: `${OUT}/slay-tip-viewer-engagement-bar.png` });

  const commentsBtn = bar.locator('button').nth(1);
  if (await commentsBtn.count()) {
    await commentsBtn.click({ force: true });
    await page.waitForTimeout(800);
    await viewer.screenshot({ path: `${OUT}/slay-tip-viewer-comments-open.png` });

    const composer = page.locator('.lounge-tv-discussion-panel__composer').first();
    if (await composer.isVisible().catch(() => false)) {
      await composer.click({ force: true });
      await page.waitForTimeout(300);
      await viewer.screenshot({ path: `${OUT}/slay-tip-viewer-composer-active.png` });
    }

    const closeBtn = page.locator('.lounge-tv-discussion-panel button', { hasText: 'CLOSE' }).first();
    if (await closeBtn.count()) {
      await closeBtn.click({ force: true });
      await page.waitForTimeout(400);
    }
  }

  const saveBtn = bar.locator('.lounge-tv-engagement-bar__action--save');
  if (await saveBtn.count()) {
    await saveBtn.click({ force: true });
    await page.waitForTimeout(400);
    await viewer.screenshot({ path: `${OUT}/slay-tip-viewer-saved.png` });
  }

  const likeBtn = bar.locator('button').first();
  if (await likeBtn.count()) {
    await likeBtn.click({ force: true });
    await page.waitForTimeout(400);
    const signInCancel = page.locator('button', { hasText: 'CANCEL' }).first();
    if (await signInCancel.isVisible().catch(() => false)) {
      await signInCancel.click({ force: true });
      await page.waitForTimeout(300);
    } else {
      await viewer.screenshot({ path: `${OUT}/slay-tip-viewer-liked.png` });
    }
  }

  await glass.screenshot({ path: `${OUT}/slay-tip-viewer-mobile-tv-glass.png` });

  const metrics = await page.evaluate(() => {
    const barEl = document.querySelector('[data-lounge-engagement-bar]');
    const viewerEl = document.querySelector('.lounge-tv-slay-tip-viewer');
    const panelEl = document.querySelector('.lounge-tv-discussion-panel');
    return {
      hasEngagementBar: Boolean(barEl),
      hasEditorialVariant: barEl?.classList.contains('lounge-tv-engagement-bar--editorial'),
      viewerBounds: viewerEl?.getBoundingClientRect(),
      barActions: barEl ? barEl.querySelectorAll('button').length : 0,
      panelOpen: Boolean(panelEl),
    };
  });

  await writeFile(`${OUT}/slay-tip-viewer-engagement-metrics.json`, JSON.stringify({ base: BASE, ...metrics }, null, 2));
  console.log(JSON.stringify({ base: BASE, out: OUT, ...metrics }, null, 2));
} finally {
  await browser.close();
}
