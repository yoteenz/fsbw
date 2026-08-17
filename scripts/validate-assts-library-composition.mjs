import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const REF_W = 711;
const url = process.env.ASSTS_URL || 'http://127.0.0.1:3001/assts?refMap=1';
const outDir = '/opt/cursor/artifacts';

const REGIONS = {
  'header.title': { x: 40, y: 108, w: 385, h: 43 },
  'stats.assets': { x: 37, y: 529, w: 148, h: 96 },
  'needsReview.card': { x: 36, y: 708, w: 639, h: 184 },
  'recentBatches.card01': { x: 36, y: 944, w: 206, h: 104 },
  'browseLibrary.environments': { x: 36, y: 1111, w: 308, h: 102 },
  navigation: { x: 36, y: 1425, w: 639, h: 88 },
};

const mockLibrary = {
  ok: true,
  summary: {
    totalAssets: 4,
    batches: 3,
    needsReview: 0,
    approved: 4,
    locked: 0,
    batchesList: [
      {
        id: 'b1',
        batch_key: 'BATCH-IDNTY-002',
        display_name: 'Identity States',
        category: 'IDENTY / STATES',
        status: 'NEEDS_REVIEW',
        counts: { total: 5, approved: 0, needsReview: 5 },
        thumbnailUrl: null,
      },
      {
        id: 'b2',
        batch_key: 'BATCH-ORIGIN-001',
        display_name: 'Origin Core',
        category: 'ORIGIN / CORE OBJECTS',
        status: 'IN_REVIEW',
        counts: { total: 13, approved: 9, needsReview: 4 },
        thumbnailUrl: null,
      },
      {
        id: 'b3',
        batch_key: 'BATCH-ORIGIN-002',
        display_name: 'Origin Secondary',
        category: 'ORIGIN / VARIANTS',
        status: 'APPROVED',
        counts: { total: 8, approved: 8, needsReview: 0 },
        thumbnailUrl: null,
      },
    ],
  },
  categories: [
    { id: 'environments', label: '01 ENVIRONMENTS', count: 32, coverUrl: null },
    { id: 'objects', label: '02 OBJECTS', count: 128, coverUrl: null },
    { id: 'ui-graphics', label: '03 UI / GRAPHICS', count: 48, coverUrl: null },
    { id: 'brand-systems', label: '04 BRAND SYSTEMS', count: 22, coverUrl: null },
    { id: 'project-assets', label: '05 PROJECT ASSETS', count: 17, coverUrl: null },
  ],
  priorityBatch: {
    id: 'pb1',
    batch_key: 'BATCH-ORIGIN-001',
    display_name: 'Origin Core',
    category: 'ORIGIN / CORE OBJECTS',
    status: 'IN_REVIEW',
    counts: { total: 13, approved: 9, needsReview: 4, regenerating: 0, rejected: 0 },
    thumbnailUrl: null,
    progressPercent: 69,
  },
};

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: REF_W, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

await page.addInitScript(() => {
  const user = JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' });
  localStorage.setItem('isSignedIn', 'true');
  localStorage.setItem('currentUser', user);
  sessionStorage.setItem('site00-assts-immersive-complete', '1');
});

await page.route('**/api/admin/site00-assts**', async (route) => {
  const reqUrl = route.request().url();
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
  await route.continue();
});

await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(2000);

const primaryIds = Object.keys(REGIONS);

const measurements = await page.evaluate((ids) => {
  const canvas = document.querySelector('.assts-library-composition');
  if (!canvas) return null;
  const canvasRect = canvas.getBoundingClientRect();
  const scale = canvasRect.width / 711;
  const rows = [];
  for (const id of ids) {
    const el = canvas.querySelector(`[data-composition-region="${id}"]`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    rows.push({
      id,
      actual: {
        x: r.left - canvasRect.left,
        y: r.top - canvasRect.top,
        w: r.width,
        h: r.height,
      },
      scale,
    });
  }
  return { canvasWidth: canvasRect.width, rows };
}, primaryIds);

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

const shot = `${outDir}/assts_library_home_711px_map.png`;
await page.screenshot({ path: shot, fullPage: true });

await writeFile(`${outDir}/assts_library_home_composition_report.json`, JSON.stringify({ canvasWidth: measurements?.canvasWidth, report }, null, 2));

console.log(JSON.stringify({ screenshot: shot, canvasWidth: measurements?.canvasWidth, report }, null, 2));

await browser.close();
