/**
 * QA for the AIO PUBLIC WEBSITE design review: every page of the recovered tree at the small phone (360 × 800), phone
 * (390 × 844), tablet (834 × 1194), tablet landscape (1194 × 834), desktop (1440 × 900) and ultra-wide (2560 × 1440) — draws without errors, no sideways scroll, every letter uppercase, no type under 9 px,
 * single-line parts on one line, nothing clipped, images loaded, every link lands on a designed page, every control has a
 * handler — then the interactions (menus, search, drawer, filters, finder, the get-started flow, forms, Brokerage paused,
 * reduced motion), the honesty rules (no prices, counts, rates or the retired identity), and the review shell. Writes a
 * first-screen render of every page except the generated service pages (and of the representative ones) at each size.
 *
 *   node design-authority/aio-public/qa.mjs <dist> [outDir]
 *     outDir  default: AIO_PUBLIC_MIGRATION_READINESS (repository root) — screens/, qa-summary.json
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
const OUT = resolve(process.argv[3] || join(APP, '..', 'AIO_PUBLIC_MIGRATION_READINESS'));
const { chromium } = await import(join(APP, 'node_modules/playwright/index.mjs'));
const TYPES = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
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
const BASE = `http://127.0.0.1:${srv.address().port}`;
const DEV = { s360: [360, 800], phone: [390, 844], tablet: [834, 1194], tabletL: [1194, 834], desktop: [1440, 900], wide: [2560, 1440] };
const SCREENS = join(OUT, 'screens');
rmSync(SCREENS, { recursive: true, force: true });
mkdirSync(SCREENS, { recursive: true });
const TMP = join(tmpdir(), `aio-pubqa-${process.pid}`);
mkdirSync(TMP, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail: ok ? '' : String(detail).slice(0, 600) }); if (!ok) console.log(`FAIL ${name} ${String(detail).slice(0, 300)}`); };
const jpg = (png, out, w) => execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert("RGB")\nw=int(sys.argv[3])\nif im.width>w: im=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)\nim.save(sys.argv[2],"JPEG",quality=80,optimize=True,progressive=True)', png, out, String(w)]);
async function site(dev, opts = {}) {
  const [w, h] = DEV[dev];
  const p = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' });
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(String(e.message)));
  p.on('console', (m) => m.type() === 'error' && p.errors.push(m.text()));
  await p.goto(`${BASE}/site.html`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await p.evaluate(() => document.fonts.ready);
  return p;
}
const settle = async (p) => {
  await p.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 2500)), Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))))]));
  await p.waitForTimeout(120);
  await p.evaluate(() => document.getAnimations().forEach((a) => a.effect?.getComputedTiming().endTime !== Infinity && a.finish()));
};

/** In the page: everything the rules forbid on the current page. */
function inspect() {
  const pub = document.getElementById('pub');
  const W = document.documentElement.clientWidth;
  const out = { sideways: document.documentElement.scrollWidth > W + 1 ? document.documentElement.scrollWidth : 0, lower: [], tiny: [], wraps: [], clipped: [], images: [], links: [], dead: [], unknown: [] };
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const walker = document.createTreeWalker(pub, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    const t = n.textContent.trim();
    if (!t || !n.parentElement || !vis(n.parentElement)) continue;
    const cs = getComputedStyle(n.parentElement);
    if (/[a-z]/.test(t) && cs.textTransform !== 'uppercase') out.lower.push(t.slice(0, 40));
    if (parseFloat(cs.fontSize) < 9) out.tiny.push(`${t.slice(0, 30)} ${cs.fontSize}`);
  }
  for (const el of pub.querySelectorAll('input[placeholder], textarea[placeholder]')) if (/[a-z]/.test(el.placeholder) && getComputedStyle(el).textTransform !== 'uppercase') out.lower.push(el.placeholder);
  for (const el of pub.querySelectorAll('.btn, .chip, .nav__a, .link, .rv-tag, .crumbs a, .svc__go, .plan__flag, .screen__tag, .eco__lbl b, .step__n, .st__dot')) {
    if (!vis(el)) continue;
    // the text's own line boxes only (an icon beside the words is not a second line)
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const tops = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      if (!tw.currentNode.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(tw.currentNode);
      for (const r of range.getClientRects()) if (r.width > 1) tops.push(r.top);
    }
    const lines = tops.sort((x, y) => x - y).filter((t, i, a) => i === 0 || t - a[i - 1] > fs * 0.6).length;
    if (lines > 1) out.wraps.push(el.textContent.trim().slice(0, 40));
  }
  for (const el of pub.querySelectorAll('*')) {
    if (!vis(el) || !el.textContent.trim()) continue;
    const cs = getComputedStyle(el);
    if (['hidden', 'clip'].includes(cs.overflowX) && el.scrollWidth > el.clientWidth + 2 && !el.matches('.pub, .pub-wrap, .hero, .phero, .eco, .ready, .close, .path, .photo, .pop--mega, .rv-frame, .sr')) out.clipped.push(`${el.className} "${el.textContent.trim().slice(0, 30)}"`);
  }
  for (const img of pub.querySelectorAll('img')) if (vis(img) && (!img.complete || !img.naturalWidth)) out.images.push(img.getAttribute('src'));
  for (const el of pub.querySelectorAll('[style*="url("]')) {
    const m = el.getAttribute('style').match(/url\(([^)]+)\)/);
    if (m) out.images.push(`BG:${m[1]}`);
  }
  for (const a of pub.querySelectorAll('a[href^="#/"]')) out.links.push(a.getAttribute('href').slice(1));
  for (const b of pub.querySelectorAll('button')) if (!b.dataset.a && b.getAttribute('aria-disabled') !== 'true' && !b.disabled) out.dead.push(b.outerHTML.slice(0, 80));
  for (const b of pub.querySelectorAll('[data-a]')) if (!(b.dataset.a in ACT)) out.unknown.push(b.dataset.a);
  out.images = out.images.filter((x) => !x.startsWith('BG:'));
  out.bg = [...new Set([...pub.querySelectorAll('[style*="url("]')].map((el) => el.getAttribute('style').match(/url\(([^)]+)\)/)?.[1]).filter(Boolean))];
  return out;
}

/* ── 1 · every page at every size ── */
const tree = await (async () => { const p = await site('desktop'); const t = await p.evaluate(() => window.AIO_PUB.tree()); await p.close(); return t; })();
const REP = ['/services/trip-permits', '/services/usdot-registration', '/services/commercial-auto-liability', '/services/freight-quote', '/services/bookkeeping-essentials'];
const SHOOT = (path, group) => group !== 'SERVICE PAGES' || REP.includes(path);
const allLinks = new Set();
const allBg = new Set();
for (const dev of process.env.QA_SKIP_PAGES ? [] : Object.keys(DEV)) {
  const p = await site(dev);
  const bad = { lower: [], tiny: [], wraps: [], clipped: [], sideways: [], images: [], dead: [], unknown: [], errors: [], fourofour: [] };
  for (const [path, , group] of tree) {
    await p.evaluate((x) => window.AIO_PUB.go(x), path);
    await p.evaluate(() => window.AIO_PUB.capture(true));
    await settle(p);
    const r = await p.evaluate(inspect);
    r.links.forEach((l) => allLinks.add(l));
    r.bg.forEach((b) => allBg.add(b));
    if (r.sideways) bad.sideways.push(`${path} ${r.sideways}`);
    for (const k of ['lower', 'tiny', 'wraps', 'clipped', 'images', 'dead', 'unknown']) if (r[k].length) bad[k].push(`${path}: ${r[k].slice(0, 3).join(' | ')}`);
    if (path !== '/not-found' && (await p.evaluate(() => !!document.querySelector('#pub-main h1')?.textContent.includes('THIS ROAD DOESN')))) bad.fourofour.push(path);
    if (p.errors.length) { bad.errors.push(`${path}: ${p.errors.join(' | ')}`); p.errors.length = 0; }
    if (SHOOT(path, group)) {
      const png = join(TMP, 's.png');
      await p.screenshot({ path: png });
      jpg(png, join(SCREENS, `${path.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'}--${dev}.jpg`), dev === 'wide' ? 1600 : DEV[dev][0]);
    }
  }
  const n = tree.length;
  check(`pages · ${dev} · all ${n} pages draw without errors`, !bad.errors.length, bad.errors.join(' ; '));
  check(`pages · ${dev} · every page is a designed page (none fall to 404)`, !bad.fourofour.length, bad.fourofour.join(' '));
  check(`pages · ${dev} · no sideways scroll`, !bad.sideways.length, bad.sideways.join(' ; '));
  check(`text · ${dev} · every letter uppercase`, !bad.lower.length, bad.lower.join(' ; '));
  check(`text · ${dev} · nothing under 9 px`, !bad.tiny.length, bad.tiny.join(' ; '));
  check(`text · ${dev} · buttons, chips, tabs and links stay on one line`, !bad.wraps.length, bad.wraps.join(' ; '));
  check(`text · ${dev} · nothing clipped by its box`, !bad.clipped.length, bad.clipped.join(' ; '));
  check(`pages · ${dev} · every image loads`, !bad.images.length, bad.images.join(' ; '));
  check(`controls · ${dev} · every button has a handler (or says it is disabled)`, !bad.dead.length && !bad.unknown.length, [...bad.dead, ...bad.unknown].join(' ; '));
  await p.close();
}
{
  const p = await site('desktop');
  const paths = new Set(tree.map(([x]) => x));
  const off = [...allLinks].filter((l) => { const base = l.split('?')[0].split('#')[0]; return !paths.has(base) && !base.startsWith('/request/confirmation/') && !base.startsWith('/quote/'); });
  check(`links · all ${allLinks.size} internal links land on a page of the tree`, !off.length, off.join(' '));
  const missing = [];
  for (const b of allBg) if (!(await p.evaluate(async (u) => (await fetch(u)).ok, b))) missing.push(b);
  check(`images · all ${allBg.size} photographs behind the pages exist`, !missing.length, missing.join(' '));
  await p.close();
}

/* ── 2 · honesty: no prices, client counts, success rates, testimonials or the retired identity ── */
{
  const p = await site('desktop');
  const text = [];
  for (const [path] of tree) { await p.evaluate((x) => window.AIO_PUB.go(x), path); text.push(await p.evaluate(() => document.getElementById('pub').innerText)); }
  const all = text.join('\n');
  check('honesty · no price on any page', !/\$\s?\d/.test(all), all.match(/.{0,40}\$\s?\d.{0,20}/)?.[0]);
  check('honesty · no client counts, approval rates or round-the-clock claims', !/2,500|98%|24\/7|CLIENTS SERVED|APPROVAL SUCCESS|MOST CHOSEN|MOST POPULAR|BANK-LEVEL/i.test(all), all.match(/.{0,30}(2,500|98%|24\/7|CLIENTS SERVED).{0,30}/i)?.[0]);
  check('honesty · no testimonials or reviews', !/TESTIMONIAL|★|5 STARS|REVIEWS FROM/i.test(all), '');
  check('honesty · the retired identity never appears (Perfect Choice, Frontal Slayer)', !/PERFECT CHOICE|FRONTAL SLAYER/i.test(all), '');
  check('honesty · the brand lines are the founder’s: tagline, positioning, promise', all.includes('WHERE BUSINESS MEETS THE ROAD.') && all.includes('THE BUSINESS OFFICE BEHIND THE TRUCK.') && all.includes('TO EVERY MILE AFTER.'), '');
  const data = await p.evaluate(() => window.AIO_PUB.data());
  check(`honesty · every service shows its status from the matrices (${data.services.length} services)`, data.services.every((s) => s.state), '');
  check('honesty · placeholders are labelled, not shown as contact details', !/\(866\) 000|\.example/i.test(all) && /TO BE CONFIRMED/.test(all), '');
  await p.close();
}

/* ── 3 · Brokerage stays paused ── */
{
  const p = await site('desktop');
  await p.evaluate(() => window.AIO_PUB.go('/services/brokerage'));
  const r = await p.evaluate(() => ({ chip: !!document.querySelector('#pub .chip--paused'), banner: document.querySelector('#pub .paused')?.innerText || '', start: [...document.querySelectorAll('#pub a[href^="#/get-started"]')].filter((a) => !a.closest('.nav, .close, .foot')).length, disabled: document.querySelectorAll('#pub [aria-disabled="true"]').length }));
  check('brokerage · shown as PAUSED, its start actions disabled, no route into get-started from the page', r.chip && /PAUSED/.test(r.banner) && r.start === 0 && r.disabled >= 1, JSON.stringify(r));
  await p.evaluate(() => window.AIO_PUB.go('/services/freight-quote'));
  const q = await p.evaluate(() => ({ chip: document.querySelector('#pub .facts .chip')?.textContent, start: !!document.querySelector('#pub .phero__ctas a[href^="#/get-started"]') }));
  check('brokerage · a freight service page says PAUSED and offers no start', q.chip === 'PAUSED' && !q.start, JSON.stringify(q));
  await p.close();
}

/* ── 4 · interactions ── */
{
  const p = await site('desktop');
  await p.click('#pub [data-v="services"]');
  check('nav · SERVICES opens the mega menu with all seven families', (await p.locator('#pub .pop--mega h4').count()) === 7, await p.locator('#pub .pop--mega h4').count());
  await p.keyboard.press('Escape');
  check('nav · Esc closes the menu', (await p.locator('#pub .pop').count()) === 0, '');
  await p.click('#pub [data-v="solutions"]');
  const sol = await p.locator('#pub .pop--list .pop__item').count();
  await p.click('#pub .pop--list .pop__item >> nth=1');
  check('nav · SOLUTIONS opens, and a choice opens its page (ROAD READY™)', sol === 5 && (await p.evaluate(() => window.AIO_PUB.state().path)) === '/road-ready', sol);
  await p.click('#pub [data-a="search"]');
  await p.keyboard.type('ifta');
  const hits = await p.locator('#pub .search__hit').allInnerTexts();
  check('search · typing IFTA finds the IFTA services', hits.some((h) => /IFTA FILING/.test(h)) && hits.some((h) => /IFTA REGISTRATION/.test(h)), hits.join(' / '));
  await p.click('#pub .search__hit >> nth=0');
  check('search · a result opens its page and closes the search', (await p.evaluate(() => window.AIO_PUB.state().path)).startsWith('/services/') && (await p.locator('#pub .search').count()) === 0, '');
  await p.evaluate(() => window.AIO_PUB.go('/'));
  await p.click('#pub [data-a="jump"][data-v="begin"]');
  await p.waitForTimeout(1700);
  check('home · SEE HOW IT WORKS scrolls to WHICH ONE ARE YOU (start · operate · maintain)', await p.evaluate(() => { const r = document.getElementById('begin').getBoundingClientRect(); return r.top < 200 && r.top > -50; }), '');
  await p.click('#pub [data-a="pathSel"][data-v="2"]');
  check('home · the WHAT CAN WE HELP YOU DO selector shows the chosen road (RUN MY OPERATION) with its services', await p.evaluate(() => /RUN MY OPERATION/.test(document.querySelector('#pub .explore__panel h3').innerText) && document.querySelectorAll('#pub .explore__svcs a').length >= 3), '');
  await p.click('#pub [data-a="eco"][data-v="1"]');
  check('home · choosing OPERATE shows that stage and its first step (WHERE TO BEGIN)', await p.evaluate(() => { const on = document.querySelector('#pub .stage.is-on'); return !!on && /OPERATE/.test(on.innerText) && !!on.querySelector('.begin a.btn'); }), '');
  await p.click('#pub .stage.is-on .fam >> nth=0');
  check('home · a service family on the road opens its page', (await p.evaluate(() => window.AIO_PUB.state().path)) !== '/', '');
  await p.evaluate(() => window.AIO_PUB.go('/services'));
  const all = await p.locator('#pub .idx__rows a').count();
  const fams = await p.locator('#pub .idx__fam').count();
  await p.click('#pub [data-a="fam"][data-v="move-freight"]');
  const fr = await p.locator('#pub .svc').count();
  await p.fill('#pub [data-input="fq"]', 'quote');
  const q = await p.locator('#pub [data-slot="svcs"] .svc').count();
  check('services · the catalog index lists every service by family; a family narrows it to cards, the filter narrows again', fams === 7 && all === (await p.evaluate(() => window.AIO_PUB.data().services.length)) && fr === 4 && q === 1, `${fams} families · ${all} → ${fr} → ${q}`);
  await p.evaluate(() => window.AIO_PUB.go('/services/permitting'));
  const first = await p.evaluate(() => document.querySelector('#pub .sx__panel h3').innerText);
  await p.click('#pub .sx__row >> nth=5');
  const picked = await p.evaluate(() => ({ h: document.querySelector('#pub .sx__panel h3').innerText, row: document.querySelectorAll('#pub .sx__row')[5].innerText }));
  check('family · picking a service on the left shows it on the right (who it is for, what you provide, next step)', picked.h !== first && picked.row.includes(picked.h) && (await p.locator('#pub .sx__panel .sx__cols > div').count()) >= 1, JSON.stringify({ first, ...picked }));
  await p.evaluate(() => window.AIO_PUB.go('/services/trip-permits'));
  const sv = await p.evaluate(() => ({ nav: document.querySelectorAll('#pub .subnav button').length, who: !!document.querySelector('#pub #sv-who'), provide: document.querySelectorAll('#pub #sv-provide li').length, steps: document.querySelectorAll('#pub #sv-how .step').length, after: !!document.querySelector('#pub #sv-after'), faq: document.querySelectorAll('#pub #sv-faq details').length }));
  check('service · the page answers who, what you provide, how, after and questions, with an ON THIS PAGE bar', sv.nav === 6 && sv.who && sv.provide >= 1 && sv.steps >= 3 && sv.after && sv.faq >= 1, JSON.stringify(sv));
  await p.click('#pub .subnav button[data-v="sv-faq"]');
  await p.waitForTimeout(1600);
  check('service · ON THIS PAGE jumps to the section', await p.evaluate(() => { const r = document.getElementById('sv-faq').getBoundingClientRect(); return r.top < 260 && r.top > -40; }), '');
  await p.click('#pub [data-a="plan"]');
  const inPlan = await p.evaluate(() => window.AIO_PUB.state().plan);
  await p.evaluate(() => window.AIO_PUB.go('/service-plan'));
  check('service · ADD TO MY PLAN (the live service plan) puts the service in MY SERVICE PLAN', inPlan.includes('trip-permits') && /TRIP PERMITS/.test(await p.locator('#pub .list').first().innerText()), JSON.stringify(inPlan));
  await p.evaluate(() => window.AIO_PUB.go('/roadmap'));
  await p.click('#pub .guide__tabs button >> nth=3');
  check('guide · the compliance guide shows one family at a time', await p.evaluate(() => document.querySelectorAll('#pub .guide__tabs [aria-selected="true"]').length === 1 && document.querySelectorAll('#pub .guide__tabs button')[3].getAttribute('aria-selected') === 'true'), '');
  await p.evaluate(() => window.AIO_PUB.go('/start-your-business'));
  await p.click('#pub .rail--pick .st >> nth=3');
  check('journey · picking a stage of Start Your Business shows it in place (REGISTER)', /REGISTER/.test(await p.locator('#pub .journey h3').innerText()), '');
  await p.evaluate(() => window.AIO_PUB.go('/services/find'));
  await p.click('#pub [data-a="need"][data-v="getting-authority"]');
  const rec = await p.locator('#pub aside .row').allInnerTexts();
  check('finder · choosing GETTING MY AUTHORITY recommends USDOT, MC and BOC-3', rec.length === 3 && /USDOT/.test(rec.join()), rec.join(' / '));
  await p.evaluate(() => window.AIO_PUB.go('/get-started'));
  await p.click('#pub [data-a="gsNext"]', { force: true }); // drawn disabled until the required goal is chosen; pressing it explains why
  check('get started · CONTINUE asks for the required answer first', (await p.locator('#pub .toast').count()) === 1 && (await p.evaluate(() => window.AIO_PUB.state().gs.step)) === 0, '');
  await p.click('#pub [data-a="gsGoal"][data-v="move_freight"]', { force: true });
  check('get started · the MOVE FREIGHT goal is shown PAUSED and cannot be chosen (Brokerage paused)', (await p.evaluate(() => window.AIO_PUB.state().gs.goal)) === '' && (await p.locator('#pub .choice--off .chip--paused').count()) === 1, '');
  await p.click('#pub [data-a="gsGoal"][data-v="start_business"]');
  const flow = await p.evaluate(() => window.AIO_PUB.data().intake.flows.start_business);
  const seen = [];
  for (let i = 0; i < flow.length; i++) {
    seen.push(await p.evaluate(() => document.querySelector('#pub .gs-main .eyebrow').innerText));
    if (i === 1) await p.click('#pub [data-a="gsAns"] >> nth=0');
    if (i < flow.length - 1) await p.click('#pub [data-a="gsNext"]');
  }
  await p.click('#pub a[href="#/roadmap/results"]');
  check(`get started · the live Smart Intake, section by section (${flow.length} for START MY TRUCKING BUSINESS), ends at the roadmap`, flow.length === 7 && seen[6].startsWith('STEP 7 OF 7') && (await p.evaluate(() => window.AIO_PUB.state().path)) === '/roadmap/results', seen.join(' / '));
  await p.evaluate(() => window.AIO_PUB.go('/contact'));
  await p.click('#pub [data-a="send"]');
  check('forms · sending says NOTHING WAS SENT (design review)', /NOTHING WAS SENT/.test(await p.locator('#pub .sent').innerText()), '');
  await p.evaluate(() => window.AIO_PUB.go('/login'));
  check('account · log in has no site header (focused), and links to forgot password and create account', (await p.locator('#pub .nav').count()) === 0 && (await p.locator('#pub a[href="#/forgot-password"]').count()) === 1 && (await p.locator('#pub a[href="#/signup"]').count()) === 1, '');
  check('interactions · no errors on desktop', !p.errors.length, p.errors.join(' | '));
  await p.close();
}
{
  const p = await site('phone');
  await p.click('#pub [data-a="drawer"]');
  await p.click('#pub [data-a="grp"][data-v="services"]');
  const n = await p.locator('#pub .drawer__sub a').count();
  await p.click('#pub .drawer__sub a >> nth=2');
  check('phone · the menu opens, SERVICES lists all families, a choice navigates and closes it', n === 8 && (await p.locator('#pub .drawer').count()) === 0 && (await p.evaluate(() => window.AIO_PUB.state().path)) !== '/', n);
  await p.evaluate(() => window.AIO_PUB.go('/'));
  const snap = await p.evaluate(() => { const el = document.querySelector('#pub .paths'); return getComputedStyle(el).scrollSnapType + ' ' + (el.scrollWidth > el.clientWidth); });
  check('phone · the four pathways swipe sideways (snap), inside their row only', /x mandatory true/.test(snap) && (await p.evaluate(() => document.documentElement.scrollWidth)) <= 390, snap);
  await p.click('#pub [data-a="eco"][data-v="2"]');
  check('phone · START / OPERATE / MAINTAIN switch the stage', await p.evaluate(() => document.querySelectorAll('#pub .stage.is-on').length === 1 && document.querySelectorAll('#pub .stage')[2].classList.contains('is-on')), '');
  await p.evaluate(() => window.AIO_PUB.go('/services/permitting'));
  const c6 = await p.locator('#pub .sx-phone .svc').count();
  await p.click('#pub .sx-more');
  const cAll = await p.locator('#pub .sx-phone .svc').count();
  check('phone · a long family shows six services, then SHOW ALL opens the rest in place', c6 === 6 && cAll > 6, `${c6} → ${cAll}`);
  await p.evaluate(() => window.AIO_PUB.go('/'));
  check('phone · the first screen shows the truck, the headline and GET STARTED', await p.evaluate(() => { const h = document.querySelector('#pub .hero__h1--phone').getBoundingClientRect(); const g = document.querySelector('#pub .nav__start-sm').getBoundingClientRect(); return h.bottom < 844 && h.height > 60 && g.width > 0; }), '');
  check('interactions · no errors on the phone', !p.errors.length, p.errors.join(' | '));
  await p.close();
}

/* ── 5 · motion: cinematic, controlled, off for reduced motion ── */
{
  const p = await site('desktop');
  const css = await p.evaluate(() => [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].map((r) => r.cssText); } catch { return []; } }).join('\n')); // the hosted font sheet is cross-origin
  check('motion · nothing loops', !/infinite/.test(css), '');
  check('motion · the hero settles in once (photo and words), under two seconds', await p.evaluate(() => { const a = document.querySelector('#pub .hero__img').getAnimations()[0]; return !!a && a.effect.getComputedTiming().duration <= 2000 && a.effect.getComputedTiming().iterations === 1; }), '');
  await p.evaluate(() => window.AIO_PUB.go('/'));
  const before = await p.evaluate(() => document.querySelectorAll('#pub .rv:not(.in)').length);
  await p.evaluate(() => document.scrollingElement.scrollTo(0, document.scrollingElement.scrollHeight));
  await p.waitForTimeout(600);
  const after = await p.evaluate(() => document.querySelectorAll('#pub .rv.in').length);
  check('motion · sections rise into view once as they arrive', before > 5 && after > 0, `${before} hidden → ${after} shown`);
  await p.close();
  const r = await site('desktop', { reduced: true });
  await r.evaluate(() => window.AIO_PUB.go('/'));
  const rm = await r.evaluate(() => ({ hidden: [...document.querySelectorAll('#pub .rv')].filter((e) => getComputedStyle(e).opacity !== '1').length, hero: document.querySelector('#pub .hero__img').getAnimations().map((a) => a.effect.getComputedTiming().duration) }));
  check('motion · reduced motion shows everything at once (no rising, no hero zoom, no panel fades)', rm.hidden === 0 && rm.hero.length === 0, JSON.stringify(rm));
  await r.close();
}

/* ── 6 · the review shell ── */
const MIG_ROWS = existsSync(join(APP, 'docs/aio/public-migration/PUBLIC_MIGRATION.json')) ? JSON.parse((await import('node:fs')).readFileSync(join(APP, 'docs/aio/public-migration/PUBLIC_MIGRATION.json'), 'utf8')).inventory.length : -1;
{
  const p = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`${BASE}/local.html`);
  await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  check('review · it opens on START HERE: A, B, C, then the connected site', (await p.evaluate(() => window.AIO_PUBREV.state().view)) === 'start' && (await p.locator('.rv-startcard').count()) === 4, '');
  await p.click('[data-tab="a"]');
  const a = await p.evaluate(() => ({ rows: document.querySelectorAll('.rv-row').length, issues: document.querySelectorAll('.rv-issue').length, figs: [...document.querySelectorAll('.rv-figs img')].filter((i) => i.complete && i.naturalWidth).length, cls: document.querySelectorAll('.rv-row .rv-cls').length }));
  check('review · A lists every capability with its fate, the eight issues and the current-app captures', a.rows === MIG_ROWS && a.issues === 8 && a.figs >= 6 && a.cls >= a.rows, JSON.stringify(a));
  await p.click('[data-tab="b"]');
  await p.waitForTimeout(300);
  const b = await p.evaluate(() => ({ sets: document.querySelectorAll('.rv-bset').length, imgs: [...document.querySelectorAll('.rv-bset img')].filter((i) => i.complete && i.naturalWidth).length }));
  check('review · B shows six pages at phone · tablet · desktop · ultra-wide', b.sets === 6 && b.imgs === 24, JSON.stringify(b));
  await p.click('.rv-bfig--tablet >> nth=1');
  check('review · a B picture opens that page live in that frame', (await p.evaluate(() => window.AIO_PUBREV.state())).dev === 'tablet' && (await p.evaluate(() => window.AIO_PUBREV.state())).path === '/services/permitting', JSON.stringify(await p.evaluate(() => window.AIO_PUBREV.state())));
  await p.click('[data-tab="c"]');
  await p.waitForTimeout(300);
  const c = await p.evaluate(() => ({ rows: document.querySelectorAll('.rv-crow:not(.rv-crow--h)').length, strips: [...document.querySelectorAll('.rv-strips img')].filter((i) => i.complete && i.naturalWidth).length }));
  check('review · C shows the before → after lengths and the before/after pages', c.rows >= 8 && c.strips === 8, JSON.stringify(c));
  await p.click('[data-tab="overview"]');
  const groups = await p.evaluate(() => window.AIO_PUBREV.groups().map((g) => g.pages.length));
  check('review · THE CONNECTED SITE shows the five curated groups as cards', (await p.locator('.rv-grp').count()) === 5 && (await p.locator('.rv-card').count()) === groups.reduce((a, b) => a + b, 0), groups.join(','));
  await p.click('.rv-card >> nth=0');
  check('review · a card opens the page in the device frame', (await p.evaluate(() => window.AIO_PUBREV.state().view)) === 'work', '');
  for (const [d, w] of [['s360', 360], ['phone', 390], ['tablet', 834], ['tabletL', 1194], ['desktop', 1440], ['wide', 2560]]) {
    await p.click(`[data-dev="${d}"]`);
    const fw = await p.evaluate(() => parseFloat(document.getElementById('rv-device').style.width));
    const inner = await p.evaluate(() => document.getElementById('pub').getBoundingClientRect().width / (document.getElementById('rv-device').getBoundingClientRect().width / parseFloat(document.getElementById('rv-device').style.width)));
    check(`review · ${d} frame is ${w} wide and the site composes at ${w}`, fw === w && Math.abs(inner - w) < 2, `${fw} ${inner}`);
  }
  await p.click('[data-dev="desktop"]');
  check('review · the homepage shows panel 04 beside it', (await p.locator('#rv-ref img[src*="panel-04"]').count()) === 1, '');
  await p.click('[data-ref]');
  check('review · the reference can be put away', await p.locator('#rv-ref').isHidden(), '');
  await p.click('[data-step="1"]').catch(() => {});
  await p.click('[data-tab="g:family"]');
  await p.click('.rv-card >> nth=1');
  await p.click('[data-ref]'); // put back after the check above
  check('review · a service page shows the approved IFTA public page beside it', (await p.locator('#rv-ref img[src*="ifta-public"]').count()) === 1, '');
  await p.click('#pub a[href="#/services"] >> nth=0');
  check('review · clicking inside the site navigates inside the frame', (await p.evaluate(() => window.AIO_PUBREV.state().path)) === '/services', '');
  await p.click('[data-tab="tree"]');
  const rows = await p.locator('.rv-tree button').count();
  check(`review · the page tree lists every page (${rows})`, rows === tree.length, `${rows} vs ${tree.length}`);
  await p.click('[data-tab="reference"]');
  check('review · reference & recovery shows the brand board, the IFTA authority and what was not found', (await p.locator('.rv-recov img').count()) === 2 && /13-SCREEN/.test(await p.locator('.rv-box').innerText()), '');
  check('review · no errors', !errs.length, errs.join(' | '));
  await p.close();
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(`${BASE}/local.html#/@phone`);
  await m.waitForFunction(() => document.documentElement.dataset.ready === '1');
  check('review · at 390 the review has no sideways scroll and opens on the phone frame', (await m.evaluate(() => document.documentElement.scrollWidth)) <= 390 && (await m.evaluate(() => window.AIO_PUBREV.state().dev)) === 'phone', await m.evaluate(() => document.documentElement.scrollWidth));
  await m.close();
}

await browser.close();
srv.close();
rmSync(TMP, { recursive: true, force: true });
const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
writeFileSync(join(OUT, 'qa-summary.json'), JSON.stringify({ pages: tree.length, devices: Object.keys(DEV), pass, fail, results }, null, 1));
console.log(`public qa: ${pass}/${results.length} passed · ${tree.length} pages × ${Object.keys(DEV).length} sizes`);
process.exit(fail ? 1 : 0);
