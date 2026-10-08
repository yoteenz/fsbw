#!/usr/bin/env node
/**
 * AIO client migration — responsive blueprint QA (live browser).
 *
 *   npm run migration:responsive-qa            (dev server at MIG_MOCK_BASE, default http://127.0.0.1:5173)
 *
 * 1. ROOT composition vs the approved masters (AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT/masters): element boxes measured
 *    on the master vs the live DOM at the master viewport, IoU with a 4px tolerance → 0–100.
 * 2. Every other screen: RESPONSIVE_SYSTEM_CONFORMANCE 0–100 at TABLET (834×1194) and DESKTOP (1440×900) — shell for the
 *    actor, hero mode, grid mode, overflow, gutters, CTA rule, table rule, touch targets. Not a pixel match: descendants
 *    carry different content from the root masters.
 * 3. Actor / leak checks at MOBILE, TABLET, DESKTOP (client intake exposure, staff nav on client, dock on desktop, IFTA).
 * 4. Proof set A–G captured at mobile (427×768 @2x), tablet and desktop → blueprint proof/.
 * Writes validation/responsive-qa.json in the blueprint directory and prints a summary.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { SCREENS, SEED } from './migration-screens.mjs';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BP = resolve(APP, '../AIO_CLIENT_MIGRATION_RESPONSIVE_BLUEPRINT');
const BASE = process.env.MIG_MOCK_BASE ?? 'http://127.0.0.1:5173';
const CHROMIUM = process.env.MIG_MOCK_CHROMIUM ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const TOL = 4;

const VIEWPORTS = {
  MOBILE: { width: 427, height: 768, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  TABLET: { width: 834, height: 1194, deviceScaleFactor: 1, hasTouch: true },
  DESKTOP: { width: 1440, height: 900, deviceScaleFactor: 1 },
};
/** Proof set (sprint §validation): A root · B path form · C files received · D extracting · E founder review · F client review · G welcome. */
const PROOF = [
  ['A', 'root'],
  ['B', 'new'],
  ['C', 'received'],
  ['D', 'extract'],
  ['E', 'review'],
  ['F', 'company'],
  ['G', 'complete'],
];

/** Master element boxes (px on the approved root masters) → live selector; 'text' = cap box of the text. */
const MASTER = {
  TABLET: {
    file: 'masters/AIO-MIG-ROOT-TABLET-834x1194.png',
    vp: { width: 832, height: 1200 },
    els: [
      ['header', [0, 0, 832, 77], '.amg-head'],
      ['lockup', [33, 17, 247, 67], '.amg-head__lockup'],
      ['context', [270, 27, 428, 57], '.amg-head__ctx'],
      ['search', [516, 30, 541, 55], '.amg-head__search .amg-ico'],
      ['bell', [569, 29, 594, 55], '.amg-head__bell .amg-ico'],
      ['avatar', [619, 16, 671, 68], '.amg-head__avatar'],
      ['identity', [686, 26, 742, 57], '.amg-head__who', 'text'],
      ['hero band', [0, 77, 832, 400], '.amg-hero'],
      ['kicker', [48, 138, 317, 149], '.amg-hero__kicker', 'text'],
      ['title', [48, 163, 367, 274], '.amg-hero__title', 'text'],
      ['subtitle', [48, 290, 368, 357], '.amg-hero__sub', 'text'],
      ['path existing', [16, 400, 281, 632], '.amg-path@0'],
      ['path new', [289, 400, 544, 632], '.amg-path@1'],
      ['path batch', [552, 400, 816, 632], '.amg-path@2'],
      ['process band', [17, 645, 815, 826], '.amg-status'],
      ['file types', [17, 838, 429, 989], '.amg-typespanel'],
      ['secure', [440, 838, 815, 989], '.amg-secure'],
      ['cta', [187, 1007, 644, 1065], '.amg-main > .amg-cta'],
      ['dock', [0, 1087, 832, 1200], '.amg-dock'],
      ['dock active', [203, 1097, 327, 1172], '.amg-dock__item.is-on'],
    ],
  },
  DESKTOP: {
    file: 'masters/AIO-MIG-ROOT-DESKTOP-1440x900.png',
    vp: { width: 1440, height: 896 },
    els: [
      ['header', [0, 0, 1440, 68], '.amg-head'],
      ['lockup', [37, 11, 258, 56], '.amg-head__lockup'],
      ['context', [291, 16, 460, 55], '.amg-head__ctx'],
      ['search field', [719, 15, 1089, 55], '.amg-head__field'],
      ['bell', [1130, 22, 1152, 48], '.amg-head__bell .amg-ico'],
      ['avatar', [1203, 9, 1257, 63], '.amg-head__avatar'],
      ['identity', [1273, 19, 1329, 50], '.amg-head__who', 'text'],
      ['sidebar', [0, 68, 138, 896], '.amg-side'],
      ['sidebar active', [0, 155, 135, 215], '.amg-side__item.is-on'],
      ['hero band', [138, 68, 1440, 346], '.amg-hero'],
      ['kicker', [174, 102, 430, 114], '.amg-hero__kicker', 'text'],
      ['title', [174, 128, 505, 240], '.amg-hero__title', 'text'],
      ['subtitle', [174, 252, 541, 320], '.amg-hero__sub', 'text'],
      ['path existing', [154, 357, 569, 545], '.amg-path@0'],
      ['path new', [581, 357, 993, 545], '.amg-path@1'],
      ['path batch', [1005, 357, 1420, 545], '.amg-path@2'],
      ['process band', [154, 557, 1420, 679], '.amg-status'],
      ['file types', [154, 689, 600, 823], '.amg-typespanel'],
      ['secure', [610, 689, 990, 823], '.amg-secure'],
      ['what next', [1001, 689, 1420, 823], '.amg-rnext'],
      ['cta', [156, 833, 1420, 880], '.amg-main > .amg-cta'],
    ],
  },
};

const iou = (a, b) => {
  const g = (r) => [r[0] - TOL, r[1] - TOL, r[2] + TOL, r[3] + TOL];
  const [A, B] = [g(a), g(b)];
  const ix = Math.max(0, Math.min(A[2], B[2]) - Math.max(A[0], B[0]));
  const iy = Math.max(0, Math.min(A[3], B[3]) - Math.max(A[1], B[1]));
  const area = (r) => (r[2] - r[0]) * (r[3] - r[1]);
  return (ix * iy) / (area(A) + area(B) - ix * iy);
};

const browser = await chromium.launch(CHROMIUM ? { executablePath: CHROMIUM } : {});
async function open(s, vp) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor ?? 1, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await p.evaluate(SEED, s.seed);
  await p.goto(`${BASE}${s.route}`, { waitUntil: 'networkidle' });
  if (s.local) await p.setInputFiles('input.amg-file-input', s.local.map((name) => ({ name, mimeType: name.endsWith('.pdf') ? 'application/pdf' : name.endsWith('.png') ? 'image/png' : 'application/octet-stream', buffer: Buffer.alloc(name.endsWith('.pdf') ? 4404019 : 1887436) })));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  return { ctx, p, errors };
}

/* ── 1. root composition ── */
async function composition(which) {
  const m = MASTER[which];
  const root = SCREENS.find((s) => s.key === 'root');
  const { ctx, p } = await open(root, { ...m.vp, hasTouch: which === 'TABLET' });
  await p.screenshot({ path: join(BP, 'validation', `root-${which.toLowerCase()}-live.png`) });
  const live = await p.evaluate((els) => {
    const firstText = (el) => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (n.textContent.trim() && getComputedStyle(n.parentElement).display !== 'none') return n.parentElement;
      return el;
    };
    return els.map(([, , sel, mode]) => {
      const [q, idx = '0'] = sel.split('@');
      const e = document.querySelectorAll(q)[+idx];
      if (!e || getComputedStyle(e).display === 'none') return null;
      if (mode !== 'text') {
        const r = e.getBoundingClientRect();
        return [r.left, r.top, r.right, r.bottom].map(Math.round);
      }
      const rs = [];
      const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (!n.textContent.trim() || getComputedStyle(n.parentElement).display === 'none') continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        rs.push(...[...range.getClientRects()].filter((x) => x.width && x.height));
      }
      if (!rs.length) return null;
      // text rects are the font content area: trim to cap top / baseline (Roboto metrics)
      const fs = parseFloat(getComputedStyle(firstText(e)).fontSize);
      return [Math.min(...rs.map((x) => x.left)), Math.min(...rs.map((x) => x.top)) + 0.217 * fs, Math.max(...rs.map((x) => x.right)), Math.max(...rs.map((x) => x.bottom)) - 0.244 * fs].map(Math.round);
    });
  }, m.els);
  await ctx.close();
  const rows = m.els.map(([label, box], i) => ({ label, master: box, live: live[i], iou: live[i] ? +iou(box, live[i]).toFixed(3) : 0 }));
  return { master: m.file, viewport: m.vp, tolerancePx: TOL, score: +((rows.reduce((a, r) => a + r.iou, 0) / rows.length) * 100).toFixed(1), rows };
}

/* ── 2 + 3. per screen probe ── */
const probe = () => {
  const vis = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden';
  };
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return { l: r.left, t: r.top + scrollY, r: r.right, b: r.bottom + scrollY, w: r.width, h: r.height };
  };
  const root = document.querySelector('.amg');
  const head = document.querySelector('.amg-head');
  const hero = document.querySelector('.amg-hero');
  const main = document.querySelector('.amg-main');
  const side = document.querySelector('.amg-side');
  const navText = [...document.querySelectorAll('.amg nav, .amg header')].filter(vis).map((e) => e.innerText.toUpperCase()).join(' | ');
  const ctxEl = document.querySelector('.amg-head__ctx');
  const links = [...document.querySelectorAll('.amg a[href]')].filter(vis).map((a) => a.getAttribute('href'));
  const heroText = hero ? [...hero.querySelectorAll('.amg-hero__kicker, .amg-hero__title, .amg-hero__sub, .amg-hero__accent')].filter(vis) : [];
  const textRight = (el) => {
    let right = 0;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const q of range.getClientRects()) right = Math.max(right, q.right);
    }
    return right;
  };
  const overflow = [...(root?.querySelectorAll('*') ?? [])].filter((el) => vis(el) && !el.closest('.amg-env') && !el.classList.contains('amg-sr') && (el.getBoundingClientRect().right > innerWidth + 1 || el.getBoundingClientRect().left < -1)).length;
  const flow = document.querySelector('.amg-flow');
  const fMain = document.querySelector('.amg-flow__main');
  const fSide = document.querySelector('.amg-flow__side');
  const ctas = [...document.querySelectorAll('.amg-cta')].filter(vis);
  const interactive = [...document.querySelectorAll('.amg-main button, .amg-main a, .amg-main input, .amg-main [role=radio]')].filter(vis);
  const content = [...(main?.children ?? [])].filter((c) => vis(c) && !c.classList.contains('amg-hero') && !c.classList.contains('amg-file-input'));
  const contentL = content.length ? Math.min(...content.map((c) => c.getBoundingClientRect().left)) : 0;
  const contentR = content.length ? Math.max(...content.map((c) => c.getBoundingClientRect().right)) : 0;
  return {
    actor: root?.classList.contains('amg--client') ? 'client' : 'staff',
    decl: root ? { ...root.dataset } : {},
    dock: vis(document.querySelector('.amg-dock')),
    sidebar: vis(side),
    navW: vis(side) ? side.getBoundingClientRect().width : 0,
    field: vis(document.querySelector('.amg-head__field')),
    ctx: vis(ctxEl) ? ctxEl.innerText.replace(/\s+/g, ' ').trim().toUpperCase() : '',
    intakeNav: /\bINTAKE\b/.test(navText),
    officeLinks: links.filter((h) => h.startsWith('/office')).length,
    iftaLinks: links.filter((h) => /ifta/i.test(h)).length,
    iftaUi: document.querySelectorAll('.amg [class*="ifta"]').length,
    headH: head ? Math.round(head.getBoundingClientRect().height) : 0,
    plate: vis(document.querySelector('.amg-hero__plate')),
    env: vis(document.querySelector('.amg-env')),
    hero: hero && vis(hero) ? rect(hero) : null,
    heroTextRight: heroText.length ? Math.max(...heroText.map(textRight)) : 0,
    hscroll: document.documentElement.scrollWidth > innerWidth,
    overflow,
    split: flow ? getComputedStyle(flow).gridTemplateColumns.split(' ').length > 1 : null,
    flowMain: fMain && vis(fMain) ? rect(fMain) : null,
    flowSide: fSide && vis(fSide) ? rect(fSide) : null,
    paths: [...document.querySelectorAll('.amg-path')].filter(vis).map((e) => Math.round(e.getBoundingClientRect().top)),
    ctas: ctas.map((c) => ({ w: Math.round(c.getBoundingClientRect().width), h: Math.round(c.getBoundingClientRect().height) })),
    table: !!document.querySelector('.amg table, .amg [role=table]') && [...document.querySelectorAll('.amg table, .amg [role=table]')].some(vis),
    touch: interactive.length ? interactive.filter((e) => e.getBoundingClientRect().height >= 32 || e.getBoundingClientRect().width >= 32).length / interactive.length : 1,
    contentL,
    contentR,
    vw: innerWidth,
  };
};

function conformance(m, vpName, s) {
  const d = m.decl;
  const parts = {};
  // shell for the actor (20)
  // context line: tablet shows the area (as the master's CLIENT MIGRATION), desktop the office + area
  if (m.actor === 'client') parts.shell = !m.dock && !m.sidebar && !m.field && !m.intakeNav && !m.ctx.includes('MIGRATION') && m.ctx.includes(vpName === 'DESKTOP' ? 'CLIENT OFFICE' : 'CLIENT ACTIVATION') ? 20 : 0;
  else if (vpName === 'DESKTOP') parts.shell = m.sidebar && m.field && !m.dock && m.headH === 68 && m.ctx === 'AIO OFFICE CLIENT MIGRATION' ? 20 : 0;
  else parts.shell = m.dock && !m.sidebar && !m.field && m.headH === 77 && m.ctx.includes('CLIENT MIGRATION') ? 20 : 0;
  // hero mode (15): band present, text inside the left safe zone, band height in the mode's range
  if (d.hero === 'NONE') parts.hero = m.hero ? 0 : 15;
  else {
    const band = m.hero && (m.plate || (d.pageType === 'ARRIVAL' && m.env));
    const safe = m.hero ? m.heroTextRight <= m.hero.l + m.hero.w * 0.62 : false;
    const hmax = d.hero === 'FULL' ? (d.pageType === 'ARRIVAL' ? 520 : 340) : 330;
    parts.hero = (band ? 7 : 0) + (safe ? 5 : 0) + (m.hero && m.hero.h <= hmax ? 3 : 0);
  }
  // grid mode (15)
  if (d.grid === 'PATHS_3UP') parts.grid = m.paths.length === 3 && new Set(m.paths).size === 1 ? 15 : 0;
  else if (m.flowSide && m.flowMain) {
    const sideBySide = m.flowSide.l >= m.flowMain.r - 1;
    parts.grid = (vpName === 'DESKTOP' ? sideBySide : m.flowSide.t >= m.flowMain.t) ? 15 : 0;
  } else parts.grid = 15;
  if ((d.grid === 'CENTERED' || d.grid === 'SINGLE') && vpName === 'DESKTOP') parts.grid = Math.abs(m.contentL - m.navW - (m.vw - m.contentR)) <= 6 ? parts.grid : 0;
  // overflow (15)
  parts.overflow = !m.hscroll && m.overflow === 0 ? 15 : 0;
  // gutters (10): content sits at least one gutter inside the workspace (viewport minus the sidebar) and symmetric in it —
  // full-width work, a centred SINGLE measure and the centred client column all satisfy it
  const inL = m.contentL - m.navW;
  const inR = m.vw - m.contentR;
  parts.gutter = inL >= 13 && Math.abs(inL - inR) <= 6 ? 10 : 0;
  // CTA rule (10): one primary gold action; tablet keeps it moderate when it is the page action
  parts.cta = m.ctas.length <= 1 ? 10 : 0;
  // table rule (5)
  parts.table = d.table === 'TABLE' ? (m.table ? 5 : 0) : 5;
  // touch targets (10) — tablet only; desktop pointer gets the points
  parts.touch = vpName === 'TABLET' ? Math.round(m.touch * 10) : 10;
  return { score: Object.values(parts).reduce((a, b) => a + b, 0), parts };
}

const out = { generatedAt: new Date().toISOString(), base: BASE, composition: {}, screens: [], checks: [], proof: [] };
mkdirSync(join(BP, 'validation'), { recursive: true });
mkdirSync(join(BP, 'proof'), { recursive: true });

for (const which of ['TABLET', 'DESKTOP']) {
  out.composition[which] = await composition(which);
  console.log(`ROOT ${which} composition ${out.composition[which].score}`);
}

const rows = [];
const CONCURRENCY = +(process.env.MIG_QA_CONCURRENCY ?? 3);
async function auditScreen(s) {
  const entry = { key: s.key, authority: s.authority, route: s.route, viewports: {} };
  for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
    const { ctx, p, errors } = await open(s, vp);
    const m = await p.evaluate(probe);
    const proof = PROOF.find(([, key]) => key === s.key);
    if (proof) {
      const file = `proof/${proof[0]}-${s.key}-${vpName.toLowerCase()}.jpg`;
      await p.screenshot({ path: join(BP, file), type: 'jpeg', quality: 78 });
      out.proof.push({ id: proof[0], screen: s.key, viewport: vpName, file });
    }
    await ctx.close();
    rows.push({ key: s.key, vp: vpName, ...m, errors: errors.length });
    entry.viewports[vpName] = vpName === 'MOBILE' ? { errors: errors.length, hscroll: m.hscroll } : { ...conformance(m, vpName, s), errors: errors.length, probe: m };
  }
  entry.conformance = Math.round((entry.viewports.TABLET.score + entry.viewports.DESKTOP.score) / 2);
  console.log(`${s.key.padEnd(17)} tablet ${String(entry.viewports.TABLET.score).padStart(3)}  desktop ${String(entry.viewports.DESKTOP.score).padStart(3)}  → ${entry.conformance}`);
  return entry;
}
const queue = [...SCREENS];
const done = new Map();
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let s = queue.shift(); s; s = queue.shift()) done.set(s.key, await auditScreen(s));
  }),
);
out.screens = SCREENS.map((s) => done.get(s.key));
rows.sort((a, b) => SCREENS.findIndex((s) => s.key === a.key) - SCREENS.findIndex((s) => s.key === b.key));

const check = (name, pass, detail = '') => out.checks.push({ name, pass, detail });
const list = (rs) => rs.map((r) => `${r.key}@${r.vp}`).join(', ');
const client = rows.filter((r) => r.actor === 'client');
const staff = rows.filter((r) => r.actor === 'staff');
check('CLIENT_INTAKE_EXPOSURE', client.every((r) => !r.intakeNav), list(client.filter((r) => r.intakeNav)));
check('STAFF_NAV_ON_CLIENT', client.every((r) => !r.dock && !r.sidebar && !r.field && r.officeLinks === 0), list(client.filter((r) => r.dock || r.sidebar || r.field || r.officeLinks)));
check('MOBILE_BOTTOM_DOCK_ON_DESKTOP', rows.filter((r) => r.vp === 'DESKTOP').every((r) => !r.dock), list(rows.filter((r) => r.vp === 'DESKTOP' && r.dock)));
check('DESKTOP_STAFF_SIDEBAR', staff.filter((r) => r.vp === 'DESKTOP').every((r) => r.sidebar && r.field), list(staff.filter((r) => r.vp === 'DESKTOP' && !(r.sidebar && r.field))));
check('TABLET_STAFF_DOCK', staff.filter((r) => r.vp === 'TABLET').every((r) => r.dock && !r.sidebar), list(staff.filter((r) => r.vp === 'TABLET' && !(r.dock && !r.sidebar))));
check('MOBILE_SHELL_LOCKED', rows.filter((r) => r.vp === 'MOBILE').every((r) => !r.sidebar && !r.field && !r.ctx && r.dock === (r.actor === 'staff')), list(rows.filter((r) => r.vp === 'MOBILE' && (r.sidebar || r.field || r.ctx || r.dock !== (r.actor === 'staff')))));
check('IFTA_CONTENT_LEAK', rows.every((r) => !r.iftaLinks && !r.iftaUi), list(rows.filter((r) => r.iftaLinks || r.iftaUi)));
check('NO_HORIZONTAL_SCROLL', rows.every((r) => !r.hscroll), list(rows.filter((r) => r.hscroll)));
check('NO_PAGE_ERRORS', rows.every((r) => !r.errors), list(rows.filter((r) => r.errors)));
check('DECLARATIONS_PRESENT', rows.every((r) => r.decl.pageType && r.decl.density && r.decl.hero && r.decl.grid), list(rows.filter((r) => !r.decl.pageType)));
for (const c of out.checks) console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? `  — ${c.detail}` : ''}`);

const desc = out.screens.filter((s) => s.key !== 'root');
out.summary = {
  rootTablet: out.composition.TABLET.score,
  rootDesktop: out.composition.DESKTOP.score,
  conformanceMean: Math.round(desc.reduce((a, s) => a + s.conformance, 0) / desc.length),
  conformanceMin: Math.min(...desc.map((s) => s.conformance)),
  below90: desc.filter((s) => s.conformance < 90).map((s) => `${s.key} ${s.conformance}`),
  checksPassed: `${out.checks.filter((c) => c.pass).length}/${out.checks.length}`,
};
console.log(JSON.stringify(out.summary));
writeFileSync(join(BP, 'validation', 'responsive-qa.json'), `${JSON.stringify(out, null, 1)}\n`);
await browser.close();
process.exit(out.checks.every((c) => c.pass) ? 0 : 1);
