#!/usr/bin/env node
/**
 * Validates AIO homepage has no horizontal overflow at key viewports.
 * Usage: node scripts/validate-aio-viewports.mjs [--url=http://localhost:5173/]
 */
import { chromium } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'large-2560', width: 2560, height: 1440 },
  { name: 'ultrawide-3440', width: 3440, height: 1440 },
  { name: 'super-5120', width: 5120, height: 1440 },
];

const baseUrl = process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] ?? 'http://localhost:5173/';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      const heroHeadline = document.querySelector('.aio-home-hero__headline, .aio-hero__headline');
      const heroCopy = document.querySelector('.aio-home-hero__copy, .aio-hero__copy');
      const headerInner = document.querySelector('.aio-header__inner');
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflow: doc.scrollWidth > doc.clientWidth + 1,
        heroHeadlinePx: heroHeadline ? Math.round(parseFloat(getComputedStyle(heroHeadline).fontSize)) : null,
        heroCopyMaxPx: heroCopy ? Math.round(parseFloat(getComputedStyle(heroCopy).maxWidth)) || null : null,
        headerMaxPx: headerInner ? Math.round(parseFloat(getComputedStyle(headerInner).maxWidth)) || null : null,
      };
    });
    results.push({ ...vp, ...metrics, pass: !metrics.overflow });
  }

  await browser.close();

  let failed = 0;
  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    if (!r.pass) failed += 1;
    console.log(
      `${status} ${r.name} ${r.width}x${r.height} scroll=${r.scrollWidth}/${r.clientWidth} hero=${r.heroHeadlinePx}px copyMax=${r.heroCopyMaxPx} headerMax=${r.headerMaxPx}`,
    );
  }

  if (failed) {
    console.error(`\n${failed} viewport(s) had horizontal overflow.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} viewports passed (no horizontal overflow).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
