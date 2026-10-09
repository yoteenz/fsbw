/**
 * Founder-review boards for the AIO PUBLIC WEBSITE, and the thumbnails the review's cards use.
 *   match-home.jpg     panel 04 of the brand DNA board beside the homepage's first screen (1440 × 900): what matches, what differs
 *   match-family.jpg   the approved IFTA public page beside the service family (permitting hub + a service page)
 *   home-sizes.jpg     the homepage composed at 390 · 834 · 1440 · 2560
 *   family.jpg         the service family: hub · service · plans · partner · paused · approved IFTA (desktop + phone)
 *   remaining.jpg      every other designed page, first screen, desktop and phone
 *
 *   node design-authority/aio-public/boards.mjs <dist> [outDir]
 *     outDir  default: AIO_PUBLIC_WEBSITE_REVIEW (repository root) — boards/ and thumbs/
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../..');
const DIST = resolve(process.argv[2]);
const OUT = resolve(process.argv[3] || join(APP, '..', 'AIO_PUBLIC_WEBSITE_REVIEW'));
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));
const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = await new Promise((r) => {
  const s = createServer((q, res) => {
    const p = join(DIST, decodeURIComponent(new URL(q.url, 'http://x').pathname));
    if (!p.startsWith(DIST) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    createReadStream(p).pipe(res);
  });
  s.listen(0, '127.0.0.1', () => r(s));
});
const BASE = `http://127.0.0.1:${srv.address().port}`;
const TMP = join(tmpdir(), `aio-pubboards-${process.pid}`);
mkdirSync(TMP, { recursive: true });
mkdirSync(join(OUT, 'boards'), { recursive: true });
mkdirSync(join(OUT, 'thumbs'), { recursive: true });
const DEV = { phone: [390, 844], tablet: [834, 1194], desktop: [1440, 900], wide: [2560, 1440] };
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const py = (code, ...args) => execFileSync('python3', ['-I', '-c', code, ...args]);
const toJpg = (png, out, w, q = 82) => py('import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nw=int(sys.argv[3])\nif im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=int(sys.argv[4]),optimize=True,progressive=True)', png, out, String(w), String(q));
const pages = {};
async function page(dev) {
  if (pages[dev]) return pages[dev];
  const [w, h] = DEV[dev];
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.goto(`${BASE}/site.html`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  return (pages[dev] = p);
}
let n = 0;
/** A page on a device: the first screen, or the whole page (held at the device height for its first screen). */
async function shot(path, dev, full = false) {
  const p = await page(dev);
  const [w, h] = DEV[dev];
  await p.evaluate((x) => window.AIO_PUB.go(x), path);
  await p.evaluate(() => window.AIO_PUB.capture(true));
  const settle = async () => {
    await p.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 2500)), Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))))]));
    await p.waitForTimeout(200);
    await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
  };
  await settle();
  const file = join(TMP, `${++n}.png`);
  if (full) {
    await p.evaluate((x) => window.AIO_PUB.hold(x), h);
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    await p.setViewportSize({ width: w, height: Math.min(H, 14000) });
    await settle();
    await p.screenshot({ path: file });
    await p.setViewportSize({ width: w, height: h });
    await p.evaluate(() => window.AIO_PUB.hold(0));
  } else await p.screenshot({ path: file });
  return file;
}
const slug = (p) => p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
const css = `
body{margin:0;background:#0b0b0c}
.board{width:2400px;box-sizing:border-box;padding:52px 64px 60px;background:radial-gradient(1200px 600px at 80% -10%,#2a2620 0,#0e0e0f 60%);color:#efe6d2;font-family:Inter,Arial,sans-serif;text-transform:uppercase}
@font-face{font-family:Inter;src:url('file://${DIST}/fonts/inter-latin-wght.woff2');font-weight:100 900}
@font-face{font-family:'Inter Tight';src:url('file://${DIST}/fonts/inter-tight-latin-wght.woff2');font-weight:100 900}
header small{font:700 15px/1 Inter;letter-spacing:.26em;color:#d4a853}
header h1{margin:12px 0 0;font:800 52px/1 'Inter Tight';letter-spacing:.01em}
header p{margin:14px 0 0;font:600 17px/1.5 Inter;letter-spacing:.1em;color:#a9a091;max-width:1700px}
.row{display:grid;gap:34px;margin-top:34px;align-items:start}
figure{margin:0;display:grid;gap:12px}
figure img{display:block;width:100%;border-radius:12px;box-shadow:0 0 0 1px #3a3530,0 30px 60px rgba(0,0,0,.5)}
figcaption{display:flex;gap:14px;align-items:baseline}
figcaption b{font:800 22px/1 'Inter Tight';letter-spacing:.06em;color:#f1c158}
figcaption span{font:600 14px/1 Inter;letter-spacing:.14em;color:#a9a091}
.notes{list-style:none;margin:30px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:14px 40px}
.notes li{display:grid;grid-template-columns:38px 1fr;gap:14px;align-items:start;font:600 19px/1.35 Inter;letter-spacing:.06em}
.notes i{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font:800 17px/1 Inter;font-style:normal;color:#141416;background:linear-gradient(180deg,#f7d27a,#d4a853)}
.notes li.x i{background:#3a2622;color:#e07a6a}
.phones{display:flex;gap:26px;align-items:flex-start}
`;
async function board(name, html) {
  const file = join(TMP, `${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style>${html}`);
  const p = await browser.newPage({ viewport: { width: 2400, height: 1200 } });
  await p.goto(`file://${file}`);
  await p.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))))]));
  const png = join(TMP, `${name}.png`);
  await p.locator('.board').screenshot({ path: png });
  await p.close();
  toJpg(png, join(OUT, 'boards', `${name}.jpg`), 2000, 84);
  console.log(`${name}.jpg`);
}
const img = (f) => `file://${f}`;
const REF = join(HERE, 'reference');

/* match · homepage ↔ panel 04 */
{
  const home = await shot('/', 'desktop');
  const notes = [
    ['✓', 'SAME NAVIGATION: SIMPLE MARK · SERVICES · SOLUTIONS · ABOUT · RESOURCES · CONTACT · SEARCH · CLIENT LOGIN · GET STARTED'],
    ['✓', 'SAME WORDS, VERBATIM: THE EYEBROW, FROM STARTUP / TO EVERY MILE AFTER., THE TAGLINE AND THE BODY LINE'],
    ['✓', 'SAME COMPOSITION: WORDS LEFT ON THE DARK, THE BLACK TRUCK AT DUSK ON THE RIGHT, ONE GOLD CALL TO ACTION'],
    ['✓', 'SAME BAND: TRUSTED PARTNER · INDUSTRY EXPERIENCE · NATIONWIDE SUPPORT · BUILT FOR YOUR GROWTH'],
    ['≠', 'THE FOUR STATS (2,500+ CLIENTS · 98% APPROVAL · 50 STATES · 24/7) ARE UNVERIFIED — REPLACED BY PRODUCT FACTS'],
    ['≠', 'WATCH OUR STORY → SEE HOW IT WORKS — NO BRAND FILM EXISTS'],
    ['≠', 'THE TRUCK IS THE FOUNDER’S APPROVED BLACK-TRUCK MASTER (UNBRANDED) — NO BRANDED PHOTOGRAPH LIKE THE PANEL’S EXISTS'],
    ['≠', 'INTER TIGHT FOR THE HEADLINE — MONUMENT EXTENDED IS NOT LICENSED (D-TYPOGRAPHY)'],
  ];
  await board('match-home', `<section class="board"><header><small>VISUAL MATCH · HOMEPAGE</small><h1>FOUNDER PANEL 04 BESIDE THE DESIGNED HOMEPAGE</h1><p>THE ONLY FOUNDER IMAGE OF THE PUBLIC HOMEPAGE IS PANEL 04 “WEBSITE HOMEPAGE EXPRESSION” OF THE BRAND DNA BOARD (SITE00 4AF8116C). THE FIRST SCREEN IS HELD TO IT; BELOW THE FOLD THERE IS NO FOUNDER REFERENCE — IT IS COMPOSED FROM THE RECOVERED PAGE TREE AND THE APPROVED PUBLIC FAMILY.</p></header>
    <div class="row" style="grid-template-columns:1fr 1fr"><figure><img src="${img(join(REF, 'panel-04-homepage.jpg'))}"><figcaption><b>FOUNDER · PANEL 04</b><span>BRAND DNA BOARD · CROP FOR COMPARISON</span></figcaption></figure><figure><img src="${img(home)}"><figcaption><b>DESIGNED · HOMEPAGE</b><span>FIRST SCREEN · 1440 × 900</span></figcaption></figure></div>
    <ol class="notes">${notes.map(([k, t]) => `<li class="${k === '≠' ? 'x' : ''}"><i>${k}</i><span>${t}</span></li>`).join('')}</ol></section>`);
}
/* match · service family ↔ approved IFTA public page */
{
  const hub = await shot('/services/permitting', 'desktop', true);
  const leaf = await shot('/services/trip-permits', 'phone', true);
  await board('match-family', `<section class="board"><header><small>VISUAL MATCH · SERVICE FAMILY</small><h1>THE APPROVED IFTA PUBLIC PAGE BESIDE THE SERVICE FAMILY</h1><p>THE IFTA PUBLIC PAGE IS THE ONE PUBLIC SERVICE PAGE BUILT TO A FOUNDER AUTHORITY. EVERY SERVICE PAGE INHERITS ITS GRAMMAR: PHOTO HERO, A RAIL OF FOUR FACTS, A CLEAR PATH WITH A PHOTO CARD, FIVE NUMBERED STEPS, THE MOUNTAIN BAND AND THE LOCKUP — WITH THE CATALOG’S REAL STATUS IN PLACE OF SAMPLE FIGURES.</p></header>
    <div class="row" style="grid-template-columns:1.05fr .8fr .36fr"><figure><img src="${img(join(REF, 'ifta-public-authority.jpg'))}"><figcaption><b>APPROVED · IFTA PUBLIC</b><span>FOUNDER AUTHORITY</span></figcaption></figure><figure><img src="${img(hub)}"><figcaption><b>PERMITTING & COMPLIANCE</b><span>FAMILY HUB · 1440</span></figcaption></figure><figure><img src="${img(leaf)}"><figcaption><b>TRIP PERMITS</b><span>390</span></figcaption></figure></div></section>`);
}
/* the homepage at four sizes */
{
  const d = await shot('/', 'desktop', true);
  const w = await shot('/', 'wide');
  const t = await shot('/', 'tablet');
  const ph = await shot('/', 'phone', true);
  await board('home-sizes', `<section class="board"><header><small>HOMEPAGE · FOUR SIZES, EACH COMPOSED</small><h1>390 · 834 · 1440 · 2560</h1><p>DESKTOP: THE PANEL 04 FIRST SCREEN, THEN PICK YOUR ROAD, START · OPERATE · MAINTAIN, THE BUSINESS OFFICE BEHIND THE TRUCK, ROAD READY™ AND THE CLOSING BAND. TABLET: THE TRUCK ABOVE, THE WORDS ON THE ROAD. PHONE: THE PHOTO ACROSS THE TOP, THE PATHWAYS SWIPE, THE STAGES BECOME TABS. ULTRA-WIDE: MORE ROAD, LARGER TYPE, THE SAME HIERARCHY.</p></header>
    <div class="row" style="grid-template-columns:1fr 1fr"><figure><img src="${img(d)}"><figcaption><b>DESKTOP</b><span>1440 × 900 · WHOLE PAGE</span></figcaption></figure>
    <div style="display:grid;gap:34px"><figure><img src="${img(w)}"><figcaption><b>ULTRA-WIDE</b><span>2560 × 1440 · FIRST SCREEN</span></figcaption></figure><div class="phones"><figure style="flex:1.4"><img src="${img(t)}"><figcaption><b>TABLET</b><span>834 × 1194</span></figcaption></figure><figure style="flex:1"><img src="${img(ph)}"><figcaption><b>PHONE</b><span>390 · WHOLE PAGE</span></figcaption></figure></div></div></div></section>`);
}
/* the service family */
{
  const FAM = [['/services/permitting', 'FAMILY HUB'], ['/services/trip-permits', 'SERVICE PAGE'], ['/services/bookkeeping', 'PLANS (NO PRICES)'], ['/services/insurance', 'PARTNER REFERRAL'], ['/services/brokerage', 'PAUSED'], ['/services/ifta-filing', 'APPROVED · UNCHANGED']];
  const d = [];
  const m = [];
  for (const [p] of FAM) { d.push(await shot(p, 'desktop')); m.push(await shot(p, 'phone')); }
  await board('family', `<section class="board"><header><small>THE SERVICE FAMILY · ONE GRAMMAR, SIX JOBS</small><h1>HUB · SERVICE · PLANS · PARTNER · PAUSED · APPROVED</h1><p>EVERY CATALOG SERVICE HAS ITS PAGE, BUILT FROM THE SAME GRAMMAR. STATUS COMES FROM THE ACTIVATION MATRICES. BROKERAGE IS DESIGNED AND SHOWN PAUSED — ITS START ACTIONS ARE DISABLED. THE IFTA FILING PAGE IS THE APPROVED BUILD, SHOWN UNCHANGED.</p></header>
    <div class="row" style="grid-template-columns:repeat(3,1fr)">${FAM.map(([p, t], i) => `<figure><img src="${img(d[i])}"><figcaption><b>${t}</b><span>${p}</span></figcaption></figure>`).join('')}</div>
    <div class="row" style="grid-template-columns:repeat(6,1fr)">${FAM.map(([p, t], i) => `<figure><img src="${img(m[i])}"><figcaption><b>${t}</b><span>390</span></figcaption></figure>`).join('')}</div></section>`);
}
/* every other designed page */
{
  const REST = ['/services', '/services/find', '/services/business-formation', '/services/dispatching', '/services/factoring', '/services/fleetcare', '/services/fleetcare/plans', '/fleetcare/providers/join', '/services/driverlink', '/driverlink/signup', '/services/bookkeeping/assessment', '/services/bookkeeping/recommendation', '/start-your-business', '/start-your-business/build', '/start-your-business/register', '/start-your-business/activate', '/start-your-business/roll', '/road-ready', '/roadmap', '/client-portal', '/get-started', '/roadmap/results', '/service-plan', '/request/submit', '/request/confirmation/req-sample', '/quote/sample', '/about', '/contact', '/request-callback', '/schedule', '/login', '/signup', '/forgot-password', '/onboarding', '/not-found'];
  const cells = [];
  for (const p of REST) cells.push([p, await shot(p, 'desktop'), await shot(p, 'phone')]);
  await board('remaining', `<section class="board"><header><small>THE REST OF THE TREE · FIRST SCREENS</small><h1>${REST.length} MORE PAGES, DESKTOP AND PHONE</h1><p>SERVICES, PRODUCTS, THE START YOUR BUSINESS JOURNEY, ROAD READY, THE CLIENT PORTAL, THE GET-STARTED FLOW TO REQUEST RECEIVED, COMPANY PAGES, ACCOUNT PAGES AND THE 404 — ALL IN THE SAME LANGUAGE. FORMS ARE DRAWN; NOTHING IS SENT; SIGN-IN IS NOT CHANGED.</p></header>
    <div class="row" style="grid-template-columns:repeat(5,1fr);gap:26px">${cells.map(([p, d, m]) => `<figure><div style="position:relative"><img src="${img(d)}"><img src="${img(m)}" style="position:absolute;right:8px;bottom:8px;width:24%;border-radius:8px;box-shadow:0 0 0 2px #222,0 8px 20px rgba(0,0,0,.6)"></div><figcaption><span>${p}</span></figcaption></figure>`).join('')}</div></section>`);
}
/* thumbnails for the review's cards (desktop first screen + phone first screen) */
{
  const pick = ['/', '/services/permitting', '/services/trip-permits', '/services/bookkeeping', '/services/insurance', '/services/brokerage', '/services/ifta-filing', '/services', '/services/find', '/services/business-formation', '/services/dispatching', '/services/factoring', '/services/fleetcare', '/services/driverlink', '/start-your-business', '/start-your-business/register', '/road-ready', '/roadmap', '/client-portal', '/get-started', '/roadmap/results', '/service-plan', '/request/submit', '/request/confirmation/req-sample', '/about', '/contact', '/request-callback', '/schedule', '/login', '/signup', '/forgot-password', '/onboarding', '/not-found'];
  for (const p of pick) {
    toJpg(await shot(p, 'desktop'), join(OUT, 'thumbs', `${slug(p)}--desktop.jpg`), 720, 78);
    toJpg(await shot(p, 'phone'), join(OUT, 'thumbs', `${slug(p)}--phone.jpg`), 300, 78);
  }
  console.log(`thumbs: ${pick.length * 2}`);
}
await browser.close();
srv.close();
rmSync(TMP, { recursive: true, force: true });
