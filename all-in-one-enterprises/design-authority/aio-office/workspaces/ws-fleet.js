/*
 * PROOF 01 — VEHICLES & FLEET. Vehicle-centered: the yard (roster) · the selected truck on a dark stage, drawn as a
 * blueprint with its business records tagged to the parts of the truck · one connection at a time in the context panel.
 * DESIGN PROOF: the live app has no staff Vehicles & Fleet workspace (power units are recorded on the client side).
 */
const CONN = [
  ['registration', 'REGISTRATION', 'id-card'],
  ['driver', 'DRIVER', 'steering'],
  ['insurance', 'INSURANCE', 'umbrella'],
  ['maintenance', 'MAINTENANCE', 'wrench'],
  ['compliance', 'COMPLIANCE', 'shield-check'],
  ['ifta', 'IFTA', 'fuel'],
  ['dispatch', 'DISPATCH', 'pin'],
  ['documents', 'DOCUMENTS', 'folder'],
];
const TONE_RANK = { bad: 0, warn: 1, gold: 2, ok: 3, mute: 4 };
const worst = (list) => list.reduce((w, s) => (TONE_RANK[s] < TONE_RANK[w] ? s : w), 'ok');
const vAvail = (v) => ov(`vehicle:${v.id}`, v.avail);
const vGroup = (v) => AVAIL_GROUP[vAvail(v)[0]] || 'ready';

/** What each business record says about this truck: state, facts, the next step, history. */
function fleetConns(v) {
  const c = ACCOUNTS[v.client];
  const out = {};
  // registration
  if (v.request) {
    const q = REQUESTS[v.request];
    const s = ov(`request:${q.id}`, q.status);
    out.registration = { tone: s[1], word: s[0], title: q.title, facts: [['PLATE', v.plate], ['REQUEST', q.title], ['DUE', q.due], ['OWNER', staffName(q.owner)]], rec: `request:${q.id}`, next: s[0] === 'UNDER REVIEW' ? ['SUBMIT THE APPLICATION TO THE STATE', simBtn(`fl:reg:${q.id}`, { label: 'SUBMIT TO STATE', effect: 'MARKS THE IRP APPLICATION SUBMITTED; THE CASE WAITS ON THE AGENCY.', apply: () => (WSX.over[`request:${q.id}`] = ['AWAITING AGENCY', 'gold']), rec: `request:${q.id}`, primary: true })] : ['WAITING ON THE STATE', '', 'calm'], hist: [['OCT 5', 'CAB CARD APPLICATION UPLOADED']] };
  } else {
    const due = vals(DUES).find((d) => d.kind === 'REGISTRATION' && d.links.includes(`vehicle:${v.id}`));
    out.registration = { tone: due && due.days <= 30 ? 'warn' : 'ok', word: due ? `RENEWS ${due.due.replace(', 2026', '')}` : 'CURRENT', title: v.plate, facts: [['PLATE', v.plate], ['RENEWAL', due ? due.due : 'NONE IN 90 DAYS', due ? daysWord(due.days) : '']], rec: `vehicle:${v.id}`, next: due ? ['RENEWAL OPENS IN DECEMBER', '', 'calm'] : ['NOTHING DUE', '', 'calm'], hist: [] };
  }
  // driver
  if (v.driver) {
    const d = DRIVERS[v.driver];
    const s = ov(`driver:${d.id}`, d.status);
    const exp = /OCT 29, 2026/.test(d.med);
    out.driver = { tone: s[1], word: d.name, title: d.name, facts: [['DRIVER', d.name], ['CDL', d.cdl], ['MEDICAL CARD', d.med, exp ? 'EXPIRES IN 21 DAYS' : '']], rec: `driver:${d.id}`, next: exp ? ['ASK FOR THE NEW MEDICAL CARD', simBtn(`fl:drv:${d.id}`, { label: 'REQUEST NEW CARD', effect: 'ASKS THE CLIENT FOR THE NEW MEDICAL CERTIFICATE IN THEIR OFFICE.', apply: () => (WSX.over[`driver:${d.id}`] = ['NEW CARD REQUESTED', 'gold']), rec: `driver:${d.id}`, primary: true })] : ['CREDENTIALS CURRENT', '', 'calm'], hist: [['SEP 2', 'ASSIGNED TO THIS TRUCK']] };
  } else {
    const idle = vGroup(v) === 'ready';
    out.driver = { tone: idle ? 'warn' : 'mute', word: 'NO DRIVER', title: 'NO DRIVER ASSIGNED', facts: [['DRIVER', 'NONE ASSIGNED']], rec: `vehicle:${v.id}`, next: [idle ? 'READY TO RUN — NEEDS A DRIVER' : 'ASSIGN WHEN BACK IN SERVICE', simBtn(`fl:asg:${v.id}`, { label: 'ASSIGN DRIVER', effect: 'LINKS A DRIVER FROM DRIVERS & CARRIERS TO THIS TRUCK.', apply: () => {}, rec: `vehicle:${v.id}`, primary: idle })], hist: [] };
  }
  // insurance
  if (v.policy) {
    const p = POLICIES[v.policy];
    const s = ov(`policy:${p.id}`, p.status);
    out.insurance = { tone: s[1], word: p.days <= 30 ? `EXPIRES ${p.exp.replace(', 2026', '')}` : s[0], title: p.title, facts: [['COVERAGE', p.title], ['PLACED WITH', p.partner], ['EXPIRES', p.exp, daysWord(p.days)], ['OWNER', staffName(p.owner)]], rec: `policy:${p.id}`, next: p.days <= 7 && s[0] !== 'QUOTE SENT' ? ['SEND THE RENEWAL QUOTE TODAY', simBtn(`fl:pol:${p.id}`, { label: 'SEND QUOTE TO CLIENT', effect: 'SENDS THE RENEWAL SUMMARY TO THE CLIENT’S OFFICE. AIO NEVER BINDS COVERAGE.', apply: () => (WSX.over[`policy:${p.id}`] = ['QUOTE SENT', 'gold']), rec: `policy:${p.id}`, primary: true })] : ['COVERED', '', 'calm'], hist: [['YESTERDAY', 'RENEWAL OPTIONS RECEIVED']] };
  } else {
    const enrolled = c.lanes.includes('insurance');
    out.insurance = { tone: enrolled ? 'warn' : 'mute', word: enrolled ? 'NOT ON A POLICY' : 'OUTSIDE AIO', title: enrolled ? 'NOT ON A POLICY' : 'INSURED OUTSIDE AIO', facts: [['STATUS', enrolled ? 'NO POLICY LINKS THIS TRUCK' : 'THIS CLIENT DOES NOT USE AIO INSURANCE']], rec: `vehicle:${v.id}`, next: enrolled ? ['LINK THE TRUCK TO A POLICY', ''] : ['NO AIO ACTION', '', 'calm'], hist: [] };
  }
  // maintenance
  if (v.ticket) {
    const t = TICKETS[v.ticket];
    const s = ov(`ticket:${t.id}`, t.status);
    const n = s[0] === 'AWAITING CUSTOMER AUTHORIZATION' ? ['THE CLIENT MUST APPROVE THE ESTIMATE', simBtn(`fl:tk:${t.id}`, { label: 'REQUEST AUTHORIZATION', effect: 'SENDS THE REPAIR ESTIMATE TO THE CLIENT TO APPROVE.', apply: () => (WSX.over[`ticket:${t.id}`] = ['AUTHORIZATION REQUESTED', 'gold']), rec: `ticket:${t.id}`, primary: true })] : s[0] === 'AWAITING PARTS' ? ['ASK THE SHOP FOR A PARTS DATE', simBtn(`fl:tk:${t.id}`, { label: 'MESSAGE PROVIDER', effect: 'SENDS A NOTE TO THE PROVIDER ON THIS TICKET.', apply: () => {}, rec: `ticket:${t.id}`, primary: true })] : [`${s[0]} · ${PROVIDERS[t.provider].where}`, '', 'calm'];
    out.maintenance = { tone: s[1], word: s[0].replace('AWAITING CUSTOMER AUTHORIZATION', 'AWAITING APPROVAL'), title: t.issue, facts: [['TICKET', t.ref], ['ISSUE', t.issue], ['PROVIDER', PROVIDERS[t.provider].name.replace('SAMPLE PROVIDER · ', ''), PROVIDERS[t.provider].where], ['URGENCY', t.urgency]], rec: `ticket:${t.id}`, next: n, hist: [['3 HRS AGO', 'ESTIMATE UPLOADED'], ['OCT 6', 'TICKET OPENED']] };
  } else out.maintenance = { tone: 'ok', word: 'NO OPEN TICKET', title: 'NO OPEN TICKET', facts: [['ODOMETER', `${FLEET_META[v.id].odo} MI`, 'SAMPLE'], ['OPEN TICKETS', 'NONE']], rec: `vehicle:${v.id}`, next: ['NOTHING IN THE SHOP', '', 'calm'], hist: [] };
  // compliance
  const dues = vals(DUES).filter((d) => d.links.includes(`vehicle:${v.id}`) || (v.driver && d.links.includes(`driver:${v.driver}`)));
  if (dues.length) {
    const first = [...dues].sort((a, b) => a.days - b.days)[0];
    const tone = worst(dues.map((d) => ov(`deadline:${d.id}`, d.state)[1]));
    out.compliance = { tone, word: first.days <= 0 ? ov(`deadline:${first.id}`, first.state)[0] : `${dues.length} DUE · NEXT ${daysWord(first.days)}`, title: first.what, facts: dues.map((d) => [d.kind, d.what, `${d.due} · ${daysWord(d.days)}`]), rec: `deadline:${first.id}`, next: [first.what, `<button type="button" class="wbtn wbtn--gold" data-a="go" data-v="comp:${first.id}">${ico('shield-check')}OPEN IN COMPLIANCE</button>`], hist: [] };
  } else out.compliance = { tone: 'ok', word: 'NOTHING DUE', title: 'NOTHING DUE IN 90 DAYS', facts: [['NEXT 90 DAYS', 'NO DEADLINES']], rec: `vehicle:${v.id}`, next: ['NOTHING DUE', '', 'calm'], hist: [] };
  // ifta
  if (v.quarter) {
    const q = QUARTERS[v.quarter];
    const s = ov(`quarter:${q.id}`, q.bucket);
    out.ifta = { tone: s[1] === 'ok' ? 'ok' : s[1], word: `${q.q.split(' ')[0]} · ${s[0]}`, title: `IFTA ${q.q}`, facts: [['QUARTER', q.q], ['CLIENT MILES', q.miles, 'WHOLE FLEET, NOT THIS TRUCK'], ['DUE', q.due]], rec: `quarter:${q.id}`, next: s[0] === 'AWAITING CLIENT' ? ['RECEIPTS MISSING FOR THIS TRUCK', simBtn(`fl:ifta:${q.id}`, { label: 'REQUEST RECEIPTS', effect: 'ASKS THE CLIENT FOR THIS TRUCK’S FUEL RECEIPTS.', apply: () => {}, rec: `quarter:${q.id}`, primary: true })] : [q.next, '', 'calm'], hist: [] };
  } else out.ifta = { tone: 'mute', word: 'NOT IN IFTA', title: 'NOT IN AN IFTA QUARTER', facts: [['IFTA', 'NOT FILED BY AIO FOR THIS CLIENT']], rec: `vehicle:${v.id}`, next: ['NO AIO ACTION', '', 'calm'], hist: [] };
  // dispatch
  const blockReq = vals(REQUESTS).find((q) => q.vehicles.includes(v.id) && q.section === 'OPERATING AUTHORITIES' && ov(`request:${q.id}`, q.status)[1] === 'bad');
  const load = vals(LOADS).find((l) => l.vehicle === v.id && ov(`load:${l.id}`, l.status)[1] !== 'ok' && l.status[0] !== 'COMPLETE');
  if (blockReq) out.dispatch = { tone: 'bad', word: 'CANNOT DISPATCH', title: 'AUTHORITY INACTIVE', facts: [['WHY', blockReq.title], ['WAITING ON', blockReq.blocker]], rec: `request:${blockReq.id}`, next: ['THE MC AUTHORITY MUST BE REINSTATED', `<button type="button" class="wbtn wbtn--gold" data-a="go" data-v="client:${v.client}:permitting">${ico('company')}SEE IN CLIENT 360</button>`], hist: [['OCT 6', 'EIN LETTER REQUESTED FROM CLIENT']] };
  else if (load) {
    const s = ov(`load:${load.id}`, load.status);
    out.dispatch = { tone: s[1] === 'mute' ? 'gold' : s[1], word: `${load.ref} · ${s[0]}`, title: load.lane, facts: [['LOAD', load.ref], ['LANE', load.lane], ['PICKUP · DELIVERY', `${load.pickup} · ${load.delivery}`], ['DISPATCHER', staffName(load.owner)]], rec: `load:${load.id}`, next: s[0] === 'ISSUE' ? ['MOVE THE LOAD TO A WORKING TRUCK', simBtn(`fl:ld:${load.id}`, { label: 'REASSIGN TO UNIT 07', effect: 'MOVES LOAD 5517 TO UNIT 07 AFTER ITS CURRENT DELIVERY.', apply: () => (WSX.over[`load:${load.id}`] = ['REASSIGNED', 'gold']), rec: `load:${load.id}`, primary: true })] : [`DELIVERS ${load.delivery}`, '', 'calm'], hist: [[load.pickup, 'LOAD BOOKED']] };
  } else out.dispatch = { tone: vGroup(v) === 'ready' ? 'ok' : 'mute', word: vGroup(v) === 'ready' ? 'READY FOR A LOAD' : 'NOT ON A LOAD', title: 'NOT ON A LOAD', facts: [['DISPATCH', c.lanes.includes('dispatch') ? 'NO LOAD BOOKED' : 'THIS CLIENT DOES NOT USE AIO DISPATCH']], rec: `vehicle:${v.id}`, next: ['NO LOAD BOOKED', '', 'calm'], hist: [] };
  // documents
  const keys = [v.policy && `policy:${v.policy}`, v.request && `request:${v.request}`, v.ticket && `ticket:${v.ticket}`, v.driver && `driver:${v.driver}`, v.quarter && `quarter:${v.quarter}`, load && `load:${load.id}`].filter(Boolean);
  const docs = vals(DOCS).filter((d) => keys.includes(d.owner));
  const miss = docs.filter((d) => /REQUESTED/.test(d.status[0]));
  out.documents = { tone: miss.length ? 'warn' : docs.length ? 'ok' : 'mute', word: docs.length ? `${docs.length} ON FILE` : 'NONE', title: `${docs.length} DOCUMENTS`, docs, facts: [], rec: `vehicle:${v.id}`, next: ['ASK THE CLIENT FOR A DOCUMENT', simBtn(`fl:doc:${v.id}`, { label: 'REQUEST DOCUMENT', effect: 'ASKS THE CLIENT FOR A CAB CARD, INSPECTION REPORT OR TITLE.', apply: () => {}, rec: `vehicle:${v.id}` })], hist: [] };
  return out;
}

/* ── the blueprint: a side elevation drawn to a fixed scale, records tagged to the parts ── */
const BP = { w: 760, h: 330, tx: 140, ty: 66 };
const ANCHOR = {
  sleeper: { insurance: [96, 92], driver: [221, 46], documents: [304, 70], dispatch: [418, 144], registration: [22, 142], ifta: [210, 145], compliance: [221, 104], maintenance: [402, 172] },
  daycab: { insurance: [96, 92], driver: [221, 46], documents: [232, 112], dispatch: [362, 144], registration: [22, 142], ifta: [210, 145], compliance: [221, 104], maintenance: [346, 172] },
};
const TAGPOS = { insurance: [95, 40, 'top'], driver: [285, 40, 'top'], documents: [475, 40, 'top'], dispatch: [665, 40, 'top'], registration: [95, 296, 'bottom'], ifta: [285, 296, 'bottom'], compliance: [475, 296, 'bottom'], maintenance: [665, 296, 'bottom'] };
function truckShape(cab) {
  const sleeper = cab === 'sleeper';
  const end = sleeper ? 472 : 416;
  const axles = sleeper ? [70, 366, 434] : [70, 310, 378];
  const tire = (x) => `<circle cx="${x}" cy="172" r="30" class="t-tire"/><circle cx="${x}" cy="172" r="19" class="t-rim"/><circle cx="${x}" cy="172" r="5.5" class="t-hub"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + 12 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(172 + 12 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="1.6" class="t-lug"/>`).join('')}`;
  return `<ellipse cx="${end / 2 + 4}" cy="203" rx="${end / 2 + 18}" ry="6" class="t-shadow"/>
    <path d="M18 151 H${end}" class="t-l2"/><path d="M18 160 H${end}" class="t-l2"/>
    ${sleeper ? `<path d="M252 132 V24 C252 12 260 5 272 4 L352 2 C361 2 365 6 365 13 V132 Z" class="t-body"/><path d="M268 16 H352 M268 28 H352" class="t-l3"/><path d="M168 26 C196 10 226 4 254 6" class="t-l1"/><path d="M254 133 H365 V149 H254 Z" class="t-body"/>` : `<path d="M252 132 V22 H262 V132 Z" class="t-body"/>`}
    <path d="M150 132 V64 L170 24 L252 20 V132 Z" class="t-body"/>
    <path d="M150 132 V64 L64 74 C46 76 33 86 31 100 L29 132 Z" class="t-body"/>
    <path d="M9 128 H34 V160 H14 C11 160 9 158 9 155 Z" class="t-body"/>
    <path d="M156 62 L174 28 L196 27 L190 62 Z" class="t-glass"/>
    <rect x="198" y="30" width="46" height="98" rx="4" class="t-l1"/><path d="M202 34 H240 V60 H202 Z" class="t-glass"/>
    <path d="M160 60 L150 46" class="t-l1"/><rect x="143" y="32" width="8" height="17" rx="2" class="t-body"/>
    <path d="M33 97 L57 93 L57 104 L32 108 Z" class="t-glass"/><path d="M31 114 H45 M31 120 H45 M31 126 H45" class="t-l3"/>
    <rect x="174" y="134" width="72" height="25" rx="12.5" class="t-body"/><path d="M196 134 V159 M224 134 V159" class="t-l3"/>
    <path d="M246 138 H256 M246 148 H256" class="t-l3"/>
    <path d="M${axles[1] + 16} 142 H${axles[2] + 18} V148 H${axles[1] + 16} Z" class="t-body"/>
    <rect x="${end - 8}" y="151" width="6" height="44" rx="1" class="t-body"/>
    ${axles.map(tire).join('')}
    <path d="M9 226 H${end}" class="t-dim"/><path d="M9 220 V232 M${end} 220 V232 M${axles[0]} 222 V230 M${axles[2]} 222 V230" class="t-dim"/>`;
}
function blueprint(v, conns, sel, tags = true) {
  const meta = FLEET_META[v.id];
  const A = ANCHOR[meta.cab];
  const leaders = tags
    ? CONN.map(([k]) => {
        const [ax, ay] = A[k];
        const [tx, ty] = TAGPOS[k];
        const x1 = ax + BP.tx;
        const y1 = ay + BP.ty;
        const c = conns[k];
        const on = k === sel;
        return `<path d="M${x1} ${y1} L${tx} ${ty === 40 ? 44 : 292}" class="t-lead ${on ? 'is-on' : ''} t-lead--${c.tone}"/>${c.tone === 'bad' || c.tone === 'warn' ? `<circle cx="${x1}" cy="${y1}" r="5" class="t-ring t-ring--${c.tone} pulse"/>` : ''}<circle cx="${x1}" cy="${y1}" r="${on ? 5 : 3.6}" class="t-dot t-dot--${c.tone} ${on ? 'is-on' : ''}"/>`;
      }).join('')
    : '';
  const tagHtml = tags
    ? CONN.map(([k, label, icon]) => {
        const [tx, ty, side] = TAGPOS[k];
        const c = conns[k];
        return `<button type="button" class="fl-tag fl-tag--${side} fl-tag--${c.tone} ${k === sel ? 'is-on' : ''}" style="left:${((tx / BP.w) * 100).toFixed(2)}%;top:${(((side === 'top' ? 44 : 292) / BP.h) * 100).toFixed(2)}%" data-a="fl.sec" data-v="${k}"><span class="fl-tag__l">${ico(icon)}${label}</span><span class="fl-tag__w">${c.word}</span></button>`;
      }).join('')
    : '';
  return `<div class="fl-bpwrap"><div class="fl-bp ${tags ? '' : 'fl-bp--plain'}"><svg viewBox="0 0 ${BP.w} ${BP.h}" class="fl-svg" aria-label="${v.unit} side elevation" role="img"><g transform="translate(${BP.tx} ${BP.ty})">${truckShape(meta.cab)}</g>${leaders}</svg>${tagHtml}</div></div>`;
}

/* ── regions ── */
function fleetList() {
  const f = WSX.fleet;
  return vals(VEHICLES).filter((v) => {
    if (f.filter === 'action') return Object.values(fleetConns(v)).some((c) => c.tone === 'bad' || c.tone === 'warn');
    if (f.filter !== 'all' && vGroup(v) !== f.filter) return false;
    if (f.q && !`${v.unit} ${v.ymm} ${clientName(v.client)}`.includes(f.q.toUpperCase())) return false;
    return true;
  });
}
const GROUP_WORD = { ready: ['READY', 'ok'], road: ['ON THE ROAD', 'gold'], shop: ['IN THE SHOP', 'warn'], stop: ['STOPPED', 'bad'] };
function rosterRow(v, wide) {
  const conns = fleetConns(v);
  const g = GROUP_WORD[vGroup(v)];
  const dots = CONN.map(([k]) => `<i class="fl-fp__d fl-fp__d--${conns[k].tone}" title="${k}"></i>`).join('');
  return `<div class="pk fl-row ${v.id === WSX.fleet.unit ? 'is-sel' : ''}" data-a="fl.unit" data-v="${v.id}">
    <span class="fl-row__u">${v.unit.replace('UNIT ', '')}</span>
    <span class="fl-row__t"><b class="pk__t">${v.ymm.replace(/^\d{4} /, '')}</b><span class="pk__s">${clientName(v.client)}${wide && v.driver ? ` · ${DRIVERS[v.driver].name}` : ''}</span></span>
    <span class="fl-row__r">${sw(g)}<span class="fl-fp">${dots}</span></span>
  </div>`;
}
function fleetRoster(wide = false) {
  const list = fleetList();
  const f = WSX.fleet;
  const tools = `<label class="wfld fl-search">${ico('search')}<input id="fl-q" data-input="fl.q" value="${f.q}" placeholder="UNIT, MAKE, CLIENT" aria-label="Search trucks"></label>`;
  return rgn('THE YARD', `${list.length} OF 8`, '', `<div class="fl-rost__tools">${tools}${seg([['all', 'ALL'], ['action', 'NEEDS ACTION']], f.filter === 'action' ? 'action' : 'all', 'fl.filter')}</div>${list.map((v) => rosterRow(v, wide)).join('') || '<div class="grp">NO TRUCKS MATCH</div>'}`, 'fl-rost', 'fl-rost');
}
function fleetStage(v, conns, tags = true) {
  const g = GROUP_WORD[vGroup(v)];
  const s = vAvail(v);
  const meta = FLEET_META[v.id];
  return `<section class="fl-stage">
    <img class="fl-stage__img" src="./brand/ifta/plates/staff-hero.jpg" alt="">
    <div class="fl-stage__id">
      <div class="fl-stage__unit"><small>${v.ymm.split(' ')[0]} · ${meta.cab === 'sleeper' ? 'SLEEPER' : 'DAY CAB'} · VIN ${v.vin}</small><b>${v.unit}</b><span>${v.ymm.replace(/^\d{4} /, '')}</span></div>
      <div class="fl-stage__st"><span class="fl-big fl-big--${s[1]}">${s[0].replace(' · AUTHORITY INACTIVE', '')}</span><button type="button" class="fl-client" data-a="go" data-v="client:${v.client}">${badge(ACCOUNTS[v.client])}<span>${clientName(v.client)}</span>${ico('fwd')}</button></div>
      <dl class="fl-stage__ro"><div><dt>PLATE</dt><dd>${v.plate}</dd></div><div><dt>ODOMETER</dt><dd>${meta.odo} <small>SAMPLE</small></dd></div><div><dt>IN FLEET SINCE</dt><dd>${meta.since}</dd></div></dl>
    </div>
    ${blueprint(v, conns, WSX.fleet.sec, tags)}
  </section>`;
}
function fleetNext(v, conns, max = 3) {
  const items = CONN.map(([k, label, icon]) => ({ k, label, icon, c: conns[k] })).filter((x) => x.c.tone === 'bad' || x.c.tone === 'warn').sort((a, b) => TONE_RANK[a.c.tone] - TONE_RANK[b.c.tone]);
  const body = items.length
    ? items.slice(0, max).map((x) => `<div class="pk fl-nx ${x.k === WSX.fleet.sec ? 'is-sel' : ''}" data-a="fl.sec" data-v="${x.k}"><i class="fl-nx__bar fl-nx__bar--${x.c.tone}"></i><span class="fl-nx__ico">${ico(x.icon)}</span><span style="min-width:0"><b class="pk__t">${x.c.next[0]}</b><span class="pk__s">${x.label} · ${x.c.word}</span></span>${ico('fwd', 'chev')}</div>`).join('')
    : `<div class="fl-clear">${ico('pass')}<b>NOTHING NEEDS ACTION ON ${v.unit}</b></div>`;
  return rgn(`NEXT FOR ${v.unit}`, items.length ? `${items.length}` : '', '', body, 'fl-next');
}
function fleetContext(v, conns) {
  const k = WSX.fleet.sec;
  const c = conns[k];
  const [, label, icon] = CONN.find(([x]) => x === k);
  const tabs = `<div class="fl-ctabs">${CONN.map(([x, l, i]) => `<button type="button" class="fl-ctab ${x === k ? 'is-on' : ''}" data-a="fl.sec" data-v="${x}" title="${l}" aria-label="${l}">${ico(i)}<i class="pip pip--${conns[x].tone}"></i></button>`).join('')}</div>`;
  const body = k === 'documents'
    ? `${c.docs.length ? c.docs.map((d) => docChip(d.id)).join('') : ntb('NO DOCUMENTS LINKED TO THIS TRUCK YET')}${nextBlock(c.next[0], c.next[1], c.next[2])}`
    : `${nextBlock(c.next[0], c.next[1], c.next[2])}${facts(c.facts)}${c.hist.length || WSX.hist[c.rec] ? mhist(c.rec, c.hist) : ''}`;
  return `<section class="rg cx fl-cx"><header class="cx__h">${tabs}<div class="cx__crumb"><span>${v.unit}</span>${ico('fwd')}<span>${label}</span></div><h2 class="cx__t">${c.title}</h2>${sw([c.word, c.tone])}</header><div class="cx__b" data-keep="fl-cx">${body}</div></section>`;
}
function fleetBar() {
  const all = vals(VEHICLES);
  const n = (g) => all.filter((v) => vGroup(v) === g).length;
  const act = all.filter((v) => Object.values(fleetConns(v)).some((c) => c.tone === 'bad' || c.tone === 'warn')).length;
  const f = WSX.fleet.filter;
  const r = [ro(8, 'TRUCKS', { a: 'fl.filter', v: 'all', on: f === 'all' }), ro(n('ready'), 'READY', { a: 'fl.filter', v: 'ready', on: f === 'ready' }), ro(n('road'), 'ON THE ROAD', { a: 'fl.filter', v: 'road', on: f === 'road' }), ro(n('shop'), 'IN THE SHOP', { tone: 'warn', a: 'fl.filter', v: 'shop', on: f === 'shop' }), ro(n('stop'), 'STOPPED', { tone: 'bad', a: 'fl.filter', v: 'stop', on: f === 'stop' })];
  if (VP === 'mobile') return wsBar('04 · WORK', 'FLEET', [ro(8, 'TRUCKS'), ro(n('stop'), 'STOPPED', { tone: 'bad' }), ro(act, 'NEED ACTION', { tone: 'warn' })].join(''));
  return wsBar('04 · WORK', 'VEHICLES & FLEET', r.join(''), `<span class="design-pill">DESIGN PROOF</span>`);
}

/* ── compositions ── */
function fleetView() {
  const v = VEHICLES[WSX.fleet.unit];
  const conns = fleetConns(v);
  if (VP === 'mobile') {
    const strip = `<div class="fl-strip">${fleetList().map((u) => `<button type="button" class="fl-chip ${u.id === v.id ? 'is-sel' : ''}" data-a="fl.unit" data-v="${u.id}"><b>${u.unit.replace('UNIT ', '')}</b><i class="pip pip--${worst(Object.values(fleetConns(u)).map((c) => c.tone))}"></i></button>`).join('')}</div>`;
    const grid = `<div class="fl-cgrid">${CONN.map(([k, l, i]) => `<button type="button" class="fl-cg fl-cg--${conns[k].tone}" data-a="fl.open" data-v="${k}">${ico(i)}<span>${l}</span><small>${conns[k].word}</small></button>`).join('')}</div>`;
    return `<div class="ws fl fl--m">${fleetBar()}${strip}${fleetStage(v, conns, false)}${grid}${fleetNext(v, conns, 2)}</div>${phoneSheet(fleetContext(v, conns))}`;
  }
  if (VP === 'tablet') {
    const strip = `<div class="fl-strip fl-strip--t">${fleetList().map((u) => `<button type="button" class="fl-chip ${u.id === v.id ? 'is-sel' : ''}" data-a="fl.unit" data-v="${u.id}"><b>${u.unit.replace('UNIT ', '')}</b><span>${clientName(u.client)}</span><i class="pip pip--${worst(Object.values(fleetConns(u)).map((c) => c.tone))}"></i></button>`).join('')}</div>`;
    return `<div class="ws fl fl--t">${fleetBar()}${strip}${fleetStage(v, conns, true)}<div class="fl-t2">${fleetNext(v, conns, 3)}${fleetContext(v, conns)}</div></div>`;
  }
  return `<div class="ws fl">${fleetBar()}<div class="fl-grid">${fleetRoster(WIDE)}<div class="fl-mid">${fleetStage(v, conns, true)}${fleetNext(v, conns, WIDE ? 4 : 3)}</div>${fleetContext(v, conns)}</div></div>`;
}

/* ── actions ── */
ACT['fl.unit'] = (id) => {
  WSX.fleet.unit = id;
  const conns = fleetConns(VEHICLES[id]);
  const firstIssue = CONN.find(([k]) => conns[k].tone === 'bad') || CONN.find(([k]) => conns[k].tone === 'warn');
  WSX.fleet.sec = firstIssue ? firstIssue[0] : 'registration';
  WSX.pending = null;
};
ACT['fl.sec'] = (k) => {
  WSX.fleet.sec = k;
  WSX.pending = null;
};
ACT['fl.open'] = (k) => {
  WSX.fleet.sec = k;
  WSX.sheet = true;
  WSX.pending = null;
};
ACT['fl.filter'] = (f) => {
  WSX.fleet.filter = f;
  const list = fleetList();
  if (list.length && !list.some((v) => v.id === WSX.fleet.unit)) ACT['fl.unit'](list[0].id);
};
ACT['fl.q'] = (q) => {
  WSX.fleet.q = q;
};
