#!/usr/bin/env node
/**
 * Startup bisection — find first stage where heartbeat stalls on production build.
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const stages = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

async function probeStage(stage) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `${base}/?startupMax=${stage}&heartbeat=0`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(4000);
  const snap = await page.evaluate(() => {
    const mtd = window.__MTD?.() ?? null;
    return {
      hb: mtd?.heartbeat ?? -1,
      frozen: mtd?.frozen ?? null,
      ckpt: mtd?.currentCheckpoint ?? null,
      loading: Boolean(document.querySelector('.loading-screen-root')),
      breaker: Boolean(document.getElementById('main-thread-loop-prevented')),
      path: location.pathname,
    };
  });
  await browser.close();
  const alive = (snap.hb ?? 0) >= 8;
  return { stage, alive, ...snap };
}

async function main() {
  console.log(`Bisecting startup stages on ${base}\n`);
  let firstFail = null;
  for (const stage of stages) {
    const r = await probeStage(stage);
    const status = r.alive ? 'OK' : 'FROZEN';
    console.log(
      `${stage}: ${status} hb=${r.hb} ckpt=${r.ckpt} loading=${r.loading} breaker=${r.breaker} path=${r.path}`
    );
    if (!r.alive && !firstFail) firstFail = stage;
  }
  if (firstFail) {
    console.log(`\nFirst failing stage: ${firstFail}`);
    process.exit(2);
  }
  console.log('\nAll stages passed heartbeat check.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
