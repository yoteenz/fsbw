/*
 * 12 — ROAD READY. Readiness-centred: the clients with a readiness profile (choose) · the selected client's road — nine
 * checkpoints as mile markers toward READY TO OPERATE, the verified stretch lit (work) · the readiness file or one
 * checkpoint: what is verified, what is missing, what AIO is doing, the lane that owns it and one next step (act).
 * HONESTY: Road Ready has no engagement state yet — AVAILABLE is not ACTIVE. MASON TRANSPORT is PREBUILT · NOT ACTIVE YET.
 * The records are PROFILES (office-data.js); a checkpoint the sample does not list is NOT STARTED.
 */
WSX.rr = { client: 'c-hf', item: null };

/** The nine checkpoints in road order: [key, name, short, icon, pattern that finds it in PROFILES[x].items]. */
const RR_CHECKS = [
  ['ein', 'EIN LETTER', 'EIN LETTER', 'company', /EIN LETTER/],
  ['boc3', 'BOC-3 ON FILE', 'BOC-3', 'letter', /BOC-3/],
  ['ins', 'INSURANCE FILED WITH FMCSA', 'INSURANCE FILED', 'umbrella', /INSURANCE/],
  ['auth', 'OPERATING AUTHORITY ACTIVE', 'AUTHORITY ACTIVE', 'shield-check', /OPERATING AUTHORITY/],
  ['ucr', 'UCR REGISTRATION', 'UCR', 'tag', /UCR/],
  ['fuel', 'IFTA LICENSE', 'IFTA LICENSE', 'fuel', /IFTA|IRP/],
  ['da', 'DRUG & ALCOHOL CONSORTIUM', 'D&A CONSORTIUM', 'tests', /DRUG/],
  ['ch', 'CLEARINGHOUSE REGISTRATION', 'CLEARINGHOUSE', 'database', /CLEARINGHOUSE/],
  ['dq', 'DRIVER QUALIFICATION FILES', 'DQ FILES', 'folder', /QUALIFICATION/],
];
/** What each checkpoint proves, in one line (general regulatory facts, not records). */
const RR_PROVES = {
  ein: 'THE IRS CONFIRMS THE BUSINESS TAX ID (CP 575)',
  boc3: 'A PROCESS AGENT IS ON FILE FOR EVERY STATE',
  ins: 'LIABILITY COVERAGE IS FILED WITH FMCSA',
  auth: 'FMCSA SHOWS THE MC AUTHORITY AS ACTIVE',
  ucr: 'THE UNIFIED CARRIER REGISTRATION IS PAID',
  fuel: 'THE FUEL-TAX LICENSE OR APPORTIONED PLATES ARE ISSUED',
  da: 'DRIVERS ARE IN A RANDOM TESTING POOL',
  ch: 'THE CARRIER IS REGISTERED IN THE CLEARINGHOUSE',
  dq: 'EVERY DRIVER HAS A COMPLETE QUALIFICATION FILE',
};
const RR_CLASS = { ver: ['VERIFIED', 'ok'], miss: ['MISSING', 'bad'], aio: ['AIO IS DOING IT', 'gold'], partner: ['PARTNER PENDING', 'mute'], none: ['NOT STARTED', 'mute'] };
const RR_GROUPS = [['ver', 'VERIFIED'], ['miss', 'MISSING'], ['aio', 'AIO OR A PARTNER'], ['none', 'NOT STARTED']];
const RR_LANE = { permitting: ['PERMITTING & AUTHORITIES', 'id-card'], insurance: ['INSURANCE', 'umbrella'], filing: ['FILING & FUEL TAXES', 'fuel'], compliance: ['COMPLIANCE', 'shield-check'] };

/* ── a client's nine checkpoints (sample overrides apply) ── */
const rrProfile = (cid) => vals(PROFILES).find((p) => p.client === cid);
const rrClients = () => vals(PROFILES).map((p) => p.client);
const rrClassOf = (w, tone) => (w === 'COMPLETED' ? 'ver' : w === 'PARTNER PENDING' ? 'partner' : w === 'NOT STARTED' ? 'none' : tone === 'bad' ? 'miss' : 'aio');
function rrItems(p) {
  return RR_CHECKS.map(([key, name, short, icon, re], i) => {
    const hit = p.items.find(([t]) => re.test(t));
    const base = hit ? [hit[1], hit[2]] : ['NOT STARTED', 'mute'];
    const [word, tone] = ov(`rrcp:${p.client}:${key}`, base);
    const full = hit ? hit[0] : key === 'fuel' ? 'IFTA LICENSE / IRP' : name;
    const sh = key === 'fuel' && hit && /IRP/.test(hit[0]) ? 'IRP · UNIT 1' : short;
    const cls = rrClassOf(word, tone);
    return { key, i, name: full, short: sh, icon: key === 'fuel' && /IRP/.test(full) ? 'id-card' : icon, word, tone, cls, listed: !!hit, shown: word === 'COMPLETED' ? 'VERIFIED' : word };
  });
}
/** Verified checkpoints for a profile (also read by Permitting, so a change here shows there). */
const rrDone = (p) => rrItems(p).filter((x) => x.cls === 'ver').length;
const rrLife = (c) => (c.life === 'ACTIVE' ? LIFE.ACTIVE : WSX.over[`rrinv:${c.id}`] ? ['INVITE SENT · NOT ACTIVE YET', 'gold'] : LIFE[c.life]);
/** The lane that owns a checkpoint for this client, and the way into it: [lane, label, attrs]. */
const rrShort = (r) => (typeof PM_META !== 'undefined' && PM_META[r.id]?.short) || r.title;
function rrOwner(cid, it) {
  const req = (re) => vals(REQUESTS).find((r) => r.client === cid && re.test(`${r.section} ${r.title}`));
  const pm = !!wsById('permits');
  const toReq = (r, sec) => (r ? ['permitting', rrShort(r), pm ? `data-a="go" data-v="permits:${r.id}"` : `data-go="rec/request/${r.id}"`] : ['permitting', sec[1], pm ? `data-a="go" data-v="permits:sec:${sec[0]}"` : 'data-go="work/permitting"']);
  if (it.key === 'ein') return toReq(null, ['llc', 'LLC / INC']);
  if (it.key === 'boc3') return toReq(req(/BOC-3/), ['boc3', 'BOC-3']);
  if (it.key === 'auth') return toReq(req(/OPERATING AUTHORITIES/), ['auth', 'OPERATING AUTHORITIES']);
  if (it.key === 'ucr') return toReq(req(/UCR/), ['other', 'OTHER PERMITS']);
  if (it.key === 'fuel') return /IRP/.test(it.name) ? toReq(req(/IRP/), ['tags', 'TAGS / REGISTRATION']) : toReq(req(/IFTA LICENSE/), ['fuel', 'FUEL / ROAD TAX PERMITS']);
  if (it.key === 'ins') {
    const pol = vals(POLICIES).find((x) => x.client === cid);
    return ['insurance', pol ? pol.title : ACCOUNTS[cid].lanes.includes('insurance') ? 'NO POLICY LINKED YET' : 'INSURED OUTSIDE AIO', `data-go="${pol ? `rec/policy/${pol.id}` : 'work/insurance'}"`];
  }
  const due = it.key === 'dq' ? vals(DUES).find((d) => d.client === cid && d.kind === 'DRIVER CREDENTIAL') : null;
  return ['compliance', due ? due.what : 'NO DEADLINE ON FILE YET', `data-a="go" data-v="comp${due ? `:${due.id}` : ''}"`];
}
/** The record behind a checkpoint, when the sample has one. */
function rrRecord(cid, it) {
  const [, , attrs] = rrOwner(cid, it);
  const m = /(?:permits:|rec\/request\/)(req-[a-z0-9-]+)/.exec(attrs);
  return m ? REQUESTS[m[1]] : null;
}

/* ── the road: one drawn curve, nine mile markers at equal distances, READY TO OPERATE at the end ── */
const RR_VB = [1000, 350];
const RR_CURVE = (() => {
  const P = [[24, 304], [400, 350], [500, 80], [830, 40]];
  const at = (t) => [0, 1].map((k) => (1 - t) ** 3 * P[0][k] + 3 * (1 - t) ** 2 * t * P[1][k] + 3 * (1 - t) * t * t * P[2][k] + t ** 3 * P[3][k]);
  const pts = Array.from({ length: 241 }, (_, i) => at(i / 240));
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const L = len[len.length - 1];
  /** the point and sample index at a fraction of the road's length */
  const pos = (f) => {
    const target = f * L;
    let i = len.findIndex((x) => x >= target);
    if (i <= 0) i = 1;
    const k = (target - len[i - 1]) / (len[i] - len[i - 1] || 1);
    return { x: pts[i - 1][0] + k * (pts[i][0] - pts[i - 1][0]), y: pts[i - 1][1] + k * (pts[i][1] - pts[i - 1][1]), i };
  };
  return { pts, pos };
})();
const RR_AT = Array.from({ length: 9 }, (_, i) => 0.07 + i * 0.1); // the nine markers by distance; the gate at 0.965
const rrPath = (a, b) => {
  const s = RR_CURVE.pos(a);
  const e = RR_CURVE.pos(b);
  const mid = RR_CURVE.pts.slice(s.i, e.i);
  return `M${[[s.x, s.y], ...mid, [e.x, e.y]].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;
};
function rrRoadSvg(items, locked) {
  const { pts } = RR_CURVE;
  // the road surface: wide where it is near, narrow toward the horizon
  const w = (t) => 58 - 38 * t;
  const edge = (side) => pts.map(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)];
    const [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
    const d = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / d;
    const ny = (bx - ax) / d;
    const h = (w(i / (pts.length - 1)) / 2) * side;
    return [x + nx * h, y + ny * h];
  });
  const L = edge(1);
  const R = edge(-1);
  const surf = `M${L.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} L${R.reverse().map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
  const line = (arr) => `M${arr.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;
  // the lit stretch: each leg is lit when the marker it reaches is verified; open legs are drawn by their state
  const legs = items.map((it, i) => {
    const a = i === 0 ? 0.005 : RR_AT[i - 1];
    const b = RR_AT[i];
    const d = rrPath(a, b);
    if (it.cls === 'ver') return `<path d="${d}" class="rr-glow"/><path d="${d}" class="rr-lit"/>`;
    if (locked) return '';
    if (it.cls === 'miss') return `<path d="${d}" class="rr-leg rr-leg--bad"/>`;
    if (it.cls === 'aio') return `<path d="${d}" class="rr-leg rr-leg--gold"/>`;
    return '';
  }).join('');
  const last = items[8].cls === 'ver' && items.every((x) => x.cls === 'ver') ? `<path d="${rrPath(RR_AT[8], 0.998)}" class="rr-glow"/><path d="${rrPath(RR_AT[8], 0.998)}" class="rr-lit"/>` : '';
  return `<svg viewBox="0 0 ${RR_VB[0]} ${RR_VB[1]}" class="rr-svg" aria-hidden="true"><path d="${surf}" class="rr-surf"/><path d="${line(edge(1))}" class="rr-edge"/><path d="${line(edge(-1))}" class="rr-edge"/><path d="${line(pts)}" class="rr-mid"/><g data-swap="lit:${items.map((x) => x.cls[0]).join('')}">${legs}${last}</g></svg>`;
}
function rrRoad(c, p, items) {
  const locked = c.life !== 'ACTIVE';
  const sel = WSX.rr.item;
  const pc = (f) => {
    const { x, y } = RR_CURVE.pos(f);
    return `left:${((x / RR_VB[0]) * 100).toFixed(2)}%;top:${((y / RR_VB[1]) * 100).toFixed(2)}%`;
  };
  const marks = items.map((it, i) => {
    const on = it.key === sel;
    // names sit off the road: up and to the left, or down and to the right (turned in near the edges)
    const fx = RR_CURVE.pos(RR_AT[i]).x / RR_VB[0];
    const side = i % 2 === 0 ? (fx < 0.06 ? 'ur' : 'ul') : fx > 0.84 ? 'dl' : 'dr';
    return `<button type="button" class="rr-mk rr-mk--${it.cls} rr-mk--${side} ${on ? 'is-on' : ''}" style="${pc(RR_AT[i])}" data-a="rr.item" data-v="${it.key}" aria-pressed="${on}" aria-label="MILE ${i + 1} · ${it.name} · ${it.shown}" title="${it.name} · ${it.shown}"><span class="rr-mk__s"><b>${i + 1}</b></span><span class="rr-mk__l"><b>${WIDE ? it.name : it.short}</b>${sw([it.shown, it.cls === 'ver' ? 'ok' : it.tone])}${WIDE ? `<small>${RR_LANE[rrOwner(c.id, it)[0]][0]}</small>` : ''}</span>${on ? `<i class="rr-mk__ring" data-swap="ring:${c.id}:${it.key}" aria-hidden="true"></i>` : ''}</button>`;
  }).join('');
  // the truck stands where the road stops being verified
  const at = items.findIndex((x) => x.cls !== 'ver');
  const here = at < 0 ? 0.998 : (at === 0 ? 0.02 : RR_AT[at - 1]) + (RR_AT[at] - (at === 0 ? 0.02 : RR_AT[at - 1])) * 0.5;
  const blocked = at >= 0 && (items[at].cls === 'miss' || locked);
  const truck = `<span class="rr-truck ${blocked ? 'rr-truck--bad' : ''}" style="${pc(here)}" data-swap="truck:${c.id}:${at}" aria-hidden="true">${ico('truck')}</span>`;
  const done = rrDone(p);
  const gate = `<span class="rr-gate ${done === p.total ? 'is-ready' : ''}" style="${pc(0.998)}"><span class="rr-gate__p"><b>READY TO OPERATE</b><small>${done === p.total ? 'ALL NINE VERIFIED' : `${p.total - done} TO GO`}</small></span></span>`;
  const bar = locked ? `<span class="rr-lock">${ico('lock')}<span><b>${rrLife(c)[0]}</b><small>NOTHING MOVES UNTIL THE CLIENT CONFIRMS</small></span></span>` : '';
  return `<div class="rr-roadwrap"><div class="rr-road ${locked ? 'is-locked' : ''}">${rrRoadSvg(items, locked)}${truck}${marks}${gate}${bar}</div></div>`;
}

/* ── the client selector: each client's readiness at a glance ── */
const rrStrip = (items) => `<span class="rr-strip">${items.map((x) => `<i class="rr-strip__s rr-strip__s--${x.cls}" title="${x.name} · ${x.shown}"></i>`).join('')}</span>`;
function rrTickets() {
  return `<div class="rr-tks">${rrClients().map((cid) => {
    const c = ACCOUNTS[cid];
    const p = rrProfile(cid);
    const items = rrItems(p);
    const on = cid === WSX.rr.client;
    const mode = ov(`rrmode:${cid}`, p.mode);
    return `<button type="button" class="rr-tk ${on ? 'is-sel' : ''}" data-a="rr.client" data-v="${cid}" aria-pressed="${on}" title="${c.name} · ${rrDone(p)} OF ${p.total} VERIFIED"><span class="rr-tk__b">${badge(c)}</span><span class="rr-tk__t"><b>${c.name}</b>${c.life === 'ACTIVE' ? sw([mode[0].split(' · ')[0], mode[1]]) : sw(rrLife(c))}</span><span class="rr-tk__n"><b>${rrDone(p)}</b><small>/ ${p.total}</small></span>${rrStrip(items)}</button>`;
  }).join('')}</div>`;
}

/* ── the stage: who, how far, the road, then the ledger ── */
function rrStage(c, p, items) {
  const done = rrDone(p);
  const mode = ov(`rrmode:${c.id}`, p.mode);
  const id = `<div class="rr-id" data-swap="id:${c.id}"><div class="rr-id__t"><small>ROAD READY · ${c.dot} · ${c.state}</small><b>${c.name}</b><span class="rr-id__chips"><span class="rr-big rr-big--${mode[1]}">${mode[0]}</span><button type="button" class="fl-client" data-a="go" data-v="client:${c.id}">${badge(c)}<span>CLIENT 360</span>${ico('fwd')}</button></span></div><div class="rr-id__n"><b>${done}<small>/ ${p.total}</small></b><span>CHECKPOINTS VERIFIED</span>${sw(rrLife(c))}</div></div>`;
  const inGroup = (g) => items.filter((x) => (g === 'aio' ? x.cls === 'aio' || x.cls === 'partner' : x.cls === g));
  // a column is as wide as what it holds, so a long list never makes the stage taller
  const cols = RR_GROUPS.map(([g]) => `minmax(136px, ${(1 + inGroup(g).length * 0.35).toFixed(2)}fr)`).join(' ');
  const ledger = `<div class="rr-ledger" style="grid-template-columns:${cols}">${RR_GROUPS.map(([g, label]) => {
    const mine = inGroup(g);
    return `<div class="rr-lg rr-lg--${g}"><div class="rr-lg__h"><i class="rr-lg__k"></i><span>${label}</span><b>${mine.length}</b></div><div class="rr-lg__b">${mine.map((x) => `<button type="button" class="rr-chip ${x.key === WSX.rr.item ? 'is-on' : ''}" data-a="rr.item" data-v="${x.key}" title="${x.name} · ${x.shown}">${x.i + 1} · ${x.short}</button>`).join('') || '<span class="rr-lg__none">NONE</span>'}</div></div>`;
  }).join('')}</div>`;
  const work = VP === 'mobile' ? `<div class="rr-mprog">${rrStrip(items)}<span>${p.total - done ? `${p.total - done} TO GO TO READY TO OPERATE` : 'READY TO OPERATE'}</span></div>` : `${rrRoad(c, p, items)}${ledger}`;
  return `<section class="rr-stage"><img class="rr-stage__img" src="./brand/ifta/plates/public-road.jpg" alt="">${id}${work}</section>`;
}

/* ── the readiness file: the client, or one checkpoint ── */
function rrNextFor(c, it) {
  const rec = `rrcp:${c.id}:${it.key}`;
  const who = c.contact.split(' · ')[0];
  const [lane, , attrs] = rrOwner(c.id, it);
  const open = `<button type="button" class="wbtn" ${attrs}>${ico(RR_LANE[lane][1])}OPEN IN ${lane === 'permitting' ? 'PERMITTING' : RR_LANE[lane][0]}</button>`;
  if (it.cls === 'ver') return nextBlock(`${it.name} · VERIFIED`, '', 'done');
  if (c.life !== 'ACTIVE') return nextBlock('NOTHING STARTS UNTIL THE CLIENT CONFIRMS', it.cls === 'partner' ? open : '', 'calm');
  if (it.cls === 'partner') return nextBlock('PARTNER / MANUAL · NO DATE TO PROMISE', open, 'calm');
  if (it.cls === 'miss') {
    const r = rrRecord(c.id, it);
    if (r?.id === 'req-hf-mc') {
      if (WSX.over['pmrq:req-hf-mc:1']) return nextBlock(`WAITING ON ${who} FOR THE EIN LETTER`, open, 'calm');
      return nextBlock('THE AUTHORITY WAITS ON THE EIN LETTER', `${simBtn(`rr:ein:${c.id}`, { label: 'REQUEST THE EIN LETTER', effect: `ASKS ${who} FOR THE EIN LETTER (CP 575) SO THE REINSTATEMENT CAN BE FILED.`, apply: () => (WSX.over['pmrq:req-hf-mc:1'] = ['REQUESTED AGAIN', 'warn']), rec, primary: true })}${open}`);
    }
    return nextBlock(`${it.short} · NEEDED FROM THE CLIENT`, `${simBtn(`rr:ask:${c.id}:${it.key}`, { label: 'REQUEST FROM THE CLIENT', effect: `ASKS ${who} FOR WHAT THIS CHECKPOINT NEEDS.`, apply: () => {}, rec, primary: true })}${open}`);
  }
  if (it.cls === 'aio') {
    if (it.word === 'NEEDS REVIEW') return nextBlock('REVIEW THE ENROLLMENT, THEN VERIFY', simBtn(`rr:ver:${c.id}:${it.key}`, { label: 'MARK VERIFIED', effect: 'RECORDS THE CHECKPOINT AS VERIFIED AFTER STAFF REVIEW. THE ROAD LIGHTS UP TO IT.', apply: () => (WSX.over[rec] = ['COMPLETED', 'ok']), rec, primary: true }));
    const r = rrRecord(c.id, it);
    if (r) return nextBlock(`${rrShort(r)} · ${ov(`request:${r.id}`, r.status)[0]} IN PERMITTING`, `<button type="button" class="wbtn wbtn--gold" ${attrs}>${ico('id-card')}OPEN THE APPLICATION</button>`);
    return nextBlock('AIO IS ASSEMBLING THE DRIVER FILES', simBtn(`rr:dq:${c.id}:${it.key}`, { label: 'REQUEST DRIVER DOCUMENTS', effect: `ASKS ${who} FOR WHAT IS STILL MISSING FROM EACH DRIVER FILE.`, apply: () => {}, rec, primary: true }));
  }
  return nextBlock('NOT STARTED', simBtn(`rr:go:${c.id}:${it.key}`, { label: 'START THIS CHECKPOINT', effect: 'OPENS THE WORK AND ASSIGNS IT TO AIO. NOTHING IS FILED.', apply: () => (WSX.over[rec] = ['IN PROGRESS', 'gold']), rec, primary: true }));
}
function rrClientNext(c, items) {
  if (c.life !== 'ACTIVE') {
    if (WSX.over[`rrinv:${c.id}`]) return nextBlock(`INVITE SENT · WAITING ON ${c.contact.split(' · ')[0]}`, '', 'calm');
    return nextBlock(`${c.name} IS PREBUILT · NOT ACTIVE YET`, simBtn(`rr:inv:${c.id}`, { label: 'SEND ACTIVATION INVITE', effect: `INVITES ${c.contact.split(' · ')[0]} TO CONFIRM THE OFFICE. NOTHING ACTIVATES UNTIL HE CONFIRMS.`, apply: () => (WSX.over[`rrinv:${c.id}`] = true), rec: `rr:${c.id}`, primary: true }));
  }
  const first = ['miss', 'aio', 'none', 'partner'].map((k) => items.find((x) => x.cls === k)).find(Boolean);
  if (!first) return nextBlock('READY TO OPERATE · ALL NINE VERIFIED', '', 'done');
  const nx = rrNextFor(c, first);
  return nx.replace('<span class="nx__t">', `<span class="nx__t"><em class="rr-nxm">MILE ${first.i + 1} · </em>`);
}
function rrFile(c, p, items) {
  const it = items.find((x) => x.key === WSX.rr.item);
  const go = VP === 'mobile' ? 'rr.open' : 'rr.item';
  const crumb = `<div class="cx__crumb">${it ? `<a data-a="rr.item" data-v="">${c.b} · ROAD READY</a>` : `<span>ROAD READY</span>${ico('fwd')}<span>${c.name}</span>`}${it ? `${ico('fwd')}<span>MILE ${it.i + 1}</span>` : ''}</div>`;
  if (!it) {
    const done = rrDone(p);
    const plate = `<div class="rr-plate" data-swap="pl:${c.id}"><span class="rr-plate__b">${badge(c)}</span><span class="rr-plate__t"><small>READINESS FILE · ${c.dot}</small><b>${c.name}</b>${sw(rrLife(c))}</span><span class="rr-ring" style="--p:${(done / p.total) * 100}"><b>${done}</b><small>OF ${p.total}</small></span></div>`;
    const lanes = Object.entries(RR_LANE).map(([lane, [name, icon]]) => {
      const mine = items.filter((x) => rrOwner(c.id, x)[0] === lane);
      if (!mine.length) return '';
      const open = mine.filter((x) => x.cls !== 'ver');
      const first = open[0] || mine[0];
      const [, , attrs] = rrOwner(c.id, first);
      return `<button type="button" class="rr-lane" ${attrs} title="${name}">${ico(icon)}<span><b>${name}</b><small>${mine.length} CHECKPOINT${mine.length > 1 ? 'S' : ''} · ${open.length ? `${open.length} OPEN` : 'ALL VERIFIED'}</small></span><span class="rr-lane__d">${mine.map((x) => `<i class="rr-strip__s rr-strip__s--${x.cls}"></i>`).join('')}</span>${ico('fwd')}</button>`;
    }).join('');
    const body = `<div class="rr-fa">${rrClientNext(c, items)}${ntb('<b>NO ENGAGEMENT STATE YET.</b> ROAD READY IS AVAILABLE, NOT ACTIVE.')}<div class="rr-lanes"><div class="sec-l"><span>WHO OWNS EACH CHECKPOINT</span></div>${lanes}</div>${facts([['CONTACT', c.contact], ['PROFILE', ov(`rrmode:${c.id}`, p.mode)[0]], ['ROAD READY', 'AVAILABLE · NOT ACTIVE', 'NO ENGAGEMENT STATE IN THE PRODUCT'], ['CLIENT', rrLife(c)[0], CLIENT_META[c.id]?.since]])}</div><div class="rr-fb">${rrSiblings(c, items, go)}</div>`;
    return `<section class="rg cx rr-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${c.id}">${crumb}${plate}</div></header><div class="cx__b" data-keep="rr-cx" data-swap="b:${c.id}:file">${body}</div></section>`;
  }
  const [lane, recLabel, attrs] = rrOwner(c.id, it);
  const r = rrRecord(c.id, it);
  const plate = `<div class="rr-plate rr-plate--cp" data-swap="pl:${c.id}:${it.key}"><span class="rr-plate__m rr-plate__m--${it.cls}"><b>${it.i + 1}</b><small>MILE</small></span><span class="rr-plate__t"><small>CHECKPOINT · ${c.name}</small><b>${it.name}</b>${sw([RR_CLASS[it.cls][0], RR_CLASS[it.cls][1]])}</span></div>`;
  const owner = `<div class="rr-own"><div class="sec-l"><span>OWNED BY</span></div><button type="button" class="rr-lane" ${attrs} title="${RR_LANE[lane][0]}">${ico(RR_LANE[lane][1])}<span><b>${RR_LANE[lane][0]}</b><small>${recLabel}</small></span>${ico('fwd')}</button>${it.key === 'fuel' && !/IRP/.test(it.name) && vals(QUARTERS).some((q) => q.client === c.id) ? (() => { const q = vals(QUARTERS).find((x) => x.client === c.id && x.q === 'Q3 2026'); return `<button type="button" class="rr-lane" data-go="rec/quarter/${q.id}" title="FILING & FUEL TAXES">${ico('fuel')}<span><b>FILING & FUEL TAXES</b><small>IFTA ${q.q} · ${q.bucket[0]}</small></span>${ico('fwd')}</button>`; })() : ''}</div>`;
  const fx = facts([['STATUS', it.listed ? it.shown : 'NOT STARTED', it.listed ? '' : 'NO RECORD IN THE SAMPLE YET'], ['WHAT IT PROVES', RR_PROVES[it.key]], r ? ['RECORD', r.title, `${ov(`request:${r.id}`, r.status)[0]} · DUE ${r.due}`] : null, r?.owner ? ['OWNER', staffName(r.owner)] : null]);
  const docs = r?.docs?.length ? `<div class="rr-docs"><div class="sec-l"><span>DOCUMENTS</span><span>${r.docs.length}</span></div>${r.docs.map(docChip).join('')}</div>` : '';
  const honest = it.cls === 'partner' ? ntb('<b>BOC-3 IS A PARTNER / MANUAL WORKFLOW</b> UNTIL A PROVIDER IS READY.') : '';
  const body = `<div class="rr-fa">${rrNextFor(c, it)}${honest}${owner}${fx}${docs}</div><div class="rr-fb">${WSX.hist[`rrcp:${c.id}:${it.key}`] ? mhist(`rrcp:${c.id}:${it.key}`, []) : ''}${rrSiblings(c, items, go)}</div>`;
  return `<section class="rg cx rr-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${c.id}:${it.key}">${crumb}${plate}</div></header><div class="cx__b" data-keep="rr-cx" data-swap="b:${c.id}:${it.key}">${body}</div></section>`;
}
/** The rest of the road stays in reach under the focus. */
function rrSiblings(c, items, go) {
  return `<div class="rr-sib"><div class="sec-l"><span>THE ROAD · ${rrDone(rrProfile(c.id))} OF 9 VERIFIED</span></div>${items.map((x) => `<button type="button" class="pk rr-sib__r ${x.key === WSX.rr.item ? 'is-sel' : ''}" data-a="${go}" data-v="${x.key}" title="${x.name}" aria-current="${x.key === WSX.rr.item}"><span class="rr-sib__m rr-sib__m--${x.cls}">${x.i + 1}</span><b class="pk__t">${x.name}</b>${sw([x.shown, x.cls === 'ver' ? 'ok' : x.tone])}</button>`).join('')}</div>`;
}

/* ── bar and compositions ── */
function rrBar() {
  const all = rrClients().map((cid) => rrItems(rrProfile(cid)));
  const n = (k) => all.flat().filter((x) => x.cls === k).length;
  const ready = rrClients().filter((cid) => rrDone(rrProfile(cid)) === rrProfile(cid).total).length;
  const pill = `<span class="rr-pill">${ico('info')}NO ENGAGEMENT STATE · AVAILABLE ≠ ACTIVE</span>`;
  if (VP === 'mobile') return wsBar('12 · WORK', 'ROAD READY', [ro(rrClients().length, 'PROFILES'), ro(n('miss'), 'MISSING', { tone: 'bad' }), ro(ready, 'READY', { tone: 'gold' })].join(''));
  return wsBar('12 · WORK', 'ROAD READY', [ro(rrClients().length, 'PROFILES'), ro(n('ver'), 'VERIFIED'), ro(n('miss'), 'MISSING', { tone: 'bad' }), ro(n('aio'), 'AIO IS DOING', { tone: 'gold' }), ro(ready, 'READY TO OPERATE')].join(''), VP === 'desktop' ? pill : '');
}
function readyView() {
  const c = ACCOUNTS[WSX.rr.client];
  const p = rrProfile(c.id);
  const items = rrItems(p);
  if (VP === 'mobile') {
    const chips = `<div class="rr-mchips">${rrClients().map((cid) => { const x = rrProfile(cid); return `<button type="button" class="rr-mchip ${cid === c.id ? 'is-sel' : ''}" data-a="rr.client" data-v="${cid}">${badge(ACCOUNTS[cid])}<b>${rrDone(x)}<small>/${x.total}</small></b>${rrStrip(rrItems(x))}</button>`; }).join('')}</div>`;
    const road = `<div class="rr-vroad">${items.map((it) => `<button type="button" class="rr-vr rr-vr--${it.cls}" data-a="rr.open" data-v="${it.key}" aria-label="MILE ${it.i + 1} · ${it.name} · ${it.shown}"><span class="rr-vr__m">${it.i + 1}</span><span class="rr-vr__t"><b>${it.name}</b>${sw([it.shown, it.cls === 'ver' ? 'ok' : it.tone])}</span>${ico('fwd')}</button>`).join('')}<div class="rr-vr rr-vr--gate ${rrDone(p) === p.total ? 'is-ready' : ''}"><span class="rr-vr__m">${ico('pass')}</span><span class="rr-vr__t"><b>READY TO OPERATE</b><small>${p.total - rrDone(p) ? `${p.total - rrDone(p)} TO GO` : 'ALL NINE VERIFIED'}</small></span></div></div>`;
    return `<div class="ws rr rr--m">${rrBar()}${chips}<div class="rr-slab">${rrStage(c, p, items)}${road}</div><div class="rr-mnext">${rrClientNext(c, items)}</div>${ntb('<b>NO ENGAGEMENT STATE YET.</b> AVAILABLE IS NOT ACTIVE.')}</div>${phoneSheet(rrFile(c, p, items), { label: 'Road Ready checkpoint' })}`;
  }
  if (VP === 'tablet') return `<div class="ws rr rr--t">${rrBar()}${rrTickets()}${rrStage(c, p, items)}${rrFile(c, p, items)}</div>`;
  return `<div class="ws rr">${rrBar()}<div class="rr-grid"><div class="rr-main">${rrTickets()}${rrStage(c, p, items)}</div>${rrFile(c, p, items)}</div></div>`;
}

/* ── actions ── */
ACT['rr.client'] = (cid) => {
  WSX.rr.client = cid;
  WSX.rr.item = null;
  WSX.pending = null;
  WSX.sheet = false;
};
ACT['rr.item'] = (k) => {
  WSX.rr.item = k || null;
  WSX.pending = null;
};
ACT['rr.open'] = (k) => {
  WSX.rr.item = k || null;
  WSX.sheet = true;
  WSX.pending = null;
};

registerWorkspace({
  id: 'ready', no: '12', name: 'ROAD READY', group: 'auth', page: 'work', lane: 'roadready', view: () => readyView(),
  shape: 'A ROAD', line: 'NINE CHECKPOINTS BETWEEN A CLIENT AND THE ROAD.',
  states: [['MAIN', []], ['SELECTED', [['rr.client', 'c-abc'], ['rr.item', 'fuel']]], ['DEEPER', [['rr.item', 'da'], ['sim.ask', 'rr:ver:c-hf:da']]], ['PHONE', [['rr.open', 'auth']], 'phone']],
  demos: [
    ['VERIFY A CHECKPOINT', [['rr.item', 'da', 'MILE 7 · NEEDS REVIEW'], ['sim.ask', 'rr:ver:c-hf:da', 'MARK VERIFIED'], ['sim.ok', 'rr:ver:c-hf:da', 'CONFIRM · THE ROAD LIGHTS UP']]],
    ['THREE CLIENTS, THREE ROADS', [['rr.client', 'c-abc', 'ABC · 8 OF 9'], ['rr.client', 'c-mt', 'MASON · PREBUILT, NOT ACTIVE'], ['rr.client', 'c-hf', 'HORIZON · 5 OF 9']]],
    ['TO THE LANE THAT OWNS IT', [['rr.item', 'auth', 'MILE 4 · AUTHORITY MISSING'], ['go', 'permits:req-hf-mc', 'OPEN IN PERMITTING'], ['ret', '', 'BACK TO ROAD READY']]],
  ],
  audit: [
    [['rr.client', 'c-abc']], [['rr.client', 'c-mt']], [['rr.client', 'c-mt'], ['rr.item', 'boc3']], [['rr.client', 'c-mt'], ['rr.item', 'ch']],
    [['rr.item', 'ein']], [['rr.item', 'auth']], [['rr.item', 'ins']], [['rr.item', 'fuel']], [['rr.item', 'ch']], [['rr.item', 'dq']],
    [['rr.client', 'c-abc'], ['rr.item', 'dq']], [['rr.item', 'auth'], ['sim.ask', 'rr:ein:c-hf']], [['rr.client', 'c-mt'], ['sim.ask', 'rr:inv:c-mt']],
    [['rr.item', 'da'], ['sim.ok', 'rr:ver:c-hf:da']],
  ],
  phoneAct: { 'rr.item': 'rr.open' },
  enter: (a, b) => {
    const cid = PROFILES[a]?.client ?? a;
    if (rrProfile(cid)) Object.assign(WSX.rr, { client: cid, item: b && RR_CHECKS.some(([k]) => k === b) ? b : null });
  },
  label: () => 'ROAD READY',
  route: (s) => {
    if (s[0] === 'work' && s[1] === 'roadready') return true;
    if (s[0] === 'rec' && s[1] === 'profile' && PROFILES[s[2]]) return Object.assign(WSX.rr, { client: PROFILES[s[2]].client, item: null }), true;
    return false;
  },
});
