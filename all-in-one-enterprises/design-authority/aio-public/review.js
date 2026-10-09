/*
 * AIO PUBLIC WEBSITE — the founder review. The site (site.js) is mounted once inside a device frame and keeps running;
 * the review only changes the frame (phone 390 · tablet 834 · desktop 1440 · ultra-wide 2560), the page, and what sits
 * beside it (the founder reference the page is held to, where one exists).
 */
const RV_DEV = { phone: [390, 844, 'PHONE'], tablet: [834, 1194, 'TABLET'], desktop: [1440, 900, 'DESKTOP'], wide: [2560, 1440, 'ULTRA-WIDE'] };
const RV_GROUPS = [
  { id: 'home', no: '1', name: 'HOMEPAGE', line: 'HELD TO THE FOUNDER BRAND BOARD · PANEL 04 · WEBSITE HOMEPAGE EXPRESSION', pages: ['/'] },
  { id: 'family', no: '2', name: 'SERVICE FAMILY', line: 'HELD TO THE APPROVED IFTA PUBLIC PAGE · HUB · SERVICE · PLANS · PARTNER · PAUSED', pages: ['/services/permitting', '/services/trip-permits', '/services/bookkeeping', '/services/insurance', '/services/brokerage', '/services/ifta-filing'] },
  { id: 'services', no: '3', name: 'SERVICES & PRODUCTS', line: 'DIRECTORY · FINDER · FORMATION · DISPATCH · FACTORING · FLEETCARE · DRIVERLINK', pages: ['/services', '/services/find', '/services/business-formation', '/services/dispatching', '/services/factoring', '/services/fleetcare', '/services/driverlink'] },
  { id: 'journeys', no: '4', name: 'SOLUTIONS & GET STARTED', line: 'START YOUR BUSINESS · ROAD READY · CLIENT PORTAL · CHECK WHAT I NEED · REQUEST', pages: ['/start-your-business', '/start-your-business/register', '/road-ready', '/roadmap', '/client-portal', '/get-started', '/roadmap/results', '/service-plan', '/request/submit', '/request/confirmation/req-sample'] },
  { id: 'company', no: '5', name: 'COMPANY & ACCOUNT', line: 'ABOUT · CONTACT · CALLBACK · SCHEDULE · LOG IN · CREATE ACCOUNT · 404', pages: ['/about', '/contact', '/request-callback', '/schedule', '/login', '/signup', '/forgot-password', '/onboarding', '/not-found'] },
];
const RV = { view: 'overview', group: 'home', dev: 'desktop', ref: true };
const $ = (id) => document.getElementById(id);
const nameOf = (p) => (TREE.find((t) => t[0] === p) || [p, p.toUpperCase()])[1];
const groupOf = (p) => RV_GROUPS.find((g) => g.pages.includes(p));
const slugOf = (p) => p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
const REF = {
  home: {
    img: 'reference/panel-04-homepage.jpg',
    cap: '<b>FOUNDER BRAND DNA BOARD · PANEL 04</b> · WEBSITE HOMEPAGE EXPRESSION · CROP FOR COMPARISON (THE BOARD IS THE AUTHORITY, NOT A PRODUCTION ASSET)',
    same: ['NAV: SIMPLE MARK · SERVICES · SOLUTIONS · ABOUT · RESOURCES · CONTACT · SEARCH · CLIENT LOGIN · GET STARTED', 'EYEBROW, TWO-TONE HEADLINE, TAGLINE AND BODY — THE PANEL’S WORDS, VERBATIM', 'CINEMATIC DUSK TRUCK RIGHT, WORDS LEFT, ONE GOLD CALL TO ACTION', 'THE BAND BELOW: TRUSTED PARTNER · INDUSTRY EXPERIENCE · NATIONWIDE SUPPORT · BUILT FOR YOUR GROWTH'],
    diff: ['STATS REPLACED: 2,500+ CLIENTS · 98% APPROVAL · 50 STATES · 24/7 ARE UNVERIFIED — THE BAND SHOWS PRODUCT FACTS INSTEAD', 'WATCH OUR STORY → SEE HOW IT WORKS: NO BRAND FILM EXISTS', 'THE TRUCK IS THE FOUNDER’S APPROVED BLACK-TRUCK MASTER, UNBRANDED — NO BRANDED BLACK-TRUCK PHOTOGRAPH EXISTS', 'HEADLINE TYPE IS INTER TIGHT — MONUMENT EXTENDED IS NOT LICENSED'],
  },
  family: {
    img: 'reference/ifta-public-authority.jpg',
    cap: '<b>APPROVED IFTA PUBLIC PAGE</b> · THE FOUNDER AUTHORITY FOR A PUBLIC SERVICE PAGE · THE FAMILY’S MODEL',
    same: ['PHOTO HERO: WORDS LEFT, ROAD RIGHT, ONE GOLD CALL TO ACTION', 'A RAIL OF FOUR FACTS OVERLAPPING THE HERO (HERE: STATUS · DELIVERY · PRICING · JURISDICTION)', 'A CLEAR PATH: COPY BESIDE A PHOTO CARD WITH THREE SHORT LINES', 'A FIVE-STEP PROCESS IN NUMBERED CARDS', 'MOUNTAIN BAND AND THE FULL LOCKUP AT THE FOOT'],
    diff: ['NO SAMPLE FIGURES IN THE RAIL — THE FACTS COME FROM THE CATALOG AND THE ACTIVATION MATRICES', 'PRICES ARE NOT SHOWN: NONE ARE APPROVED'],
  },
};

function shell() {
  $('rv').innerHTML = `
  <header class="rv-top"><div class="rv-brand"><img src="brand/aio-mark-on-dark.png" alt=""><div><b>AIO PUBLIC WEBSITE</b><span>DESIGN REVIEW · SAMPLE CONTENT · NOTHING IS LIVE OR DEPLOYED</span></div></div>
    <div class="rv-seg" role="group" aria-label="DEVICE" id="rv-devs"></div><a class="rv-btn" id="rv-full" target="_blank" rel="noopener" href="site.html">${ic('eye')} OPEN FULL SIZE</a></header>
  <nav class="rv-tabs" id="rv-tabs" aria-label="REVIEW"></nav>
  <main class="rv-main"><div id="rv-over"></div>
    <div id="rv-work" class="rv-work" hidden><div class="rv-bar" id="rv-bar"></div>
      <div class="rv-stage" id="rv-stage"><div class="rv-sizer" id="rv-sizer"><div class="rv-device" id="rv-device"><div class="rv-frame" id="rv-frame"><div id="pub"></div></div></div></div><aside class="rv-ref" id="rv-ref" hidden></aside></div>
    </div></main>`;
}
function chrome() {
  $('rv-devs').innerHTML = Object.entries(RV_DEV).map(([k, [w, , n]]) => `<button data-dev="${k}" aria-pressed="${RV.dev === k}">${n} ${w}</button>`).join('');
  const tabs = [['overview', 'OVERVIEW'], ...RV_GROUPS.map((g) => [`g:${g.id}`, `${g.no} · ${g.name}`]), ['tree', 'PAGE TREE'], ['reference', 'REFERENCE & RECOVERY']];
  const cur = RV.view === 'work' ? `g:${RV.group}` : RV.view;
  $('rv-tabs').innerHTML = tabs.map(([k, t]) => `<button class="rv-tab" data-tab="${k}" aria-current="${cur === k}">${t}</button>`).join('');
  $('rv-full').href = `site.html#${PUB.path}`;
}
function thumb(p) {
  const s = slugOf(p);
  const d = THUMBS.includes(`${s}--desktop.jpg`) ? `thumbs/${s}--desktop.jpg` : null;
  const m = THUMBS.includes(`${s}--phone.jpg`) ? `thumbs/${s}--phone.jpg` : null;
  return d ? `<span class="rv-shot" style="background-image:url(${d})">${m ? `<span class="rv-phone" style="background-image:url(${m})"></span>` : ''}</span>` : `<span class="rv-shot rv-shot--none"><b>${nameOf(p)}</b></span>`;
}
const tagOf = (p) => (p === '/services/ifta-filing' ? '<span class="rv-tag rv-tag--ok">APPROVED · UNCHANGED</span>' : p === '/services/brokerage' ? '<span class="rv-tag rv-tag--warn">PAUSED · NOT ACTIVATED</span>' : p === '/' ? '<span class="rv-tag rv-tag--gold">PANEL 04</span>' : '');
function overview() {
  const nPages = TREE.length;
  const nSvc = TREE.filter((t) => t[2] === 'SERVICE PAGES').length;
  return `<div class="rv-hero"><small>ALL IN ONE ENTERPRISES INC. · WHERE BUSINESS MEETS THE ROAD.</small><h1>THE PUBLIC WEBSITE — DARK, CINEMATIC, BRAND-LED.</h1>
    <p>THE RECOVERED PAGE TREE (${nPages} PAGES, ${nSvc} OF THEM SERVICE PAGES DRAWN FROM THE CANONICAL CATALOG), IN THE FOUNDER’S BRAND LANGUAGE. THE HOMEPAGE IS HELD TO PANEL 04 OF THE BRAND DNA BOARD; THE SERVICE FAMILY TO THE APPROVED IFTA PUBLIC PAGE. EVERY SERVICE SHOWS ITS REAL STATUS. NO PRICES, CLIENT COUNTS OR SUCCESS RATES — NONE ARE APPROVED. FORMS ARE DRAWN; NOTHING IS SENT. BROKERAGE STAYS PAUSED.</p>
    <div class="rv-flags"><span class="rv-flag rv-flag--ok"><i></i>FOUR SIZES COMPOSED</span><span class="rv-flag"><i></i>REDUCED MOTION RESPECTED</span><span class="rv-flag rv-flag--warn"><i></i>NOT DEPLOYED · LIVE SITE UNCHANGED</span></div></div>
    ${RV_GROUPS.map((g) => `<section class="rv-grp"><header><i>${g.no}</i><h2>${g.name}</h2><span>${g.line}</span></header><div class="rv-cards">${g.pages.map((p) => `<button class="rv-card" data-open="${p}">${thumb(p)}<span class="rv-card__t">${nameOf(p)}${tagOf(p)}</span><span class="rv-card__s">${p}</span></button>`).join('')}</div></section>`).join('')}`;
}
function tree() {
  const by = {};
  for (const t of TREE) (by[t[2]] ||= []).push(t);
  const row = ([p, n, , st]) => `<button data-open="${p}"><b>${n}</b><code>${p}</code>${st === 'APPROVED' ? '<span class="rv-tag rv-tag--ok">APPROVED · UNCHANGED</span>' : st === 'TOKEN' ? '<span class="rv-tag">PRIVATE LINK · SAMPLE</span>' : p === '/services/brokerage' ? '<span class="rv-tag rv-tag--warn">PAUSED</span>' : '<span class="rv-tag rv-tag--gold">DESIGNED</span>'}</button>`;
  return `<div class="rv-hero"><small>RECOVERED FROM SRC/ROUTES/AIOCORE­ROUTES.TSX · PUBLIC NAVIGATION · THE CANONICAL CATALOG</small><h1>THE PUBLIC PAGE TREE</h1><p>EVERY PUBLIC ROUTE OF THE LIVE SITE, DESIGNED. SERVICE PAGES ARE GENERATED FROM THE CATALOG, SO EVERY SERVICE HAS ITS PAGE AND ITS REAL STATUS. NOT DESIGNED ON PURPOSE: /DEBUG/ICON-LIBRARY (A DEBUG PAGE THAT SHOULD NOT BE PUBLIC), /RESET-PASSWORD AND /VERIFY-EMAIL (TOKEN SCREENS — SAME FORM AS FORGOT PASSWORD), /OFFICE-ACTIVATION/:TOKEN (THE APPROVED MIGRATION FLOW).</p></div>
  <div class="rv-tree">${Object.entries(by).map(([g, rows]) => `<section><h3>${g} · ${rows.length}</h3><div class="${g === 'SERVICE PAGES' ? 'rv-tree__svc' : ''}" style="display:grid;gap:6px${g === 'SERVICE PAGES' ? '' : ''}">${rows.map(row).join('')}</div></section>`).join('')}</div>`;
}
function reference() {
  return `<div class="rv-hero"><small>SEARCHED BEFORE DESIGNING · FSBW AND SITE00, WORKING TREES AND HISTORY</small><h1>REFERENCE & RECOVERY</h1>
    <p>THE ONLY FOUNDER IMAGE OF THE PUBLIC HOMEPAGE IS PANEL 04 OF THE BRAND DNA BOARD (SITE00 4AF8116C). THE HOMEPAGE IS HELD TO IT. THE 2026-08 DESKTOP HOMEPAGE MOCK, THE 13-SCREEN MOBILE REFERENCE AND THE PAGE STORY & MOODBOARD ARE DESCRIBED IN FSBW DOCS BUT ARE NOT IN EITHER REPOSITORY (FSBW HISTORY HAS A GAP FROM 2026-04-14 TO 2026-08-26) — THEY ARE NOT SUBSTITUTED.</p></div>
  <div class="rv-recov"><figure><img src="reference/brand-dna-board.jpg" alt="FOUNDER BRAND DNA BOARD"><figcaption><b>FOUNDER BRAND DNA BOARD</b> · PALETTE · TYPE · ICON AND PHOTOGRAPHY DIRECTION · PANEL 04 = WEBSITE HOMEPAGE EXPRESSION</figcaption></figure>
    <div style="display:grid;gap:16px"><figure><img src="reference/ifta-public-authority.jpg" alt="APPROVED IFTA PUBLIC PAGE"><figcaption><b>APPROVED IFTA PUBLIC PAGE</b> · THE ONLY PUBLIC PAGE BUILT TO A FOUNDER AUTHORITY · THE SERVICE FAMILY’S MODEL</figcaption></figure>
    <div class="rv-box"><h3>NOT FOUND — NOT SUBSTITUTED</h3><ul class="rv-notes">${['THE 2026-08 DESKTOP HOMEPAGE “APPROVED REFERENCE” MOCK', 'THE 13-SCREEN FOUNDER MOBILE REFERENCE', 'THE PAGE STORY & MOODBOARD (14 PAGE FAMILIES)', 'APPROVED PRICES — ALL PRICING IS DRAFT OR SAMPLE', 'VERIFIED PHONE, EMAIL AND HOURS — THE LIVE ONES ARE PLACEHOLDERS', 'A BRANDED BLACK-TRUCK PHOTOGRAPH LIKE PANEL 04’S', 'A LICENCE FOR MONUMENT EXTENDED'].map((t) => `<li class="x"><i>×</i><span>${t}</span></li>`).join('')}</ul></div></div></div>`;
}
function bar() {
  const g = RV_GROUPS.find((x) => x.id === RV.group) || RV_GROUPS[0];
  const p = PUB.path.split('?')[0];
  const i = g.pages.indexOf(p);
  const refKey = p === '/' ? 'home' : RV_GROUPS[1].pages.includes(p) && p !== '/services/ifta-filing' ? 'family' : null;
  return `<button class="rv-btn" data-tab="g:${g.id}">${ic('back')} ${g.no} · ${g.name}</button>
    <button class="rv-btn" data-step="-1"${i <= 0 ? ' disabled style="opacity:.4"' : ''} aria-label="PREVIOUS PAGE">${ic('back')}</button><button class="rv-btn" data-step="1"${i < 0 || i >= g.pages.length - 1 ? ' disabled style="opacity:.4"' : ''} aria-label="NEXT PAGE">${ic('chev')}</button>
    <span class="rv-bar__path"><b>${nameOf(p)}</b>${PUB.path}</span><span class="rv-bar__sp"></span>
    ${refKey ? `<button class="rv-btn" data-ref aria-pressed="${RV.ref}">${ic('eye')} ${refKey === 'home' ? 'PANEL 04 BESIDE IT' : 'IFTA AUTHORITY BESIDE IT'}</button>` : `<span class="rv-tag">NO FOUNDER REFERENCE FOR THIS PAGE — COMPOSED FROM THE FAMILY</span>`}`;
}
function refPanel() {
  const p = PUB.path.split('?')[0];
  const k = p === '/' ? 'home' : RV_GROUPS[1].pages.includes(p) && p !== '/services/ifta-filing' ? 'family' : null;
  if (!k || !RV.ref) return '';
  const r = REF[k];
  return `<figure><img src="${r.img}" alt="FOUNDER REFERENCE"><figcaption>${r.cap}</figcaption></figure>
    <ul class="rv-notes">${r.same.map((t) => `<li><i>✓</i><span>${t}</span></li>`).join('')}${r.diff.map((t) => `<li class="x"><i>≠</i><span>${t}</span></li>`).join('')}</ul>`;
}
function render() {
  chrome();
  const work = RV.view === 'work';
  $('rv-work').hidden = !work;
  $('rv-over').hidden = work;
  if (!work) $('rv-over').innerHTML = RV.view === 'tree' ? tree() : RV.view === 'reference' ? reference() : RV.view.startsWith('g:') ? groupOnly(RV.view.slice(2)) : overview();
  else {
    $('rv-bar').innerHTML = bar();
    const ref = refPanel();
    $('rv-ref').hidden = !ref;
    $('rv-ref').innerHTML = ref;
    $('rv-stage').classList.toggle('rv-stage--ref', !!ref);
    $('rv-stage').dataset.dev = RV.dev;
    fit();
  }
  const h = work ? `${PUB.path}@${RV.dev}` : RV.view;
  if (decodeURIComponent(location.hash.slice(1)) !== h) history.replaceState(null, '', `#${h}`);
}
function groupOnly(id) {
  const g = RV_GROUPS.find((x) => x.id === id);
  return `<section class="rv-grp" style="border:0;margin:0;padding:0"><header><i>${g.no}</i><h2>${g.name}</h2><span>${g.line}</span></header><div class="rv-cards">${g.pages.map((p) => `<button class="rv-card" data-open="${p}">${thumb(p)}<span class="rv-card__t">${nameOf(p)}${tagOf(p)}</span><span class="rv-card__s">${p}</span></button>`).join('')}</div></section>`;
}
function fit() {
  const [w, h] = RV_DEV[RV.dev];
  const dev = $('rv-device');
  dev.dataset.dev = RV.dev;
  dev.style.width = `${w}px`;
  dev.style.height = `${h}px`;
  const stage = $('rv-stage');
  const refW = $('rv-ref').hidden ? 0 : $('rv-ref').getBoundingClientRect().width + 18;
  const availW = Math.max(240, stage.getBoundingClientRect().width - refW - 20);
  const availH = Math.max(420, window.innerHeight - $('rv-sizer').getBoundingClientRect().top + window.scrollY - window.scrollY - 28);
  const s = Math.min(1, availW / w, RV.dev === 'phone' || RV.dev === 'tablet' ? availH / h : 9);
  dev.style.transform = `scale(${s})`;
  $('rv-sizer').style.width = `${Math.round(w * s)}px`;
  $('rv-sizer').style.height = `${Math.round(h * s)}px`;
  if (PUB.width !== w) {
    PUB.width = w;
    $('pub').style.setProperty('--fh', `${h}px`);
    draw();
  }
}
function openPage(p, dev) {
  const g = groupOf(p.split('?')[0]);
  if (g) RV.group = g.id;
  if (dev && RV_DEV[dev]) RV.dev = dev;
  RV.view = 'work';
  render();
  if (PUB.path !== p) go(p);
  else { $('rv-frame').scrollTop = 0; render(); }
}
function boot() {
  shell();
  const [p, d] = decodeURIComponent(location.hash.slice(1)).split('@');
  if (RV_DEV[d]) RV.dev = d;
  else RV.dev = innerWidth < 760 ? 'phone' : innerWidth < 1200 ? 'tablet' : 'desktop';
  const [w, h] = RV_DEV[RV.dev];
  const root = $('pub');
  root.style.setProperty('--fh', `${h}px`);
  if (p && p.startsWith('/')) { PUB.path = p; RV.view = 'work'; const g = groupOf(p.split('?')[0]); if (g) RV.group = g.id; }
  else if (p === 'tree' || p === 'reference' || p?.startsWith('g:')) RV.view = p;
  mountPub(root, { scroller: $('rv-frame'), width: w });
  addEventListener('pub:route', () => { const g = groupOf(PUB.path.split('?')[0]); if (g) RV.group = g.id; RV.view = 'work'; render(); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-dev],[data-tab],[data-open],[data-step],[data-ref]');
    if (!t || t.closest('#pub')) return;
    if (t.dataset.dev) { RV.dev = t.dataset.dev; render(); $('rv-frame').scrollTop = 0; return; }
    if (t.dataset.tab) { RV.view = t.dataset.tab; render(); scrollTo(0, 0); return; }
    if (t.dataset.open) return openPage(t.dataset.open);
    if (t.dataset.step) { const g = RV_GROUPS.find((x) => x.id === RV.group); const i = g.pages.indexOf(PUB.path.split('?')[0]) + Number(t.dataset.step); if (g.pages[i]) openPage(g.pages[i]); return; }
    if (t.hasAttribute('data-ref')) { RV.ref = !RV.ref; render(); }
  });
  addEventListener('resize', () => RV.view === 'work' && fit());
  render();
  document.documentElement.dataset.ready = '1';
  window.AIO_PUBREV = { open: (v) => { RV.view = v; render(); }, page: (p, d) => openPage(p, d), dev: (d) => { RV.dev = d; render(); }, state: () => ({ view: RV.view, dev: RV.dev, group: RV.group, path: PUB.path, ref: RV.ref }), groups: () => RV_GROUPS, capture(on) { PUB.capture = !!on; if (on) document.querySelectorAll('#pub .rv').forEach((e) => e.classList.add('in')); } };
}
boot();
