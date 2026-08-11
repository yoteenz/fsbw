/**
 * One-off QA capture for Slay Tip editorial detail redesign.
 * Usage: node scripts/capture-slay-tip-editorial-qa.mjs
 */
import { chromium, webkit } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = '/opt/cursor/artifacts/screenshots/slay-tip-editorial';
const BASE = (process.env.E2E_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const TIP_ID = 'slay-tip-dev-density-lace-not-dirty';

mkdirSync(OUT, { recursive: true });

async function enterLounge(page) {
  await page.goto(`${BASE}/lobby/lounge`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(1500);

  const pressToPlay = page.locator('[data-lounge-tv-play]');
  if (await pressToPlay.count()) {
    await pressToPlay.first().click();
    await page.waitForTimeout(2500);
  }

  const learnTab = page.locator('[data-lounge-tv-tab="learn"]');
  await learnTab.waitFor({ state: 'visible', timeout: 30_000 });
  await learnTab.click();
  await page.waitForTimeout(1500);
}

async function openSlayTip(page) {
  await enterLounge(page);

  const tipPin = page.locator(`[data-lounge-tv-focus-id="${TIP_ID}"]`);
  await tipPin.first().waitFor({ state: 'visible', timeout: 30_000 });
  await tipPin.first().click();
  await page.waitForSelector('.lounge-tv-slay-tip-editorial__title', { timeout: 30_000 });
  await page.waitForTimeout(800);
}

async function scrollArticle(page, ratio) {
  await page.evaluate((r) => {
    const el = document.querySelector('.lounge-tv-slay-tip-viewer__scroll');
    if (!el) return;
    el.scrollTop = (el.scrollHeight - el.clientHeight) * r;
  }, ratio);
  await page.waitForTimeout(400);
}

async function captureSet(browserType, label, launchOpts = {}) {
  const browser = await browserType.launch({ headless: true, ...launchOpts });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent:
      label === 'safari'
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
  });
  const page = await context.newPage();

  try {
    await openSlayTip(page);

    await page.screenshot({ path: `${OUT}/${label}-A-masthead-hero.png` });

    await scrollArticle(page, 0.22);
    await page.screenshot({ path: `${OUT}/${label}-B-quick-read.png` });

    await scrollArticle(page, 0.42);
    await page.screenshot({ path: `${OUT}/${label}-C-look-closer.png` });

    await scrollArticle(page, 0.62);
    await page.screenshot({ path: `${OUT}/${label}-D-slayer-note-comparison.png` });

    await scrollArticle(page, 0.82);
    await page.screenshot({ path: `${OUT}/${label}-E-takeaway-related.png` });

    await scrollArticle(page, 1);
    await page.screenshot({ path: `${OUT}/${label}-F-engagement.png` });

    const commentsBtn = page.locator('[data-lounge-engagement-bar] button').filter({ hasText: /COMMENTS|comment/i });
    if (await commentsBtn.count()) {
      await commentsBtn.first().click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${OUT}/${label}-G-comments-drawer.png` });
    }

    const hasPrev = await page.getByText('PREVIOUS').count();
    const hasFinish = await page.getByText('FINISH').count();
    const hasPagination = await page.getByText(/\d+\s*\/\s*\d+/).count();

    console.log(`[${label}] PREVIOUS:${hasPrev} FINISH:${hasFinish} pagination:${hasPagination}`);
    console.log(`[${label}] screenshots saved to ${OUT}`);
  } finally {
    await browser.close();
  }
}

console.log(`Capturing Slay Tip editorial QA from ${BASE}`);
await captureSet(chromium, 'chrome');
await captureSet(webkit, 'safari');
console.log('Done.');
