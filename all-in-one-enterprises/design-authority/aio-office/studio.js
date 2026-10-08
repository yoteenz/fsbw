/*
 * AIO OFFICE visual authority studio — builds HOME · WORK · REPORTS · MORE for one viewport and one actor.
 *   studio.html?page=home|work|reports|more|kit&role=founder|staff|staff-granted&view=attention|deadlines|blocked&state=quick
 * Viewport comes from the window width: mobile < 700 · tablet 700–1023 · desktop ≥ 1024 · wide ≥ 1900.
 * Every figure is ILLUSTRATIVE SAMPLE DATA (labelled SAMPLE on the page). Signals and honest states follow the AIO office
 * root contracts (SITE00 Experience Brain, projects/aio/office-contracts.ts): a lane shows a needs-attention count only where
 * its shell section is PARTIAL / AVAILABLE, otherwise NOT CONNECTED YET; VEHICLES & FLEET has no staff workspace.
 */
const Q = new URLSearchParams(location.search);
let PAGE = Q.get('page') || 'home';
let ROLE = Q.get('role') || 'founder';
let VIEW = Q.get('view') || 'attention';
let STATE = Q.get('state') || '';
const W = window.innerWidth;
let VP = W < 700 ? 'mobile' : W < 1024 ? 'tablet' : 'desktop';
let WIDE = W >= 1900;
let FOUNDER = ROLE === 'founder';
let AREA = 'OVERVIEW';
/** Embedding (the unified office review sets AIO_STUDIO_EMBED and drives these); the authority renders never call it. */
const EMBED = window.AIO_STUDIO_EMBED === true;
function studioSet(s) {
  if ('page' in s) PAGE = s.page;
  if ('role' in s) ROLE = s.role;
  if ('view' in s) VIEW = s.view;
  if ('state' in s) STATE = s.state;
  if ('vp' in s) VP = s.vp;
  if ('wide' in s) WIDE = s.wide;
  if ('area' in s) AREA = s.area;
  FOUNDER = ROLE === 'founder';
}
if (!EMBED) {
  document.documentElement.dataset.vp = VP;
  document.documentElement.dataset.wide = WIDE ? '1' : '0';
}

const P = window.AIO_STUDIO_ASSETS ?? '/public';
const PLATES = {
  home: { src: `${P}/brand/ifta/plates/client-hero.jpg`, tone: 'light', pos: { mobile: '100% 50%', tablet: '100% 52%', get desktop() { return WIDE ? '100% 40%' : '100% 50%'; } }, zoom: { mobile: 1.32, tablet: 1.05 } },
  work: { src: `${P}/brand/ifta/plates/public-hero.jpg`, tone: 'dark', pos: { mobile: '72% 55%', tablet: '64% 56%', desktop: '60% 54%' } },
  reports: { src: `${P}/brand/ifta/plates/client-insights.jpg`, tone: 'light', pos: { mobile: '60% 40%', tablet: '60% 42%', desktop: '50% 44%' } },
  more: { src: `${P}/brand/ifta/plates/public-footer-desktop.jpg`, tone: 'dark', pos: { mobile: '64% 52%', tablet: '60% 54%', desktop: '50% 56%' } },
};

/* ── icons ── */
const DRAWN = {
  company: '<path d="M4.5 21V4.8c0-.7.5-1.3 1.2-1.3h7.6c.7 0 1.2.6 1.2 1.3V21m0-11h3.8c.7 0 1.2.6 1.2 1.3V21M2.5 21h19M8 7.5h3M8 11h3M8 14.5h3M17.5 14v.01M17.5 17.5v.01"/>',
  people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 19.5c.6-3.3 3-5.2 6-5.2s5.4 1.9 6 5.2M15.6 4.9a3.2 3.2 0 0 1 0 6.2M17.6 14.6c1.9.6 3.1 2.3 3.4 4.9"/>',
  truck: '<path d="M13.5 16.5H8.6M4.4 16.5H2.5v-10h11v10M13.5 9.5h4l3.5 3.8v3.2h-1.9M15.1 16.5h-1.6"/><circle cx="6.5" cy="16.8" r="2"/><circle cx="17.1" cy="16.8" r="2"/>',
  letter: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.8 7 8.2 6 8.2-6"/>',
  'person-plus': '<circle cx="9.5" cy="8" r="3.5"/><path d="M3 20c.6-3.6 3.2-5.6 6.5-5.6 1.6 0 3 .4 4.1 1.2M18.5 13v6M15.5 16h6"/>',
  tag: '<path d="M3.5 12.6V4.5c0-.6.4-1 1-1h8.1l8 8c.6.6.6 1.5 0 2.1l-6.9 6.9c-.6.6-1.5.6-2.1 0l-8.1-7.9Z"/><circle cx="8" cy="8" r="1.4"/>',
  'shield-check': '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6L12 3Zm-3.2 9 2.2 2.2 4.2-4.4"/>',
  wrench: '<path d="M14.7 6.3a4.2 4.2 0 0 0 5.1 5.1l-8.9 8.9a2.1 2.1 0 0 1-3-3l8.9-8.9M14.7 6.3l2.4-2.4a4.2 4.2 0 0 0-5.1 5.1"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7M12 14.5v2.5"/>',
  history: '<path d="M3.6 12a8.4 8.4 0 1 0 2.5-6M3 3.8v4.6h4.6M12 7.5V12l3.1 2"/>',
  'id-card': '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5.2 16.5c.5-1.6 1.8-2.5 3.3-2.5s2.8.9 3.3 2.5M14.5 9.5h4M14.5 13h4"/>',
  pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.2-1.2"/>',
  /* supplemental subjects the sheet does not draw — the migration kit's 24-grid outline family */
  fuel: '<path d="M4.5 20.5V5A1.5 1.5 0 0 1 6 3.5h7A1.5 1.5 0 0 1 14.5 5v15.5M3 20.5h13M7.5 7h4v4h-4zM14.5 9.5h2.2l1.8 1.9v6.1a1.25 1.25 0 0 0 2.5 0V8.6L18.4 6"/>',
  umbrella: '<path d="M3 12.5a9 9 0 0 1 18 0H3ZM12 3v.8M12 12.5v6a2 2 0 0 1-4 0"/>',
  cash: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v.01M18 14.5v.01"/>',
  calculator: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8.5 6.5h7v3h-7zM9 13.5v.01M12 13.5v.01M15 13.5v.01M9 17v.01M12 17v.01M15 17v.01"/>',
  steering: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12.5" r="2.2"/><path d="M3.8 10.6c2.6-.9 5.3-1.3 8.2-1.3s5.6.4 8.2 1.3M10.6 14.3 7.4 19.6M13.4 14.3l3.2 5.3"/>',
};
const ALIAS = { search: 'search', bell: 'notification', down: 'dropdown', fwd: 'forward', arrow: 'arrow-right', plus: 'add', close: 'close', info: 'info-mark', home: 'home', intake: 'inbox', work: 'folder', reports: 'signal', more: 'menu' };
function ico(name, cls = '') {
  if (DRAWN[name]) return `<svg class="ico ico--drawn ${cls}" viewBox="0 0 24 24" aria-hidden="true">${DRAWN[name]}</svg>`;
  return `<svg class="ico ${cls}" viewBox="0 0 56 56" aria-hidden="true"><use href="#${ALIAS[name] || name}"/></svg>`;
}

/* ── canonical WORK lanes (founder order) with sample signals ── */
const LANES = [
  { n: '01', slug: 'permitting', name: 'PERMITTING & AUTHORITIES', icon: 'id-card', photo: 'standins/permitting-authorities.jpg', standin: true, att: 3, blocked: 1, active: 9 },
  { n: '02', slug: 'filing', name: 'FILING & FUEL TAXES', icon: 'fuel', photo: `${P}/brand/ifta/plates/public-road.jpg`, att: 4, active: 14 },
  { n: '03', slug: 'compliance', name: 'COMPLIANCE', icon: 'shield-check', photo: 'standins/compliance.jpg', standin: true, att: 2, active: null },
  { n: '04', slug: 'vehicles', name: 'VEHICLES & FLEET', icon: 'truck', photo: `${P}/brand/ifta/plates/staff-hero.jpg`, none: true },
  { n: '05', slug: 'dispatch', name: 'DISPATCH', icon: 'pin', photo: `${P}/brand/all-in-one-hero-truck.png`, att: 2, active: 11 },
  { n: '06', slug: 'brokerage', name: 'BROKERAGE', icon: 'link', photo: `${P}/brand/ifta/plates/public-map.jpg`, att: 1, blocked: 1, active: 6 },
  { n: '07', slug: 'insurance', name: 'INSURANCE', icon: 'umbrella', photo: 'standins/insurance.jpg', standin: true, att: 3, active: 7 },
  { n: '08', slug: 'factoring', name: 'FACTORING', icon: 'cash', photo: 'standins/factoring.jpg', standin: true, att: 0, active: 5 },
  { n: '09', slug: 'bookkeeping', name: 'BOOKKEEPING', icon: 'calculator', photo: 'standins/bookkeeping.jpg', standin: true, att: null, blocked: 1, active: 4 },
  { n: '10', slug: 'drivers', name: 'DRIVERS & CARRIERS', icon: 'steering', photo: 'standins/drivers-carriers.jpg', standin: true, att: null, active: 3 },
  { n: '11', slug: 'maintenance', name: 'MECHANIC / MAINTENANCE', icon: 'wrench', photo: 'standins/mechanic-maintenance.jpg', standin: true, att: null, blocked: 2, active: 2 },
  { n: '12', slug: 'roadready', name: 'ROAD READY', icon: 'tests', photo: `${P}/brand/aio-login-hero.png`, att: 2, active: 1 },
];
const PHOTO_POS = { '02': '50% 70%', '04': '30% 60%', '05': '62% 55%', '06': '50% 45%', '12': '72% 60%' };

/** Supplemental glyphs drawn in this sprint (the icon sheet and the migration kit have no such subject). */
const NEW_GLYPHS = ['fuel', 'umbrella', 'cash', 'calculator', 'steering', 'wrench'];

function laneSignals(l, compact) {
  if (l.none) return [`<span class="sig sig--mute">NO STAFF WORKSPACE YET</span>`];
  const out = [];
  if (l.att === null) out.push(`<span class="sig sig--mute">${compact ? 'NOT CONNECTED YET' : 'ATTENTION NOT CONNECTED YET'}</span>`);
  else if (l.att === 0) out.push(`<span class="sig sig--ok">NOTHING NEEDS ATTENTION</span>`);
  else out.push(`<span class="sig sig--warn">${l.att} NEED${l.att === 1 ? 'S' : ''} ATTENTION</span>`);
  if (l.blocked) out.push(`<span class="sig sig--bad">${l.blocked} BLOCKED</span>`);
  return out;
}

/* ── sample HOME data (illustrative) ── */
const ATTENTION = [
  { pri: ['URGENT', 'bad'], go: 'rec/policy/pol-dh', who: 'DELTA HAULING LLC', what: 'INSURANCE POLICY EXPIRES IN 6 DAYS', to: 'WORK › INSURANCE › RENEWALS', age: 'TODAY' },
  { pri: ['URGENT', 'bad'], go: 'rec/request/req-hf-mc', who: 'HORIZON FREIGHT', what: 'WORKFLOW BLOCKED — EIN LETTER NOT RECEIVED', to: 'WORK › PERMITTING & AUTHORITIES', age: '2 DAYS' },
  { pri: ['HIGH', 'warn'], go: 'more/documents@c-tk', who: 'T&K TRANSPORT', what: '3 DOCUMENTS UPLOADED FOR REVIEW', to: 'MORE › DOCUMENTS & VAULT', age: '3 HRS' },
  { pri: ['HIGH', 'warn'], go: 'rec/quarter/ifta-rl-q3', who: 'RIVERSTONE LOGISTICS', what: 'Q3 2026 IFTA RETURN READY FOR REVIEW', to: 'WORK › FILING & FUEL TAXES', age: '5 HRS' },
  { pri: ['HIGH', 'warn'], go: 'rec/thread/th-mt', who: 'MASON TRANSPORT', what: 'CLIENT IS WAITING ON A REPLY', to: 'MORE › MESSAGES', age: '1 HR' },
];
const DEADLINES = [
  { pri: ['OVERDUE', 'bad'], go: 'rec/request/req-rj-ucr', who: 'R&J TRUCKING', what: 'UCR REGISTRATION RENEWAL', to: 'WORK › PERMITTING & AUTHORITIES', age: 'OCT 7 · 1 DAY LATE' },
  { pri: ['TODAY', 'warn'], go: 'rec/policy/pol-dh', who: 'DELTA HAULING LLC', what: 'SEND RENEWAL QUOTE TO THE CLIENT', to: 'WORK › INSURANCE', age: 'OCT 8' },
  { pri: ['SOON', 'gold'], go: 'rec/request/req-hf-mc', who: 'HORIZON FREIGHT', what: 'MC AUTHORITY REINSTATEMENT FILING', to: 'WORK › PERMITTING & AUTHORITIES', age: 'OCT 10' },
  { pri: ['SOON', 'gold'], go: 'rec/quarter/ifta-rl-q3', who: 'RIVERSTONE LOGISTICS', what: 'Q3 2026 IFTA — CLIENT APPROVAL', to: 'WORK › FILING & FUEL TAXES', age: 'OCT 13' },
];
const BLOCKERS = [
  { group: 'WAITING ON THE CLIENT', pri: ['BLOCKED', 'bad'], go: 'rec/request/req-hf-mc', who: 'HORIZON FREIGHT', what: 'MC REINSTATEMENT — EIN LETTER NOT RECEIVED', to: 'WORK › PERMITTING & AUTHORITIES', age: '2 DAYS' },
  { group: 'WAITING ON A CARRIER', pri: ['BLOCKED', 'bad'], go: 'rec/shipment/sh-4471', who: 'R&J TRUCKING', what: 'LOAD 4471 — RATE CONFIRMATION NOT SIGNED', to: 'WORK › BROKERAGE', age: '1 DAY' },
];
const CLIENTS = [
  { b: 'RL', go: 'client/c-rl', name: 'RIVERSTONE LOGISTICS', chips: ['IFTA', 'BOOKKEEPING', 'COMPLIANCE'], st: ['NEEDS YOUR APPROVAL', 'warn'], t: '2 HRS AGO' },
  { b: 'DH', go: 'client/c-dh', name: 'DELTA HAULING LLC', chips: ['PERMITS', 'INSURANCE'], st: ['DOCUMENTS RECEIVED', 'ok'], t: '4 HRS AGO' },
  { b: 'TK', go: 'client/c-tk', name: 'T&K TRANSPORT', chips: ['DISPATCH', 'IFTA'], st: ['FILING READY', 'ok'], t: '6 HRS AGO' },
  { b: 'MT', go: 'client/c-mt', name: 'MASON TRANSPORT', chips: ['INTAKE'], st: ['PREBUILT · NOT ACTIVE YET', 'mute'], t: 'YESTERDAY', pre: true },
];
const ACTIVITY = [
  { go: 'rec/quarter/ifta-hf-q3', t: 'IFTA Q3 RETURN PREPARED FOR HORIZON FREIGHT', time: '1 HR AGO', vis: 'internal' },
  { go: 'intake/case/mig-mt', t: 'NEW CLIENT FILE STARTED — MASON TRANSPORT', time: '3 HRS AGO', vis: 'internal' },
  { go: 'rec/policy/pol-rj', t: 'R&J TRUCKING UPLOADED AN INSURANCE RENEWAL', time: '5 HRS AGO', vis: 'client' },
  { go: 'rec/request/req-dh-ifta', t: 'PERMIT DOCUMENT APPROVED FOR DELTA HAULING', time: '6 HRS AGO', vis: 'client' },
  { go: 'rec/invoice/inv-3301', t: 'PAYMENT RECEIVED FROM T&K TRANSPORT', time: 'YESTERDAY', vis: 'internal', founder: true },
];
const QUICK = [
  { go: 'intake/flow/existing/0', l: 'START MIGRATION', to: 'INTAKE › EXISTING CLIENT FILE', i: 'migrate' },
  { go: 'intake/flow/new/0', l: 'NEW CLIENT FILE', to: 'INTAKE › NEW CLIENT FILE', i: 'person-plus' },
  { go: 'work/compliance/expirations', l: 'VIEW DEADLINES', to: 'WORK › COMPLIANCE › EXPIRATIONS', i: 'calendar' },
  { go: 'more/messages', l: 'MESSAGE A CLIENT', to: 'MORE › MESSAGES', i: 'letter' },
  { go: 'work/queue', l: 'ASSIGN WORK', to: 'WORK · MANAGERS AND FOUNDER', i: 'people', grant: 'WORK.ASSIGN' },
  { go: 'more/growth_crm', l: 'NEW LEAD', to: 'MORE › GROWTH / CRM', i: 'tag', grant: 'CRM' },
  { go: 'more/billing', l: 'CREATE INVOICE', to: 'MORE › BILLING', i: 'summary', grant: 'BILLING' },
];

/* ── shell ── */
const NAV = [
  ['home', 'HOME'],
  ['intake', 'INTAKE'],
  ['work', 'WORK'],
  ['reports', 'REPORTS'],
  ['more', 'MORE'],
];
function header() {
  const area = { home: 'HOME', work: 'WORK', reports: 'REPORTS', more: 'MORE', kit: 'DESIGN KIT', intake: 'INTAKE' }[PAGE] ?? PAGE.toUpperCase();
  const ctx = VP === 'mobile' ? '' : `<span class="head__ctx"><small>AIO OFFICE</small><b>${area}</b></span>`;
  const field = VP === 'desktop' ? `<span class="head__field" data-act="search">${ico('search')}<span>SEARCH CLIENTS, WORK, OR HELP…</span></span>` : '';
  const plus = VP === 'mobile' && PAGE === 'home' ? `<button class="head__tool head__plus" aria-label="Quick actions" data-act="quick">${ico('plus')}</button>` : '';
  const search = VP === 'desktop' ? '' : `<button class="head__tool head__search" aria-label="Search" data-act="search">${ico('search')}</button>`;
  return `<header class="head">
    <img class="head__lockup" data-go="home" src="${P}/migration/brand-lockup.png" alt="ALL IN ONE ENTERPRISES INC.">
    ${ctx}${field}${plus}${search}
    <button class="head__tool head__bell" aria-label="Notifications" data-act="notifications">${ico('bell')}<span class="head__dot"></span></button>
    ${VP === 'desktop' ? '<span class="head__rule"></span>' : ''}
    <span class="head__avatar" data-go="more/account"><span>AR</span></span>
    <span class="head__who" data-go="more/account"><b>ALEX R.</b><span>${FOUNDER ? 'FOUNDER' : 'STAFF'}</span></span>
    ${ico('down', 'head__chev')}
  </header>`;
}
function nav() {
  const on = PAGE;
  if (VP === 'desktop') {
    return `<nav class="side" aria-label="AIO office">${NAV.map(([k, l]) => `<a class="side__item navi ${k === on ? 'is-on' : ''}" data-k="${k}">${ico(k)}<span>${l}</span></a>`).join('')}</nav>`;
  }
  return `<nav class="dock" aria-label="AIO office">${NAV.map(([k, l]) => `<a class="dock__item navi ${k === on ? 'is-on' : ''}" data-k="${k}">${ico(k)}<span>${l}</span></a>`).join('')}</nav>`;
}
function plate(key, cls, inner) {
  const p = PLATES[key];
  const z = p.zoom?.[VP];
  const zoom = z ? `;width:${z * 100}%;left:auto;right:0` : '';
  return `<section class="plate plate--${p.tone} ${cls} bleed"><img src="${p.src}" alt="" style="object-position:${p.pos[VP]}${zoom}">${inner}</section>`;
}
const sample = () => `<span class="sample">SAMPLE</span>`;
const st = ([w, tone]) => `<span class="st st--${tone}">${w}</span>`;
const secHead = (title, sub, right = '') => `<div class="sec__head"><div><h2 class="sec__title">${title}</h2>${sub ? `<p class="sec__sub">${sub}</p>` : ''}</div>${right}</div>`;

/* ═══════════════ HOME ═══════════════ */
function homeHero() {
  return plate(
    'home',
    'hero plate--fade',
    `<p class="hero__kicker">GOOD MORNING, ALEX.</p>
     <h1 class="hero__title"><span>YOUR OPERATION</span><span>AT A GLANCE.</span></h1>
     <p class="hero__sub">EVERYTHING MOVING. EVERYTHING THAT NEEDS YOU. ALL IN ONE PLACE.</p>`,
  );
}
function attentionCards(view) {
  const c = [
    ['attention', '7', 'ITEMS NEED ATTENTION', 'ACROSS 5 CLIENTS'],
    ['deadlines', '4', 'DUE THIS WEEK', '1 OVERDUE'],
    ['blocked', '2', 'BLOCKED', 'WAITING ON OTHERS'],
  ];
  return `<div class="cards">${c
    .map(([k, n, l, s]) => `<div class="acard ${k === view ? 'is-on' : ''} ${k === 'blocked' ? 'acard--bad' : ''}" data-view="${k}"><span class="acard__n">${n}</span><span class="acard__l">${l}</span><span class="acard__s">${s}</span><span class="arrow ${k === view ? '' : 'arrow--quiet'}">${ico(k === view ? 'down' : 'arrow')}</span></div>`)
    .join('')}</div>`;
}
function arow(r) {
  return `<div class="arow" data-go="${r.go}"><span class="arow__pri">${st(r.pri)}</span><span class="arow__who">${r.who}</span><span class="arow__age">${r.age}</span><span class="arow__what">${r.what}</span><span class="arow__to">${ico('fwd')}${r.to}</span><span class="arow__go">${ico('fwd', 'chev')}</span></div>`;
}
function attentionList(view) {
  const titles = { attention: ['NEEDS ATTENTION', 'SHOWING 5 OF 7'], deadlines: ['DUE THIS WEEK', '4 ITEMS · TODAY IS OCT 8'], blocked: ['BLOCKED', '2 ITEMS · BY WHOM THEY WAIT ON'] };
  const [t, c] = titles[view];
  let rows = '';
  if (view === 'attention') rows = ATTENTION.map(arow).join('');
  if (view === 'deadlines') rows = DEADLINES.map(arow).join('');
  if (view === 'blocked') rows = BLOCKERS.map((r) => `<div class="agroup">${r.group}</div>${arow(r)}`).join('');
  const honest = FOUNDER
    ? `<div class="honest">${ico('info')}<span><b>NOT CONNECTED YET:</b> COMPLIANCE EXCEPTIONS · DISPATCH EXCEPTIONS · MAINTENANCE HOLDS · ROAD READY ITEMS. THEY JOIN THIS LIST WHEN THEIR SOURCES ARE CONNECTED.</span></div>`
    : '';
  return `<div class="panel alist"><div class="alist__head"><span><span class="alist__title">${t}</span>${sample()}<span class="alist__count">${c}</span></span><span class="link" data-go="home/list/${view}">VIEW ALL ${ico('fwd')}</span></div>${rows}${honest}</div>`;
}
function workTiles(cols) {
  return `<div class="tiles" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${LANES.map(
    (l) => `<div class="tile ${l.none ? 'tile--none' : ''}" data-go="work/${l.slug}"><span class="tile__n">${l.n}</span>${ico(l.icon, 'tile__ico')}<span class="tile__name">${l.name}</span><span class="tile__sig">${laneSignals(l, true).join('')}</span></div>`,
  ).join('')}</div>`;
}
function clientsPanel(table) {
  return `<div class="panel">${CLIENTS.map(
    (c) => `<div class="crow" data-go="${c.go}"><span class="badge ${c.pre ? 'badge--pre' : ''}">${c.b}</span><span class="crow__name">${c.name}</span><span class="crow__state">${st(c.st)}</span><span class="crow__chips">${c.chips.map((x) => `<span class="chip">${x}</span>`).join('')}</span><span class="crow__time">${c.t}</span></div>`,
  ).join('')}</div>`;
}
function activityPanel() {
  return `<div class="panel">${ACTIVITY.filter((e) => FOUNDER || !e.founder)
    .map(
      (e) => `<div class="erow" data-go="${e.go}"><span class="erow__mark"></span><span class="erow__text">${e.t}</span><span class="erow__time">${e.time}</span><span class="erow__meta"><span class="tag-vis tag-vis--${e.vis}">${e.vis === 'client' ? 'CLIENT-VISIBLE' : 'INTERNAL'}</span></span></div>`,
    )
    .join('')}</div>`;
}
function quickList(items, head = '') {
  return `<div class="panel">${head ? `<div class="qa__head">${head}</div>` : ''}${items
    .map((a) => `<div class="qa" data-go="${a.go}"><span class="qa__ico">${ico(a.i)}</span><span class="qa__label">${a.l}${a.grant ? `<span class="qa__grant">BY GRANT</span>` : ''}</span><span class="qa__to">${a.to}</span>${ico('fwd', 'chev')}</div>`)
    .join('')}</div>`;
}
const quickItems = () => QUICK.filter((a) => FOUNDER || !a.grant);
function pulsePanel() {
  return `<div class="panel empty"><div class="empty__frame"><span>NOT CONNECTED YET</span></div><div class="empty__t">BUSINESS PULSE APPEARS HERE ONCE PRODUCTION FIGURES ARE CONNECTED. FOUNDER AND FINANCE GRANT ONLY — NEVER A DEMO NUMBER.</div></div>`;
}

function home() {
  const view = VIEW;
  const workHead = secHead('WORK ACROSS AIO', 'WHAT IS MOVING IN EACH SERVICE — ALL TWELVE LANES.', `<span class="btn" data-go="work">OPEN WORK ${ico('fwd')}</span>`);
  const clientsHead = secHead('CLIENTS IN MOTION', 'CLIENTS CHANGING STATE OR WAITING ON US.', `<span class="btn" data-go="more/clients">VIEW ALL ${ico('fwd')}</span>`);
  const actHead = secHead('RECENT ACTIVITY', 'WHAT CHANGED ACROSS AIO.', `<span class="btn" data-go="home/activity">VIEW ALL ${ico('fwd')}</span>`);
  const sampleTag = (h) => h.replace('</h2>', `${sample()}</h2>`);
  if (VP === 'mobile') {
    const sheet =
      STATE === 'quick'
        ? `<div class="scrim" data-act="close"></div><div class="sheet"><div class="sheet__grab"></div><div class="sheet__head"><div><h2 class="sec__title">QUICK ACTIONS</h2><p class="sec__sub">EACH ONE OPENS WHERE THE WORK IS DONE.</p></div><span class="sheet__x" data-act="close">${ico('close')}</span></div>${quickList(quickItems())}</div>`
        : '';
    return `<main class="main">${homeHero()}${attentionCards(view)}${attentionList(view)}
      <section class="sec">${sampleTag(workHead)}${workTiles(3)}</section>
      <section class="sec">${sampleTag(clientsHead)}${clientsPanel()}</section>
      <section class="sec">${sampleTag(actHead)}${activityPanel()}</section>
    </main>${sheet}`;
  }
  if (VP === 'tablet') {
    const items = quickItems();
    const row = items.slice(0, 4).map((a) => `<span class="btn" data-go="${a.go}" style="height:44px;justify-content:flex-start;gap:10px"><span class="qa__ico" style="width:28px;height:28px">${ico(a.i)}</span>${a.l}</span>`).join('');
    const extra = items.length > 4 ? `<span class="btn" data-go="home/quick" style="height:44px">+${items.length - 4} MORE</span>` : '';
    return `<main class="main">${homeHero()}${attentionCards(view)}${attentionList(view)}
      <section class="sec">${sampleTag(workHead)}${workTiles(6)}</section>
      <div style="display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px">
        <section class="sec">${sampleTag(clientsHead)}${clientsPanel()}</section>
        <section class="sec">${sampleTag(actHead)}${activityPanel()}</section>
      </div>
      <section class="sec">${secHead('QUICK ACTIONS', 'EACH ONE OPENS WHERE THE WORK IS DONE.')}<div style="display:grid;grid-template-columns:repeat(${items.length > 4 ? 5 : 4},auto);gap:8px;justify-content:start">${row}${extra}</div></section>
    </main>`;
  }
  // desktop / wide: main column + context column (320 px; wider on ultra-wide)
  const ctxW = WIDE ? 380 : 320;
  return `<main class="main">${homeHero()}
    <div class="measure" style="display:grid;grid-template-columns:minmax(0,1fr) ${ctxW}px;gap:16px;align-items:start">
      <div style="margin-top:-64px;position:relative;z-index:2">${attentionCards(view)}${attentionList(view)}
        <section class="sec">${sampleTag(workHead)}${workTiles(6)}</section>
        <section class="sec">${sampleTag(clientsHead)}${clientsPanel()}</section>
      </div>
      <aside style="margin-top:-64px;position:relative;z-index:2;display:grid;gap:16px">
        <section>${quickList(quickItems(), '<h2 class="sec__title" style="font-size:16px">QUICK ACTIONS</h2><p class="sec__sub">EACH ONE OPENS WHERE THE WORK IS DONE.</p>')}</section>
        <section>${secHead(`RECENT ACTIVITY${sample()}`, 'WHAT CHANGED ACROSS AIO.', `<span class="link" data-go="home/activity">VIEW ALL ${ico('fwd')}</span>`)}${activityPanel()}</section>
        ${FOUNDER ? `<section>${secHead('BUSINESS PULSE', 'FOUNDER · FINANCE ONLY.')}${pulsePanel()}</section>` : ''}
      </aside>
    </div>
  </main>`;
}

/* ═══════════════ WORK ═══════════════ */
const MINE = [
  { go: 'rec/request/req-hf-mc', who: 'HORIZON FREIGHT', what: 'MC AUTHORITY REINSTATEMENT · PERMITTING & AUTHORITIES', due: 'DUE OCT 10', st: ['BLOCKED · EIN LETTER', 'bad'] },
  { go: 'rec/policy/pol-dh', who: 'DELTA HAULING LLC', what: 'POLICY RENEWAL QUOTE · INSURANCE', due: 'DUE OCT 14', st: ['WAITING ON CLIENT', 'warn'] },
  { go: 'rec/quarter/ifta-rl-q3', who: 'RIVERSTONE LOGISTICS', what: 'Q3 2026 IFTA RETURN · FILING & FUEL TAXES', due: 'DUE OCT 31', st: ['IN REVIEW', 'gold'] },
];
function workBand() {
  return plate(
    'work',
    'band',
    `<p class="hero__kicker">GET THINGS DONE.</p><h1 class="hero__title"><span>EVERY SERVICE.</span><span>EVERY CLIENT.</span></h1><p class="hero__sub">ALL TWELVE WORKSPACES, ONE TAP AWAY.</p>`,
  );
}
function myWork(rows = 3) {
  return `<div class="panel mine">
    <div class="mine__top"><span class="mine__title">${ico('work')}MY WORK${sample()}</span><span class="link" data-go="work/mine">OPEN MY WORK ${ico('fwd')}</span></div>
    <div class="mine__stats"><span class="stat"><b>7</b>ASSIGNED TO YOU</span><span class="stat"><b>3</b>DUE THIS WEEK</span><span class="stat stat--bad"><b>1</b>BLOCKED</span></div>
    <div class="mine__rows">${MINE.slice(0, rows)
      .map((m) => `<div class="mrow" data-go="${m.go}"><span class="mrow__who">${m.who}</span><span class="mrow__due">${m.due}</span><span class="mrow__what">${m.what}</span><span class="mrow__st">${st(m.st)}</span></div>`)
      .join('')}</div>
    <div class="honest" style="margin:10px -14px -14px;border-radius:0 0 12px 12px">${ico('info')}<span>DRIVERS & CARRIERS AND MECHANIC / MAINTENANCE DO NOT ASSIGN WORK TO STAFF YET.</span></div>
  </div>`;
}
function laneCards(cols) {
  return `<div class="lanes" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${LANES.map((l) => {
    const src = l.photo.startsWith('/') ? l.photo : l.photo;
    return `<article class="lane ${l.none ? 'lane--none' : ''}" data-go="work/${l.slug}">
      <div class="lane__img"><img src="${src}" alt="" style="object-position:${PHOTO_POS[l.n] || '50% 50%'}"><span class="lane__no">${l.n}</span>${l.standin ? '<span class="lane__standin">STAND-IN</span>' : ''}${l.none ? '' : `<span class="arrow lane__go">${ico('arrow')}</span>`}</div>
      <div class="lane__body"><span class="lane__name">${l.name}</span><span class="lane__sig">${laneSignals(l, true).join('')}</span></div>
    </article>`;
  }).join('')}</div>`;
}
function queueRow() {
  return `<div class="panel queue" data-go="work/queue"><span class="queue__ico">${ico('search')}</span><span><span class="queue__t" style="display:block">ALL OPEN WORK</span><span class="queue__s" style="display:block">SEARCH, FILTER AND SORT OPEN WORK ACROSS CLIENTS — EVERY ROW OPENS ITS CASE.</span></span><span class="arrow">${ico('arrow')}</span></div>`;
}
function work() {
  const lanesHead = secHead(`SERVICE WORKSPACES${sample()}`, 'TWELVE LANES IN THE CANONICAL ORDER. COUNTS SHOW ONLY WHERE THE LANE CAN SUPPLY THEM.');
  if (VP === 'mobile') {
    return `<main class="main">${workBand()}<div class="after-band">${myWork(2)}</div><section class="sec">${lanesHead}${laneCards(3)}</section>${queueRow()}</main>`;
  }
  if (VP === 'tablet') {
    return `<main class="main">${workBand()}<div class="after-band">${myWork(3)}</div><section class="sec">${lanesHead}${laneCards(4)}</section>${queueRow()}</main>`;
  }
  return `<main class="main">${workBand()}
    <div class="measure after-band" style="display:grid;grid-template-columns:minmax(0,1fr) ${WIDE ? 400 : 340}px;gap:16px;align-items:start">
      <section><div class="panel" style="padding:14px 16px 12px;margin-bottom:12px">${lanesHead.replace('class="sec__head"', 'class="sec__head" style="margin:0"')}</div>${laneCards(4)}${queueRow()}</section>
      <aside>${myWork(3)}</aside>
    </div></main>`;
}

/* ═══════════════ REPORTS ═══════════════ */
const AREAS = [
  ['OVERVIEW', 'reports', ['CURRENT', 'gold'], true],
  ['CLIENTS', 'company', ['PARTIAL DATA', 'mute']],
  ['SERVICES', 'work', ['PARTIAL DATA', 'mute']],
  ['FINANCIAL / REVENUE', 'summary', ['FOUNDER · FINANCE', 'gold'], false, 'finance'],
  ['FILING HISTORY', 'time-log', ['DATA READY · VIEW NOT BUILT', 'mute']],
  ['COMPLIANCE', 'security', ['EXPIRATIONS ONLY', 'mute']],
  ['DISPATCH & BROKERAGE', 'truck', ['PARTIAL DATA', 'mute']],
  ['BOOKKEEPING', 'log', ['NOT CONNECTED YET', 'mute']],
  ['MIGRATION', 'migrate', ['PARTIAL DATA', 'mute']],
  ['EXPORTS', 'download', ['CSV NOW · PDF LATER', 'mute']],
];
const visibleAreas = () => AREAS.filter((a) => FOUNDER || a[4] !== 'finance');
const FILINGS = [
  ['Q3 2026 · HORIZON FREIGHT', 'IFTA · FILED ON TIME', 'OCT 6, 2026'],
  ['Q3 2026 · DELTA HAULING LLC', 'IFTA · FILED ON TIME', 'OCT 5, 2026'],
  ['Q3 2026 · R&J TRUCKING', 'IFTA · FILED ON TIME', 'OCT 2, 2026'],
  ['Q2 2026 · T&K TRANSPORT', 'IFTA · FILED ON TIME', 'JUL 22, 2026'],
];
function reportsBand() {
  return plate('reports', 'band', `<p class="hero__kicker">REAL INSIGHTS.</p><h1 class="hero__title"><span>STRONGER</span><span>OPERATIONS.</span></h1><p class="hero__sub">WHAT HAPPENED, BACKED BY THE RECORDS — NEVER ESTIMATED.</p>`);
}
function figures(cols) {
  const f = [
    ['ACTIVE CLIENTS', '48', 'BY THE ACTIVE-CLIENT RULE · PREBUILT NEVER COUNTS', 'reports/clients'],
    ['FILINGS FILED', '36', 'THIS MONTH · LAST MONTH 29', 'reports/filing_history'],
    ['ACTIVE WORK', '62', 'ACROSS TEN CONNECTED LANES', 'reports/services'],
  ];
  const cells = f.map(([l, v, s, go]) => `<div class="panel fig" data-go="${go}"><span class="fig__l">${l}</span><span class="fig__v">${v}</span><span class="fig__s">${s}</span></div>`);
  if (FOUNDER) cells.push(`<div class="panel fig fig--locked" data-go="reports/financial_revenue"><span class="fig__l">COLLECTED REVENUE</span><span class="fig__v">$48,210</span><span class="fig__s">FOUNDER · FINANCE ONLY · COLLECTED, NEVER ESTIMATED</span></div>`);
  return `<div class="figs" style="grid-template-columns:repeat(${cols || cells.length},minmax(0,1fr))">${cells.join('')}</div>`;
}
function serviceBars() {
  const max = 14;
  return `<div class="panel bars">${LANES.map((l) => {
    if (l.none) return `<div class="bar bar--none"><span class="bar__l">${l.name}</span><span class="bar__t"></span><span class="bar__v">NO WORKSPACE YET</span></div>`;
    if (l.active === null) return `<div class="bar bar--none"><span class="bar__l">${l.name}</span><span class="bar__t"></span><span class="bar__v">NOT CONNECTED YET</span></div>`;
    return `<div class="bar" data-go="work/${l.slug}"><span class="bar__l">${l.name}</span><span class="bar__t"><i style="width:${(l.active / max) * 100}%"></i></span><span class="bar__v">${l.active}</span></div>`;
  }).join('')}<div class="honest" style="margin:8px -14px 0;border-radius:0 0 12px 12px">${ico('info')}<span><b>PARTIAL DATA:</b> ACTIVE WORK BY LANE, AS EACH LANE REPORTS IT. NO TRENDS UNTIL STATUS HISTORY IS READ.</span></div></div>`;
}
function filingHistory() {
  return `<div class="panel">${FILINGS.map(([t, s, d], i) => `<div class="frow" data-go="${['rec/quarter/ifta-hf-q3', 'rec/quarter/ifta-dh-q3', 'rec/quarter/ifta-rj-q3', 'rec/quarter/ifta-tk-q2'][i]}"><span class="frow__dot"></span><span class="frow__t">${t}</span><span class="frow__d">${d}</span><span class="frow__s">${s}</span></div>`).join('')}</div>`;
}
function clientGrowth() {
  return `<div class="panel empty"><div class="empty__frame"><span>NOT CONNECTED YET</span></div><div class="empty__t">CLIENT GROWTH NEEDS READABLE ACTIVATION DATES. IT APPEARS HERE WHEN THEY ARE RECORDED — NO PERCENTAGES UNTIL THEN.</div></div>`;
}
function exportsPanel() {
  const rows = [
    ['PERIOD SUMMARY', 'CSV · WITH THE OVERVIEW', st(['CSV', 'mute'])],
    ['FILING HISTORY', 'CSV · WHEN THE VIEW IS BUILT', st(['LATER', 'mute'])],
    ...(FOUNDER ? [['RECEIVABLES AGING', 'CSV · FOUNDER · FINANCE', st(['CSV', 'gold'])]] : []),
    ['PDF REPORTS', 'NO PDF RENDERER YET', st(['LATER', 'mute'])],
  ];
  return `<div class="panel">${rows.map(([t, s, c]) => `<div class="xrow" data-go="reports/exports"><span class="xrow__t">${t}</span><span class="xrow__s">${s}</span>${c}</div>`).join('')}</div>`;
}
function areasList() {
  return `<div class="panel">${visibleAreas()
    .map(([t, i, s, on]) => `<div class="area ${t === AREA ? 'is-on' : ''}" data-area="${t}"><span class="area__ico">${ico(i)}</span><span class="area__t">${t}</span>${st(s)}${ico('fwd', 'chev')}</div>`)
    .join('')}</div>`;
}
function areasSelector() {
  return `<div class="selector">${visibleAreas()
    .map(([t, , s, on]) => `<span class="seg ${t === AREA ? 'is-on' : ''} ${s[0].startsWith('NOT') ? 'seg--none' : ''} ${s[1] === 'gold' && t !== AREA ? 'seg--grant' : ''}" data-area="${t}">${t}${t === AREA ? '' : `<i>${s[0].split(' · ')[0]}</i>`}</span>`)
    .join('')}</div>`;
}
function periodRow() {
  const pdf = VP === 'mobile' ? '' : `<span class="btn btn--ghost" aria-disabled="true">PDF LATER</span>`;
  return `<div class="period"><span class="select" data-act="period">THIS MONTH · OCT 2026 ${ico('down')}</span><span style="display:flex;gap:8px"><span class="btn" data-sim="export-csv">${ico('download')}EXPORT CSV</span>${pdf}</span></div>`;
}
function reportsNoAccess() {
  const grantable = AREAS.filter((a) => a[4] !== 'finance' && a[0] !== 'OVERVIEW').map((a) => `<span class="chip">${a[0]}</span>`).join('');
  const split = VP !== 'mobile';
  const areas = split ? `<div class="lock__areas"><h4>AREAS THE FOUNDER CAN GRANT</h4><div>${grantable}</div></div>` : '';
  return `<div class="panel lock ${split ? 'lock--split' : ''}">${areas}
    <span class="lock__ico">${ico('lock')}</span>
    <span class="lock__t">REPORTS ARE GRANTED BY ROLE.</span>
    <p class="lock__p">YOUR ROLE DOES NOT INCLUDE REPORTING YET. THE FOUNDER GRANTS ACCESS AREA BY AREA — CLIENTS, SERVICES, FILING HISTORY AND THE OTHERS — SO EACH PERSON SEES THE FIGURES THEIR WORK NEEDS.</p>
    <p class="lock__p" style="color:var(--ink-3)">ASK THE FOUNDER FOR THE AREAS YOU NEED. UNTIL THEN, YOUR ASSIGNED WORK AND DEADLINES ARE ALWAYS IN WORK AND HOME.</p>
    <span class="lock__go"><span class="btn" data-go="work/mine">${ico('work')}OPEN MY WORK</span><span class="btn" data-go="home">${ico('home')}BACK TO HOME</span></span>
  </div>`;
}
function reports() {
  const noAccess = ROLE === 'staff';
  if (noAccess) {
    return `<main class="main">${reportsBand()}<div class="${VP === 'desktop' ? 'measure ' : ''}after-band">${reportsNoAccess()}</div></main>`;
  }
  const ovHead = secHead(`OVERVIEW${sample()}`, 'FOUR FIGURES THE RECORDS CAN BACK. EACH OPENS ITS AREA.');
  if (VP === 'mobile') {
    return `<main class="main">${reportsBand()}<div class="after-band panel" style="padding:12px 12px 12px">${ovHead.replace('class="sec__head"', 'class="sec__head" style="margin-bottom:10px"')}${periodRow()}</div>
      <div style="margin-top:10px">${figures(2)}</div>
      <section class="sec">${secHead('SERVICE ACTIVITY', 'ACTIVE WORK BY LANE.')}${serviceBars()}</section>
      <section class="sec">${secHead('FILING HISTORY', 'FILED QUARTERS, NEWEST FIRST.', `<span class="link" data-go="reports/filing_history">VIEW ALL ${ico('fwd')}</span>`)}${filingHistory()}</section>
      <section class="sec">${secHead('CLIENT GROWTH', 'ACTIVE CLIENTS OVER TIME.')}${clientGrowth()}</section>
      <section class="sec">${secHead('REPORT AREAS', FOUNDER ? 'ALL TEN AREAS, WITH WHAT EACH CAN SHOW TODAY.' : 'THE AREAS YOUR ROLE IS GRANTED.')}${areasList()}</section>
    </main>`;
  }
  if (VP === 'tablet') {
    return `<main class="main">${reportsBand()}<div class="after-band panel" style="padding:14px">${areasSelector()}</div>
      <section class="sec">${ovHead}<div style="margin-bottom:10px">${periodRow()}</div>${figures(4)}</section>
      <div style="display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:14px">
        <section class="sec">${secHead('SERVICE ACTIVITY', 'ACTIVE WORK BY LANE.')}${serviceBars()}</section>
        <div><section class="sec">${secHead('FILING HISTORY', 'FILED QUARTERS, NEWEST FIRST.')}${filingHistory()}</section>
        <section class="sec">${secHead('CLIENT GROWTH', 'ACTIVE CLIENTS OVER TIME.')}${clientGrowth()}</section></div>
      </div>
      <section class="sec">${secHead('EXPORTS', 'WHAT CAN LEAVE AIO, BY GRANT.')}${exportsPanel()}</section>
    </main>`;
  }
  const band = WIDE ? '' : reportsBand();
  return `<main class="main">${band}
    <div class="measure ${WIDE ? '' : 'after-band'}" style="display:grid;grid-template-columns:260px minmax(0,1fr);gap:16px;align-items:start;${WIDE ? 'margin-top:24px' : ''}">
      <aside><div class="panel" style="padding:14px 14px 10px;margin-bottom:10px"><h2 class="sec__title" style="font-size:16px">REPORT AREAS</h2><p class="sec__sub">${FOUNDER ? 'ALL TEN, WITH TODAY’S STATE.' : 'THE AREAS YOUR ROLE IS GRANTED.'}</p></div>${areasList()}</aside>
      <div>
        <div class="panel" style="padding:14px 16px">${ovHead.replace('class="sec__head"', 'class="sec__head" style="margin-bottom:12px"')}${periodRow()}</div>
        <div style="margin-top:12px">${figures()}</div>
        <div style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:16px">
          <section class="sec">${secHead('SERVICE ACTIVITY', 'ACTIVE WORK BY LANE.')}${serviceBars()}</section>
          <div><section class="sec">${secHead('FILING HISTORY', 'FILED QUARTERS, NEWEST FIRST.', `<span class="link" data-go="reports/filing_history">VIEW ALL ${ico('fwd')}</span>`)}${filingHistory()}</section>
          <section class="sec">${secHead('CLIENT GROWTH', 'ACTIVE CLIENTS OVER TIME.')}${clientGrowth()}</section></div>
        </div>
        <section class="sec">${secHead('EXPORTS', 'WHAT CAN LEAVE AIO, BY GRANT.')}${exportsPanel()}</section>
      </div>
    </div></main>`;
}

/* ═══════════════ MORE ═══════════════ */
const GROUPS = [
  ['CLIENTS & RECORDS', [
    ['CLIENTS', 'company', 'EVERY CLIENT ACCOUNT AND ITS CLIENT 360.'],
    ['DOCUMENTS & VAULT', 'folder', 'CLIENT AND INTERNAL FILES — EACH LABELLED STAFF ONLY OR CLIENT-VISIBLE.'],
    ['MESSAGES', 'letter', 'CLIENT CONVERSATIONS AND INTERNAL NOTES.'],
  ]],
  ['BUSINESS', [
    ['GROWTH / CRM', 'person-plus', 'LEADS, PIPELINE AND FOLLOW-UPS.', ['BY GRANT', 'gold'], 'grant'],
    ['BILLING', 'summary', 'QUOTES, INVOICES, PAYMENTS AND CREDITS.', ['BY GRANT', 'gold'], 'grant'],
    ['SERVICE CATALOG', 'tag', 'WHAT AIO OFFERS, AND TO WHOM.', ['PRICING · FOUNDER', 'gold'], null, ['VIEW ONLY', 'mute']],
  ]],
  ['PEOPLE & NETWORK', [
    ['TEAM & STAFF', 'people', 'TEAM MEMBERS, ROLES AND GRANTS.', ['ROLES · FOUNDER', 'gold'], null, ['VIEW ONLY', 'mute']],
    ['MECHANIC NETWORK', 'wrench', 'MAINTENANCE PROVIDERS AND PARTNERS.'],
  ]],
  ['SYSTEM', [
    ['SYSTEM SETTINGS', 'setup', 'WORKFLOWS, INTEGRATIONS, SECURITY AND DATA.', ['ALL AREAS · FOUNDER', 'gold'], null, ['GRANTED AREAS', 'mute']],
    ['HELP & SUPPORT', 'help', 'TRAINING, SOPS AND SUPPORT.'],
    ['ACCOUNT', 'profile', 'YOUR PROFILE, SECURITY AND PREFERENCES — THE SAME PLACE AS THE PROFILE MENU.', ['NOT BUILT YET', 'mute'], 'notbuilt'],
  ]],
];
function moreBand() {
  return plate('more', 'band', `<p class="hero__kicker">YOUR AIO OFFICE.</p><h1 class="hero__title"><span>EVERYTHING</span><span>WITHIN REACH.</span></h1><p class="hero__sub">CLIENTS, BUSINESS, PEOPLE AND SYSTEM — ONE DIRECTORY.</p>`);
}
function groupBlock([g, entries]) {
  const rows = entries
    .filter((e) => FOUNDER || (e[4] !== 'grant' && e[4] !== 'notbuilt'))
    .map(([t, i, s, chipF, , chipS]) => {
      const chip = FOUNDER ? chipF : chipS;
      return `<div class="entry" data-go="more/${t.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')}"><span class="entry__ico">${ico(i)}</span><span class="entry__t">${t}${chip ? st(chip) : ''}</span><span class="entry__s">${s}</span>${ico('fwd', 'chev')}</div>`;
    });
  return `<section class="group"><h3 class="group__t">${g}</h3><div class="panel">${rows.join('')}</div></section>`;
}
function more() {
  const search = `<div class="search" data-act="search">${ico('search')}${VP === 'mobile' ? 'SEARCH CLIENTS, DOCUMENTS, LEADS…' : 'SEARCH CLIENTS, DOCUMENTS, LEADS OR INVOICES…'}</div>`;
  const note = FOUNDER
    ? ''
    : `<div class="panel honest" style="border-radius:12px;border:1px solid var(--line);margin-top:14px">${ico('info')}<span>ENTRIES APPEAR BY ROLE AND GRANT. GROWTH / CRM AND BILLING SHOW WHEN YOUR ROLE INCLUDES THEM.</span></div>`;
  if (VP === 'mobile') {
    return `<main class="main">${moreBand()}<div class="after-band">${search}</div><div style="display:grid;gap:18px;margin-top:18px">${GROUPS.map(groupBlock).join('')}</div>${note}</main>`;
  }
  if (VP === 'tablet') {
    return `<main class="main">${moreBand()}<div class="after-band">${search}</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 14px;margin-top:20px;align-items:start">${GROUPS.map(groupBlock).join('')}</div>${note}</main>`;
  }
  return `<main class="main">${moreBand()}<div class="measure after-band" style="max-width:${WIDE ? 1480 : 1180}px">${search}<div style="display:grid;grid-template-columns:repeat(${WIDE ? 4 : 2},minmax(0,1fr));gap:22px 18px;margin-top:22px;align-items:start">${GROUPS.map(groupBlock).join('')}</div>${note}</div></main>`;
}

/* ═══════════════ KIT (components + states) ═══════════════ */
function kit() {
  const cell = (cap, html, w = 'auto') => `<div class="kit__cell" style="width:${w}">${html}<span class="kit__cap">${cap}</span></div>`;
  const oneLane = (l) => {
    const tmp = LANES.splice(0, LANES.length, l);
    const h = laneCards(1);
    LANES.splice(0, LANES.length, ...tmp);
    return h;
  };
  const oneTile = (l) => {
    const tmp = LANES.splice(0, LANES.length, l);
    const h = workTiles(1);
    LANES.splice(0, LANES.length, ...tmp);
    return h;
  };
  const L = (n) => LANES.find((l) => l.n === n);
  return `<main class="kit">
    <h2>COLOUR · TYPE</h2>
    <div class="kit__row">
      ${[['OBSIDIAN #19191B', '#19191b'], ['GOLD #F1C158 → #E7AB3C', 'linear-gradient(180deg,#f1c158,#e7ab3c)'], ['IVORY PAGE #F3F0EA', '#f3f0ea'], ['CARD #FFFDF9', '#fffdf9'], ['ON TRACK (WORD + GREEN)', '#2f7d43'], ['NEEDS ATTENTION (WORD + AMBER)', '#a8670f'], ['BLOCKED / OVERDUE (WORD + OXBLOOD)', '#962a2a']]
        .map(([c, v]) => cell(c, `<div class="kit__swatch" style="background:${v}"></div>`))
        .join('')}
      ${cell('DISPLAY · ROBOTO CONDENSED 800', '<div class="hero__title" style="margin:0">YOUR OPERATION</div>', '300px')}
      ${cell('TEXT · ROBOTO 400 · ALL UPPERCASE', '<div class="hero__sub" style="margin:0;max-width:240px">EVERYTHING MOVING. EVERYTHING THAT NEEDS YOU.</div>', '260px')}
    </div>
    <h2>CONTROLS — SQUARE-ROUNDED (8–10 PX); ONLY THE AVATAR IS ROUND</h2>
    <div class="kit__row">
      ${cell('PHONE HEADER QUICK ACTIONS', `<span class="head__tool head__plus" style="width:34px;height:34px">${ico('plus')}</span>`)}
      ${cell('PRIMARY (ONE PER SCREEN)', `<span class="btn btn--gold">START MIGRATION ${ico('fwd')}</span>`)}
      ${cell('SECONDARY', `<span class="btn">OPEN WORK ${ico('fwd')}</span>`)}
      ${cell('UNAVAILABLE — SAYS SO', `<span class="btn btn--ghost" aria-disabled="true">PDF LATER</span>`)}
      ${cell('CARD ARROW (NAVIGATION)', `<span class="arrow">${ico('arrow')}</span>`)}
      ${cell('PERIOD', `<span class="select">THIS MONTH · OCT 2026 ${ico('down')}</span>`)}
      ${cell('AVATAR', `<span class="head__avatar" style="width:44px;height:44px"><span>AR</span></span>`)}
    </div>
    <h2>STATUS — ALWAYS A WORD</h2>
    <div class="kit__row">${[['URGENT', 'bad'], ['OVERDUE', 'bad'], ['BLOCKED', 'bad'], ['HIGH', 'warn'], ['TODAY', 'warn'], ['SOON', 'gold'], ['ON TRACK', 'ok'], ['NOT CONNECTED YET', 'mute'], ['NOT BUILT YET', 'mute'], ['PREBUILT · NOT ACTIVE YET', 'mute'], ['BY GRANT', 'gold'], ['FOUNDER · FINANCE', 'gold']].map((s) => st(s)).join('')}
      <span class="tag-vis tag-vis--internal">INTERNAL</span><span class="tag-vis tag-vis--client">CLIENT-VISIBLE</span>${sample()}</div>
    <h2>NAVIGATION — FIVE ITEMS, ONE LIST, ONE PRESENTATION PER VIEWPORT</h2>
    <div class="kit__row">
      ${cell('DOCK ITEM (PHONE / TABLET)', `<div style="display:flex;gap:8px;background:#fcfbf9;padding:8px;border-radius:14px">${NAV.map(([k, l]) => `<a class="dock__item navi ${k === 'work' ? 'is-on' : ''}" style="width:66px;height:54px;gap:6px;border-radius:10px;font:500 10px/1 var(--text)">${ico(k)}<span>${l}</span></a>`).join('')}</div>`)}
      ${cell('SIDEBAR ITEM (DESKTOP)', `<div style="width:138px;background:#faf9f7;padding:8px 0;display:grid;gap:5px">${NAV.map(([k, l]) => `<a class="side__item navi ${k === 'work' ? 'is-on' : ''}">${ico(k)}<span>${l}</span></a>`).join('')}</div>`)}
    </div>
    <h2>WORK LANE SIGNALS — TRUTH FROM THE LANE CONTRACT</h2>
    <div class="kit__row">
      ${cell('COUNT + BLOCKED', oneLane(L('01')), '200px')}
      ${cell('NOTHING NEEDS ATTENTION', oneLane(L('08')), '200px')}
      ${cell('ATTENTION NOT CONNECTED YET', oneLane(L('10')), '200px')}
      ${cell('NO STAFF WORKSPACE — NOT A LINK', oneLane(L('04')), '200px')}
      ${cell('HOME TILE · COUNT', oneTile(L('02')), '150px')}
      ${cell('HOME TILE · NOT CONNECTED + BLOCKED', oneTile(L('11')), '150px')}
      ${cell('HOME TILE · NO WORKSPACE', oneTile(L('04')), '150px')}
    </div>
    <h2>REPORT FIGURE STATES</h2>
    <div class="kit__row">
      ${cell('SUPPORTED', `<div class="panel fig" style="width:200px"><span class="fig__l">ACTIVE WORK</span><span class="fig__v">62</span><span class="fig__s">ACROSS TEN CONNECTED LANES</span></div>`)}
      ${cell('INCOMPLETE — LABELLED', `<div class="panel fig" style="width:200px"><span class="fig__l">ACTIVE REQUESTS</span><span class="fig__v">21</span><span class="fig__s"><span class="st st--mute">PARTIAL DATA</span></span></div>`)}
      ${cell('NOT YET CONNECTED', `<div class="panel fig" style="width:200px"><span class="fig__l">CLIENT GROWTH</span><span class="fig__v" style="font-size:15px;line-height:1.2;color:#8a8275">NOT CONNECTED YET</span><span class="fig__s">NEEDS READABLE ACTIVATION DATES</span></div>`)}
      ${cell('RESTRICTED — FOUNDER / FINANCE', `<div class="panel fig fig--locked" style="width:200px"><span class="fig__l">COLLECTED REVENUE</span><span class="fig__v">$48,210</span><span class="fig__s">STAFF WITHOUT THE GRANT NEVER SEE THIS TILE OR A GAP FOR IT</span></div>`)}
      ${cell('EMPTY PERIOD', `<div class="panel fig" style="width:200px"><span class="fig__l">FILINGS FILED</span><span class="fig__v">0</span><span class="fig__s">NOTHING FILED IN THIS PERIOD · CHECKED OCT 8, 9:02 AM</span></div>`)}
    </div>
    <h2>ICONS — APPROVED SHEET + THE SUPPLEMENTAL OUTLINE FAMILY (NEW GLYPHS MARKED)</h2>
    <div class="kit__row" style="gap:18px">${LANES.map((l) => cell(`${l.name}${NEW_GLYPHS.includes(l.icon) ? ' · NEW GLYPH' : ''}`, `<div style="display:grid;place-items:center;width:56px;height:56px;border-radius:12px;background:#fffdf9;border:1px solid var(--line);color:var(--gold-lo)">${ico(l.icon)}</div>`, '96px')).join('')}</div>
    <div class="kit__row" style="gap:18px;margin-top:14px">${['home', 'intake', 'work', 'reports', 'more', 'search', 'bell', 'plus', 'company', 'folder', 'letter', 'person-plus', 'summary', 'tag', 'people', 'wrench', 'setup', 'help', 'profile', 'calendar', 'migrate', 'download', 'security', 'lock']
      .map((n) => cell(n.toUpperCase(), `<div style="display:grid;place-items:center;width:44px;height:44px;border-radius:10px;background:#f6efe0">${ico(n)}</div>`, '64px'))
      .join('')}</div>
  </main>`;
}

/* ═══════════════ mount ═══════════════ */
async function mount() {
  const sheet = await (await fetch(`${P}/migration/icons/aio-icon-sheet.svg`)).text();
  const holder = document.createElement('div');
  holder.style.display = 'none';
  holder.innerHTML = sheet;
  document.body.appendChild(holder);
  const body = { home, work, reports, more, kit }[PAGE]();
  const app = document.createElement('div');
  app.className = 'ao';
  app.innerHTML = PAGE === 'kit' ? body : `${header()}${nav()}${body}`;
  document.body.appendChild(app);
  if (VP === 'desktop' && WIDE) document.documentElement.style.setProperty('--pad-x', '24px');
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  document.documentElement.dataset.ready = '1';
}
if (!EMBED) mount();
