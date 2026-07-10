#!/usr/bin/env node
/** Probe Shell V2 heartbeat on production build. */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';
const path = process.argv[3] ?? '/v2/diagnostic';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `${base.replace(/\/$/, '')}${path}`;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(4000);

  const snap = await page.evaluate(() => {
    const hb = window.__SHELL_V2_HB?.() ?? null;
    return {
      path: location.pathname,
      hb,
      ready: document.body.innerText.includes('READY'),
      hasOverlay: !!document.getElementById('shell-v2-heartbeat-overlay'),
      shell: document.querySelector('[data-shell-v2]')?.getAttribute('data-shell-v2'),
    };
  });

  console.log(JSON.stringify(snap, null, 2));
  const alive = (snap.hb?.heartbeat ?? 0) >= 8;
  console.log(alive ? 'PASS: heartbeat alive' : 'FAIL: heartbeat stalled');
  await browser.close();
  process.exit(alive ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
