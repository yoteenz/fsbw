import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const REF_W = 711;
const url = process.env.LOADER_URL || 'http://127.0.0.1:3001/assts?loaderRefMap=1';
const outDir = '/opt/cursor/artifacts';

const REGIONS = {
  geometry: { x: 238, y: 209, w: 220, h: 535 },
  pedestal: { x: 122, y: 687, w: 468, h: 121 },
  'copy.eyebrow': { x: 319, y: 877, w: 74, h: 20 },
  'copy.title': { x: 75, y: 914, w: 561, h: 43 },
  'copy.subtitle': { x: 179, y: 982, w: 354, h: 25 },
  'copy.status': { x: 289, y: 1095, w: 135, h: 22 },
  'copy.progress': { x: 76, y: 1138, w: 572, h: 23 },
  'copy.tagline': { x: 76, y: 1216, w: 572, h: 22 },
  'copy.signature': { x: 317, y: 1300, w: 78, h: 91 },
};

const PRIMARY = Object.keys(REGIONS);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: REF_W, height: 1600 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.addInitScript(() => {
  localStorage.setItem('isSignedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
  sessionStorage.removeItem('site00-assts-immersive-complete');
});

await page.route('**/api/admin/site00-assts**', async (route) => {
  await new Promise((r) => setTimeout(r, 60_000));
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      ok: true,
      summary: { totalAssets: 0, batches: 0, needsReview: 0, approved: 0, locked: 0, batchesList: [] },
      categories: [],
      priorityBatch: null,
    }),
  });
});

await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForSelector('.site00-loader-stage', { timeout: 30000 });
await page.waitForTimeout(2500);

const measurements = await page.evaluate((ids) => {
  const stage = document.querySelector('.site00-loader-stage');
  if (!stage) return null;
  const stageRect = stage.getBoundingClientRect();
  const scale = stageRect.width / 711;
  const rows = [];
  for (const id of ids) {
    const el = stage.querySelector(`[data-loader-region="${id}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    rows.push({
      id,
      scale,
      actual: {
        x: r.left - stageRect.left,
        y: r.top - stageRect.top,
        w: r.width,
        h: r.height,
      },
    });
  }
  return { stageWidth: stageRect.width, rows };
}, PRIMARY);

const report = [];
if (measurements) {
  for (const row of measurements.rows) {
    const ref = REGIONS[row.id];
    const expected = {
      x: ref.x * row.scale,
      y: ref.y * row.scale,
      w: ref.w * row.scale,
      h: ref.h * row.scale,
    };
    report.push({
      id: row.id,
      expected: {
        x: Math.round(expected.x),
        y: Math.round(expected.y),
        w: Math.round(expected.w),
        h: Math.round(expected.h),
      },
      actual: {
        x: Math.round(row.actual.x),
        y: Math.round(row.actual.y),
        w: Math.round(row.actual.w),
        h: Math.round(row.actual.h),
      },
      delta: {
        x: Math.round(row.actual.x - expected.x),
        y: Math.round(row.actual.y - expected.y),
        w: Math.round(row.actual.w - expected.w),
        h: Math.round(row.actual.h - expected.h),
      },
    });
  }
}

await page.screenshot({ path: `${outDir}/assts_loader_composition_711px_mid.png`, fullPage: false });

await page.evaluate(() => {
  const status = document.querySelector('.site00-loader-copy__status');
  if (status) status.textContent = 'ASSET VAULT READY';
  const fill = document.querySelector('.site00-loader-copy__fill');
  if (fill instanceof HTMLElement) fill.style.width = '100%';
  const pct = document.querySelector('.site00-loader-copy__pct');
  if (pct) pct.textContent = '100%';
});

await page.screenshot({ path: `${outDir}/assts_loader_composition_711px_ready.png`, fullPage: false });

await writeFile(`${outDir}/assts_loader_composition_report.json`, JSON.stringify({ stageWidth: measurements?.stageWidth, report }, null, 2));
console.log(JSON.stringify({ stageWidth: measurements?.stageWidth, report }, null, 2));

await browser.close();
