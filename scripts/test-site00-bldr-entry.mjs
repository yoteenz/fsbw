import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const outDir = '/opt/cursor/artifacts';
const baseUrl = process.env.BLDR_URL || 'http://127.0.0.1:3001/bldr';
const widths = [375, 390, 430];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForSelector('.site00-bldr-entry', { timeout: 30000 });
  await page.waitForSelector('.site00-build-direction-card--site img', { timeout: 15000 });
  await page.waitForTimeout(600);

  const metrics = await page.evaluate(() => {
    const title = document.querySelector('.site00-bldr-entry-intro__title')?.textContent?.replace(/\s+/g, ' ').trim();
    const subtitle = document.querySelector('.site00-bldr-entry-intro__subtitle')?.textContent?.trim();
    const siteTitle = document.querySelector('.site00-build-direction-card--site .site00-build-direction-card__title')?.textContent?.trim();
    const sitePrice = document.querySelector('.site00-build-direction-card--site .site00-build-direction-card__price')?.textContent?.trim();
    const worldTitle = document.querySelector('.site00-build-direction-card--world .site00-build-direction-card__title')?.textContent?.trim();
    const worldPrice = document.querySelector('.site00-build-direction-card--world .site00-build-direction-card__price')?.textContent?.trim();
    const siteImg = document.querySelector('.site00-build-direction-card--site img');
    const worldImg = document.querySelector('.site00-build-direction-card--world img');
    const interchange = !!document.querySelector('.site00-bldr-direction-interchange');
    const activeNav = document.querySelector('.site00-mobile-nav__item--active .site00-mobile-nav__bottom')?.textContent?.trim();
    const cards = document.querySelectorAll('.site00-build-direction-card');

    return {
      title,
      subtitle,
      siteTitle,
      sitePrice,
      worldTitle,
      worldPrice,
      siteImgLoaded: !!siteImg?.src?.includes('5E6EAEFD'),
      worldImgLoaded: !!worldImg?.src?.includes('5E89B3D4'),
      interchange,
      activeNav,
      cardCount: cards.length,
    };
  });

  const screenshotPath = `${outDir}/bldr_entry_${width}px.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  results.push({ width, metrics, screenshotPath });
  await context.close();
}

await browser.close();

const pass = results.every(
  (r) =>
    r.metrics.title?.includes('WHAT ARE WE') &&
    r.metrics.title?.includes('BUILDING') &&
    r.metrics.subtitle === 'CHOOSE A DIRECTION' &&
    r.metrics.siteTitle === 'SITE' &&
    r.metrics.sitePrice === 'FROM $3K' &&
    r.metrics.worldTitle === 'WORLD' &&
    r.metrics.worldPrice === 'FROM $10K+' &&
    r.metrics.siteImgLoaded &&
    r.metrics.worldImgLoaded &&
    r.metrics.interchange &&
    r.metrics.activeNav === 'BUILD' &&
    r.metrics.cardCount === 2,
);

const report = { pass, results };
await writeFile(`${outDir}/bldr_entry_report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(pass ? 0 : 1);
