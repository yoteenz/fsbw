/*
 * 11 · MECHANIC / MAINTENANCE. Repair-centred: the shop board — every open work order on one repair line
 * (REPORTED → ESTIMATE → CUSTOMER AUTHORIZATION → PARTS → REPAIR → DONE), the selected work order as a sheet with its
 * one next step, the network of providers who do the work, and the trucks held in the shop. Providers own the repair;
 * AIO coordinates the ticket, the client's authorization and the truck's availability (FleetCare tickets).
 * Sections: TICKETS · REFERRALS · PROVIDERS · MAINTENANCE STATUS. Sample records; every change is SIMULATED.
 */
WSX.mx = { sec: 'tickets', ticket: 't-tk-2', prov: 'p-peach', unit: 'v-tk-09' };

const MX_SECS = [['tickets', 'TICKETS'], ['referrals', 'REFERRALS'], ['providers', 'PROVIDERS'], ['status', 'MAINTENANCE STATUS']];
const MX_STAGES = [
  ['reported', 'REPORTED', 'warning', 'REPORTED'],
  ['estimate', 'ESTIMATE', 'summary', 'ESTIMATE'],
  ['auth', 'APPROVAL', 'edit', 'CUSTOMER AUTHORIZATION'],
  ['parts', 'PARTS', 'setup', 'PARTS'],
  ['repair', 'REPAIR', 'wrench', 'REPAIR'],
  ['done', 'DONE', 'pass', 'BACK IN SERVICE'],
];
/** SAMPLE · shop details the FleetCare records do not carry (dates as on the Batch 1 ticket pages). */
const MX_META = {
  't-tk-2': { bay: 1, at: { reported: 'OCT 6', estimate: '3 HRS AGO' }, hist: [['3 HRS AGO', 'ESTIMATE UPLOADED BY THE PROVIDER'], ['OCT 6', 'TICKET OPENED · DEV PATEL']] },
  't-rl-1': { bay: 2, at: { reported: 'OCT 2', estimate: 'OCT 3', auth: 'OCT 3' }, hist: [['OCT 5', 'PARTS ON ORDER AT THE PROVIDER'], ['OCT 3', 'CLIENT AUTHORIZED THE REPAIR'], ['OCT 2', 'TICKET OPENED · DEV PATEL']] },
  't-abc-1': { bay: 3, routine: true, at: { reported: 'SEP 28' }, hist: [['OCT 1', 'SERVICE SCHEDULED WITH THE PROVIDER'], ['SEP 28', 'TICKET OPENED · DEV PATEL']] },
};
/** SAMPLE · where each provider and its trucks sit on the network map (longitude, latitude). */
const MX_GEO = { 'p-i35': [-96.8, 32.78, 'r'], 'p-peach': [-83.63, 32.84, 'lb'], 'p-gulf': [-82.46, 27.95, 'lb'] };
const MX_URG = { TODAY: 0, SOON: 1, ROUTINE: 2 };

const mxTickets = () => vals(TICKETS).sort((a, b) => (MX_URG[a.urgency] ?? 9) - (MX_URG[b.urgency] ?? 9));
const mxShort = (p) => p.name.replace('SAMPLE PROVIDER · ', '');
const mxVerify = (p) => ov(`provider:${p.id}`, p.verify);
const mxUnitNo = (v) => v.unit.replace('UNIT ', '');
const mxTicketOf = (vid) => vals(TICKETS).find((t) => t.vehicle === vid);
/** Where a work order stands on the repair line, in the data's own status words (and any simulated change). */
function mxState(t) {
  const s = ov(`ticket:${t.id}`, t.status);
  const idx = { 'AWAITING CUSTOMER AUTHORIZATION': 2, 'AUTHORIZATION REQUESTED': 2, AUTHORIZED: 3, 'AWAITING PARTS': 3, SCHEDULED: 4, 'IN REPAIR': 4, 'RETURNED TO SERVICE': 5 }[s[0]] ?? 0;
  const asked = s[0] === 'AUTHORIZATION REQUESTED';
  const word = { 'AWAITING CUSTOMER AUTHORIZATION': 'AWAITING APPROVAL', 'AUTHORIZATION REQUESTED': 'APPROVAL REQUESTED' }[s[0]] ?? s[0];
  const wait = idx === 2 ? (asked ? 'WITH THE CLIENT' : 'AIO TO REQUEST') : idx === 3 ? 'WITH THE SHOP' : idx === 4 ? 'BOOKED' : idx === 5 ? 'RETURNED' : 'OPEN';
  const back = idx === 2 ? 'WHEN THE CLIENT APPROVES' : idx === 3 ? 'WHEN THE PARTS ARRIVE' : idx === 4 ? 'AFTER THE SERVICE' : 'IN SERVICE';
  return { s, idx, asked, word, wait, back };
}
function mxApproval(t, st) {
  if (MX_META[t.id]?.routine) return ['ROUTINE SERVICE', 'mute'];
  if (st.asked) return ['REQUESTED · WAITING ON CLIENT', 'gold'];
  if (st.idx === 2) return ['NOT REQUESTED YET', 'warn'];
  if (st.idx > 2) return ['AUTHORIZED', 'ok'];
  return ['NOT YET', 'mute'];
}
/** The one next step for a work order: where the decision is, simulated where it changes anything. */
function mxNext(t, st = mxState(t)) {
  const c = ACCOUNTS[t.client];
  const p = PROVIDERS[t.provider];
  if (st.idx === 2 && !st.asked) return nextBlock(`${c.name} MUST APPROVE THE ESTIMATE`, simBtn(`mx:auth:${t.id}`, { label: 'REQUEST CUSTOMER AUTHORIZATION', effect: `SENDS THE REPAIR ESTIMATE TO ${c.name} TO APPROVE.`, apply: () => (WSX.over[`ticket:${t.id}`] = ['AUTHORIZATION REQUESTED', 'gold']), rec: `ticket:${t.id}`, primary: true }));
  if (st.idx === 2) return nextBlock(`WAITING ON ${c.name} TO APPROVE`, '', 'calm');
  if (st.idx === 3) return nextBlock('ASK THE SHOP FOR A PARTS DATE', simBtn(`mx:parts:${t.id}`, { label: 'MESSAGE PROVIDER', effect: `SENDS A NOTE TO ${mxShort(p)} ON THIS TICKET.`, apply: () => {}, rec: `ticket:${t.id}`, primary: true }));
  if (st.idx === 4 && mxVerify(p)[1] !== 'ok') return nextBlock('VERIFY THE PROVIDER BEFORE THE SERVICE', `<button type="button" class="wbtn wbtn--gold" data-a="mx.prov" data-v="${p.id}">${ico('shield-check')}REVIEW THE PROVIDER</button>`);
  if (st.idx === 4) return nextBlock(`SCHEDULED AT ${mxShort(p)}`, '', 'calm');
  if (st.idx === 5) return nextBlock('BACK IN SERVICE', '', 'done');
  return nextBlock('OPEN', '', 'calm');
}
/** What the repair holds up: the truck, a load on it, a compliance deadline — always three slots, honest when empty. */
function mxHeld(t) {
  const v = VEHICLES[t.vehicle];
  const a = vAvail(v);
  const load = vals(LOADS).find((l) => l.vehicle === v.id && ov(`load:${l.id}`, l.status)[1] === 'bad');
  const due = vals(DUES).find((d) => d.links.includes(`ticket:${t.id}`));
  return [
    { k: 'TRUCK', icon: 'truck', tone: a[1], t: `${v.unit} · ${a[0].split(' · ')[0]}`, s: v.ymm.replace(/^\d{4} /, ''), go: `fleet:${v.id}:maintenance`, to: 'FLEET' },
    load ? { k: 'DISPATCH', icon: 'pin', tone: 'bad', t: `${load.ref} · ${ov(`load:${load.id}`, load.status)[0]}`, s: load.lane, go: `fleet:${v.id}:dispatch`, to: 'FLEET' } : { k: 'DISPATCH', icon: 'pin', calm: 'NO LOAD WAITS ON IT' },
    due ? { k: 'COMPLIANCE', icon: 'shield-check', tone: ov(`deadline:${due.id}`, due.state)[1], t: ov(`deadline:${due.id}`, due.state)[0], s: due.what, go: `comp:${due.id}`, to: 'COMPLIANCE' } : { k: 'COMPLIANCE', icon: 'shield-check', calm: 'NO DEADLINE LINKED' },
  ];
}
const mxTruckSvg = (vid, cls = '') => `<svg viewBox="0 0 500 210" class="${cls}" aria-hidden="true">${truckShape(FLEET_META[vid].cab)}</svg>`;

/* ── TICKETS · the shop board ── */
function mxNode(t, st, i, sel) {
  const [key, , , full] = MX_STAGES[i];
  const m = MX_META[t.id];
  if (i < st.idx) {
    const skip = m.routine && i > 0;
    return `<span class="mx-n mx-n--done ${skip ? 'mx-n--skip' : ''}" title="${full} · ${skip ? 'ROUTINE' : 'DONE'}"><i class="mx-n__d">${skip ? '' : ico('pass')}</i><small>${skip ? 'ROUTINE' : m.at[key] ?? 'DONE'}</small></span>`;
  }
  if (i === st.idx) return `<span class="mx-n mx-n--now mx-n--${st.s[1]}" title="${full} · ${st.word}"><i class="mx-tok ${sel ? 'is-on' : ''}">${mxTruckSvg(t.vehicle)}<i class="pip pip--${st.s[1]}"></i></i><small>${st.wait}</small></span>`;
  return `<span class="mx-n mx-n--next" title="${full}"><i class="mx-n__d"></i></span>`;
}
/** Each step of the selected work order in words: what happened, or what has to happen (ultra-wide journey). */
function mxStep(t, st, i) {
  const m = MX_META[t.id];
  const c = ACCOUNTS[t.client];
  const p = mxShort(PROVIDERS[t.provider]);
  const v = VEHICLES[t.vehicle];
  const est = vals(DOCS).find((d) => d.owner === `ticket:${t.id}`);
  const done = i < st.idx;
  const now = i === st.idx;
  const skip = m.routine && i > 0 && i < 4;
  if (skip && done) return ['NOT NEEDED', 'ROUTINE SERVICE'];
  if (i === 0) return ['TICKET OPENED', `${m.at.reported} · DEV PATEL`];
  if (i === 1) return done ? [est ? 'ESTIMATE UPLOADED' : 'ESTIMATE RECEIVED', m.at.estimate ?? '—'] : now ? ['WAITING ON THE ESTIMATE', p] : ['THE SHOP QUOTES IT', p];
  if (i === 2) return done ? ['CLIENT AUTHORIZED', m.at.auth ?? '—'] : now ? (st.asked ? ['REQUESTED', `WAITING ON ${c.name}`] : ['NOT REQUESTED YET', 'AIO SENDS THE ESTIMATE']) : ['THE CLIENT APPROVES', c.name];
  if (i === 3) return done ? ['PARTS IN', '—'] : now ? ['PARTS ON ORDER', `AT ${p}`] : ['THE SHOP ORDERS PARTS', p];
  if (i === 4) return done ? ['REPAIRED', p] : now ? [st.s[0], `AT ${p}`] : ['THE SHOP REPAIRS IT', PROVIDERS[t.provider].where];
  return now || done ? ['BACK IN SERVICE', v.unit] : ['BACK IN SERVICE', 'AVAILABLE FOR DISPATCH'];
}
function mxJourney(t) {
  const st = mxState(t);
  return `<div class="mx-jy" data-swap="jy:${t.id}"><span class="mx-jy__l"><small>THE JOURNEY</small><b>${t.ref}</b><span>${VEHICLES[t.vehicle].unit} · ${clientName(t.client)}</span></span>${MX_STAGES.map(([, l, i], n) => {
    const [a, b] = mxStep(t, st, n);
    const k = n < st.idx ? 'done' : n === st.idx ? 'now' : 'next';
    return `<span class="mx-jc mx-jc--${k}"><small>${ico(i)}${l} · ${k === 'done' ? 'DONE' : k === 'now' ? 'NOW' : 'NEXT'}</small><b>${a}</b><span>${b}</span></span>`;
  }).join('')}</div>`;
}
function mxBoard() {
  const sel = TICKETS[WSX.mx.ticket];
  const sst = mxState(sel);
  const heads = MX_STAGES.map(([k, l, i], n) => `<span class="mx-head ${n === sst.idx ? 'is-on' : ''}">${ico(i)}<b>${l}</b></span>`).join('');
  const rows = mxTickets().map((t) => {
    const st = mxState(t);
    const v = VEHICLES[t.vehicle];
    const on = t.id === sel.id;
    return `<div class="mx-bay ${on ? 'is-sel' : ''}" data-a="mx.ticket" data-v="${t.id}" aria-pressed="${on}" aria-label="${t.ref} · ${v.unit} · ${st.word}">
      <span class="mx-bay__id"><small>BAY ${MX_META[t.id].bay} · ${t.urgency}</small><b>${mxUnitNo(v)}</b><span class="mx-bay__c"><em>${clientName(t.client)}</em>${sw([st.word, st.s[1]])}</span></span>
      <span class="mx-rail" style="--p:${st.idx}">${MX_STAGES.map((_, i) => mxNode(t, st, i, on)).join('')}</span>
    </div>`;
  }).join('');
  return `<div class="mx-line ${WIDE && VP === 'desktop' ? 'mx-line--j' : ''}" style="--i:${sst.idx}"><i class="mx-band" data-key="band" aria-hidden="true"></i><div class="mx-heads"><span class="mx-head mx-head--bay">BAY · UNIT</span>${heads}</div>${rows}${WIDE && VP === 'desktop' ? mxJourney(sel) : ''}</div>`;
}
function mxShopHead(t) {
  const st = mxState(t);
  const v = VEHICLES[t.vehicle];
  const c = ACCOUNTS[t.client];
  const p = PROVIDERS[t.provider];
  const pv = mxVerify(p);
  return `<header class="mx-shop__h" data-swap="h:${t.id}">
    <div class="mx-wo"><small>WORK ORDER · ${t.ref} · OPENED ${MX_META[t.id].at.reported}</small><b>${t.issue}</b>
      <span class="mx-wo__chips"><button type="button" class="fl-client" data-a="go" data-v="client:${c.id}:maintenance">${badge(c)}<span>${c.name}</span>${ico('fwd')}</button><button type="button" class="fl-client mx-chip" data-a="go" data-v="fleet:${v.id}:maintenance">${ico('truck')}<span>${v.unit}</span>${ico('fwd')}</button><button type="button" class="fl-client mx-chip" data-a="mx.prov" data-v="${p.id}" title="${mxShort(p)} · ${p.where} · ${pv[0]}">${ico('wrench')}<span>${mxShort(p)}</span><i class="pip pip--${pv[1]}"></i></button></span></div>
    <div class="mx-step"><small>STEP ${st.idx + 1} OF 6</small><span class="mx-step__n"><b>${st.idx + 1}</b><i>/6</i></span><span class="mx-step__l">${MX_STAGES[st.idx][3]}</span></div>
  </header>`;
}
function mxShop() {
  const t = TICKETS[WSX.mx.ticket];
  return `<section class="mx-shop">${mxShopHead(t)}${mxBoard()}</section>`;
}
function mxHold(t) {
  const tiles = mxHeld(t).map((h) => (h.calm
    ? `<div class="mx-hit mx-hit--calm"><span class="mx-hit__i">${ico(h.icon)}</span><span class="mx-hit__t"><span class="mx-hit__k"><small>${h.k}</small></span><b>${h.calm}</b><span>NOTHING ELSE WAITS</span></span></div>`
    : `<button type="button" class="mx-hit mx-hit--${h.tone}" data-a="go" data-v="${h.go}" title="${h.t} · ${h.s}"><span class="mx-hit__i">${ico(h.icon)}</span><span class="mx-hit__t"><span class="mx-hit__k"><small>${h.k}</small><em>${h.to}${ico('fwd')}</em></span><b>${h.t}</b><span>${h.s}</span></span></button>`)).join('');
  const n = mxHeld(t).filter((h) => !h.calm).length;
  return rgn('WHAT THIS REPAIR HOLDS UP', `${n}`, '', `<div class="mx-hits" data-swap="hold:${t.id}">${tiles}</div>`, 'mx-hold');
}
/** The work-order sheet: issue, urgency, truck, provider and verification, estimate, approval, history. */
function mxSheet(t, { held = false } = {}) {
  const st = mxState(t);
  const p = PROVIDERS[t.provider];
  const v = VEHICLES[t.vehicle];
  const c = ACCOUNTS[t.client];
  const m = MX_META[t.id];
  const est = vals(DOCS).find((d) => d.owner === `ticket:${t.id}`);
  const appr = mxApproval(t, st);
  const pv = mxVerify(p);
  const heldList = held ? `<div><div class="sec-l">HOLDS UP</div><div class="mx-hlist">${mxHeld(t).filter((h) => !h.calm).map((h) => `<button type="button" class="mx-hrow" data-a="go" data-v="${h.go}"><i class="pip pip--${h.tone}"></i><span><b>${h.t}</b><small>${h.k}</small></span>${ico('fwd')}</button>`).join('')}</div></div>` : '';
  const body = `${mxNext(t, st)}
    <div class="mx-meter" aria-label="Step ${st.idx + 1} of 6">${MX_STAGES.map(([, l], i) => `<i class="${i < st.idx ? 'd' : i === st.idx ? 'n' : ''}" title="${l}"></i>`).join('')}<span>STEP ${st.idx + 1} OF 6 · ${MX_STAGES[st.idx][3]}</span></div>
    ${facts([['URGENCY', t.urgency], ['VEHICLE', `<a data-a="go" data-v="fleet:${v.id}:maintenance">${v.unit} ${ico('fwd')}</a>`, v.ymm], ['PROVIDER', `${mxShort(p)}`, `${p.where} · ${pv[0]}`], ['CLIENT', `<a data-a="go" data-v="client:${c.id}:maintenance">${c.name} ${ico('fwd')}</a>`], ['APPROVAL', sw(appr)]])}
    <div><div class="sec-l">ESTIMATE</div>${est ? docChip(est.id) : ntb('NO ESTIMATE DOCUMENT ON FILE')}</div>
    ${heldList}
    ${mhist(`ticket:${t.id}`, m.hist)}
    ${ntb('<b>PROVIDERS OWN THE REPAIR.</b> AIO COORDINATES THE TICKET.')}`;
  return `<section class="rg cx mx-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${t.id}"><div class="cx__crumb"><span>TICKETS</span>${ico('fwd')}<span>BAY ${m.bay}</span>${ico('fwd')}<span>${t.ref}</span></div><h2 class="cx__t">${t.issue}</h2>${sw([st.s[0], st.s[1]])}</div></header><div class="cx__b" data-keep="mx-cx" data-swap="b:${t.id}">${body}</div></section>`;
}

/* ── PROVIDERS · the network ── */
const MX_MAP = { w: 900, h: 440 };
const mxXY = (lon, lat) => [20 + (lon + 104) * 31, 6 + (37 - lat) * 36.2];
const mxPts = (list) => list.map(([lon, lat]) => mxXY(lon, lat).map((n) => n.toFixed(1)).join(',')).join(' ');
const MX_COAST = [[-104, 24.6], [-97.2, 25.9], [-97.4, 27.8], [-96, 28.6], [-94.8, 29.3], [-93.8, 29.7], [-92, 29.6], [-90.6, 29.1], [-89.3, 29.2], [-89.6, 30.2], [-88, 30.4], [-87.2, 30.35], [-85.7, 30.1], [-85, 29.7], [-84, 30], [-83, 29.1], [-82.7, 27.9], [-82.2, 26.9], [-81.8, 26.1], [-81, 25.2], [-80.4, 25.2], [-80.1, 25.8], [-80, 26.7], [-80.6, 28.4], [-81.3, 29.9], [-81.4, 30.7], [-81.1, 31.9], [-79.9, 32.8], [-78.6, 33.8], [-77.9, 33.9], [-76.7, 34.7], [-75.5, 35.3], [-75.9, 36.9], [-75.9, 37.6], [-104, 37.6]];
const MX_HWY = [
  ['20', [[-96.8, 32.78], [-93.75, 32.52], [-90.18, 32.3], [-86.8, 33.52], [-84.39, 33.75], [-81.97, 33.47]], [-92, 32.42]],
  ['75', [[-84.39, 33.75], [-83.63, 32.84], [-83.28, 30.83], [-82.32, 29.65], [-82.46, 27.95], [-81.8, 26.2]], [-83.1, 31.6]],
  ['10', [[-98.49, 29.42], [-95.37, 29.76], [-91.15, 30.45], [-88.04, 30.69], [-84.28, 30.44], [-81.66, 30.33]], [-93.2, 30.4]],
  ['35', [[-97.52, 35.47], [-96.8, 32.78], [-97.74, 30.27], [-98.49, 29.42]], [-97.4, 34.3]],
  ['65', [[-86.78, 36.16], [-86.8, 33.52], [-88.04, 30.69]], [-86.5, 35]],
  ['95', [[-81.66, 30.33], [-81.02, 29.21], [-80.05, 26.71], [-80.19, 25.76]], [-80.3, 28.1]],
];
const MX_CITIES = [['OKLAHOMA CITY', -97.52, 35.47], ['SAN ANTONIO', -98.49, 29.42], ['NASHVILLE', -86.78, 36.16], ['ATLANTA', -84.39, 33.75], ['BIRMINGHAM', -86.8, 33.52], ['JACKSON', -90.18, 32.3], ['HOUSTON', -95.37, 29.76], ['JACKSONVILLE', -81.66, 30.33], ['MOBILE', -88.04, 30.69]];
const mxPct = (lon, lat) => {
  const [x, y] = mxXY(lon, lat);
  return `left:${((x / MX_MAP.w) * 100).toFixed(2)}%;top:${((y / MX_MAP.h) * 100).toFixed(2)}%`;
};
function mxMap(compact = false) {
  const sel = WSX.mx.prov;
  const grid = [];
  for (let lon = -102; lon <= -76; lon += 2) grid.push(`<path d="M${mxXY(lon, 37.6)[0].toFixed(1)} 0 V${MX_MAP.h}" class="mx-grat"/>`);
  for (let lat = 26; lat <= 36; lat += 2) grid.push(`<path d="M0 ${mxXY(-100, lat)[1].toFixed(1)} H${MX_MAP.w}" class="mx-grat"/>`);
  const svg = `<svg viewBox="0 0 ${MX_MAP.w} ${MX_MAP.h}" class="mx-map__svg" aria-hidden="true"><polygon points="${mxPts(MX_COAST)}" class="mx-land"/><polyline points="${mxPts(MX_COAST.slice(1, -1))}" class="mx-coast"/>${grid.join('')}${MX_HWY.map(([, pts]) => `<polyline points="${mxPts(pts)}" class="mx-hwy"/>`).join('')}${vals(PROVIDERS).map((p) => {
    const [lon, lat] = MX_GEO[p.id];
    const [x, y] = mxXY(lon, lat);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.id === sel ? 26 : 18}" class="mx-reach ${p.id === sel ? 'is-on' : ''}"/>`;
  }).join('')}</svg>`;
  const shields = compact ? '' : MX_HWY.map(([n, , at]) => `<span class="mx-shield" style="${mxPct(at[0], at[1])}">I-${n}</span>`).join('');
  const cities = MX_CITIES.filter(() => !compact).map(([c, lon, lat]) => `<span class="mx-city" style="${mxPct(lon, lat)}">${c}</span>`).join('');
  const pins = vals(PROVIDERS).map((p) => {
    const [lon, lat, side] = MX_GEO[p.id];
    const v = mxVerify(p);
    const units = vals(TICKETS).filter((t) => t.provider === p.id).map((t) => mxUnitNo(VEHICLES[t.vehicle]));
    const on = p.id === sel;
    return `<button type="button" class="mx-pin mx-pin--${side} mx-pin--${v[1]} ${on ? 'is-on' : ''}" style="${mxPct(lon, lat)}" data-a="mx.prov" data-v="${p.id}" aria-pressed="${on}" aria-label="${mxShort(p)} · ${p.where} · ${v[0]}"><i class="mx-pin__d"></i><span class="mx-pin__c"><b>${compact ? `${p.where.split(',')[0]} · ${units.map((u) => `UNIT ${u}`).join(' ')}` : mxShort(p)}</b>${compact ? '' : `<small>${p.where} · ${units.map((u) => `UNIT ${u}`).join(' ')}</small>${sw(v)}`}</span></button>`;
  }).join('');
  return `<div class="mx-mapwrap"><div class="mx-map ${compact ? 'mx-map--c' : ''}" role="group" aria-label="Provider network map">${svg}${shields}${cities}${pins}</div></div>`;
}
function mxNet() {
  const all = vals(PROVIDERS);
  const ok = all.filter((p) => mxVerify(p)[1] === 'ok').length;
  return `<section class="mx-shop mx-net"><header class="mx-shop__h mx-net__h"><div class="mx-wo"><small>THE NETWORK · SAMPLE PROVIDERS</small><b>WHO DOES THE WORK</b></div><div class="mx-net__ro">${ro(all.length, 'PROVIDERS')}${ro(ok, 'AIO VERIFIED')}${ro(all.length - ok, 'PENDING REVIEW', { tone: all.length - ok ? 'gold' : '' })}</div></header>${mxMap(VP === 'mobile')}</section>`;
}
function mxProvList(a = 'mx.prov', filter = null) {
  const list = vals(PROVIDERS).filter((p) => !filter || filter(p));
  return list.map((p) => {
    const v = mxVerify(p);
    const n = vals(TICKETS).filter((t) => t.provider === p.id).length;
    const on = p.id === WSX.mx.prov && WSX.mx.sec === 'providers';
    return `<div class="pk mx-prow ${on ? 'is-sel' : ''}" data-a="${a}" data-v="${p.id}" title="${mxShort(p)} · ${p.where}"><span class="mx-prow__i">${ico('wrench')}</span><span class="mx-prow__t"><b class="pk__t">${mxShort(p)}</b><span class="pk__s">${p.where} · ${n} OPEN TICKET${n === 1 ? '' : 'S'}</span></span>${sw(v)}</div>`;
  }).join('');
}
function mxProvSheet(p) {
  const v = mxVerify(p);
  const tks = vals(TICKETS).filter((t) => t.provider === p.id);
  const next = v[1] === 'ok'
    ? nextBlock('AIO VERIFIED · READY FOR REFERRALS', '', 'calm')
    : FOUNDER
      ? nextBlock('REVIEW THIS PROVIDER BEFORE THE SERVICE', simBtn(`mx:ver:${p.id}`, { label: 'MARK AIO VERIFIED', effect: `RECORDS ${mxShort(p)} AS AIO VERIFIED AFTER REVIEW.`, apply: () => (WSX.over[`provider:${p.id}`] = ['AIO VERIFIED', 'ok']), rec: `provider:${p.id}`, primary: true, founder: true }))
      : nextBlock('PENDING THE FOUNDER’S REVIEW', '', 'calm');
  const rows = tks.map((t) => {
    const st = mxState(t);
    return `<button type="button" class="mx-hrow" data-a="mx.ticket" data-v="${t.id}"><i class="pip pip--${st.s[1]}"></i><span><b>${t.ref} · ${VEHICLES[t.vehicle].unit}</b><small>${st.word}</small></span>${ico('fwd')}</button>`;
  }).join('');
  const body = `${next}${facts([['LOCATION', p.where], ['VERIFICATION', sw(v)], ['OPEN TICKETS', String(tks.length)], ['CLIENTS', [...new Set(tks.map((t) => clientName(t.client)))].join(' · ') || '—']])}
    <div><div class="sec-l">TICKETS WITH THIS PROVIDER</div><div class="mx-hlist">${rows || '<div class="grp">NONE OPEN</div>'}</div></div>
    ${WSX.hist[`provider:${p.id}`] ? mhist(`provider:${p.id}`, []) : ''}
    ${ntb(v[1] === 'ok' ? 'PROVIDERS OWN THE REPAIR. AIO COORDINATES.' : '<b>PENDING REVIEW.</b> FOUNDER VERIFIES NEW PROVIDERS.')}`;
  return `<section class="rg cx mx-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${p.id}"><div class="cx__crumb"><span>PROVIDERS</span>${ico('fwd')}<span>${p.where}</span></div><div class="mx-plate"><span class="mx-plate__i">${ico('wrench')}</span><span class="mx-plate__t"><small>SAMPLE PROVIDER · ${p.where}</small><b>${mxShort(p)}</b></span><span class="mx-plate__s">${sw(v)}</span></div></div></header><div class="cx__b" data-keep="mx-cx" data-swap="b:${p.id}">${body}</div></section>`;
}

/* ── MAINTENANCE STATUS · the trucks in the shop ── */
function mxBays() {
  const sel = WSX.mx.unit;
  const doors = mxTickets().map((t) => {
    const v = VEHICLES[t.vehicle];
    const st = mxState(t);
    const a = vAvail(v);
    const on = v.id === sel;
    return `<button type="button" class="mx-door ${on ? 'is-on' : ''}" data-a="mx.unit" data-v="${v.id}" aria-pressed="${on}" aria-label="${v.unit} · ${a[0]}"><span class="mx-door__top"><b>BAY ${MX_META[t.id].bay}</b><small>${mxShort(PROVIDERS[t.provider])}</small></span><span class="mx-door__in"><i class="mx-door__roll" aria-hidden="true"></i><span class="mx-door__wo"><b>${t.issue}</b><span class="mx-card__rail">${MX_STAGES.map((_, i) => `<i class="${i < st.idx ? 'd' : i === st.idx ? 'n' : ''}"></i>`).join('')}</span><small>STEP ${st.idx + 1} OF 6 · ${MX_STAGES[st.idx][3]}</small><span class="mx-door__fx"><span><small>APPROVAL</small><b>${mxApproval(t, st)[0]}</b></span><span><small>HOLDS UP</small><b>${mxHeld(t).slice(1).filter((h) => !h.calm).map((h) => h.t).join(' · ') || 'NOTHING ELSE'}</b></span></span></span>${mxTruckSvg(v.id)}</span><span class="mx-door__id"><b>${mxUnitNo(v)}</b><span><em>${clientName(v.client)}</em><span class="fl-big fl-big--${a[1]}">${a[0].split(' · ')[0]}</span></span></span><span class="mx-door__ft"><small>RETURNS</small>${st.back}</span></button>`;
  }).join('');
  return `<section class="mx-shop mx-bays"><header class="mx-shop__h"><div class="mx-wo"><small>MAINTENANCE STATUS · TRUCKS IN THE SHOP</small><b>${mxTickets().length} BAYS · ${mxTickets().filter((t) => vAvail(VEHICLES[t.vehicle])[1] === 'bad').length} TRUCKS DOWN</b></div></header><div class="mx-doors">${doors}</div></section>`;
}
function mxOutside() {
  const held = new Set(vals(TICKETS).map((t) => t.vehicle));
  const rest = vals(VEHICLES).filter((v) => !held.has(v.id));
  const chips = rest.map((v) => {
    const g = GROUP_WORD[vGroup(v)];
    return `<button type="button" class="mx-out" data-a="go" data-v="fleet:${v.id}" title="${v.unit} · ${clientName(v.client)} · ${g[0]}"><b>${mxUnitNo(v)}</b><span><small>${clientName(v.client)}</small>${sw(g)}</span></button>`;
  }).join('');
  return rgn('OUTSIDE THE SHOP', `${rest.length} TRUCKS`, '', `<div class="mx-outs">${chips}</div>`, 'mx-hold');
}
function mxUnitSheet(v) {
  const t = mxTicketOf(v.id);
  const a = vAvail(v);
  const conns = fleetConns(v);
  const st = mxState(t);
  const slab = `<div class="fl-slab fl-slab--mini mx-slab"><span class="mx-slab__h"><b>${v.unit} IN FLEET</b><small>EIGHT CONNECTIONS</small></span><div class="fl-cluster">${CONN.map(([k, l, i]) => `<button type="button" class="fl-cg fl-cg--${conns[k].tone}" data-a="go" data-v="fleet:${v.id}:${k}" aria-label="${l} · ${conns[k].word} — open in Fleet">${ico(i)}<span>${l}</span><small>${conns[k].tagW || conns[k].word}</small></button>`).join('')}</div></div>`;
  const body = `${mxNext(t, st)}${facts([['TICKET', `<a data-a="mx.ticket" data-v="${t.id}">${t.ref} ${ico('fwd')}</a>`, t.issue], ['RETURNS', st.back], ['PROVIDER', mxShort(PROVIDERS[t.provider]), PROVIDERS[t.provider].where]])}${slab}`;
  return `<section class="rg cx mx-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${v.id}"><div class="cx__crumb"><span>MAINTENANCE STATUS</span>${ico('fwd')}<span>BAY ${MX_META[t.id].bay}</span></div><h2 class="cx__t">${v.unit} · ${v.ymm.replace(/^\d{4} /, '')}</h2>${sw(a)}</div></header><div class="cx__b" data-keep="mx-cx" data-swap="b:${v.id}">${body}</div></section>`;
}

/* ── REFERRALS · none open; the path a referral takes ── */
function mxRef() {
  const node = (i, t, s) => `<span class="mx-rnode"><i>${ico(i)}</i><b>${t}</b><small>${s}</small></span>`;
  return `<section class="mx-shop mx-ref"><header class="mx-shop__h"><div class="mx-wo"><small>REFERRALS · CLIENT TO A NETWORK PROVIDER</small><b>NO OPEN REFERRALS</b></div></header>
    <div class="mx-rpath">${node('company', 'CLIENT', 'ASKS FOR A SHOP')}<i class="mx-rlink"></i>${node('people', 'AIO', 'MATCHES A PROVIDER')}<i class="mx-rlink"></i>${node('wrench', 'PROVIDER', 'OWNS THE WORK')}</div>
    <div class="mx-ghost"><span class="mx-ghost__h">A REFERRAL WOULD READ</span>${['CLIENT', 'PROVIDER', 'REASON', 'SENT', 'OUTCOME'].map((f) => `<span class="mx-ghost__r"><small>${f}</small><i></i></span>`).join('')}</div></section>`;
}
function mxRefSheet() {
  const ok = vals(PROVIDERS).filter((p) => mxVerify(p)[1] === 'ok');
  return `<section class="rg cx mx-cx"><header class="cx__h"><div class="cx__hd"><div class="cx__crumb"><span>MAINTENANCE</span>${ico('fwd')}<span>REFERRALS</span></div><h2 class="cx__t">NO OPEN REFERRALS</h2>${sw(['NOTHING OPEN', 'mute'])}</div></header><div class="cx__b" data-keep="mx-cx">${nextBlock('NOTHING TO FOLLOW UP', '', 'calm')}${facts([['OPEN', '0'], ['NETWORK', `${vals(PROVIDERS).length} PROVIDERS`, `${ok.length} AIO VERIFIED`]])}${ntb('A REFERRAL SENDS A CLIENT TO A PROVIDER, NO TICKET.')}</div></section>`;
}

/* ── bar and compositions ── */
function mxBar() {
  const ts = vals(TICKETS);
  const n = (f) => ts.filter((t) => f(mxState(t))).length;
  const down = ts.filter((t) => vAvail(VEHICLES[t.vehicle])[1] === 'bad').length;
  const ok = vals(PROVIDERS).filter((p) => mxVerify(p)[1] === 'ok').length;
  const sec = WSX.mx.sec;
  if (VP === 'mobile') return wsBar('11 · WORK', 'MAINTENANCE', [ro(ts.length, 'OPEN'), ro(n((s) => s.idx === 2), 'APPROVAL', { tone: 'warn' }), ro(down, 'DOWN', { tone: 'bad' })].join(''));
  const first = (f) => mxTickets().find((t) => f(mxState(t)))?.id ?? WSX.mx.ticket;
  const r = [ro(ts.length, 'OPEN TICKETS', { a: 'mx.sec', v: 'tickets', on: sec === 'tickets' }), ro(n((s) => s.idx === 2), 'NEED APPROVAL', { tone: 'warn', a: 'mx.ticket', v: first((s) => s.idx === 2) }), ro(n((s) => s.idx === 3), 'WAITING ON PARTS', { a: 'mx.ticket', v: first((s) => s.idx === 3) }), ro(down, 'TRUCKS DOWN', { tone: 'bad', a: 'mx.sec', v: 'status', on: sec === 'status' }), ro(`${ok}/${vals(PROVIDERS).length}`, 'PROVIDERS VERIFIED', { a: 'mx.sec', v: 'providers', on: sec === 'providers' })];
  return wsBar('11 · WORK', 'MECHANIC / MAINTENANCE', r.join(''));
}
function mxTop() {
  const n = { tickets: vals(TICKETS).length, providers: vals(PROVIDERS).length, status: vals(TICKETS).length, referrals: 0 };
  if (VP === 'mobile') return seg([['tickets', 'TICKETS'], ['referrals', 'REFERRALS', null, true], ['providers', 'PROVIDERS'], ['status', 'STATUS']], WSX.mx.sec, 'mx.sec', 'wseg--fit');
  return `<div class="mx-top">${seg(MX_SECS.map(([id, l]) => [id, l, n[id], id === 'referrals']), WSX.mx.sec, 'mx.sec')}<span class="mx-own">${ico('wrench')}FLEETCARE · PROVIDERS OWN THE REPAIR · AIO COORDINATES</span></div>`;
}
/** The section's stage, its lower region and its context panel, per device. */
function mxParts() {
  const { sec } = WSX.mx;
  if (sec === 'providers') {
    const p = PROVIDERS[WSX.mx.prov];
    return { stage: mxNet(), lower: rgn('THE NETWORK', `${vals(PROVIDERS).length}`, '', mxProvList(VP === 'mobile' ? 'mx.popen' : 'mx.prov'), 'mx-hold mx-plist', 'mx-plist'), panel: mxProvSheet(p), label: mxShort(p) };
  }
  if (sec === 'status') {
    const v = VEHICLES[WSX.mx.unit];
    return { stage: mxBays(), lower: mxOutside(), panel: mxUnitSheet(v), label: v.unit };
  }
  if (sec === 'referrals') return { stage: mxRef(), lower: rgn('WHERE A REFERRAL CAN GO', 'AIO VERIFIED', '', mxProvList('mx.prov', (p) => mxVerify(p)[1] === 'ok'), 'mx-hold mx-plist', 'mx-plist'), panel: mxRefSheet(), label: 'REFERRALS' };
  const t = TICKETS[WSX.mx.ticket];
  return { stage: mxShop(), lower: mxHold(t), panel: mxSheet(t, { held: VP === 'mobile' }), label: t.ref };
}
/** Phone: the bays as a list of work-order cards; the sheet opens in a drawer. */
function mxCards() {
  return `<div class="mx-cards">${mxTickets().map((t) => {
    const st = mxState(t);
    const v = VEHICLES[t.vehicle];
    const on = WSX.sheet && t.id === WSX.mx.ticket;
    return `<button type="button" class="mx-card ${on ? 'is-on' : ''}" data-a="mx.open" data-v="${t.id}" aria-label="${t.ref} · ${v.unit} · ${st.word}"><span class="mx-card__h"><small>BAY ${MX_META[t.id].bay} · ${t.ref} · ${t.urgency}</small>${sw([st.word, st.s[1]])}</span><span class="mx-card__id"><b>${mxUnitNo(v)}</b><span><em>${clientName(t.client)}</em><small>${t.issue}</small></span>${mxTruckSvg(v.id)}</span><span class="mx-card__rail">${MX_STAGES.map((_, i) => `<i class="${i < st.idx ? 'd' : i === st.idx ? 'n' : ''}"></i>`).join('')}</span><span class="mx-card__f"><b>STEP ${st.idx + 1} OF 6 · ${MX_STAGES[st.idx][3]}</b><small>${st.wait}</small></span></button>`;
  }).join('')}</div>`;
}
function mxBaysPhone() {
  return `<div class="mx-cards">${mxTickets().map((t) => {
    const v = VEHICLES[t.vehicle];
    const a = vAvail(v);
    const st = mxState(t);
    const on = WSX.sheet && v.id === WSX.mx.unit;
    return `<button type="button" class="mx-card ${on ? 'is-on' : ''}" data-a="mx.uopen" data-v="${v.id}"><span class="mx-card__h"><small>BAY ${MX_META[t.id].bay} · ${mxShort(PROVIDERS[t.provider])}</small>${sw([a[0].split(' · ')[0], a[1]])}</span><span class="mx-card__id"><b>${mxUnitNo(v)}</b><span><em>${clientName(v.client)}</em><small>RETURNS ${st.back}</small></span>${mxTruckSvg(v.id)}</span></button>`;
  }).join('')}</div>`;
}
function mechView() {
  const { sec } = WSX.mx;
  const P = mxParts();
  if (VP === 'mobile') {
    let main;
    if (sec === 'tickets') main = mxCards();
    else if (sec === 'status') main = `${mxBaysPhone()}${P.lower}`;
    else if (sec === 'providers') main = `${P.stage}${P.lower}`;
    else main = `${P.stage}${P.lower}`;
    const sheet = sec === 'referrals' ? '' : phoneSheet(P.panel, { label: P.label });
    return `<div class="ws mx mx--m">${mxBar()}${mxTop()}${main}</div>${sheet}`;
  }
  if (VP === 'tablet') return `<div class="ws mx mx--t mx--${sec}">${mxBar()}${mxTop()}${P.stage}<div class="mx-t2">${P.lower}${P.panel}</div></div>`;
  const extra = WIDE && sec === 'tickets' ? mxWideTruck(TICKETS[WSX.mx.ticket]) : '';
  return `<div class="ws mx mx--${sec}">${mxBar()}${mxTop()}<div class="mx-grid"><div class="mx-main">${P.stage}<div class="mx-low">${P.lower}${extra}</div></div>${P.panel}</div></div>`;
}
/** Ultra-wide: the truck under repair beside what it holds up — its eight connections one tap from Fleet. */
function mxWideTruck(t) {
  const v = VEHICLES[t.vehicle];
  const conns = fleetConns(v);
  return `<div class="fl-slab mx-wslab" data-swap="slab:${t.id}"><div class="cl-vstage">${mxTruckSvg(v.id)}<span>${sw(vAvail(v))}</span><b>${v.unit}</b></div><div class="fl-cluster">${CONN.map(([k, l, i]) => `<button type="button" class="fl-cg fl-cg--${conns[k].tone} ${k === 'maintenance' ? 'is-on' : ''}" data-a="go" data-v="fleet:${v.id}:${k}" aria-label="${l} · ${conns[k].word} — open in Fleet">${ico(i)}<span>${l}</span><small>${conns[k].tagW || conns[k].word}</small></button>`).join('')}</div></div>`;
}

/* ── actions ── */
ACT['mx.sec'] = (s) => {
  WSX.mx.sec = s;
  WSX.pending = null;
  WSX.sheet = false;
};
ACT['mx.ticket'] = (id) => {
  Object.assign(WSX.mx, { sec: 'tickets', ticket: id, unit: TICKETS[id].vehicle });
  WSX.pending = null;
  if (VP === 'mobile') WSX.sheet = true;
};
ACT['mx.open'] = (id) => {
  ACT['mx.ticket'](id);
  WSX.sheet = true;
};
ACT['mx.prov'] = (id) => {
  Object.assign(WSX.mx, { sec: 'providers', prov: id });
  WSX.pending = null;
  if (VP === 'mobile') WSX.sheet = true;
};
ACT['mx.popen'] = (id) => {
  ACT['mx.prov'](id);
  WSX.sheet = true;
};
ACT['mx.unit'] = (id) => {
  Object.assign(WSX.mx, { sec: 'status', unit: id });
  WSX.pending = null;
};
ACT['mx.uopen'] = (id) => {
  ACT['mx.unit'](id);
  WSX.sheet = true;
};

registerWorkspace({
  id: 'mech', no: '11', name: 'MECHANIC / MAINTENANCE', group: 'fleet', page: 'work', lane: 'maintenance', view: () => mechView(),
  shape: 'A REPAIR LINE', line: 'EVERY WORK ORDER, WHERE IT STANDS, WHAT MOVES IT.',
  states: [
    ['MAIN', []],
    ['SELECTED', [['mx.ticket', 't-rl-1']]],
    ['DEEPER', [['mx.ticket', 't-tk-2'], ['sim.ask', 'mx:auth:t-tk-2']]],
    ['PHONE', [['mx.ticket', 't-tk-2']], 'phone'],
  ],
  demos: [
    ['GET THE REPAIR APPROVED', [['mx.ticket', 't-tk-2', 'UNIT 09 · AWAITING APPROVAL'], ['sim.ask', 'mx:auth:t-tk-2', 'REQUEST CUSTOMER AUTHORIZATION'], ['sim.ok', 'mx:auth:t-tk-2', 'CONFIRM · SIMULATED'], ['go', 'fleet:v-tk-09:maintenance', 'FLEET SAYS THE SAME'], ['ret', '', 'BACK TO THE WORK ORDER']]],
    ['WALK THE SHOP', [['mx.ticket', 't-rl-1', 'UNIT 104 · WAITING ON PARTS'], ['mx.ticket', 't-abc-1', 'UNIT 2 · SCHEDULED'], ['mx.prov', 'p-gulf', 'ITS PROVIDER · PENDING REVIEW'], ['mx.sec', 'status', 'THE TRUCKS IN THE SHOP']]],
    ['THE NETWORK', [['mx.sec', 'providers', 'WHO DOES THE WORK'], ['mx.prov', 'p-i35', 'I-35 · DALLAS'], ['mx.prov', 'p-gulf', 'GULF COAST · PENDING REVIEW'], ['sim.ask', 'mx:ver:p-gulf', 'MARK AIO VERIFIED · FOUNDER']]],
  ],
  audit: [
    [['mx.ticket', 't-abc-1']],
    [['mx.sec', 'providers']],
    [['mx.prov', 'p-gulf']],
    [['mx.prov', 'p-gulf'], ['sim.ask', 'mx:ver:p-gulf']],
    [['mx.sec', 'status']],
    [['mx.unit', 'v-rl-104']],
    [['mx.sec', 'referrals']],
    [['mx.ticket', 't-tk-2'], ['sim.ask', 'mx:auth:t-tk-2'], ['sim.ok', 'mx:auth:t-tk-2']],
    [['mx.ticket', 't-rl-1'], ['sim.ask', 'mx:parts:t-rl-1']],
  ],
  phoneAct: { 'mx.ticket': 'mx.open', 'mx.prov': 'mx.popen', 'mx.unit': 'mx.uopen' },
  enter: (a, b) => {
    if (TICKETS[a]) Object.assign(WSX.mx, { sec: 'tickets', ticket: a, unit: TICKETS[a].vehicle });
    else if (VEHICLES[a] && mxTicketOf(a)) Object.assign(WSX.mx, { sec: b === 'status' ? 'status' : 'tickets', ticket: mxTicketOf(a).id, unit: a });
    else if (PROVIDERS[a]) Object.assign(WSX.mx, { sec: 'providers', prov: a });
    else if (MX_SECS.some(([s]) => s === a)) WSX.mx.sec = a;
  },
  label: () => (WSX.mx.sec === 'tickets' ? TICKETS[WSX.mx.ticket].ref : WSX.mx.sec === 'providers' ? mxShort(PROVIDERS[WSX.mx.prov]) : WSX.mx.sec === 'status' ? VEHICLES[WSX.mx.unit].unit : 'MAINTENANCE'),
  route: (s) => {
    if (s[0] === 'work' && s[1] === 'maintenance') {
      const sec = { tickets: 'tickets', referrals: 'referrals', providers: 'providers', status: 'status', maintenance_status: 'status' }[s[2]];
      if (sec) WSX.mx.sec = sec;
      return true;
    }
    if (s[0] === 'rec' && s[1] === 'ticket' && TICKETS[s[2]]) return Object.assign(WSX.mx, { sec: 'tickets', ticket: s[2], unit: TICKETS[s[2]].vehicle }), true;
    return false;
  },
});
