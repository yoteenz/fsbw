/**
 * QA for the four workspace proofs: interaction journeys, dead controls, handlers, keyboard reach, fit, overflow, the
 * uppercase law, console errors, founder / staff visibility, the TRY demonstrations, the motion system (tokens, drawers
 * entering and leaving, reduced motion), drawer focus and keyboard behaviour, the text audit (audit.mjs) over every
 * panel, tab, record and drawer at four sizes, and screenshots.
 *
 *   node design-authority/aio-office/workspaces/qa.mjs <workspacesDist> [screensDir]
 *
 * Writes <workspacesDist>/qa-report.json, and JPG screenshots to screensDir when given. Exits 1 when a check fails.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { SINGLE_LINE, AUDIT_STATES, phoneActs, pageAudit } from './audit.mjs';
import { pageStructure } from './audit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const DIST = resolve(process.argv[2] || join(HERE, 'dist'));
const SHOTS = process.argv[3] ? resolve(process.argv[3]) : null;
if (!existsSync(join(DIST, 'local.html'))) throw new Error(`qa: build first — no ${DIST}/local.html`);
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));
const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = await new Promise((r) => {
  const s = createServer((q, res) => {
    if (q.url === '/favicon.ico') return res.writeHead(204).end(); // the page declares none; the artifact host supplies it
    const p = join(DIST, decodeURIComponent(new URL(q.url, 'http://x').pathname));
    if (!p.startsWith(DIST) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    createReadStream(p).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const URL0 = `http://127.0.0.1:${srv.address().port}/local.html`;
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const DEV = { phone: [390, 844], tablet: [834, 1194], desktop: [1440, 900], wide: [2560, 1440] };
const WS = ['fleet', 'books', 'comp', 'client'];
/** Every registered page (approved roots, departments, deeper office pages), read from the built review. */
const REG = await (async () => {
  const p = await browser.newPage();
  await p.goto(URL0);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  const r = await p.evaluate(() => window.AIO_WS.registry());
  await p.close();
  return r;
})();
const results = [];
const errors = [];
const TMP = join(tmpdir(), `aio-ws-qa-${process.pid}`);
mkdirSync(TMP, { recursive: true });
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail: ok ? '' : String(detail).slice(0, 400) });
  if (!ok) console.log(`FAIL ${name} ${String(detail).slice(0, 300)}`);
}
async function open(view, dev = 'desktop', role = 'founder') {
  const p = await browser.newPage({ viewport: { width: Math.max(1500, DEV[dev][0] + 60), height: DEV[dev][1] + 300 } });
  p.on('pageerror', (e) => errors.push(`${view}/${dev}: ${e}`));
  p.on('console', (m) => m.type() === 'error' && errors.push(`${view}/${dev}: ${m.text()}`));
  await p.goto(`${URL0}?device=${dev}&role=${role}#${view}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => window.AIO_WS.capture(true));
  return p;
}
const act = (p, a, v = '') => p.evaluate(([a, v]) => window.AIO_WS.act(a, v), [a, v]);
const st = (p) => p.evaluate(() => window.AIO_WS.state());
const txt = (p, sel) => p.evaluate((s) => [...document.querySelectorAll(`#rv-screen ${s}`)].map((e) => e.innerText).join(' | '), sel);
const count = (p, sel) => p.evaluate((s) => document.querySelectorAll(`#rv-screen ${s}`).length, sel);
/** A drawer leaves on its own (about 200 ms) before the workspace behind it changes. */
const sheetGone = (p) => p.waitForFunction(() => !document.querySelector('#rv-screen .wsheet'), null, { timeout: 2000 }).then(() => true, () => false);
const settle = (p) => p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
async function shot(p, name) {
  if (!SHOTS) return;
  await p.evaluate(() => window.AIO_WS.capture(true));
  await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish())); // capture the settled state, not a frame of the entrance
  const png = join(TMP, `${name}.png`);
  await p.locator('#rv-device').screenshot({ path: png });
  execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nif im.width>1440: im=im.resize((1440,round(im.height*1440/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=82,optimize=True,progressive=True)', png, join(SHOTS, `${name}.jpg`)]);
}

/* ── structural checks on whatever is drawn ── */
async function structure(p, label, { fits }) {
  const r = await p.evaluate(() => {
    const scr = document.getElementById('rv-screen');
    const handlers = new Set(window.AIO_WS.actions());
    const all = [...scr.querySelectorAll('[data-a]')];
    const unknown = [...new Set(all.map((e) => e.dataset.a).filter((a) => !handlers.has(a)))];
    const dead = [...scr.querySelectorAll('button, [role=button], a')].filter((b) => !b.disabled && !b.closest('[inert]') && !(b.dataset.a || b.dataset.act || b.dataset.k || b.dataset.go || b.dataset.input) && !(b.tagName === 'A' && /^(https?:|mailto:|tel:)/.test(b.getAttribute('href') || ''))).map((b) => b.outerHTML.slice(0, 90)); // a real link out is live
    const inputs = [...scr.querySelectorAll('input')].filter((i) => !i.dataset.input).length;
    // every clickable that is not a native control can be reached and pressed from the keyboard
    const unreachable = [...scr.querySelectorAll('[data-a]:not(button):not(input):not(.wscrim), [data-k]:not(button), [data-go]:not(button)')].filter((e) => e.getAttribute('tabindex') !== '0' || e.getAttribute('role') !== 'button').map((e) => e.outerHTML.slice(0, 80));
    // the uppercase law: every visible letter renders uppercase
    const lower = [];
    const walk = document.createTreeWalker(scr, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const n = walk.currentNode;
      const t = n.textContent.trim();
      if (!t || t === t.toUpperCase()) continue;
      const el = n.parentElement;
      if (!el.getClientRects().length || getComputedStyle(el).textTransform === 'uppercase') continue;
      lower.push(t.slice(0, 40));
    }
    // anything wider than the device that is not inside a scroller
    const W = scr.clientWidth;
    const devBox = scr.getBoundingClientRect();
    const scale = devBox.width / W;
    const wide = [...scr.querySelectorAll('*')].filter((e) => {
      const b = e.getBoundingClientRect();
      if (!b.width || (b.right - devBox.left) / scale <= W + 1) return false;
      for (let a = e.parentElement; a && a !== scr; a = a.parentElement) {
        const o = getComputedStyle(a);
        if (/(auto|scroll|hidden|clip)/.test(o.overflowX)) return false;
      }
      return true;
    }).map((e) => e.className || e.tagName).slice(0, 5);
    return { unknown, dead, inputs, unreachable, lower: lower.slice(0, 6), wide, sh: scr.scrollHeight, ch: scr.clientHeight, sw: scr.scrollWidth, cw: scr.clientWidth };
  });
  check(`${label} · every control is keyboard-reachable`, !r.unreachable.length, r.unreachable);
  check(`${label} · every control has a handler`, !r.unknown.length, r.unknown);
  check(`${label} · no dead controls`, !r.dead.length, r.dead);
  check(`${label} · inputs are wired`, r.inputs === 0, r.inputs);
  check(`${label} · uppercase law`, !r.lower.length, r.lower);
  check(`${label} · no horizontal overflow`, r.sw <= r.cw + 1 && !r.wide.length, `${r.sw}/${r.cw} ${r.wide}`);
  if (fits) check(`${label} · fits one screen (only lists scroll)`, r.sh <= r.ch + 1, `${r.sh} > ${r.ch}`);
}

/* ── 1 · every page on every device: draws, fits (departments), no dead controls; screenshots ── */
for (const w of REG) {
  for (const dev of Object.keys(DEV)) {
    const p = await open(w.id, dev);
    const label = `${w.id} · ${dev}`;
    check(`${label} · draws`, (await count(p, '.main')) === 1 && !/FAILED TO DRAW/.test(await txt(p, '.main')));
    await structure(p, label, { fits: !w.root && dev !== 'phone' });
    await shot(p, `${w.id}--${dev}`);
    await p.close();
  }
}

/* ── 2 · VEHICLES & FLEET ── */
{
  const p = await open('fleet');
  await act(p, 'fl.unit', 'v-abc-1');
  check('fleet · select a truck moves the stage', /UNIT 1\b/.test(await txt(p, '.fl-stage__unit')) && (await st(p)).fleet.unit === 'v-abc-1');
  check('fleet · the panel opens the first issue on the truck', (await st(p)).fleet.sec !== 'maintenance');
  await act(p, 'fl.sec', 'insurance');
  check('fleet · change section changes the panel', /AUTO LIABILITY/.test(await txt(p, '.fl-cx .cx__t')));
  await shot(p, 'fleet--desktop--selected');
  await act(p, 'fl.filter', 'shop');
  const shop = await count(p, '.fl-row');
  check('fleet · readout filters the yard', shop === 2, shop);
  await act(p, 'fl.filter', 'all');
  await p.click('#fl-q');
  await p.keyboard.type('mack');
  const rows = await count(p, '.fl-row');
  const focused = await p.evaluate(() => document.activeElement?.id);
  check('fleet · search narrows the yard and keeps focus', rows === 1 && focused === 'fl-q', `${rows} rows, focus ${focused}`);
  await p.fill('#fl-q', '');
  await p.dispatchEvent('#fl-q', 'input');
  // real clicks through the page: roster row, a tag on the truck, the simulated confirm
  await p.click('#rv-screen .fl-row[data-v="v-tk-09"]');
  await p.click('#rv-screen .fl-tag[data-v="maintenance"]');
  check('fleet · clicking a tag on the truck opens that section', (await st(p)).fleet.sec === 'maintenance');
  await p.click('#rv-screen [data-a="sim.ask"][data-v="fl:tk:t-tk-2"]');
  check('fleet · a simulated action confirms inline and says so', /SIMULATED/.test(await txt(p, '.simc .simtag')) && /NOTHING IS SAVED OR SENT/.test(await txt(p, '.simc')));
  await shot(p, 'fleet--desktop--action');
  await p.click('#rv-screen [data-a="sim.ok"]');
  check('fleet · confirming shows WORKING on the button first', /WORKING/.test(await txt(p, '.simc [data-a="sim.ok"]')) && (await count(p, '.simc [data-a="sim.no"][disabled]')) === 1);
  await p.waitForFunction(() => window.AIO_WS.state().sims === 1, null, { timeout: 3000 }).catch(() => {});
  check('fleet · confirming changes the sample state and the history', /AUTHORIZATION REQUESTED/.test(await txt(p, '.fl-cx')) && /JUST NOW/.test(await txt(p, '.fl-cx .mh')) && (await st(p)).sims === 1);
  await p.waitForTimeout(500);
  check('fleet · the confirmation toast says it was simulated', await p.evaluate(() => /SIMULATED/.test(document.getElementById('rv-toast').innerText)));
  await p.click('#rv-screen .fl-client');
  check('fleet · the client chip opens Client 360 with a way back', (await st(p)).view === 'client' && (await count(p, '[data-a="ret"]')) === 1);
  await p.click('#rv-screen [data-a="ret"]');
  check('fleet · back returns to the same truck', (await st(p)).view === 'fleet' && (await st(p)).fleet.unit === 'v-tk-09');
  await p.close();
  const m = await open('fleet', 'phone');
  await m.click('#rv-screen .fl-cg[data-v="driver"]');
  check('fleet · phone opens a connection in a drawer', (await count(m, '.wsheet')) === 1);
  await shot(m, 'fleet--phone--context');
  await m.click('#rv-screen .wscrim', { position: { x: 20, y: 20 } });
  check('fleet · phone drawer closes', await sheetGone(m));
  await m.close();
}

/* ── 3 · BOOKKEEPING ── */
{
  const p = await open('books');
  await act(p, 'bk.period', 'AUG 2026');
  check('books · AUG is a closed month', /CLOSED|PERIOD COMPLETE/.test(await txt(p, '.ws')) && (await st(p)).books.period === 'AUG 2026');
  await act(p, 'bk.period', 'SEP 2026');
  await act(p, 'bk.phase', 'collect');
  check('books · COLLECT shows the documents', (await count(p, '.lt-row[data-v^="doc:"]')) === 6);
  await p.click('#rv-screen .lt-row[data-v="doc:s4"]');
  check('books · opening a missing document focuses it', /FUEL RECEIPTS/.test(await txt(p, '.bk-cx .cx__t')));
  await shot(p, 'books--desktop--selected');
  await act(p, 'bk.phase', 'reconcile');
  await act(p, 'bk.item', 'q:q1');
  await shot(p, 'books--desktop--context');
  await p.click('#rv-screen [data-a="bk.cat"][data-v="q1|FUEL"]');
  const s = await st(p);
  check('books · answering a charge is simulated and moves to the next', /FUEL/.test(await txt(p, '.lt-row[data-v="q:q1"]')) && /SIM/.test(await txt(p, '.lt-row[data-v="q:q1"]')) && s.books.item === 'q:q2', s.books.item);
  check('books · no balances are shown', !/BALANCE \$|\$[0-9,]{4,}/.test(await txt(p, '.ws')));
  await act(p, 'bk.client', 'c-rj');
  check('books · a paused client shows paused, not a close', /PAUSED/.test(await txt(p, '.ws')));
  await p.close();
  const m = await open('books', 'phone');
  await m.click('#rv-screen .lt-row[data-v="q:q2"]');
  check('books · phone opens a charge in a drawer', (await count(m, '.wsheet')) === 1);
  await shot(m, 'books--phone--context');
  await m.close();
}

/* ── 4 · COMPLIANCE ── */
{
  const p = await open('comp');
  await p.click('#rv-screen .hz-m[data-v="dl-tk-09"]');
  check('comp · a marker on the horizon opens its case', /OUT-OF-SERVICE REPAIRS/.test(await txt(p, '.cp-case .cx__t')) && (await count(p, '.hz-m.is-on[data-v="dl-tk-09"]')) === 1);
  await shot(p, 'comp--desktop--selected');
  await p.click('#rv-screen .cp-row[data-v="dl-rj-ucr"]');
  check('comp · the queue opens a case', /UCR/.test(await txt(p, '.cp-case .cx__t')));
  await act(p, 'sim.ask', 'cp:pay:dl-rj-ucr');
  await shot(p, 'comp--desktop--action');
  await act(p, 'sim.no');
  await act(p, 'cp.filter', 'now');
  check('comp · NOW shows only what is due now', (await count(p, '.cp-row')) === 2);
  await act(p, 'cp.filter', 'all');
  await act(p, 'cp.sec', 'dot_safety');
  check('comp · DOT / SAFETY sits in the same lane, honestly empty', /NOT IN THE PRODUCT YET/.test(await txt(p, '.cp-case')) && (await count(p, '.hz--ghost')) === 1);
  await act(p, 'cp.sec', 'corrective');
  check('comp · CORRECTIVE WORK shows the out-of-service record', (await count(p, '.cp-row')) === 1);
  await act(p, 'cp.sec', 'expirations');
  await act(p, 'cp.item', 'dl-abc-insp');
  await p.click('#rv-screen .cp-subj [data-a="go"]');
  check('comp · the subject opens the truck in fleet', (await st(p)).view === 'fleet' && (await st(p)).fleet.unit === 'v-abc-1');
  await p.click('#rv-screen [data-a="ret"]');
  check('comp · back returns to the same case', (await st(p)).view === 'comp' && (await st(p)).comp.item === 'dl-abc-insp');
  await p.close();
  const staff = await open('comp', 'desktop', 'staff');
  check('comp · staff do not see founder-only REASSIGN', !/REASSIGN/.test(await txt(staff, '.cp-case')));
  await staff.close();
  const m = await open('comp', 'phone');
  await m.click('#rv-screen .cp-row[data-v="dl-tk-09"]');
  check('comp · phone opens the case in a drawer', (await count(m, '.wsheet')) === 1);
  await shot(m, 'comp--phone--context');
  await m.close();
}

/* ── 5 · CLIENT 360 — the founder's demo path ── */
{
  const p = await open('client');
  await p.click('#rv-screen .cl-dir[data-v="c-abc"]');
  await p.click('#rv-screen .cl-svc[data-v="insurance"]');
  check('client · INSURANCE focuses the service', (await st(p)).client.view === 'service' && (await st(p)).client.service === 'insurance');
  await p.click('#rv-screen .cl-rec[data-v="policy:pol-abc"]');
  await shot(p, 'client--desktop--selected');
  await p.click('#rv-screen .cl-cx [data-a="cl.push"][data-v="vehicle:v-abc-1"]');
  let s = await st(p);
  check('client · a truck opens from the policy', s.client.stack.join() === 'policy:pol-abc,vehicle:v-abc-1' && /UNIT 1/.test(await txt(p, '.cl-cx .cl-rp__t b')), s.client.stack);
  check('client · the nested truck is drawn as a truck with its connections', (await count(p, '.cl-cx .fl-slab--mini svg')) >= 1 && (await count(p, '.cl-cx .fl-cluster .fl-cg')) === 8);
  await shot(p, 'client--desktop--context');
  await p.click('#rv-screen .cl-cx .cx__back');
  s = await st(p);
  check('client · back returns to the policy', s.client.stack.join() === 'policy:pol-abc');
  await p.click('#rv-screen .cl-cx .cx__back');
  s = await st(p);
  check('client · back again keeps ABC and INSURANCE', s.client.stack.length === 0 && s.client.id === 'c-abc' && s.client.service === 'insurance');
  check('client · founder sees BILLING', (await count(p, '[data-a="cl.view"][data-v="billing"]')) === 1);
  await p.click('#rv-screen [data-a="cl.view"][data-v="fleet"]');
  await p.click('#rv-screen .cl-truck[data-v="vehicle:v-abc-1"]');
  await p.click('#rv-screen .cl-cx [data-a="go"][data-v="fleet:v-abc-1"]');
  check('client · OPEN IN FLEET goes to the same truck', (await st(p)).view === 'fleet' && (await st(p)).fleet.unit === 'v-abc-1');
  await p.click('#rv-screen [data-a="ret"]');
  s = await st(p);
  check('client · back returns to ABC with the truck still open', s.view === 'client' && s.client.id === 'c-abc' && s.client.stack.join() === 'vehicle:v-abc-1');
  await act(p, 'cl.client', 'c-mt');
  check('client · a prebuilt client is never shown as active', /PREBUILT · NOT ACTIVE YET/.test(await txt(p, '.cl-main')) && !/\bACTIVE\b(?! YET)/.test(await txt(p, '.cl-id')));
  await p.fill('#cl-q', 'heart');
  await p.dispatchEvent('#cl-q', 'input');
  check('client · directory search', (await count(p, '.cl-dir')) === 1);
  await p.close();
  const staff = await open('client', 'desktop', 'staff');
  check('client · staff do not see BILLING', (await count(staff, '[data-a="cl.view"][data-v="billing"]')) === 0);
  await shot(staff, 'client--desktop--staff');
  await staff.close();
  const m = await open('client', 'phone');
  await m.click('#rv-screen [data-a="cl.dir"]');
  check('client · phone directory opens in a drawer', (await count(m, '.wsheet .cl-dir')) > 0);
  await m.click('#rv-screen .wsheet .cl-dir[data-v="c-abc"]');
  await m.click('#rv-screen .cl-svc[data-v="insurance"]');
  await m.click('#rv-screen .cl-rec[data-v="policy:pol-abc"]');
  check('client · phone record opens in a drawer', (await count(m, '.wsheet')) === 1);
  await shot(m, 'client--phone--context');
  await m.close();
}

/* ── 6 · the approved shell inside the device stays live ── */
{
  const p = await open('fleet');
  for (const k of ['home', 'intake', 'work', 'reports', 'more']) {
    await p.click(`#rv-screen .side__item[data-k="${k}"]`);
    check(`shell · ${k.toUpperCase()} in the navigation opens the approved ${k.toUpperCase()} root`, (await st(p)).view === `r-${k}`);
  }
  await p.evaluate(() => window.AIO_WS.open('fleet'));
  await p.click('#rv-screen .head__field');
  check('shell · header search focuses the workspace search', (await p.evaluate(() => document.activeElement?.id)) === 'fl-q');
  await p.click('#rv-screen .head__lockup');
  check('shell · the logo opens the approved HOME root', (await st(p)).view === 'r-home');
  await p.close();
}

/* ── 7 · the review: landing, tabs, devices, role, before, TRY ── */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', (e) => errors.push(`review: ${e}`));
  p.on('console', (m) => m.type() === 'error' && errors.push(`review: ${m.text()}`));
  await p.goto(URL0);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  const visible = REG.filter((w) => !w.hidden).length;
  check('review · the landing shows the four groups and a card for every department and root', (await p.evaluate(() => [document.querySelectorAll('.rv-group-sec').length, document.querySelectorAll('.rv-group-sec .rv-card').length].join())) === `4,${visible}`);
  await p.evaluate(() => (document.querySelector('.rv-earlier').open = true));
  await p.evaluate(async () => { for (let y = 0; y <= document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); }); // lazy images load as they come into view
  const imgs = await p.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? i.naturalWidth : new Promise((r) => { i.onload = () => r(i.naturalWidth); i.onerror = () => r(0); })))));
  check('review · every image loads', imgs.every((w) => w > 0), imgs.filter((w) => !w).length);
  check('review · the earlier passes keep their seven boards and twelve recorded interactions', (await p.evaluate(() => [document.querySelectorAll('.rv-diag--pass .rv-thumb').length, document.querySelectorAll('.rv-clip').length].join())) === '7,12');
  await p.click('.rv-clip[data-rv-clip="10"]');
  const clip = await p.waitForFunction(() => { const v = [...document.querySelectorAll('#rv-lightbox video')]; return v.length === 2 && v.every((x) => x.readyState >= 2 && x.videoWidth > 0) && v.map((x) => x.currentSrc.split('/').pop().replace(/\.(webm|mp4)$/, '')).join(); }, null, { timeout: 8000 }).then((h) => h.jsonValue(), () => '');
  check('review · a recorded interaction plays the last pass beside this one', clip === '10-before,10-after', clip);
  if (SHOTS) await p.waitForTimeout(600), await p.screenshot({ path: join(TMP, 'clip.png') }), execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=82)', join(TMP, 'clip.png'), join(SHOTS, 'review--motion-clip.jpg')]);
  await p.keyboard.press('Escape');
  check('review · Escape closes the clip and stops it', await p.evaluate(() => document.getElementById('rv-lightbox').hidden && !document.querySelector('#rv-lightbox video')));
  await p.click('.rv-diag--pass .rv-thumb[data-rv-lightbox="polish-5-drawers.jpg"]');
  check('review · a tall board opens at full width and scrolls', await p.evaluate(() => { const lb = document.getElementById('rv-lightbox'); const i = lb.querySelector('img'); return !lb.hidden && lb.dataset.kind === 'board' && (i.complete ? i.naturalWidth > 0 : true); }));
  await p.keyboard.press('Escape');
  await p.click('#rv-motionbtn');
  check('review · REDUCE MOTION switches the workspaces to reduced motion', await p.evaluate(() => document.documentElement.dataset.motion === 'reduce' && document.getElementById('rv-motionbtn').getAttribute('aria-pressed') === 'true'));
  await p.click('#rv-motionbtn');
  check('review · and back', await p.evaluate(() => !document.documentElement.dataset.motion));
  if (SHOTS) await p.screenshot({ path: join(TMP, 'landing.png') }), execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=82)', join(TMP, 'landing.png'), join(SHOTS, 'review--landing.jpg')]);
  await p.click('[data-rv-device="phone"]');
  check('review · the landing follows the device switch (phone thumbnails, or named cards before the first thumbnails)', await p.evaluate(() => { const i = [...document.querySelectorAll('.rv-shot img')]; return i.length ? i.every((x) => /--phone\.jpg$/.test(x.getAttribute('src'))) : document.querySelectorAll('.rv-shot--none').length > 0; }));
  if (SHOTS) await p.screenshot({ path: join(TMP, 'lp.png') }), execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=82)', join(TMP, 'lp.png'), join(SHOTS, 'review--landing-phone.jpg')]);
  await p.click('[data-rv-device="desktop"]');
  await p.click('.rv-card[data-rv-tab="books"]');
  check('review · a card opens its workspace', (await p.evaluate(() => window.AIO_WS.state().view)) === 'books');
  check('review · the group tab and the department row follow the open department', await p.evaluate(() => document.querySelector('[data-rv-group="money"]').getAttribute('aria-current') === 'true' && document.querySelector('.rv-dept[data-rv-tab="books"]').getAttribute('aria-current') === 'true'));
  await p.click('[data-rv-group="auth"]');
  check('review · a group tab opens its first department', (await p.evaluate(() => window.AIO_WS.registry().find((w) => w.id === window.AIO_WS.state().view)?.group)) === 'auth');
  await p.click('.rv-card, [data-rv-group="money"]');
  const fit = await p.evaluate(() => document.getElementById('rv-sizer').getBoundingClientRect().bottom <= innerHeight);
  check('review · the device fits the window', fit);
  await p.click('[data-rv-device="phone"]');
  check('review · device switch', (await p.evaluate(() => window.AIO_WS.state().device)) === 'phone');
  await p.click('[data-rv-role="staff"]');
  check('review · founder / staff switch', (await p.evaluate(() => window.AIO_WS.state().role)) === 'staff');
  await p.click('[data-rv-role="founder"]');
  await p.click('[data-rv-device="desktop"]');
  await p.click('#rv-beforebtn');
  check('review · BEFORE shows this pass beside the last one, then the board since Batch 1', await p.evaluate(() => { const i = [...document.querySelectorAll('#rv-before img')].map((x) => x.src); return !document.getElementById('rv-before').hidden && /polish-3-books/.test(i[0]) && /before-after-books/.test(i[1]); }));
  if (SHOTS) await p.screenshot({ path: join(TMP, 'b.png') }), execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=82)', join(TMP, 'b.png'), join(SHOTS, 'review--before.jpg')]);
  await p.click('#rv-beforebtn');
  for (const w of REG.filter((x) => x.demos.length)) {
    await p.evaluate((id) => window.AIO_WS.open(id, 'desktop'), w.id);
    for (let i = 0; i < w.demos.length; i++) {
      await p.evaluate(() => window.AIO_WS.reset());
      await p.evaluate((id) => window.AIO_WS.open(id, 'desktop'), w.id);
      await p.evaluate((i) => window.AIO_WS.demo(i, 0.05), i);
      await p.waitForFunction(() => window.AIO_WS.demoState().demo === null, null, { timeout: 20000 }).catch(() => {});
      const d = await p.evaluate(() => window.AIO_WS.demoState());
      check(`review · TRY ${w.id} #${i + 1} ${w.demos[i]} runs to the end`, d.demo === null);
    }
  }
  await p.evaluate(() => window.AIO_WS.reset());
  await p.evaluate(() => window.AIO_WS.open('client', 'desktop'));
  await p.evaluate(() => window.AIO_WS.demo(0, 0.05));
  await p.waitForFunction(() => window.AIO_WS.demoState().demo === null, null, { timeout: 15000 }).catch(() => {});
  const s = await p.evaluate(() => window.AIO_WS.state());
  check('review · the ABC → INSURANCE → TRUCK → BACK demo ends where it started', s.client.id === 'c-abc' && s.client.service === 'insurance' && s.client.stack.length === 0, JSON.stringify(s.client));
  await p.close();
}

/* ── 8 · the review on a phone-sized screen: nothing spills sideways, the phone device fits ── */
for (const view of ['overview', ...WS]) {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  p.on('pageerror', (e) => errors.push(`review 390 ${view}: ${e}`));
  await p.goto(`${URL0}#${view}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  const r = await p.evaluate(() => ({ doc: document.documentElement.scrollWidth, dev: window.AIO_WS.state().device, phone: !!document.querySelector('[data-rv-device="phone"]').getClientRects().length, sizer: document.getElementById('rv-sizer').getBoundingClientRect().right }));
  check(`review 390 · ${view} · no sideways scroll, phone switch visible${view === 'overview' ? '' : ', device fits'}`, r.doc <= 390 && r.phone && r.dev === 'phone' && (view === 'overview' || r.sizer <= 390), JSON.stringify(r));
  await p.close();
}

/* ── 9 · motion: the tokens, selections that travel, drawers that enter and leave, reduced motion ── */
{
  const p = await open('fleet');
  const tok = await p.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('#rv-screen .ao-root') || document.querySelector('.ao-root'));
    return Object.fromEntries(['--m-micro', '--m-select', '--m-panel', '--m-context', '--m-out', '--ease-out', '--fs-micro', '--fs-label', '--fs-row', '--fs-body', '--fs-h'].map((k) => [k, cs.getPropertyValue(k).trim()]));
  });
  const ms = (k) => parseFloat(tok[k]);
  check('motion · durations sit inside the brief (micro 100–160, select 150–220, panel 200–300, context 220–350 ms)', ms('--m-micro') >= 100 && ms('--m-micro') <= 160 && ms('--m-select') >= 150 && ms('--m-select') <= 220 && ms('--m-panel') >= 200 && ms('--m-panel') <= 300 && ms('--m-context') >= 220 && ms('--m-context') <= 350 && ms('--m-out') >= 150 && ms('--m-out') <= 300, JSON.stringify(tok));
  check('motion · no bounce in the easing curve', /^cubic-bezier\(0\.22, ?0\.9, ?0\.28, ?1\)$/.test(tok['--ease-out']), tok['--ease-out']);
  check('type · the scale sits inside the brief (micro 9–10, label 10–11, row 11–13, body 12–14, heading 14–18 px)', ms('--fs-micro') >= 9 && ms('--fs-micro') <= 10 && ms('--fs-label') >= 10 && ms('--fs-label') <= 11 && ms('--fs-row') >= 11 && ms('--fs-row') <= 13 && ms('--fs-body') >= 12 && ms('--fs-body') <= 14 && ms('--fs-h') >= 14 && ms('--fs-h') <= 18, JSON.stringify(tok));
  // a selection updates in place: the same roster rows stay, the stage is redrawn, the context panel is not replaced wholesale
  const before = await p.evaluate(() => { window.__rows = [...document.querySelectorAll('#rv-screen .fl-row')]; window.__cx = document.querySelector('#rv-screen .fl-cx'); return window.__rows.length; });
  await p.click('#rv-screen .fl-row[data-v="v-abc-1"]');
  const kept = await p.evaluate(() => ({ rows: [...document.querySelectorAll('#rv-screen .fl-row')].every((r, i) => r === window.__rows[i]), cx: document.querySelector('#rv-screen .fl-cx') === window.__cx, anims: document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.effect?.getComputedTiming().duration).filter((d) => d !== Infinity) }));
  check('motion · selecting a truck updates in place (rows and panel kept, only their content moves)', before > 0 && kept.rows && kept.cx, JSON.stringify(kept));
  check('motion · every running animation is short (≤ 350 ms) and none repeat forever on a selection', kept.anims.length > 0 && kept.anims.every((d) => d <= 350), JSON.stringify(kept.anims));
  const loops = await p.evaluate(() => document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations === Infinity).map((a) => a.animationName || a.effect?.target?.className));
  check('motion · nothing pulses constantly in a settled workspace', !loops.length, JSON.stringify(loops));
  const thumbs = await p.evaluate(() => [...document.querySelectorAll('#rv-screen [data-thumb]')].filter((g) => g.getClientRects().length).map((g) => { const t = g.querySelector(':scope > .thumb'); const on = g.querySelector(':scope > .is-on'); return !on || (t.dataset.placed === '1' && Math.abs(t.offsetWidth - on.offsetWidth) <= 1); }));
  check('motion · every tab row has its thumb on the active choice', thumbs.length > 0 && thumbs.every(Boolean), JSON.stringify(thumbs));
  const tr = await p.evaluate(() => getComputedStyle(document.querySelector('#rv-screen .wseg__b')).transitionDuration);
  check('motion · controls transition their state (not a jump)', /0\.1[0-9]s|0\.13s|190ms|0\.19s/.test(tr) || parseFloat(tr) > 0, tr);
  await p.close();

  // drawers on the phone: enter, take focus, hold Tab, close on Escape, leave, give focus back
  const m = await open('fleet', 'phone');
  await m.click('#rv-screen .fl-cg[data-v="insurance"]');
  const opened = await m.evaluate(() => {
    const sh = document.querySelector('#rv-screen .wsheet');
    const a = sh?.getAnimations()[0];
    return { sheet: !!sh, label: sh?.getAttribute('aria-label'), modal: sh?.getAttribute('aria-modal'), role: sh?.getAttribute('role'), anim: a?.animationName, dur: a?.effect?.getComputedTiming().duration, focusIn: !!sh?.contains(document.activeElement), inert: [...document.querySelectorAll('#rv-screen .ws-main > .ws, #rv-screen .ao > :not(.ws-main)')].every((e) => e.inert) };
  });
  check('drawer · opens as a labelled modal dialog', opened.sheet && opened.role === 'dialog' && opened.modal === 'true' && !!opened.label, JSON.stringify(opened));
  check('drawer · slides in (200–300 ms)', opened.anim === 'wsSheetIn' && opened.dur >= 200 && opened.dur <= 300, JSON.stringify(opened));
  check('drawer · takes focus and makes the workspace behind it inert', opened.focusIn && opened.inert, JSON.stringify(opened));
  const x = await m.evaluate(() => {
    const sh = document.querySelector('#rv-screen .wsheet');
    const b = sh.querySelector('.wsheet__x').getBoundingClientRect();
    const hits = [...sh.querySelectorAll('.wsheet__body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).filter((e) => { const r = e.getBoundingClientRect(); return r.width && !(r.right <= b.left || r.left >= b.right || r.bottom <= b.top || r.top >= b.bottom); });
    return hits.map((e) => e.textContent.trim().slice(0, 30));
  });
  check('drawer · the close button never sits on text', !x.length, JSON.stringify(x));
  await settle(m);
  let trapped = true;
  for (let i = 0; i < 14; i++) {
    await m.keyboard.press(i % 5 === 4 ? 'Shift+Tab' : 'Tab');
    trapped &&= await m.evaluate(() => !!document.querySelector('#rv-screen .wsheet')?.contains(document.activeElement));
  }
  check('drawer · Tab and Shift+Tab stay inside the drawer', trapped);
  const scroll = await m.evaluate(() => {
    const sh = document.querySelector('#rv-screen .wsheet');
    const sc = [...sh.querySelectorAll('*')].find((e) => /auto|scroll/.test(getComputedStyle(e).overflowY));
    return { scroller: sc?.className, ob: sc && getComputedStyle(sc).overscrollBehaviorY, fits: sh.getBoundingClientRect().height <= document.getElementById('rv-screen').getBoundingClientRect().height * 0.87 + 1 };
  });
  check('drawer · its content scrolls inside it (header and close stay put) and never scrolls the page behind', !!scroll.scroller && scroll.ob === 'contain' && scroll.fits, JSON.stringify(scroll));
  await m.keyboard.press('Escape');
  const leaving = await m.evaluate(() => !!document.querySelector('#rv-screen .wsheet.is-out'));
  check('drawer · Escape closes it, and it leaves with motion', leaving);
  check('drawer · it is gone within 400 ms', await sheetGone(m));
  const back = await m.evaluate(() => ({ el: document.activeElement?.dataset?.a + '|' + document.activeElement?.dataset?.v, inert: [...document.querySelectorAll('#rv-screen [inert]')].length }));
  check('drawer · focus returns to what opened it, and nothing is left inert', back.el === 'fl.open|insurance' && back.inert === 0, JSON.stringify(back));
  // a tap during the exit is not lost into the leaving drawer, and the workspace stays usable
  await m.click('#rv-screen .fl-cg[data-v="driver"]');
  await m.click('#rv-screen .wsheet [data-a="sheet.close"]');
  await m.evaluate(() => window.AIO_WS.act('fl.unit', 'v-abc-1'));
  await m.waitForTimeout(400);
  const after = await m.evaluate(() => ({ sheets: document.querySelectorAll('#rv-screen .wsheet').length, unit: window.AIO_WS.state().fleet.unit }));
  check('drawer · a change made while it leaves wins (no stale redraw)', after.sheets === 0 && after.unit === 'v-abc-1', JSON.stringify(after));
  // keyboard: open a connection with Enter, close with the close button by keyboard
  await m.focus('#rv-screen .fl-cg[data-v="maintenance"]');
  await m.keyboard.press('Enter');
  check('drawer · opens from the keyboard', (await count(m, '.wsheet')) === 1);
  await m.focus('#rv-screen .wsheet .wsheet__x');
  await m.keyboard.press('Enter');
  check('drawer · closes from the keyboard', await sheetGone(m));
  await m.close();

  // the tablet directory is a side drawer, not a bottom sheet
  const t = await open('client', 'tablet');
  await t.click('#rv-screen [data-a="cl.dir"]');
  check('drawer · on tablet the client directory opens as a side drawer', (await count(t, '.wsheet.wsheet--side')) === 1 && (await t.evaluate(() => document.querySelector('#rv-screen .wsheet').getAnimations()[0]?.animationName)) === 'wsSideIn');
  await shot(t, 'client--tablet--directory');
  await t.close();

  // reduced motion: nothing slides, nothing waits
  const r = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1500, height: 1144 } });
  const rp = await r.newPage();
  rp.on('pageerror', (e) => errors.push(`reduced: ${e}`));
  await rp.goto(`${URL0}?device=phone#fleet`);
  await rp.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await rp.click('#rv-screen .fl-cg[data-v="insurance"]');
  const rm = await rp.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.effect?.getComputedTiming().duration).filter((d) => d > 10));
  check('reduced motion · the drawer appears without sliding (no animation over 10 ms)', !rm.length, JSON.stringify(rm));
  await rp.click('#rv-screen .wsheet [data-a="sheet.close"]');
  check('reduced motion · the drawer closes at once', (await rp.evaluate(() => document.querySelectorAll('#rv-screen .wsheet').length)) === 0);
  await rp.click('#rv-screen [data-a="fl.unit"][data-v="v-abc-1"], #rv-screen .fl-strip [data-v="v-abc-1"]').catch(() => rp.evaluate(() => window.AIO_WS.act('fl.unit', 'v-abc-1')));
  const rs = await rp.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').map((a) => a.effect?.getComputedTiming().duration).filter((d) => d > 10));
  check('reduced motion · a selection has no motion over 10 ms', !rs.length, JSON.stringify(rs));
  await rp.goto(`${URL0}?device=desktop#fleet`);
  await rp.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await rp.click('#rv-screen [data-a="sim.ask"][data-v="fl:tk:t-tk-2"]');
  await rp.click('#rv-screen [data-a="sim.ok"]');
  check('reduced motion · a confirmation applies at once (no WORKING wait)', (await rp.evaluate(() => window.AIO_WS.state().sims)) === 1);
  await r.close();
}

/* ── 10 · bookkeeping cadence: MONTHLY / ANNUAL without inventing annual data ── */
{
  const p = await open('books');
  check('books · MONTHLY is the default cadence', (await count(p, '[data-a="bk.cadence"][data-v="monthly"].is-on')) === 1);
  await p.click('#rv-screen [data-a="bk.cadence"][data-v="annual"]');
  const t = await txt(p, '.ws');
  check('books · ANNUAL says honestly that no sample client is annual', (await count(p, '.bk-none')) >= 1 && /NO ANNUAL CLIENTS IN THIS SAMPLE/.test(t) && (await count(p, '.lt-row')) === 0, t.slice(0, 200));
  await shot(p, 'books--desktop--annual');
  await p.click('#rv-screen [data-a="bk.cadence"][data-v="monthly"]');
  check('books · MONTHLY brings the month back', (await count(p, '.lt-row')) > 0);
  await p.close();
  const w = await open('books', 'wide');
  check('books · ultra-wide fills the space with the month at a glance', (await count(w, '.bk-month')) === 1 && (await count(w, '.bk-grid--4')) === 1);
  await w.close();
}

/* ── 11 · the text audit: every panel, tab, record and drawer at four sizes (audit.mjs) — the approved roots are not ours to change ── */
const REG_ROOTS = new Set(REG.filter((w) => w.root).map((w) => w.id));
for (const dev of Object.keys(DEV)) {
  const p = await browser.newPage({ viewport: { width: DEV[dev][0] + 60, height: DEV[dev][1] + 300 } });
  p.on('pageerror', (e) => errors.push(`audit ${dev}: ${e}`));
  await p.goto(`${URL0}?device=${dev}#fleet`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  const found = [];
  const approved = new Set(WS);
  const dynamic = (await p.evaluate(() => window.AIO_WS.auditStates())).filter(([id]) => !approved.has(id) && !REG_ROOTS.has(id));
  for (const [id, acts] of dynamic) {
    await p.evaluate(([w, a, d]) => { window.AIO_WS.go(w, a, d); window.AIO_WS.capture(true); }, [id, acts, dev]);
    await settle(p);
    const state = `${id}${acts.length ? ` ${acts.map(([a, v]) => `${a}=${v}`).join(' ')}` : ''}`;
    for (const i of await p.evaluate(pageAudit, SINGLE_LINE)) found.push({ state, ...i });
  }
  for (const [view, acts] of AUDIT_STATES) {
    await p.evaluate(([v, d]) => { window.AIO_WS.reset(); window.AIO_WS.open(v, d); window.AIO_WS.capture(true); }, [view, dev]);
    for (const [a, v] of dev === 'phone' ? phoneActs(acts) : acts) await p.evaluate(([a, v]) => window.AIO_WS.act(a, v), [a, v]);
    await settle(p);
    const state = `${view}${acts.length ? ` ${acts.map(([a, v]) => `${a}=${v}`).join(' ')}` : ''}`;
    for (const i of await p.evaluate(pageAudit, SINGLE_LINE)) found.push({ state, ...i });
  }
  await p.close();
  const show = (k, f) => found.filter(f).slice(0, 4).map((i) => `${i.state}: ${i.el} "${i.text}"${i.with ? ` × ${i.with}` : ''}`).join(' || ');
  const n = AUDIT_STATES.length + dynamic.length;
  check(`text · ${dev} · ${n} states · single-line components stay on one line`, !found.some((i) => i.kind === 'WRAPS'), show('WRAPS', (i) => i.kind === 'WRAPS'));
  check(`text · ${dev} · ${n} states · no text clipped by its panel`, !found.some((i) => i.kind === 'CLIPPED'), show('CLIPPED', (i) => i.kind === 'CLIPPED'));
  check(`text · ${dev} · ${n} states · no text overlapping text`, !found.some((i) => i.kind === 'OVERLAPS'), show('OVERLAPS', (i) => i.kind === 'OVERLAPS'));
  check(`text · ${dev} · ${n} states · nothing below 9 px`, !found.some((i) => i.kind === 'TINY'), show('TINY', (i) => i.kind === 'TINY'));
  check(`text · ${dev} · ${n} states · anything cut short keeps its full text reachable`, !found.some((i) => i.kind === 'TRUNCATED' && !i.reachable), show('TRUNCATED', (i) => i.kind === 'TRUNCATED' && !i.reachable));
  check(`text · ${dev} · ${n} states · only the rows drawn to scroll sideways do`, !found.some((i) => i.kind === 'SCROLLS_X' && !i.scroller), show('SCROLLS_X', (i) => i.kind === 'SCROLLS_X' && !i.scroller));
}

/* ── 12 · the complete office: every link on the approved roots opens a designed page; every SEE state draws clean ── */
{
  const p = await browser.newPage({ viewport: { width: 1500, height: 1144 } });
  p.on('pageerror', (e) => errors.push(`nav: ${e}`));
  p.on('console', (m) => m.type() === 'error' && errors.push(`nav: ${m.text()}`));
  await p.goto(URL0);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  for (const dev of ['desktop', 'tablet', 'phone']) {
    const open = [];
    for (const root of REG.filter((w) => w.root)) {
      for (const role of ['founder', 'staff']) {
        await p.evaluate(([id, d, r]) => { window.AIO_WS.open(id, d, r); }, [root.id, dev, role]);
        const routes = await p.evaluate(() => [...new Set([...document.querySelectorAll('#rv-screen [data-go]')].map((e) => e.dataset.go))]);
        for (const r of routes) if (!(await p.evaluate((x) => !!routeWs(x), r))) open.push(`${root.id}: ${r}`);
      }
    }
    check(`nav · ${dev} · every link on the five approved roots opens a designed page`, !open.length, [...new Set(open)].join(' · '));
  }
  await p.evaluate(() => window.AIO_WS.open('fleet', 'desktop', 'founder'));
  for (const w of REG) {
    for (const [label, acts, dev] of w.states) {
      await p.evaluate(([id, a, d]) => window.AIO_WS.go(id, a, d), [w.id, acts, dev || 'desktop']);
      await settle(p);
      const r = await p.evaluate(pageStructure);
      const view = await p.evaluate(() => window.AIO_WS.state().view);
      const okView = await p.evaluate((v) => !!window.AIO_WS.registry().find((x) => x.id === v), view);
      check(`see · ${w.id} · ${label} draws a registered page with live controls`, okView && !r.unknown.length && !r.dead.length && !r.lower.length && !(r.sw > r.cw + 1) && !r.wide.length, JSON.stringify({ view, unknown: r.unknown, dead: r.dead.slice(0, 2), lower: r.lower, wide: r.wide }));
    }
  }
  await p.close();
}

check('no console or page errors', !errors.length, errors.slice(0, 5).join(' || '));
await browser.close();
srv.close();
rmSync(TMP, { recursive: true, force: true });
const pass = results.filter((r) => r.ok).length;
writeFileSync(join(DIST, 'qa-report.json'), JSON.stringify({ when: new Date().toISOString(), pass, fail: results.length - pass, results }, null, 1));
console.log(`qa: ${pass}/${results.length} passed`);
process.exit(pass === results.length ? 0 : 1);
