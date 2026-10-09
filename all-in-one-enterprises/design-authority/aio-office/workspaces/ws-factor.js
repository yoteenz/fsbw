/*
 * LANE 08 — FACTORING. Invoice- and payment-status centred: the invoice ledger (T&K's freight invoices, and the loads
 * not invoiced yet) · the selected invoice drawn as its packet on an obsidian stage — the invoice, its three papers and
 * the path DOCUMENTS NEEDED → READY TO SUBMIT → SUBMITTED → FUNDED · the packet panel with the one next step.
 * FACTORING (PARTNER) is a partner referral, not direct funding: the provider is the client's own, and provider-side
 * figures (advance rate, fees, reserve) and bank details never show in the office.
 */
WSX.fa = { sub: 'fs-2210', part: 'packet', filter: 'all' };

/* ── SAMPLE: two more T&K submissions so every station of the path has an invoice. Their loads fill the gaps in the
 *    T&K load sheet (UNIT 07 between LOAD 5518 and LOAD 5520; UNIT 09 the day before it was placed out of service).
 *    No amounts are invented: these two show none. ── */
const FA_LOADS = {
  'ld-5519': { id: 'ld-5519', client: 'c-tk', ref: 'LOAD 5519', lane: 'CHARLOTTE, NC → ATLANTA, GA', status: ['COMPLETE', 'ok'], pickup: 'OCT 5', delivery: 'OCT 6', vehicle: 'v-tk-07', driver: 'd-tk-1', owner: 's-dev', sample: true },
  'ld-5516': { id: 'ld-5516', client: 'c-tk', ref: 'LOAD 5516', lane: 'ATLANTA, GA → MACON, GA', status: ['COMPLETE', 'ok'], pickup: 'OCT 5', delivery: 'OCT 5', vehicle: 'v-tk-09', driver: null, owner: 's-dev', sample: true },
};
const FA_SUBS = {
  'fs-2212': { id: 'fs-2212', client: 'c-tk', ref: 'SUBMISSION 2212', invoice: 'FREIGHT INVOICE 5519', status: ['READY TO SUBMIT', 'gold'], provider: 'T&K’S EXISTING PROVIDER', load: 'ld-5519', blocker: null, sample: true },
  'fs-2211': { id: 'fs-2211', client: 'c-tk', ref: 'SUBMISSION 2211', invoice: 'FREIGHT INVOICE 5516', status: ['SUBMITTED', 'gold'], provider: 'T&K’S EXISTING PROVIDER', load: 'ld-5516', blocker: null, sample: true },
};
/** The packet: each paper's state, when, and where it comes from; the path dates; the history. SAMPLE. */
const FA_META = {
  'fs-2210': {
    docs: { rc: ['RECEIVED', 'OCT 2', 'AIO DISPATCH'], bol: ['UNDER REVIEW', '3 HRS AGO', 'CLIENT UPLOAD', 'doc-tk-2'], pod: ['MISSING', 'DUE OCT 4', 'DRIVER AT DELIVERY'] },
    dates: ['OCT 5', null, null, null],
    hist: [['3 HRS AGO', 'BILL OF LADING UPLOADED'], ['OCT 5', 'PACKET OPENED · POD NOT RECEIVED'], ['OCT 4', 'LOAD 5518 DELIVERED']],
  },
  'fs-2212': {
    docs: { rc: ['RECEIVED', 'OCT 4', 'AIO DISPATCH'], bol: ['RECEIVED', 'OCT 5', 'CLIENT UPLOAD'], pod: ['RECEIVED', 'OCT 6', 'DRIVER AT DELIVERY'] },
    dates: ['OCT 6', 'TODAY', null, null],
    hist: [['TODAY', 'PACKET COMPLETE · READY TO SUBMIT'], ['OCT 6', 'LOAD 5519 DELIVERED']],
  },
  'fs-2211': {
    docs: { rc: ['RECEIVED', 'OCT 4', 'AIO DISPATCH'], bol: ['RECEIVED', 'OCT 5', 'CLIENT UPLOAD'], pod: ['RECEIVED', 'OCT 5', 'DRIVER AT DELIVERY'] },
    dates: ['OCT 5', 'OCT 6', 'OCT 7', null],
    hist: [['OCT 7', 'SENT TO T&K’S PROVIDER'], ['OCT 6', 'PACKET COMPLETE'], ['OCT 5', 'LOAD 5516 DELIVERED']],
  },
  'fs-2207': {
    docs: { rc: ['RECEIVED', 'SEP 29', 'AIO DISPATCH'], bol: ['RECEIVED', 'SEP 30', 'CLIENT UPLOAD'], pod: ['RECEIVED', 'OCT 1', 'DRIVER AT DELIVERY'] },
    dates: ['OCT 1', 'OCT 2', 'OCT 2', 'OCT 3'],
    hist: [['OCT 3', 'FUNDED · REPORTED BY THE PROVIDER'], ['OCT 2', 'SENT TO T&K’S PROVIDER'], ['OCT 1', 'LOAD 5501 DELIVERED']],
  },
};
const FA_PATH = [['docs', 'DOCUMENTS NEEDED', 'PAPERS FROM T&K'], ['ready', 'READY TO SUBMIT', 'AIO CHECKS'], ['sub', 'SUBMITTED', 'AT THE PROVIDER'], ['funded', 'FUNDED', 'PROVIDER PAYS T&K']];
const FA_PAPERS = [['rc', 'RATE CONFIRMATION', 'RATE CON'], ['bol', 'BILL OF LADING', 'BOL'], ['pod', 'PROOF OF DELIVERY', 'POD']];
const FA_DOC_TONE = { RECEIVED: 'ok', 'UNDER REVIEW': 'gold', MISSING: 'bad', REQUESTED: 'warn' };
const FA_HIDDEN = ['ADVANCE RATE', 'FACTORING FEE', 'RESERVE', 'PAYMENT ACCOUNT'];

const faAll = () => [...vals(SUBMISSIONS), ...vals(FA_SUBS)].filter((s) => s.client === 'c-tk');
const faStatus = (s) => ov(`submission:${s.id}`, s.status);
const faStep = (s) => Math.max(0, FA_PATH.findIndex(([, w]) => w === faStatus(s)[0]));
const faKey = (s) => FA_PATH[faStep(s)][0];
const faSub = (id = WSX.fa.sub) => SUBMISSIONS[id] || FA_SUBS[id];
const faLoad = (s) => LOADS[s.load] || FA_LOADS[s.load];
const faInv = (s) => {
  const [title, amt] = s.invoice.split(' · ');
  return { title, no: title.replace('FREIGHT INVOICE ', ''), amt: amt || null };
};
const faDoc = (s, k) => {
  const [w, when, from, doc] = FA_META[s.id].docs[k];
  const now = ov(`fadoc:${s.id}:${k}`, w);
  return { w: now, tone: FA_DOC_TONE[now] || 'mute', when: now === w ? when : 'JUST NOW', from, doc };
};
const faIn = (s) => FA_PAPERS.filter(([k]) => faDoc(s, k).w === 'RECEIVED' || faDoc(s, k).w === 'UNDER REVIEW').length;
function faList() {
  const f = WSX.fa.filter;
  return faAll().filter((s) => f === 'all' || faKey(s) === f).sort((a, b) => faStep(a) - faStep(b) || b.id.localeCompare(a.id));
}
/** A load opens in Dispatch when that workspace is in the office; otherwise in T&K's dispatch service in Client 360. */
function faLoadGo(l) {
  if (!l.sample && typeof wsById === 'function' && wsById('dispatch')) return [`dispatch:${l.id}`, 'OPEN IN DISPATCH'];
  return [`client:${l.client}:dispatch`, 'DISPATCH IN CLIENT 360'];
}
const faShort = (lane) => lane.replace(/, [A-Z]{2}/g, '');

/* ── the ledger rail ── */
function faRow(s, compact = false) {
  const inv = faInv(s);
  const l = faLoad(s);
  const st = faStatus(s);
  const step = faStep(s);
  const sel = s.id === WSX.fa.sub;
  const bar = `<span class="fa-mini">${FA_PATH.map((_, i) => `<i class="${i < step || (i === step && step === 3) ? 'd' : i === step ? 'n' : ''}"></i>`).join('')}</span>`;
  return `<div class="pk fa-row ${sel ? 'is-sel' : ''}" data-a="fa.sub" data-v="${s.id}" aria-pressed="${sel}" title="${inv.title} · ${l.lane} · ${st[0]}">
    <span class="fa-row__no">${inv.no}</span>
    <b class="pk__t fa-row__t">${faShort(l.lane)}</b><b class="fa-amt ${inv.amt ? '' : 'fa-amt--none'}">${inv.amt ?? '—'}</b>
    <span class="fa-row__s"><span class="pk__s">${l.ref} · DELIVERED ${l.delivery}</span><span class="fa-row__d" aria-hidden="true">${FA_PAPERS.map(([k, , short]) => `<i class="fa-row__d--${faDoc(s, k).tone}" title="${short} · ${faDoc(s, k).w}"></i>`).join('')}</span></span>
    <span class="fa-row__p">${compact ? '' : bar}${sw(st)}</span>
  </div>`;
}
function faPending() {
  // the T&K loads that are not invoiced yet: moving, booked, or stopped by an issue
  return vals(LOADS).filter((l) => l.client === 'c-tk' && !faAll().some((s) => s.load === l.id) && l.status[0] !== 'COMPLETE');
}
function faLedger(wide = false) {
  const list = faList();
  const rows = list.map((s) => faRow(s)).join('') || '<div class="grp">NO INVOICES IN THIS VIEW</div>';
  const pend = faPending();
  const pendRows = pend.map((l) => {
    const st = ov(`load:${l.id}`, l.status);
    const [go] = faLoadGo(l);
    return `<div class="pk fa-pend" data-a="go" data-v="${go}" title="${l.ref} · ${l.lane} · ${st[0]}"><span class="fa-pend__i">${ico('pin')}</span><span class="fa-pend__t"><b class="pk__t">${l.ref}</b><span class="pk__s">${faShort(l.lane)}</span></span><span class="fa-pend__r">${sw(st)}<small>${st[0] === 'ISSUE' ? 'NO INVOICE' : `DELIVERS ${l.delivery}`}</small></span></div>`;
  }).join('');
  const body = `${rows}<div class="grp"><span>NOT INVOICED YET</span><span>${pend.length}</span></div>${pendRows}<div class="fa-prov">${ico('link')}<span><b>T&K’S EXISTING PROVIDER</b><small>PARTNER REFERRAL — NOT DIRECT FUNDING</small></span></div>`;
  return rgn('T&K TRANSPORT · INVOICES', `${list.length} OF ${faAll().length}`, '', body, 'fa-ledger', 'fa-ledger');
}

/* ── the stage: the invoice and its packet ── */
function faPathRail(s, compact = false) {
  const step = faStep(s);
  const dates = FA_META[s.id].dates;
  const sim = WSX.over[`submission:${s.id}`];
  return `<ol class="fa-path ${compact ? 'fa-path--c' : ''}">${FA_PATH.map(([k, label, who], i) => {
    const state = i < step || (i === step && i === 3) ? 'done' : i === step ? 'now' : 'later';
    const when = state === 'later' ? '—' : sim && i === step && i !== 0 ? 'JUST NOW' : dates[i] ?? (state === 'now' ? 'NOW' : '—');
    return `<li class="fa-st fa-st--${state}"><i>${state === 'done' ? ico('pass') : i + 1}</i><b>${label}</b><em>${who}</em><small>${state === 'now' && i < 3 ? `NOW · ${when}` : when}</small></li>`;
  }).join('')}</ol>`;
}
function faSheet(s, k, label, short, act) {
  const d = faDoc(s, k);
  const on = WSX.fa.part === k;
  return `<button type="button" class="fa-sheet fa-sheet--${d.tone} ${on ? 'is-on' : ''}" data-a="${act}" data-v="${k}" aria-pressed="${on}" aria-label="${label} · ${d.w}" title="${label} · ${d.w}">
    <span class="fa-sheet__h"><small>${short}</small><b>${label}</b></span>
    <span class="fa-sheet__lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    <span class="fa-sheet__x"><span><small>FROM</small><b>${d.from}</b></span><span><small>FOR</small><b>${faLoad(s).ref}</b></span></span>
    <em class="fa-stamp">${d.w}</em>
    <span class="fa-sheet__f">${d.when}</span>
  </button>`;
}
function faInvoiceSheet(s, act, compact = false) {
  const inv = faInv(s);
  const l = faLoad(s);
  const on = WSX.fa.part === 'packet';
  return `<button type="button" class="fa-sheet fa-sheet--inv ${on ? 'is-on' : ''}" data-a="${act}" data-v="packet" aria-pressed="${on}" aria-label="${inv.title} · THE PACKET" title="${inv.title}">
    <span class="fa-sheet__h"><small>${compact ? 'INVOICE' : 'FREIGHT INVOICE'}</small><b>${inv.no}</b></span>
    <span class="fa-inv__rows"><span><small>FROM</small><b>T&K TRANSPORT</b></span><span><small>FOR</small><b>${l.ref}</b></span><span class="fa-inv__wide"><small>LANE</small><b>${faShort(l.lane)}</b></span><span class="fa-inv__wide"><small>DELIVERED</small><b>${l.delivery}</b></span><span><small>AMOUNT</small><b>${inv.amt ?? '—'}</b></span><span><small>REMIT TO</small><i class="fa-redact"></i></span></span>
  </button>`;
}
function faStage(s, { act = 'fa.part', compact = false } = {}) {
  const inv = faInv(s);
  const st = faStatus(s);
  const c = ACCOUNTS[s.client];
  const sheets = `${faInvoiceSheet(s, act, compact)}${FA_PAPERS.map(([k, label, short]) => faSheet(s, k, label, short, act)).join('')}`;
  return `<section class="fa-stage ${compact ? 'fa-stage--c' : ''}">
    <div class="fa-stage__id" data-swap="fa-id:${s.id}">
      <div class="fa-stage__inv"><small>${s.ref}${compact ? '' : ` · ${c.name}`}</small><b>${inv.no}</b><span>FREIGHT INVOICE</span></div>
      <div class="fa-stage__st"><span class="fa-big fa-big--${st[1]}">${st[0]}</span>${compact ? '' : `<button type="button" class="fa-client" data-a="go" data-v="client:${c.id}:factoring">${badge(c)}<span>${c.name}</span>${ico('fwd')}</button>`}</div>
      <div class="fa-stage__amt"><small>INVOICE AMOUNT</small><b class="${inv.amt ? '' : 'is-none'}">${inv.amt ?? '—'}</b><span>${inv.amt ? 'SAMPLE AMOUNT' : 'NOT IN THE SAMPLE'}</span></div>
    </div>
    <div class="fa-stage__path" data-swap="fa-path:${s.id}:${faStep(s)}">${faPathRail(s, compact)}</div>
    <div class="fa-packet">${compact ? '' : `<div class="fa-packet__l"><span>THE PACKET</span><span>${faIn(s)} OF 3 PAPERS IN</span></div>`}<div class="fa-sheets" data-swap="fa-sheets:${s.id}">${sheets}</div></div>
  </section>`;
}

/* ── ultra-wide: every T&K invoice on the path at once ── */
function faBoard() {
  const all = faAll();
  const cols = FA_PATH.map(([k, label, who], i) => {
    const here = all.filter((s) => faStep(s) === i);
    const slips = here.map((s) => {
      const inv = faInv(s);
      const l = faLoad(s);
      const on = s.id === WSX.fa.sub;
      return `<button type="button" class="fa-slip ${on ? 'is-on' : ''}" data-a="fa.sub" data-v="${s.id}" aria-pressed="${on}" title="${inv.title} · ${l.lane}"><b>${inv.no}</b><span>${faShort(l.lane)}</span><em>${inv.amt ?? '—'}</em><small>${l.ref} · ${faIn(s)} OF 3 PAPERS</small></button>`;
    }).join('');
    return `<div class="fa-col"><div class="fa-col__h"><i>${i + 1}</i><b>${label}</b><span>${here.length}</span></div><small class="fa-col__w">${who}</small>${slips || '<span class="fa-col__none">NONE HERE</span>'}</div>`;
  }).join('');
  return rgn('THE PATH · T&K TRANSPORT', `${all.length} INVOICES`, '', `<div class="fa-board">${cols}</div>`, 'fa-boardrg');
}

/* ── the load under the packet ── */
function faLoadCard(s) {
  const l = faLoad(s);
  const st = ov(`load:${l.id}`, l.status);
  const v = VEHICLES[l.vehicle];
  const [go, goLabel] = faLoadGo(l);
  const truck = v ? `<button type="button" class="fa-truck" data-a="go" data-v="fleet:${v.id}:dispatch" aria-label="${v.unit} in Fleet" title="${v.unit} · ${v.ymm}"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><b>${v.unit}</b></button>` : '';
  const [from, to] = l.lane.split(' → ');
  const route = `<div class="fa-route"><span class="fa-route__end"><small>PICKUP · ${l.pickup}</small><b>${from}</b></span><span class="fa-route__line" aria-hidden="true"><i></i><i></i></span><span class="fa-route__end fa-route__end--to"><small>DELIVERED · ${l.delivery}</small><b>${to}</b></span></div>`;
  const body = `<div class="fa-load" data-swap="fa-load:${s.id}">${truck}<div class="fa-load__m">${route}
    <dl class="fa-load__f"><div><dt>DRIVER</dt><dd>${l.driver ? DRIVERS[l.driver].name : 'NOT RECORDED'}</dd></div><div><dt>DISPATCHER</dt><dd>${staffName(l.owner)}</dd></div><div><dt>LOAD STATUS</dt><dd>${sw(st)}</dd></div></dl></div>
    <div class="fa-load__go"><button type="button" class="wbtn wbtn--sm" data-a="go" data-v="${go}">${ico('pin')}${goLabel}</button></div>
  </div>`;
  return rgn('THE LOAD', `${l.ref}${l.sample ? ' · SAMPLE' : ''}`, '', body, 'fa-loadrg');
}

/* ── the packet panel ── */
function faNext(s) {
  const st = faStatus(s);
  const key = `submission:${s.id}`;
  const pod = faDoc(s, 'pod');
  if (st[0] === 'DOCUMENTS NEEDED') {
    const l = faLoad(s);
    if (pod.w === 'MISSING') return nextBlock(`THE POD FOR ${l.ref} IS MISSING`, simBtn(`fa:pod:${s.id}`, { label: 'REQUEST THE PROOF OF DELIVERY', effect: `ASKS T&K AND THE DRIVER TO UPLOAD THE SIGNED POD FOR ${l.ref}.`, apply: () => (WSX.over[`fadoc:${s.id}:pod`] = 'REQUESTED'), rec: key, primary: true }));
    return nextBlock('POD REQUESTED · WAITING ON T&K', simBtn(`fa:got:${s.id}`, { label: 'MARK POD RECEIVED', effect: 'RECORDS THE SIGNED POD AS RECEIVED AND THE BOL AS CHECKED. THE PACKET IS READY TO SUBMIT.', apply: () => { WSX.over[`fadoc:${s.id}:pod`] = 'RECEIVED'; WSX.over[`fadoc:${s.id}:bol`] = 'RECEIVED'; WSX.over[key] = ['READY TO SUBMIT', 'gold']; WSX.over[`load:${s.load}`] = ['POD RECEIVED', 'ok']; }, rec: key }), 'calm');
  }
  if (st[0] === 'READY TO SUBMIT') return nextBlock('THE PACKET IS COMPLETE', simBtn(`fa:send:${s.id}`, { label: 'SEND PACKET TO THE PROVIDER', effect: 'SENDS THE INVOICE PACKET TO T&K’S EXISTING PROVIDER. AIO DOES NOT FUND.', apply: () => (WSX.over[key] = ['SUBMITTED', 'gold']), rec: key, primary: true }));
  if (st[0] === 'SUBMITTED') return nextBlock('WAITING ON T&K’S PROVIDER', '', 'calm');
  return nextBlock('FUNDED BY THE PROVIDER', '', 'done');
}
function faChecklist(s, act) {
  const n = faIn(s);
  return `<div class="fa-chk"><div class="sec-l"><span>REQUIRED DOCUMENTS</span><span>${n} OF 3 IN</span></div>${FA_PAPERS.map(([k, label]) => {
    const d = faDoc(s, k);
    const on = WSX.fa.part === k;
    return `<button type="button" class="fa-chk__r ${on ? 'is-on' : ''}" data-a="${act}" data-v="${k}" aria-current="${on}"><span class="fa-tick fa-tick--${d.tone}">${d.w === 'RECEIVED' ? ico('pass') : d.w === 'MISSING' ? ico('close') : ''}</span><b>${label}</b>${sw([d.w, d.tone])}</button>`;
  }).join('')}</div>`;
}
function faHidden() {
  return `<div class="fa-priv"><div class="sec-l"><span>PROVIDER SIDE · NOT AIO’S</span>${ico('lock')}</div><div class="fa-priv__g">${FA_HIDDEN.map((t) => `<span><small>${t}</small><i class="fa-redact"></i></span>`).join('')}</div><span class="fa-priv__n">NOT SHOWN IN THE OFFICE</span></div>`;
}
function faPanel(s) {
  const part = WSX.fa.part;
  const inv = faInv(s);
  const l = faLoad(s);
  const act = VP === 'mobile' ? 'fa.part' : 'fa.part';
  const key = `submission:${s.id}`;
  const [go] = faLoadGo(l);
  const paper = FA_PAPERS.find(([k]) => k === part);
  const crumb = `<div class="cx__crumb"><span>FACTORING</span>${ico('fwd')}<span>${s.ref}</span>${ico('fwd')}<span>${paper ? paper[2] : 'PACKET'}</span></div>`;
  let title;
  let status;
  let body;
  if (!paper) {
    title = `INVOICE ${inv.no}${inv.amt ? ` · ${inv.amt}` : ''}`;
    status = faStatus(s);
    body = `${faNext(s)}${facts([['INVOICE', inv.title], ['LOAD', `<a data-a="go" data-v="${go}">${l.ref}</a>`, l.lane], ['AMOUNT', inv.amt ?? '—', inv.amt ? 'SAMPLE AMOUNT · AS INVOICED' : 'NOT IN THE SAMPLE'], ['PROVIDER', s.provider, 'THE CLIENT’S OWN · A PARTNER REFERRAL']])}${faChecklist(s, act)}${faHidden()}${mhist(key, FA_META[s.id].hist)}`;
  } else {
    const [k, label] = paper;
    const d = faDoc(s, k);
    title = label;
    status = [d.w, d.tone];
    const next = d.w === 'MISSING' || (k === 'pod' && d.w === 'REQUESTED') ? faNext(s) : d.w === 'UNDER REVIEW' ? nextBlock('STAFF IS CHECKING THE UPLOAD', '', 'calm') : nextBlock('IN THE PACKET', '', 'done');
    const need = { rc: 'THE AGREED RATE FOR THE LOAD', bol: 'WHAT WAS PICKED UP, SIGNED AT PICKUP', pod: 'SIGNED DELIVERY · THE PROVIDER FUNDS ON IT' }[k];
    body = `${next}${facts([['DOCUMENT', label], ['FROM', d.from], ['STATUS', sw([d.w, d.tone]), d.when], ['NEEDED FOR', need], ['LOAD', `<a data-a="go" data-v="${go}">${l.ref}</a>`, l.lane]])}${d.doc ? docChip(d.doc) : ''}${faChecklist(s, act)}${mhist(key, FA_META[s.id].hist)}`;
  }
  const sk = `${s.id}:${part}`;
  return `<section class="rg cx fa-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${sk}">${crumb}<h2 class="cx__t">${title}</h2><span class="fa-cx__s">${sw(status)}<span class="pk__s">${l.ref} · ${ACCOUNTS[s.client].name}</span></span></div></header><div class="cx__b" data-keep="fa-cx" data-swap="b:${sk}">${body}</div></section>`;
}

/* ── the bar ── */
function faBar() {
  const all = faAll();
  const n = (k) => all.filter((s) => faKey(s) === k).length;
  const f = WSX.fa.filter;
  const r = [
    ro(all.length, 'INVOICES', { a: 'fa.filter', v: 'all', on: f === 'all' }),
    ro(n('docs'), 'DOCUMENTS NEEDED', { tone: n('docs') ? 'warn' : '', a: 'fa.filter', v: 'docs', on: f === 'docs' }),
    ro(n('ready'), 'READY TO SUBMIT', { tone: 'gold', a: 'fa.filter', v: 'ready', on: f === 'ready' }),
    ro(n('sub'), 'SUBMITTED', { a: 'fa.filter', v: 'sub', on: f === 'sub' }),
    ro(n('funded'), 'FUNDED', { a: 'fa.filter', v: 'funded', on: f === 'funded' }),
  ];
  const partner = `<span class="fa-partner">${ico('link')}PARTNER REFERRAL · NOT DIRECT FUNDING</span>`;
  if (VP === 'mobile') return `${wsBar('08 · WORK', 'FACTORING', '')}<div class="ros ros--m fa-ros">${[ro(n('docs'), 'NEEDED', { tone: 'warn', a: 'fa.filter', v: 'docs', on: f === 'docs' }), ro(n('ready'), 'READY', { tone: 'gold', a: 'fa.filter', v: 'ready', on: f === 'ready' }), ro(n('sub'), 'SUBMITTED', { a: 'fa.filter', v: 'sub', on: f === 'sub' }), ro(n('funded'), 'FUNDED', { a: 'fa.filter', v: 'funded', on: f === 'funded' })].join('')}</div>`;
  if (VP === 'tablet') return wsBar('08 · WORK', 'FACTORING', r.join(''), '');
  return wsBar('08 · WORK', 'FACTORING', r.join(''), partner);
}

/* ── compositions ── */
function faStrip(withLane) {
  return `<div class="fa-strip">${faList().map((s) => {
    const inv = faInv(s);
    const st = faStatus(s);
    return `<button type="button" class="fa-chip ${s.id === WSX.fa.sub ? 'is-sel' : ''}" data-a="fa.sub" data-v="${s.id}" aria-pressed="${s.id === WSX.fa.sub}"><b>${inv.no}</b><i class="pip pip--${st[1] === 'gold' ? 'gold' : st[1]}"></i>${withLane ? `<span>${st[0]}</span>` : ''}</button>`;
  }).join('')}</div>`;
}
function factorView() {
  const s = faSub() || faList()[0] || faAll()[0];
  if (VP === 'mobile') {
    const items = [['packet', `INVOICE ${faInv(s).no}`, faStatus(s), 'cash'], ...FA_PAPERS.map(([k, label]) => { const d = faDoc(s, k); return [k, label, [d.w, d.tone], 'folder']; })];
    const list = rgn('THE PACKET', `${faIn(s)} OF 3 IN`, '', items.map(([k, t, st, i]) => `<div class="pk fa-mrow ${WSX.sheet && WSX.fa.part === k ? 'is-sel' : ''}" data-a="fa.open" data-v="${k}"><span class="fa-mrow__i">${ico(i)}</span><b class="pk__t">${t}</b>${sw(st)}</div>`).join(''), 'fa-mlist');
    return `<div class="ws fa fa--m">${faBar()}${faStrip(false)}${faStage(s, { act: 'fa.open', compact: true })}${list}${faLoadCard(s)}${faHidden()}</div>${phoneSheet(faPanel(s), { label: `Invoice ${faInv(s).no} packet` })}`;
  }
  if (VP === 'tablet') return `<div class="ws fa fa--t">${faBar()}${faStrip(true)}${faStage(s)}<div class="fa-t2"><div class="fa-t2__l">${faLoadCard(s)}${faLedgerPending()}</div>${faPanel(s)}</div></div>`;
  return `<div class="ws fa">${faBar()}<div class="fa-grid">${faLedger(WIDE)}<div class="fa-mid">${faStage(s)}${WIDE ? faBoard() : ''}${faLoadCard(s)}</div>${faPanel(s)}</div></div>`;
}
/** Tablet: the loads not invoiced yet sit beside the load (the invoices are the strip above). */
function faLedgerPending() {
  const pend = faPending();
  return rgn('NOT INVOICED YET', `${pend.length}`, '', pend.map((l) => {
    const st = ov(`load:${l.id}`, l.status);
    const [go] = faLoadGo(l);
    return `<div class="pk fa-pend" data-a="go" data-v="${go}" title="${l.ref} · ${l.lane} · ${st[0]}"><span class="fa-pend__i">${ico('pin')}</span><span class="fa-pend__t"><b class="pk__t">${l.ref}</b><span class="pk__s">${faShort(l.lane)}</span></span><span class="fa-pend__r">${sw(st)}<small>${st[0] === 'ISSUE' ? 'NO INVOICE' : `DELIVERS ${l.delivery}`}</small></span></div>`;
  }).join(''), 'fa-pendrg');
}

/* ── actions ── */
/** The part that needs attention first: a missing paper, else the packet. */
function faFirstPart(s) {
  const miss = FA_PAPERS.find(([k]) => faDoc(s, k).w === 'MISSING');
  return miss ? miss[0] : 'packet';
}
ACT['fa.sub'] = (id) => {
  WSX.fa.sub = id;
  WSX.fa.part = faFirstPart(faSub(id));
  WSX.pending = null;
};
ACT['fa.part'] = (k) => {
  WSX.fa.part = k;
  WSX.pending = null;
};
ACT['fa.open'] = (k) => {
  WSX.fa.part = k;
  WSX.sheet = true;
  WSX.pending = null;
};
ACT['fa.filter'] = (f) => {
  WSX.fa.filter = f;
  const list = faList();
  if (list.length && !list.some((s) => s.id === WSX.fa.sub)) ACT['fa.sub'](list[0].id);
};

registerWorkspace({
  id: 'factor', no: '08', name: 'FACTORING', group: 'money', page: 'work', lane: 'factoring', view: () => factorView(),
  shape: 'AN INVOICE PACKET', line: 'EVERY INVOICE, ITS PAPERS, ITS PATH TO FUNDED.',
  states: [
    ['MAIN', []],
    ['SELECTED', [['fa.sub', 'fs-2212']]],
    ['DEEPER', [['fa.sub', 'fs-2210'], ['fa.part', 'pod'], ['sim.ask', 'fa:pod:fs-2210']]],
    ['PHONE', [['fa.part', 'pod']], 'phone'],
  ],
  demos: [
    ['CLEAR THE BLOCKER', [['fa.sub', 'fs-2210', 'INVOICE 5518 · DOCUMENTS NEEDED'], ['fa.part', 'pod', 'THE MISSING POD'], ['sim.ask', 'fa:pod:fs-2210', 'REQUEST THE PROOF OF DELIVERY'], ['sim.ok', 'fa:pod:fs-2210', 'CONFIRM · SIMULATED'], ['sim.ask', 'fa:got:fs-2210', 'THE POD ARRIVES'], ['sim.ok', 'fa:got:fs-2210', 'READY TO SUBMIT · SIMULATED']]],
    ['WALK THE PATH', [['fa.sub', 'fs-2210', 'DOCUMENTS NEEDED'], ['fa.sub', 'fs-2212', 'READY TO SUBMIT'], ['fa.sub', 'fs-2211', 'SUBMITTED'], ['fa.sub', 'fs-2207', 'FUNDED']]],
    ['ONLY WHAT IS STUCK', [['fa.filter', 'docs', 'DOCUMENTS NEEDED'], ['fa.filter', 'funded', 'FUNDED'], ['fa.filter', 'all', 'EVERY INVOICE']]],
  ],
  audit: [
    [['fa.sub', 'fs-2210'], ['fa.part', 'packet']],
    [['fa.sub', 'fs-2210'], ['fa.part', 'bol']],
    [['fa.sub', 'fs-2210'], ['fa.part', 'rc']],
    [['fa.sub', 'fs-2211']],
    [['fa.sub', 'fs-2207']],
    [['fa.sub', 'fs-2207'], ['fa.part', 'pod']],
    [['fa.filter', 'docs']],
    [['fa.sub', 'fs-2212'], ['sim.ask', 'fa:send:fs-2212']],
    [['fa.sub', 'fs-2210'], ['sim.ok', 'fa:pod:fs-2210'], ['sim.ask', 'fa:got:fs-2210']],
  ],
  phoneAct: { 'fa.part': 'fa.open' },
  enter: (a, b) => {
    if (!a) return;
    const s = faSub(a) || faAll().find((x) => x.load === a);
    if (!s) return;
    Object.assign(WSX.fa, { sub: s.id, filter: 'all', part: b && (b === 'packet' || FA_PAPERS.some(([k]) => k === b)) ? b : faFirstPart(s) });
  },
  label: () => (faSub() ? `INVOICE ${faInv(faSub()).no}` : 'FACTORING'),
  route: (s) => {
    if (s[0] === 'work' && s[1] === 'factoring') return true;
    if (s[0] === 'rec' && s[1] === 'submission' && faSub(s[2])) return Object.assign(WSX.fa, { sub: s[2], filter: 'all', part: faFirstPart(faSub(s[2])) }), true;
    return false;
  },
});
