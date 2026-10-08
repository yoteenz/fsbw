#!/usr/bin/env node
/**
 * AIO client migration — screen review gallery. Captures every migration screen from the running app (the six
 * representatives and the 35 propagated authority screens) with a demo state per screen, and packs them into one
 * self-contained page: each screen renders live in a phone / tablet / desktop frame next to its authority image.
 *
 *   npm run migration:gallery            → .migration-mocks/aio-migration-gallery.html
 *
 * Uses a running dev server at MIG_MOCK_BASE (default http://127.0.0.1:5173) or starts one. Chromium: MIG_MOCK_CHROMIUM,
 * else /opt/pw-browsers/chromium when present. Demo state lives only in the capture's browser profile (Heartland Freight Co.,
 * River Bend Logistics LLC as a new client file, four batch clients). Published copy: docs/migration-recovery/MOCKS.md.
 */
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { SCREENS, SEED } from './migration-screens.mjs';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const AUTH_DIR = resolve(APP, '../AIO_CLIENT_MIGRATION_AUTHORITY');
const OUT = resolve(process.env.MIG_GALLERY_OUT ?? join(APP, '.migration-mocks', 'aio-migration-gallery.html'));
const BASE = process.env.MIG_MOCK_BASE ?? 'http://127.0.0.1:5173';
const CHROMIUM = process.env.MIG_MOCK_CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const SHA = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: APP }).toString().trim();

const AUTH_FILE = (id) => {
  const dir = id.startsWith('AIO-MIG-ROOT') ? '00_ROOT' : id.startsWith('AIO-MIG-EXISTING') ? '01_EXISTING_CLIENT' : id.startsWith('AIO-MIG-ACTIVATION') ? '02_ACTIVATION' : id.startsWith('AIO-MIG-NEW') ? '03_NEW_CLIENT' : '04_BULK_BATCH';
  return join(AUTH_DIR, dir, `${id}.png`);
};

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const dataUri = (file) => `data:${MIME[file.slice(file.lastIndexOf('.'))]};base64,${readFileSync(file).toString('base64')}`;

async function serverUp() {
  try {
    return (await fetch(BASE)).ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await serverUp()) return null;
  const port = new URL(BASE).port || '5173';
  const child = spawn('npx', ['vite', '--port', port, '--strictPort'], { cwd: APP, stdio: 'ignore', detached: true });
  for (let i = 0; i < 120; i++) {
    if (await serverUp()) return child;
    await new Promise((r) => setTimeout(r, 1000));
  }
  process.kill(-child.pid, 'SIGTERM');
  throw new Error(`Dev server did not start at ${BASE}`);
}

async function capture(browser, s) {
  const ctx = await browser.newContext({ viewport: { width: 427, height: 768 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await p.evaluate(SEED, s.seed);
  await p.goto(`${BASE}${s.route}`, { waitUntil: 'networkidle' });
  if (s.local) {
    await p.setInputFiles('input.amg-file-input', s.local.map((name) => ({ name, mimeType: name.endsWith('.pdf') ? 'application/pdf' : name.endsWith('.png') ? 'image/png' : 'application/octet-stream', buffer: Buffer.alloc(name.endsWith('.pdf') ? 4404019 : 1887436) })));
  }
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(350);
  const html = await p.evaluate(() => document.querySelector('.amg').outerHTML);
  await ctx.close();
  return html
    .replace(/<a ([^>]*?)href="[^"]*"/g, '<a $1href="#"')
    .replace(/ fetchpriority="high"/g, '')
    .replace(/ decoding="async"/g, '');
}

/** Authority PNG → 427-wide JPEG data URI (drawn in the browser, no image library needed). */
async function authorityJpeg(page, file) {
  const src = `data:image/png;base64,${readFileSync(file).toString('base64')}`;
  return page.evaluate(async (s) => {
    const img = new Image();
    img.src = s;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 427;
    c.height = Math.round((427 * img.height) / img.width);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.74);
  }, src);
}

const server = await ensureServer();
const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
const shots = [];
try {
  const tool = await browser.newPage();
  for (const s of SCREENS) {
    const html = await capture(browser, s);
    const auth = await authorityJpeg(tool, AUTH_FILE(s.authority));
    shots.push({ ...s, html, auth });
    console.log(`${s.key.padEnd(18)} ${(html.length / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
  if (server) process.kill(-server.pid, 'SIGTERM');
}

const assets = {};
for (const s of shots) for (const m of s.html.matchAll(/(?:src|srcset)="(\/migration\/[^"]+)"/g)) assets[m[1]] ??= dataUri(join(APP, 'public', m[1]));
const sprite = readFileSync(join(APP, 'public/migration/icons/aio-icon-sheet.svg'), 'utf8');
const used = new Set(shots.flatMap((s) => [...s.html.matchAll(/aio-icon-sheet\.svg#([a-z0-9-]+)/g)].map((m) => m[1])));
const symbols = [...used].map((id) => sprite.match(new RegExp(`<symbol id="${id}"[^>]*>.*?</symbol>`, 's'))?.[0] ?? '').join('');
const fontCss = (css) => css.replace(/url\('(\/fonts\/migration\/[^']+)'\)/g, (_, f) => `url('${dataUri(join(APP, 'public', f))}')`);
const css = [
  fontCss(readFileSync(join(APP, 'src/client-migration/visual/aio-migration.css'), 'utf8')),
  readFileSync(join(APP, 'src/client-migration/visual/aio-migration-flow.css'), 'utf8'),
  readFileSync(join(APP, 'src/client-migration/visual/aio-migration-responsive.css'), 'utf8'),
  readFileSync(join(APP, 'src/styles/aio-uppercase.css'), 'utf8'),
  'a, button, input, label { pointer-events: none; }',
].join('\n');
const fonts = fontCss(readFileSync(join(APP, 'src/client-migration/visual/aio-migration.css'), 'utf8').match(/@font-face[\s\S]*?\}\s*@font-face[\s\S]*?\}/)[0]);

const data = {
  sha: SHA,
  built: new Date().toISOString().slice(0, 10),
  css,
  sprite: `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${symbols.replace(/\s+id="/g, ' id="').replaceAll('aio-icon-sheet.svg#', '#')}</svg>`,
  assets,
  screens: shots.map(({ key, branch, name, authority, route, actor, rep, html, auth }) => ({
    key,
    branch,
    name,
    authority,
    route: route.replace(/\?client=[^#]*/, ''),
    actor,
    rep: Boolean(rep),
    html: html.replace(/href="\/migration\/icons\/aio-icon-sheet\.svg#/g, 'href="#'),
    auth,
  })),
};
const template = readFileSync(join(APP, 'scripts/migration/gallery-template.html'), 'utf8');
const page = template.replace('/*__DATA__*/null', () => JSON.stringify(data).replace(/</g, '\\u003c')).replaceAll('__SHA__', SHA).replace('/*__FONTS__*/', () => fonts);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, page);
console.log(`gallery: ${OUT} · ${(page.length / 1024 / 1024).toFixed(2)} MB · ${shots.length} screens · ${SHA}`);
