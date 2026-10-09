/*
 * AIO PUBLIC WEBSITE — the founder review. The site (site.js) is mounted once inside a device frame and keeps running;
 * the review only changes the frame (small phone 360 · phone 390 · tablet 834 · tablet landscape 1194 · desktop 1440 ·
 * ultra-wide 2560), the page, and what sits beside it (the founder reference the page is held to, where one exists).
 * Three reviews come first (LIVE-LEGACY-AUDIT sprint): A · what the current site does and what happens to each part,
 * B · the desktop and tablet beside the approved phone, C · the shorter pages — then the connected site itself.
 */
const RV_DEV = { s360: [360, 800, 'SMALL PHONE'], phone: [390, 844, 'PHONE'], tablet: [834, 1194, 'TABLET'], tabletL: [1194, 834, 'TABLET LANDSCAPE'], desktop: [1440, 900, 'DESKTOP'], wide: [2560, 1440, 'ULTRA-WIDE'] };
const RV_GROUPS = [
  { id: 'home', no: '1', name: 'HOMEPAGE', line: 'HELD TO THE FOUNDER BRAND BOARD · PANEL 04 · WEBSITE HOMEPAGE EXPRESSION', pages: ['/'] },
  { id: 'family', no: '2', name: 'SERVICE FAMILY', line: 'HELD TO THE APPROVED IFTA PUBLIC PAGE · HUB · SERVICE · PLANS · PARTNER · PAUSED', pages: ['/services/permitting', '/services/trip-permits', '/services/bookkeeping', '/services/insurance', '/services/brokerage', '/services/ifta-filing'] },
  { id: 'services', no: '3', name: 'SERVICES & PRODUCTS', line: 'DIRECTORY · FINDER · FORMATION · DISPATCH · FACTORING · FLEETCARE · DRIVERLINK', pages: ['/services', '/services/find', '/services/business-formation', '/services/dispatching', '/services/factoring', '/services/fleetcare', '/services/driverlink'] },
  { id: 'journeys', no: '4', name: 'SOLUTIONS & GET STARTED', line: 'START YOUR BUSINESS · ROAD READY · CLIENT PORTAL · CHECK WHAT I NEED · REQUEST', pages: ['/start-your-business', '/start-your-business/register', '/road-ready', '/roadmap', '/client-portal', '/get-started', '/roadmap/results', '/service-plan', '/request/submit', '/request/confirmation/req-sample'] },
  { id: 'company', no: '5', name: 'COMPANY & ACCOUNT', line: 'ABOUT · CONTACT · CALLBACK · SCHEDULE · LOG IN · CREATE ACCOUNT · 404', pages: ['/about', '/contact', '/request-callback', '/schedule', '/login', '/signup', '/forgot-password', '/onboarding', '/not-found'] },
];
const RV = { view: 'start', group: 'home', dev: 'desktop', ref: true };
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
  const tabs = [['start', 'START HERE'], ['a', 'A · KEEP WHAT WORKS'], ['b', 'B · DESKTOP & TABLET'], ['c', 'C · SHORTER PAGES'], ['overview', 'THE CONNECTED SITE'], ...RV_GROUPS.map((g) => [`g:${g.id}`, `${g.no} · ${g.name}`]), ['tree', 'PAGE TREE'], ['reference', 'REFERENCE & RECOVERY']];
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
/* ═════════════ the three reviews (LIVE-LEGACY-AUDIT sprint) ═════════════ */
const CLS = { 'PRESERVE EXACTLY': 'keep', 'REUSE AND RESTYLE': 'reuse', 'RECONNECT TO NEW DESIGN': 'link', 'REPAIR BEFORE MIGRATION': 'fix', 'REPLACE PRESENTATION ONLY': 'skin', 'REMOVE ONLY WITH APPROVAL': 'cut', DEFER: 'later' };
const clsChip = (c) => `<span class="rv-cls rv-cls--${CLS[c] || 'later'}">${c}</span>`;
const fig = (src, cap, cls = '') => `<figure class="rv-fig ${cls}"><img src="${src}" alt="${esc(cap)}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
const noMig = () => `<div class="rv-hero"><h1>THE AUDIT RECORD IS NOT IN THIS BUILD</h1><p>BUILD AFTER THE RECORD IS VENDORED (DOCS/AIO/PUBLIC-MIGRATION/).</p></div>`;
function startHere() {
  const M = MIG;
  const cards = [['a', 'A', 'KEEP WHAT WORKS', 'WHAT THE CURRENT SITE DOES, PART BY PART — AND WHAT HAPPENS TO EACH PART IN THE NEW SITE. NOTHING IS DROPPED SILENTLY.'], ['b', 'B', 'DESKTOP & TABLET', 'THE DESKTOP AND TABLET NOW HAVE THEIR OWN COMPOSITIONS. THE APPROVED PHONE STAYS THE BENCHMARK, SHOWN BESIDE THEM.'], ['c', 'C', 'SHORTER PAGES', 'THE LONGEST PAGES, BEFORE AND AFTER — SELECTORS, EXPLORERS AND ACCORDIONS INSTEAD OF ENDLESS LISTS. NOTHING IMPORTANT HIDDEN.'], ['overview', '→', 'THE CONNECTED SITE', 'THE WHOLE PUBLIC SITE, CLICKABLE, IN SIX DEVICE FRAMES — 360 · 390 · 834 · 1194 · 1440 · 2560.']];
  return `<div class="rv-hero"><small>ALL IN ONE ENTERPRISES INC. · PUBLIC WEBSITE · FINAL RESPONSIVE DESIGN AND MIGRATION READINESS</small><h1>THREE QUESTIONS, THEN THE WHOLE SITE.</h1>
    <p>${M ? `${M.status.live_site}. ${M.status.audit_basis}.` : ''} THE NEW DESIGN IS A CANDIDATE: NOTHING IS DEPLOYED, THE LIVE SITE IS UNCHANGED, BROKERAGE STAYS PAUSED.</p>
    <div class="rv-flags"><span class="rv-flag rv-flag--warn"><i></i>LIVE SITE NOT REACHABLE FROM HERE</span><span class="rv-flag"><i></i>AUDITED FROM THE SOURCE + A LOCAL BUILD</span><span class="rv-flag rv-flag--ok"><i></i>SIX SIZES COMPOSED</span><span class="rv-flag rv-flag--warn"><i></i>DO NOT REPLACE THE PRODUCTION SITE BEFORE APPROVAL</span></div></div>
    <div class="rv-start">${cards.map(([k, n, t, d]) => `<button class="rv-startcard" data-tab="${k}"><i>${n}</i><b>${t}</b><span>${d}</span><em>${ic('arrow')} OPEN</em></button>`).join('')}</div>`;
}
function reviewA() {
  const M = MIG;
  if (!M) return noMig();
  const areas = [...new Set(M.inventory.map((r) => r.area))];
  const counts = {};
  for (const r of M.inventory) for (const c of r.classes) counts[c] = (counts[c] || 0) + 1;
  return `<div class="rv-hero"><small>REVIEW A · THE EXISTING WEBSITE · PRESERVATION AUDIT</small><h1>KEEP WHAT WORKS. FIX WHAT DOESN’T. DROP NOTHING SILENTLY.</h1>
    <p>${M.live.local_render}. ${M.live.screen_recordings}.</p>
    <div class="rv-flags">${Object.keys(CLS).map((c) => `${clsChip(c)}<span class="rv-n">${counts[c] || 0}</span>`).join('')}</div></div>
    <section class="rv-sec"><h2>THE CURRENT SITE · LOCAL BUILD OF THE CURRENT SOURCE (NOT PRODUCTION)</h2>
      <div class="rv-figs">${CURRENT.map(([slug, cap]) => fig(`current/${slug}--desktop.jpg`, cap)).join('')}</div>
      <p class="rv-note">WHAT THESE SHOW: PLACEHOLDER PHONE AND EMAIL · PUBLISHED SAMPLE PRICES · THE AIO OFFICE OPEN TO ANYONE IN DEMO MODE · THE DEBUG ICON PAGE · DARK-ON-DARK NAVIGATION LINKS · AN UNSTYLED 404.</p></section>
    <section class="rv-sec"><h2>EVERY CAPABILITY AND WHAT HAPPENS TO IT · ${M.inventory.length}</h2>
      ${areas.map((a) => `<details class="rv-area" open><summary>${a} · ${M.inventory.filter((r) => r.area === a).length}</summary><div class="rv-rows">${M.inventory.filter((r) => r.area === a).map((r) => `<div class="rv-row"><div><b>${esc(r.route.toUpperCase())}</b><span>${esc(r.fn.toUpperCase())}</span></div><div class="rv-row__go"><em>NEW DESIGN</em><span>${esc(r.destination.toUpperCase())}</span></div><div class="rv-row__cls">${r.classes.map(clsChip).join('')}<span class="rv-risk rv-risk--${r.risk.toLowerCase()}">${r.risk} RISK</span></div></div>`).join('')}</div></details>`).join('')}</section>
    <section class="rv-sec"><h2>THE EIGHT KNOWN ISSUES · RE-CHECKED AGAINST TODAY’S SOURCE</h2><div class="rv-issues">${M.issues.map((i) => `<div class="rv-issue"><i>${i.id}</i><b>${esc(i.claim.toUpperCase())}</b><span class="rv-verdict">${i.verdict}</span><p>${esc(i.evidence.toUpperCase())}</p><em>COMPOSER TASK ${i.task}</em></div>`).join('')}</div></section>
    <section class="rv-sec rv-two"><div class="rv-box"><h3>FEATURE CONFLICTS · THE NEW DESIGN MUST NOT SIMPLIFY THESE</h3><ul class="rv-notes">${M.routes.conflicts.map((t) => `<li class="${/RESOLVED/.test(t) ? '' : 'x'}"><i>${/RESOLVED/.test(t) ? '✓' : '!'}</i><span>${esc(t.toUpperCase())}</span></li>`).join('')}</ul></div>
      <div class="rv-box"><h3>BEFORE THE NEW SITE CAN GO LIVE</h3><ul class="rv-notes">${M.blockers.map((t) => `<li class="x"><i>×</i><span>${esc(t.toUpperCase())}</span></li>`).join('')}</ul></div></section>
    <section class="rv-sec"><div class="rv-box"><h3>YOUR DECISIONS</h3><ul class="rv-notes">${M.decisions.map((t) => `<li><i>?</i><span>${esc(t.toUpperCase())}</span></li>`).join('')}</ul></div></section>`;
}
const B_PAGES = [['/', 'HOMEPAGE', ['WHAT CAN WE HELP YOU DO: A SPLIT EXPLORER (DESKTOP) · A TOUCH SELECTOR (TABLET) · THE APPROVED SNAP CARDS (PHONE)', 'WHICH ONE ARE YOU → WHERE TO BEGIN: A VERTICAL STAGE ROAD BESIDE ONE PANEL', 'ROAD READY™ IN ONE COMPACT BAND']], ['/services/permitting', 'A SERVICE FAMILY', ['PICK A SERVICE ON THE LEFT, READ IT ON THE RIGHT — WHO IT IS FOR, WHAT YOU PROVIDE, NEXT STEP', 'THE PHONE SHOWS SIX CARDS, THEN SHOW ALL']], ['/services/trip-permits', 'A SERVICE PAGE', ['ON THIS PAGE BAR · WHAT AIO PROVIDES · WHO IT IS FOR · WHAT YOU PROVIDE · HOW IT WORKS · AFTER · QUESTIONS · NEXT STEP', 'THE WORDS ARE THE LIVE SERVICE PAGE’S']], ['/services', 'ALL SERVICES', ['THE WHOLE CATALOG AS ONE INDEX BY FAMILY — CARDS ONLY WHEN NARROWED']], ['/get-started', 'GET STARTED', ['THE LIVE SMART INTAKE, SECTION BY SECTION, WITH A STEP RAIL ON THE DESKTOP']], ['/start-your-business', 'START YOUR BUSINESS', ['PICK A STAGE AND READ IT IN PLACE']]];
function reviewB() {
  return `<div class="rv-hero"><small>REVIEW B · DESKTOP AND TABLET BESIDE THE APPROVED PHONE</small><h1>EACH SCREEN SIZE COMPOSED FOR ITSELF.</h1>
    <p>THE PHONE IS THE APPROVED BENCHMARK AND IS UNCHANGED EXCEPT WHERE A PAGE WAS GENUINELY TOO LONG. THE TABLET GETS TOUCH SELECTORS AND TWO-COLUMN PANELS; THE DESKTOP GETS SPLIT EXPLORERS, LAYERED PANELS OVER THE PHOTOGRAPHY AND SELECTORS; THE ULTRA-WIDE KEEPS EVERY COMPOSITION AT ITS OWN SCALE. EACH FIRST SCREEN BELOW OPENS LIVE IN ITS FRAME.</p></div>
    ${B_PAGES.map(([p, name, notes]) => { const s = slugOf(p); return `<section class="rv-sec"><h2>${name} <code>${p}</code></h2><div class="rv-bset">${[['phone', 'PHONE 390 · APPROVED'], ['tablet', 'TABLET 834'], ['desktop', 'DESKTOP 1440'], ['wide', 'ULTRA-WIDE 2560']].map(([d, cap]) => `<button class="rv-bfig rv-bfig--${d}" data-open="${p}" data-opendev="${d}"><img src="after/${s}--${d}.jpg" alt="${name} · ${cap}" loading="lazy"><span>${cap}</span></button>`).join('')}</div><ul class="rv-notes">${notes.map((t) => `<li><i>✓</i><span>${t}</span></li>`).join('')}</ul></section>`; }).join('')}`;
}
function reviewC() {
  const rows = (SCROLL?.pages || []).filter((x) => C_PAGES.includes(x.path));
  const max = Math.max(...rows.flatMap((r) => ['phone', 'tablet', 'desktop'].map((d) => r.before[d])), 1);
  const bar = (b, a) => `<span class="rv-bars"><i style="width:${(100 * b) / max}%"></i><i class="a" style="width:${(100 * a) / max}%"></i></span>`;
  return `<div class="rv-hero"><small>REVIEW C · SHORTER PAGE JOURNEYS · BEFORE AND AFTER</small><h1>LESS SCROLLING, NOTHING HIDDEN.</h1>
    <p>PAGE LENGTH IN SCREENS (PAGE HEIGHT ÷ SCREEN HEIGHT), MEASURED ON THE REAL RENDERED PAGES, BEFORE THIS SPRINT AND AFTER. LONG LISTS BECAME SELECTORS, EXPLORERS, ACCORDIONS AND BOUNDED SWIPE RAILS; DISCLOSURES STAY ON THE PAGE. SERVICE PAGES NOW ANSWER NINE QUESTIONS IN ABOUT THE SAME LENGTH THAT ANSWERED FOUR.</p></div>
    <section class="rv-sec"><div class="rv-ctable"><div class="rv-crow rv-crow--h"><b>PAGE</b><b>PHONE 390</b><b>TABLET 834</b><b>DESKTOP 1440</b></div>${rows.map((r) => `<div class="rv-crow"><b>${nameOf(r.path)}<code>${r.path}</code></b>${['phone', 'tablet', 'desktop'].map((d) => `<span>${bar(r.before[d], r.after[d])}<em>${r.before[d].toFixed(1)} → <strong>${r.after[d].toFixed(1)}</strong></em></span>`).join('')}</div>`).join('')}</div><p class="rv-note"><span class="rv-key"></span> BEFORE · <span class="rv-key rv-key--a"></span> AFTER — ALL ${SCROLL ? SCROLL.pages.length : ''} PAGES × SIX SIZES ARE IN THE EVIDENCE (AIO_PUBLIC_MIGRATION_READINESS/SCROLL.JSON).</p></section>
    ${C_STRIPS.map(([p, d]) => { const s = slugOf(p); return `<section class="rv-sec"><h2>${nameOf(p)} · ${d === 'phone' ? 'PHONE 390' : 'DESKTOP 1440'}</h2><div class="rv-strips rv-strips--${d}">${fig(`strips/${s}--${d}--before.jpg`, 'BEFORE')}${fig(`strips/${s}--${d}--after.jpg`, 'AFTER')}</div></section>`; }).join('')}`;
}
const C_PAGES = ['/', '/services', '/services/permitting', '/services/business-formation', '/services/insurance', '/services/bookkeeping', '/services/trip-permits', '/roadmap', '/start-your-business', '/get-started'];
const C_STRIPS = [['/services', 'phone'], ['/services/permitting', 'phone'], ['/', 'desktop'], ['/roadmap', 'desktop']];
const CURRENT = [['home', 'HOMEPAGE · LOCAL BUILD'], ['contact', 'CONTACT · PLACEHOLDER PHONE AND EMAIL'], ['services_bookkeeping', 'BOOKKEEPING · SAMPLE PRICES PUBLISHED'], ['get_started', 'SMART INTAKE · THE LIVE SECTIONS'], ['office', 'THE AIO OFFICE · OPEN IN DEMO MODE'], ['debug_icon_library', 'THE DEBUG ICON PAGE · PUBLIC'], ['login', 'LOG IN · DEMO PORTAL SHORTCUT'], ['this_route_does_not_exist', '404 · UNSTYLED']];

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
  if (!work) $('rv-over').innerHTML = RV.view === 'tree' ? tree() : RV.view === 'reference' ? reference() : RV.view === 'start' ? startHere() : RV.view === 'a' ? reviewA() : RV.view === 'b' ? reviewB() : RV.view === 'c' ? reviewC() : RV.view.startsWith('g:') ? groupOnly(RV.view.slice(2)) : overview();
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
  else if (['tree', 'reference', 'start', 'a', 'b', 'c', 'overview'].includes(p) || p?.startsWith('g:')) RV.view = p;
  mountPub(root, { scroller: $('rv-frame'), width: w });
  addEventListener('pub:route', () => { const g = groupOf(PUB.path.split('?')[0]); if (g) RV.group = g.id; RV.view = 'work'; render(); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-dev],[data-tab],[data-open],[data-step],[data-ref]');
    if (!t || t.closest('#pub')) return;
    if (t.dataset.dev) { RV.dev = t.dataset.dev; render(); $('rv-frame').scrollTop = 0; return; }
    if (t.dataset.tab) { RV.view = t.dataset.tab; render(); scrollTo(0, 0); return; }
    if (t.dataset.open) return openPage(t.dataset.open, t.dataset.opendev);
    if (t.dataset.step) { const g = RV_GROUPS.find((x) => x.id === RV.group); const i = g.pages.indexOf(PUB.path.split('?')[0]) + Number(t.dataset.step); if (g.pages[i]) openPage(g.pages[i]); return; }
    if (t.hasAttribute('data-ref')) { RV.ref = !RV.ref; render(); }
  });
  addEventListener('resize', () => RV.view === 'work' && fit());
  render();
  document.documentElement.dataset.ready = '1';
  window.AIO_PUBREV = { open: (v) => { RV.view = v; render(); }, page: (p, d) => openPage(p, d), dev: (d) => { RV.dev = d; render(); }, state: () => ({ view: RV.view, dev: RV.dev, group: RV.group, path: PUB.path, ref: RV.ref }), groups: () => RV_GROUPS, capture(on) { PUB.capture = !!on; if (on) document.querySelectorAll('#pub .rv').forEach((e) => e.classList.add('in')); } };
}
boot();
