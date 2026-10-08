/*
 * AIO OFFICE unified review — router, shell and review chrome.
 *
 * The approved roots (HOME · WORK · REPORTS · MORE) are drawn by studio.js exactly as approved; every other page is an
 * office page module (pages-*.js) built from the shared components in office-ui.js. Pages render into one scaled device
 * frame (phone 390 · tablet 834 · desktop 1440 · ultra-wide 2560) under the approved header + five-root navigation.
 *
 * Routes (kept in the address hash so a page can be shared):
 *   home · home/list/<attention|deadlines|blocked> · home/activity · home/quick · home/notifications
 *   intake · intake/<section> · intake/case/<id> · intake/flow/<existing|new|bulk|activation>/<step>
 *   work · work/mine · work/queue · work/<lane>[/<tab>] · rec/<type>/<id> · client/<id>[/<tab>]
 *   reports · reports/<domain> · more · more/<entry>[/<child>]
 *   "~filter" filters a list; "@clientId" sets the client context.
 *
 * Interaction attributes: data-go (navigate) · data-sim (a SIMULATED action: confirmed in a sheet, kept for this visit
 * only, never saved or sent) · data-act (back, search, switch, clear-client, quick, close, period, notifications).
 */
const DEVICES = {
  phone: [390, 844, 'mobile', false],
  tablet: [834, 1194, 'tablet', false],
  desktop: [1440, 900, 'desktop', false],
  wide: [2560, 1440, 'desktop', true],
};
const APP = { route: 'home', stack: [], device: 'desktop', role: 'founder', ctx: '', origin: null, view: 'attention', state: '', overlay: null, period: 'THIS MONTH · OCT 2026', journey: null, jstep: 0, sims: [], guide: true };
let META = {};
let PAGE_GAPS = [];
let CUR = { route: 'home', seg: ['home'], filter: '', client: '' };
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

function parse(route) {
  const [beforeAt, client = ''] = route.split('@');
  const [path, filter = ''] = beforeAt.split('~');
  return { route, path, seg: path.split('/').filter(Boolean), filter, client };
}
function rootOf(r) {
  const s0 = r.seg[0];
  if (['home', 'intake', 'work', 'reports', 'more'].includes(s0)) return s0;
  if (s0 === 'rec') return RECORD_TYPES[r.seg[1]]?.lane ? 'work' : 'more';
  if (s0 === 'client') return 'more';
  return 'home';
}
/** The page family, its review status and the live product status — shown in the review guide, never in the office. */
function meta(family, status, live, note = '') {
  META = { family, status, live, note };
}

/* ── page dispatch ── */
function pageFor(r) {
  const s = r.seg;
  PAGE_GAPS = [];
  switch (s[0]) {
    case 'home':
      if (!s[1]) return meta('HOME', 'APPROVED ROOT', 'LIVE: PARTIAL · /office'), home();
      return homePage(r);
    case 'intake':
      return intakePage(r);
    case 'work':
      if (!s[1]) return meta('WORK', 'APPROVED ROOT', 'LIVE: PARTIAL · /office/work'), work();
      return workPage(r);
    case 'reports':
      if (!s[1]) return meta('REPORTS · OVERVIEW', 'APPROVED ROOT', 'LIVE: PARTIAL · /office/reports'), reports();
      return reportsPage(r);
    case 'more':
      if (!s[1]) return meta('MORE', 'APPROVED ROOT', 'LIVE: NOT BUILT AS A ROOT · ENTRIES EXIST'), more();
      return morePage(r);
    case 'rec':
      return recordPage(s[1], s[2], r);
    case 'client':
      return client360(s[1], s[2] || 'overview', r);
  }
  return missing(r);
}
function missing(r) {
  SESSION.gaps.add(r.route);
  meta('MISSING DESTINATION', 'NOT DESIGNED', '—');
  return `<main class="main">${pageHead({ trail: [['HOME', 'home'], ['NOT FOUND']], title: 'THIS DESTINATION IS NOT DESIGNED YET', sub: `THE REVIEW RECORDED IT IN THE INCOMPLETE-DESTINATIONS LIST: ${r.route.toUpperCase()}` })}</main>`;
}

/* ── device + render ── */
const $ = (id) => document.getElementById(id);
let device, screenEl, layerEl;

function render({ top = false, keepScroll = null } = {}) {
  const r = parse(APP.route);
  const [w, h, vp, wide] = DEVICES[APP.device];
  if (r.client && ACCOUNTS[r.client]) APP.ctx = r.client;
  CUR = r;
  studioSet({ page: rootOf(r), role: APP.role, vp, wide, view: APP.view, state: APP.state, area: APP.area || 'OVERVIEW' });
  device.dataset.vp = vp;
  device.dataset.wide = wide ? '1' : '0';
  device.dataset.device = APP.device;
  device.style.width = `${w}px`;
  device.style.height = `${h}px`;
  device.style.setProperty('--dw', `${w}px`);
  device.style.setProperty('--pad-x', wide ? '24px' : '16px');
  let body;
  try {
    body = pageFor(r);
  } catch (err) {
    console.error(err);
    meta('ERROR', 'BROKEN', '—');
    body = `<main class="main">${pageHead({ trail: [['HOME', 'home'], ['ERROR']], title: 'THIS PAGE FAILED TO DRAW', sub: String(err.message || err).toUpperCase() })}</main>`;
  }
  screenEl.innerHTML = `<div class="ao">${header()}${nav()}${body}</div>`;
  renderLayer();
  if (top) screenEl.scrollTop = 0;
  if (keepScroll != null) screenEl.scrollTop = keepScroll;
  try {
    history.replaceState(null, '', `#${APP.route}`);
  } catch {}
  fit();
  renderChrome();
}

function fit() {
  if (APP.capture) return;
  const [w, h] = DEVICES[APP.device];
  const stage = $('stage');
  const availW = stage.clientWidth;
  const top = stage.getBoundingClientRect().top + window.scrollY;
  const availH = window.innerWidth < 700 ? Infinity : Math.max(520, window.innerHeight - top - 16);
  const s = Math.min(1, availW / w, availH / h);
  device.style.transform = `scale(${s})`;
  $('sizer').style.width = `${Math.floor(w * s)}px`;
  $('sizer').style.height = `${Math.floor(h * s)}px`;
  $('scale').textContent = s < 1 ? `${w} × ${h} · shown at ${Math.round(s * 100)}%` : `${w} × ${h}`;
}

/* ── navigation ── */
function go(route) {
  if (!route) return;
  const from = parse(APP.route);
  const to = parse(route);
  // return-to-work: remember the last WORK list a person left for a record or a client
  if (from.seg[0] === 'work' && from.seg[1] && (to.seg[0] === 'rec' || to.seg[0] === 'client')) APP.origin = APP.route;
  if (to.seg[0] === 'work' && !to.seg[1]) APP.origin = null;
  APP.stack.push({ route: APP.route, scroll: screenEl.scrollTop, view: APP.view });
  if (APP.stack.length > 60) APP.stack.shift();
  APP.route = route;
  APP.state = '';
  APP.overlay = null;
  if (APP.journey) syncJourney();
  render({ top: true });
}
function back() {
  const prev = APP.stack.pop();
  APP.overlay = null;
  APP.state = '';
  if (prev) {
    APP.route = prev.route;
    APP.view = prev.view || APP.view;
    if (APP.journey) syncJourney();
    return render({ keepScroll: prev.scroll });
  }
  const r = parse(APP.route);
  APP.route = r.seg.length > 1 ? r.seg.slice(0, -1).join('/') : 'home';
  render({ top: true });
}

/* ── taps inside the device ── */
const TAP = '[data-k],[data-view],[data-area],[data-act],[data-sim],[data-go],[data-gap],.head__chev';
function onTap(e) {
  const el = e.target.closest(TAP);
  if (!el) return;
  e.preventDefault();
  const d = el.dataset;
  if (d.k) return go(d.k);
  if (d.view) {
    APP.view = d.view;
    return render({ keepScroll: screenEl.scrollTop });
  }
  if (d.area) {
    const slug = slugify(d.area);
    return go(slug === 'overview' ? 'reports' : `reports/${slug}`);
  }
  if (d.act) return act(d.act, el);
  if (d.sim) return simAsk(el);
  if (d.go) return go(d.go);
  if (d.gap) {
    SESSION.gaps.add(d.gap);
    renderChrome();
    return toast(`NOT DESIGNED YET · ADDED TO THE INCOMPLETE LIST`);
  }
  if (el.classList.contains('head__chev')) return go('more/account');
}
function act(name, el) {
  switch (name) {
    case 'back':
      return back();
    case 'quick':
      APP.state = 'quick';
      return render({ keepScroll: screenEl.scrollTop });
    case 'close':
      APP.state = '';
      APP.overlay = null;
      return render({ keepScroll: screenEl.scrollTop });
    case 'search':
      APP.overlay = { kind: 'search', q: '' };
      renderLayer();
      return layerEl.querySelector('input')?.focus();
    case 'switch':
      APP.overlay = { kind: 'switch' };
      return renderLayer();
    case 'period':
      APP.overlay = { kind: 'period' };
      return renderLayer();
    case 'notifications':
      return go('home/notifications');
    case 'set-period':
      APP.period = el.dataset.v;
      APP.overlay = null;
      toast('SAMPLE FIGURES DO NOT CHANGE WITH THE PERIOD IN THIS REVIEW');
      return render({ keepScroll: screenEl.scrollTop });
    case 'set-ctx': {
      const id = el.dataset.id;
      APP.ctx = id;
      APP.overlay = null;
      const r = parse(APP.route);
      if (r.seg[0] === 'client') return go(`client/${id}${r.seg[2] ? `/${r.seg[2]}` : ''}`);
      if (r.seg[0] === 'rec') return go(`client/${id}`);
      APP.route = `${r.path}${r.filter ? `~${r.filter}` : ''}@${id}`;
      return render({ top: true });
    }
    case 'clear-client': {
      APP.ctx = '';
      const r = parse(APP.route);
      if (r.client) APP.route = `${r.path}${r.filter ? `~${r.filter}` : ''}`;
      return render({ keepScroll: screenEl.scrollTop });
    }
    case 'sim-confirm':
      return simDo();
  }
}

/* ── simulated actions ── */
function simAsk(el) {
  const label = (el.dataset.label || el.textContent || '').replace(/FOUNDER$/, '').trim();
  APP.overlay = { kind: 'sim', label, effect: el.dataset.effect || '', set: el.dataset.set || '', key: el.dataset.sim };
  renderLayer();
}
function simDo() {
  const o = APP.overlay;
  if (!o) return;
  // data-set: one or more "key=WORD|tone" changes, separated by ";" (kept for this visit only)
  if (o.set)
    o.set.split(';').forEach((one) => {
      const [key, word] = one.split('=');
      const [w, tone] = word.split('|');
      SESSION.status[key] = [w, tone || 'gold'];
    });
  const recKey = o.set ? o.set.split(';')[0].split('=')[0] : APP.route;
  (SESSION.history[recKey] ||= []).unshift(['JUST NOW', o.label, 'ALEX R.', 'sim']);
  APP.sims.unshift({ label: o.label, route: APP.route });
  APP.overlay = null;
  render({ keepScroll: screenEl.scrollTop });
  toast(`SIMULATED · NOT SAVED — ${o.label}`);
}
/** Session history for a record (simulated steps first), merged above its sample history. */
const histFor = (key, base) => [...(SESSION.history[key] || []), ...base];

/* ── overlays (inside the device so they scale with it) ── */
function renderLayer() {
  const o = APP.overlay;
  if (!o) {
    layerEl.innerHTML = '';
    return;
  }
  const close = `<span class="btn btn--sm btn--icon" data-act="close" aria-label="Close">${ico('close')}</span>`;
  let inner = '';
  if (o.kind === 'search') {
    inner = `<div class="ovl__head"><b class="ovl__t">SEARCH AIO</b>${close}</div>
      <label class="ovl__input">${ico('search')}<input type="search" value="${o.q}" placeholder="CLIENTS, RECORDS, DOCUMENTS, WORK…" aria-label="Search"></label>
      <div class="ovl__results">${searchResults(o.q)}</div>
      <small class="muted">EVERY RESULT OPENS ITS OWNER. RESULTS FOLLOW YOUR ROLE.</small>`;
  }
  if (o.kind === 'switch') {
    inner = `<div class="ovl__head"><b class="ovl__t">SWITCH CLIENT</b>${close}</div>
      <p class="sec__sub">THE CLIENT CONTEXT FOLLOWS YOU ACROSS SERVICES UNTIL YOU CLEAR IT.</p>
      <div class="panel rows">${Object.values(ACCOUNTS)
        .map((c) => `<div class="row" data-act="set-ctx" data-id="${c.id}"><span class="row__lead">${badge(c)}</span><span class="row__t"><b>${c.name}</b><small>${c.dot} · ${c.state}</small></span><span class="row__s">${st(LIFE[c.life])}</span></div>`)
        .join('')}</div>`;
  }
  if (o.kind === 'period') {
    inner = `<div class="ovl__head"><b class="ovl__t">REPORTING PERIOD</b>${close}</div>
      <div class="panel rows">${['THIS MONTH · OCT 2026', 'LAST MONTH · SEP 2026', 'THIS QUARTER · Q4 2026', 'LAST QUARTER · Q3 2026', 'YEAR TO DATE · 2026']
        .map((p) => `<div class="row" data-act="set-period" data-v="${p}"><span class="row__t"><b>${p}</b></span>${p === APP.period ? `<span class="row__s">${st(['SELECTED', 'gold'])}</span>` : ''}</div>`)
        .join('')}</div>
      <small class="muted">CUSTOM RANGES ARE NOT BUILT YET.</small>`;
  }
  if (o.kind === 'sim') {
    inner = `<div class="ovl__head"><b class="ovl__t">${o.label}</b>${close}</div>
      <div class="sim-note"><b>SIMULATED IN THIS REVIEW.</b> NOTHING IS SAVED, SENT OR CHARGED. THE CHANGE LASTS UNTIL YOU RELOAD.</div>
      ${o.effect ? `<p class="ovl__p">IN THE LIVE OFFICE THIS WOULD: ${o.effect}</p>` : ''}
      <div class="pg__acts"><span class="btn btn--gold" data-act="sim-confirm">${ico('pass')}SIMULATE</span><span class="btn" data-act="close">CANCEL</span></div>`;
  }
  layerEl.innerHTML = `<div class="ovl" data-act="close"></div><div class="ovl__panel ${o.kind === 'sim' ? 'ovl__panel--sheet' : ''}" role="dialog" aria-modal="true">${inner}</div>`;
}
function searchIndex() {
  const out = [];
  Object.values(ACCOUNTS).forEach((c) => out.push(['CLIENT', c.name, `client/${c.id}`, LIFE[c.life]]));
  for (const [type, def] of Object.entries(RECORD_TYPES)) {
    if (type === 'invoice' && !FOUNDER) continue;
    for (const r of Object.values(def.table)) {
      const c = ACCOUNTS[r.client];
      out.push([type.toUpperCase(), `${def.title(r)}${c ? ` · ${c.name}` : ''}`, `rec/${type}/${r.id}`, statusOf(type, r, statusWord(r))]);
    }
  }
  if (FOUNDER) Object.values(LEADS).forEach((l) => out.push(['LEAD', l.name, `more/growth_crm/${l.id}`, l.stage]));
  Object.values(MIG_CASES).forEach((m) => out.push(['MIGRATION', m.name, `intake/case/${m.id}`, m.stage]));
  LANES.forEach((l) => out.push(['WORK LANE', l.name, `work/${l.slug}`, null]));
  return out;
}
function searchResults(q) {
  const t = q.trim().toUpperCase();
  const list = searchIndex().filter(([, label]) => !t || label.includes(t)).slice(0, t ? 14 : 8);
  if (!list.length) return `<div class="panel rows"><div class="rows__empty">NOTHING MATCHES “${t}”.</div></div>`;
  return `<div class="panel rows">${list.map(([k, label, go, s]) => `<div class="row" data-go="${go}"><span class="row__t"><b>${label}</b><small>${k}</small></span>${s ? `<span class="row__s">${st(s)}</span>` : ''}</div>`).join('')}</div>`;
}

let toastTimer = 0;
function toast(text) {
  const t = $('ao-toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2800);
}

/* ═══════════════ review chrome (outside the device) ═══════════════ */
const STATUS_NOTE = {
  'APPROVED ROOT': 'Approved root design, drawn exactly as approved.',
  'APPROVED AUTHORITY': 'An approved authority screen, shown unchanged — not redesigned here.',
  'NEW · FOR REVIEW': 'Designed in this sprint for founder review.',
  'HONEST STATE': 'The product does not have this yet; the page says so instead of inventing it.',
  'NOT DESIGNED': 'Not designed in this review — recorded below.',
  BROKEN: 'Failed to draw.',
};
function renderChrome() {
  document.querySelectorAll('[data-device]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.device === APP.device)));
  document.querySelectorAll('[data-role]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === APP.role)));
  $('addr').textContent = `#${APP.route}`;
  $('vback').disabled = !APP.stack.length;
  const g = $('guide');
  g.hidden = !APP.guide;
  $('vbody').classList.toggle('has-guide', APP.guide);
  $('guide-toggle').setAttribute('aria-pressed', String(APP.guide));
  if (!APP.guide) return;
  const j = APP.journey ? JOURNEYS.find((x) => x.id === APP.journey) : null;
  const gaps = [...SESSION.gaps];
  g.innerHTML = `
    <section class="g-sec"><h2>This page</h2>
      <p class="g-fam">${META.family || '—'}</p>
      <p><span class="g-tag g-tag--${slugify(META.status || '')}">${META.status || ''}</span></p>
      <p class="g-muted">${STATUS_NOTE[META.status] || ''}</p>
      <p class="g-live">${META.live || ''}</p>
      ${META.note ? `<p class="g-muted">${META.note}</p>` : ''}
      ${PAGE_GAPS.length ? `<p class="g-muted">Not built in the product, shown honestly here: ${PAGE_GAPS.join(' · ')}</p>` : ''}
    </section>
    <section class="g-sec"><h2>Journeys</h2>
      ${j ? `<div class="g-journey"><p class="g-fam">${j.title}</p><p class="g-muted">Step ${APP.jstep + 1} of ${j.steps.length}: ${j.steps[APP.jstep][1]}</p>
        <div class="g-row"><button type="button" data-jprev ${APP.jstep === 0 ? 'disabled' : ''}>Previous</button><button type="button" data-jnext>${APP.jstep === j.steps.length - 1 ? 'Finish' : 'Next step'}</button><button type="button" data-jstop>Stop</button></div></div>` : ''}
      <ol class="g-list">${JOURNEYS.map((x) => `<li><button type="button" class="g-link ${x.id === APP.journey ? 'is-on' : ''}" data-journey="${x.id}">${x.title}</button><span class="g-muted">${x.steps.length} steps${x.role ? ` · as ${x.role}` : ''}</span></li>`).join('')}</ol>
    </section>
    <section class="g-sec"><h2>Legend</h2>
      <ul class="g-legend"><li><b>Navigation</b> is real inside the review: every tap opens a designed page.</li><li><b>Simulated</b> actions ask first and change this visit only. Nothing is saved or sent.</li><li><b>Not built yet</b> panels mark what the live product does not have.</li><li><b>Sample</b> marks illustrative records. No real client data.</li></ul>
    </section>
    <section class="g-sec"><h2>Simulated this visit (${APP.sims.length})</h2>
      ${APP.sims.length ? `<ul class="g-plain">${APP.sims.slice(0, 6).map((s) => `<li>${s.label}</li>`).join('')}</ul><button type="button" data-reset>Reset the review</button>` : '<p class="g-muted">None yet.</p>'}
    </section>
    <section class="g-sec"><h2>Incomplete destinations</h2>
      <ul class="g-plain">${INCOMPLETE.map(([route, label]) => `<li><button type="button" class="g-link" data-jump="${route}">${label}</button></li>`).join('')}${gaps.map((r) => `<li class="g-bad">Not designed: ${r}</li>`).join('')}</ul>
    </section>`;
}

/* Product destinations that exist in the office map but are not built in the live app; each opens its honest page. */
const INCOMPLETE = [
  ['work/vehicles', 'Vehicles & Fleet — no staff workspace in the live app (design only)'],
  ['work/permitting/boc3', 'Permitting › BOC-3 — partner workflow, not built'],
  ['work/compliance/dot_safety', 'Compliance › DOT / Safety — not built'],
  ['work/compliance/audits', 'Compliance › Audits — not built'],
  ['work/compliance/corrective', 'Compliance › Corrective work — not built'],
  ['work/dispatch/my_loads', 'Dispatch › My loads / my trucks — not built'],
  ['work/bookkeeping/reconciliation', 'Bookkeeping › Reconciliation — not built'],
  ['work/bookkeeping/deliverables', 'Bookkeeping › Deliverables — not built'],
  ['work/drivers/credentials', 'Drivers › Credentials — not built'],
  ['work/drivers/approvals', 'Drivers › Approvals — not built'],
  ['work/brokerage', 'Brokerage — paused until business activation'],
  ['reports/filing_history', 'Reports › Filing history — data ready, view not built'],
  ['reports/bookkeeping', 'Reports › Bookkeeping — not connected'],
  ['reports/exports', 'Reports › Exports — CSV only, PDF later'],
  ['more/account', 'More › Account — not built'],
];

/* ── cross-service journeys (each step is a route + what to look at) ── */
const JOURNEYS = [
  { id: 'renewal', title: 'An insurance renewal from HOME to the client', steps: [['home', 'HOME lists the renewal as URGENT. Tap the first row.'], ['rec/policy/pol-dh', 'The policy: expiry, the covered truck, the documents, the owner. Simulate SEND RENEWAL QUOTE.'], ['rec/vehicle/v-dh-12', 'The same truck, linked — not copied — from Vehicles & Fleet.'], ['client/c-dh', 'Client 360 shows every service for Delta Hauling in one place.'], ['rec/thread/th-dh', 'The client conversation, with internal notes drawn apart.']] },
  { id: 'blocked', title: 'A blocked authority: what it holds up', steps: [['home/list/blocked', 'Everything blocked, grouped by who it waits on.'], ['rec/request/req-hf-mc', 'MC reinstatement, blocked on a missing EIN letter.'], ['rec/document/doc-hf-ein', 'The requested document: not received, client-visible.'], ['rec/vehicle/v-hf-3', 'The truck cannot be dispatched while the authority is inactive.'], ['rec/profile/rr-hf', 'Road Ready shows the same gap on the client’s checklist.']] },
  { id: 'oos', title: 'An out-of-service truck ripples across lanes', steps: [['work/dispatch', 'The dispatch board shows LOAD 5517 in ISSUE.'], ['rec/load/ld-5517', 'The load: the truck was placed out of service at pickup.'], ['rec/vehicle/v-tk-09', 'The truck record: out of service, linked ticket and deadline.'], ['rec/ticket/t-tk-2', 'Maintenance: repairs wait on the client’s authorization.'], ['work/compliance/expirations', 'Compliance lists it as BLOCKING DISPATCH.']] },
  { id: 'pod', title: 'A missing POD holds up factoring', steps: [['rec/load/ld-5518', 'Delivered, but the proof of delivery is missing.'], ['rec/submission/fs-2210', 'Factoring waits on it. AIO refers; the provider funds.'], ['rec/document/doc-tk-2', 'The client uploaded a bill of lading for review.']] },
  { id: 'migration', title: 'Migration lands on PREBUILT, never ACTIVE', steps: [['intake', 'INTAKE: the approved migration root inside the office.'], ['intake/flow/existing/0', 'The approved EXISTING CLIENT FILE flow, step by step.'], ['intake/case/mig-sr', 'A case waiting on founder review.'], ['intake/prebuilt', 'PREBUILT clients are prepared, not active.'], ['client/c-mt', 'Mason Transport: PREBUILT · NOT ACTIVE YET. Client confirmation is still required.'], ['intake/activation', 'Invites sent; the client confirms in their own office.']] },
  { id: 'ifta', title: 'An IFTA quarter from queue to client approval', steps: [['work/filing', 'The approved IFTA LIGHT ANALYTICS COMMAND, inside FILING & FUEL TAXES.'], ['work/filing/queue', 'The IFTA queue by bucket.'], ['rec/quarter/ifta-rl-q3', 'The quarter case. Simulate SEND FOR CLIENT APPROVAL.'], ['client/c-rl', 'Riverstone’s other services: bookkeeping, compliance, maintenance.']] },
  { id: 'credential', title: 'A driver credential expiring', steps: [['work/compliance/expirations', 'Expirations by window.'], ['rec/deadline/dl-abc-med', 'Medical card expires Oct 29.'], ['rec/driver/d-abc-1', 'The driver record and assigned truck.'], ['rec/vehicle/v-abc-1', 'The truck: IRP registration pending, inspection due.']] },
  { id: 'paused', title: 'Brokerage stays paused', steps: [['work/brokerage', 'Paused: business activation required. Nothing here books a real load.'], ['rec/shipment/sh-4471', 'A demo shipment. Activation is not a switch in this review.']] },
  { id: 'roles', title: 'What staff see differently', role: 'staff', steps: [['reports', 'Staff without a reports grant see the lock, not the figures.'], ['more', 'MORE hides Growth / CRM and Billing without a grant.'], ['more/billing', 'Opening Billing directly shows the permission page.'], ['rec/policy/pol-dh', 'Founder-only actions are not offered.']] },
];
function startJourney(id) {
  const j = JOURNEYS.find((x) => x.id === id);
  APP.journey = id;
  APP.jstep = 0;
  if (j.role) APP.role = j.role;
  else if (APP.role !== 'founder' && id !== 'roles') APP.role = 'founder';
  go(j.steps[0][0]);
}
function syncJourney() {
  const j = JOURNEYS.find((x) => x.id === APP.journey);
  const i = j.steps.findIndex(([r]) => r === APP.route);
  if (i >= 0) APP.jstep = i;
}

/* ── boot ── */
function boot() {
  device = $('ao-root');
  screenEl = $('ao-screen');
  layerEl = $('ao-layer');
  screenEl.addEventListener('click', onTap);
  layerEl.addEventListener('click', onTap);
  layerEl.addEventListener('input', (e) => {
    if (e.target.matches('input[type=search]') && APP.overlay?.kind === 'search') {
      APP.overlay.q = e.target.value;
      layerEl.querySelector('.ovl__results').innerHTML = searchResults(APP.overlay.q);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && APP.overlay) act('close');
  });
  document.querySelector('.tools').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.device) {
      APP.device = b.dataset.device;
      APP.state = '';
      render({ top: true });
    }
    if (b.dataset.role) {
      APP.role = b.dataset.role;
      APP.state = '';
      render({ keepScroll: screenEl.scrollTop });
    }
    if (b.id === 'guide-toggle') {
      APP.guide = !APP.guide;
      renderChrome();
      fit();
    }
    if (b.id === 'vback') back();
    if (b.id === 'vsearch') act('search');
  });
  $('vjump').addEventListener('change', (e) => {
    if (e.target.value) go(e.target.value);
    e.target.value = '';
  });
  $('guide').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.journey) return startJourney(b.dataset.journey);
    const j = JOURNEYS.find((x) => x.id === APP.journey);
    if (b.hasAttribute('data-jnext')) {
      if (APP.jstep < j.steps.length - 1) {
        APP.jstep += 1;
        return go(j.steps[APP.jstep][0]);
      }
      APP.journey = null;
      return renderChrome();
    }
    if (b.hasAttribute('data-jprev') && APP.jstep > 0) {
      APP.jstep -= 1;
      return go(j.steps[APP.jstep][0]);
    }
    if (b.hasAttribute('data-jstop')) {
      APP.journey = null;
      return renderChrome();
    }
    if (b.dataset.jump) return go(b.dataset.jump);
    if (b.hasAttribute('data-reset')) {
      SESSION.status = {};
      SESSION.history = {};
      APP.sims = [];
      return render({ keepScroll: screenEl.scrollTop });
    }
  });
  window.addEventListener('resize', fit);
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash) APP.route = hash;
  const q = new URLSearchParams(location.search);
  if (DEVICES[q.get('device')]) APP.device = q.get('device');
  else APP.device = window.innerWidth >= 1500 ? 'desktop' : window.innerWidth >= 1000 ? 'tablet' : 'phone';
  if (['founder', 'staff', 'staff-granted'].includes(q.get('role'))) APP.role = q.get('role');
  if (q.get('guide') === '0') APP.guide = false;
  render({ top: true });
  document.documentElement.dataset.ready = '1';
  /* QA hook (qa.mjs drives the review through it; the review itself never calls it) */
  window.AIO_REVIEW = {
    go(route) {
      APP.stack = [];
      APP.route = route;
      APP.state = '';
      APP.overlay = null;
      render({ top: true });
      return { status: META.status, family: META.family, live: META.live, gaps: PAGE_GAPS.slice(), links: [...screenEl.querySelectorAll('[data-go]')].map((e) => e.dataset.go) };
    },
    set(o) {
      Object.assign(APP, o);
      render({ top: true });
    },
    state: () => ({ route: APP.route, ctx: APP.ctx, sims: APP.sims.length, overlay: APP.overlay?.kind ?? null, stack: APP.stack.length, status: { ...SESSION.status } }),
    /** Full-length capture: the device grows to its content, unscaled (the dock sits at the end of the page). */
    full(on) {
      APP.capture = !!on;
      if (!on) return render({ top: true });
      device.style.transform = 'scale(1)'; // keeps the device the containing block for its fixed header, sidebar and dock
      device.style.height = `${Math.max(DEVICES[APP.device][1], screenEl.scrollHeight)}px`;
      $('sizer').style.height = device.style.height;
      $('sizer').style.width = `${DEVICES[APP.device][0]}px`;
    },
    journeys: () => JOURNEYS.map((j) => ({ id: j.id, role: j.role || 'founder', steps: j.steps.map(([r]) => r) })),
    incomplete: () => INCOMPLETE.map(([r, l]) => ({ route: r, label: l })),
  };
}
