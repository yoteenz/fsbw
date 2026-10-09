/*
 * AIO PUBLIC WEBSITE — design review build. One page tree (recovered from src/routes/AioCoreRoutes.tsx), drawn dark and
 * cinematic in the founder's brand language (brand DNA board; homepage = panel 04 "WEBSITE HOMEPAGE EXPRESSION").
 * The words and the services come from the live sources (PUB_DATA, bundled at build time from the canonical catalog,
 * the activation matrices, divisionMeta, the homepage pathways and the Start Your Business journey). No prices, client
 * counts, success rates, reviews or testimonials are shown: none are approved. Forms are drawn; nothing is sent.
 */
const D = PUB_DATA;
const PUB = { path: '/', pathSel: 0, pick: {}, open: {}, plan: [], menu: null, search: false, q: '', drawer: false, grp: null, eco: 0, fam: 'all', fq: '', needs: [], gs: { step: 0, needs: [], stage: '', goal: '', ans: {} }, sent: {}, toast: null, seen: new Set(), scroller: null, capture: false };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const U = (s) => esc(String(s ?? '').toUpperCase());
const IMG = (k) => `img/${k}.jpg`;
const svcBySlug = (slug) => D.services.find((s) => s.slug === slug);
const catById = (id) => D.categories.find((c) => c.id === id);

/* ── status, delivery and pricing words — all from the matrices, never invented ── */
const STATE = {
  AVAILABLE: ['AVAILABLE', 'go'], PILOT: ['LIMITED PILOT', 'pilot'], PREPARING: ['PREPARING', 'prep'], SOON: ['COMING SOON', 'soon'],
  HOLD: ['REQUEST INFO', 'hold'], BLOCKED: ['NOT YET OFFERED', 'blocked'], PAUSED: ['PAUSED', 'paused'], STAFF: ['STAFF-COORDINATED', 'pilot'], PARTNER: ['PARTNER REFERRAL', 'partner'],
};
const chip = (k) => (k && STATE[k] ? `<span class="chip chip--${STATE[k][1]}">${STATE[k][0]}</span>` : '');
const DELIVERY = { AIO_DIRECT: ['AIO PREPARES IT', 'clipboard'], AIO_MANAGED: ['AIO MANAGES IT', 'gear'], PARTNER_PROVIDED: ['THROUGH A PARTNER', 'handshake'], HYBRID: ['AIO + A PARTNER', 'handshake'] };
const PRICING = { quote_required: 'QUOTE AFTER REVIEW', contact_us: 'BY CONSULTATION', starting_at: 'NOT YET PUBLISHED', consultation: 'BY CONSULTATION', fixed: 'NOT YET PUBLISHED', referral: 'PARTNER QUOTE' };

/* ── photography (founder-supplied and founder-approved plates; see the asset manifest). public/brand/all-in-one-hero-truck.png
 *    is RETIRED (docs/aio/experience-driven/ifta/AIO_IFTA_PUBLIC_PAGE_CONTRACT.json — IDNTY_10, no generic semi hero) and is not used. ── */
const PHOTO = {
  'start-my-business': 'aio-login', 'get-road-ready': 'highway-gold', 'permits-taxes-compliance': 'mountain-road', 'safety-drivers': 'night-interstate',
  'operate-my-business': 'fleet-yard', 'move-freight': 'freight-map', 'manage-my-money': 'valley-trail',
  permitting: 'mountain-road', 'business-formation': 'aio-login', insurance: 'night-interstate', dispatching: 'fleet-yard', brokerage: 'freight-map', bookkeeping: 'valley-trail', factoring: 'highway-gold', fleetcare: 'fleet-yard', driverlink: 'night-interstate',
};
const CAT_ICON = { 'start-my-business': 'building', 'get-road-ready': 'badge', 'permits-taxes-compliance': 'doc', 'safety-drivers': 'hardhat', 'operate-my-business': 'truck', 'move-freight': 'package', 'manage-my-money': 'calc' };
const SVC_ICON = { formation: 'building', legal: 'stamp', compliance: 'doc', safety: 'hardhat', dispatching: 'truck', brokerage: 'package', bookkeeping: 'calc', factoring: 'coins', insurance: 'shield', permits: 'doc', tax: 'receipt', fuel: 'fuel', renewals: 'calendar', drivers: 'idcard', eld: 'gauge', freight: 'package', payroll: 'wallet', documents: 'clipboard' };
const svcIcon = (s) => SVC_ICON[s.icon] || CAT_ICON[s.category] || 'doc';

/* ── the recovered public page tree: path → template ── */
const DIVISIONS = {
  permitting: { lines: ['EVERY PERMIT.', 'EVERY RENEWAL.', 'ONE RECORD.'], steps: 'filing' },
  'business-formation': { lines: ['YOUR NAME.', 'YOUR AUTHORITY.', 'YOUR BUSINESS.'], steps: 'filing' },
  insurance: { lines: ['THE RIGHT QUESTIONS.', 'THE RIGHT PARTNERS.', 'YOUR DECISION.'], steps: 'partner' },
  dispatching: { lines: ['YOUR TRUCK.', 'YOUR LANES.', 'YOUR CALL.'], steps: 'operate' },
  brokerage: { lines: ['FREIGHT SERVICES.', 'PAUSED FOR NOW.'], steps: 'operate' },
  factoring: { lines: ['COMPLETED LOADS.', 'CLEARER CASH FLOW.'], steps: 'partner' },
  bookkeeping: { lines: ['EVERY MILE.', 'EVERY RECEIPT.', 'EVERY MONTH.'], steps: 'books' },
};
const STEPS = {
  filing: [['send', 'TELL US WHAT YOU NEED', 'ONE SHORT REQUEST — NO GUESSWORK.'], ['upload', 'SHARE YOUR DOCUMENTS', 'UPLOAD ONCE TO YOUR SECURE VAULT.'], ['clipboard', 'AIO PREPARES IT', 'YOUR FILING, CHECKED BY OUR TEAM.'], ['badge', 'YOU REVIEW & APPROVE', 'NOTHING IS FILED WITHOUT YOU.'], ['done', 'SUBMITTED & TRACKED', 'STATUS AND RECORDS IN YOUR PORTAL.']],
  operate: [['truck', 'TELL US ABOUT YOUR TRUCK', 'EQUIPMENT, LANES AND PREFERENCES.'], ['route', 'SET HOW YOU RUN', 'WHERE YOU GO AND WHAT YOU HAUL.'], ['headset', 'AIO COORDINATES', 'A TEAM WORKING BEHIND THE TRUCK.'], ['badge', 'YOU CONFIRM', 'YOU STAY IN CONTROL OF EVERY LOAD.'], ['done', 'TRACKED IN YOUR PORTAL', 'PAPERWORK KEPT WITH THE RECORD.']],
  partner: [['send', 'TELL US WHAT YOU NEED', 'YOUR OPERATION, IN A FEW QUESTIONS.'], ['clipboard', 'AIO REVIEWS YOUR NEEDS', 'WE ORGANIZE WHAT A PARTNER WILL ASK.'], ['handshake', 'PARTNER INTRODUCTION', 'LICENSED PARTNERS QUOTE AND DECIDE.'], ['badge', 'YOU DECIDE', 'NO COMMITMENT UNTIL YOU CHOOSE.'], ['done', 'KEPT ON YOUR RECORD', 'DOCUMENTS STORED WITH YOUR BUSINESS.']],
  books: [['clipboard', 'ASSESS YOUR BOOKS', 'A SHORT ASSESSMENT OF WHERE YOU ARE.'], ['layers', 'CHOOSE A PLAN', 'ESSENTIALS, PLUS OR ALL IN ONE.'], ['upload', 'CONNECT YOUR RECORDS', 'STATEMENTS, RECEIPTS AND SETTLEMENTS.'], ['calendar', 'MONTHLY CLOSE', 'CATEGORIZED THE TRUCKING WAY.'], ['growth', 'REPORTS IN YOUR PORTAL', 'PROFIT & LOSS AND A MONTHLY SNAPSHOT.']],
};
const STAGE_ICON = { build: 'building', authorize: 'stamp', protect: 'shield', register: 'doc', activate: 'badge', roll: 'truck' };

const TREE = [
  // [path, name, group, status] — status: DESIGNED · APPROVED (unchanged authority) · TOKEN (opened from a private link)
  ['/', 'HOME', 'HOME'],
  ['/services', 'SERVICES', 'SERVICES'], ['/services/find', 'FIND A SERVICE', 'SERVICES'],
  ['/services/permitting', 'PERMITTING & COMPLIANCE', 'SERVICES'], ['/services/business-formation', 'BUSINESS FORMATION', 'SERVICES'],
  ['/services/insurance', 'TRUCKING INSURANCE', 'SERVICES'], ['/services/dispatching', 'DISPATCHING', 'SERVICES'], ['/services/brokerage', 'BROKERAGE (PAUSED)', 'SERVICES'],
  ['/services/bookkeeping', 'BOOKKEEPING', 'SERVICES'], ['/services/bookkeeping/assessment', 'BOOKS ASSESSMENT', 'SERVICES'], ['/services/bookkeeping/recommendation', 'PLAN RECOMMENDATION', 'SERVICES'],
  ['/services/factoring', 'FACTORING', 'SERVICES'], ['/services/fleetcare', 'FLEETCARE NETWORK', 'SERVICES'], ['/services/fleetcare/plans', 'FLEETCARE PLANS', 'SERVICES'],
  ['/fleetcare/providers/join', 'JOIN FLEETCARE', 'SERVICES'], ['/fleetcare/providers/apply', 'PROVIDER APPLICATION', 'SERVICES'],
  ['/services/driverlink', 'DRIVERLINK', 'SERVICES'], ['/driverlink/signup', 'DRIVER PROFILE', 'SERVICES'],
  ['/services/ifta-filing', 'IFTA FILING (APPROVED)', 'SERVICES', 'APPROVED'],
  ['/start-your-business', 'START YOUR BUSINESS', 'SOLUTIONS'], ['/start-your-business/build', 'BUILD', 'SOLUTIONS'], ['/start-your-business/register', 'REGISTER', 'SOLUTIONS'],
  ['/start-your-business/activate', 'ACTIVATE', 'SOLUTIONS'], ['/start-your-business/roll', 'ROLL', 'SOLUTIONS'], ['/road-ready', 'ROAD READY™', 'SOLUTIONS'],
  ['/roadmap', 'COMPLIANCE GUIDE', 'SOLUTIONS'], ['/client-portal', 'CLIENT PORTAL', 'SOLUTIONS'],
  ['/get-started', 'CHECK WHAT I NEED', 'GET STARTED'], ['/roadmap/results', 'YOUR ROADMAP', 'GET STARTED'], ['/service-plan', 'MY SERVICE PLAN', 'GET STARTED'],
  ['/request/submit', 'SUBMIT A REQUEST', 'GET STARTED'], ['/request/confirmation/req-sample', 'REQUEST RECEIVED', 'GET STARTED'], ['/quote/sample', 'YOUR QUOTE (LINK)', 'GET STARTED', 'TOKEN'],
  ['/about', 'ABOUT', 'COMPANY'], ['/contact', 'CONTACT', 'COMPANY'], ['/request-callback', 'REQUEST A CALLBACK', 'COMPANY'], ['/schedule', 'SCHEDULE', 'COMPANY'],
  ['/login', 'LOG IN', 'ACCOUNT'], ['/signup', 'CREATE ACCOUNT', 'ACCOUNT'], ['/forgot-password', 'FORGOT PASSWORD', 'ACCOUNT'], ['/onboarding', 'ONBOARDING', 'ACCOUNT'],
  ['/not-found', 'PAGE NOT FOUND', 'SYSTEM'],
];
for (const s of D.services) if (!TREE.find((t) => t[0] === `/services/${s.slug}`)) TREE.push([`/services/${s.slug}`, s.name.toUpperCase(), 'SERVICE PAGES']);

/* ── navigation ── */
const SOLUTIONS = [['/start-your-business', 'START YOUR BUSINESS', 'FROM IDEA TO ROLLING', 'rocket'], ['/road-ready', 'ROAD READY™', 'KNOW WHERE YOU STAND', 'badge'], ['/get-started', 'CHECK WHAT I NEED', 'A SHORT GUIDED CHECK', 'compass'], ['/client-portal', 'CLIENT PORTAL', 'ONE PLACE TO RUN IT', 'layers'], ['/roadmap', 'COMPLIANCE GUIDE', 'THE ALL IN ONE ROADMAP', 'map']];
const RESOURCES = [['/about#resources', 'TRUCKING RESOURCES', 'GUIDES AND LINKS', 'book'], ['/roadmap', 'COMPLIANCE GUIDE', 'WHAT IS DUE AND WHEN', 'map'], ['/services/find', 'FIND A SERVICE', 'ANSWER A FEW QUESTIONS', 'search'], ['/contact', 'CONTACT & FAQ', 'TALK TO AIO', 'message']];
function nav() {
  const cur = (p) => (PUB.path === p || (p !== '/' && PUB.path.startsWith(p)) ? ' aria-current="page"' : '');
  const dd = (id, label) => `<button class="nav__a" data-a="menu" data-v="${id}" aria-expanded="${PUB.menu === id}" aria-haspopup="true">${label}${ic('caret')}</button>`;
  let pop = '';
  if (PUB.menu === 'services') {
    const cols = [['start-my-business', 'get-road-ready'], ['permits-taxes-compliance', 'safety-drivers'], ['operate-my-business', 'move-freight'], ['manage-my-money']];
    pop = `<div class="pop pop--mega" role="menu">${cols.map((col) => `<div class="pop__col">${col.map((cid) => { const c = catById(cid); const hub = CAT_HUB[cid]; return `<h4>${ic(CAT_ICON[cid])}${U(c.title)}</h4>${D.services.filter((s) => s.category === cid).slice(0, cid === 'manage-my-money' ? 9 : 4).map((s) => `<a class="pop__item" href="#/services/${s.slug}">${U(s.name)}${s.state !== 'AVAILABLE' && s.state !== 'PILOT' ? `<small>${STATE[s.state][0]}</small>` : ''}</a>`).join('')}<a class="pop__item" href="#${hub}"><b class="gold">ALL ${U(c.title)}</b>${ic('arrow')}</a>`; }).join('<div style="height:14px"></div>')}</div>`).join('')}
      <a class="pop__feature" href="#/services" style="background-image:url(${IMG('mountain-road')})"><p class="eyebrow">ALL SERVICES</p><b class="h3">EVERYTHING BEHIND YOUR TRUCKING BUSINESS.</b><span class="link">VIEW ALL SERVICES ${ic('arrow')}</span></a></div>`;
  }
  if (PUB.menu === 'solutions' || PUB.menu === 'resources') {
    const items = PUB.menu === 'solutions' ? SOLUTIONS : RESOURCES;
    pop = `<div class="pop pop--list" role="menu" style="left:${PUB.menu === 'solutions' ? 'var(--pop-sol)' : 'var(--pop-res)'}">${items.map(([p, t, d, i]) => `<a class="pop__item" href="#${p}"><span><b>${t}</b><em>${d}</em></span>${ic(i)}</a>`).join('')}</div>`;
  }
  const hits = PUB.search ? searchHits(PUB.q) : [];
  return `<header class="nav" data-key="nav">
    <a class="nav__mark" href="#/" aria-label="ALL IN ONE ENTERPRISES INC. — HOME"><img src="brand/aio-mark-on-dark.png" alt=""></a>
    <nav class="nav__links" aria-label="MAIN">${dd('services', 'SERVICES')}${dd('solutions', 'SOLUTIONS')}<a class="nav__a" href="#/about"${cur('/about')}>ABOUT</a>${dd('resources', 'RESOURCES')}<a class="nav__a" href="#/contact"${cur('/contact')}>CONTACT</a></nav>
    <div class="nav__tools">
      <button class="nav__icon" data-a="search" aria-label="SEARCH" aria-expanded="${PUB.search}">${ic(PUB.search ? 'close' : 'search')}</button>
      <a class="btn btn--line btn--sm nav__login" href="#/login">CLIENT LOGIN</a>
      <a class="btn btn--gold btn--sm nav__start-lg" href="#/get-started">GET STARTED ${ic('arrow', 'ic--go')}</a>
      <a class="btn btn--gold nav__start-sm" href="#/get-started">GET STARTED</a>
      <button class="nav__icon nav__menu" data-a="drawer" aria-label="MENU" aria-expanded="${PUB.drawer}">${ic(PUB.drawer ? 'close' : 'menu')}</button>
    </div>
    ${pop}
    ${PUB.search ? `<div class="search" role="search"><label class="search__box">${ic('search')}<span class="sr">SEARCH SERVICES AND PAGES</span><input data-input="q" value="${esc(PUB.q)}" placeholder="SEARCH SERVICES, PERMITS, FILINGS…" autocomplete="off"></label><div data-slot="hits">${hitsHtml(hits)}</div></div>` : ''}
    ${PUB.drawer ? drawer() : ''}
  </header>`;
}
const CAT_HUB = { 'start-my-business': '/services/business-formation', 'get-road-ready': '/services?f=get-road-ready', 'permits-taxes-compliance': '/services/permitting', 'safety-drivers': '/services?f=safety-drivers', 'operate-my-business': '/services/dispatching', 'move-freight': '/services/brokerage', 'manage-my-money': '/services/bookkeeping' };
function drawer() {
  const grp = (id, label, items) => `<div class="drawer__grp"><button data-a="grp" data-v="${id}" aria-expanded="${PUB.grp === id}">${label}${ic('caret')}</button>${PUB.grp === id ? `<div class="drawer__sub">${items.map(([p, t]) => `<a href="#${p}">${t}${ic('chev')}</a>`).join('')}</div>` : ''}</div>`;
  return `<div class="drawer" role="dialog" aria-label="MENU">
    ${grp('services', 'SERVICES', [['/services', 'ALL SERVICES'], ...D.categories.map((c) => [CAT_HUB[c.id], c.title.toUpperCase()])])}
    ${grp('solutions', 'SOLUTIONS', SOLUTIONS)}
    <div class="drawer__grp"><a href="#/about">ABOUT${ic('chev')}</a></div>
    ${grp('resources', 'RESOURCES', RESOURCES)}
    <div class="drawer__grp"><a href="#/contact">CONTACT${ic('chev')}</a></div>
    <div class="drawer__cta"><a class="btn btn--line" href="#/login">CLIENT LOGIN</a><a class="btn btn--gold" href="#/get-started">GET STARTED</a></div>
  </div>`;
}
function searchHits(q) {
  const t = q.trim().toLowerCase();
  if (!t) return D.services.filter((s) => ['trip-permits', 'ifta-filing', 'usdot-registration', 'bookkeeping', 'carrier-dispatch-support', 'commercial-auto-liability'].includes(s.slug)).map((s) => [`/services/${s.slug}`, s.name, 'SERVICE']);
  const pages = TREE.filter(([p, n, g]) => g !== 'SERVICE PAGES' && n.toLowerCase().includes(t)).map(([p, n]) => [p, n, 'PAGE']);
  const svcs = D.services.filter((s) => `${s.name} ${s.shortDescription} ${s.slug}`.toLowerCase().includes(t)).map((s) => [`/services/${s.slug}`, s.name, STATE[s.state][0]]);
  return [...pages, ...svcs].slice(0, 12);
}
const hitsHtml = (hits) => (hits.length ? `<div class="search__hits">${hits.map(([p, n, k]) => `<a class="search__hit" href="#${p}"><b>${U(n)}</b><i>${U(k)}</i></a>`).join('')}</div>` : `<p class="search__none">NOTHING MATCHES — TRY “PERMIT”, “IFTA” OR “BOOKKEEPING”.</p>`);

/* ── shared blocks ── */
const rv = (html, d = 0, tag = 'div', cls = '') => `<${tag} class="rv ${cls}" style="--d:${d}">${html}</${tag}>`;
function closing(title = 'READY TO MOVE FORWARD?', line = 'TELL US WHERE YOU ARE. WE’LL SHOW YOU THE ROAD FROM HERE.', svc = null) {
  const ctas = svc ? `${startCta(svc)}<a class="btn btn--line" href="#/contact">TALK TO AIO</a>` : `<a class="btn btn--gold" href="#/get-started">GET STARTED ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/contact">TALK TO AIO</a>`;
  return `<section class="close${svc ? ' close--svc' : ''}"><div class="close__img" style="background-image:url(${IMG('mountains-dusk')})"></div><div class="wrap close__in">
    ${rv(`<p class="eyebrow eyebrow--plain">WHERE BUSINESS MEETS THE ROAD.</p>`)}${rv(`<h2 class="h2">${title}</h2>`, 1)}${rv(`<p class="lead">${line}</p>`, 2)}
    ${rv(`<div class="close__ctas">${ctas}</div>`, 3)}</div></section>`;
}
function footer() {
  const col = (h, items) => `<div class="foot__col"><h5>${h}</h5>${items.map(([p, t]) => (p ? `<a href="#${p}">${t}</a>` : `<span class="tbc">${t}</span>`)).join('')}</div>`;
  return `<footer class="foot"><div class="wrap"><div class="foot__top">
    <div class="foot__brand"><img src="brand/aio-lockup-on-dark.png" alt="ALL IN ONE ENTERPRISES INC. — WHERE BUSINESS MEETS THE ROAD."><p>THE BUSINESS OFFICE BEHIND THE TRUCK. FROM STARTUP TO EVERY MILE AFTER.</p></div>
    ${col('SERVICES', [['/services', 'ALL SERVICES'], ['/services/permitting', 'PERMITTING & COMPLIANCE'], ['/services/business-formation', 'BUSINESS FORMATION'], ['/services/dispatching', 'DISPATCHING'], ['/services/insurance', 'INSURANCE'], ['/services/bookkeeping', 'BOOKKEEPING'], ['/services/factoring', 'FACTORING']])}
    ${col('SOLUTIONS', SOLUTIONS.map(([p, t]) => [p, t]))}
    ${col('COMPANY', [['/about', 'ABOUT'], ['/about#resources', 'TRUCKING RESOURCES'], ['/contact', 'CONTACT'], ['/request-callback', 'REQUEST A CALLBACK'], ['/schedule', 'SCHEDULE A CALL']])}
    ${col('CONTACT', [[null, 'PHONE · TO BE CONFIRMED'], [null, 'EMAIL · TO BE CONFIRMED'], ['/login', 'CLIENT LOGIN'], ['/signup', 'CREATE AN ACCOUNT']])}
  </div><div class="foot__base"><p>${U(D.disclaimer)}</p><span>© 2026 ALL IN ONE ENTERPRISES INC.</span></div></div></footer>`;
}
const facts = (items) => `<div class="wrap">${rv(`<div class="facts">${items.map(([i, b, s, extra]) => `<div class="fact">${ic(i)}<div>${extra || `<b>${b}</b>`}<span>${s}</span></div></div>`).join('')}</div>`)}</div>`;
const steps = (k, title, top = false) => `<section class="sec"${top ? '' : ' style="padding-top:0"'}><div class="wrap">${rv(`<div class="sec__head"><h2 class="h2">${title}</h2></div>`)}<div class="steps">${STEPS[k].map(([i, b, s], n) => rv(`<div class="step__top"><span class="step__n">0${n + 1}</span>${ic(i)}</div><b>${b}</b><span>${s}</span>`, n, 'div', 'step')).join('')}</div></div></section>`;
function svcCard(s) {
  const off = !s.ctaAllowed;
  return `<a class="svc rv${off ? ' svc--off' : ''}" href="#/services/${s.slug}"><div class="svc__top">${ic(svcIcon(s))}${chip(s.state)}</div><div><b>${U(s.name)}</b><p>${U(s.shortDescription)}</p></div><div class="svc__go">${off ? 'DETAILS' : 'LEARN MORE'}${ic('arrow')}</div></a>`;
}
const disclosure = (extra = []) => `<div class="disc rv">${ic('info')}<div>${extra.map((x) => `<p><b>${U(x)}</b></p>`).join('')}<p>${U(D.disclaimer)}</p></div></div>`;
function phero({ img, pos, posPhone, crumbs, eyebrow, title, lead, ctas }) {
  return `<section class="phero"><div class="phero__img" style="--img:url(${IMG(img)});${pos ? `--pos:${pos};` : ''}${posPhone ? `--pos-phone:${posPhone}` : ''}"></div><div class="wrap"><div class="phero__in">
    ${crumbs ? `<nav class="crumbs" aria-label="BREADCRUMB" style="--d:0">${crumbs.map(([p, t], i) => (i < crumbs.length - 1 ? `<a href="#${p}">${t}</a>${ic('chev')}` : `<span>${t}</span>`)).join('')}</nav>` : ''}
    ${eyebrow ? `<p class="eyebrow" style="--d:1">${eyebrow}</p>` : ''}<h1 class="h1" style="--d:2">${title}</h1>${lead ? `<p class="lead" style="--d:3">${lead}</p>` : ''}
    ${ctas ? `<div class="phero__ctas" style="--d:4">${ctas}</div>` : ''}</div></div></section>`;
}
const startCta = (s) => (s && !s.ctaAllowed ? `<span class="btn btn--gold" aria-disabled="true">${U(s.ctaLabel)}</span>` : `<a class="btn btn--gold" href="#/get-started${s ? `?service=${s.slug}` : ''}">${s ? U(s.ctaLabel) : 'GET STARTED'} ${ic('arrow', 'ic--go')}</a>`);

/* ═════════════ HOME — founder brand board panel 04 ═════════════
 * Six questions, in order, each answered once: WHO IS AIO (the approved hero, unchanged) · WHAT CAN AIO DO FOR ME (the four
 * live pathways — snap cards on the phone, a segmented selector on the tablet, a split explorer on the desktop) · WHICH
 * CUSTOMER AM I + WHERE TO BEGIN (start · operate · maintain, one stage at a time, each ending in one first step) · WHY
 * TRUST (the client portal and who does what — no figures, no testimonials) · ROAD READY™ (the six live stages) · WHAT NEXT. */
const PATH_CATS = { 'start-business': ['start-my-business', 'get-road-ready'], 'stay-compliant': ['permits-taxes-compliance', 'safety-drivers'], 'run-operation': ['operate-my-business', 'move-freight'], 'manage-money': ['manage-my-money'] };
const PATH_IMG = { 'start-business': 'night-interstate', 'stay-compliant': 'mountain-road', 'run-operation': 'fleet-yard', 'manage-money': 'highway-gold' };
const PATH_ICON = { 'start-business': 'rocket', 'stay-compliant': 'shield', 'run-operation': 'truck', 'manage-money': 'coins' };
const RANK = ['AVAILABLE', 'PILOT', 'STAFF', 'PARTNER', 'HOLD', 'PREPARING', 'SOON', 'BLOCKED', 'PAUSED'];
const pathServices = (id) => D.services.filter((s) => PATH_CATS[id].includes(s.category)).sort((a, b) => RANK.indexOf(a.state) - RANK.indexOf(b.state));
const STAGES = [
  // [icon, stage, who it is for, the line, families, first step [href, label, why]]
  ['rocket', 'START', 'YOU HAVE AN IDEA — OR YOU JUST FORMED THE COMPANY.', 'FORM IT. AUTHORIZE IT. GET IT ROAD READY.', ['start-my-business', 'get-road-ready'], ['/start-your-business', 'START WITH BUILD', 'SIX STAGES IN ORDER — BUILD, AUTHORIZE, PROTECT, REGISTER, ACTIVATE, ROLL.']],
  ['truck', 'OPERATE', 'YOUR TRUCKS ARE ROLLING AND THE OFFICE WORK IS PILING UP.', 'KEEP THE TRUCK MOVING AND THE MONEY STRAIGHT.', ['operate-my-business', 'move-freight', 'manage-my-money'], ['/get-started', 'CHECK WHAT I NEED', 'A SHORT GUIDED CHECK — YOUR ROADMAP AT THE END.']],
  ['wrench', 'MAINTAIN', 'YOU RUN A FLEET AND EVERYTHING HAS TO STAY CURRENT.', 'STAY CURRENT. STAY SAFE. STAY ON THE ROAD.', ['permits-taxes-compliance', 'safety-drivers', 'fleetcare', 'driverlink'], ['/road-ready', 'CHECK MY BUSINESS', 'ROAD READY™ SHOWS WHAT IS DONE, WHAT IS DUE AND WHAT IS MISSING.']],
];
function home() {
  const fams = (ids) => ids.map((id) => {
    if (id === 'fleetcare') return `<a class="fam" href="#/services/fleetcare">${ic('wrench')}<div><b>FLEETCARE NETWORK</b><span>MAINTENANCE & REPAIR · INDEPENDENT PROVIDERS</span></div><div class="fam__end">${ic('chev')}</div></a>`;
    if (id === 'driverlink') return `<a class="fam" href="#/services/driverlink">${ic('idcard')}<div><b>DRIVERLINK</b><span>DRIVERS AND CARRIERS · RECRUITING</span></div><div class="fam__end">${ic('chev')}</div></a>`;
    const c = catById(id);
    const list = D.services.filter((s) => s.category === id);
    const best = RANK.find((k) => list.some((s) => s.state === k));
    const st = id === 'move-freight' ? 'PAUSED' : best;
    return `<a class="fam" href="#${CAT_HUB[id]}">${ic(CAT_ICON[id])}<div><b>${U(c.title)}</b><span>${list.length} SERVICES${id === 'move-freight' ? ' · BROKERAGE PAUSED' : ''}</span></div><div class="fam__end">${chip(st)}</div></a>`;
  }).join('');
  const sel = Math.min(PUB.pathSel || 0, D.pathways.length - 1);
  const P = D.pathways[sel];
  const pServices = pathServices(P.id);
  return `
  <section class="hero" data-over-hero>
    <div class="hero__img" style="--img:url(${IMG('hero-home')})"></div>
    <div class="hero__copy">
      <p class="eyebrow eyebrow--plain" style="--d:0">ALL IN ONE ENTERPRISES INC.</p>
      <h1 class="h1 hero__h1--wide" style="--d:1"><span>FROM STARTUP</span><span class="goldtext">TO EVERY MILE AFTER.</span></h1>
      <h1 class="h1 hero__h1--phone" style="--d:1" aria-hidden="true"><span>FROM STARTUP</span><span class="goldtext">TO EVERY MILE</span><span class="goldtext">AFTER.</span></h1>
      <p class="hero__tag" style="--d:2">WHERE BUSINESS MEETS THE ROAD.</p>
      <p class="hero__body" style="--d:3">COMPLETE TRUCKING SERVICES, COMPLIANCE, AND BACK OFFICE SUPPORT — SO YOU CAN MOVE FORWARD WITH CONFIDENCE.</p>
      <div class="hero__ctas" style="--d:4"><a class="btn btn--gold" href="#/get-started">GET STARTED ${ic('arrow', 'ic--go')}</a><button class="btn btn--line" data-a="jump" data-v="begin">${ic('down')} SEE HOW IT WORKS</button></div>
    </div>
    <div class="band"><div class="band__in wrap" style="padding:0">
      <div class="band__half">${[['shield', 'TRUSTED PARTNER'], ['users', 'INDUSTRY EXPERIENCE'], ['pin', 'NATIONWIDE SUPPORT'], ['growth', 'BUILT FOR YOUR GROWTH']].map(([i, t]) => `<div class="band__p">${ic(i)}<span>${t}</span></div>`).join('')}</div>
      <div class="band__half">${[['layers', D.categories.length, 'SERVICE FAMILIES'], ['route', D.stages.length, 'ROADMAP STAGES'], ['briefcase', 12, 'OFFICE SERVICE LANES'], ['user', 1, 'CLIENT PORTAL']].map(([i, n, t]) => `<div class="band__f">${ic(i)}<div><b>${n}</b><span>${t}</span></div></div>`).join('')}</div>
    </div></div>
  </section>

  <section class="sec sec--home" id="do"><div class="wrap">
    <div class="sec__head sec__head--row">${rv(`<p class="eyebrow">PICK YOUR ROAD</p><h2 class="h2" style="margin-top:14px">WHAT CAN WE HELP YOU DO?</h2>`)}${rv(`<a class="link" href="#/services">VIEW ALL SERVICES ${ic('arrow')}</a>`, 1)}</div>
    <div class="paths">${D.pathways.map((p, i) => `<a class="path rv" style="--d:${i}" href="#${p.href}"><div class="path__img" style="--img:url(${IMG(PATH_IMG[p.id])})"></div><span class="path__no">0${i + 1}</span><span class="path__icon">${ic(PATH_ICON[p.id])}</span><b class="h3">${U(p.title)}</b><p>${U(p.description)}</p><span class="link">${U(p.ctaLabel)} ${ic('arrow')}</span></a>`).join('')}</div>
    <div class="dots" aria-hidden="true">${D.pathways.map(() => '<i></i>').join('')}</div>
    ${rv(`<div class="explore" data-key="explore">
      <div class="explore__list" role="tablist" aria-label="WHAT CAN WE HELP YOU DO?">${D.pathways.map((p, i) => `<button class="explore__tab" role="tab" aria-selected="${i === sel}" data-a="pathSel" data-v="${i}"><span class="explore__no">0${i + 1}</span><span class="explore__ic">${ic(PATH_ICON[p.id])}</span><span class="explore__t"><b>${U(p.title)}</b><em>${U(p.description)}</em></span>${ic('chev')}</button>`).join('')}</div>
      <div class="explore__panel" role="tabpanel" style="--img:url(${IMG(PATH_IMG[P.id])})">
        <div class="explore__body"><p class="eyebrow">0${sel + 1} · ${pServices.length} SERVICES</p><h3 class="h2">${U(P.title)}</h3><p class="lead">${U(P.description)}</p>
          <div class="explore__svcs">${pServices.slice(0, 6).map((s) => `<a href="#/services/${s.slug}">${ic(svcIcon(s))}<span>${U(s.name)}</span>${chip(s.state)}</a>`).join('')}</div>
          <div class="hero__ctas"><a class="btn btn--gold" href="#${P.href}">${U(P.ctaLabel)} ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#${CAT_HUB[PATH_CATS[P.id][0]]}">SEE EVERY SERVICE</a></div></div>
      </div>
    </div>`, 1)}
  </div></section>

  <section class="sec eco" id="begin"><div class="eco__img" style="--img:url(${IMG('mountain-road')})"></div><div class="wrap eco__grid">
    <div class="eco__intro">${rv(`<p class="eyebrow">WHICH ONE ARE YOU?</p>`)}${rv(`<h2 class="h2">START. OPERATE. MAINTAIN.</h2>`, 1)}${rv(`<p class="lead">YOUR BUSINESS HAS MOVING PARTS. TELL US WHERE YOU ARE — WE’LL SHOW YOU WHERE TO BEGIN.</p>`, 2)}
      <div class="eco__tabs" role="tablist" style="--i:${PUB.eco}"><span class="eco__thumb"></span>${STAGES.map(([i, t], n) => `<button role="tab" aria-selected="${PUB.eco === n}" data-a="eco" data-v="${n}"><span class="eco__dot">${ic(i)}</span><span class="eco__lbl"><b>${t}</b><em>${STAGES[n][2]}</em></span></button>`).join('')}</div>
    </div>
    <div class="eco__road">${STAGES.map(([i, t, who, line, ids, [href, label, why]], n) => `<div class="stage rv${PUB.eco === n ? ' is-on' : ''}" style="--d:${n}"><div class="stage__node"><span class="stage__dot">${ic(i)}</span><em>0${n + 1}</em></div><b class="h3">${t}</b><p class="stage__who">${who}</p><p>${line}</p><div class="fams">${fams(ids)}</div>
      <div class="begin"><div><p class="eyebrow eyebrow--plain">WHERE TO BEGIN</p><span>${why}</span></div><a class="btn btn--gold" href="#${href}">${label} ${ic('arrow', 'ic--go')}</a></div></div>`).join('')}</div>
  </div></section>

  <section class="sec sec--home"><div class="wrap office">
    <div class="office__copy">${rv(`<p class="eyebrow">WHY ALL IN ONE</p>`)}${rv(`<h2 class="h2">THE BUSINESS OFFICE BEHIND THE TRUCK.</h2>`, 1)}${rv(`<p class="lead">ONE BUSINESS. ONE RECORD. ONE PLACE TO RUN IT.</p>`, 2)}
      <div class="pillars">${[['archive', 'YOUR RECORDS', 'EVERY FILING, PERMIT AND DOCUMENT IN ONE SECURE VAULT.'], ['map', 'YOUR ROADMAP', 'WHAT IS DONE, WHAT IS NEXT AND WHAT IS DUE.'], ['layers', 'YOUR SERVICES', 'EVERY AIO SERVICE CONNECTED TO THE SAME RECORD.'], ['handshake', 'CLEAR ABOUT WHO DOES WHAT', 'AIO PREPARES AND COORDINATES. LICENSED PARTNERS PROVIDE COVERAGE AND FUNDING. AGENCIES MAKE FINAL DETERMINATIONS.']].map(([i, b, s], n) => rv(`${ic(i)}<div><b>${b}</b><span>${s}</span></div>`, n + 3, 'div', 'pillar')).join('')}</div>
      ${rv(`<div class="hero__ctas" style="margin-top:4px"><a class="btn btn--gold" href="#/client-portal">SEE THE CLIENT PORTAL ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/login">CLIENT LOGIN</a></div>`, 7)}
    </div>
    ${rv(`<div class="screen"><img src="ifta/CLIENT_1440.jpg" alt="THE APPROVED CLIENT IFTA FILING ROOM — SAMPLE QUARTER" loading="lazy"><span class="screen__tag">${ic('eye')} CLIENT PORTAL · SAMPLE RECORDS</span></div>`, 2)}
  </div></section>

  <section class="sec ready"><div class="ready__map" style="--img:url(${IMG('freight-map')})"></div><div class="wrap ready__grid">
    <div class="ready__head">${rv(`<p class="eyebrow">ROAD READY™</p>`)}${rv(`<h2 class="h2">KNOW WHERE YOU STAND. KNOW WHAT’S NEXT.</h2>`, 1)}${rv(`<p class="lead">SIX STAGES FROM IDEA TO ROLLING. CHECK YOUR BUSINESS AND GET YOUR ROADMAP.</p>`, 2)}
</div>
    <div class="rail">${D.stages.map((s, i) => rv(`<span class="st__dot">${s.number}</span><b>${U(s.title)}</b><span>${U(s.description)}</span>`, i, 'a', 'st').replace('<a class', `<a href="#${s.href}" class`)).join('')}</div>
    ${rv(`<div class="ready__ctas"><a class="btn btn--gold" href="#/road-ready">GET MY ROADMAP ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/get-started">CHECK WHAT I NEED</a></div>`, 3)}
  </div></section>
  ${closing()}`;
}

/* ═════════════ SERVICE FAMILY ═════════════
 * One explorer instead of a list + a grid of the same services: the tablet and desktop pick a service on the left and read it
 * on the right (who it is for, what you provide, the next step); the phone keeps the approved cards — six, then SHOW ALL. */
const RENEW = { annual: 'EVERY YEAR', biennial: 'EVERY TWO YEARS', quarterly: 'EVERY QUARTER', monthly: 'EVERY MONTH', as_needed: 'AS NEEDED' };
const provides = (s) => [...new Set([...(s.requirements || []), ...(s.documents || [])].map((x) => x.toUpperCase()))];
function explorer(id, list, title) {
  const pick = svcBySlug(PUB.pick[id]) && list.includes(svcBySlug(PUB.pick[id])) ? svcBySlug(PUB.pick[id]) : [...list].sort((a, b) => Number(b.ctaAllowed) - Number(a.ctaAllowed))[0];
  const open = PUB.open[id];
  const cards = open ? list : list.slice(0, 6);
  const prov = provides(pick).slice(0, 5);
  return `<div class="sec__head sec__head--row">${rv(`<p class="eyebrow">${list.length} SERVICES · ONE RECORD</p><h2 class="h2" style="margin-top:14px">${title}</h2>`)}${rv(`<a class="link" href="#/services">ALL SERVICES ${ic('arrow')}</a>`, 1)}</div>
    <div class="sx-phone"><div class="svcs">${cards.map(svcCard).join('')}</div>${list.length > 6 ? `<button class="btn btn--line sx-more" data-a="more" data-v="${id}" aria-expanded="${!!open}">${open ? 'SHOW FEWER' : `SHOW ALL ${list.length} SERVICES`} ${ic(open ? 'up' : 'down')}</button>` : ''}</div>
    ${rv(`<div class="sx">
      <div class="sx__list" role="tablist" aria-label="${esc(title)}">${list.map((x) => `<button class="sx__row" role="tab" aria-selected="${x === pick}" data-a="pick" data-v="${id}|${x.slug}">${ic(svcIcon(x))}<b>${U(x.name)}</b>${chip(x.state)}</button>`).join('')}</div>
      <div class="sx__panel" role="tabpanel">
        <div class="sx__head" style="--img:url(${IMG(PHOTO[pick.category] || 'mountain-road')})"><div><p class="eyebrow">${U(catById(pick.category).title)}</p><h3 class="h2">${U(pick.name)}</h3></div>${chip(pick.state)}</div>
        <div class="sx__body"><p class="lead">${U(pick.description)}</p>
          <div class="sx__cols">${pick.audience ? `<div><p class="eyebrow eyebrow--plain">WHO IT IS FOR</p><p>${U(pick.audience)}</p></div>` : ''}${prov.length ? `<div><p class="eyebrow eyebrow--plain">WHAT YOU PROVIDE</p><ul>${prov.map((x) => `<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul></div>` : ''}</div>
          <div class="sx__meta"><span>${ic((DELIVERY[pick.fulfillmentType] || DELIVERY.AIO_DIRECT)[1])}${(DELIVERY[pick.fulfillmentType] || DELIVERY.AIO_DIRECT)[0]}</span><span>${ic('receipt')}${PRICING[pick.pricingModel] || 'QUOTE AFTER REVIEW'}</span>${pick.renewalInterval ? `<span>${ic('calendar')}RENEWS ${RENEW[pick.renewalInterval] || U(pick.renewalInterval)}</span>` : ''}</div>
          <div class="hero__ctas"><a class="btn btn--gold" href="#/services/${pick.slug}">OPEN THIS SERVICE ${ic('arrow', 'ic--go')}</a>${pick.ctaAllowed ? `<a class="btn btn--line" href="#/get-started?service=${pick.slug}">${U(pick.ctaLabel)}</a>` : `<a class="btn btn--line" href="#/contact">ASK ABOUT IT</a>`}</div></div>
      </div>
    </div>`, 1)}`;
}
function division(id) {
  const m = D.divisions[id];
  const meta = DIVISIONS[id];
  const list = D.services.filter((s) => s.division === id);
  const paused = id === 'brokerage';
  const states = new Set(list.map((s) => s.state));
  const delivery = [...new Set(list.map((s) => s.fulfillmentType))];
  const head = phero({
    img: PHOTO[id], crumbs: [['/', 'HOME'], ['/services', 'SERVICES'], [null, U(m.title)]], eyebrow: U(m.title), title: U(m.headline), lead: U(m.description),
    ctas: paused ? `<span class="btn btn--gold" aria-disabled="true">BUSINESS ACTIVATION REQUIRED</span><a class="btn btn--line" href="#/contact">ASK ABOUT FREIGHT</a>` : `<a class="btn btn--gold" href="#/get-started?division=${id}">GET STARTED ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/request-callback">REQUEST A CALLBACK</a>`,
  });
  return `${head}
  ${facts([
    ['layers', `${list.length} SERVICES`, 'IN THIS FAMILY'],
    ['badge', '', 'STATUS', paused ? chip('PAUSED') : `<div style="display:flex;gap:6px;flex-wrap:wrap">${['AVAILABLE', 'PILOT', 'PARTNER', 'SOON', 'PREPARING'].filter((k) => states.has(k)).slice(0, 2).map(chip).join('')}</div>`],
    [delivery.includes('PARTNER_PROVIDED') ? 'handshake' : 'clipboard', delivery.map((d) => DELIVERY[d]?.[0]).filter(Boolean).slice(0, 2).join(' · ') || 'AIO PREPARES IT', 'HOW IT IS DELIVERED'],
    ['receipt', paused ? 'NOT TAKING SHIPMENTS' : 'QUOTE AFTER REVIEW', 'PRICING'],
  ])}
  ${paused ? `<section class="sec" style="padding-bottom:0"><div class="wrap"><div class="paused rv">${ic('alert')}<div><b>BROKERAGE IS PAUSED.</b><span>ALL IN ONE IS NOT ACCEPTING SHIPMENTS RIGHT NOW. THESE SERVICES ARE SHOWN SO YOU KNOW WHAT IS COMING.</span></div><a class="btn btn--line btn--sm" href="#/contact">TALK TO AIO</a></div></div></section>` : ''}
  <section class="sec"><div class="wrap">${explorer(id, list, paused ? 'WHAT BROKERAGE WILL COVER.' : `EVERY ${U(m.title)} SERVICE.`)}</div></section>
  ${steps(meta.steps, `HOW ${U(m.title)} WORKS WITH AIO.`)}
  <section class="sec" style="padding-top:0"><div class="wrap">${disclosure(list.map((s) => s.disclosure).filter((x, i, a) => x && a.indexOf(x) === i).slice(0, 2))}</div></section>
  ${closing()}`;
}

/* ═════════════ SERVICE PAGE ═════════════
 * Every page answers the same nine things, in order, with an anchored ON THIS PAGE bar: the service and its status (hero +
 * facts), who needs it, what AIO provides, what you provide, the process, what happens after, questions, the next step. The
 * words below the hero are the live service page's (src/data/services.ts) — recovered, not rewritten. */
const STEP_IC = ['send', 'clipboard', 'route', 'badge', 'done', 'archive'];
function service(s) {
  const c = catById(s.category);
  const d = D.divisions[s.division] || { title: c.title };
  const meta = DIVISIONS[s.division] || DIVISIONS.permitting;
  const related = (s.relatedSlugs || []).map(svcBySlug).filter(Boolean);
  const more = D.services.filter((x) => x.category === s.category && x.slug !== s.slug && !related.includes(x)).slice(0, Math.max(0, 3 - related.length));
  const hub = s.division && DIVISION_PATHS[s.division] ? DIVISION_PATHS[s.division] : `/services?f=${s.category}`;
  const delivery = DELIVERY[s.fulfillmentType] || DELIVERY.AIO_DIRECT;
  const k = s.fulfillmentType === 'PARTNER_PROVIDED' ? 'partner' : meta.steps;
  const inPlan = PUB.plan.includes(s.slug);
  const proc = s.process?.length ? s.process.map(([t, x], i) => [STEP_IC[i] || 'done', U(t), U(x)]) : STEPS[k];
  const prov = provides(s);
  const after = [['archive', 'KEPT ON YOUR RECORD', 'STATUS, DOCUMENTS AND MESSAGES IN YOUR CLIENT PORTAL.'], s.renewalInterval ? ['calendar', `RENEWS ${RENEW[s.renewalInterval] || U(s.renewalInterval)}`, 'AIO TRACKS THE NEXT DUE DATE ON YOUR CALENDAR.'] : ['calendar', 'NO RENEWAL CYCLE', 'REQUEST IT AGAIN WHEN YOU NEED IT.'], s.roadReadyApplicable ? ['badge', 'PART OF ROAD READY™', 'COUNTED IN YOUR ROAD READY CHECK.'] : ['layers', 'CONNECTED SERVICES', 'RELATED SERVICES STAY ON THE SAME RECORD.']];
  const faq = s.faq?.length ? s.faq : [['IS ALL IN ONE A GOVERNMENT AGENCY?', 'NO. ALL IN ONE PROVIDES ADMINISTRATIVE AND FILING ASSISTANCE. AGENCIES MAKE FINAL DETERMINATIONS.'], ['DO I NEED AN ACCOUNT?', 'NOT TO ASK A QUESTION. AN ACCOUNT KEEPS YOUR REQUESTS, DOCUMENTS AND MESSAGES ON ONE RECORD.']];
  const NAV = [['sv-overview', 'OVERVIEW'], ['sv-who', 'WHO IT’S FOR'], ['sv-provide', 'WHAT YOU PROVIDE'], ['sv-how', 'HOW IT WORKS'], ['sv-after', 'AFTER'], ['sv-faq', 'QUESTIONS']];
  return `${phero({
    img: PHOTO[s.category], crumbs: [['/', 'HOME'], ['/services', 'SERVICES'], [hub, U(d.title)], [null, U(s.name)]], eyebrow: U(c.title), title: U(s.name), lead: U(s.shortDescription),
    ctas: `${startCta(s)}${s.ctaAllowed ? `<button class="btn btn--line" data-a="plan" data-v="${s.slug}" aria-pressed="${inPlan}">${ic(inPlan ? 'check' : 'plus')} ${inPlan ? 'IN MY PLAN' : 'ADD TO MY PLAN'}</button>` : `<a class="btn btn--line" href="#/contact">ASK A QUESTION</a>`}<a class="link phero__status" href="#/login">CHECK MY STATUS ${ic('arrow')}</a>`,
  })}
  ${facts([
    ['badge', '', 'STATUS', chip(s.state)],
    [delivery[1], delivery[0], 'HOW IT IS DELIVERED'],
    ['receipt', PRICING[s.pricingModel] || 'QUOTE AFTER REVIEW', 'PRICING'],
    ['pin', s.jurisdictionDependent ? 'VARIES BY STATE' : 'NOT STATE-SPECIFIC', 'JURISDICTION'],
  ])}
  <nav class="subnav" aria-label="ON THIS PAGE"><div class="wrap subnav__in">${NAV.map(([id, t]) => `<button data-a="jump" data-v="${id}">${t}</button>`).join('')}${inPlan ? `<a class="subnav__plan" href="#/service-plan">${ic('layers')} MY PLAN · ${PUB.plan.length}</a>` : ''}</div></nav>
  <section class="sec sv" id="sv-overview"><div class="wrap ov">
    <div class="ov__copy">${rv(`<p class="eyebrow">WHAT AIO PROVIDES</p>`)}${rv(`<h2 class="h2">${U(s.name)}.</h2>`, 1)}${rv(`<p class="lead">${U(s.description)}</p>`, 2)}
      ${rv(`<div class="ov__who" id="sv-who"><p class="eyebrow eyebrow--plain">WHO IT IS FOR</p><p>${U(s.audience || c.headline)}</p>${s.needsFor?.length ? `<div class="ov__tags">${s.needsFor.map((n) => `<span>${U(n)}</span>`).join('')}</div>` : ''}</div>`, 3)}</div>
    ${rv(`<div class="ov__media"><div class="photo__img" style="--img:url(${IMG(PHOTO[s.category] === 'mountain-road' ? 'highway-gold' : 'mountain-road')})"></div><p class="ov__tagline">${meta.lines.join('<br>')}</p>
      <div class="ov__provide" id="sv-provide"><p class="eyebrow eyebrow--plain">WHAT YOU PROVIDE</p>${prov.length ? `<ul>${prov.map((x) => `<li>${ic('upload')}<span>${x}</span></li>`).join('')}</ul>` : `<p>NOTHING UP FRONT — AIO ASKS WHAT IT NEEDS AFTER REVIEW.</p>`}${s.documentsRequired ? `<span class="note">UPLOADED ONCE TO YOUR SECURE VAULT.</span>` : ''}</div></div>`, 1)}
  </div></section>
  <section class="sec sv" id="sv-how" style="padding-top:0"><div class="wrap">${rv(`<div class="sec__head"><h2 class="h2">HOW IT WORKS.</h2></div>`)}
    <div class="steps" style="--n:${proc.length}">${proc.map(([i, b, x], n) => rv(`<div class="step__top"><span class="step__n">0${n + 1}</span>${ic(i)}</div><b>${b}</b>${x ? `<span>${x}</span>` : ''}`, n, 'div', 'step')).join('')}</div>
    ${rv(`<div class="after" id="sv-after"><p class="eyebrow eyebrow--plain">AFTER IT IS DONE</p>${after.map(([i, b, x]) => `<div>${ic(i)}<span><b>${b}</b>${x}</span></div>`).join('')}</div>`, 2)}
  </div></section>
  <section class="sec sv" id="sv-faq" style="padding-top:0"><div class="wrap cols cols--wide">
    <div>${rv(`<div class="sec__head" style="margin-bottom:22px"><h2 class="h2">QUESTIONS.</h2></div>`)}${rv(`<div class="faq">${faq.map(([q, a], n) => `<details${n === 0 ? ' open' : ''}><summary>${U(q)}${ic('caret')}</summary><p>${U(a)}</p></details>`).join('')}</div>`, 1)}</div>
    <div class="sv-side">${rv(`<div class="nextstep"><p class="eyebrow">NEXT STEP</p><h3 class="h3">${s.ctaAllowed ? `READY FOR ${U(s.name)}?` : 'NOT TAKING REQUESTS YET.'}</h3><p>${s.ctaAllowed ? 'START IT NOW, ADD IT TO YOUR PLAN, OR TALK IT THROUGH WITH THE AIO TEAM.' : 'TALK TO AIO AND WE WILL TELL YOU WHAT IS POSSIBLE TODAY.'}</p><div class="hero__ctas">${startCta(s)}<a class="btn btn--line" href="#/contact">TALK TO AIO</a></div></div>`, 1)}${disclosure([s.disclosure].filter(Boolean))}</div>
  </div></section>
  ${related.length + more.length ? `<section class="sec sv" style="padding-top:0"><div class="wrap"><div class="sec__head sec__head--row">${rv(`<h2 class="h2">OFTEN PAIRED WITH.</h2>`)}${rv(`<a class="link" href="#${hub}">ALL ${U(d.title)} ${ic('arrow')}</a>`, 1)}</div><div class="svcs svcs--rail">${[...related, ...more].slice(0, 3).map(svcCard).join('')}</div></div></section>` : ''}
  `; // the next step sits beside QUESTIONS — no second closing band repeating the hero's action
}
const DIVISION_PATHS = { permitting: '/services/permitting', 'business-formation': '/services/business-formation', insurance: '/services/insurance', dispatching: '/services/dispatching', brokerage: '/services/brokerage', bookkeeping: '/services/bookkeeping', factoring: '/services/factoring' };

function bookkeeping() {
  const m = D.divisions.bookkeeping;
  const plans = D.plans;
  const list = D.services.filter((s) => s.division === 'bookkeeping');
  return `${phero({ img: 'valley-trail', pos: '60% 60%', crumbs: [['/', 'HOME'], ['/services', 'SERVICES'], [null, 'BOOKKEEPING']], eyebrow: 'BOOKKEEPING BUILT FOR TRUCKING', title: U(m.headline), lead: U(m.description), ctas: `<a class="btn btn--gold" href="#/services/bookkeeping/assessment">ASSESS MY BOOKS ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" data-a="jump" data-v="plans" href="#/services/bookkeeping">SEE THE PLANS</a>` })}
  ${facts([['layers', `${plans.length} PLANS`, 'PLUS BOOKS RESCUE'], ['badge', '', 'STATUS', chip(svcBySlug('bookkeeping')?.state)], ['clipboard', 'AIO PREPARES IT', 'HOW IT IS DELIVERED'], ['receipt', 'NOT YET PUBLISHED', 'PRICING']])}
  <section class="sec" id="plans"><div class="wrap">
    <div class="sec__head">${rv(`<p class="eyebrow">THREE PLANS</p>`)}${rv(`<h2 class="h2">CHOOSE HOW MUCH OF THE BACK OFFICE WE RUN.</h2>`, 1)}</div>
    <div class="plans">${plans.map((p, i) => rv(`${i === plans.length - 1 ? '<span class="plan__flag">MOST COMPLETE</span>' : ''}<div><b class="h3">${U(p.name)}</b><p class="muted" style="margin:8px 0 0;font-size:var(--small);letter-spacing:.1em">${U(p.tagline)}</p></div><div class="plan__price"><b>PRICE ON REQUEST</b><span>PUBLISHED PRICING IS AWAITING APPROVAL</span></div><ul>${p.features.slice(0, 7).map((f) => `<li>${ic('check')}<span>${U(f)}</span></li>`).join('')}</ul><a class="btn ${i === plans.length - 1 ? 'btn--gold' : 'btn--line'}" href="#/services/bookkeeping/assessment">START WITH AN ASSESSMENT</a>`, i, 'div', `plan${i === plans.length - 1 ? ' plan--mid' : ''}`)).join('')}</div>
  </div></section>
  ${steps('books', 'HOW BOOKKEEPING WORKS WITH AIO.')}
  <section class="sec" style="padding-top:0"><div class="wrap"><div class="sec__head">${rv(`<h2 class="h2">CATEGORIZED THE TRUCKING WAY.</h2>`)}</div>${rv(`<div style="display:flex;flex-wrap:wrap;gap:8px">${D.bookCategories.map((c) => `<span class="chip" style="color:var(--champagne)">${U(c)}</span>`).join('')}</div>`, 1)}</div></section>
  <section class="sec" style="padding-top:0"><div class="wrap">${explorer('bookkeeping', list, 'EVERY BOOKKEEPING SERVICE.')}</div></section>
  <section class="sec" style="padding-top:0"><div class="wrap">${disclosure()}</div></section>
  ${closing()}`;
}

/* ═════════════ SERVICES HUB + FINDER ═════════════ */
function services() {
  const f = PUB.fam;
  const q = PUB.fq.trim().toLowerCase();
  const list = D.services.filter((s) => (f === 'all' || s.category === f) && (!q || `${s.name} ${s.shortDescription}`.toLowerCase().includes(q)));
  /* the whole catalog at a glance: one compact index grouped by family (accordions on the phone) — cards only once a family or a search narrows it */
  const index = f === 'all' && !q;
  const wide = (ROOT?.clientWidth || PUB.width || 0) >= 600; // tablet + desktop show every family open; the phone opens the first
  const idx = D.categories.map((c, i) => {
    const xs = D.services.filter((s) => s.category === c.id);
    const best = c.id === 'move-freight' ? 'PAUSED' : RANK.find((k) => xs.some((s) => s.state === k));
    return `<details class="idx__fam rv" style="--d:${i % 3}"${i === 0 || wide ? ' open' : ''}><summary>${ic(CAT_ICON[c.id])}<span><b>${U(c.title)}</b><em>${xs.length} SERVICES</em></span>${chip(best)}${ic('caret')}</summary>
      <div class="idx__rows">${xs.map((s) => `<a href="#/services/${s.slug}"><span>${U(s.name)}</span>${chip(s.state)}</a>`).join('')}<button class="link" data-a="fam" data-v="${c.id}">OPEN ${U(c.title)} ${ic('arrow')}</button></div></details>`;
  }).join('');
  return `${phero({ img: 'mountain-road', crumbs: [['/', 'HOME'], [null, 'SERVICES']], eyebrow: 'SERVICES', title: 'EVERYTHING YOUR BUSINESS NEEDS.', lead: 'SEVEN FAMILIES OF SERVICES BEHIND YOUR TRUCKING BUSINESS — EACH WITH ITS STATUS SHOWN HONESTLY.', ctas: `<a class="btn btn--gold" href="#/services/find">FIND MY SERVICE ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/get-started">CHECK WHAT I NEED</a>` })}
  <section class="sec" style="padding-top:56px"><div class="wrap">
    <div class="sec__head" style="gap:18px">
      <div class="fambar" role="tablist" aria-label="SERVICE FAMILIES">${[['all', 'ALL SERVICES', 'layers', D.services.length], ...D.categories.map((c) => [c.id, c.title, CAT_ICON[c.id], D.services.filter((s) => s.category === c.id).length])].map(([id, t, i, n]) => `<button class="fambar__b" role="tab" data-a="fam" data-v="${id}" aria-selected="${f === id}">${ic(i)}<span><b>${U(t)}</b><em>${n}</em></span></button>`).join('')}</div>
      <label class="search__box" style="margin:0;max-width:none">${ic('search')}<span class="sr">FILTER SERVICES</span><input data-input="fq" value="${esc(PUB.fq)}" placeholder="FILTER BY NAME — “UCR”, “IFTA”, “DISPATCH”…" autocomplete="off"></label>
    </div>
    ${f !== 'all' ? `<div class="sec__head sec__head--row" style="margin-bottom:22px"><div><p class="eyebrow">${U(catById(f).title)}</p><h2 class="h2" style="margin-top:12px">${U(catById(f).headline)}</h2></div>${['move-freight'].includes(f) ? chip('PAUSED') : ''}</div>` : ''}
    ${index ? `<div class="idx" data-slot="svcs-index">${idx}</div><div class="svcs" data-slot="svcs" hidden></div>` : `<div class="svcs" data-slot="svcs">${list.map(svcCard).join('') || `<p class="muted">NO SERVICE MATCHES THAT FILTER.</p>`}</div>`}
  </div></section>${closing()}`;
}
function finder() {
  const picked = D.needs.filter((n) => PUB.needs.includes(n.id));
  const rec = [...new Set(picked.flatMap((n) => n.recommendedSlugs))].map(svcBySlug).filter(Boolean);
  return `${phero({ img: 'highway-gold', crumbs: [['/', 'HOME'], ['/services', 'SERVICES'], [null, 'FIND A SERVICE']], eyebrow: 'FIND A SERVICE', title: 'WHAT DO YOU NEED HELP WITH?', lead: 'PICK EVERYTHING THAT APPLIES. WE WILL SHOW YOU WHERE TO START.' })}
  <section class="sec" style="padding-top:56px"><div class="wrap cols cols--wide">
    <div><div class="choices" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))">${D.needs.map((n) => `<button class="choice" data-a="need" data-v="${n.id}" aria-pressed="${PUB.needs.includes(n.id)}">${ic('compass')}<div><b>${U(n.label)}</b><span>${U(n.description)}</span></div><span class="choice__tick">${ic('check')}</span></button>`).join('')}</div></div>
    <aside class="panel" style="position:sticky;top:calc(var(--nav) + 20px)"><p class="eyebrow">WHERE TO START</p><h3 class="h3" style="margin:12px 0 18px">${rec.length ? `${rec.length} SERVICES FOR YOU` : 'CHOOSE WHAT APPLIES'}</h3>
      <div class="list">${rec.length ? rec.map((s) => `<a class="row" href="#/services/${s.slug}">${ic(svcIcon(s))}<div><b>${U(s.name)}</b><span>${STATE[s.state][0]}</span></div>${ic('chev')}</a>`).join('') : `<p class="note">YOUR RECOMMENDATIONS APPEAR HERE AS YOU CHOOSE.</p>`}</div>
      ${rec.length ? `<a class="btn btn--gold" style="width:100%;margin-top:18px" href="#/get-started">CONTINUE TO GET STARTED ${ic('arrow', 'ic--go')}</a>` : ''}</aside>
  </div></section>${closing()}`;
}

/* ═════════════ PRODUCT PAGES ═════════════ */
function factoring() {
  const m = D.divisions.factoring;
  const list = D.services.filter((s) => s.division === 'factoring');
  return `${phero({ img: 'highway-gold', crumbs: [['/', 'HOME'], ['/services', 'SERVICES'], [null, 'FACTORING']], eyebrow: 'FACTORING · PARTNER REFERRAL', title: U(m.headline), lead: U(m.description), ctas: `${startCta(list[0])}<a class="btn btn--line" href="#/contact">ASK A QUESTION</a>` })}
  ${facts([['handshake', 'APPROVED PARTNERS', 'WHO FUNDS'], ['badge', '', 'STATUS', chip(list[0]?.state)], ['shield', 'ALL IN ONE DOES NOT FUND', 'WHAT AIO DOES NOT DO'], ['receipt', 'PARTNER QUOTE', 'PRICING']])}
  ${steps('partner', 'HOW FACTORING WORKS WITH AIO.', true)}
  <section class="sec" style="padding-top:0"><div class="wrap"><div class="svcs">${list.map(svcCard).join('')}</div></div></section>
  <section class="sec" style="padding-top:0"><div class="wrap">${disclosure([list[0]?.disclosure, 'PARTNER REFERRAL — ALL IN ONE DOES NOT FUND RECEIVABLES.'].filter(Boolean))}</div></section>${closing()}`;
}
function fleetcare(sub) {
  if (sub === 'plans') return `${phero({ img: 'fleet-yard', crumbs: [['/', 'HOME'], ['/services/fleetcare', 'FLEETCARE'], [null, 'PLANS']], eyebrow: 'FLEETCARE+', title: 'FLEETCARE PLANS.', lead: 'PLATFORM PLANS FOR CLIENTS. REPAIR SERVICE IS BILLED SEPARATELY BY YOUR INDEPENDENT PROVIDER.' })}
    <section class="sec" style="padding-top:56px"><div class="wrap"><div class="plans">${D.fleetPlans.client.map((p, i) => rv(`<div><b class="h3">${U(p)}</b></div><div class="plan__price"><b>PRICE ON REQUEST</b><span>PUBLISHED PRICING IS AWAITING APPROVAL</span></div><ul>${['REQUEST SERVICE FROM YOUR PORTAL', 'MATCHED WITH INDEPENDENT PROVIDERS', 'REPAIR RECORDS KEPT WITH THE TRUCK'].map((f) => `<li>${ic('check')}<span>${f}</span></li>`).join('')}</ul><a class="btn ${i === 1 ? 'btn--gold' : 'btn--line'}" href="#/signup">CREATE AN ACCOUNT</a>`, i, 'div', `plan${i === 1 ? ' plan--mid' : ''}`)).join('')}</div></div></section>
    <section class="sec" style="padding-top:0"><div class="wrap">${disclosure([D.fleetDisclosures.independentProvider, D.fleetDisclosures.referralEconomic])}</div></section>${closing()}`;
  if (sub === 'join' || sub === 'apply') return formPage({ img: 'fleet-yard', crumbs: [['/', 'HOME'], ['/services/fleetcare', 'FLEETCARE'], [null, sub === 'join' ? 'JOIN' : 'APPLY']], eyebrow: 'INDEPENDENT REPAIR BUSINESSES', title: sub === 'join' ? 'JOIN THE FLEETCARE NETWORK.' : 'FLEETCARE PROVIDER APPLICATION.', lead: 'TELL US ABOUT YOUR SHOP. AIO REVIEWS ELIGIBILITY BEFORE ANY WORK IS ROUTED TO YOU.', id: `fc-${sub}`, fields: [['SHOP NAME', 'text'], ['CONTACT NAME', 'text'], ['PHONE', 'tel'], ['EMAIL', 'email'], ['CITY & STATE', 'text'], ['SERVICES YOU OFFER', 'textarea']], submit: sub === 'join' ? 'START MY APPLICATION' : 'SUBMIT APPLICATION', side: [D.fleetDisclosures.verifiedBadge, D.fleetDisclosures.independentProvider] });
  return `${phero({ img: 'fleet-yard', crumbs: [['/', 'HOME'], ['/services', 'SERVICES'], [null, 'FLEETCARE']], eyebrow: 'AIO FLEETCARE NETWORK', title: 'KEEP YOUR TRUCKS MOVING.', lead: 'REQUEST SERVICE, GET MATCHED WITH AN INDEPENDENT FLEETCARE PROVIDER, TRACK YOUR REPAIR, AND KEEP THE RECORD WITH YOUR TRUCK.', ctas: `<a class="btn btn--gold" href="#/login">REQUEST SERVICE ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/services/fleetcare/plans">EXPLORE FLEETCARE+</a>` })}
  ${facts([['wrench', 'INDEPENDENT PROVIDERS', 'WHO DOES THE WORK'], ['clipboard', 'ESTIMATE FIRST', 'YOU AUTHORIZE'], ['archive', 'WITH THE TRUCK', 'WHERE RECORDS LIVE'], ['users', 'REPAIR SHOPS', 'JOIN THE NETWORK']])}
  <section class="sec"><div class="wrap"><div class="sec__head">${rv(`<h2 class="h2">HOW FLEETCARE WORKS.</h2>`)}</div><div class="steps" style="grid-template-columns:repeat(4,minmax(0,1fr))">${[['truck', 'SELECT YOUR VEHICLE AND DESCRIBE THE ISSUE'], ['users', 'AIO MATCHES ELIGIBLE INDEPENDENT PROVIDERS IN YOUR AREA'], ['clipboard', 'REVIEW THE ESTIMATE AND AUTHORIZE WORK'], ['archive', 'TRACK SERVICE AND STORE RECORDS IN YOUR VEHICLE HISTORY']].map(([i, t], n) => rv(`<div class="step__top"><span class="step__n">0${n + 1}</span>${ic(i)}</div><b>${t}</b>`, n, 'div', 'step')).join('')}</div></div></section>
  <section class="sec" style="padding-top:0"><div class="wrap cols"><div class="panel rv"><p class="eyebrow">FOR CLIENTS</p><h3 class="h3" style="margin:12px 0">FLEETCARE PLANS</h3><p class="muted" style="font-size:var(--small)">REPAIR SERVICE IS BILLED SEPARATELY BY YOUR INDEPENDENT PROVIDER.</p><a class="link" style="margin-top:16px" href="#/services/fleetcare/plans">SEE THE PLANS ${ic('arrow')}</a></div><div class="panel rv" style="--d:1"><p class="eyebrow">FOR REPAIR BUSINESSES</p><h3 class="h3" style="margin:12px 0">JOIN THE NETWORK</h3><p class="muted" style="font-size:var(--small)">INDEPENDENT SHOPS APPLY; AIO REVIEWS ELIGIBILITY.</p><a class="link" style="margin-top:16px" href="#/fleetcare/providers/join">JOIN FLEETCARE ${ic('arrow')}</a></div></div></section>
  <section class="sec" style="padding-top:0"><div class="wrap">${disclosure([D.fleetDisclosures.independentProvider, D.fleetDisclosures.referralEconomic])}</div></section>${closing()}`;
}
function driverlink(sub) {
  if (sub === 'signup') return formPage({ img: 'night-interstate', crumbs: [['/', 'HOME'], ['/services/driverlink', 'DRIVERLINK'], [null, 'DRIVER PROFILE']], eyebrow: 'AIO DRIVERLINK', title: 'CREATE YOUR DRIVER PROFILE.', lead: 'ORGANIZE YOUR CREDENTIALS ONCE. SHARE ONLY WHAT YOU AUTHORIZE, APPLICATION BY APPLICATION.', id: 'dl-signup', fields: [['FULL NAME', 'text'], ['EMAIL', 'email'], ['PHONE', 'tel'], ['CDL CLASS', 'select:CLASS A|CLASS B|CLASS C'], ['HOME STATE', 'text']], submit: 'CREATE MY PROFILE', side: [D.driverDisclosures.dataRelease, D.driverDisclosures.notEmployer] });
  return `${phero({ img: 'night-interstate', crumbs: [['/', 'HOME'], ['/services', 'SERVICES'], [null, 'DRIVERLINK']], eyebrow: 'AIO DRIVERLINK', title: 'DRIVERS AND CARRIERS, CONNECTED.', lead: U(D.driverLead), ctas: `<a class="btn btn--gold" href="#/driverlink/signup">I’M A DRIVER ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/login">I’M A TRUCKING COMPANY</a>` })}
  <section class="sec"><div class="wrap"><div class="sec__head">${rv(`<h2 class="h2">HOW DRIVERLINK WORKS.</h2>`)}</div><div class="steps" style="grid-template-columns:repeat(4,minmax(0,1fr))">${D.driverSteps.map((t, n) => rv(`<div class="step__top"><span class="step__n">0${n + 1}</span>${ic(['idcard', 'briefcase', 'users', 'clipboard'][n])}</div><b>${U(t)}</b>`, n, 'div', 'step')).join('')}</div></div></section>
  <section class="sec" style="padding-top:0"><div class="wrap">${disclosure([D.driverDisclosures.marketplace, D.driverDisclosures.notEmployer])}</div></section>${closing()}`;
}
function ifta() {
  const v = PUB.width < 600 ? '393' : PUB.width < 1100 ? '834' : '1440';
  return `<section class="approved"><div class="approved__bar"><span>${ic('badge')} THE APPROVED IFTA PUBLIC PAGE — FOUNDER AUTHORITY, SHOWN UNCHANGED</span><a class="link" href="#/services">BACK TO SERVICES ${ic('arrow')}</a></div><img src="ifta/PUBLIC_${v}.jpg" alt="THE APPROVED IFTA FILING PUBLIC PAGE"></section>`;
}

/* ═════════════ SOLUTIONS ═════════════ */
function startBusiness(step) {
  const steps = D.journey;
  if (step) {
    const s = steps.find((x) => x.route.endsWith(`/${step}`));
    const i = steps.indexOf(s);
    const svcs = (s.serviceSlugs || []).map(svcBySlug).filter(Boolean);
    return `${phero({ img: ['aio-login', 'mountain-road', 'night-interstate', 'highway-gold', 'fleet-yard', 'valley-trail'][i] || 'aio-login', crumbs: [['/', 'HOME'], ['/start-your-business', 'START YOUR BUSINESS'], [null, U(s.title)]], eyebrow: `STAGE ${s.number} OF 0${steps.length}`, title: `${U(s.title)}.`, lead: U(s.subtitle || s.description || ''), ctas: `<a class="btn btn--gold" href="#/get-started">GET STARTED ${ic('arrow', 'ic--go')}</a>` })}
    <section class="sec" style="padding-top:56px"><div class="wrap"><div class="rail" style="margin:0 0 56px">${steps.map((x) => `<a class="st${x === s ? ' is-cur' : ''}" href="#${x.route.startsWith('/start-your-business') ? x.route : x.route}"><span class="st__dot"${x === s ? ' style="background:var(--gold);color:#17130b"' : ''}>${x.number}</span><b>${U(x.title)}</b></a>`).join('')}</div>
    <div class="sec__head">${rv(`<h2 class="h2">WHAT HAPPENS IN ${U(s.title)}.</h2>`)}</div><div class="svcs">${svcs.length ? svcs.map(svcCard).join('') : D.services.filter((x) => x.category === (i < 1 ? 'start-my-business' : i < 4 ? 'get-road-ready' : 'permits-taxes-compliance')).slice(0, 6).map(svcCard).join('')}</div></div></section>${closing()}`;
  }
  const k = Math.min(PUB.syb || 0, steps.length - 1);
  const cur = steps[k];
  const cs = (cur.serviceSlugs || []).map(svcBySlug).filter(Boolean);
  const csList = cs.length ? cs : D.services.filter((x) => x.category === (k < 1 ? 'start-my-business' : k < 4 ? 'get-road-ready' : 'permits-taxes-compliance')).slice(0, 4);
  return `${phero({ img: 'aio-login', pos: '75% 50%', crumbs: [['/', 'HOME'], [null, 'START YOUR BUSINESS']], eyebrow: 'START YOUR BUSINESS', title: 'FROM IDEA TO RUNNING YOUR TRUCKING BUSINESS.', lead: 'SIX STAGES, IN ORDER. AIO HELPS AT EVERY ONE — AND KEEPS IT ALL ON ONE RECORD.', ctas: `<a class="btn btn--gold" href="#/start-your-business/build">START WITH BUILD ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/get-started">CHECK WHAT I NEED</a>` })}
  <section class="sec" style="padding-top:64px"><div class="wrap">
    ${rv(`<div class="sec__head"><p class="eyebrow">THE JOURNEY</p><h2 class="h2">PICK A STAGE TO SEE WHAT HAPPENS IN IT.</h2></div>`)}
    <div class="rail rail--pick" role="tablist" aria-label="THE SIX STAGES">${steps.map((s, i) => `<button class="st${i === k ? ' is-cur' : ''}" role="tab" aria-selected="${i === k}" data-a="syb" data-v="${i}"><span class="st__dot">${s.number}</span><b>${U(s.title)}</b><span>${U(D.stages[i]?.description || '')}</span></button>`).join('')}</div>
    <div class="journey" role="tabpanel"><div class="journey__copy"><p class="eyebrow">STAGE ${cur.number} OF 0${steps.length}</p><h3 class="h2">${U(cur.title)}.</h3><p class="lead">${U(cur.description || D.stages[k]?.description || '')}</p>
      <div class="hero__ctas"><a class="btn btn--gold" href="#${cur.route}">OPEN ${U(cur.title)} ${ic('arrow', 'ic--go')}</a>${k < steps.length - 1 ? `<button class="btn btn--line" data-a="syb" data-v="${k + 1}">NEXT: ${U(steps[k + 1].title)} ${ic('chev')}</button>` : ''}</div></div>
      <div class="list">${csList.map((x) => `<a class="row" href="#/services/${x.slug}">${ic(svcIcon(x))}<div><b>${U(x.name)}</b><span>${U(x.shortDescription)}</span></div>${chip(x.state)}</a>`).join('')}</div></div>
  </div></section>${closing()}`;
}
function roadReady() {
  return `${phero({ img: 'highway-gold', crumbs: [['/', 'HOME'], [null, 'ROAD READY™']], eyebrow: 'ROAD READY™', title: 'KNOW WHERE YOU STAND. KNOW WHAT’S NEXT.', lead: 'A GUIDED CHECK OF YOUR AUTHORITY, REGISTRATIONS, FILINGS AND COVERAGE — AND A ROADMAP FOR WHAT IS MISSING.', ctas: `<a class="btn btn--gold" href="#/get-started">CHECK MY BUSINESS ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/roadmap">SEE THE COMPLIANCE GUIDE</a>` })}
  ${facts([['route', `${D.stages.length} STAGES`, 'BUILD TO ROLL'], ['clipboard', 'A FEW MINUTES', 'THE CHECK'], ['map', 'YOUR ROADMAP', 'WHAT YOU GET'], ['lock', 'NO ACCOUNT NEEDED', 'TO START THE CHECK']])}
  <section class="sec"><div class="wrap"><div class="sec__head">${rv(`<h2 class="h2">WHAT THE CHECK COVERS.</h2>`)}</div><div class="svcs">${D.services.filter((s) => s.roadReadyApplicable).slice(0, 9).map(svcCard).join('')}</div></div></section>${closing()}`;
}
function roadmap(results) {
  if (results) {
    const picked = D.needs.filter((n) => PUB.gs.needs.includes(n.id));
    const rec = [...new Set((picked.length ? picked : D.needs.slice(0, 2)).flatMap((n) => n.recommendedSlugs))].map(svcBySlug).filter(Boolean);
    return `${phero({ img: 'mountain-road', crumbs: [['/', 'HOME'], ['/get-started', 'GET STARTED'], [null, 'YOUR ROADMAP']], eyebrow: 'YOUR ALL IN ONE ROADMAP', title: 'HERE IS YOUR ROAD.', lead: picked.length ? `BASED ON: ${picked.map((n) => U(n.label)).join(' · ')}` : 'A SAMPLE ROADMAP — ANSWER THE CHECK TO MAKE IT YOURS.', ctas: `<a class="btn btn--gold" href="#/service-plan">BUILD MY SERVICE PLAN ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/get-started">CHANGE MY ANSWERS</a>` })}
    <section class="sec" style="padding-top:56px"><div class="wrap"><div class="svcs">${rec.map(svcCard).join('')}</div></div></section>${closing()}`;
  }
  /* the guide: one family at a time (a bounded chip row on the phone, a tab rail on the tablet and desktop) — not seven stacked lists */
  const gid = D.categories.some((c) => c.id === PUB.pick.guide) ? PUB.pick.guide : D.categories[0].id;
  const gc = catById(gid);
  const gl = D.services.filter((x) => x.category === gid);
  return `${phero({ img: 'freight-map', pos: '50% 50%', crumbs: [['/', 'HOME'], [null, 'COMPLIANCE GUIDE']], eyebrow: 'COMPLIANCE GUIDE', title: 'THE ALL IN ONE ROADMAP.', lead: 'WHAT A TRUCKING BUSINESS NEEDS, IN THE ORDER IT NEEDS IT.', ctas: `<a class="btn btn--gold" href="#/get-started">MAKE IT MINE ${ic('arrow', 'ic--go')}</a>` })}
  <section class="sec" style="padding-top:64px"><div class="wrap guide">
    <div class="guide__tabs" role="tablist" aria-label="THE SEVEN FAMILIES">${D.categories.map((c) => `<button role="tab" aria-selected="${c.id === gid}" data-a="pick" data-v="guide|${c.id}"><span>0${c.order}</span>${ic(CAT_ICON[c.id])}<b>${U(c.title)}</b><em>${D.services.filter((x) => x.category === c.id).length}</em></button>`).join('')}</div>
    <div class="guide__panel panel" role="tabpanel"><p class="eyebrow">0${gc.order} · ${U(gc.title)}</p><h2 class="h2" style="margin:12px 0 10px">${U(gc.headline)}</h2><p class="lead" style="margin-bottom:22px">${U(gc.description)}</p>
      <div class="list">${gl.map((x) => `<a class="row" href="#/services/${x.slug}">${ic(svcIcon(x))}<div><b>${U(x.name)}</b><span>${U(x.shortDescription)}</span></div>${chip(x.state)}</a>`).join('')}</div>
      <div class="hero__ctas" style="margin-top:22px"><a class="btn btn--gold" href="#${CAT_HUB[gid].startsWith('/services?') ? '/services' : CAT_HUB[gid]}">OPEN ${U(gc.title)} ${ic('arrow', 'ic--go')}</a>${gc.order < D.categories.length ? `<button class="btn btn--line" data-a="pick" data-v="guide|${D.categories.find((c) => c.order === gc.order + 1)?.id || gid}">NEXT FAMILY ${ic('chev')}</button>` : ''}</div></div>
  </div></section>${closing()}`;
}
function clientPortal() {
  return `${phero({ img: 'highway-gold', pos: '80% 50%', crumbs: [['/', 'HOME'], [null, 'CLIENT PORTAL']], eyebrow: 'CLIENT PORTAL', title: 'YOUR BUSINESS. ONE COMMAND CENTER.', lead: 'ONE BUSINESS. ONE RECORD. ONE PLACE TO RUN IT.', ctas: `<a class="btn btn--gold" href="#/login">CLIENT LOGIN ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/signup">CREATE AN ACCOUNT</a>` })}
  <section class="sec" style="padding-top:64px"><div class="wrap office">${rv(`<div class="screen"><img src="ifta/CLIENT_1440.jpg" alt="THE APPROVED CLIENT IFTA FILING ROOM"><span class="screen__tag">${ic('eye')} IFTA FILING ROOM · SAMPLE</span></div>`)}
    <div class="pillars">${[['archive', 'DOCUMENTS & VAULT', 'EVERY FILING, PERMIT AND CERTIFICATE ON ONE RECORD.'], ['calendar', 'RENEWALS & DEADLINES', 'WHAT IS DUE, BEFORE IT IS LATE.'], ['message', 'MESSAGES', 'ONE THREAD WITH THE AIO TEAM.'], ['receipt', 'BILLING', 'INVOICES AND PAYMENTS IN ONE PLACE.'], ['layers', 'YOUR SERVICES', 'EVERY AIO SERVICE YOU USE, CONNECTED.']].map(([i, b, s], n) => rv(`${ic(i)}<div><b>${b}</b><span>${s}</span></div>`, n, 'div', 'pillar')).join('')}</div></div></section>${closing()}`;
}

/* ═════════════ GET STARTED (Smart Intake) and the request flow ═════════════ */
/* ═════════════ GET STARTED — the live Smart Intake, restyled ═════════════
 * The sections, questions, options and goal branches are the live ones (src/intake/intakeConfig.ts, bundled), so the design
 * cannot quietly drop a question. The phone shows STEP N OF M; the tablet a segmented progress bar; the desktop a step rail. */
const US = 'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
function gsQuestion(q) {
  const a = PUB.gs.ans[q.id];
  const req = q.required ? '<em class="req">REQUIRED</em>' : '';
  if (q.id === 'goal') return `<div class="choices choices--goal">${q.options.map(([v, l, d]) => { const off = v === 'move_freight'; return `<button class="choice${off ? ' choice--off' : ''}" data-a="gsGoal" data-v="${v}" aria-pressed="${PUB.gs.goal === v}"${off ? ' aria-disabled="true" aria-describedby="gs-paused"' : ''}>${ic(off ? 'package' : 'compass')}<div><b>${U(l)}</b><span>${U(d)}</span>${off ? `<span id="gs-paused">${chip('PAUSED')} BROKERAGE IS PAUSED — AIO IS NOT TAKING SHIPMENTS</span>` : ''}</div><span class="choice__tick">${ic('check')}</span></button>`; }).join('')}</div>`;
  if (q.type === 'single_select' && q.id.startsWith('asset_')) return `<div class="gs-asset"><b>${U(q.question)}</b><div class="seg" role="radiogroup" aria-label="${esc(U(q.question))}">${q.options.map(([v, l]) => `<button role="radio" aria-checked="${a === v}" data-a="gsAns" data-v="${q.id}|${v}">${U(l)}</button>`).join('')}</div></div>`;
  const label = `<p class="gs-q">${U(q.question)}${req}</p>${q.description ? `<p class="note">${U(q.description)}</p>` : ''}`;
  if (q.type === 'single_select') return `<div class="gs-field">${label}<div class="choices choices--sm">${q.options.map(([v, l, d]) => `<button class="choice" data-a="gsAns" data-v="${q.id}|${v}" aria-pressed="${a === v}"><div><b>${U(l)}</b>${d ? `<span>${U(d)}</span>` : ''}</div><span class="choice__tick">${ic('check')}</span></button>`).join('')}</div></div>`;
  if (q.type === 'multi_select') return `<div class="gs-field">${label}<div class="pills">${q.options.map(([v, l]) => `<button class="pill" data-a="gsMulti" data-v="${q.id}|${v}" aria-pressed="${(a || []).includes(v)}">${(a || []).includes(v) ? ic('check') : ''}${U(l)}</button>`).join('')}</div></div>`;
  const id = `gs-${q.id}`;
  if (q.type === 'select') return `<div class="field"><label for="${id}">${U(q.question)}${req}</label><select id="${id}" data-input="field"><option>${q.states ? 'SELECT A STATE' : 'SELECT'}</option>${(q.states ? US.map((x) => [x, x]) : q.options.map(([v, l]) => [v, l])).map(([v, l]) => `<option value="${v}">${U(l)}</option>`).join('')}</select></div>`;
  if (q.type === 'textarea') return `<div class="field"><label for="${id}">${U(q.question)}${req}</label><textarea id="${id}" data-input="field"></textarea></div>`;
  if (q.type === 'business_name_check') return `<div class="field"><label for="${id}">${U(q.question)}${req}</label><div class="gs-name"><input id="${id}" type="text" data-input="field" autocomplete="off" placeholder="YOUR BUSINESS NAME"><button class="btn btn--line btn--sm" data-a="send" data-v="namecheck">${ic('search')} CHECK THE NAME</button></div>${PUB.sent.namecheck ? `<p class="note">DESIGN REVIEW — THE LIVE NAME CHECK (POST /API/AIO/BUSINESS-NAME-CHECK) ANSWERS HERE. NOTHING WAS SENT.</p>` : `<p class="note">THE LIVE INTAKE CHECKS THE NAME AGAINST THE STATE REGISTRY WHERE IT CAN.</p>`}</div>`;
  return `<div class="field"><label for="${id}">${U(q.question)}${req}</label><input id="${id}" type="${q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : 'text'}" min="0" data-input="field" autocomplete="off"></div>`;
}
function getStarted() {
  const I = D.intake;
  const g = PUB.gs;
  const flow = I.flows[g.goal || 'start_business'];
  const k = Math.min(g.step, flow.length - 1);
  const sec = I.sections.find((s) => s.id === flow[k]);
  const last = k === flow.length - 1;
  const blocked = (k === 0 && !g.goal) || (sec.id === 'journey' && !g.ans.journey);
  const rail = `<ol class="gs-rail" aria-label="${U(I.shell.journeyAria)}">${flow.map((id, i) => { const s = I.sections.find((x) => x.id === id); return `<li><button data-a="gsGo" data-v="${i}" aria-current="${i === k ? 'step' : 'false'}"${i > k ? ' disabled' : ''} class="${i < k ? 'is-done' : ''}"><span class="gs-rail__n">${i < k ? ic('check') : String(i + 1).padStart(2, '0')}</span><span><b>${U(s.rail[0])}</b><em>${U(s.rail[1])}</em></span></button></li>`; }).join('')}</ol>`;
  return `${phero({ img: 'hero-home', crumbs: [['/', 'HOME'], [null, 'GET STARTED']], eyebrow: 'SMART INTAKE · CHECK WHAT I NEED', title: `${U(I.shell.headlineLine1)} ${U(I.shell.headlineLine2)}`, lead: U(I.shell.lede) })}
  <section class="sec" style="padding-top:56px"><div class="wrap gs">
    <aside class="gs-side">${rail}<div class="gs-next"><p class="eyebrow">WHAT HAPPENS NEXT</p><div class="list" style="margin-top:14px">${[['map', 'YOUR ROADMAP', 'THE SERVICES THAT FIT WHERE YOU ARE.'], ['layers', 'YOUR SERVICE PLAN', 'CHOOSE WHAT TO START WITH.'], ['headset', 'THE AIO TEAM', 'PICKS UP YOUR REQUEST IN THE OFFICE.']].map(([i, b, s]) => `<div class="row">${ic(i)}<div><b>${b}</b><span>${s}</span></div><span></span></div>`).join('')}</div></div></aside>
    <div class="panel gs-main">
      <div class="gs-progress" aria-hidden="true">${flow.map((_, i) => `<i class="${i <= k ? 'on' : ''}"></i>`).join('')}</div>
      <p class="eyebrow">STEP ${k + 1} OF ${flow.length} · ${U(sec.rail[0])}</p><h2 class="h2" style="margin:12px 0 6px">${U(sec.title)}</h2><p class="lead" style="margin-bottom:22px">${U(sec.description)}</p>
      <div class="form gs-form${sec.id === 'assets' ? ' gs-form--assets' : ''}">${sec.questions.map(gsQuestion).join('')}</div>
      <div class="gs-nav">${k ? `<button class="btn btn--line" data-a="gsBack">${ic('back')} BACK</button>` : `<a class="link" href="#/">SAVE &amp; EXIT</a>`}${last ? `<a class="btn btn--gold" href="#/roadmap/results">SEE MY ROADMAP ${ic('arrow', 'ic--go')}</a>` : `<button class="btn btn--gold" data-a="gsNext"${blocked ? ' aria-disabled="true"' : ''}>CONTINUE ${ic('arrow', 'ic--go')}</button>`}</div>
      <p class="note" style="margin-top:16px">DESIGN REVIEW — NOTHING YOU ENTER IS SAVED OR SENT. THE LIVE INTAKE SAVES AS YOU GO.</p>
    </div>
  </div></section>${closing()}`;
}
function servicePlan() {
  const picked = D.needs.filter((n) => PUB.gs.needs.includes(n.id));
  const planned = PUB.plan.map(svcBySlug).filter(Boolean); // ADD TO MY PLAN on a service page (the live useServicePlan)
  const rec = [...new Set([...planned, ...[...new Set((picked.length || planned.length ? picked : D.needs.slice(0, 2)).flatMap((n) => n.recommendedSlugs))].map(svcBySlug).filter(Boolean)])];
  return `${phero({ img: 'valley-trail', crumbs: [['/', 'HOME'], ['/roadmap/results', 'YOUR ROADMAP'], [null, 'SERVICE PLAN']], eyebrow: 'MY SERVICE PLAN', title: 'CHOOSE WHERE TO START.', lead: 'PICK THE SERVICES TO REQUEST NOW. YOU CAN ADD THE REST LATER.' })}
  <section class="sec" style="padding-top:56px"><div class="wrap cols cols--wide"><div class="list">${rec.map((s) => `<div class="row">${ic(svcIcon(s))}<div><b>${U(s.name)}</b><span>${U(s.shortDescription)}</span></div>${chip(s.state)}</div>`).join('')}</div>
  <aside class="panel"><p class="eyebrow">YOUR PLAN</p><h3 class="h3" style="margin:12px 0 8px">${rec.length} SERVICES</h3><p class="note">PRICING IS CONFIRMED AFTER REVIEW — NOTHING IS CHARGED HERE.</p><a class="btn btn--gold" style="width:100%;margin-top:18px" href="#/request/submit">SEND MY REQUEST ${ic('arrow', 'ic--go')}</a></aside></div></section>${closing()}`;
}
function field(label, type, ph = '') {
  const id = `f-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;
  if (type.startsWith('select:')) return `<div class="field"><label for="${id}">${label}</label><select id="${id}" data-input="field">${type.slice(7).split('|').map((o) => `<option>${o}</option>`).join('')}</select></div>`;
  if (type === 'textarea') return `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-input="field" placeholder="${ph}"></textarea></div>`;
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" data-input="field" placeholder="${ph}" autocomplete="off"></div>`;
}
function formPage({ img, crumbs, eyebrow, title, lead, id, fields, submit, side = [], aside }) {
  const sent = PUB.sent[id];
  return `${phero({ img, crumbs, eyebrow, title, lead })}
  <section class="sec" style="padding-top:56px"><div class="wrap cols cols--wide"><div class="panel"><div class="form">${fields.map(([l, t], i) => (i % 2 === 0 && fields[i + 1] && !['textarea'].includes(t) && !['textarea'].includes(fields[i + 1][1]) && fields.length > 3 ? `<div class="form__row">${field(l, t)}${field(fields[i + 1][0], fields[i + 1][1])}</div>` : i % 2 === 1 && fields.length > 3 && !['textarea'].includes(t) && !['textarea'].includes(fields[i - 1][1]) ? '' : field(l, t))).join('')}
    ${sent ? `<div class="sent">${ic('done')}<span>DESIGN REVIEW — NOTHING WAS SENT. IN THE LIVE SITE THIS REACHES THE AIO OFFICE.</span></div>` : ''}
    <button class="btn btn--gold" data-a="send" data-v="${id}">${submit} ${ic('arrow', 'ic--go')}</button></div></div>
    <aside class="panel">${aside || `<p class="eyebrow">GOOD TO KNOW</p>`}${side.length ? `<div class="list" style="margin-top:16px">${side.map((t) => `<div class="row">${ic('info')}<div><span style="margin:0">${U(t)}</span></div><span></span></div>`).join('')}</div>` : ''}<p class="note" style="margin-top:16px">DESIGN REVIEW — NOTHING YOU ENTER IS SAVED OR SENT.</p></aside></div></section>${closing()}`;
}
function requestPage(confirm) {
  if (confirm) return `${phero({ img: 'mountains-dusk', crumbs: [['/', 'HOME'], [null, 'REQUEST RECEIVED']], eyebrow: 'REQUEST RECEIVED · SAMPLE', title: 'YOUR REQUEST IS WITH THE AIO OFFICE.', lead: 'YOU CAN FOLLOW IT IN YOUR CLIENT PORTAL. WE WILL REACH OUT IF WE NEED ANYTHING ELSE.', ctas: `<a class="btn btn--gold" href="#/login">OPEN MY PORTAL ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/">BACK TO HOME</a>` })}
    <section class="sec" style="padding-top:56px"><div class="wrap"><div class="steps">${STEPS.filing.map(([i, b, s], n) => `<div class="step"${n === 0 ? ' style="border-color:var(--gold)"' : ''}><div class="step__top"><span class="step__n">0${n + 1}</span>${ic(n === 0 ? 'done' : i)}</div><b>${b}</b><span>${n === 0 ? 'DONE — SAMPLE REQUEST REQ-SAMPLE.' : s}</span></div>`).join('')}</div></div></section>${closing()}`;
  return formPage({ img: 'valley-trail', crumbs: [['/', 'HOME'], ['/service-plan', 'SERVICE PLAN'], [null, 'SUBMIT']], eyebrow: 'REQUEST HELP FROM ALL IN ONE', title: 'SEND YOUR REQUEST.', lead: 'AN ACCOUNT KEEPS YOUR REQUEST, DOCUMENTS AND MESSAGES ON ONE RECORD.', id: 'request', fields: [['BUSINESS NAME', 'text'], ['USDOT NUMBER (IF ANY)', 'text'], ['YOUR NAME', 'text'], ['PHONE', 'tel'], ['ANYTHING WE SHOULD KNOW', 'textarea']], submit: 'SEND REQUEST', aside: `<p class="eyebrow">NEXT</p><a class="row" style="margin-top:16px" href="#/request/confirmation/req-sample">${ic('done')}<div><b>SEE THE CONFIRMATION</b><span>WHAT THE CLIENT SEES AFTER SENDING</span></div>${ic('chev')}</a>` });
}
function quote() {
  return `${phero({ img: 'freight-map', pos: '50% 50%', crumbs: [['/', 'HOME'], [null, 'YOUR QUOTE']], eyebrow: 'QUOTE · PRIVATE LINK · SAMPLE', title: 'YOUR QUOTE FROM ALL IN ONE.', lead: 'OPENED FROM A SECURE LINK. REVIEW THE SCOPE AND ACCEPT IN YOUR PORTAL.' })}
  <section class="sec" style="padding-top:56px"><div class="wrap cols cols--wide"><div class="panel"><p class="eyebrow">SCOPE</p><div class="list" style="margin-top:16px">${['usdot-registration', 'operating-authority-assistance', 'boc-3-assistance'].map(svcBySlug).filter(Boolean).map((s) => `<div class="row">${ic(svcIcon(s))}<div><b>${U(s.name)}</b><span>${U(s.shortDescription)}</span></div><b class="muted">AMOUNT IN THE LIVE QUOTE</b></div>`).join('')}</div></div>
  <aside class="panel"><p class="eyebrow">ACCEPT</p><p class="note" style="margin:12px 0 18px">AMOUNTS COME FROM THE OFFICE QUOTE — NONE ARE SHOWN IN THIS REVIEW.</p><a class="btn btn--gold" style="width:100%" href="#/login">ACCEPT IN MY PORTAL ${ic('arrow', 'ic--go')}</a></aside></div></section>${closing()}`;
}

/* ═════════════ COMPANY + ACCOUNT ═════════════ */
function about() {
  return `${phero({ img: 'aio-login', pos: '75% 50%', crumbs: [['/', 'HOME'], [null, 'ABOUT']], eyebrow: 'ABOUT ALL IN ONE', title: 'WHERE BUSINESS MEETS THE ROAD.', lead: 'ALL IN ONE ENTERPRISES INC. IS THE BUSINESS OFFICE BEHIND THE TRUCK — FROM STARTUP TO EVERY MILE AFTER.' })}
  <section class="sec"><div class="wrap split"><div class="split__copy">${rv(`<p class="eyebrow">WHAT WE DO</p>`)}${rv(`<h2 class="h2">ONE OFFICE FOR EVERYTHING BEHIND YOUR TRUCKING BUSINESS.</h2>`, 1)}${rv(`<p class="lead">${U(D.heroSupport)}</p>`, 2)}</div>
  ${rv(`<div class="pillars">${[['gem', 'CLEAR', 'PLAIN LANGUAGE. ONE NEXT STEP AT A TIME.'], ['badge', 'CAPABLE', 'FILINGS, PERMITS AND BOOKS HANDLED BY PEOPLE WHO KNOW TRUCKING.'], ['layers', 'CONNECTED', 'ONE RECORD ACROSS EVERY SERVICE.'], ['users', 'HUMAN', 'A TEAM YOU CAN TALK TO.']].map(([i, b, s]) => `<div class="pillar">${ic(i)}<div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div>`, 1)}</div></section>
  <section class="sec" id="resources" style="padding-top:0"><div class="wrap"><div class="sec__head">${rv(`<p class="eyebrow">RESOURCES</p>`)}${rv(`<h2 class="h2">TRUCKING RESOURCES.</h2>`, 1)}</div><div class="svcs">${RESOURCES.map(([p, t, d, i], n) => rv(`<div class="svc__top">${ic(i)}</div><div><b>${t}</b><p>${d}</p></div><div class="svc__go">OPEN${ic('arrow')}</div>`, n, 'a', 'svc').replace('<a class', `<a href="#${p}" class`)).join('')}</div></div></section>${closing()}`;
}
function contact() {
  const INTENTS = [['/get-started', 'START OR GROW MY BUSINESS', 'rocket'], ['/request-callback', 'REQUEST A CALLBACK', 'phone'], ['/schedule', 'SCHEDULE A CALL', 'calendar'], ['/login', 'I AM A CLIENT', 'user']];
  return `${phero({ img: 'night-interstate', crumbs: [['/', 'HOME'], [null, 'CONTACT']], eyebrow: 'TALK TO AIO', title: 'HOW CAN WE HELP YOU?', lead: 'TELL US WHAT YOU NEED. THE RIGHT PERSON IN THE AIO OFFICE PICKS IT UP.' })}
  <section class="sec" style="padding-top:56px"><div class="wrap"><div class="choices" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));margin-bottom:28px">${INTENTS.map(([p, t, i]) => `<a class="choice" href="#${p}">${ic(i)}<div><b>${t}</b></div>${ic('chev')}</a>`).join('')}</div>
  <div class="cols cols--wide"><div class="panel"><div class="form"><div class="form__row">${field('YOUR NAME', 'text')}${field('BUSINESS NAME', 'text')}</div><div class="form__row">${field('PHONE', 'tel')}${field('EMAIL', 'email')}</div>${field('HOW CAN WE HELP?', 'textarea')}
    ${PUB.sent.contact ? `<div class="sent">${ic('done')}<span>DESIGN REVIEW — NOTHING WAS SENT. IN THE LIVE SITE THIS CREATES A LEAD IN THE OFFICE.</span></div>` : ''}<button class="btn btn--gold" data-a="send" data-v="contact">SEND MESSAGE ${ic('arrow', 'ic--go')}</button></div></div>
  <aside class="panel"><p class="eyebrow">REACH US</p><div class="list" style="margin-top:16px">${[['phone', 'PHONE', 'TO BE CONFIRMED — THE LIVE NUMBER IS A PLACEHOLDER'], ['mail', 'EMAIL', 'TO BE CONFIRMED — THE LIVE ADDRESS IS A PLACEHOLDER'], ['clock', 'HOURS', 'TO BE CONFIRMED']].map(([i, b, s]) => `<div class="row">${ic(i)}<div><b>${b}</b><span>${s}</span></div><span></span></div>`).join('')}</div>
  <div class="faq" style="margin-top:22px">${[['DO I NEED AN ACCOUNT?', 'NOT TO ASK A QUESTION. AN ACCOUNT KEEPS YOUR REQUESTS, DOCUMENTS AND MESSAGES ON ONE RECORD.'], ['IS ALL IN ONE A GOVERNMENT AGENCY?', 'NO. ALL IN ONE PROVIDES ADMINISTRATIVE AND FILING ASSISTANCE. AGENCIES MAKE FINAL DETERMINATIONS.'], ['DO YOU PROVIDE INSURANCE OR FUNDING?', 'COVERAGE AND FUNDING COME FROM LICENSED PARTNERS. AIO HELPS YOU PREPARE AND CONNECTS YOU.']].map(([q, a]) => `<details><summary>${q}${ic('caret')}</summary><p>${a}</p></details>`).join('')}</div></aside></div></div></section>${closing()}`;
}
function authPage(kind) {
  const C = {
    login: ['WELCOME BACK.', 'LOG IN TO YOUR CLIENT PORTAL.', [['EMAIL', 'email'], ['PASSWORD', 'password']], 'LOG IN', [['/forgot-password', 'FORGOT PASSWORD?'], ['/signup', 'CREATE AN ACCOUNT']]],
    signup: ['CREATE YOUR ACCOUNT.', 'ONE ACCOUNT FOR YOUR REQUESTS, DOCUMENTS AND SERVICES.', [['FULL NAME', 'text'], ['EMAIL', 'email'], ['PHONE', 'tel'], ['PASSWORD', 'password']], 'CREATE ACCOUNT', [['/login', 'I ALREADY HAVE AN ACCOUNT']]],
    forgot: ['RESET YOUR PASSWORD.', 'WE WILL EMAIL YOU A LINK TO SET A NEW ONE.', [['EMAIL', 'email']], 'SEND RESET LINK', [['/login', 'BACK TO LOG IN']]],
    onboarding: ['WHERE WOULD YOU LIKE TO START?', 'PICK A STARTING POINT. YOU CAN DO THE REST LATER.', [], '', []],
  }[kind];
  const sent = PUB.sent[kind];
  const ob = kind === 'onboarding' ? `<div class="choices" style="grid-template-columns:1fr">${[['/start-your-business', 'START YOUR BUSINESS', 'rocket'], ['/road-ready', 'GET ROAD READY', 'badge'], ['/client-portal', 'GO TO MY PORTAL', 'layers'], ['/services', 'BROWSE SERVICES', 'search'], ['/contact', 'I SHIP FREIGHT', 'package']].map(([p, t, i]) => `<a class="choice" href="#${p}">${ic(i)}<div><b>${t}</b></div>${ic('chev')}</a>`).join('')}</div>` : '';
  return `<section class="phero" style="min-height:var(--fh);display:grid;align-items:center;padding-bottom:80px"><div class="phero__img" style="--img:url(${IMG('aio-login')});--pos:80% 50%"></div><div class="wrap cols"><div class="phero__in"><a class="nav__mark" href="#/" style="--d:0"><img src="brand/aio-mark-on-dark.png" alt="ALL IN ONE ENTERPRISES INC." style="height:64px"></a><p class="eyebrow" style="--d:1">ALL IN ONE ENTERPRISES INC.</p><h1 class="h1" style="--d:2">${C[0]}</h1><p class="lead" style="--d:3">${C[1]}</p></div>
    <div class="panel" style="backdrop-filter:blur(10px);background:rgba(12,12,12,.86)">${ob}${C[2].length ? `<div class="form">${C[2].map(([l, t]) => field(l, t)).join('')}${sent ? `<div class="sent">${ic('done')}<span>DESIGN REVIEW — NOTHING WAS SENT. SIGN-IN IS NOT CHANGED BY THIS DESIGN.</span></div>` : ''}<button class="btn btn--gold" data-a="send" data-v="${kind}">${C[3]} ${ic('arrow', 'ic--go')}</button><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px">${C[4].map(([p, t]) => `<a class="link" href="#${p}">${t}</a>`).join('')}</div></div>` : ''}<p class="note" style="margin-top:16px">DESIGN REVIEW — AUTHENTICATION IS NOT CHANGED.</p></div></div></section>`;
}
function notFound() {
  return `<section class="phero" style="min-height:var(--fh);display:grid;align-items:center"><div class="phero__img" style="--img:url(${IMG('mountains-dusk')});--pos:50% 70%"></div><div class="wrap"><div class="phero__in"><p class="eyebrow" style="--d:0">404</p><h1 class="h1" style="--d:1">THIS ROAD DOESN’T GO ANYWHERE.</h1><p class="lead" style="--d:2">THE PAGE YOU WANTED IS NOT HERE. LET’S GET YOU BACK ON TRACK.</p><div class="phero__ctas" style="--d:3"><a class="btn btn--gold" href="#/">BACK TO HOME ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/services">ALL SERVICES</a></div></div></div></section>`;
}

/* ── router ── */
function page(path) {
  const [p] = path.split('?');
  const seg = p.split('/').filter(Boolean);
  if (!seg.length) return home();
  if (p === '/services') return services();
  if (p === '/services/find') return finder();
  if (p === '/services/ifta-filing') return ifta();
  if (p === '/services/bookkeeping') return bookkeeping();
  if (p === '/services/bookkeeping/assessment') return formPage({ img: 'valley-trail', crumbs: [['/', 'HOME'], ['/services/bookkeeping', 'BOOKKEEPING'], [null, 'ASSESSMENT']], eyebrow: 'BOOKS ASSESSMENT', title: 'WHERE ARE YOUR BOOKS TODAY?', lead: 'A FEW QUESTIONS SO WE CAN RECOMMEND A PLAN — OR BOOKS RESCUE FIRST.', id: 'assess', fields: [['TRUCKS IN YOUR FLEET', 'select:1|2–5|6–10|11+'], ['HOW CURRENT ARE YOUR BOOKS?', 'select:UP TO DATE|A FEW MONTHS BEHIND|MORE THAN A YEAR BEHIND|NO BOOKS YET'], ['DO YOU USE FACTORING?', 'select:YES|NO'], ['ANYTHING ELSE?', 'textarea']], submit: 'SEE MY RECOMMENDATION', aside: `<p class="eyebrow">NEXT</p><a class="row" style="margin-top:16px" href="#/services/bookkeeping/recommendation">${ic('layers')}<div><b>PLAN RECOMMENDATION</b><span>WHAT THE CLIENT SEES NEXT</span></div>${ic('chev')}</a>` });
  if (p === '/services/bookkeeping/recommendation') return `${phero({ img: 'valley-trail', crumbs: [['/', 'HOME'], ['/services/bookkeeping', 'BOOKKEEPING'], [null, 'RECOMMENDATION']], eyebrow: 'PLAN RECOMMENDATION · SAMPLE', title: U(D.plans[1].name) + '.', lead: U(D.plans[1].bestFor), ctas: `<a class="btn btn--gold" href="#/signup">START WITH THIS PLAN ${ic('arrow', 'ic--go')}</a><a class="btn btn--line" href="#/services/bookkeeping">COMPARE PLANS</a>` })}<section class="sec" style="padding-top:56px"><div class="wrap"><div class="plans" style="grid-template-columns:1fr">${`<div class="plan plan--mid"><ul style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))">${D.plans[1].features.map((f) => `<li>${ic('check')}<span>${U(f)}</span></li>`).join('')}</ul></div>`}</div></div></section>${closing()}`;
  if (p === '/services/factoring') return factoring();
  if (p === '/services/fleetcare') return fleetcare();
  if (p === '/services/fleetcare/plans') return fleetcare('plans');
  if (p === '/fleetcare/providers/join') return fleetcare('join');
  if (p === '/fleetcare/providers/apply') return fleetcare('apply');
  if (p === '/services/driverlink') return driverlink();
  if (p === '/driverlink/signup') return driverlink('signup');
  if (seg[0] === 'services' && seg.length === 2 && D.divisions[seg[1]] && DIVISIONS[seg[1]]) return division(seg[1]);
  if (seg[0] === 'services' && seg.length === 2 && svcBySlug(seg[1])) return service(svcBySlug(seg[1]));
  if (p === '/start-your-business') return startBusiness();
  if (seg[0] === 'start-your-business' && seg[1]) return startBusiness(seg[1]);
  if (p === '/road-ready') return roadReady();
  if (p === '/roadmap') return roadmap();
  if (p === '/roadmap/results') return roadmap(true);
  if (p === '/client-portal') return clientPortal();
  if (p === '/get-started') return getStarted();
  if (p === '/service-plan') return servicePlan();
  if (p === '/request/submit') return requestPage();
  if (seg[0] === 'request' && seg[1] === 'confirmation') return requestPage(true);
  if (seg[0] === 'quote') return quote();
  if (p === '/about') return about();
  if (p === '/contact') return contact();
  if (p === '/request-callback') return formPage({ img: 'night-interstate', crumbs: [['/', 'HOME'], ['/contact', 'CONTACT'], [null, 'CALLBACK']], eyebrow: 'REQUEST A CALLBACK', title: 'WE’LL CALL YOU BACK.', lead: 'LEAVE A NUMBER AND A GOOD TIME. THE RIGHT PERSON CALLS.', id: 'callback', fields: [['YOUR NAME', 'text'], ['PHONE', 'tel'], ['BEST TIME', 'select:MORNING|AFTERNOON|EVENING'], ['TOPIC', 'select:STARTING A BUSINESS|PERMITS & COMPLIANCE|DISPATCH|BOOKKEEPING|SOMETHING ELSE']], submit: 'REQUEST CALLBACK' });
  if (p === '/schedule') return formPage({ img: 'highway-gold', crumbs: [['/', 'HOME'], ['/contact', 'CONTACT'], [null, 'SCHEDULE']], eyebrow: 'SCHEDULE A CALL', title: 'LET’S GET YOU MOVING.', lead: 'PICK A DAY AND A TIME THAT WORKS. WE’LL CONFIRM BY EMAIL.', id: 'schedule', fields: [['YOUR NAME', 'text'], ['EMAIL', 'email'], ['DAY', 'select:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY'], ['TIME', 'select:9:00 AM|11:00 AM|1:00 PM|3:00 PM']], submit: 'REQUEST THIS TIME' });
  if (p === '/login') return authPage('login');
  if (p === '/signup') return authPage('signup');
  if (p === '/forgot-password') return authPage('forgot');
  if (p === '/onboarding') return authPage('onboarding');
  return notFound();
}
const AUTH = ['/login', '/signup', '/forgot-password', '/onboarding', '/services/ifta-filing']; // own chrome: focused account pages; the approved IFTA page brings its own header

/* ── draw, events, reveal ── */
let ROOT = null;
function draw(opts = {}) {
  const auth = AUTH.includes(PUB.path.split('?')[0]);
  const isHome = PUB.path === '/' || PUB.path === '';
  ROOT.dataset.over = isHome && !opts.scrolled ? '1' : '0';
  ROOT.innerHTML = `<div class="pub-wrap">${auth ? '' : nav()}<main id="pub-main">${page(PUB.path)}</main>${auth ? '' : footer()}${PUB.toast ? `<div class="toast" role="status">${ic('info')}${PUB.toast}</div>` : ''}</div>`;
  const solBtn = ROOT.querySelector('[data-v="solutions"]');
  const resBtn = ROOT.querySelector('[data-v="resources"]');
  if (solBtn) ROOT.style.setProperty('--pop-sol', `${solBtn.offsetLeft - 10}px`);
  if (resBtn) ROOT.style.setProperty('--pop-res', `${resBtn.offsetLeft - 10}px`);
  observe();
  if (PUB.search && opts.focus !== false) { const i = ROOT.querySelector('[data-input="q"]'); i?.focus(); i?.setSelectionRange(i.value.length, i.value.length); }
}
let IO = null;
function observe() {
  const els = [...ROOT.querySelectorAll('.rv')];
  els.forEach((el, i) => { el.dataset.rid = `${PUB.path}#${i}`; if (PUB.capture || PUB.seen.has(el.dataset.rid) || reduced()) el.classList.add('in'); });
  IO?.disconnect();
  IO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); PUB.seen.add(e.target.dataset.rid); IO.unobserve(e.target); } }), { root: PUB.scroller, rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  els.filter((el) => !el.classList.contains('in')).forEach((el) => IO.observe(el));
}
const reduced = () => document.documentElement.dataset.motion === 'reduce' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function scrollEl() { return PUB.scroller || document.scrollingElement; }
function go(path, { keepScroll = false } = {}) {
  const [p, hash] = path.split('#');
  PUB.path = p || '/';
  PUB.menu = null; PUB.search = false; PUB.drawer = false; PUB.toast = null;
  draw();
  if (!keepScroll) scrollEl().scrollTop = 0;
  if (hash) requestAnimationFrame(() => jump(hash));
  window.dispatchEvent(new CustomEvent('pub:route', { detail: PUB.path }));
}
function jump(id) {
  const el = ROOT.querySelector(`#${id}`);
  if (!el) return;
  const top = el.getBoundingClientRect().top - (PUB.scroller ? PUB.scroller.getBoundingClientRect().top : 0) + scrollEl().scrollTop - parseFloat(getComputedStyle(ROOT.firstElementChild).getPropertyValue('--nav'));
  scrollEl().scrollTo({ top, behavior: reduced() || PUB.capture ? 'auto' : 'smooth' });
}
const ACT = {
  menu: (v) => { PUB.menu = PUB.menu === v ? null : v; PUB.search = false; draw(); },
  search: () => { PUB.search = !PUB.search; PUB.menu = null; PUB.drawer = false; draw(); },
  drawer: () => { PUB.drawer = !PUB.drawer; PUB.search = false; draw(); },
  grp: (v) => { PUB.grp = PUB.grp === v ? null : v; draw(); },
  eco: (v) => { PUB.eco = Number(v); draw(); },
  pathSel: (v) => { PUB.pathSel = Number(v); draw(); },
  pick: (v) => { const [id, slug] = v.split('|'); PUB.pick[id] = slug; draw(); },
  more: (v) => { PUB.open[v] = !PUB.open[v]; draw(); },
  plan: (v) => { PUB.plan = PUB.plan.includes(v) ? PUB.plan.filter((x) => x !== v) : [...PUB.plan, v]; draw(); toast(PUB.plan.includes(v) ? 'ADDED TO MY PLAN — DESIGN REVIEW, NOTHING IS SAVED.' : 'REMOVED FROM MY PLAN.'); },
  syb: (v) => { PUB.syb = Number(v); draw(); },
  fam: (v) => { PUB.fam = v; draw(); },
  need: (v) => { PUB.needs = PUB.needs.includes(v) ? PUB.needs.filter((x) => x !== v) : [...PUB.needs, v]; draw(); },
  gsGoal: (v) => { PUB.gs.goal = v; PUB.gs.step = 0; draw(); },
  gsAns: (v) => { const [q, x] = v.split('|'); PUB.gs.ans[q] = x; draw(); },
  gsMulti: (v) => { const [q, x] = v.split('|'); const cur = PUB.gs.ans[q] || []; PUB.gs.ans[q] = cur.includes(x) ? cur.filter((y) => y !== x) : [...cur, x]; draw(); },
  gsGo: (v) => { PUB.gs.step = Number(v); draw(); },
  gsNext: () => { const flow = D.intake.flows[PUB.gs.goal || 'start_business']; const id = flow[Math.min(PUB.gs.step, flow.length - 1)]; if ((PUB.gs.step === 0 && !PUB.gs.goal) || (id === 'journey' && !PUB.gs.ans.journey)) return toast('ANSWER THE REQUIRED QUESTION TO CONTINUE.'); PUB.gs.step = Math.min(PUB.gs.step + 1, flow.length - 1); draw(); scrollEl().scrollTop = Math.min(scrollEl().scrollTop, ROOT.querySelector('.gs')?.offsetTop || 0); },
  gsBack: () => { PUB.gs.step = Math.max(0, PUB.gs.step - 1); draw(); },
  send: (v) => { PUB.sent[v] = true; draw(); },
  jump: (v) => { PUB.menu = null; jump(v); },
};
function toast(t) { PUB.toast = t; draw(); clearTimeout(toast.t); toast.t = setTimeout(() => { PUB.toast = null; draw(); }, 2400); }
const INPUT = {
  q: (v) => { PUB.q = v; const s = ROOT.querySelector('[data-slot="hits"]'); if (s) s.innerHTML = hitsHtml(searchHits(v)); },
  fq: (v) => { PUB.fq = v; const q = v.trim().toLowerCase(); const list = D.services.filter((s) => (PUB.fam === 'all' || s.category === PUB.fam) && (!q || `${s.name} ${s.shortDescription}`.toLowerCase().includes(q))); const s = ROOT.querySelector('[data-slot="svcs"]'); const idx = ROOT.querySelector('[data-slot="svcs-index"]'); if (idx) idx.hidden = !!q; if (s) { s.hidden = !q && !!idx; s.innerHTML = list.map(svcCard).join('') || `<p class="muted">NO SERVICE MATCHES THAT FILTER.</p>`; s.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); } },
  field: () => {},
};
function mountPub(root, { scroller = null, width = null } = {}) {
  ROOT = root;
  PUB.scroller = scroller;
  PUB.width = width || root.clientWidth;
  root.classList.add('pub');
  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]');
    if (a && root.contains(a)) { e.preventDefault(); if (a.getAttribute('aria-disabled') === 'true' && a.dataset.a !== 'gsNext') return; return ACT[a.dataset.a]?.(a.dataset.v, a); }
    const l = e.target.closest('a[href^="#/"]');
    if (l && root.contains(l)) { e.preventDefault(); return go(l.getAttribute('href').slice(1)); }
    if (PUB.menu && !e.target.closest('.pop')) { PUB.menu = null; draw(); }
  });
  root.addEventListener('input', (e) => { const k = e.target.dataset?.input; if (k) INPUT[k]?.(e.target.value); });
  document.addEventListener('keydown', (e) => { // the document: a redrawn menu takes the focused control with it
    if (e.key === 'Escape' && (PUB.menu || PUB.search || PUB.drawer)) { PUB.menu = null; PUB.search = false; PUB.drawer = false; draw(); }
  });
  (scroller || window).addEventListener('scroll', () => {
    const over = (PUB.path === '/' || PUB.path === '') && scrollEl().scrollTop < 40 ? '1' : '0';
    if (root.dataset.over !== over) root.dataset.over = over;
  }, { passive: true });
  draw();
}
