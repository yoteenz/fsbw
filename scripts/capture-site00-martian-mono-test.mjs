/**
 * Capture SITE 00 Martian Mono typography comparison screenshots.
 * Usage: node scripts/capture-site00-martian-mono-test.mjs
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.SITE00_URL || 'http://127.0.0.1:3001';
const outDir = process.env.OUT_DIR || '/opt/cursor/artifacts';

const mockLibrary = {
  ok: true,
  summary: {
    totalAssets: 128,
    batches: 12,
    needsReview: 9,
    approved: 84,
    locked: 35,
    batchesList: [
      {
        id: 'b1',
        batch_key: 'BATCH-ASSTS-ENV-003',
        display_name: 'BATCH-ASSTS-ENV-003',
        category: 'ENVIRONMENTS',
        status: 'IN_REVIEW',
        counts: { total: 13, approved: 9, needsReview: 4 },
        thumbnailUrl: null,
      },
    ],
  },
  categories: [
    { id: 'environments', label: '01 ENVIRONMENTS', count: 32, coverUrl: null },
    { id: 'objects', label: '02 OBJECTS', count: 128, coverUrl: null },
  ],
  priorityBatch: {
    id: 'pb1',
    batch_key: 'BATCH-ASSTS-ENV-003',
    display_name: 'BATCH-ASSTS-ENV-003',
    category: 'ENVIRONMENTS',
    status: 'IN_REVIEW',
    counts: { total: 13, approved: 9, needsReview: 4, regenerating: 0, rejected: 0 },
    thumbnailUrl: null,
    progressPercent: 67,
  },
};

function adminInitScript(immersiveComplete) {
  return () => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
    if (immersiveComplete) {
      sessionStorage.setItem('site00-assts-immersive-complete', '1');
    } else {
      sessionStorage.removeItem('site00-assts-immersive-complete');
    }
  };
}

async function mockAsstsApi(page, { stallLibrary = false } = {}) {
  await page.route('**/api/admin/site00-assts**', async (route) => {
    const url = new URL(route.request().url());
    const action = url.searchParams.get('action') || 'library';
    if (action === 'resolve-slot') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, resolved: { url: null, source: 'fallback' } }),
      });
      return;
    }
    if (action === 'library') {
      if (stallLibrary) {
        await new Promise((r) => setTimeout(r, 120_000));
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockLibrary),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
}

async function readFontProbe(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return {
      fontFamily: s.fontFamily,
      fontWeight: s.fontWeight,
      fontStretch: s.fontStretch,
      letterSpacing: s.letterSpacing,
      isMartian: s.fontFamily.toLowerCase().includes('martian mono'),
    };
  }, selector);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const report = { captures: [], fontProbes: [] };

/* Origin desktop + mobile */
{
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/origin`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  report.captures.push(path.join(outDir, 'site00_origin_desktop_martian_mono.png'));
  await page.screenshot({ path: report.captures.at(-1), fullPage: false });

  report.fontProbes.push({
    surface: 'origin-desktop',
    hero: await readFontProbe(page, '.site00-display-xl'),
    tagline: await readFontProbe(page, '.site00-tagline'),
    nav: await readFontProbe(page, '.site00-global-nav a'),
    body: await readFontProbe(page, '.site00-body'),
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  report.captures.push(path.join(outDir, 'site00_origin_mobile_martian_mono.png'));
  await page.screenshot({ path: report.captures.at(-1), fullPage: false });

  await context.close();
}

/* ASSTS library */
{
  const context = await browser.newContext({ viewport: { width: 711, height: 1600 } });
  const page = await context.newPage();
  await page.addInitScript(adminInitScript(true));
  await mockAsstsApi(page);

  await page.goto(`${base}/assts`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.assts-library-composition', { timeout: 45000, state: 'attached' });
  await page.waitForTimeout(2000);
  report.captures.push(path.join(outDir, 'site00_assts_library_martian_mono.png'));
  await page.screenshot({ path: report.captures.at(-1), fullPage: false });

  report.fontProbes.push({
    surface: 'assts-library',
    vaultTitle: await readFontProbe(page, '.assts-library-home__title'),
    nav: await readFontProbe(page, '.site00-assts-mobile-nav__item'),
  });

  await context.close();
}

/* ASSTS loader (stalled API keeps loader visible) */
{
  const context = await browser.newContext({ viewport: { width: 711, height: 1600 } });
  const page = await context.newPage();
  await page.addInitScript(adminInitScript(false));
  await mockAsstsApi(page, { stallLibrary: true });

  await page.goto(`${base}/assts`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.site00-loader-copy__title', { timeout: 45000, state: 'attached' });
  await page.waitForTimeout(2000);
  report.captures.push(path.join(outDir, 'site00_assts_loader_martian_mono.png'));
  await page.screenshot({ path: report.captures.at(-1), fullPage: false });

  report.fontProbes.push({
    surface: 'assts-loader',
    title: await readFontProbe(page, '.site00-loader-copy__title'),
    eyebrow: await readFontProbe(page, '.site00-loader-copy__eyebrow'),
    pct: await readFontProbe(page, '.site00-loader-copy__pct'),
  });

  await context.close();
}

await writeFile(path.join(outDir, 'site00_martian_mono_test_report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
