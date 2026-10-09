/**
 * QA for the four workspace proofs: interaction journeys, dead controls, handlers, fit, overflow, the uppercase law,
 * console errors, founder / staff visibility, the TRY demonstrations, and screenshots at four sizes.
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
    const dead = [...scr.querySelectorAll('button, [role=button], a')].filter((b) => !b.disabled && !b.closest('[inert]') && !(b.dataset.a || b.dataset.act || b.dataset.k || b.dataset.go || b.dataset.input)).map((b) => b.outerHTML.slice(0, 90));
    const inputs = [...scr.querySelectorAll('input')].filter((i) => !i.dataset.input).length;
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
    return { unknown, dead, inputs, lower: lower.slice(0, 6), wide, sh: scr.scrollHeight, ch: scr.clientHeight, sw: scr.scrollWidth, cw: scr.clientWidth };
  });
  check(`${label} · every control has a handler`, !r.unknown.length, r.unknown);
  check(`${label} · no dead controls`, !r.dead.length, r.dead);
  check(`${label} · inputs are wired`, r.inputs === 0, r.inputs);
  check(`${label} · uppercase law`, !r.lower.length, r.lower);
  check(`${label} · no horizontal overflow`, r.sw <= r.cw + 1 && !r.wide.length, `${r.sw}/${r.cw} ${r.wide}`);
  if (fits) check(`${label} · fits one screen (only lists scroll)`, r.sh <= r.ch + 1, `${r.sh} > ${r.ch}`);
}

/* ── 1 · every workspace on every device: draws, fits, no dead controls; screenshots ── */
for (const ws of WS) {
  for (const dev of Object.keys(DEV)) {
    const p = await open(ws, dev);
    const label = `${ws} · ${dev}`;
    check(`${label} · draws`, (await count(p, '.ws')) === 1);
    await structure(p, label, { fits: dev === 'desktop' || dev === 'wide' || dev === 'tablet' });
    await shot(p, `${ws}--${dev}`);
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
  check('fleet · a simulated action confirms inline and says so', /SIMULATED IN THIS REVIEW/.test(await txt(p, '.simc')));
  await shot(p, 'fleet--desktop--action');
  await p.click('#rv-screen [data-a="sim.ok"]');
  check('fleet · confirming changes the sample state and the history', /AUTHORIZATION REQUESTED/.test(await txt(p, '.fl-cx')) && /JUST NOW/.test(await txt(p, '.fl-cx .mh')) && (await st(p)).sims === 1);
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
  check('fleet · phone drawer closes', (await count(m, '.wsheet')) === 0);
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
  check('client · a truck opens from the policy', s.client.stack.join() === 'policy:pol-abc,vehicle:v-abc-1' && /UNIT 1/.test(await txt(p, '.cl-cx .cx__t')), s.client.stack);
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
  await p.click('#rv-screen .side__item[data-k="more"]');
  check('shell · MORE opens Client 360', (await st(p)).view === 'client');
  await p.click('#rv-screen .side__item[data-k="work"]');
  check('shell · WORK opens a WORK lane', (await st(p)).view === 'fleet');
  await p.click('#rv-screen .side__item[data-k="reports"]');
  check('shell · other roots answer (toast)', await p.evaluate(() => !document.getElementById('rv-toast').hidden));
  await p.click('#rv-screen .head__field');
  check('shell · header search focuses the yard search', (await p.evaluate(() => document.activeElement?.id)) === 'fl-q');
  await p.close();
}

/* ── 7 · the review: landing, tabs, devices, role, before, TRY ── */
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  p.on('pageerror', (e) => errors.push(`review: ${e}`));
  p.on('console', (m) => m.type() === 'error' && errors.push(`review: ${m.text()}`));
  await p.goto(URL0);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  check('review · landing shows four live workspaces', (await p.evaluate(() => document.querySelectorAll('.rv-card .rv-mini .ws').length)) === 4);
  const imgs = await p.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? i.naturalWidth : new Promise((r) => { i.onload = () => r(i.naturalWidth); i.onerror = () => r(0); })))));
  check('review · every image loads', imgs.every((w) => w > 0), imgs.filter((w) => !w).length);
  if (SHOTS) await p.screenshot({ path: join(TMP, 'landing.png') }), execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=82)', join(TMP, 'landing.png'), join(SHOTS, 'review--landing.jpg')]);
  await p.click('[data-rv-device="phone"]');
  check('review · the landing previews follow the device switch (phone)', (await p.evaluate(() => [...document.querySelectorAll('.rv-mini__dev')].map((m) => m.dataset.vp).join())) === 'mobile,mobile,mobile,mobile');
  if (SHOTS) await p.screenshot({ path: join(TMP, 'lp.png') }), execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=82)', join(TMP, 'lp.png'), join(SHOTS, 'review--landing-phone.jpg')]);
  await p.click('[data-rv-device="tablet"]');
  check('review · the landing previews follow the device switch (tablet)', (await p.evaluate(() => [...document.querySelectorAll('.rv-mini__dev')].map((m) => m.dataset.vp).join())) === 'tablet,tablet,tablet,tablet');
  await p.click('[data-rv-device="desktop"]');
  await p.click('.rv-card[data-rv-tab="books"]');
  check('review · a card opens its workspace', (await p.evaluate(() => window.AIO_WS.state().view)) === 'books');
  const fit = await p.evaluate(() => document.getElementById('rv-sizer').getBoundingClientRect().bottom <= innerHeight);
  check('review · the device fits the window', fit);
  await p.click('[data-rv-device="phone"]');
  check('review · device switch', (await p.evaluate(() => window.AIO_WS.state().device)) === 'phone');
  await p.click('[data-rv-role="staff"]');
  check('review · founder / staff switch', (await p.evaluate(() => window.AIO_WS.state().role)) === 'staff');
  await p.click('[data-rv-role="founder"]');
  await p.click('[data-rv-device="desktop"]');
  await p.click('#rv-beforebtn');
  check('review · BEFORE shows the before → after board', await p.evaluate(() => !document.getElementById('rv-before').hidden && /before-after-books/.test(document.querySelector('#rv-before img').src)));
  if (SHOTS) await p.screenshot({ path: join(TMP, 'b.png') }), execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=82)', join(TMP, 'b.png'), join(SHOTS, 'review--before.jpg')]);
  await p.click('#rv-beforebtn');
  for (const ws of WS) {
    await p.click(`.rv-tab[data-rv-tab="${ws}"]`);
    const n = await p.evaluate(() => document.querySelectorAll('[data-rv-demo]').length);
    for (let i = 0; i < n; i++) {
      await p.evaluate(() => window.AIO_WS.reset());
      await p.evaluate((i) => window.AIO_WS.demo(i, 0.05), i);
      await p.waitForFunction(() => window.AIO_WS.demoState().demo === null, null, { timeout: 15000 }).catch(() => {});
      const d = await p.evaluate(() => window.AIO_WS.demoState());
      check(`review · TRY ${ws} #${i + 1} runs to the end`, d.demo === null);
    }
  }
  await p.evaluate(() => window.AIO_WS.reset());
  await p.click('.rv-tab[data-rv-tab="client"]');
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

check('no console or page errors', !errors.length, errors.slice(0, 5).join(' || '));
await browser.close();
srv.close();
rmSync(TMP, { recursive: true, force: true });
const pass = results.filter((r) => r.ok).length;
writeFileSync(join(DIST, 'qa-report.json'), JSON.stringify({ when: new Date().toISOString(), pass, fail: results.length - pass, results }, null, 1));
console.log(`qa: ${pass}/${results.length} passed`);
process.exit(pass === results.length ? 0 : 1);
