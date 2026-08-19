#!/usr/bin/env node
/**
 * Responsive QA runner — groups viewports for master readiness suite.
 */
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';

const GROUPS = {
  mobile: [
    { name: 'mobile-375', width: 375, height: 812 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-430', width: 430, height: 932 },
  ],
  tablet: [
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'tablet-1024', width: 1024, height: 768 },
  ],
  desktop: [
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1920', width: 1920, height: 1080 },
  ],
  ultrawide: [
    { name: 'ultrawide-2560', width: 2560, height: 1440 },
    { name: 'ultrawide-3440', width: 3440, height: 1440 },
    { name: 'ultrawide-5120', width: 5120, height: 1440 },
  ],
};

const group = process.env.RESPONSIVE_GROUP ?? 'mobile';
const baseUrl = process.env.READINESS_PREVIEW_URL ?? 'http://127.0.0.1:4173/';
const routes = (process.env.RESPONSIVE_ROUTES ?? '/,/portal,/office').split(',').map((r) => r.trim());
const viewports = GROUPS[group] ?? GROUPS.mobile;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const route of routes) {
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const url = new URL(route, baseUrl).href;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      results.push({ route, ...vp, ...metrics, pass: !metrics.overflow });
    }
  }

  await browser.close();

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ group, baseUrl, results, failed: failed.length }, null, 2));
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
