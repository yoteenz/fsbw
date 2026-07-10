#!/usr/bin/env node
/**
 * Compare Experience Lab startup: fresh session vs persisted genesis payloads.
 * Usage: npx tsx scripts/experience-lab-startup-trace.mjs [baseUrl]
 */

import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4176';
const ROUTE = '/admin/studio/experience-lab';
const ADMIN_USER = {
  email: 'kateenaarmstrong@gmail.com',
  role: 'admin',
  displayName: 'Kateena',
  id: 'mock-admin-1',
};

const CASES = [
  { label: 'A-fresh-private', genesis: null },
  {
    label: 'B-normal-corrupt-lab',
    genesis: {
      frameworkVersion: '1.0.0',
      version: '1.0.0',
      experienceLabDna: {
        version: '0.9.0',
        seededAt: '2026-01-01T00:00:00.000Z',
        selection: {
          scenarioId: 'hq-master-demonstration-v1',
          brandId: 'invalid-brand',
          departmentId: 'bogus-dept',
          sceneId: 'legacy-scene',
          motionDnaId: 'motion-bad',
          switchers: {
            themeVariant: 'neon',
            orbVariant: 'broken',
            lightingVariant: 'x',
            particleVariant: 'y',
            typographyVariant: 'z',
            animationVariant: 'bad',
          },
          activePanel: 'not-a-panel',
        },
        switchCount: 99,
        constitutionLocked: true,
      },
      experienceRuntimeDna: {
        version: '1.0.0',
        seededAt: '2026-01-01T00:00:00.000Z',
        selection: {
          brandId: 'invalid-brand',
          departmentId: 'bogus-dept',
          sceneId: 'legacy-scene',
          motionDnaId: 'motion-bad',
        },
        platformDna: { platformDnaId: '' },
        stateDnaProfiles: [],
      },
      experienceEngineDna: {
        version: '1.0.0',
        seededAt: '2026-01-01T00:00:00.000Z',
        brands: [{ brandId: 'partial-only' }],
        departments: [],
        scenes: [],
        motions: [],
        interactions: [],
        components: [],
      },
    },
  },
  {
    label: 'B-normal-stale-scenario',
    genesis: {
      frameworkVersion: '1.0.0',
      version: '1.0.0',
      experienceLabDna: {
        version: '1.0.0',
        seededAt: '2026-06-01T00:00:00.000Z',
        selection: {
          scenarioId: 'studio-os-hq',
          brandId: 'studio-os',
          departmentId: 'executive',
          sceneId: 'executive-headquarters',
          motionDnaId: 'motion-studio-os',
          switchers: {
            themeVariant: 'default',
            orbVariant: 'default',
            lightingVariant: 'default',
            particleVariant: 'default',
            typographyVariant: 'default',
            animationVariant: 'default',
          },
          activePanel: 'runtime-status',
        },
        switchCount: 4,
        constitutionLocked: true,
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
      sessionStorage.removeItem('studioOsPlatformBootstrapped_v1');
    },
    { user: ADMIN_USER, genesis: testCase.genesis }
  );

  const started = Date.now();
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('[data-xelab], [data-xelab-boot="diagnostics"], [data-platform-error-boundary]', {
    timeout: 30000,
  }).catch(() => undefined);
  await page.waitForTimeout(2000);

  const snapshot = await page.evaluate(() => {
    const xelab = document.querySelector('[data-xelab]');
    const bootPanel = document.querySelector('[data-xelab-boot="diagnostics"]');
    const bootGate = document.body.innerText.includes('Studio Bootstrap');
    const readinessFail = document.body.innerText.includes('Boot incomplete');
    let genesisLab = null;
    try {
      const raw = localStorage.getItem('genesis_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        genesisLab = parsed.experienceLabDna?.selection ?? null;
      }
    } catch {
      genesisLab = 'parse-error';
    }
    return {
      xelab: xelab ? 1 : 0,
      diagnostics: bootPanel ? 1 : 0,
      bootGate,
      readinessFail,
      genesisLab,
      title: document.title,
    };
  });

  await context.close();

  return {
    label: testCase.label,
    ms: Date.now() - started,
    pass: snapshot.xelab === 1 && snapshot.diagnostics === 0 && !snapshot.readinessFail,
    snapshot,
    events,
  };
}

async function main() {
  console.log(`Experience Lab startup trace @ ${BASE}${ROUTE}\n`);
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
