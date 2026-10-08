/**
 * QA for the AIO OFFICE unified review: crawl every reachable page, at every screen size and role, and check it.
 *
 *   node design-authority/aio-office/office/qa.mjs <builtDir> [--shots <dir>]
 *
 * Checks, per page: it draws (no error page, no "not designed" page), no console or page errors, no dead control
 * (anything that looks tappable carries data-go / data-sim / data-act / … or is marked unavailable), the uppercase law
 * inside the office, no sideways overflow, and role rules (staff never see founder-only actions, finance figures,
 * billing, CRM or report figures without a grant). Then it runs the cross-service journeys and real interactions
 * (simulated action, search, client switch, back), and writes qa-report.json. --shots writes review screenshots.
 */
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const DIR = resolve(process.argv[2] || 'dist');
const shotsAt = process.argv.indexOf('--shots');
const SHOTS = shotsAt > 0 ? resolve(process.argv[shotsAt + 1]) : null;
const DEVICES = { phone: [390, 844], tablet: [834, 1194], desktop: [1440, 900], wide: [2560, 1440] };
const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json' };

const server = createServer((req, res) => {
  const p = join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(DIR) || !existsSync(p) || statSync(p).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
  createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}/local.html`;
const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium' } : {});

const report = { pages: {}, failures: [], journeys: [], interactions: [], counts: {} };
const fail = (kind, where, detail) => report.failures.push({ kind, where, detail });

/** In-page audit of the drawn page. */
function audit() {
  const screen = document.getElementById('ao-screen');
  const device = document.getElementById('ao-root');
  const LOOKS = '.btn,.link,.tab,.fchip,.select,.head__tool,.seg,.area,.entry,.qa,.arow,.crow,.erow,.mrow,.frow,.tile,.lane,.acard,.queue,.card,.unit,.thumb,.pathc,.acts__i,.row:not(.row--static),.rel__i:not(.rel__i--static),.search,.head__field,.head__avatar,.head__who,.dock__item,.side__item,.flow-steps a,.crumbs a';
  const LIVE = '[data-go],[data-sim],[data-act],[data-k],[data-view],[data-area],[data-gap],a[href]';
  const dead = [];
  for (const el of screen.querySelectorAll(LOOKS)) {
    if (el.closest(LIVE) || el.closest('[aria-disabled="true"]') || el.classList.contains('btn--ghost')) continue;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') continue;
    dead.push(`${el.className.split(' ')[0]}: ${el.textContent.trim().slice(0, 60)}`);
  }
  const lower = [];
  const walk = document.createTreeWalker(device, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const t = walk.currentNode;
    if (!/[a-z]/.test(t.nodeValue) || !t.parentElement || t.parentElement.closest('svg,script,style')) continue;
    if (getComputedStyle(t.parentElement).textTransform !== 'uppercase') lower.push(t.nodeValue.trim().slice(0, 50));
  }
  const dr = device.getBoundingClientRect();
  const over = [];
  if (screen.scrollWidth > screen.clientWidth + 1) {
    for (const el of screen.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width && r.right > dr.right + 1 && !el.closest('.tabs,.selector,.flow-steps')) over.push(`${el.className || el.tagName}`.slice(0, 50));
      if (over.length > 4) break;
    }
    if (!over.length) over.push(`scrollWidth ${screen.scrollWidth} > ${screen.clientWidth}`);
  }
  const text = screen.innerText;
  return {
    dead: dead.slice(0, 8),
    lower: lower.slice(0, 6),
    over,
    founderBadges: [...screen.querySelectorAll('.qa__grant')].filter((e) => e.textContent.includes('FOUNDER')).length,
    lockedFigs: screen.querySelectorAll('.fig--locked').length,
    lock: !!screen.querySelector('.lock'),
    text: text.length,
    hasRevenue: /COLLECTED REVENUE|\$48,210/.test(text),
  };
}

async function openPage(device, role) {
  const [w, h] = DEVICES[device];
  const page = await browser.newPage({ viewport: { width: Math.max(w + 80, 1280), height: h + 260 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !/favicon|fonts\.g/.test(m.text()) && errors.push(m.text()));
  page.on('requestfailed', (r) => !/fonts\.g/.test(r.url()) && errors.push(`request failed ${r.url()}`));
  await page.goto(`${BASE}?device=${device}&role=${role}&guide=0`);
  await page.waitForFunction(() => window.AIO_REVIEW);
  return { page, errors };
}

/** Crawl from the roots, following every data-go, auditing each page. */
async function crawl(device, role, seeds) {
  const { page, errors } = await openPage(device, role);
  const seen = new Set();
  const queue = [...seeds];
  while (queue.length) {
    const route = queue.shift();
    if (seen.has(route)) continue;
    seen.add(route);
    const before = errors.length;
    const res = await page.evaluate((r) => window.AIO_REVIEW.go(r), route);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    const a = await page.evaluate(audit);
    const where = `${device}/${role} ${route}`;
    const key = route;
    report.pages[key] ||= { family: res.family, status: res.status, live: res.live, gaps: res.gaps, seen: [] };
    report.pages[key].seen.push(`${device}/${role}`);
    if (res.status === 'NOT DESIGNED' || res.status === 'BROKEN') fail('missing-page', where, res.family);
    if (errors.length > before) fail('error', where, errors.slice(before).join(' | '));
    if (a.dead.length) fail('dead-control', where, a.dead.join(' · '));
    if (a.lower.length) fail('uppercase', where, a.lower.join(' · '));
    if (a.over.length) fail('overflow', where, a.over.join(' · '));
    if (role !== 'founder') {
      if (a.founderBadges) fail('role:founder-action-shown', where, `${a.founderBadges} founder-only actions`);
      if (a.lockedFigs || a.hasRevenue) fail('role:finance-shown', where, 'finance figure visible');
      if (role === 'staff' && route.startsWith('reports') && !a.lock) fail('role:reports-open', where, 'reports visible without a grant');
      if (/^(more\/billing|more\/growth_crm|rec\/invoice)/.test(route) && !a.lock) fail('role:grant-page-open', where, 'billing / CRM visible without a grant');
    }
    for (const l of res.links) if (!seen.has(l)) queue.push(l);
  }
  await page.close();
  return seen;
}

const ROOTS = ['home', 'intake', 'work', 'reports', 'more'];
const founderRoutes = await crawl('desktop', 'founder', ROOTS);
const all = [...founderRoutes];
for (const d of ['phone', 'tablet', 'wide']) await crawl(d, 'founder', all);
const staffRoutes = await crawl('desktop', 'staff', [...ROOTS, 'more/billing', 'more/growth_crm', 'rec/invoice/inv-3301', 'reports/financial_revenue', 'rec/policy/pol-dh', 'intake/case/mig-sr']);
await crawl('phone', 'staff', ['home', 'reports', 'more', 'rec/policy/pol-dh']);
const grantedRoutes = await crawl('desktop', 'staff-granted', ['reports', 'reports/clients', 'reports/financial_revenue', 'more/billing']);

/* journeys + interactions */
{
  const { page, errors } = await openPage('desktop', 'founder');
  const journeys = await page.evaluate(() => window.AIO_REVIEW.journeys());
  for (const j of journeys) {
    await page.evaluate((role) => window.AIO_REVIEW.set({ role }), j.role);
    const bad = [];
    for (const r of j.steps) {
      const res = await page.evaluate((x) => window.AIO_REVIEW.go(x), r);
      if (res.status === 'NOT DESIGNED' || res.status === 'BROKEN') bad.push(r);
      // every step after the first is reachable by a tap from the step before, or from the shell
    }
    report.journeys.push({ id: j.id, steps: j.steps.length, pass: !bad.length, bad });
    if (bad.length) fail('journey', j.id, bad.join(' · '));
  }
  await page.evaluate(() => window.AIO_REVIEW.set({ role: 'founder' }));
  const step = async (name, fn) => {
    try {
      const ok = await fn();
      report.interactions.push({ name, pass: !!ok });
      if (!ok) fail('interaction', name, 'did not behave');
    } catch (e) {
      report.interactions.push({ name, pass: false, error: String(e) });
      fail('interaction', name, String(e));
    }
  };
  const screen = page.locator('#ao-screen');
  await step('tap a HOME attention row opens its record', async () => {
    await page.evaluate(() => window.AIO_REVIEW.go('home'));
    await screen.locator('.arow').first().click();
    return (await page.evaluate(() => window.AIO_REVIEW.state().route)) === 'rec/policy/pol-dh';
  });
  await step('simulated action asks first, then changes status for this visit only', async () => {
    await screen.locator('.acts__i[data-sim="pol-send"]').click();
    const asked = await page.locator('#ao-layer .ovl__panel').isVisible();
    await page.locator('#ao-layer [data-act="sim-confirm"]').click();
    const s = await page.evaluate(() => window.AIO_REVIEW.state());
    const hist = await screen.locator('.tag-vis--sim').count();
    return asked && s.status['policy:pol-dh']?.[0] === 'QUOTE SENT TO CLIENT' && s.sims === 1 && hist >= 1;
  });
  await step('related record opens the linked truck, back returns', async () => {
    await screen.locator('.rel__i[data-go="rec/vehicle/v-dh-12"]').click();
    const there = (await page.evaluate(() => window.AIO_REVIEW.state().route)) === 'rec/vehicle/v-dh-12';
    await screen.locator('.pg__back').first().click();
    return there && (await page.evaluate(() => window.AIO_REVIEW.state().route)) === 'rec/policy/pol-dh';
  });
  await step('search finds a record and opens it', async () => {
    await page.locator('#vsearch').click();
    await page.locator('#ao-layer input[type=search]').fill('unit 09');
    await page.locator('#ao-layer .row[data-go="rec/vehicle/v-tk-09"]').click();
    return (await page.evaluate(() => window.AIO_REVIEW.state().route)) === 'rec/vehicle/v-tk-09';
  });
  await step('client switch carries the context into a lane', async () => {
    await page.evaluate(() => window.AIO_REVIEW.go('work/insurance'));
    await page.evaluate(() => document.querySelector('#ao-screen [data-act="search"]') || null);
    await page.evaluate(() => window.AIO_REVIEW.go('client/c-dh'));
    await screen.locator('.row[data-go="work/insurance@c-dh"]').click();
    const st = await page.evaluate(() => window.AIO_REVIEW.state());
    const filtered = await screen.locator('.ctx').count();
    return st.route === 'work/insurance@c-dh' && filtered === 1;
  });
  await step('return-to-work appears after opening a record from a lane', async () => {
    await page.evaluate(() => window.AIO_REVIEW.go('work/dispatch'));
    await screen.locator('.card[data-go="rec/load/ld-5517"]').click();
    return (await screen.locator('.ret [data-go="work/dispatch"]').count()) === 1;
  });
  await step('phone quick actions sheet opens and closes', async () => {
    await page.evaluate(() => window.AIO_REVIEW.set({ device: 'phone' }));
    await page.evaluate(() => window.AIO_REVIEW.go('home'));
    await screen.locator('.head__plus').click();
    const open = await screen.locator('.sheet').count();
    await screen.locator('.sheet__x').click();
    return open === 1 && (await screen.locator('.sheet').count()) === 0;
  });
  await step('migration approval is founder-only and lands on PREBUILT, never ACTIVE', async () => {
    await page.evaluate(() => window.AIO_REVIEW.set({ device: 'desktop', role: 'founder' }));
    await page.evaluate(() => window.AIO_REVIEW.go('intake/case/mig-sr'));
    await screen.locator('.acts__i[data-sim="mig-approve"]').click();
    await page.locator('#ao-layer [data-act="sim-confirm"]').click();
    const life = await screen.locator('.steps .is-on').first().innerText();
    await page.evaluate(() => window.AIO_REVIEW.set({ role: 'staff' }));
    await page.evaluate(() => window.AIO_REVIEW.go('intake/case/mig-bl'));
    const staffApprove = await screen.locator('[data-sim="mig-approve"]').count();
    return /PREBUILT/.test(life) && staffApprove === 0;
  });
  if (errors.length) fail('error', 'journeys/interactions', errors.join(' | '));
  await page.close();
}

/* screenshots for the review package */
if (SHOTS) {
  mkdirSync(SHOTS, { recursive: true });
  const SET = [
    ['01-home', 'home'], ['02-intake', 'intake'], ['03-intake-flow', 'intake/flow/existing/4'], ['04-intake-case', 'intake/case/mig-sr'],
    ['05-work', 'work'], ['06-filing-ifta', 'work/filing'], ['07-compliance', 'work/compliance'], ['08-vehicles', 'work/vehicles'], ['09-dispatch', 'work/dispatch'],
    ['10-brokerage-paused', 'work/brokerage'], ['11-record-policy', 'rec/policy/pol-dh'], ['12-record-vehicle', 'rec/vehicle/v-tk-09'], ['13-client-360', 'client/c-dh'],
    ['14-reports-clients', 'reports/clients'], ['15-more-billing', 'more/billing'], ['16-roadready', 'rec/profile/rr-hf'],
  ];
  const WIDE_SET = ['01-home', '05-work', '06-filing-ifta', '09-dispatch', '13-client-360', '14-reports-clients'];
  for (const d of ['phone', 'tablet', 'desktop', 'wide']) {
    const { page } = await openPage(d, 'founder');
    for (const [name, route] of SET) {
      if (d === 'wide' && !WIDE_SET.includes(name)) continue;
      await page.evaluate((r) => window.AIO_REVIEW.go(r), route);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r))))));
      await page.evaluate(() => window.AIO_REVIEW.full(true));
      const box = await page.locator('#ao-root').boundingBox();
      await page.setViewportSize({ width: Math.ceil(box.x + box.width + 40), height: Math.ceil(box.y + box.height + 40) });
      await page.locator('#ao-root').screenshot({ path: join(SHOTS, `${name}--${d}.jpg`), type: 'jpeg', quality: 78 });
      await page.setViewportSize({ width: Math.max(DEVICES[d][0] + 80, 1280), height: DEVICES[d][1] + 260 });
      await page.evaluate(() => window.AIO_REVIEW.full(false));
    }
    // staff views of the same office
    if (d === 'desktop' || d === 'phone') {
      await page.evaluate(() => window.AIO_REVIEW.set({ role: 'staff' }));
      for (const [name, route] of [['17-staff-reports', 'reports/clients'], ['18-staff-billing', 'more/billing'], ['19-staff-policy', 'rec/policy/pol-dh']]) {
        await page.evaluate((r) => window.AIO_REVIEW.go(r), route);
        await page.evaluate(() => window.AIO_REVIEW.full(true));
        const box = await page.locator('#ao-root').boundingBox();
        await page.setViewportSize({ width: Math.ceil(box.x + box.width + 40), height: Math.ceil(box.y + box.height + 40) });
        await page.locator('#ao-root').screenshot({ path: join(SHOTS, `${name}--${d}.jpg`), type: 'jpeg', quality: 78 });
        await page.setViewportSize({ width: Math.max(DEVICES[d][0] + 80, 1280), height: DEVICES[d][1] + 260 });
        await page.evaluate(() => window.AIO_REVIEW.full(false));
      }
    }
    await page.close();
  }
}

report.counts = {
  routes: Object.keys(report.pages).length,
  founderRoutes: founderRoutes.size,
  staffRoutes: staffRoutes.size,
  grantedRoutes: grantedRoutes.size,
  byStatus: Object.values(report.pages).reduce((m, p) => ((m[p.status] = (m[p.status] || 0) + 1), m), {}),
  failures: report.failures.length,
  journeys: `${report.journeys.filter((j) => j.pass).length}/${report.journeys.length}`,
  interactions: `${report.interactions.filter((j) => j.pass).length}/${report.interactions.length}`,
};
writeFileSync(join(DIR, 'qa-report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.counts, null, 1));
const byKind = report.failures.reduce((m, f) => ((m[f.kind] = (m[f.kind] || 0) + 1), m), {});
console.log('failures by kind', byKind);
for (const f of report.failures.slice(0, 40)) console.log(`  ${f.kind} · ${f.where} · ${String(f.detail).slice(0, 220)}`);
await browser.close();
server.close();
process.exit(report.failures.length ? 1 : 0);
