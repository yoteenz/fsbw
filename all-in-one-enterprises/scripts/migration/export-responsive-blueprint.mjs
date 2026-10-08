#!/usr/bin/env node
/**
 * AIO client migration — responsive blueprint export.
 *
 *   npm run migration:blueprint
 *
 * Regenerates the declaration fields of AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/screen-responsive-map.json (repo root)
 * from the live registry (src/client-migration/visual/migrationResponsive.ts). Audit fields in the JSON (component,
 * per-viewport status, defects, target shell, conformance) are preserved; a screen added to the registry gets an entry with
 * empty audit fields so the map can never silently miss a page. `--check` exits 1 when the JSON is out of date.
 */
import { build } from 'esbuild';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = resolve(APP, 'src/client-migration/visual/migrationResponsive.ts');
const OUT = resolve(APP, '../AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/screen-responsive-map.json');
const CHECK = process.argv.includes('--check');

const compiled = await build({ entryPoints: [SRC], bundle: false, format: 'esm', platform: 'node', write: false, logLevel: 'silent' });
const mod = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const { MIGRATION_PAGES, MIGRATION_BREAKPOINTS } = mod;

/** registry field → blueprint field (the sprint's declaration vocabulary) */
const FIELDS = {
  authority: 'SCREEN_ID',
  screen: 'SCREEN',
  route: 'ROUTE',
  actor: 'ACTOR',
  pageType: 'PAGE_TYPE',
  density: 'DENSITY_CLASS',
  hero: 'HERO_MODE',
  primaryGrid: 'PRIMARY_GRID_MODE',
  process: 'PROCESS_MODE',
  support: 'SUPPORT_GRID_MODE',
  form: 'FORM_MODE',
  table: 'TABLE_MODE',
  overlay: 'OVERLAY_MODE',
};
const AUDIT = ['CURRENT_COMPONENT', 'MOBILE', 'TABLET', 'DESKTOP', 'RESPONSIVE_DEFECTS_BEFORE', 'RESPONSIVE_DEFECTS_REMAINING', 'TARGET_SHELL', 'RESPONSIVE_SYSTEM_CONFORMANCE'];

const current = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { screens: [] };
const prior = new Map((current.screens ?? []).map((s) => [s.SCREEN, s]));
const screens = Object.values(MIGRATION_PAGES).map((page) => {
  const declared = Object.fromEntries(Object.entries(FIELDS).map(([from, to]) => [to, page[from]]));
  const audit = Object.fromEntries(AUDIT.map((k) => [k, prior.get(page.screen)?.[k] ?? null]));
  return { ...declared, ...audit };
});
const { screens: _s, generatedFrom: _g, breakpoints: _b, screenCount: _c, ...kept } = current;
const next = {
  generatedFrom: 'all-in-one-enterprises/src/client-migration/visual/migrationResponsive.ts (npm run migration:blueprint)',
  breakpoints: MIGRATION_BREAKPOINTS,
  screenCount: screens.length,
  ...kept,
  screens,
};
const text = `${JSON.stringify(next, null, 2)}\n`;
if (CHECK) {
  const same = existsSync(OUT) && readFileSync(OUT, 'utf8') === text;
  console.log(same ? 'screen-responsive-map.json is up to date' : 'screen-responsive-map.json is OUT OF DATE — run npm run migration:blueprint');
  process.exit(same ? 0 : 1);
}
writeFileSync(OUT, text);
console.log(`wrote ${OUT} (${screens.length} screens)`);
