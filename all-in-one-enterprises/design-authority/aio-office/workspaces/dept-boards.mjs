/**
 * The founder's curated review of the complete office: one board per department (the twelve service lanes, HOME,
 * INTAKE, REPORTS, MORE and CLIENT 360) — the primary workspace, a selected record, a deeper interaction, the phone
 * adaptation, tablet and ultra-wide, and the links on the approved roots that open it — plus the render set behind it:
 * every SEE state at its device, and MAIN at all four sizes.
 *
 *   node design-authority/aio-office/workspaces/dept-boards.mjs <workspacesDist> [outDir] [ids,comma]
 *     outDir  default: AIO_OFFICE_COMPLETE_REVIEW (repository root) — writes boards/dept-<id>.jpg and renders/<id>/…
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../../..');
const DIST = resolve(process.argv[2]);
const OUT = resolve(process.argv[3] || join(APP, '..', 'AIO_OFFICE_COMPLETE_REVIEW'));
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));
const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webm': 'video/webm', '.mp4': 'video/mp4' };
const srv = await new Promise((r) => {
  const s = createServer((q, res) => {
    if (q.url === '/favicon.ico') return res.writeHead(204).end();
    const p = join(DIST, decodeURIComponent(new URL(q.url, 'http://x').pathname));
    if (!p.startsWith(DIST) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    createReadStream(p).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const TMP = join(tmpdir(), `aio-dept-${process.pid}`);
mkdirSync(TMP, { recursive: true });
mkdirSync(join(OUT, 'boards'), { recursive: true });
const DEV = { phone: [390, 844], tablet: [834, 1194], desktop: [1440, 900], wide: [2560, 1440] };
const SIZE = { phone: '390 × 844', tablet: '834 × 1194', desktop: '1440 × 900', wide: '2560 × 1440' };
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const jpg = (png, out, w, q = 80) => execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nw=int(sys.argv[3])\nif w and im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=int(sys.argv[4]),optimize=True,progressive=True)', png, out, String(w), String(q)]);

const pages = {};
async function page(dev) {
  if (pages[dev]) return pages[dev];
  const [w, h] = DEV[dev];
  const p = await browser.newPage({ viewport: { width: Math.max(1500, w + 80), height: h + 420 } });
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(String(e)));
  await p.goto(`http://127.0.0.1:${srv.address().port}/local.html?device=${dev}`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  return (pages[dev] = p);
}
/** One state of one workspace on one device → a PNG in TMP. */
async function shot(id, acts, dev, name) {
  const p = await page(dev);
  await p.evaluate(([w, a, d]) => window.AIO_WS.go(w, a, d), [id, acts, dev]);
  await p.waitForTimeout(450);
  await p.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 2500)), Promise.all([...document.querySelectorAll('#rv-device img')].map((i) => (i.loading = 'eager', i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))))]));
  await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
  await p.evaluate(() => window.AIO_WS.capture(true));
  const file = join(TMP, `${id}--${name}--${dev}.png`);
  await (await p.$('#rv-device')).screenshot({ path: file });
  await p.evaluate(() => window.AIO_WS.capture(false));
  return file;
}

const desk = await page('desktop');
const REG = await desk.evaluate(() => window.AIO_WS.registry());
const GROUPS = { auth: 'AUTHORITY & FILINGS', fleet: 'TRUCKS & PEOPLE', money: 'FREIGHT & MONEY', office: 'THE OFFICE' };
/** Which links on the approved roots open which page (desktop, founder): { wsId: [[root, label, route], …] }. */
const LINKS = {};
for (const root of REG.filter((w) => w.root)) {
  await desk.evaluate((r) => window.AIO_WS.go(r, [], 'desktop'), root.id);
  await desk.waitForTimeout(200);
  const found = await desk.evaluate(() =>
    [...document.querySelectorAll('#rv-device [data-go]')].map((el) => [el.dataset.go, routeWs(el.dataset.go), (el.getAttribute('aria-label') || el.innerText || '').split('\n').map((t) => t.trim()).filter(Boolean).slice(0, 2).join(' · ').slice(0, 44)]),
  );
  for (const [route, ws, label] of found) if (ws && !ws.startsWith('r-')) (LINKS[ws] ||= []).push([root.name, label, route]);
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@600;700;800&family=Roboto:wght@400;500;600;700&display=swap');
body{margin:0;background:#121214}
.board{width:2400px;box-sizing:border-box;padding:48px 60px 56px;background:radial-gradient(1200px 600px at 85% -10%,#2a2620 0,#141416 60%);color:#efe6d2;font-family:Roboto,Arial,sans-serif;text-transform:uppercase}
header{display:grid;grid-template-columns:auto 1fr auto;gap:28px;align-items:end}
header .no{font:800 92px/.8 'Roboto Condensed';color:#f1c158;letter-spacing:-.01em}
header small{font:700 15px/1 Roboto;letter-spacing:.24em;color:#e7ab3c}
header h1{margin:10px 0 0;font:800 50px/1 'Roboto Condensed';letter-spacing:.01em}
header p{margin:0;font:700 18px/1.3 Roboto;letter-spacing:.14em;color:#a9a091;text-align:right;max-width:640px}
.row{display:grid;gap:30px;margin-top:30px;align-items:start}
.r1{grid-template-columns:1fr 1fr}
.r2{grid-template-columns:1fr 1fr}
.r3{grid-template-columns:1fr 600px}
.fit{display:flex;gap:22px;align-items:flex-start;justify-content:space-between}
.fit .shot img{height:640px;width:auto}
figure{margin:0;display:grid;gap:12px;align-content:start}
figure img{display:block;width:100%;border-radius:10px;box-shadow:0 0 0 1px #3a3530,0 26px 54px rgba(0,0,0,.45)}
figcaption{display:flex;gap:14px;align-items:baseline;white-space:nowrap}
figcaption b{font:800 21px/1 'Roboto Condensed';letter-spacing:.06em;color:#f1c158}
figcaption span{font:600 14px/1 Roboto;letter-spacing:.14em;color:#a9a091}
.nav h2{margin:0 0 14px;font:800 24px/1 'Roboto Condensed';letter-spacing:.06em;color:#f1c158}
.nav ol{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.nav li{display:grid;grid-template-columns:120px 1fr;gap:14px;padding:12px 16px;border-radius:10px;background:#1d1c1f;box-shadow:0 0 0 1px #34302a}
.nav li b{font:800 17px/1.2 'Roboto Condensed';letter-spacing:.06em}
.nav li span{font:600 15px/1.3 Roboto;letter-spacing:.06em;color:#cfc6b4}
.nav li em{display:block;font:500 13px/1.3 Roboto;letter-spacing:.06em;color:#8d8578;font-style:normal;text-transform:none}
.nav .demo li{grid-template-columns:44px 1fr}
.nav .demo i{width:32px;height:32px;border-radius:50%;background:linear-gradient(180deg,#f7d27a,#e7ab3c);color:#141416;font:800 17px/32px 'Roboto Condensed';text-align:center;font-style:normal}
.nav section+section{margin-top:26px}
`;
const fig = (file, b, span) => `<figure class="shot"><img src="file://${file}"><figcaption><b>${b}</b><span>${span}</span></figcaption></figure>`;
const made = [];
for (const w of REG.filter((x) => !x.root && (!ONLY || ONLY.includes(x.id)))) {
  const st = Object.fromEntries(w.states.map(([l, acts, dev]) => [l, [acts, dev || 'desktop']]));
  const need = [
    ['MAIN', st.MAIN?.[0] ?? [], 'desktop'],
    ['MAIN', st.MAIN?.[0] ?? [], 'tablet'],
    ['MAIN', st.MAIN?.[0] ?? [], 'phone'],
    ['MAIN', st.MAIN?.[0] ?? [], 'wide'],
    ...w.states.filter(([l]) => l !== 'MAIN').map(([l, acts, dev]) => [l, acts, dev || 'desktop']),
  ];
  const f = {};
  const dir = join(OUT, 'renders', w.id);
  mkdirSync(dir, { recursive: true });
  for (const [l, acts, dev] of need) {
    const png = await shot(w.id, acts, dev, l.toLowerCase());
    f[`${l}:${dev}`] = png;
    jpg(png, join(dir, `${l.toLowerCase()}--${dev}.jpg`), dev === 'wide' ? 2560 : 0, 78);
  }
  const sel = w.states.find(([l]) => l === 'SELECTED');
  const deep = w.states.find(([l]) => l === 'DEEPER');
  const phone = w.states.find(([l]) => l === 'PHONE');
  const links = (LINKS[w.id] || []).filter((x, i, a) => a.findIndex((y) => y[2] === x[2]) === i);
  const head = w.no && /^\d+$/.test(w.no) ? w.no.padStart(2, '0') : '';
  const html = `<section class="board"><header>${head ? `<span class="no">${head}</span>` : '<span></span>'}<div><small>${GROUPS[w.group]} · ${w.page === 'work' ? 'WORK LANE' : `UNDER ${w.page.toUpperCase()}`}</small><h1>${w.name}</h1></div><p>${w.shape || ''}</p></header>
  <div class="row r1">${fig(f['MAIN:desktop'], 'PRIMARY WORKSPACE', `DESKTOP ${SIZE.desktop}`)}${sel ? fig(f[`SELECTED:${sel[2] || 'desktop'}`], 'SELECTED RECORD', `DESKTOP ${SIZE.desktop}`) : ''}</div>
  <div class="row r2">${deep ? fig(f[`DEEPER:${deep[2] || 'desktop'}`], 'DEEPER INTERACTION', `DESKTOP ${SIZE.desktop}`) : '<div></div>'}<div class="fit">${fig(f['MAIN:tablet'], 'TABLET', SIZE.tablet)}${fig(f['MAIN:phone'], 'PHONE', SIZE.phone)}${phone ? fig(f[`PHONE:${phone[2] || 'phone'}`], 'PHONE · OPEN', SIZE.phone) : ''}</div></div>
  <div class="row r3">${fig(f['MAIN:wide'], 'ULTRA-WIDE', SIZE.wide)}<div class="nav">
    <section><h2>REACHED FROM THE APPROVED ROOTS</h2><ol>${links.length ? links.slice(0, 7).map(([r, label, route]) => `<li><b>${r}</b><span>${label || route}<em>${route}</em></span></li>`).join('') + (links.length > 7 ? `<li><b>+${links.length - 7}</b><span>MORE LINKS</span></li>` : '') : '<li><b>—</b><span>OPENED FROM OTHER WORKSPACES</span></li>'}</ol></section>
    <section class="demo"><h2>TRY IN THE REVIEW</h2><ol>${w.demos.map((d, i) => `<li><i>${i + 1}</i><span>${d}</span></li>`).join('')}</ol></section>
  </div></div></section>`;
  const file = join(TMP, `dept-${w.id}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style>${html}`);
  const p = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
  await p.goto(`file://${file}`);
  await p.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))))]));
  const png = join(TMP, `dept-${w.id}.png`);
  await p.locator('.board').screenshot({ path: png });
  await p.close();
  jpg(png, join(OUT, 'boards', `dept-${w.id}.jpg`), 2000, 84);
  made.push(w.id);
  console.log(`dept-${w.id}.jpg · ${need.length} renders · ${links.length} root links`);
}
const errs = Object.values(pages).flatMap((p) => p.errors);
if (errs.length) console.log(`PAGE ERRORS\n  ${[...new Set(errs)].slice(0, 8).join('\n  ')}`);
await browser.close();
srv.close();
rmSync(TMP, { recursive: true, force: true });
console.log(`boards: ${made.length}`);
