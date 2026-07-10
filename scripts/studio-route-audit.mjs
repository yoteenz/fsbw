#!/usr/bin/env node
/**
 * Studio route verification matrix generator + smoke probe (local preview).
 * Usage: npx tsx scripts/studio-route-audit.mjs [baseUrl]
 */

import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4176';
const ADMIN_USER = {
  email: 'kateenaarmstrong@gmail.com',
  role: 'admin',
  displayName: 'Kateena',
  id: 'mock-admin-1',
};

const PRIORITY_ROUTES = [
  '/admin/studio/experience-lab',
  '/admin/studio/experience-engine',
  '/admin/studio/experience-runtime',
  '/admin/studio/genesis',
  '/admin/studio/executive-headquarters',
  '/admin/studio/institute',
  '/admin/studio/command-center',
  '/admin/studio/department/creative-direction',
];

function discoverStudioRoutes() {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const routes = new Set();
  const re = /path="studio\/([^"]+)"/g;
  let m;
  while ((m = re.exec(app))) {
    routes.add(`/admin/studio/${m[1].replace(/:\w+/g, 'test')}`);
  }
  for (const r of PRIORITY_ROUTES) routes.add(r);
  return [...routes].sort();
}

async function probeRoute(page, route) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const res = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => ({
    ok: () => false,
    status: () => 0,
    error: e,
  }));

  await page.waitForTimeout(4000);

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasErrorBoundary = (await page.locator('[data-platform-error-boundary]').count()) > 0;
  const scrollable =
    (await page.evaluate(() => {
      const portal = document.querySelector('[data-gb-scroll-owner="portal"]');
      if (portal) return portal.scrollHeight > portal.clientHeight + 8;
      return document.documentElement.scrollHeight > window.innerHeight + 8;
    })) ?? false;

  const buttons = await page.locator('button:visible').count();
  const status = typeof res.status === 'function' ? res.status() : 0;

  return {
    route,
    status,
    load: status === 200 && bodyText.length > 40 && !hasErrorBoundary ? 'PASS' : 'FAIL',
    scroll: scrollable ? 'PASS' : 'N/A',
    buttons: buttons > 0 ? 'PASS' : 'WARN',
    errors: errors.filter((e) => !e.includes('404')).slice(0, 3),
  };
}

async function main() {
  const routes = discoverStudioRoutes();
  console.log(`Discovered ${routes.length} studio routes. Probing ${PRIORITY_ROUTES.length} priority routes at ${BASE}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript((user) => {
    localStorage.setItem('isSignedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
  }, ADMIN_USER);
  const page = await context.newPage();

  const results = [];
  for (const route of PRIORITY_ROUTES) {
    results.push(await probeRoute(page, route));
  }

  await browser.close();

  console.log('| Route | Load | Scroll | Buttons | Errors |');
  console.log('|-------|------|--------|---------|--------|');
  for (const r of results) {
    console.log(`| ${r.route} | ${r.load} | ${r.scroll} | ${r.buttons} | ${r.errors.length ? r.errors[0].slice(0, 60) : '—'} |`);
  }

  const failed = results.filter((r) => r.load === 'FAIL');
  if (failed.length) {
    process.exitCode = 1;
    console.log(`\n${failed.length} priority route(s) FAILED load probe.`);
  } else {
    console.log('\nAll priority routes passed load probe.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
