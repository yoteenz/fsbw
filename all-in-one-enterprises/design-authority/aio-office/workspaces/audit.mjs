/**
 * Text and layout audit for the four workspace proofs: walks every panel, tab, record and drawer state at four sizes and
 * reports text that wraps where a component is meant to be one line, text cut off with "…" (and whether the full text is
 * still reachable), text clipped by its container, text overlapping other text, and text below the 9 px floor.
 *
 *   node design-authority/aio-office/workspaces/audit.mjs <workspacesDist> [out.json]
 *
 * qa.mjs imports AUDIT_STATES and pageAudit() from here, so the review is held to the same rules.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Components drawn to hold one line. Anything here that wraps or is cut is a defect. */
export const SINGLE_LINE = [
  '.sw:not(.fx dd .sw)', '.wseg__b', '.ro b', '.ro span', '.fl-chip b', '.fl-tag__l', '.fl-tag__w', '.fl-cg span', '.wbtn', '.chipsel', '.cl-svc span',
  '.rg__t', '.rg__n', '.sec-l', '.grp span', '.fx dt', '.lt-m', '.lt-amt', '.hz-m b', '.cp-cd b', '.cp-cd small', '.vis', '.simtag', '.founder', '.design-pill',
  '.wsb__t', '.wsb__no', '.fl-row .pk__t', '.fl-row .pk__s', '.fl-big', '.cl-dir .pk__t', '.cl-dir .pk__s', '.bk-ph b', '.bk-ph span', '.cx__crumb', '.nx__l', '.av',
  '.fl-stage__unit small', '.fl-stage__unit span', '.fl-stage__ro dd', '.fl-stage__ro dt', '.cl-id__t small', '.cl-g span', '.hz-lane', '.hz-months span', '.cp-subj small',
  '.cl-truck b', '.cl-sp__t b', '.cl-rp__s .sw',
];

/** Every state the audit visits: [view, actions[]]. Phone-only drawer actions are swapped in by the runner. */
export const AUDIT_STATES = (() => {
  const s = [];
  const fleetUnits = ['v-tk-09', 'v-rl-101', 'v-rl-104', 'v-dh-12', 'v-tk-07', 'v-hf-3', 'v-abc-1', 'v-abc-2'];
  const conns = ['registration', 'driver', 'insurance', 'maintenance', 'compliance', 'ifta', 'dispatch', 'documents'];
  s.push(['fleet', []]);
  for (const u of fleetUnits) s.push(['fleet', [['fl.unit', u]]]);
  for (const c of conns) s.push(['fleet', [['fl.sec', c]]]);
  s.push(['fleet', [['sim.ask', 'fl:tk:t-tk-2']]]);
  for (const ph of ['collect', 'reconcile', 'review', 'deliver']) s.push(['books', [['bk.phase', ph]]]);
  for (const [c, p] of [['c-tk', 'AUG 2026'], ['c-tk', 'OCT 2026'], ['c-rl', 'SEP 2026'], ['c-dh', 'SEP 2026'], ['c-rj', 'SEP 2026']]) s.push(['books', [['bk.client', c], ['bk.period', p]]]);
  s.push(['books', [['bk.phase', 'collect'], ['bk.item', 'doc:s4']]], ['books', [['bk.phase', 'review'], ['bk.item', 'chk:0']]], ['books', [['bk.phase', 'deliver'], ['bk.item', 'rep:pl']]], ['books', [['bk.cat', 'q1|FUEL']]]);
  s.push(['comp', []]);
  for (const id of ['dl-tk-09', 'dl-rj-ucr', 'dl-dh-pol', 'dl-abc-insp', 'dl-tk-insp', 'dl-rl-cq', 'dl-dh-decals', 'dl-rl-irp']) s.push(['comp', [['cp.item', id]]]);
  for (const sec of ['dot_safety', 'audits', 'corrective']) s.push(['comp', [['cp.sec', sec]]]);
  s.push(['comp', [['cp.item', 'dl-rj-ucr'], ['sim.ask', 'cp:pay:dl-rj-ucr']]]);
  for (const c of ['c-abc', 'c-tk', 'c-rl', 'c-dh', 'c-hf', 'c-rj', 'c-mt', 'c-hc']) s.push(['client', [['cl.client', c]]]);
  for (const v of ['fleet', 'people', 'documents', 'activity', 'billing']) s.push(['client', [['cl.view', v]]]);
  for (const sv of ['permitting', 'insurance', 'compliance', 'drivers', 'maintenance', 'roadready', 'vehicles']) s.push(['client', [['cl.service', sv]]]);
  for (const k of ['policy:pol-abc', 'vehicle:v-abc-1', 'vehicle:v-abc-2', 'driver:d-abc-1', 'deadline:dl-abc-med', 'request:req-abc-irp', 'ticket:t-abc-1', 'document:doc-abc-coi']) s.push(['client', [['cl.push', k]]]);
  for (const [c, k] of [['c-tk', 'ticket:t-tk-2'], ['c-tk', 'load:ld-5517'], ['c-tk', 'quarter:ifta-tk-q3'], ['c-tk', 'cycle:cy-tk-sep'], ['c-dh', 'policy:pol-dh'], ['c-hf', 'request:req-hf-mc'], ['c-tk', 'invoice:inv-3301']]) s.push(['client', [['cl.client', c], ['cl.push', k]]]);
  return s;
})();
const PHONE_ACT = { 'fl.sec': 'fl.open', 'bk.item': 'bk.open', 'cp.item': 'cp.open' };
export const phoneActs = (acts) => acts.map(([a, v]) => [PHONE_ACT[a] || a, v]);

/** Runs inside the page. Returns the issues found in the device screen right now. */
export function pageAudit(SINGLE) {
  const scr = document.getElementById('rv-screen');
  const W = scr.clientWidth;
  const box = scr.getBoundingClientRect();
  const scale = box.width / W || 1;
  const out = [];
  const label = (e) => `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).trim().split(/\s+/).slice(0, 2).join('.')}`;
  const txt = (e) => (e.innerText || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
  const visible = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[inert]'); };
  /** Lines of text in e: text-node boxes grouped by vertical overlap (icons and pips are not text). */
  const lines = (e) => {
    const boxes = [];
    const walk = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      if (!walk.currentNode.textContent.trim()) continue;
      const r = document.createRange();
      r.selectNodeContents(walk.currentNode);
      for (const q of r.getClientRects()) if (q.width > 1) boxes.push(q);
    }
    boxes.sort((a, b) => a.top - b.top);
    let n = 0;
    let bottom = -Infinity;
    for (const q of boxes) {
      const mid = (q.top + q.bottom) / 2;
      if (mid > bottom) { n++; bottom = q.bottom; } else bottom = Math.max(bottom, q.bottom);
    }
    return n;
  };
  const seen = new Set();
  for (const sel of SINGLE) for (const e of scr.querySelectorAll(sel)) {
    if (seen.has(e) || !visible(e) || !txt(e)) continue;
    seen.add(e);
    if (lines(e) > 1) out.push({ kind: 'WRAPS', sel, el: label(e), text: txt(e) });
  }
  for (const e of scr.querySelectorAll('*')) {
    if (!visible(e) || e.closest('svg')) continue;
    const cs = getComputedStyle(e);
    if (cs.textOverflow === 'ellipsis' && e.scrollWidth > e.clientWidth + 1 && txt(e)) {
      const full = e.closest('[title],[aria-label]');
      out.push({ kind: 'TRUNCATED', el: label(e), text: txt(e), reachable: !!full });
    }
    const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    if (parseFloat(cs.fontSize) < 9) out.push({ kind: 'TINY', el: label(e), text: txt(e), size: cs.fontSize });
    const r = e.getBoundingClientRect();
    for (let a = e.parentElement; a && a !== scr; a = a.parentElement) {
      const o = getComputedStyle(a);
      const ox = o.overflowX;
      if (ox === 'visible') continue;
      const ar = a.getBoundingClientRect();
      const over = Math.max(ar.left - r.left, r.right - ar.right) / scale;
      // the rows drawn to scroll sideways, each with an edge fade: tab rows, the phone service line, the period and yard strips
      if (over > 1.5) out.push({ kind: /auto|scroll/.test(ox) ? 'SCROLLS_X' : 'CLIPPED', el: label(e), text: txt(e), by: label(a), px: Math.round(over), scroller: a.matches('.wseg--scroll, .cl-svcs__line, .bk-strip, .fl-strip') });
      break;
    }
  }
  // overlapping text: leaves whose boxes intersect a non-related leaf
  // fixed chrome (header, dock, sidebar) sits over scrolled content on purpose
  // text scrolled or clipped out of its container is not on screen, so it cannot overlap anything
  const shown = (e) => {
    const r = e.getBoundingClientRect();
    for (let a = e.parentElement; a && a !== scr; a = a.parentElement) {
      if (getComputedStyle(a).overflowX === 'visible' && getComputedStyle(a).overflowY === 'visible') continue;
      const q = a.getBoundingClientRect();
      if (r.right <= q.left + 1 || r.left >= q.right - 1 || r.bottom <= q.top + 1 || r.top >= q.bottom - 1) return false;
    }
    return true;
  };
  const leaves = [...scr.querySelectorAll('*')].filter((e) => visible(e) && !e.closest('svg, .head, .dock, .side') && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && shown(e));
  // compare the ink, not the line box: the cap-height band of each text box (all office text is uppercase)
  const rects = leaves.map((e) => {
    const cs = getComputedStyle(e);
    const fs = parseFloat(cs.fontSize) * scale;
    const own = cs.overflow !== 'visible' ? e.getBoundingClientRect() : null; // lines a clamp hides are not on screen
    const out = [];
    for (const n of e.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) {
        const mid = (q.top + q.bottom) / 2;
        if (q.width > 1 && (!own || (mid > own.top && mid < own.bottom))) out.push({ left: q.left, right: q.right, top: mid - 0.36 * fs, bottom: mid + 0.36 * fs });
      }
    }
    return [e, out];
  });
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const [a, ra] = rects[i];
    const [b, rb] = rects[j];
    if (a.contains(b) || b.contains(a)) continue;
    if (a.closest('.wsheet') !== b.closest('.wsheet')) continue; // a drawer covers the page on purpose
    let hit = 0;
    for (const p of ra) for (const q of rb) hit = Math.max(hit, Math.max(0, Math.min(p.right, q.right) - Math.max(p.left, q.left)) * Math.max(0, Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top)));
    if (hit / (scale * scale) > 6) out.push({ kind: 'OVERLAPS', el: label(a), text: txt(a), with: `${label(b)} ${txt(b)}` });
  }
  return out;
}

/* ── standalone runner ── */
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const HERE = dirname(fileURLToPath(import.meta.url));
  const APP = resolve(HERE, '../../..');
  const DIST = resolve(process.argv[2] || join(HERE, 'dist'));
  const OUT = process.argv[3] ? resolve(process.argv[3]) : null;
  const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));
  const srv = await new Promise((r) => {
    const s = createServer((q, res) => {
      if (q.url === '/favicon.ico') return res.writeHead(204).end();
      const p = join(DIST, decodeURIComponent(new URL(q.url, 'http://x').pathname));
      if (!p.startsWith(DIST) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
      res.writeHead(200, { 'content-type': { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png' }[extname(p)] || 'application/octet-stream' });
      createReadStream(p).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => r(s));
  });
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
  const DEV = { phone: [390, 844], tablet: [834, 1194], desktop: [1440, 900], wide: [2560, 1440] };
  const issues = [];
  for (const dev of Object.keys(DEV)) {
    const p = await browser.newPage({ viewport: { width: DEV[dev][0] + 60, height: DEV[dev][1] + 300 } });
    await p.goto(`http://127.0.0.1:${srv.address().port}/local.html?device=${dev}#fleet`);
    await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
    await p.evaluate(() => document.fonts.ready);
    for (const [view, acts] of AUDIT_STATES) {
      await p.evaluate(([v, d]) => { window.AIO_WS.reset(); window.AIO_WS.open(v, d); window.AIO_WS.capture(true); }, [view, dev]);
      for (const [a, v] of dev === 'phone' ? phoneActs(acts) : acts) await p.evaluate(([a, v]) => window.AIO_WS.act(a, v), [a, v]);
      await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
      const state = `${view}${acts.length ? ` ${acts.map(([a, v]) => `${a}=${v}`).join(' ')}` : ''}`;
      for (const i of await p.evaluate(pageAudit, SINGLE_LINE)) issues.push({ dev, state, ...i });
    }
    await p.close();
  }
  await browser.close();
  srv.close();
  const key = (i) => `${i.kind}|${i.dev}|${i.el}|${i.text}`;
  const uniq = [...new Map(issues.map((i) => [key(i), i])).values()];
  const by = {};
  for (const i of uniq) by[i.kind] = (by[i.kind] || 0) + 1;
  console.log(`audit: ${uniq.length} distinct issues`, JSON.stringify(by));
  if (OUT) writeFileSync(OUT, JSON.stringify({ by, issues: uniq }, null, 1));
}
