#!/usr/bin/env node
/**
 * P0.VR.3L.1 — Capture Character Lab source sibling + Voice Lab derived draft (M/T/D).
 * Storage: P0.VR.3E public/studio-world/implementation-snapshots/ (+ Supabase path in registry)
 * Usage: E2E_LOCAL_SERVER=1 npm run capture:voice-lab-snapshots
 */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOURCE_ROUTE = '/admin/studio/character-lab/visual';
const TARGET_ROUTE = '/admin/studio/character-lab/voice-lab';

const VIEWPORTS = [
  { name: 'mobile', viewport: 'MOBILE', width: 390, height: 844 },
  { name: 'tablet', viewport: 'TABLET', width: 768, height: 1024 },
  { name: 'desktop', viewport: 'DESKTOP', width: 1920, height: 1080 },
];

function storagePath(projectId, route, kind, viewportName) {
  const slug = route.replace(/^\//, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const kindFolder = kind === 'source' ? 'family-source' : 'composer-derived';
  return join(
    ROOT,
    'public/studio-world/implementation-snapshots',
    projectId,
    slug,
    kindFolder,
    `${viewportName}.webp`,
  );
}

async function waitForHttp(url, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  const baseUrl = process.env.PREVIEW_URL ?? 'http://localhost:3001';
  if (!(await waitForHttp(baseUrl))) {
    console.error(`Server not reachable at ${baseUrl}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const [kind, route] of [
      ['source', SOURCE_ROUTE],
      ['target', TARGET_ROUTE],
    ]) {
      const outPath = storagePath('studio-world', route, kind, vp.name);
      mkdirSync(dirname(outPath), { recursive: true });
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle', timeout: 120_000 });
      await page.waitForSelector('[data-character-lab-tab-rail="true"]', { timeout: 30_000 });
      await page.screenshot({ path: outPath, type: 'webp', fullPage: true });
      console.log(`captured ${kind} ${vp.name} → ${outPath.replace(ROOT + '/', '')}`);
    }
  }

  await browser.close();
  console.log('Done. Re-run: npm run execute:voice-lab -- --mark-captured');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
