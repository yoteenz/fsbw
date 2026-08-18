import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const outDir = '/opt/cursor/artifacts';
const widths = [375, 390, 430];
const baseUrl = process.env.LOADER_URL?.replace(/\?.*$/, '') || 'http://127.0.0.1:3001';

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
    sessionStorage.removeItem('site00-assts-immersive-complete');
    sessionStorage.removeItem('site00-immersive-complete');
  });

  await page.route('**/api/admin/site00-assts**', async (route) => {
    await new Promise((r) => setTimeout(r, 120_000));
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

  const url = `${baseUrl}/assts?loaderAnimation=0`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });

  await page.waitForSelector('.site00-immersive-loader', { timeout: 30000 });
  await page.waitForSelector('.site00-loader-env__img', { timeout: 15000 });
  await page.waitForSelector('[data-loader-region="copy.title"]', { timeout: 15000 });
  await page.waitForTimeout(800);

  const metrics = await page.evaluate(() => {
    const loader = document.querySelector('.site00-immersive-loader');
    const stage = document.querySelector('.site00-loader-stage');
    const env = document.querySelector('.site00-loader-env__img');
    const title = document.querySelector('[data-loader-region="copy.title"]');
    const coordsBtn = document.querySelector('.site00-loader-refmap-toggle');
    const root = document.getElementById('root');
    const bootShell = document.getElementById('site00-assts-boot-shell');
    const htmlBoot = document.documentElement.classList.contains('site00-assts-boot');

    const lr = loader?.getBoundingClientRect();
    const sr = stage?.getBoundingClientRect();
    const er = env?.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const rootStyle = root ? getComputedStyle(root) : null;
    const loaderStyle = loader ? getComputedStyle(loader) : null;

    return {
      loaderVisible: !!loader && (loaderStyle?.opacity !== '0') && loaderStyle?.display !== 'none',
      loaderWidth: lr?.width ?? 0,
      loaderHeight: lr?.height ?? 0,
      stageWidth: sr?.width ?? 0,
      stageHeight: sr?.height ?? 0,
      envWidth: er?.width ?? 0,
      envHeight: er?.height ?? 0,
      viewportW: vw,
      viewportH: vh,
      fillsWidth: lr ? Math.abs(lr.width - vw) < 4 : false,
      fillsHeight: lr ? Math.abs(lr.height - vh) < 8 : false,
      envCoversStage: sr && er ? er.width >= sr.width - 2 && er.height >= sr.height - 2 : false,
      titleText: title?.textContent?.trim() ?? '',
      coordsVisible: !!coordsBtn,
      rootHidden: rootStyle?.display === 'none',
      bootShellPresent: !!bootShell,
      htmlBootClass: htmlBoot,
    };
  });

  const screenshotPath = `${outDir}/loader_recovery_${width}px_animation_off.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false });

  results.push({ width, url, metrics, screenshotPath });
  await context.close();
}

// Animation-on pass at 390px
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ email: 'kateenaarmstrong@gmail.com', role: 'admin' }));
    sessionStorage.removeItem('site00-assts-immersive-complete');
    sessionStorage.removeItem('site00-immersive-complete');
  });
  await page.route('**/api/admin/site00-assts**', async (route) => {
    await new Promise((r) => setTimeout(r, 120_000));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, summary: {}, categories: [], priorityBatch: null }) });
  });
  await page.goto(`${baseUrl}/assts`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.site00-immersive-loader', { timeout: 30000 });
  await page.waitForSelector('.site00-loader-artboard-scaler', { timeout: 15000 });
  await page.waitForTimeout(2500);

  const metrics = await page.evaluate(() => {
    const geo = document.querySelector('.site00-loader-geometry-region');
    const video = document.querySelector('.site00-loader-animation');
    const gr = geo?.getBoundingClientRect();
    const vr = video?.getBoundingClientRect();
    const ready = video?.classList.contains('site00-loader-animation--ready');
    const bg = video ? getComputedStyle(video).backgroundColor : '';
    const aspect = gr && gr.height > 0 ? gr.width / gr.height : 0;
    const refAspect = 222 / 540;
    return {
      geometryPresent: !!geo,
      videoPresent: !!video,
      videoReady: ready,
      geometryBox: gr ? { w: gr.width, h: gr.height, top: gr.top } : null,
      videoBox: vr ? { w: vr.width, h: vr.height } : null,
      videoBg: bg,
      geometryAspect: aspect,
      refAspect,
      aspectMatch: Math.abs(aspect - refAspect) < 0.02,
    };
  });
  await page.screenshot({ path: `${outDir}/loader_recovery_390px_animation_on.png`, fullPage: false });
  results.push({ width: 390, animationOn: true, metrics });
  await context.close();
}

await browser.close();

const report = {
  pass: results.every((r) => {
    if (r.animationOn) return r.metrics.geometryPresent && r.metrics.aspectMatch !== false;
    return (
      r.metrics.loaderVisible &&
      r.metrics.fillsWidth &&
      r.metrics.fillsHeight &&
      r.metrics.envCoversStage &&
      !r.metrics.coordsVisible &&
      r.metrics.titleText.length > 0
    );
  }),
  results,
};

await writeFile(`${outDir}/loader_recovery_report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
