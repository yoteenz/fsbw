/*
 * AIO OFFICE — the founder review of the complete office. The landing shows the four review groups and every
 * department in them; a department opens live inside the approved header and five-root navigation, in a device frame
 * scaled to the window. For each department the review offers SEE (MAIN · SELECTED · DEEPER · PHONE), TRY (short
 * demonstrations that press the real controls), a device switch, a founder / staff switch and, where an earlier pass
 * exists, BEFORE. Inside the device everything is live: the approved roots (drawn by studio.js, unchanged) link into
 * the workspaces, and every workspace keeps a way back.
 */
const DEVICES = {
  phone: [390, 844, 'mobile', false],
  tablet: [834, 1194, 'tablet', false],
  desktop: [1440, 900, 'desktop', false],
  wide: [2560, 1440, 'desktop', true],
};
const DEVICE_WORD = { phone: 'ON A PHONE · 390 × 844', tablet: 'ON A TABLET · 834 × 1194', desktop: 'ON A DESKTOP · 1440 × 900', wide: 'ULTRA-WIDE · 2560 × 1440' };

/* ── the approved roots: drawn exactly as approved; their links open the workspaces ── */
const ROOT_STATES = (page, deeper) => [['THE ROOT', []], ...deeper];
registerWorkspace({ id: 'r-home', no: 'H', name: 'HOME', group: 'office', page: 'home', root: true, view: () => home(), shape: 'THE APPROVED ROOT', line: 'EVERY LIST ON IT OPENS ITS WORK.', states: ROOT_STATES('home', [['NEEDS ATTENTION', [['nav', 'home/list/attention']]], ['A RECORD', [['nav', 'rec/policy/pol-dh']]], ['PHONE', [], 'phone']]) });
registerWorkspace({ id: 'r-intake', no: 'I', name: 'INTAKE', group: 'office', page: 'intake', root: true, view: () => intakeRoot(), shape: 'THE APPROVED ROOT', line: 'THE MIGRATION ENTRANCE, THEN THE CASES.', states: ROOT_STATES('intake', [['THE CASES', [['nav', 'intake/status']]], ['A CASE', [['nav', 'intake/case/mig-bl']]], ['PHONE', [], 'phone']]) });
registerWorkspace({ id: 'r-work', no: 'W', name: 'WORK', group: 'office', page: 'work', root: true, view: () => work(), shape: 'THE APPROVED ROOT', line: 'TWELVE LANES. EACH OPENS ITS WORKSPACE.', states: ROOT_STATES('work', [['A LANE', [['nav', 'work/permitting']]], ['MY WORK', [['nav', 'work/mine']]], ['PHONE', [], 'phone']]) });
registerWorkspace({ id: 'r-reports', no: 'R', name: 'REPORTS', group: 'office', page: 'reports', root: true, view: () => reports(), shape: 'THE APPROVED ROOT', line: 'TEN AREAS. EACH OPENS ITS REPORT.', states: ROOT_STATES('reports', [['AN AREA', [['nav', 'reports/clients']]], ['ANOTHER', [['nav', 'reports/compliance']]], ['PHONE', [], 'phone']]) });
registerWorkspace({ id: 'r-more', no: 'M', name: 'MORE', group: 'office', page: 'more', root: true, view: () => more(), shape: 'THE APPROVED ROOT', line: 'ELEVEN DESTINATIONS. EACH OPENS ITS PAGE.', states: ROOT_STATES('more', [['A DESTINATION', [['nav', 'more/documents_vault']]], ['ANOTHER', [['nav', 'more/team_staff']]], ['PHONE', [], 'phone']]) });

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

const RV = { view: 'overview', device: 'desktop', before: false, demo: null, step: -1, timer: null, lightbox: null, speed: 1, closing: false, closeTimer: null, opener: null, last: {} };
const $ = (id) => document.getElementById(id);
let device, screenEl, toastTimer, INITIAL;

/* ── drawing ── */
function deviceInner(wsId) {
  const w = wsById(wsId);
  studioSet({ page: w.page, role: WSX.role });
  let body;
  try {
    body = w.view();
  } catch (err) {
    console.error(err);
    body = `<div class="ws"><p class="ntb">THIS PAGE FAILED TO DRAW · ${String(err.message || err).toUpperCase()}</p></div>`;
  }
  return `<div class="ao">${header()}${nav()}${w.root ? body : `<main class="main ws-main">${body}</main>`}</div>`;
}
/** Bring the selected row into view inside its list (after a demo step or a change made elsewhere). */
function revealSelected() {
  screenEl.querySelectorAll('[data-keep] .is-sel').forEach((el) => {
    const box = el.closest('[data-keep]');
    const top = el.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTo({ top: Math.max(0, top - 40), behavior: MOTION.reduced() ? 'auto' : 'smooth' });
  });
}

function render({ top = false, reveal = false } = {}) {
  // a newer draw supersedes a drawer that is still leaving
  clearTimeout(RV.closeTimer);
  RV.closing = false;
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
    RV.last[wsById(RV.view).group] = RV.view;
    device.dataset.vp = vp;
    device.dataset.wide = wide ? '1' : '0';
    device.dataset.device = RV.device;
    device.style.width = `${w}px`;
    device.style.height = `${h}px`;
    device.style.setProperty('--dw', `${w}px`);
    device.style.setProperty('--dh', `${h}px`);
    device.style.setProperty('--pad-x', wide ? '24px' : '16px');
    for (const key of Object.keys(SIM)) delete SIM[key];
    const html = deviceInner(RV.view);
    const oldSheet = screenEl.querySelector('.wsheet:not(.is-out)');
    const wasOpen = !!oldSheet;
    const wasShown = !!screenEl.querySelector('.wsheet'); // open, or still leaving
    const draw = () => {
      if (top || !screenEl.firstChild) replaceInto(screenEl, html);
      else morphInto(screenEl, html);
      placeThumbs(screenEl, !top);
      settleSheet(screenEl, wasOpen, RV.opener, wasShown);
      if (top) screenEl.scrollTop = 0;
      if (reveal) revealSelected();
    };
    // a closing drawer leaves before the workspace behind it changes
    if (oldSheet && !/class="wsheet[ "]/.test(html) && !top && !MOTION.reduced()) {
      RV.closing = true;
      oldSheet.classList.add('is-out');
      screenEl.querySelector('.wscrim')?.classList.add('is-out');
      RV.closeTimer = setTimeout(() => {
        RV.closing = false;
        draw();
      }, MOTION.sheetOut);
    } else draw();
    $('rv-before').hidden = !RV.before;
    $('rv-stagewrap').hidden = RV.before;
    if (RV.before) drawBefore();
    flash();
  }
  drawChrome();
  if (!landing) fit();
}

function drawChrome() {
  const w = wsById(RV.view);
  const g = w ? w.group : null;
  $('rv-tabs').innerHTML = [`<button type="button" class="rv-tab" data-rv-tab="overview" aria-current="${RV.view === 'overview'}">OVERVIEW</button>`, ...WS_GROUPS.map((x) => `<button type="button" class="rv-tab" data-rv-group="${x.id}" aria-current="${g === x.id}"><i>${x.no}</i>${x.name}</button>`)].join('');
  $('rv-depts').innerHTML = g ? groupWs(g).map((x) => `<button type="button" class="rv-dept ${x.root ? 'rv-dept--root' : ''}" data-rv-tab="${x.id}" aria-current="${x.id === RV.view}"><i>${x.no}</i>${x.name}</button>`).join('') : '';
  $('rv-depts').hidden = !g;
  document.querySelectorAll('[data-rv-device]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rvDevice === RV.device)));
  document.querySelectorAll('[data-rv-role]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.rvRole === WSX.role)));
  $('rv-line').innerHTML = w ? `<b>${w.shape}</b><span>${w.line}</span>` : '';
  const see = w?.states?.length ? `<span class="rv-k">SEE</span>${w.states.map(([label], i) => `<button type="button" class="rv-see" data-rv-see="${i}" aria-pressed="${RV.see === `${w.id}:${i}`}">${label}</button>`).join('')}` : '';
  const demos = w?.demos ?? [];
  const tryRow = demos.length ? `<span class="rv-k">TRY</span>${demos.map(([label], i) => `<button type="button" class="rv-demo" data-rv-demo="${i}" aria-pressed="${RV.demo === i}">${ico('run')}${label}</button>`).join('')}` : '';
  $('rv-try').innerHTML = `${see ? `<span class="rv-try__g">${see}</span>` : ''}${tryRow ? `<span class="rv-try__g">${tryRow}</span>` : ''}`;
  $('rv-beforebtn').setAttribute('aria-pressed', String(RV.before));
  $('rv-beforebtn').hidden = !(w && w.pass);
  $('rv-sims').textContent = WSX.sims.length ? `${WSX.sims.length} SIMULATED · NOTHING SAVED` : '';
  // the counter and RESET keep their place when empty, so a simulated action never shifts the device below
  $('rv-reset').disabled = !WSX.sims.length;
  $('rv-reset').style.visibility = WSX.sims.length ? '' : 'hidden';
}

/* ── earlier passes: the boards made by polish-boards.mjs and the recordings made by record.mjs ── */
const PASS_BOARDS = [
  ['polish-1-fleet.jpg', 'FLEET · THE LOWER TILES'],
  ['polish-2-client.jpg', 'CLIENT 360 · LOWER PANELS AND NESTED DETAIL'],
  ['polish-3-books.jpg', 'BOOKKEEPING · DETAIL STATES'],
  ['polish-4-comp.jpg', 'COMPLIANCE · CALENDAR AND TABS'],
  ['polish-5-drawers.jpg', 'MOBILE DRAWERS'],
  ['polish-6-text.jpg', 'TEXT FIT · AUDITED'],
  ['polish-7-motion.jpg', 'MOTION · FRAME BY FRAME'],
];
const CLIPS = [
  ['01', 'FLEET · SELECT A TRUCK', 'DESKTOP'],
  ['02', 'FLEET · CONNECTION DETAIL', 'DESKTOP'],
  ['03', 'CLIENT 360 · SELECT A SERVICE', 'DESKTOP'],
  ['04', 'CLIENT 360 · DRILL IN AND BACK', 'DESKTOP'],
  ['05', 'BOOKKEEPING · STEP TO STEP', 'DESKTOP'],
  ['06', 'BOOKKEEPING · DETAIL DRAWER', 'PHONE'],
  ['07', 'COMPLIANCE · SELECT A DEADLINE', 'DESKTOP'],
  ['08', 'COMPLIANCE · ISSUE DETAIL', 'DESKTOP'],
  ['09', 'CONFIRM A SIMULATED ACTION', 'DESKTOP'],
  ['10', 'PHONE DRAWER · OPEN AND CLOSE', 'PHONE'],
  ['11', 'PHONE TABS', 'PHONE'],
  ['12', 'REDUCED MOTION', 'PHONE'],
];
/** Thumbnails made from the last QA run (thumbs/<id>--<device>.jpg); the build lists the ones that exist. */
const THUMB_SET = new Set(typeof THUMBS === 'undefined' ? [] : THUMBS);
const thumbOf = (id) => {
  const d = RV.device === 'phone' ? 'phone' : 'desktop';
  const f = `${id}--${d}.jpg`;
  return THUMB_SET.has(f) ? `thumbs/${f}` : null;
};

/* ── landing: the four groups, every department in them, then the earlier passes ── */
function drawLanding() {
  const card = (w) => {
    const t = thumbOf(w.id);
    return `<div class="rv-card ${w.root ? 'rv-card--root' : ''}" role="button" tabindex="0" data-rv-tab="${w.id}" aria-label="Open ${w.name}">
      <span class="rv-shot ${t ? '' : 'rv-shot--none'}">${t ? `<img src="${t}" alt="" loading="lazy">` : `<b>${w.name}</b>`}</span>
      <span class="rv-card__cap"><span class="rv-card__no">${w.no}</span><span class="rv-card__t">${w.name}</span><span class="rv-card__shape">${w.root ? 'APPROVED ROOT' : w.shape}</span><span class="rv-card__go">${ico('fwd')}</span></span>
    </div>`;
  };
  const diag = [
    ['diagnosis-1-one-template.jpg', 'ONE TEMPLATE FOR EVERYTHING'],
    ['diagnosis-2-fleet.jpg', 'THE TRUCK WAS A TABLE'],
    ['diagnosis-3-bookkeeping.jpg', 'THE MONTH WAS A LIST'],
    ['diagnosis-4-compliance.jpg', 'DEADLINES WITHOUT TIME'],
    ['diagnosis-5-client.jpg', 'THE CLIENT WAS A FORM'],
  ];
  const earlier = WS_REG.filter((w) => w.diag);
  $('rv-landing').innerHTML = `
    <section class="rv-hero"><p class="rv-eyebrow">THE COMPLETE AIO OFFICE · ${WS_REG.filter((w) => !w.hidden).length} DESTINATIONS IN FOUR GROUPS · SHOWN ${DEVICE_WORD[RV.device]}</p><h2>ONE OFFICE. EVERY DEPARTMENT SHAPED LIKE ITS WORK.</h2></section>
    ${WS_GROUPS.map((g) => `<section class="rv-group-sec"><header><i>${g.no}</i><h3>${g.name}</h3><span>${g.line}</span></header><div class="rv-cards rv-cards--${RV.device}">${groupWs(g.id).map(card).join('')}</div></section>`).join('')}
    <details class="rv-earlier"><summary>EARLIER PASSES · THE FOUR APPROVED WORKSPACES</summary>
    <section class="rv-sec"><header><h3>MATERIAL, MOTION AND DETAIL</h3><span>THE PASS BEFORE THIS ONE · OPEN ANY BOARD</span></header>
      <div class="rv-diag rv-diag--pass">${PASS_BOARDS.map(([f, l]) => `<button type="button" class="rv-thumb" data-rv-lightbox="${f}"><img src="diagnosis/${f}" alt="" loading="lazy"><span>${l}</span></button>`).join('')}</div></section>
    <section class="rv-sec"><header><h3>MOTION · TWELVE INTERACTIONS</h3><span>RECORDED WITH REAL CLICKS</span></header>
      <div class="rv-clips">${CLIPS.map(([id, t, dev]) => `<button type="button" class="rv-clip" data-rv-clip="${id}"><img src="motion/${id}-poster.jpg" alt="" loading="lazy"><span class="rv-clip__c"><i>${id}</i><b>${t}</b><small>${dev}</small></span><span class="rv-clip__p" aria-hidden="true">${ico('run')}</span></button>`).join('')}</div></section>
    <section class="rv-sec"><header><h3>SINCE BATCH 1 · BEFORE → AFTER</h3><span>THE SAME SAMPLE RECORDS</span></header>
      <div class="rv-diag rv-diag--4">${earlier.map((w) => `<button type="button" class="rv-thumb" data-rv-lightbox="${w.diag}"><img src="diagnosis/${w.diag}" alt="" loading="lazy"><span>${w.name}</span></button>`).join('')}</div></section>
    <section class="rv-sec"><header><h3>THE RULES</h3><span>TWELVE, FOR EVERY WORKSPACE</span></header>
      <ol class="rv-rules">${RULES.map(([t, s], i) => `<li><i>${String(i + 1).padStart(2, '0')}</i><b>${t}</b><span>${s}</span></li>`).join('')}</ol></section>
    <section class="rv-sec"><header><h3>WHAT WAS WRONG</h3><span>THE BATCH 1 DIAGNOSIS</span></header>
      <div class="rv-diag">${diag.map(([f, l]) => `<button type="button" class="rv-thumb" data-rv-lightbox="${f}"><img src="diagnosis/${f}" alt="" loading="lazy"><span>${l}</span></button>`).join('')}</div></section>
    </details>`;
}
function drawBefore() {
  const w = wsById(RV.view);
  $('rv-before').innerHTML = `<figure class="rv-beforefig"><figcaption><b>THE LAST PASS · BEFORE → AFTER</b><span>THE PASS BEFORE BESIDE THE APPROVED ONE</span><button type="button" class="rv-btn rv-btn--on" data-rv-before="0">SEE THE ${w.name}</button></figcaption><img src="diagnosis/${w.pass}" alt="${w.name}: the last pass beside this one"></figure>
    <figure class="rv-beforefig"><figcaption><b>SINCE BATCH 1</b><span>THE SAME SAMPLE RECORDS</span></figcaption><img src="diagnosis/${w.diag}" alt="Batch 1 ${w.name} beside the workspace" loading="lazy"></figure>`;
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
  t.innerHTML = `${ico('pass')}<span>${text}</span>`;
  t.hidden = false;
  t.classList.remove('is-out');
  void t.offsetWidth;
  t.classList.add('is-in');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('is-in');
    t.classList.add('is-out');
    toastTimer = setTimeout(() => (t.hidden = true), MOTION.reduced() ? 0 : 180);
  }, 2600);
}
function flash() {
  if (!WSX.flash) return;
  toast(WSX.flash);
  WSX.flash = null;
}

/* ── one action → state → redraw ── */
/** Open a route from an approved root (or anywhere a data-go link is drawn). The workspace it opens keeps a way back. */
ACT['nav'] = (route) => {
  const from = RV.view;
  const id = routeWs(route);
  if (!id) return void (WSX.flash = `${String(route).split(/[~@]/)[0].toUpperCase().replace(/\//g, ' › ')} · NOT IN THIS REVIEW`);
  WSX.sheet = false;
  WSX.pending = null;
  if (wsById(id).root) WSX.ret = null;
  else if (from !== id && from !== 'overview') WSX.ret = { ws: from, label: wsById(from)?.root ? wsById(from).name : retLabel() };
  WSX.ws = id;
};
function run(a, v, { reveal = false } = {}) {
  const fn = ACT[a];
  if (!fn) {
    console.error(`no handler for ${a}`);
    return false;
  }
  const was = RV.view;
  fn(v);
  if (WSX.ws !== RV.view) RV.view = WSX.ws; // a jump to another workspace or page
  render({ reveal, top: RV.view !== was });
  return true;
}
function onTap(e) {
  if (RV.demo != null && e.isTrusted) stopDemo();
  const el = e.target.closest('[data-a], [data-k], [data-act], [data-go], .head__chev');
  if (!el || !screenEl.contains(el) || RV.closing || WSX.loading) return;
  if (el.dataset.a) {
    if (el.matches('input')) return;
    e.preventDefault();
    if (!screenEl.querySelector('.wsheet')) RV.opener = `${el.dataset.a}|${el.dataset.v ?? ''}`;
    if (el.dataset.a === 'sim.ok' && !MOTION.reduced()) return confirmSim(el.dataset.v);
    return run(el.dataset.a, el.dataset.v ?? '');
  }
  if (el.dataset.go) {
    e.preventDefault();
    return run('nav', el.dataset.go);
  }
  shellTap(el);
}
/** A simulated confirmation works briefly (the button shows it), then applies — never long enough to get in the way. */
function confirmSim(key) {
  WSX.loading = key;
  render();
  setTimeout(() => {
    WSX.loading = null;
    run('sim.ok', key);
  }, MOTION.confirm * RV.speed);
}
/** The approved header and navigation are live: the five roots open as approved. */
function shellTap(el) {
  const k = el.dataset.k;
  if (k) return run('nav', k);
  const act = el.dataset.act;
  if (act === 'search') {
    const f = screenEl.querySelector('.ws-main input[data-input]');
    if (f) return f.focus();
    return toast('SEARCH · CLIENTS, WORK AND HELP · OUTSIDE THIS REVIEW');
  }
  if (act === 'notifications') return toast('NOTIFICATIONS · OUTSIDE THIS REVIEW');
  if (act === 'quick') return run('nav', 'home/quick');
  return toast(`SIGNED IN AS ${WSX.role === 'founder' ? 'FOUNDER' : 'STAFF'} · SWITCH WITH VIEW AS ABOVE`);
}
function onInput(e) {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  ACT[el.dataset.input]?.(el.value);
  render(); // the morph keeps this very input, its value and its caret
}

/* ── SEE: a department's main, selected, deeper and phone states ── */
function resetState() {
  const snap = JSON.parse(INITIAL);
  for (const [k, v] of Object.entries(snap)) WSX[k] = v;
  WSX.over = {};
  WSX.hist = {};
  WSX.sims = [];
  WSX.pending = null;
  WSX.sheet = false;
  WSX.ret = null;
  WSX.loading = null;
}
/** Open a workspace in a known state: reset, the device, then each action (phone actions where the phone differs). */
function applyState(wsId, acts = [], dev) {
  stopDemo();
  resetState();
  RV.before = false;
  if (dev) RV.device = dev;
  RV.view = wsId;
  WSX.ws = wsId;
  render({ top: true });
  for (const [a, v] of acts) {
    const w = wsById(RV.view);
    const act = VP === 'mobile' && w?.phoneAct?.[a] ? w.phoneAct[a] : a;
    run(act, v ?? '', { reveal: true });
  }
}
function see(i) {
  const w = wsById(RV.view);
  const [, acts, dev] = w.states[i];
  const home = w.id;
  applyState(home, acts, dev || (RV.device === 'phone' ? 'desktop' : RV.device));
  RV.see = `${home}:${i}`;
  RV.view = WSX.ws;
  drawChrome();
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
  RV.see = null;
  WSX.sheet = false;
  WSX.pending = null;
  RV.demo = i;
  RV.demoWs = RV.view;
  render();
  nextStep();
}
function findControl(a, v) {
  const sel = v ? `[data-a="${a}"][data-v="${CSS.escape(v)}"]` : `[data-a="${a}"]`;
  return [...screenEl.querySelectorAll(sel)].find((el) => el.getClientRects().length && !el.closest('[inert]'));
}
function nextStep() {
  const host = wsById(RV.demoWs);
  const list = host?.demos?.[RV.demo]?.[1];
  if (!list) return stopDemo();
  RV.step += 1;
  if (RV.step >= list.length) {
    RV.timer = setTimeout(stopDemo, 1800 * RV.speed);
    return;
  }
  const here = wsById(RV.view);
  let [a, v, say] = list[RV.step];
  const raw = a;
  if (VP === 'mobile' && here?.phoneAct?.[a]) a = here.phoneAct[a];
  if (VP === 'mobile' && a === 'cl.client' && WSX.client.id !== v) WSX.sheet = 'dir', render();
  const cap = $('rv-cap');
  cap.hidden = false;
  cap.innerHTML = `<i>${RV.step + 1}/${list.length}</i>${say}`;
  const el = findControl(a, v) || (a !== raw ? findControl(raw, v) : null);
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
function openDept(id) {
  stopDemo();
  RV.view = id;
  RV.before = false;
  RV.see = null;
  WSX.sheet = false;
  WSX.pending = null;
  WSX.ret = null;
  render({ top: true });
  window.scrollTo(0, 0);
}
function boot() {
  device = $('rv-device');
  screenEl = $('rv-screen');
  // every lane has declared its starting state by now; RESET and SEE return to it
  INITIAL = JSON.stringify(Object.fromEntries(Object.entries(WSX).filter(([k, v]) => v && typeof v === 'object' && !Array.isArray(v) && !['over', 'hist', 'ret', 'pending'].includes(k))));
  screenEl.addEventListener('click', onTap);
  screenEl.addEventListener('input', onInput);
  screenEl.addEventListener('keydown', (e) => {
    trapTab(e, screenEl);
    const t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.matches?.('[role="button"]') && !t.matches('button')) {
      e.preventDefault();
      t.click();
    }
  });
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
    const b = e.target.closest('button, [data-rv-tab], [data-rv-group]');
    if (!b || screenEl.contains(b)) return;
    const d = b.dataset;
    if (d.rvTab) {
      if (d.rvTab === 'overview') {
        stopDemo();
        RV.view = 'overview';
        render({ top: true });
        window.scrollTo(0, 0);
      } else openDept(d.rvTab);
    } else if (d.rvGroup) {
      openDept(RV.last[d.rvGroup] ?? groupWs(d.rvGroup)[0].id);
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
    } else if (d.rvSee != null) {
      see(Number(d.rvSee));
    } else if (d.rvDemo != null) {
      startDemo(Number(d.rvDemo));
    } else if (d.rvBefore != null) {
      stopDemo();
      RV.before = d.rvBefore === 'toggle' ? !RV.before : d.rvBefore === '1';
      render();
    } else if (d.rvLightbox) {
      openLightbox(d.rvLightbox);
    } else if (d.rvClip) {
      openClip(d.rvClip);
    } else if (d.rvMotion != null) {
      // the review's own switch for reduced motion (the system setting is honoured either way)
      const on = document.documentElement.dataset.motion !== 'reduce';
      if (on) document.documentElement.dataset.motion = 'reduce';
      else delete document.documentElement.dataset.motion;
      b.setAttribute('aria-pressed', String(on));
    } else if (b.id === 'rv-reset') {
      WSX.over = {};
      WSX.hist = {};
      WSX.sims = [];
      WSX.pending = null;
      render();
    }
  });
  $('rv-lightbox').addEventListener('click', (e) => {
    if (!e.target.closest('video')) closeLightbox();
  });
  window.addEventListener('resize', () => RV.view !== 'overview' && fit());
  const q = new URLSearchParams(location.search);
  const hash = decodeURIComponent(location.hash.slice(1));
  if (wsById(hash) || hash === 'overview') RV.view = hash;
  if (DEVICES[q.get('device')]) RV.device = q.get('device');
  else RV.device = window.innerWidth < 760 ? 'phone' : window.innerWidth < 1100 ? 'tablet' : 'desktop';
  if (['founder', 'staff'].includes(q.get('role'))) WSX.role = q.get('role');
  render({ top: true });
  document.documentElement.dataset.ready = '1';
  /* QA hook (qa.mjs, audit.mjs and the capture tools drive the review through it; the review itself never calls it) */
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
    /** A workspace in a known state on a device, as SEE draws it (phone actions applied on the phone). */
    go(wsId, acts, devName) {
      applyState(wsId, acts || [], devName || RV.device);
    },
    set(path, value) {
      const parts = path.split('.');
      let o = WSX;
      while (parts.length > 1) o = o[parts.shift()];
      o[parts[0]] = value;
      render({ reveal: true });
    },
    reset() {
      resetState();
      render({ top: true });
    },
    state: () => JSON.parse(JSON.stringify({ ...WSX, view: RV.view, device: RV.device, role: WSX.role, sims: WSX.sims.length, over: undefined, hist: undefined })),
    actions: () => Object.keys(ACT),
    registry: () => WS_REG.map((w) => ({ id: w.id, no: w.no, name: w.name, group: w.group, page: w.page, lane: w.lane ?? null, root: !!w.root, hidden: !!w.hidden, shape: w.shape, states: w.states.map(([l, acts, dev]) => [l, acts, dev ?? null]), demos: w.demos.map(([l]) => l), audit: w.audit })),
    /** Every state the text audit visits: each workspace's SEE states and its declared audit states. */
    auditStates: () => WS_REG.flatMap((w) => [...w.states.filter(([, , dev]) => !dev).map(([, acts]) => [w.id, acts]), ...w.audit.map((acts) => [w.id, acts])]),
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
  $('rv-lightbox').dataset.kind = 'board';
  $('rv-lightbox').innerHTML = `<img src="diagnosis/${f}" alt=""><span class="rv-lb__x">CLOSE</span>`;
  $('rv-lightbox').scrollTop = 0;
}
/** A recorded interaction: the last pass beside this one, both playing. */
function openClip(id) {
  const [, t, dev] = CLIPS.find(([x]) => x === id);
  RV.lightbox = id;
  $('rv-lightbox').hidden = false;
  $('rv-lightbox').dataset.kind = dev === 'PHONE' ? 'clip-phone' : 'clip';
  const v = (label) => `<figure><figcaption>${label === 'before' ? 'BEFORE · LAST PASS' : 'AFTER · THIS PASS'}</figcaption><video autoplay muted loop playsinline controls preload="auto"><source src="motion/${id}-${label}.webm" type="video/webm"><source src="motion/${id}-${label}.mp4" type="video/mp4"></video></figure>`;
  $('rv-lightbox').innerHTML = `<div class="rv-lb__clip"><p><i>${id}</i><b>${t}</b><span>${dev} · REAL CLICKS IN CHROMIUM · NOTHING SAVED</span></p><div class="rv-lb__v">${v('before')}${v('after')}</div></div><span class="rv-lb__x">CLOSE</span>`;
  $('rv-lightbox').scrollTop = 0;
}
function closeLightbox() {
  RV.lightbox = null;
  $('rv-lightbox').hidden = true;
  $('rv-lightbox').innerHTML = ''; // stops the clips
}
