/**
 * Founder-review boards for the material, motion and detail pass: the last pass (BEFORE) beside this one (AFTER) for
 * the seven areas the founder named — fleet lower tiles, Client 360 lower panels, bookkeeping detail states, the
 * compliance calendar and tabs, mobile drawers, text fit, and motion (frames from the recordings made by record.mjs).
 * The text board runs the same audit as qa.mjs (audit.mjs) on both builds and prints the counts.
 *
 *   node design-authority/aio-office/workspaces/polish-boards.mjs <beforeDist> <afterDist> <recDir> [outDir]
 *     beforeDist  workspaces/build.mjs output of the last pass (git 5d39f7bb)
 *     afterDist   workspaces/build.mjs output of this pass
 *     recDir      record.mjs output holding NN-before.mp4, NN-after.mp4 and recordings-*.json
 *     outDir      default: AIO_OFFICE_WORKSPACE_PROOFS/boards (repository root)
 *
 * Needs playwright, a Chromium, ffmpeg and python3 + Pillow. Writes polish-*.jpg and polish-audit.json.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { SINGLE_LINE, AUDIT_STATES, phoneActs, pageAudit } from './audit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const [BEFORE, AFTER, REC] = process.argv.slice(2, 5).map((p) => p && resolve(p));
const OUT = resolve(process.argv[5] || join(APP, '..', 'AIO_OFFICE_WORKSPACE_PROOFS/boards'));
if (!BEFORE || !AFTER || !REC || !existsSync(join(BEFORE, 'local.html')) || !existsSync(join(AFTER, 'local.html'))) throw new Error('usage: polish-boards.mjs <beforeDist> <afterDist> <recDir> [outDir]');
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));

const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png' };
const serve = (dir) =>
  new Promise((r) => {
    const s = createServer((q, res) => {
      if (q.url === '/favicon.ico') return res.writeHead(204).end();
      const p = join(dir, decodeURIComponent(new URL(q.url, 'http://x').pathname));
      if (!p.startsWith(dir) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
      res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
      createReadStream(p).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => r(s));
  });
const srv = { before: await serve(BEFORE), after: await serve(AFTER) };
const TMP = join(tmpdir(), `aio-polish-boards-${process.pid}`);
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const DEV = { phone: [390, 844], tablet: [834, 1194], desktop: [1440, 900], wide: [2560, 1440] };

/** One state of one build: the device, or a part of it (a selector inside the screen, or [x, y, w, h] in device px). */
async function shoot(build, dev, view, acts, crop, name) {
  const [w, h] = DEV[dev];
  const p = await browser.newPage({ viewport: { width: Math.max(1500, w + 80), height: h + 420 } });
  await p.goto(`http://127.0.0.1:${srv[build].address().port}/local.html?device=${dev}#${view}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => window.AIO_WS.capture(true));
  for (const [a, v] of dev === 'phone' ? phoneActs(acts) : acts) await p.evaluate(([a, v]) => window.AIO_WS.act(a, v), [a, v]);
  await p.waitForTimeout(450); // a closing drawer leaves, a confirmation applies
  await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
  const box = await p.locator('#rv-device').boundingBox();
  let clip = box;
  if (typeof crop === 'string') {
    const b = await p.locator(`#rv-screen ${crop}`).first().boundingBox().catch(() => null);
    if (b) clip = b;
  } else if (crop) clip = { x: box.x + crop[0], y: box.y + crop[1], width: crop[2], height: crop[3] };
  const file = join(TMP, `${name}-${build}.png`);
  await p.screenshot({ path: file, clip });
  await p.close();
  return file;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@600;700;800&family=Roboto:wght@400;500;600&display=swap');
body{margin:0;background:#121214}
.board{width:2400px;box-sizing:border-box;padding:52px 64px 60px;background:radial-gradient(1200px 600px at 80% -10%,#2a2620 0,#141416 60%);color:#efe6d2;font-family:Roboto,Arial,sans-serif;text-transform:uppercase}
header small{font:600 14px/1 Roboto;letter-spacing:.24em;color:#e7ab3c}
header h1{margin:12px 0 0;font:800 50px/1 'Roboto Condensed';letter-spacing:.01em}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:40px 44px;margin-top:34px;align-items:start}
.pair{display:grid;gap:12px}
.pair--full{grid-column:1/-1}
.pair h2{margin:0;font:800 22px/1 'Roboto Condensed';letter-spacing:.08em;color:#efe6d2}
.pair h2 span{color:#a9a091;font-weight:700;margin-left:10px}
.ba{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
.ba figure{margin:0;display:grid;gap:10px}
.ba img{display:block;width:100%;border-radius:10px;box-shadow:0 0 0 1px #3a3530,0 24px 48px rgba(0,0,0,.45)}
.ba figcaption{font:800 17px/1 'Roboto Condensed';letter-spacing:.12em;color:#a9a091}
.ba figure:last-child figcaption{color:#f1c158}
.notes{list-style:none;margin:34px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,1fr);gap:20px 40px}
.notes li{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:start}
.notes i{width:38px;height:38px;border-radius:50%;background:linear-gradient(180deg,#f7d27a,#e7ab3c);color:#141416;font:800 20px/38px 'Roboto Condensed';text-align:center;font-style:normal}
.notes span{font:700 23px/1.2 'Roboto Condensed';letter-spacing:.03em;padding-top:5px}
.stats{display:grid;grid-template-columns:repeat(6,1fr);gap:16px;margin-top:30px}
.stat{border-radius:12px;background:#1d1c1e;box-shadow:inset 0 0 0 1px #34302b;padding:18px 20px;display:grid;gap:8px}
.stat small{font:700 14px/1 Roboto;letter-spacing:.16em;color:#a9a091}
.stat b{font:800 44px/1 'Roboto Condensed';color:#efe6d2}
.stat b em{font-style:normal;color:#a9a091;font-size:26px;margin:0 8px}
.stat b span{color:#f1c158}
.stat p{margin:0;font:600 13px/1.3 Roboto;letter-spacing:.06em;color:#a9a091}
.mo{display:grid;gap:30px;margin-top:34px}
.mo__row{display:grid;gap:10px}
.mo__row h2{margin:0;font:800 22px/1 'Roboto Condensed';letter-spacing:.08em}
.mo__row h2 span{color:#a9a091;margin-left:10px}
.mo__ba{display:grid;gap:12px}
.mo__ba--phone{grid-template-columns:1fr 1fr;gap:30px}
.mo__strip{display:grid;gap:8px}
.mo__strip > small{font:800 15px/1 'Roboto Condensed';letter-spacing:.14em;color:#a9a091}
.mo__strip--after > small{color:#f1c158}
.mo__f{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.mo__f figure{margin:0;display:grid;gap:6px}
.mo__f img{display:block;width:100%;border-radius:6px;box-shadow:0 0 0 1px #3a3530}
.mo__f figcaption{font:700 13px/1 Roboto;letter-spacing:.12em;color:#a9a091}
`;
const pair = (title, sub, b, a, full = false) => `<div class="pair ${full ? 'pair--full' : ''}"><h2>${title}${sub ? `<span>${sub}</span>` : ''}</h2><div class="ba"><figure><img src="file://${b}"><figcaption>BEFORE · LAST PASS</figcaption></figure><figure><img src="file://${a}"><figcaption>AFTER · THIS PASS</figcaption></figure></div></div>`;
const notes = (list) => `<ol class="notes">${list.map((n, i) => `<li><i>${i + 1}</i><span>${n}</span></li>`).join('')}</ol>`;
const board = (eyebrow, title, body) => `<section class="board"><header><small>${eyebrow}</small><h1>${title}</h1></header>${body}</section>`;

/** [title, sub, dev, view, acts, crop, full] */
async function pairs(id, rows) {
  const out = [];
  for (const [i, [title, sub, dev, view, acts, crop, full]] of rows.entries()) {
    const b = await shoot('before', dev, view, acts, crop, `${id}-${i}`);
    const a = await shoot('after', dev, view, acts, crop, `${id}-${i}`);
    out.push(pair(title, sub, b, a, full));
  }
  return `<div class="grid">${out.join('')}</div>`;
}

const boards = {};
boards['polish-1-fleet'] = board('THIS PASS · VEHICLES & FLEET', 'THE LOWER TILES KEEP THE STAGE’S RICHNESS', (await pairs('fl', [
  ['DESKTOP · UNIT 09', 'YARD, STAGE AND CONNECTION PANEL', 'desktop', 'fleet', [], null, true],
  ['PHONE · THE TRUCK AND ITS CONNECTIONS', 'DEFECT G', 'phone', 'fleet', [], null],
  ['PHONE · A CONNECTION OPEN', 'DEFECT J', 'phone', 'fleet', [['fl.sec', 'ifta']], null],
])) + notes(['THE YARD SHOWS EVERY MODEL NAME IN FULL; THE STATUS WORD SITS UNDER THE FINGERPRINT.', 'TAGS ON THE TRUCK READ IN FULL: Q3 · AWAITING CLIENT.', 'ON THE PHONE THE CONNECTIONS ARE LIT TILES ON THE SAME DARK SLAB AS THE TRUCK.', 'SELECTING DRAWS ONE GOLD LEADER TO THE TAG AND RINGS THE POINT ONCE — NO PULSING.']));

boards['polish-2-client'] = board('THIS PASS · CLIENT 360', 'LOWER PANELS AND NESTED DETAIL MATCH THE PLATE', (await pairs('cl', [
  ['DESKTOP · ABC TRUCKING · OVERVIEW', 'DEFECT E', 'desktop', 'client', [], null, true],
  ['DESKTOP · POLICY → UNIT 1', 'NESTED RECORD · DEFECT H', 'desktop', 'client', [['cl.service', 'insurance'], ['cl.push', 'policy:pol-abc'], ['cl.push', 'vehicle:v-abc-1']], '.cl-cx'],
  ['DESKTOP · INSURANCE SERVICE', 'SERVICE STATE', 'desktop', 'client', [['cl.service', 'insurance']], '.cl-main'],
  ['TABLET · INSURANCE SERVICE', 'SERVICE STATE', 'tablet', 'client', [['cl.service', 'insurance']], null],
])) + notes(['THE OVERVIEW READS LIKE THE PLATE: OPEN WORK, TRUCKS, DRIVERS, DOCUMENTS, THEN WHAT NEEDS ATTENTION.', 'A NESTED RECORD OPENS WITH ITS OWN PLATE — TYPE, COMPANY, TITLE, STATUS — NOT A PLAIN LIST.', 'A TRUCK INSIDE CLIENT 360 IS DRAWN AS A TRUCK, WITH THE SAME EIGHT CONNECTIONS AS FLEET.', 'A SERVICE OPENS ON ITS OWN PLATE — RECORDS, OPEN, NEXT DATE, OWNER — THEN THE TRUCKS AND DOCUMENTS ITS RECORDS TOUCH.']));

boards['polish-3-books'] = board('THIS PASS · BOOKKEEPING', 'EVERY DETAIL STATE HAS ITS OWN OBJECT', (await pairs('bk', [
  ['A MISSING DOCUMENT', 'COLLECT · DEFECT I', 'desktop', 'books', [['bk.phase', 'collect'], ['bk.item', 'doc:s4']], '.bk-cx'],
  ['A CHARGE TO CATEGORISE', 'RECONCILE', 'desktop', 'books', [['bk.phase', 'reconcile'], ['bk.item', 'q:q1']], '.bk-cx'],
  ['A REVIEW CHECK', 'REVIEW', 'desktop', 'books', [['bk.phase', 'review'], ['bk.item', 'chk:0']], '.bk-cx'],
  ['A REPORT TO DELIVER', 'DELIVER', 'desktop', 'books', [['bk.phase', 'deliver'], ['bk.item', 'rep:pl']], '.bk-cx'],
  ['ULTRA-WIDE · SEPTEMBER CLOSE', 'DEFECT C', 'wide', 'books', [], null, true],
])) + notes(['A MISSING DOCUMENT IS A SHEET WITH ITS TRACK: ASKED, REMINDED, RECEIVED.', 'A CHARGE OFFERS ITS CATEGORIES AS TILES; ANSWERING IS SIMULATED.', 'A REVIEW CHECK SHOWS A METER; A REPORT SHOWS ITS COVER.', 'ULTRA-WIDE ADDS THE MONTH AT A GLANCE INSTEAD OF EMPTY SPACE. MONTHLY / ANNUAL IS HONEST: NO SAMPLE CLIENT IS ANNUAL.']));

boards['polish-4-comp'] = board('THIS PASS · COMPLIANCE', 'THE CALENDAR, THE CASE AND THE PHONE TABS', (await pairs('cp', [
  ['DESKTOP · IRP SELECTED', 'MARKER, READOUT AND CASE', 'desktop', 'comp', [['cp.item', 'dl-rl-irp']], null, true],
  ['ULTRA-WIDE · THE LOWER CASE PANEL', 'DEFECT D', 'wide', 'comp', [['cp.item', 'dl-abc-insp']], '.cp-case', true],
  ['PHONE · SECTION TABS', 'DEFECT F', 'phone', 'comp', [], [0, 0, 390, 520]],
  ['PHONE · DOT / SAFETY', 'HONESTLY EMPTY', 'phone', 'comp', [['cp.sec', 'dot_safety']], [0, 0, 390, 520]],
])) + notes(['THE SELECTED MARKER GROWS AND RINGS ONCE; WHEN ITS CALLOUT WOULD COLLIDE, A READOUT UNDER THE HORIZON NAMES IT.', 'ON WIDE SCREENS THE CASE USES THREE COLUMNS AND LISTS WHAT ELSE IS DUE FOR THE SAME CLIENT.', 'THE PHONE TABS FIT ONE ROW: EXPIRATIONS · DOT / SAFETY · AUDITS · CORRECTIVE.', 'SECTIONS NOT IN THE PRODUCT YET SAY SO ON A PLATE, IN THE SAME LANE; THE TODAY LINE RUNS BEHIND IT.']));

boards['polish-5-drawers'] = board('THIS PASS · MOBILE DRAWERS', 'A BAR FOR THE GRIP AND CLOSE — NOTHING SITS ON THE CONTENT', (await pairs('dr', [
  ['FLEET · INSURANCE', '', 'phone', 'fleet', [['fl.sec', 'insurance']], null],
  ['BOOKKEEPING · A CHARGE', '', 'phone', 'books', [['bk.phase', 'reconcile'], ['bk.item', 'q:q1']], null],
  ['COMPLIANCE · UNIT 09 REPAIRS', '', 'phone', 'comp', [['cp.item', 'dl-tk-09']], null],
  ['CLIENT 360 · POLICY', '', 'phone', 'client', [['cl.service', 'insurance'], ['cl.push', 'policy:pol-abc']], null],
])) + notes(['THE CLOSE BUTTON LIVES IN THE DRAWER’S OWN BAR, SO IT NEVER COVERS A TITLE.', 'THE HEADER STAYS; ONLY THE BODY SCROLLS, AND IT NEVER SCROLLS THE PAGE BEHIND.', 'IT SLIDES UP IN 260 MS, LEAVES IN 200 MS, TAKES FOCUS AND GIVES IT BACK; ESCAPE AND TAP-OUTSIDE CLOSE IT.', 'ON TABLET THE CLIENT DIRECTORY IS A SIDE DRAWER.']));

/* ── text: the same audit as qa.mjs, on both builds ── */
async function audit(build) {
  const found = [];
  for (const dev of Object.keys(DEV)) {
    const p = await browser.newPage({ viewport: { width: DEV[dev][0] + 60, height: DEV[dev][1] + 300 } });
    await p.goto(`http://127.0.0.1:${srv[build].address().port}/local.html?device=${dev}#fleet`);
    await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
    await p.evaluate(() => document.fonts.ready);
    for (const [view, acts] of AUDIT_STATES) {
      await p.evaluate(([v, d]) => { window.AIO_WS.reset(); window.AIO_WS.open(v, d); window.AIO_WS.capture(true); }, [view, dev]);
      for (const [a, v] of dev === 'phone' ? phoneActs(acts) : acts) await p.evaluate(([a, v]) => window.AIO_WS.act(a, v), [a, v]);
      await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
      for (const i of await p.evaluate(pageAudit, SINGLE_LINE)) found.push({ dev, ...i });
    }
    await p.close();
  }
  const uniq = [...new Map(found.map((i) => [`${i.kind}|${i.dev}|${i.el}|${i.text}`, i])).values()];
  const n = (f) => uniq.filter(f).length;
  return {
    WRAPS: n((i) => i.kind === 'WRAPS'),
    CLIPPED: n((i) => i.kind === 'CLIPPED'),
    OVERLAPS: n((i) => i.kind === 'OVERLAPS'),
    TRUNCATED: n((i) => i.kind === 'TRUNCATED' && !i.reachable),
    TINY: n((i) => i.kind === 'TINY'),
    SCROLLS_X: n((i) => i.kind === 'SCROLLS_X' && !i.scroller),
    intended_scroll: n((i) => i.kind === 'SCROLLS_X' && i.scroller),
    truncated_reachable: n((i) => i.kind === 'TRUNCATED' && i.reachable),
  };
}
const counts = { before: await audit('before'), after: await audit('after'), states: AUDIT_STATES.length, sizes: Object.keys(DEV) };
writeFileSync(join(OUT, 'polish-audit.json'), JSON.stringify(counts, null, 1));
const STAT = [['WRAPS', 'ONE-LINE PARTS THAT WRAPPED'], ['CLIPPED', 'TEXT CUT BY ITS PANEL'], ['OVERLAPS', 'TEXT ON TOP OF TEXT'], ['TRUNCATED', 'CUT SHORT, FULL TEXT NOT REACHABLE'], ['TINY', 'BELOW 9 PX'], ['SCROLLS_X', 'SIDEWAYS SCROLL WHERE NONE IS MEANT']];
boards['polish-6-text'] = board(`THIS PASS · TEXT FIT · ${counts.states} STATES × 4 SIZES, AUDITED`, 'TEXT FITS ITS ROW, ITS PANEL AND ITS SIZE', `<div class="stats">${STAT.map(([k, l]) => `<div class="stat"><small>${k.replace('_', ' ')}</small><b>${counts.before[k]}<em>→</em><span>${counts.after[k]}</span></b><p>${l}</p></div>`).join('')}</div>` + (await pairs('tx', [
  ['THE YARD', 'MODEL NAMES · DEFECT A', 'desktop', 'fleet', [], '.fl-grid > :first-child'],
  ['TAGS ON THE TRUCK', 'IFTA · DEFECT B', 'desktop', 'fleet', [['fl.sec', 'ifta']], '.fl-stage'],
  ['PHONE · THE STAGE', 'UNIT, MODEL AND READOUTS', 'phone', 'fleet', [], [0, 0, 390, 470]],
  ['PHONE · CLIENT SERVICES', 'ONE LINE EACH', 'phone', 'client', [], [0, 0, 390, 620]],
])) + notes([`THE AUDIT WALKS ${counts.states} PANEL, TAB, RECORD AND DRAWER STATES AT 390, 834, 1440 AND 2560 AND FAILS QA ON ANY OF THE SIX COUNTS ABOVE.`, 'ONE-LINE PARTS — TABS, CHIPS, TAGS, READOUTS, BUTTONS — NEVER WRAP. THE SCALE IS 9 / 10 / 12 / 13 / 17 PX.', 'ONLY THE ROWS DRAWN TO SCROLL SIDEWAYS DO (YARD STRIP, PERIOD STRIP, PHONE SERVICES, TAB ROWS), EACH WITH AN EDGE FADE AND THE ACTIVE CHOICE KEPT IN VIEW.', `WHERE TEXT IS CUT SHORT (${counts.after.truncated_reachable}), THE FULL TEXT IS ON THE ELEMENT FOR HOVER AND SCREEN READERS.`]));

/* ── motion: frames around a click, from the recordings ── */
const rec = (label) => JSON.parse(readFileSync(join(REC, `recordings-${label}.json`), 'utf8'));
const recs = { before: rec('before'), after: rec('after') };
const OFFS = [-0.08, 0.05, 0.12, 0.2, 0.32];
function frames(label, id, step) {
  const r = recs[label].find((x) => x.id === id);
  const m = r?.marks[step];
  if (!m || m.at == null) return null;
  return OFFS.map((dt, k) => {
    const f = join(TMP, `mo-${id}-${step}-${label}-${k}.png`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(Math.max(0, m.at + dt)), '-i', join(REC, `${id}-${label}.mp4`), '-frames:v', '1', f]);
    return [f, dt < 0 ? 'BEFORE THE TAP' : `+${Math.round(dt * 1000)} MS`];
  });
}
const strip = (label, fr) => `<div class="mo__strip mo__strip--${label}"><small>${label === 'before' ? 'BEFORE · LAST PASS' : 'AFTER · THIS PASS'}</small><div class="mo__f">${fr ? fr.map(([f, l]) => `<figure><img src="file://${f}"><figcaption>${l}</figcaption></figure>`).join('') : '<p>NOT IN THE LAST PASS</p>'}</div></div>`;
const MOTION = [
  ['01', 0, 'FLEET · SELECT A TRUCK', 'THE STAGE SETTLES IN; THE ROSTER IS NOT REDRAWN'],
  ['04', 2, 'CLIENT 360 · POLICY → UNIT 1', 'THE NESTED RECORD SETTLES INTO THE SAME PANEL'],
  ['07', 0, 'COMPLIANCE · SELECT A DEADLINE', 'THE MARKER GROWS AND RINGS ONCE; THE CASE SETTLES'],
  ['10', 0, 'PHONE · OPEN A DRAWER', 'IT SLIDES UP OVER A DIMMING SCRIM'],
  ['10', 1, 'PHONE · CLOSE THE DRAWER', 'IT LEAVES BEFORE THE PAGE CHANGES'],
  ['12', 0, 'PHONE · REDUCED MOTION', 'THE SAME DRAWER, NO SLIDE'],
];
const rows = MOTION.map(([id, step, t, s]) => {
  const phone = recs.after.find((x) => x.id === id)?.dev === 'phone';
  return `<div class="mo__row"><h2>${t}<span>${s}</span></h2><div class="mo__ba ${phone ? 'mo__ba--phone' : ''}">${strip('before', frames('before', id, step))}${strip('after', frames('after', id, step))}</div></div>`;
});
boards['polish-7-motion'] = board('THIS PASS · MOTION · FRAMES FROM REAL CLICKS IN CHROMIUM', 'PRECISE, SOFT, RESPONSIVE — NEVER IN THE WAY', `<div class="mo">${rows.join('')}</div>` + notes(['MICRO 130 MS · SELECTION 190 MS · PANELS AND DRAWERS 260 MS · CONTEXT 320 MS · EXIT 200 MS. ONE EASING, NO BOUNCE.', 'ONLY WHAT CHANGED MOVES: THE PAGE IS PATCHED, NOT REDRAWN, SO SCROLL, FOCUS AND THE ROSTER STAY PUT.', 'NOTHING PULSES, NOTHING STAGGERS, NOTHING WAITS FOR AN ANIMATION BEFORE IT CAN BE TAPPED.', 'WITH REDUCED MOTION ON, EVERY MOVE IS INSTANT. STILLS CANNOT SHOW FEEL — PLAY THE RECORDINGS IN THE REVIEW.']));

for (const [name, html] of Object.entries(boards)) {
  const file = join(TMP, `${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style>${html}`);
  const p = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
  await p.goto(`file://${file}`);
  await p.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))))]));
  const png = join(TMP, `${name}.png`);
  await p.locator('.board').screenshot({ path: png });
  await p.close();
  execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nw=2000\nim=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=84,optimize=True,progressive=True)', png, join(OUT, `${name}.jpg`)]);
  console.log(`${name}.jpg`);
}
console.log('audit', JSON.stringify(counts));
await browser.close();
srv.before.close();
srv.after.close();
rmSync(TMP, { recursive: true, force: true });
