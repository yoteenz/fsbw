#!/usr/bin/env node
/**
 * Compare Experience Engine startup: fresh session vs persisted genesis payloads.
 * Usage: npx tsx scripts/experience-engine-startup-trace.mjs [baseUrl]
 */

import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4176';
const ROUTE = '/admin/studio/experience-engine';
const ADMIN_USER = {
  email: 'kateenaarmstrong@gmail.com',
  role: 'admin',
  displayName: 'Kateena',
  id: 'mock-admin-1',
};

const CASES = [
  { label: 'A-fresh-private', genesis: null },
  {
    label: 'B-normal-corrupt-engine',
    genesis: {
      frameworkVersion: '1.0.0',
      version: '1.0.0',
      experienceEngineDna: {
        version: '0.9.0',
        seededAt: '2026-01-01T00:00:00.000Z',
        brands: [{ brandId: 'partial-only' }],
        departments: [],
        scenes: [],
        motions: [],
        interactions: [],
        components: [],
        playground: {
          brandId: 'invalid-brand',
          departmentId: 'bogus-dept',
          sceneId: 'legacy-scene',
          componentId: 'broken',
          motionDnaId: 'motion-bad',
          lightingPreset: 'x',
          materialId: 'y',
          typographyScale: 'z',
          orbPersonality: 'bad',
        },
      },
    },
  },
  {
    label: 'B-normal-stale-playground',
    genesis: {
      frameworkVersion: '1.0.0',
      version: '1.0.0',
      experienceEngineDna: {
        version: '1.0.0',
        seededAt: '2026-06-01T00:00:00.000Z',
        brands: [],
        departments: [],
        scenes: [],
        motions: [],
        interactions: [],
        components: [],
        playground: {
          brandId: 'studio-os',
          departmentId: 'executive',
          sceneId: 'executive-headquarters',
          componentId: 'executive-header',
          motionDnaId: 'motion-studio-os',
          lightingPreset: 'brand-default',
          materialId: 'primary-glass',
          typographyScale: 'brand-default',
          orbPersonality: 'brand-default',
        },
      },
    },
  },
];

async function traceCase(browser, testCase) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const events = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('genesis repair') || text.includes('[studioOsBrowserStorage]')) {
      events.push({ type: 'console', text });
    }
  });
  page.on('pageerror', (err) => events.push({ type: 'pageerror', text: String(err) }));

  await page.addInitScript(
    ({ user, genesis }) => {
      localStorage.setItem('isSignedIn', 'true');
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (genesis) {
        localStorage.setItem('genesis_v1', JSON.stringify(genesis));
      } else {
        localStorage.removeItem('genesis_v1');
      }
      localStorage.removeItem('studioOsExperienceEngine_v1');
      sessionStorage.removeItem('studioOsPlatformBootstrapped_v1');
    },
    { user: ADMIN_USER, genesis: testCase.genesis }
  );

  const started = Date.now();
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page
    .waitForSelector('[data-xee-ready="1"], [data-xee-recovery="1"], [data-platform-error-boundary]', {
      timeout: 30000,
    })
    .catch(() => undefined);
  await page.waitForTimeout(2000);

  const snapshot = await page.evaluate(() => {
    const ready = document.querySelector('[data-xee-ready="1"]');
    const recovery = document.querySelector('[data-xee-recovery="1"]');
    const trace = window.__STUDIO_EE_STARTUP_TRACE__ ?? [];
    let enginePlayground = null;
    try {
      const raw = localStorage.getItem('genesis_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        enginePlayground = parsed.experienceEngineDna?.playground ?? null;
      }
    } catch {
      enginePlayground = 'parse-error';
    }
    return {
      ready: ready ? 1 : 0,
      recovery: recovery ? 1 : 0,
      trace,
      enginePlayground,
      title: document.title,
    };
  });

  await context.close();

  const pass = snapshot.ready === 1 || (snapshot.recovery === 1 && snapshot.trace.some((t) => t.stage === 'engine-init'));

  return {
    label: testCase.label,
    ms: Date.now() - started,
    pass,
    snapshot,
    events,
  };
}

async function main() {
  console.log(`Experience Engine startup trace @ ${BASE}${ROUTE}\n`);
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const testCase of CASES) {
    const result = await traceCase(browser, testCase);
    results.push(result);
    console.log(`--- ${result.label} (${result.ms}ms) ${result.pass ? 'PASS' : 'FAIL'} ---`);
    console.log(JSON.stringify(result.snapshot, null, 2));
    if (result.events.length) {
      console.log('events:', result.events);
    }
    console.log('');
  }

  await browser.close();

  const diverged = results.find((r) => !r.pass);
  console.log('FIRST DIVERGENCE:', diverged ? diverged.label : 'none — all cases passed');
  process.exit(diverged ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
