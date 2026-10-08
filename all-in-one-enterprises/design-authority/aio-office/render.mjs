#!/usr/bin/env node
/**
 * Renders the AIO OFFICE visual authority candidates (HOME · WORK · REPORTS · MORE) from studio.html with Playwright.
 *
 *   node design-authority/aio-office/render.mjs                       → AIO_OFFICE_VISUAL_AUTHORITY/ (repo root) + manifest
 *   node design-authority/aio-office/render.mjs --out <dir> --only <id,id>  → preview renders (no manifest)
 *
 * A small static server serves the app root so the studio reads the approved assets from public/ exactly as they ship.
 * Chromium: /opt/pw-browsers/chromium when present, else Playwright's default. Design authority only — never deployed.
 */
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../..');
const REPO = resolve(APP, '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const OUT = resolve(arg('out', join(REPO, 'AIO_OFFICE_VISUAL_AUTHORITY')));
const ONLY = arg('only', '')
  .split(',')
  .filter(Boolean);
const OFFICIAL = OUT === join(REPO, 'AIO_OFFICE_VISUAL_AUTHORITY') && !ONLY.length;

/** Every authority frame: id, folder, viewport, query, capture mode. */
export const FRAMES = [
  // phone — 390 px, full page at 2× (and the first screen for the fold check)
  { id: 'AIO-OFFICE-HOME-MOBILE', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=home&role=founder&view=attention', full: true, fold: true },
  { id: 'AIO-OFFICE-HOME-MOBILE-QUICK-ACTIONS', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=home&role=founder&state=quick' },
  { id: 'AIO-OFFICE-HOME-MOBILE-STAFF', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=home&role=staff&view=deadlines', full: true },
  { id: 'AIO-OFFICE-WORK-MOBILE', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=work&role=founder', full: true, fold: true },
  { id: 'AIO-OFFICE-REPORTS-MOBILE', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=reports&role=founder', full: true, fold: true },
  { id: 'AIO-OFFICE-REPORTS-MOBILE-STAFF-NO-ACCESS', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=reports&role=staff', full: true },
  { id: 'AIO-OFFICE-MORE-MOBILE', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=more&role=founder', full: true, fold: true },
  { id: 'AIO-OFFICE-MORE-MOBILE-STAFF', dir: '01_MOBILE', w: 390, h: 844, dpr: 2, q: 'page=more&role=staff', full: true },
  // tablet — 834 px (approved tablet master width)
  { id: 'AIO-OFFICE-HOME-TABLET', dir: '02_TABLET', w: 834, h: 1194, dpr: 1, q: 'page=home&role=founder&view=deadlines', full: true },
  { id: 'AIO-OFFICE-WORK-TABLET', dir: '02_TABLET', w: 834, h: 1194, dpr: 1, q: 'page=work&role=founder', full: true },
  { id: 'AIO-OFFICE-REPORTS-TABLET', dir: '02_TABLET', w: 834, h: 1194, dpr: 1, q: 'page=reports&role=founder', full: true },
  { id: 'AIO-OFFICE-REPORTS-TABLET-STAFF-NO-ACCESS', dir: '02_TABLET', w: 834, h: 1194, dpr: 1, q: 'page=reports&role=staff', full: true },
  { id: 'AIO-OFFICE-MORE-TABLET', dir: '02_TABLET', w: 834, h: 1194, dpr: 1, q: 'page=more&role=founder', full: true },
  // desktop — 1440 × 900 (approved desktop master)
  { id: 'AIO-OFFICE-HOME-DESKTOP', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=home&role=founder&view=attention', full: true, fold: true },
  { id: 'AIO-OFFICE-HOME-DESKTOP-STAFF', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=home&role=staff&view=blocked', full: true },
  { id: 'AIO-OFFICE-WORK-DESKTOP', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=work&role=founder', full: true, fold: true },
  { id: 'AIO-OFFICE-REPORTS-DESKTOP', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=reports&role=founder', full: true, fold: true },
  { id: 'AIO-OFFICE-REPORTS-DESKTOP-STAFF-GRANTED', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=reports&role=staff-granted', full: true },
  { id: 'AIO-OFFICE-REPORTS-DESKTOP-STAFF-NO-ACCESS', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=reports&role=staff', full: true },
  { id: 'AIO-OFFICE-MORE-DESKTOP', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=more&role=founder', full: true, fold: true },
  { id: 'AIO-OFFICE-MORE-DESKTOP-STAFF', dir: '03_DESKTOP', w: 1440, h: 900, dpr: 1, q: 'page=more&role=staff', full: true },
  // ultra-wide proofs — 2560 × 1440, first screen
  { id: 'AIO-OFFICE-HOME-ULTRAWIDE', dir: '04_ULTRA_WIDE', w: 2560, h: 1440, dpr: 1, q: 'page=home&role=founder&view=blocked' },
  { id: 'AIO-OFFICE-WORK-ULTRAWIDE', dir: '04_ULTRA_WIDE', w: 2560, h: 1440, dpr: 1, q: 'page=work&role=founder' },
  { id: 'AIO-OFFICE-REPORTS-ULTRAWIDE', dir: '04_ULTRA_WIDE', w: 2560, h: 1440, dpr: 1, q: 'page=reports&role=founder' },
  { id: 'AIO-OFFICE-MORE-ULTRAWIDE', dir: '04_ULTRA_WIDE', w: 2560, h: 1440, dpr: 1, q: 'page=more&role=founder' },
  // shared components, icons and states
  { id: 'AIO-OFFICE-COMPONENTS-AND-STATES', dir: '05_COMPONENTS', w: 1440, h: 900, dpr: 1, q: 'page=kit', full: true },
  // original (founder drawing) vs revised — rendered last, from the phone frames above
  ...['HOME', 'WORK', 'REPORTS', 'MORE'].map((p) => ({ id: `AIO-OFFICE-${p}-ORIGINAL-VS-REVISED`, dir: '06_COMPARISON', w: 2800, h: 1400, dpr: 1, q: `page=${p.toLowerCase()}`, full: true, html: 'compare.html' })),
];

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json' };
function serve() {
  const server = createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const root = url.startsWith('/__out/') ? OUT : APP;
    const file = join(root, url.replace(/^\/__out\//, '/'));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)));
}

const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');

const CANON_NAV = ['HOME', 'INTAKE', 'WORK', 'REPORTS', 'MORE'];
const CANON_LANES = ['PERMITTING & AUTHORITIES', 'FILING & FUEL TAXES', 'COMPLIANCE', 'VEHICLES & FLEET', 'DISPATCH', 'BROKERAGE', 'INSURANCE', 'FACTORING', 'BOOKKEEPING', 'DRIVERS & CARRIERS', 'MECHANIC / MAINTENANCE', 'ROAD READY'];
const CANON_GROUPS = ['CLIENTS & RECORDS', 'BUSINESS', 'PEOPLE & NETWORK', 'SYSTEM'];

/** Visual QA read from the rendered DOM: the contract rules a reviewer would otherwise check by eye. */
async function qa(page, f) {
  const d = await page.evaluate(() => {
    const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    const texts = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const n = w.currentNode;
      const t = n.textContent.trim();
      if (!t || !n.parentElement || !vis(n.parentElement) || n.parentElement.closest('script,style,svg,[style*="display:none"],[style*="display: none"]')) continue;
      if (getComputedStyle(n.parentElement).textTransform !== 'uppercase' && /[a-z]/.test(t)) texts.push(t.slice(0, 40));
    }
    const nav = [...document.querySelectorAll('.navi span')].filter(vis).map((e) => e.textContent.trim());
    const lanes = [...document.querySelectorAll('.lane__name, .tile__name')].map((e) => e.textContent.trim());
    const groups = [...document.querySelectorAll('.group__t')].map((e) => e.textContent.trim());
    const body = document.body.innerText.toUpperCase();
    return {
      lowercase_text: texts,
      nav,
      lanes,
      groups,
      has_revenue: /COLLECTED REVENUE|\$\d/.test(body),
      has_crm_or_billing_entry: [...document.querySelectorAll('.entry__t')].some((e) => /GROWTH \/ CRM|^BILLING/.test(e.textContent.trim())),
      has_intake_tile: lanes.includes('INTAKE'),
      lockups: [...document.querySelectorAll('img')].filter((i) => /lockup|logo/.test(i.src)).map((i) => i.src.replace(location.origin, '')),
      fonts: document.fonts.check('16px "AO Roboto Condensed"') && document.fonts.check('16px "AO Roboto"'),
      stand_ins: document.querySelectorAll('.lane__standin').length,
      sample_tags: document.querySelectorAll('.sample').length,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  const page_ = new URLSearchParams(f.q).get('page');
  const role = new URLSearchParams(f.q).get('role') ?? 'founder';
  // comparison boards are founder review documents in plain English, not AIO product UI: the uppercase law is not applied to them
  const checks = {
    ...(f.html ? {} : { UPPERCASE_LAW: d.lowercase_text.length === 0 }),
    FONTS_LOADED: d.fonts,
    NO_HORIZONTAL_OVERFLOW: d.overflow <= 0,
  };
  if (!f.html && page_ !== 'kit') {
    checks.FIVE_ITEM_NAV_WORK_REPLACES_FILING = JSON.stringify(d.nav) === JSON.stringify(CANON_NAV);
    checks.APPROVED_HEADER_LOCKUP_ONLY = d.lockups.length === 1 && d.lockups[0] === '/public/migration/brand-lockup.png';
    // MORE is a directory with no figures; a no-access page shows none either
    if (page_ !== 'more' && role !== 'staff') checks.SAMPLE_DATA_LABELLED = d.sample_tags > 0;
  }
  if (page_ === 'work' && !f.html) checks.TWELVE_LANES_CANONICAL_ORDER_NO_INTAKE = JSON.stringify(d.lanes) === JSON.stringify(CANON_LANES) && !d.has_intake_tile;
  if (page_ === 'home' && !f.html && !f.q.includes('state=quick')) checks.HOME_TWELVE_LANES_NO_INTAKE = JSON.stringify(d.lanes) === JSON.stringify(CANON_LANES) && !d.has_intake_tile;
  if (page_ === 'more' && !f.html) checks.FOUR_MORE_GROUPS = JSON.stringify(d.groups) === JSON.stringify(CANON_GROUPS);
  if (role !== 'founder' && !f.html) checks.NO_FOUNDER_FINANCIALS_FOR_STAFF = !d.has_revenue;
  if (role !== 'founder' && page_ === 'more' && !f.html) checks.GRANT_ONLY_ENTRIES_OMITTED = !d.has_crm_or_billing_entry;
  return { checks, pass: Object.values(checks).every(Boolean), stand_ins: d.stand_ins, lowercase_text: d.lowercase_text.slice(0, 5) };
}

async function main() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/design-authority/aio-office/`;
  const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});
  const out = [];
  for (const f of FRAMES.filter((x) => !ONLY.length || ONLY.includes(x.id))) {
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: f.dpr });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('requestfailed', (r) => errors.push(`failed ${r.url()}`));
    page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
    await page.goto(`${base}${f.html ?? 'studio.html'}?${f.q}`);
    await page.waitForSelector('html[data-ready="1"]', { timeout: 20000 });
    await page.waitForTimeout(150);
    mkdirSync(join(OUT, f.dir), { recursive: true });
    const shots = [];
    if (f.fold) {
      const fold = join(OUT, f.dir, `${f.id}-${f.w}-FIRST-SCREEN.png`);
      await page.screenshot({ path: fold, fullPage: false });
      shots.push(fold);
    }
    const main = join(OUT, f.dir, `${f.id}-${f.w}.png`);
    if (f.full) await page.evaluate(() => document.documentElement.classList.add('full'));
    await page.screenshot({ path: main, fullPage: !!f.full });
    shots.unshift(main);
    const check = await qa(page, f);
    for (const s of shots) out.push({ frame: f.id, file: relative(REPO, s), viewport: `${f.w}x${f.h}`, dpr: f.dpr, query: f.q, sha256: sha(s), errors, qa: check });
    const failed = Object.entries(check.checks).filter(([, v]) => !v).map(([k]) => k);
    console.log(`${f.id} ${errors.length ? 'ERRORS ' + errors.join(' | ') : 'ok'}${failed.length ? ` QA FAIL ${failed.join(',')} ${JSON.stringify(check.lowercase_text)}` : ` qa ${Object.keys(check.checks).length}/${Object.keys(check.checks).length}`}`);
    await page.close();
  }
  await browser.close();
  server.close();
  if (OFFICIAL) writeFileSync(join(OUT, 'renders.json'), `${JSON.stringify(out, null, 2)}\n`);
  return out;
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
