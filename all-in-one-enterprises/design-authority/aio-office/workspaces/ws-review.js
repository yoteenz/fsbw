/*
 * AIO OFFICE workspace proofs — the founder review. One landing, four workspaces, a device switch, a founder / staff
 * switch, a BEFORE view and a few TRY demonstrations that drive the real controls. The workspaces draw inside the
 * approved header and five-root navigation, in a device frame scaled to the window.
 */
const DEVICES = {
  phone: [390, 844, 'mobile', false],
  tablet: [834, 1194, 'tablet', false],
  desktop: [1440, 900, 'desktop', false],
  wide: [2560, 1440, 'desktop', true],
};
const WORKSPACES = [
  { id: 'fleet', no: '04', name: 'VEHICLES & FLEET', page: 'work', view: () => fleetView(), diag: 'before-after-fleet.jpg', shape: 'A TRUCK', line: 'PICK A TRUCK. ALL IT TOUCHES IS ON IT.' },
  { id: 'books', no: '09', name: 'BOOKKEEPING', page: 'work', view: () => booksView(), diag: 'before-after-books.jpg', shape: 'A MONTH', line: 'ONE CLIENT, ONE MONTH, LINE BY LINE.' },
  { id: 'comp', no: '03', name: 'COMPLIANCE', page: 'work', view: () => compView(), diag: 'before-after-comp.jpg', shape: 'A CALENDAR', line: 'WHAT IS DUE, HOW SOON, WHAT CLEARS IT.' },
  { id: 'client', no: '360', name: 'CLIENT 360', page: 'more', view: () => clientView(), diag: 'before-after-client.jpg', shape: 'A COMPANY', line: 'WHO THEY ARE, WHAT WE DO, WHAT IS OPEN.' },
];
const wsById = (id) => WORKSPACES.find((w) => w.id === id);

/* TRY: each step names the control it presses ([data-a][data-v]) so the reviewer sees where it is. */
const DEMOS = {
  fleet: [
    ['SELECT A TRUCK', [['fl.unit', 'v-abc-1', 'UNIT 1 · ABC TRUCKING'], ['fl.sec', 'insurance', 'ITS INSURANCE'], ['fl.sec', 'driver', 'ITS DRIVER'], ['fl.sec', 'compliance', 'ITS DEADLINES']]],
    ['CLEAR A BLOCKER', [['fl.unit', 'v-tk-09', 'UNIT 09 · OUT OF SERVICE'], ['fl.sec', 'maintenance', 'THE REPAIR TICKET'], ['sim.ask', 'fl:tk:t-tk-2', 'REQUEST AUTHORIZATION'], ['sim.ok', 'fl:tk:t-tk-2', 'CONFIRM · SIMULATED']]],
    ['FILTER THE YARD', [['fl.filter', 'shop', 'IN THE SHOP'], ['fl.filter', 'stop', 'STOPPED'], ['fl.filter', 'all', 'ALL TRUCKS']]],
  ],
  books: [
    ['CHANGE THE MONTH', [['bk.period', 'AUG 2026', 'AUGUST · CLOSED'], ['bk.period', 'OCT 2026', 'OCTOBER · NOT STARTED'], ['bk.period', 'SEP 2026', 'SEPTEMBER · IN PROGRESS']]],
    ['CHASE A MISSING PAPER', [['bk.phase', 'collect', 'COLLECT'], ['bk.item', 'doc:s4', 'FUEL RECEIPTS · MISSING'], ['sim.ask', 'bk:rem:c-tk:SEP 2026:s4', 'SEND A REMINDER'], ['sim.ok', 'bk:rem:c-tk:SEP 2026:s4', 'CONFIRM · SIMULATED']]],
    ['ANSWER A QUESTION', [['bk.phase', 'reconcile', 'RECONCILE'], ['bk.item', 'q:q1', 'AN UNCATEGORIZED CHARGE'], ['bk.cat', 'q1|FUEL', 'CATEGORIZE AS FUEL · SIMULATED']]],
  ],
  comp: [
    ['INSPECT A DEADLINE', [['cp.item', 'dl-abc-med', 'A MEDICAL CARD · 21 DAYS'], ['cp.item', 'dl-tk-09', 'UNIT 09 · BLOCKING DISPATCH'], ['cp.item', 'dl-rj-ucr', 'UCR · OVERDUE']]],
    ['ONLY WHAT IS DUE NOW', [['cp.filter', 'now', 'NOW'], ['cp.filter', 'week', 'THIS WEEK'], ['cp.filter', 'all', 'EVERYTHING TRACKED']]],
    ['FOLLOW IT TO THE TRUCK', [['cp.item', 'dl-abc-insp', 'UNIT 1 INSPECTION'], ['go', 'fleet:v-abc-1:compliance', 'OPEN THE TRUCK IN FLEET'], ['ret', '', 'BACK TO COMPLIANCE']]],
  ],
  client: [
    ['ABC → INSURANCE → A TRUCK → BACK', [['cl.client', 'c-abc', 'ABC TRUCKING LLC'], ['cl.service', 'insurance', 'INSURANCE'], ['cl.push', 'policy:pol-abc', 'THE POLICY'], ['cl.push', 'vehicle:v-abc-1', 'A COVERED TRUCK'], ['cl.back', '', 'BACK TO THE POLICY'], ['cl.back', '', 'BACK TO INSURANCE']]],
    ['MOVE BETWEEN SERVICES', [['cl.client', 'c-abc', 'ABC TRUCKING LLC'], ['cl.service', 'permitting', 'PERMITTING'], ['cl.service', 'compliance', 'COMPLIANCE'], ['cl.view', 'fleet', 'ITS TRUCKS']]],
    ['TO FLEET AND BACK', [['cl.client', 'c-abc', 'ABC TRUCKING LLC'], ['cl.view', 'fleet', 'ITS TRUCKS'], ['cl.push', 'vehicle:v-abc-1', 'UNIT 1'], ['go', 'fleet:v-abc-1', 'OPEN UNIT 1 IN FLEET'], ['ret', '', 'BACK TO ABC TRUCKING LLC']]],
  ],
};
/* On a phone some choices open the drawer instead of a side panel. */
const PHONE_ACT = { 'fl.sec': 'fl.open', 'bk.item': 'bk.open', 'cp.item': 'cp.open' };

const RULES = [
  ['THE WORK IS THE HERO', 'NO PHOTO BAND. A SLIM BAR, THEN THE WORK.'],
  ['CHOOSE → WORK → ACT', 'THREE REGIONS, SHAPED FOR EACH JOB.'],
  ['ONE SCREEN', 'DESKTOP FITS. ONLY LISTS SCROLL.'],
  ['DETAIL ON DEMAND', 'ONE SECTION AT A TIME, IN THE PANEL.'],
  ['NUMBERS ARE INSTRUMENTS', 'READOUTS, NOT A ROW OF CARDS.'],
  ['SHAPE + WORD', 'RED ONLY FOR LATE OR BLOCKING. GOLD IS NOW.'],
  ['ONE GOLD NEXT STEP', 'WHERE THE DECISION IS. SIMULATED IS SAID.'],
  ['TEN WORDS A LINE', 'NO EXPLANATIONS INSIDE THE PRODUCT.'],
  ['OBSIDIAN · IVORY · GOLD', 'DARK STAGE FOR FOCUS, IVORY TO WORK ON.'],
  ['PHOTOS WITH A JOB', 'A PHOTO IDENTIFIES OR SETS PLACE.'],
  ['CONTEXT TRAVELS', 'EVERY JUMP KEEPS A WAY BACK.'],
  ['EACH DEVICE ITS OWN', 'PHONE, TABLET, DESKTOP, WIDE — RECOMPOSED.'],
];

const RV = { view: 'overview', device: 'desktop', before: false, demo: null, step: -1, timer: null, lightbox: null, speed: 1 };
const $ = (id) => document.getElementById(id);
let device, screenEl, toastTimer;

/* ── drawing ── */
function deviceInner(wsId) {
  const w = wsById(wsId);
  studioSet({ page: w.page, role: WSX.role });
  let body;
  try {
    body = w.view();
  } catch (err) {
    console.error(err);
    body = `<div class="ws"><p class="ntb">THIS WORKSPACE FAILED TO DRAW · ${String(err.message || err).toUpperCase()}</p></div>`;
  }
  return `<div class="ao">${header()}${nav()}<main class="main ws-main">${body}</main></div>`;
}
function keepScroll() {
  const k = {};
  screenEl.querySelectorAll('[data-keep]').forEach((el) => (k[el.dataset.keep] = el.scrollTop));
  k.__screen = screenEl.scrollTop;
  return k;
}
function restoreScroll(k) {
  screenEl.querySelectorAll('[data-keep]').forEach((el) => {
    if (k[el.dataset.keep] != null) el.scrollTop = k[el.dataset.keep];
  });
  screenEl.scrollTop = k.__screen ?? 0;
}
/** Bring the selected row into view inside its list (after a demo step or a change made elsewhere). */
function revealSelected() {
  screenEl.querySelectorAll('[data-keep] .is-sel').forEach((el) => {
    const box = el.closest('[data-keep]');
    const top = el.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = Math.max(0, top - 40);
  });
}

function render({ top = false, reveal = false } = {}) {
  const [w, h, vp, wide] = DEVICES[RV.device];
  WSX.device = RV.device;
  studioSet({ vp, wide, role: WSX.role });
  document.querySelector('.rv').dataset.view = RV.view;
  const landing = RV.view === 'overview';
  $('rv-landing').hidden = !landing;
  $('rv-work').hidden = landing;
  if (landing) {
    drawLanding();
  } else {
    WSX.ws = RV.view;
    const k = top ? {} : keepScroll();
    device.dataset.vp = vp;
    device.dataset.wide = wide ? '1' : '0';
    device.dataset.device = RV.device;
    device.style.width = `${w}px`;
    device.style.height = `${h}px`;
    device.style.setProperty('--dw', `${w}px`);
    device.style.setProperty('--dh', `${h}px`);
    device.style.setProperty('--pad-x', wide ? '24px' : '16px');
    for (const key of Object.keys(SIM)) delete SIM[key];
    screenEl.innerHTML = deviceInner(RV.view);
    restoreScroll(k);
    if (reveal) revealSelected();
    $('rv-before').hidden = !RV.before;
    $('rv-stagewrap').hidden = RV.before;
    if (RV.before) drawBefore();
    flash();
  }
  drawChrome();
  if (!landing) fit();
}

function drawChrome() {
  document.querySelectorAll('[data-rv-tab]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.rvTab === RV.view)));
  document.querySelectorAll('[data-rv-device]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rvDevice === RV.device)));
  document.querySelectorAll('[data-rv-role]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rvRole === WSX.role)));
  const w = wsById(RV.view);
  $('rv-line').innerHTML = w ? `<b>${w.shape}</b><span>${w.line}</span>` : '';
  const demos = w ? DEMOS[w.id] : [];
  $('rv-try').innerHTML = demos.length
    ? `<span class="rv-k">TRY</span>${demos.map(([label], i) => `<button type="button" class="rv-demo" data-rv-demo="${i}" aria-pressed="${RV.demo === i}">${ico('run')}${label}</button>`).join('')}`
    : '';
  $('rv-beforebtn').setAttribute('aria-pressed', String(RV.before));
  $('rv-beforebtn').hidden = !w;
  $('rv-sims').textContent = WSX.sims.length ? `${WSX.sims.length} SIMULATED · NOTHING SAVED` : '';
  $('rv-reset').hidden = !WSX.sims.length;
}

/* ── landing: four live miniatures, the diagnosis and the rules ── */
function drawLanding() {
  const keep = { device: RV.device, ws: WSX.ws, sheet: WSX.sheet, pending: WSX.pending };
  studioSet({ vp: 'desktop', wide: false, role: WSX.role });
  WSX.sheet = false;
  WSX.pending = null;
  const cards = WORKSPACES.map((w) => {
    WSX.ws = w.id;
    const inner = deviceInner(w.id);
    return `<div class="rv-card" role="button" tabindex="0" data-rv-tab="${w.id}" aria-label="Open ${w.name}">
      <span class="rv-mini"><span class="ao-root device rv-mini__dev" data-vp="desktop" data-wide="0" data-device="desktop" style="--dw:1440px;--dh:900px;width:1440px;height:900px" inert>${inner}</span></span>
      <span class="rv-card__cap"><span class="rv-card__no">${w.no}</span><span class="rv-card__t">${w.name}</span><span class="rv-card__shape">${w.shape}</span><span class="rv-card__go">${ico('fwd')}</span></span>
    </div>`;
  }).join('');
  Object.assign(WSX, keep);
  for (const key of Object.keys(SIM)) delete SIM[key];
  const diag = [
    ['diagnosis-1-one-template.jpg', 'ONE TEMPLATE FOR EVERYTHING'],
    ['diagnosis-2-fleet.jpg', 'THE TRUCK WAS A TABLE'],
    ['diagnosis-3-bookkeeping.jpg', 'THE MONTH WAS A LIST'],
    ['diagnosis-4-compliance.jpg', 'DEADLINES WITHOUT TIME'],
    ['diagnosis-5-client.jpg', 'THE CLIENT WAS A FORM'],
  ];
  $('rv-landing').innerHTML = `
    <section class="rv-hero"><p class="rv-eyebrow">FOUR WORKSPACES · CANDIDATES FOR APPROVAL</p><h2>EACH ONE SHAPED LIKE ITS WORK.</h2></section>
    <div class="rv-cards">${cards}</div>
    <section class="rv-sec"><header><h3>BEFORE → AFTER</h3><span>THE SAME SAMPLE RECORDS · OPEN ANY BOARD</span></header>
      <div class="rv-diag rv-diag--4">${WORKSPACES.map((w) => `<button type="button" class="rv-thumb" data-rv-lightbox="${w.diag}"><img src="diagnosis/${w.diag}" alt="" loading="lazy"><span>${w.name}</span></button>`).join('')}</div></section>
    <section class="rv-sec"><header><h3>THE RULES</h3><span>TWELVE, FOR EVERY WORKSPACE THAT FOLLOWS</span></header>
      <ol class="rv-rules">${RULES.map(([t, s], i) => `<li><i>${String(i + 1).padStart(2, '0')}</i><b>${t}</b><span>${s}</span></li>`).join('')}</ol></section>
    <section class="rv-sec"><header><h3>SAME FAMILY AS THE APPROVED ROOTS</h3><span>HEADER, NAVIGATION, TYPE AND GOLD ARE UNCHANGED</span></header>
      <div class="rv-diag rv-diag--one"><button type="button" class="rv-thumb" data-rv-lightbox="family-roots.jpg"><img src="diagnosis/family-roots.jpg" alt="" loading="lazy"><span>APPROVED WORK ROOT NEXT TO THE FOUR WORKSPACES</span></button></div></section>
    <section class="rv-sec"><header><h3>WHAT WAS WRONG</h3><span>THE BATCH 1 DIAGNOSIS</span></header>
      <div class="rv-diag">${diag.map(([f, l]) => `<button type="button" class="rv-thumb" data-rv-lightbox="${f}"><img src="diagnosis/${f}" alt="" loading="lazy"><span>${l}</span></button>`).join('')}</div></section>`;
  scaleMinis();
}
function scaleMinis() {
  document.querySelectorAll('.rv-mini').forEach((m) => {
    const s = m.clientWidth / 1440;
    m.style.height = `${Math.round(900 * s)}px`;
    m.firstElementChild.style.transform = `scale(${s})`;
  });
}
function drawBefore() {
  const w = wsById(RV.view);
  $('rv-before').innerHTML = `<figure class="rv-beforefig"><figcaption><b>BEFORE → AFTER</b><span>THE SAME SAMPLE RECORDS</span><button type="button" class="rv-btn rv-btn--on" data-rv-before="0">SEE THE NEW ${w.name}</button></figcaption><img src="diagnosis/${w.diag}" alt="Batch 1 ${w.name} diagnosis board"></figure>`;
}

function fit() {
  if (RV.capture) return;
  const [w, h] = DEVICES[RV.device];
  const stage = $('rv-stage');
  const availW = stage.clientWidth;
  const top = stage.getBoundingClientRect().top + window.scrollY;
  const availH = window.innerWidth < 700 ? Infinity : Math.max(480, window.innerHeight - top - 14);
  const s = Math.min(1, availW / w, availH / h);
  device.style.transform = `scale(${s})`;
  $('rv-sizer').style.width = `${Math.floor(w * s)}px`;
  $('rv-sizer').style.height = `${Math.floor(h * s)}px`;
  $('rv-scale').textContent = `${w} × ${h}${s < 1 ? ` · ${Math.round(s * 100)}%` : ''}`;
}

/* ── toasts (inside the device, so they scale with it) ── */
function toast(text) {
  const t = $('rv-toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}
function flash() {
  if (!WSX.flash) return;
  toast(WSX.flash);
  WSX.flash = null;
}

/* ── one action → state → redraw ── */
function run(a, v, { reveal = false } = {}) {
  const fn = ACT[a];
  if (!fn) {
    console.error(`no handler for ${a}`);
    return false;
  }
  fn(v);
  if (WSX.ws !== RV.view) RV.view = WSX.ws; // a cross-workspace jump
  render({ reveal });
  return true;
}
function onTap(e) {
  if (RV.demo != null && e.isTrusted) stopDemo();
  const el = e.target.closest('[data-a], [data-k], [data-act], [data-go], .head__chev');
  if (!el || !screenEl.contains(el)) return;
  if (el.dataset.a) {
    if (el.matches('input')) return;
    e.preventDefault();
    return run(el.dataset.a, el.dataset.v ?? '');
  }
  shellTap(el);
}
/** The approved header and navigation stay live: WORK and MORE move between the workspaces, the rest say where they lead. */
function shellTap(el) {
  const k = el.dataset.k;
  if (k === 'work') {
    const next = ['fleet', 'books', 'comp'].includes(RV.view) ? RV.view : 'fleet';
    if (next === RV.view) return toast('WORK · THIS LANE IS OPEN');
    RV.view = next;
    return render({ top: true });
  }
  if (k === 'more') {
    if (RV.view === 'client') return toast('MORE · CLIENTS · CLIENT 360 IS OPEN');
    RV.view = 'client';
    return render({ top: true });
  }
  if (k) return toast(`${k.toUpperCase()} · APPROVED ROOT · UNCHANGED IN THIS REVIEW`);
  const act = el.dataset.act;
  if (act === 'search') {
    const f = screenEl.querySelector('#fl-q, #cl-q');
    if (f) return f.focus();
    return toast('SEARCH · CLIENTS, WORK AND HELP · OUTSIDE THIS REVIEW');
  }
  if (act === 'notifications') return toast('NOTIFICATIONS · OUTSIDE THIS REVIEW');
  if (el.dataset.go === 'home') {
    RV.view = 'overview';
    return render({ top: true });
  }
  return toast(`SIGNED IN AS ${WSX.role === 'founder' ? 'FOUNDER' : 'STAFF'} · SWITCH WITH VIEW AS ABOVE`);
}
function onInput(e) {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const { id } = el;
  const pos = el.selectionStart;
  ACT[el.dataset.input]?.(el.value);
  render();
  const again = id && $(id);
  if (again) {
    again.focus();
    try {
      again.setSelectionRange(pos, pos);
    } catch {}
  }
}

/* ── TRY demonstrations ── */
function stopDemo() {
  clearTimeout(RV.timer);
  RV.demo = null;
  RV.step = -1;
  $('rv-cap').hidden = true;
  screenEl.querySelectorAll('.rv-hl').forEach((x) => x.classList.remove('rv-hl'));
  drawChrome();
}
function startDemo(i) {
  stopDemo();
  RV.before = false;
  WSX.sheet = false;
  WSX.pending = null;
  RV.demo = i;
  render();
  nextStep();
}
function findControl(a, v) {
  const sel = v ? `[data-a="${a}"][data-v="${CSS.escape(v)}"]` : `[data-a="${a}"]`;
  return [...screenEl.querySelectorAll(sel)].find((el) => el.getClientRects().length && !el.closest('[inert]'));
}
function nextStep() {
  const list = DEMOS[RV.view]?.[RV.demo]?.[1];
  if (!list) return stopDemo();
  RV.step += 1;
  if (RV.step >= list.length) {
    RV.timer = setTimeout(stopDemo, 1800 * RV.speed);
    return;
  }
  let [a, v, say] = list[RV.step];
  if (VP === 'mobile' && PHONE_ACT[a]) a = PHONE_ACT[a];
  if (VP === 'mobile' && a === 'cl.client' && WSX.client.id !== v) WSX.sheet = 'dir', render();
  const cap = $('rv-cap');
  cap.hidden = false;
  cap.innerHTML = `<i>${RV.step + 1}/${list.length}</i>${say}`;
  const el = findControl(a, v) || (PHONE_ACT[list[RV.step][0]] ? findControl(list[RV.step][0], v) : null);
  if (el) {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    el.classList.add('rv-hl');
  }
  RV.timer = setTimeout(() => {
    run(a, v, { reveal: true });
    RV.timer = setTimeout(nextStep, 1150 * RV.speed);
  }, (el ? 750 : 250) * RV.speed);
}

/* ── boot ── */
function boot() {
  device = $('rv-device');
  screenEl = $('rv-screen');
  screenEl.addEventListener('click', onTap);
  screenEl.addEventListener('input', onInput);
  document.addEventListener('keydown', (e) => {
    const card = e.target.closest?.('.rv-card');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      return card.click();
    }
    if (e.key !== 'Escape') return;
    if (RV.lightbox) return closeLightbox();
    if (WSX.pending || WSX.sheet) {
      WSX.pending = null;
      WSX.sheet = false;
      render();
    }
  });
  document.querySelector('.rv').addEventListener('click', (e) => {
    const b = e.target.closest('button, [data-rv-tab]');
    if (!b || screenEl.contains(b)) return;
    const d = b.dataset;
    if (d.rvTab) {
      stopDemo();
      RV.view = d.rvTab;
      RV.before = false;
      WSX.sheet = false;
      WSX.pending = null;
      render({ top: true });
      window.scrollTo(0, 0);
    } else if (d.rvDevice) {
      stopDemo();
      RV.device = d.rvDevice;
      WSX.sheet = false;
      WSX.pending = null;
      render({ top: true });
    } else if (d.rvRole) {
      WSX.role = d.rvRole;
      WSX.pending = null;
      if (WSX.role !== 'founder' && WSX.client.view === 'billing') WSX.client.view = 'overview';
      WSX.client.stack = WSX.client.stack.filter((k) => WSX.role === 'founder' || !k.startsWith('invoice:'));
      render();
    } else if (d.rvDemo != null) {
      startDemo(Number(d.rvDemo));
    } else if (d.rvBefore != null) {
      stopDemo();
      RV.before = d.rvBefore === 'toggle' ? !RV.before : d.rvBefore === '1';
      render();
    } else if (d.rvLightbox) {
      openLightbox(d.rvLightbox);
    } else if (b.id === 'rv-reset') {
      WSX.over = {};
      WSX.hist = {};
      WSX.sims = [];
      WSX.pending = null;
      render();
    }
  });
  $('rv-lightbox').addEventListener('click', closeLightbox);
  window.addEventListener('resize', () => (RV.view === 'overview' ? scaleMinis() : fit()));
  const q = new URLSearchParams(location.search);
  const hash = decodeURIComponent(location.hash.slice(1));
  if (wsById(hash) || hash === 'overview') RV.view = hash;
  if (DEVICES[q.get('device')]) RV.device = q.get('device');
  else RV.device = window.innerWidth < 760 ? 'phone' : window.innerWidth < 1100 ? 'tablet' : 'desktop';
  if (['founder', 'staff'].includes(q.get('role'))) WSX.role = q.get('role');
  render({ top: true });
  document.documentElement.dataset.ready = '1';
  /* QA hook (qa.mjs drives the review through it; the review itself never calls it) */
  window.AIO_WS = {
    open(view, devName, role) {
      stopDemo();
      if (view) RV.view = view;
      if (devName) RV.device = devName;
      if (role) WSX.role = role;
      RV.before = false;
      render({ top: true });
    },
    act(a, v) {
      return run(a, v ?? '', { reveal: true });
    },
    set(path, value) {
      const parts = path.split('.');
      let o = WSX;
      while (parts.length > 1) o = o[parts.shift()];
      o[parts[0]] = value;
      render({ reveal: true });
    },
    reset() {
      WSX.over = {};
      WSX.hist = {};
      WSX.sims = [];
      WSX.pending = null;
      WSX.sheet = false;
      WSX.ret = null;
      Object.assign(WSX.fleet, { unit: 'v-tk-09', sec: 'maintenance', filter: 'all', q: '' });
      Object.assign(WSX.books, { client: 'c-tk', period: 'SEP 2026', phase: 'reconcile', item: 'q:q1' });
      Object.assign(WSX.comp, { sec: 'expirations', item: 'dl-abc-med', filter: 'all' });
      Object.assign(WSX.client, { id: 'c-abc', view: 'overview', service: null, stack: [], q: '', filter: 'all' });
      render({ top: true });
    },
    state: () => JSON.parse(JSON.stringify({ view: RV.view, device: RV.device, role: WSX.role, fleet: WSX.fleet, books: WSX.books, comp: WSX.comp, client: WSX.client, sheet: WSX.sheet, pending: WSX.pending, ret: WSX.ret, sims: WSX.sims.length })),
    actions: () => Object.keys(ACT),
    capture(on) {
      RV.capture = !!on;
      if (!on) return fit();
      device.style.transform = 'scale(1)';
      $('rv-sizer').style.width = device.style.width;
      $('rv-sizer').style.height = device.style.height;
    },
    demo(i, speed = 1) {
      RV.speed = speed;
      startDemo(i);
    },
    demoState: () => ({ demo: RV.demo, step: RV.step }),
  };
}
function openLightbox(f) {
  RV.lightbox = f;
  $('rv-lightbox').hidden = false;
  $('rv-lightbox').innerHTML = `<img src="diagnosis/${f}" alt=""><span class="rv-lb__x">CLOSE</span>`;
}
function closeLightbox() {
  RV.lightbox = null;
  $('rv-lightbox').hidden = true;
}
