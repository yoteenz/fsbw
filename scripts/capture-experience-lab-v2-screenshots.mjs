#!/usr/bin/env node
/**
 * Capture Experience Lab V2 review screenshots at required viewports.
 * Usage: E2E_LOCAL_SERVER=1 node scripts/capture-experience-lab-v2-screenshots.mjs
 */
import { chromium, devices } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ROUTE = '/admin/studio/experience-lab-v2?view=blueprint';
const OUT_DIRS = [
  resolve(ROOT, 'docs/studio-os/experience-lab/v2-screenshots'),
  '/opt/cursor/artifacts/screenshots/experience-lab-v2',
].filter((d) => d.startsWith('/') || existsSync(dirname(d)));

for (const dir of OUT_DIRS) {
  mkdirSync(dir, { recursive: true });
}

const VIEWPORTS = [
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-430x932', width: 430, height: 932 },
  { name: 'tablet-portrait-768x1024', width: 768, height: 1024 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'ultrawide-2560x1080', width: 2560, height: 1080 },
];

const ADMIN_USER = {
  email: 'kateenaarmstrong@gmail.com',
  firstName: 'Studio',
  lastName: 'Admin',
};

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
          ready = true;
          resolveReady({ child, url: 'http://localhost:4173' });
        } else {
          reject(new Error('Preview server did not start within 120s'));
        }
      }
    }, 120_000);
  });
}

async function startDevServer() {
  return new Promise((resolveReady, reject) => {
    const child = spawn('npm', ['run', 'dev:no-proxy'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    let ready = false;
    const onData = (chunk) => {
      const text = chunk.toString();
      if (!ready && /localhost:\d+/.test(text)) {
        ready = true;
        resolveReady({ child, url: 'http://localhost:3001' });
      }
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
    setTimeout(() => {
      if (!ready) reject(new Error('Dev server did not start within 120s'));
    }, 120_000);
  });
}

async function capture(baseURL, serverChild) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['Desktop Chrome'],
    locale: 'en-US',
    colorScheme: 'dark',
  });

  await context.addInitScript((user) => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('experienceLabV2_testMode_v1', 'MOCK');
  }, ADMIN_USER);

  const page = await context.newPage();

  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (/fonts\.googleapis|fonts\.gstatic|vercel\.app\/api/.test(url)) {
      return route.abort();
    }
    return route.continue();
  });

  await page.goto(`${baseURL}${ROUTE}`, { waitUntil: 'commit', timeout: 90_000 });
  await page.waitForSelector('[data-experience-lab-v2-shell]', { timeout: 90_000, state: 'attached' });
  await page.waitForSelector('[data-elab-command-dock]', { timeout: 60_000, state: 'attached' });
  await page.waitForSelector('[data-studio-viewport]', { timeout: 60_000, state: 'attached' });
  await page.waitForTimeout(1500);

  const written = [];
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);
    const filename = `experience-lab-v2-${vp.name}.png`;
    for (const dir of OUT_DIRS) {
      const path = resolve(dir, filename);
      await page.screenshot({ path, fullPage: false });
      written.push(path);
    }
  }

  await browser.close();
  if (serverChild) serverChild.kill('SIGTERM');
  return written;
}

async function main() {
  let baseURL = (process.env.E2E_BASE_URL || '').replace(/\/$/, '');
  let serverChild = null;

  if (!baseURL) {
    if (await waitForHttp('http://localhost:4173/', 2000)) {
      baseURL = 'http://localhost:4173';
    } else if (await waitForHttp('http://localhost:3001/', 2000)) {
      baseURL = 'http://localhost:3001';
    }
  }

  if (!baseURL || process.env.E2E_LOCAL_SERVER === '1') {
    if (baseURL) {
      /* reuse detected local server */
    } else {
    const usePreview = process.env.ELAB_V2_PREVIEW !== '0';
    const started = usePreview ? await startPreviewServer() : await startDevServer();
    baseURL = started.url;
    serverChild = started.child;
    }
  }

  const paths = await capture(baseURL, serverChild);
  console.log('Experience Lab V2 screenshots captured:');
  for (const p of [...new Set(paths)]) console.log(`  ${p}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
