#!/usr/bin/env node
/** Simulate heavy genesis localStorage and probe heartbeat during boot. */
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:4173';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Seed a large genesis blob + many studio keys before navigation.
  await page.goto(`${base}/__thread-heartbeat`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const big = 'x'.repeat(512 * 1024);
    const store = {
      version: '1',
      frameworkVersion: '1',
      objects: Array.from({ length: 200 }, (_, i) => ({ id: `obj-${i}`, payload: big.slice(0, 2000) })),
      relationships: [],
      proposals: [],
      adrs: [],
      reviews: [],
      compileManifests: [],
      historicalRevisions: [],
      bootstrappedAt: new Date().toISOString(),
    };
    localStorage.setItem('studioOsGenesisFramework_v1', JSON.stringify(store));
    for (let i = 0; i < 40; i += 1) {
      localStorage.setItem(`studioOs_test_${i}`, JSON.stringify({ i, data: 'y'.repeat(8000) }));
    }
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ email: 'test@example.com', role: 'admin', tags: ['admin'] })
    );
  });

  const hb0 = await page.evaluate(() => window.__MTD?.().heartbeat ?? 0);
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForTimeout(8000);
  const snap = await page.evaluate(() => {
    const mtd = window.__MTD?.() ?? null;
    return {
      hb: mtd?.heartbeat ?? -1,
      frozen: mtd?.frozen,
      loading: Boolean(document.querySelector('.loading-screen-root')),
      path: location.pathname,
      traceTail: mtd?.trace?.slice(-10) ?? [],
    };
  });
  console.log('hb before nav:', hb0);
  console.log(JSON.stringify(snap, null, 2));
  await browser.close();
  process.exit(snap.hb >= hb0 + 10 ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
