#!/usr/bin/env node
/**
 * Capture Experience Lab icon runtime screenshots for regression QA.
 * Usage: npm run build && node scripts/capture-experience-lab-icon-runtime-screenshots.mjs
 */
import { chromium, devices } from '@playwright/test';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'docs/studio-os/qa/experience-lab/icons/runtime');
const ARTIFACT_DIR = '/opt/cursor/artifacts/screenshots/experience-lab-icons-runtime';

mkdirSync(OUT_DIR, { recursive: true });
if (existsSync(dirname(ARTIFACT_DIR))) mkdirSync(ARTIFACT_DIR, { recursive: true });

const ROUTES = [
  { id: 'experience-lab-v2', path: '/admin/studio/experience-lab-v2?view=blueprint' },
  { id: 'icon-qa', path: '/admin/studio/experience-lab-icon-qa' },
];

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080, mobile: false },
  { name: 'tablet-768', width: 768, height: 1024, mobile: false },
  { name: 'mobile-390', width: 390, height: 844, mobile: true },
];

const SURFACES = [
  { id: 'command-dock', selector: '.elab-cmd' },
  { id: 'workbench', selector: '.elab-founder-wb' },
  { id: 'viewport', selector: '.elab-viewport' },
  { id: 'full-page', selector: '.elab-app-shell' },
];

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

async function startPreviewServer() {
  return new Promise((resolveReady, reject) => {
    const child = spawn('npx', ['vite', 'preview', '--port', '4173', '--host'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    let ready = false;
    const onData = (chunk) => {
      const text = chunk.toString();
      if (!ready && /localhost:4173|127\.0\.0\.1:4173/.test(text)) {
        ready = true;
        resolveReady({ child, url: 'http://localhost:4173' });
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
    setTimeout(async () => {
      if (!ready) {
        if (await waitForHttp('http://localhost:4173/', 5000)) {
          resolveReady({ child, url: 'http://localhost:4173' });
        } else {
          reject(new Error('Preview server did not start'));
        }
      }
    }, 120_000);
  });
}

async function seedAdminSession(page, baseUrl) {
  await page.goto(`${baseUrl}/admin/studio/experience-lab-v2`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem(
      'studio-world-admin-session',
      JSON.stringify({
        email: 'kateenaarmstrong@gmail.com',
        firstName: 'Studio',
        lastName: 'Admin',
      }),
    );
  });
}

async function main() {
  const distIndex = resolve(ROOT, 'dist/index.html');
  if (!existsSync(distIndex)) {
    console.error('Missing dist/ — run npm run build first');
    process.exit(1);
  }

  const { child, url: baseUrl } = await startPreviewServer();
  const browser = await chromium.launch({ headless: true });
  const manifest = {
    capturedAt: new Date().toISOString(),
    baseUrl,
    shots: [],
  };

  try {
    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext(
          vp.mobile
            ? { ...devices['iPhone 13'], viewport: { width: vp.width, height: vp.height } }
            : { viewport: { width: vp.width, height: vp.height } },
        );
        const page = await context.newPage();
        await seedAdminSession(page, baseUrl);
        await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 90_000 });
        await page.waitForTimeout(1200);

        for (const surface of SURFACES) {
          const el = page.locator(surface.selector).first();
          const visible = await el.isVisible().catch(() => false);
          if (!visible) continue;
          const name = `${route.id}__${vp.name}__${surface.id}.png`;
          const outPath = resolve(OUT_DIR, name);
          await el.screenshot({ path: outPath });
          if (existsSync(dirname(ARTIFACT_DIR))) {
            await el.screenshot({ path: resolve(ARTIFACT_DIR, name) });
          }
          manifest.shots.push({ route: route.id, viewport: vp.name, surface: surface.id, file: name });
          console.log(`  ✓ ${name}`);
        }

        const fullName = `${route.id}__${vp.name}__full.png`;
        await page.screenshot({ path: resolve(OUT_DIR, fullName), fullPage: false });
        manifest.shots.push({ route: route.id, viewport: vp.name, surface: 'full', file: fullName });
        await context.close();
      }
    }
  } finally {
    await browser.close();
    child.kill('SIGTERM');
  }

  const manifestPath = resolve(OUT_DIR, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nRuntime icon screenshots: ${manifest.shots.length} captures → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
