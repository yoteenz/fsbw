#!/usr/bin/env node
/**
 * Experience Engine freeze bisect probe — find first stage where heartbeat stalls.
 *
 * Usage:
 *   npm run build && npx vite preview --port 4173 &
 *   node scripts/experience-engine-bisect-probe.mjs http://127.0.0.1:4173
 *
 * For normal vs private comparison on iOS, run manually in Safari/Chrome and
 * open /__experience-engine-freeze-report after each stage attempt.
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const maxStage = Number.parseInt(process.argv[3] ?? '12', 10);
const settleMs = Number.parseInt(process.argv[4] ?? '5000', 10);

async function probeStage(stage) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `${base}/__experience-engine-bisect?stage=${stage}&heartbeat=0`;

  let prevRaf = 0;
  let prevTimeout = 0;
  let stalled = false;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });

  await page.waitForTimeout(settleMs);

  const snap = await page.evaluate(() => {
    const mtd = window.__MTD?.() ?? null;
    const reportRaw = sessionStorage.getItem('eeFreezeBisectReport_v1');
    let report = null;
    try {
      report = reportRaw ? JSON.parse(reportRaw) : null;
    } catch {
      report = null;
    }
    const latestRaw = sessionStorage.getItem('eeFreezeLatestCheckpoint_v1');
    let latest = null;
    try {
      latest = latestRaw ? JSON.parse(latestRaw) : null;
    } catch {
      latest = null;
    }
    const cssEl = document.querySelector('[data-ee-css-heartbeat]');
    const cssAnim =
      cssEl &&
      getComputedStyle(cssEl, '::after').animationName !== 'none' &&
      getComputedStyle(cssEl, '::after').animationName !== '';

    return {
      hb: mtd?.heartbeat ?? -1,
      raf: mtd?.rafCount ?? -1,
      timeout: mtd?.timeoutProbe ?? -1,
      frozen: mtd?.frozen ?? null,
      ckpt: mtd?.currentCheckpoint ?? null,
      report,
      latest,
      cssAnim,
      genesisBytes: (() => {
        try {
          return localStorage.getItem('genesis_v1')?.length ?? 0;
        } catch {
          return -1;
        }
      })(),
    };
  });

  // Second sample after 2s to detect stall
  await page.waitForTimeout(2000);
  const snap2 = await page.evaluate(() => {
    const mtd = window.__MTD?.() ?? null;
    return {
      raf: mtd?.rafCount ?? -1,
      timeout: mtd?.timeoutProbe ?? -1,
    };
  });

  prevRaf = snap.raf;
  prevTimeout = snap.timeout;
  stalled = snap2.raf <= prevRaf && snap2.timeout <= prevTimeout && snap.raf >= 0;

  await browser.close();

  const alive = (snap.hb ?? 0) >= 8 && !stalled;
  return { stage, alive, stalled, ...snap, snap2 };
}

async function main() {
  console.log(`Experience Engine bisect probe on ${base} (stages 0–${maxStage}, settle=${settleMs}ms)\n`);

  let firstFail = null;
  const rows = [];

  for (let stage = 0; stage <= maxStage; stage += 1) {
    const r = await probeStage(stage);
    rows.push(r);
    const status = r.alive ? 'OK' : 'FROZEN';
    console.log(
      `stage ${stage}: ${status} hb=${r.hb} raf=${r.raf}→${r.snap2.raf} to=${r.timeout}→${r.snap2.timeout} css=${r.cssAnim} genesis=${r.genesisBytes}B completed=${r.report?.completedStage ?? '?'}`
    );
    if (r.latest) {
      console.log(
        `  last checkpoint: s${r.latest.stage} ${r.latest.component}.${r.latest.function} ${r.latest.phase}`
      );
    }
    if (!r.alive && firstFail == null) firstFail = stage;
  }

  console.log('\n--- Summary ---');
  if (firstFail != null) {
    console.log(`First failing stage (desktop headless): ${firstFail}`);
    console.log(`Label: see BISECT_STAGES[${firstFail}] in bisect-stages.ts`);
    console.log('\nNOTE: iOS WebKit normal-tab vs private-tab divergence requires manual runs.');
    console.log('Open /__experience-engine-freeze-report after each iOS attempt.');
    process.exit(2);
  }

  console.log('All stages passed heartbeat check in headless Chromium.');
  console.log('Verify on normal Safari + Chrome iOS — private mode is not proof of stability.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
