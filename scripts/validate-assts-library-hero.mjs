/**
 * Validate ASSTS Library Home hero lock at 711px reference width.
 * Usage: node scripts/validate-assts-library-hero.mjs
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const REF_W = 711;
const url = process.env.ASSTS_URL || 'http://127.0.0.1:3001/assts?heroRefMap=1';
const outDir = '/opt/cursor/artifacts';

const mockLibrary = {
  ok: true,
  summary: {
    totalAssets: 128,
    batches: 12,
    needsReview: 9,
    approved: 84,
    locked: 35,
    batchesList: [],
  },
  categories: [
    { id: 'environments', label: '01 ENVIRONMENTS', count: 32, coverUrl: null },
    { id: 'objects', label: '02 OBJECTS', count: 128, coverUrl: null },
  ],
  priorityBatch: null,
};

const HERO_ASSET_PATH = '52D76B9A-8808-4A00-A89D-28767F21E385.png';

function heroCanonicalUrl() {
  const base = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');
  return base ? `${base}/storage/v1/object/public/live-preview/site00/${HERO_ASSET_PATH}` : null;
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: REF_W, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.addInitScript(() => {
  localStorage.setItem('isSignedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
  sessionStorage.setItem('site00-assts-immersive-complete', '1');
});

await page.route('**/api/admin/site00-assts**', async (route) => {
  const reqUrl = route.request().url();
  if (reqUrl.includes('action=slots') && reqUrl.includes('assts.library.hero.mobile')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        resolved: { slotKey: 'assts.library.hero.mobile', source: 'fallback', url: heroCanonicalUrl(), thumbnailUrl: heroCanonicalUrl() },
      }),
    });
    return;
  }
  if (reqUrl.includes('action=library') || reqUrl.includes('action=resolve-slot')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        reqUrl.includes('resolve-slot') ? { ok: true, resolved: { url: null, source: 'fallback' } } : mockLibrary,
      ),
    });
    return;
  }
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
});

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('.assts-lib-hero-zone', { timeout: 30000 });
await page.waitForTimeout(1500);

const measurements = await page.evaluate(() => {
  const canvas = document.querySelector('.assts-library-composition');
  const heroRegion = document.querySelector('[data-composition-region="hero"]');
  const heroImg = document.querySelector('.assts-lib-hero-zone__image');
  const title = document.querySelector('.assts-lib-text--title');
  if (!canvas || !heroRegion || !heroImg) return null;
  const canvasRect = canvas.getBoundingClientRect();
  const heroRect = heroRegion.getBoundingClientRect();
  const imgRect = heroImg.getBoundingClientRect();
  const titleRect = title?.getBoundingClientRect();
  return {
    canvasWidth: canvasRect.width,
    hero: {
      x: heroRect.left - canvasRect.left,
      y: heroRect.top - canvasRect.top,
      w: heroRect.width,
      h: heroRect.height,
    },
    imgSrc: heroImg.currentSrc,
    imgNatural: { w: heroImg.naturalWidth, h: heroImg.naturalHeight },
    titleY: titleRect ? titleRect.top - canvasRect.top : null,
    status: document.querySelector('.assts-lib-hero-zone')?.getAttribute('data-composition-status'),
    zoneId: document.querySelector('.assts-lib-hero-zone')?.getAttribute('data-composition-zone'),
  };
});

const report = {
  expectedHeroHeight: 531,
  measurements,
  heroHeightDelta: measurements ? Math.round(measurements.hero.h - 531) : null,
};

await page.screenshot({ path: `${outDir}/assts_library_hero_debug_711px.png`, fullPage: false });

await page.goto('http://127.0.0.1:3001/assts', { waitUntil: 'networkidle' });
await page.waitForSelector('.assts-lib-hero-zone', { timeout: 30000 });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${outDir}/assts_library_hero_clean_711px.png`, fullPage: false });

await writeFile(`${outDir}/assts_library_hero_report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
