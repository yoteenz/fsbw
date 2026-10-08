/**
 * Founder-review boards for the four workspace proofs: one BEFORE → AFTER board per workspace and one board that sets
 * the approved WORK root beside the four workspaces (same family check). Captures both builds in Chromium.
 *
 *   node design-authority/aio-office/workspaces/boards.mjs <batch1Dist> <workspacesDist> [outDir]
 *     batch1Dist      output of office/build.mjs (the Batch 1 review, which also draws the approved roots)
 *     workspacesDist  output of workspaces/build.mjs
 *     outDir          default: AIO_OFFICE_WORKSPACE_PROOFS/boards (repository root)
 *
 * Needs playwright (the app's dev dependency) and a Chromium (PLAYWRIGHT_CHROMIUM or /opt/pw-browsers/chromium).
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const [B1, WS] = process.argv.slice(2, 4).map((p) => resolve(p));
const OUT = resolve(process.argv[4] || join(APP, '..', 'AIO_OFFICE_WORKSPACE_PROOFS/boards'));
if (!B1 || !WS || !existsSync(join(B1, 'local.html')) || !existsSync(join(WS, 'local.html'))) throw new Error('usage: boards.mjs <batch1Dist> <workspacesDist> [outDir]');
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));

const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
const serve = (dir) =>
  new Promise((r) => {
    const s = createServer((q, res) => {
      const p = join(dir, decodeURIComponent(new URL(q.url, 'http://x').pathname));
      if (!p.startsWith(dir) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
      res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
      createReadStream(p).pipe(res);
    });
    s.listen(0, '127.0.0.1', () => r(s));
  });
const s1 = await serve(B1);
const s2 = await serve(WS);
const TMP = join(tmpdir(), `aio-ws-boards-${process.pid}`);
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const settle = (p) => p.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))))]));

/** Batch 1 page (or an approved root) at 1440 × 900, the first screen only. Returns [file, full scroll height]. */
async function batch1(route, name) {
  const p = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  await p.goto(`http://127.0.0.1:${s1.address().port}/local.html?device=desktop&guide=0`);
  await p.waitForFunction(() => window.AIO_REVIEW);
  await p.evaluate((r) => window.AIO_REVIEW.go(r), route);
  await settle(p);
  await p.evaluate(() => window.AIO_REVIEW.full(true));
  const h = await p.evaluate(() => document.getElementById('ao-screen').scrollHeight);
  const box = await p.locator('#ao-root').boundingBox();
  await p.setViewportSize({ width: Math.ceil(box.x + box.width + 20), height: Math.ceil(box.y + box.height + 20) });
  const file = join(TMP, `${name}.png`);
  await p.screenshot({ path: file, clip: { x: box.x, y: box.y, width: 1440, height: 900 } });
  await p.close();
  return [file, h];
}
/** A new workspace at 1440 × 900 after a few actions. */
async function after(view, acts, name) {
  const p = await browser.newPage({ viewport: { width: 1500, height: 1400 } });
  await p.goto(`http://127.0.0.1:${s2.address().port}/local.html?device=desktop#${view}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  for (const [a, v] of acts) await p.evaluate(([a, v]) => window.AIO_WS.act(a, v), [a, v]);
  await settle(p);
  await p.evaluate(() => window.AIO_WS.capture(true));
  await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
  const file = join(TMP, `${name}.png`);
  await p.locator('#rv-device').screenshot({ path: file });
  await p.close();
  return file;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@600;700;800&family=Roboto:wght@400;500;600&display=swap');
body{margin:0;background:#121214}
.board{width:2400px;box-sizing:border-box;padding:52px 64px 60px;background:radial-gradient(1200px 600px at 80% -10%,#2a2620 0,#141416 60%);color:#efe6d2;font-family:Roboto,Arial,sans-serif;text-transform:uppercase}
header small{font:600 14px/1 Roboto;letter-spacing:.24em;color:#e7ab3c}
header h1{margin:12px 0 0;font:800 52px/1 'Roboto Condensed';letter-spacing:.01em}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:44px;margin-top:34px}
.shot{margin:0;display:grid;gap:14px}
.shot img{display:block;width:100%;border-radius:12px;box-shadow:0 0 0 1px #3a3530,0 30px 60px rgba(0,0,0,.45)}
.shot figcaption{display:flex;gap:16px;align-items:baseline}
.shot figcaption b{font:800 24px/1 'Roboto Condensed';letter-spacing:.06em}
.shot figcaption span{font:600 15px/1 Roboto;letter-spacing:.14em;color:#a9a091}
.shot--after figcaption b{color:#f1c158}
.notes{list-style:none;margin:34px 0 0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.notes li{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:start}
.notes i{width:38px;height:38px;border-radius:50%;background:linear-gradient(180deg,#f7d27a,#e7ab3c);color:#141416;font:800 20px/38px 'Roboto Condensed';text-align:center;font-style:normal}
.notes span{font:700 25px/1.15 'Roboto Condensed';letter-spacing:.03em;padding-top:4px}
.fam{display:grid;grid-template-columns:860px 1fr;gap:44px;margin-top:34px;align-items:start}
.fam .shot--root img{box-shadow:0 0 0 3px #f1c158,0 30px 60px rgba(0,0,0,.45)}
.four{display:grid;grid-template-columns:1fr 1fr;gap:26px 26px}
.four .shot figcaption b{font-size:19px}
.fam .notes{grid-template-columns:1fr;gap:18px;margin-top:26px}
.fam .notes span{font-size:23px}
`;
const ACT = { fleet: [], books: [], comp: [], client: [['cl.service', 'insurance'], ['cl.push', 'policy:pol-abc']] };
const PAIRS = [
  ['fleet', 'rec/vehicle/v-tk-09', 'VEHICLES & FLEET', 'UNIT 09 RECORD', ['THE TRUCK IS THE STAGE — EVERY RECORD IS TAGGED ON IT.', 'THE BLOCKER READS FIRST: OUT OF SERVICE, IN RED, ONCE.', 'ONE SECTION AT A TIME IN THE PANEL — NO SCROLLING.']],
  ['books', 'rec/cycle/cy-tk-sep', 'BOOKKEEPING', 'SEPTEMBER CLOSE · T&K TRANSPORT', ['THE NINE-STEP CLOSE IS ONE RULE ACROSS THE TOP.', 'THE WORK IS A WORKTABLE: THE THREE CHARGES, LINE BY LINE.', 'ANSWER A CHARGE IN PLACE — SIMULATED, WITH UNDO.']],
  ['comp', 'work/compliance', 'COMPLIANCE', 'COMPLIANCE LANE', ['NINETY DAYS ON ONE HORIZON — TIME YOU CAN SEE.', 'A QUEUE BY URGENCY WITH COUNTDOWNS, NOT A TABLE.', 'THE CASE: SUBJECT, REQUIREMENT, OWNER, ONE NEXT STEP.']],
  ['client', 'client/c-abc', 'CLIENT 360', 'ABC TRUCKING LLC', ['A COMPANY WITH AN IDENTITY, NOT A CONTACT CARD.', 'TWELVE SERVICES AS ONE CONSTELLATION — LIT WHERE THEY USE AIO.', 'DRILL IN AND BACK WITHOUT LOSING THE COMPANY.']],
];
const boards = {};
const shots = {};
for (const [id, route, title, what, notes] of PAIRS) {
  const [before, h] = await batch1(route, `before-${id}`);
  const aft = await after(id, ACT[id], `after-${id}`);
  shots[id] = aft;
  const screens = (h / 900).toFixed(1);
  boards[`before-after-${id}`] = `<section class="board"><header><small>BEFORE → AFTER · ${what}</small><h1>${title}</h1></header>
    <div class="pair"><figure class="shot"><img src="file://${before}"><figcaption><b>BEFORE · BATCH 1</b><span>${h > 905 ? `${h.toLocaleString('en-US')} PX · ${screens} SCREENS` : 'ONE TEMPLATE FOR EVERY PAGE'}</span></figcaption></figure>
    <figure class="shot shot--after"><img src="file://${aft}"><figcaption><b>AFTER · CANDIDATE</b><span>ONE SCREEN · SAME SAMPLE RECORDS</span></figcaption></figure></div>
    <ol class="notes">${notes.map((n, i) => `<li><i>${i + 1}</i><span>${n}</span></li>`).join('')}</ol></section>`;
}
const [root] = await batch1('work', 'root-work');
const names = { fleet: 'VEHICLES & FLEET', books: 'BOOKKEEPING', comp: 'COMPLIANCE', client: 'CLIENT 360' };
boards['family-roots'] = `<section class="board"><header><small>SAME FAMILY AS THE APPROVED ROOTS</small><h1>THE APPROVED WORK ROOT, UNCHANGED, BESIDE THE FOUR WORKSPACES</h1></header>
  <div class="fam"><div><figure class="shot shot--root"><img src="file://${root}"><figcaption><b>WORK · APPROVED ROOT</b><span>UNCHANGED</span></figcaption></figure>
  <ol class="notes">${['SAME HEADER, LOGO AND FIVE-ROOT NAVIGATION.', 'SAME OBSIDIAN, IVORY AND GOLD; SAME CONDENSED TYPE.', 'SAME STATUS WORDS AND THE SAME GOLD NEXT STEP.', 'NEW BELOW THE ROOT: NO PHOTO BAND — THE WORK FILLS THE SCREEN.'].map((n, i) => `<li><i>${i + 1}</i><span>${n}</span></li>`).join('')}</ol></div>
  <div class="four">${Object.entries(shots).map(([id, f]) => `<figure class="shot shot--after"><img src="file://${f}"><figcaption><b>${names[id]}</b><span>CANDIDATE</span></figcaption></figure>`).join('')}</div></div></section>`;

for (const [name, html] of Object.entries(boards)) {
  const file = join(TMP, `${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style>${html}`);
  const p = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
  await p.goto(`file://${file}`);
  await settle(p);
  const png = join(TMP, `${name}.png`);
  await p.locator('.board').screenshot({ path: png });
  await p.close();
  const { execFileSync } = await import('node:child_process');
  execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nw=2000\nim=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=84,optimize=True,progressive=True)', png, join(OUT, `${name}.jpg`)]);
  console.log(`${name}.jpg`);
}
await browser.close();
s1.close();
s2.close();
rmSync(TMP, { recursive: true, force: true });
