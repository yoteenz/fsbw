#!/usr/bin/env node
/**
 * AIO client migration — interactive flow prototype (one self-contained page).
 *
 *   npm run migration:prototype            → .migration-mocks/aio-migration-flow.html
 *
 * Bundles the real migration screens (src/prototype/migrationFlowPrototype.tsx: MigrationStudioPage, OfficeActivationPage,
 * ClientOfficeReviewPage on the demo store) into one inline document, and wraps it in the navigator
 * (scripts/migration/flow-prototype-template.html): the screen tree, phone / tablet / desktop frames, the authority image
 * of the open screen, expected and observed connections, the invite outbox and the gaps found while wiring the flow.
 * Chromium (for the authority JPEGs): MIG_MOCK_CHROMIUM, else /opt/pw-browsers/chromium when present.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { build } from 'vite';
import { SCREENS } from './migration-screens.mjs';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const AUTH_DIR = resolve(APP, '../AIO_CLIENT_MIGRATION_AUTHORITY');
const TMP = join(APP, '.migration-mocks', 'prototype-build');
const OUT = resolve(process.env.MIG_PROTOTYPE_OUT ?? join(APP, '.migration-mocks', 'aio-migration-flow.html'));
const CHROMIUM = process.env.MIG_MOCK_CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SHA = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: APP }).toString().trim();

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const dataUri = (file) => `data:${MIME[file.slice(file.lastIndexOf('.')).toLowerCase()]};base64,${readFileSync(file).toString('base64')}`;
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

/* 1 · bundle the prototype app */
rmSync(TMP, { recursive: true, force: true });
await build({
  root: APP,
  configFile: join(APP, 'vite.config.ts'),
  base: './',
  logLevel: 'warn',
  build: {
    outDir: TMP,
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 100_000,
    rollupOptions: { input: join(APP, 'prototype/migration-app.html'), output: { inlineDynamicImports: true } },
  },
});
const html = readFileSync(join(TMP, 'prototype/migration-app.html'), 'utf8');
const jsFile = html.match(/<script type="module"[^>]*src="([^"]+)"/)[1];
const cssFile = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)?.[1];
const fromHtml = (p) => join(TMP, 'prototype', p);
let js = readFileSync(fromHtml(jsFile), 'utf8');
let css = cssFile ? readFileSync(fromHtml(cssFile), 'utf8') : '';

/* 2 · assets: fonts and migration images inline; the icon sheet as inline symbols */
// with base "./" the built CSS points at ../fonts/… and ../migration/… (the login hero under /brand is not on these screens)
css = css.replace(/url\((['"]?)(?:\.\.?)?\/((?:fonts|migration)\/[^'")]+)\1\)/g, (m, q, p) => {
  const file = join(APP, 'public', p);
  return existsSync(file) ? `url('${dataUri(file)}')` : m;
});
const assets = {};
for (const file of walk(join(APP, 'public/migration'))) {
  if (/\.(png|jpe?g|webp)$/i.test(file)) assets[`/${relative(join(APP, 'public'), file)}`] = dataUri(file);
}
const sprite = readFileSync(join(APP, 'public/migration/icons/aio-icon-sheet.svg'), 'utf8')
  .replace(/<\?xml[^>]*>/, '')
  .replace(/<svg\b/, '<svg aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"');
js = js.replace(/<\/script/gi, '<\\/script');
const appHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AIO CLIENT MIGRATION</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500;600&display=swap">
<script>window.__AIO_ASSETS=${JSON.stringify(assets)};</script>
<style>${css}</style></head><body>${sprite}<div id="root"></div><script type="module">${js}</script></body></html>`;

/* 3 · authority images (phone frames) as compact JPEGs */
const authFile = (id) => {
  const dir = id.startsWith('AIO-MIG-ROOT') ? '00_ROOT' : id.startsWith('AIO-MIG-EXISTING') ? '01_EXISTING_CLIENT' : id.startsWith('AIO-MIG-ACTIVATION') ? '02_ACTIVATION' : id.startsWith('AIO-MIG-NEW') ? '03_NEW_CLIENT' : '04_BULK_BATCH';
  return join(AUTH_DIR, dir, `${id}.png`);
};
const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
const page = await browser.newPage();
const authority = {};
for (const s of SCREENS) {
  const file = authFile(s.authority);
  if (!existsSync(file)) continue;
  authority[s.authority] = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 560;
    c.height = Math.round((img.height * 560) / img.width);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.78);
  }, dataUri(file));
}
await browser.close();

/* 4 · the navigator: tree, expected exits (read from the screens' code), gaps found while wiring the flow */
const E = (label, to, note) => ({ label, to, ...(note ? { note } : {}) });
const FLOW = {
  root: [E('START MIGRATION', 'existing', 'always opens EXISTING CLIENT FILE, whichever path card is highlighted'), E('EXISTING CLIENT FILE card', 'existing'), E('NEW CLIENT FILE card', 'new'), E('BULK BATCH MIGRATION card', 'batch'), E('VIEW ALL MIGRATIONS (phone)', 'exit')],
  existing: [E('CONTINUE with a client selected', 'upload'), E('CAN’T FIND YOUR CLIENT? → add manually', 'new')],
  upload: [E('CONTINUE (stores the chosen files)', 'received')],
  received: [E('BEGIN EXTRACTION', 'extract')],
  extract: [E('CONTINUE when extraction has finished', 'match'), E('VIEW IN BACKGROUND while it runs', 'root')],
  match: [E('CONTINUE once the match is resolved', 'review'), E('REVIEW on a conflict', 'conflicts')],
  review: [E('CONTINUE TO APPROVAL', 'conflicts', 'label says approval; the next screen is ITEMS NEEDING REVIEW')],
  conflicts: [E('SAVE DECISIONS / CONTINUE', 'approval'), E('CHANGE CLIENT', 'existing')],
  approval: [E('APPROVE MIGRATION → client becomes PREBUILT', 'prebuilt')],
  prebuilt: [E('SEND ACTIVATION INVITE', 'invite')],
  invite: [E('SEND INVITE → email to the client', 'invited')],
  invited: [E('VIEW INVITE DETAILS', 'invite'), E('the client opens the emailed link', 'activation')],
  activation: [E('SET PASSWORD → review what AIO knows', 'welcome')],
  welcome: [E('CONTINUE', 'company'), E('EDIT / I KNOW THIS', 'company'), E('CONFIRM EVERYTHING', 'confirm')],
  company: [E('CONTINUE', 'people')],
  people: [E('CONTINUE', 'vehicles'), E('ADD A PERSON', 'changed')],
  vehicles: [E('CONTINUE', 'services')],
  services: [E('CONTINUE', 'documents')],
  documents: [E('CONTINUE', 'changed')],
  changed: [E('CONTINUE', 'confirm')],
  confirm: [E('CONFIRM AND ACTIVATE → client becomes ACTIVE', 'complete'), E('open a section to review it', 'company')],
  complete: [E('ENTER YOUR OFFICE', 'exit')],
  new: [E('CONTINUE (creates the new client file)', 'new-received')],
  'new-received': [E('BEGIN EXTRACTION', 'new-extract')],
  'new-extract': [E('CONTINUE when extraction has finished', 'new-identity')],
  'new-identity': [E('CONTINUE (saves USDOT / MC / EIN)', 'new-records')],
  'new-records': [E('CONTINUE', 'new-review')],
  'new-review': [E('CONTINUE TO APPROVAL', 'new-approval')],
  'new-approval': [E('APPROVE MIGRATION → client becomes PREBUILT', 'new-prebuilt')],
  'new-prebuilt': [E('SEND ACTIVATION INVITE', 'new-invite')],
  'new-invite': [E('SEND INVITE → email to the client', 'new-confirm')],
  'new-confirm': [E('CONTINUE', 'root'), E('the client opens the emailed link', 'activation')],
  batch: [E('START BATCH', 'batch-received')],
  'batch-received': [E('CONTINUE', 'batch-processing')],
  'batch-processing': [E('CONTINUE when detection has finished', 'batch-summary')],
  'batch-summary': [E('CONTINUE', 'batch-conflicts')],
  'batch-conflicts': [E('CONTINUE (saves merge / keep separate)', 'batch-queue')],
  'batch-queue': [E('CONTINUE or open a client', 'batch-client')],
  'batch-client': [E('CONTINUE', 'batch-approval')],
  'batch-approval': [E('CONTINUE', 'batch-run'), E('OPEN QUEUE', 'batch-queue')],
  'batch-run': [E('PROCESS APPROVED CLIENTS → PREBUILT, never ACTIVE', 'batch-complete')],
  'batch-complete': [E('BACK TO INTAKE', 'root')],
};
const GAPS = [
  { title: 'No authority screen for accepting the invite', body: 'The emailed link opens ACCOUNT ACTIVATION (set a password) before the client review. That page exists in the app but no authority frame designs it, so it renders in the generic AIO style.' },
  { title: 'Invite copy contradicts the activation page', body: 'SEND INVITE tells staff the client needs no password (“secure link, no password required”); the page the link opens asks the client to choose one. The authority only requires that no password is sent.' },
  { title: 'The invite link is never clickable for staff', body: 'NEW CLIENT · SEND INVITE shows the link with a copy button; the existing-client invite moves straight to INVITE SENT without showing it. In this prototype the email arrives in the OUTBOX.' },
  { title: 'START MIGRATION ignores the highlighted path', body: 'The gold-bordered EXISTING CLIENT FILE card is fixed, and START MIGRATION always opens EXISTING CLIENT FILE. The path cards themselves navigate on tap.' },
  { title: 'FOUNDER REVIEW’s button names the wrong next step', body: 'CONTINUE TO APPROVAL opens ITEMS NEEDING REVIEW first; approval comes after the decisions are saved.' },
  { title: 'Staff never see the client finish', body: 'The existing-client branch ends at INVITE SENT. Nothing in migration shows staff when the client confirms or becomes ACTIVE.' },
  { title: 'Batch results look tappable but are not', body: 'BATCH COMPLETE lists each client with a › chevron, but the rows do nothing, so there is no route from a batch to inviting its PREBUILT clients; each one has to be found again under EXISTING CLIENT FILE.' },
];
const SCREEN_META = SCREENS.map(({ key, branch, name, authority: id, route, actor, seed, rep }) => ({ key, branch, name, authority: id, route, actor, seed, rep: !!rep }));
const data = { sha: SHA, built: new Date().toISOString().slice(0, 10), screens: SCREEN_META, flow: FLOW, gaps: GAPS, authority };
const template = readFileSync(join(APP, 'scripts/migration/flow-prototype-template.html'), 'utf8');
const safe = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const out = template
  .replace('/*__DATA__*/null', () => safe(data))
  .replace('/*__APP__*/null', () => safe(appHtml))
  .replaceAll('__SHA__', SHA);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, out);
rmSync(TMP, { recursive: true, force: true });
console.log(`flow prototype: ${OUT} · ${(out.length / 1024 / 1024).toFixed(2)} MB (app ${(appHtml.length / 1024 / 1024).toFixed(2)} MB) · ${SCREENS.length} screens · ${SHA}`);
