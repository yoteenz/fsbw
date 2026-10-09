/*
 * 05 · DISPATCH. Load-centered: the board (loads by state — or by truck, client, exception, owner) · the selected load
 * drawn as a route on a dark stage (origin → destination, position by schedule; no live tracking) · the load panel with
 * its truck, driver, papers, exception and the one next step. The live catalog has DISPATCHING ACTIVE as manual load
 * entry without a load board. Only T&K TRANSPORT uses AIO dispatch in the sample records; nothing is added for others.
 */
WSX.dp = { load: 'ld-5517', view: 'loads', state: 'ISSUE' };

const DP_COLS = [['BOOKED', 'BOOKED', 'mute'], ['MOVING', 'MOVING', 'gold'], ['DELIVERED', 'DELIVERED', 'ok'], ['ISSUE', 'ISSUE', 'bad']];
const DP_VIEWS = [['loads', 'LOADS'], ['trucks', 'TRUCKS'], ['clients', 'ACTIVE CLIENTS'], ['exceptions', 'STATUS / EXCEPTIONS'], ['mine', 'MY LOADS / MY TRUCKS']];
const DP_MON = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
/** 'OCT 7' → a sortable day number (the sample loads are all in the same autumn). */
const dpDay = (d) => {
  const m = /^([A-Z]{3}) (\d{1,2})/.exec(d || '');
  return m ? DP_MON[m[1]] * 31 + Number(m[2]) : null;
};
const DP_TODAY = dpDay('OCT 8');
/** Where the sample cities are (degrees). Used only to name the direction of travel — the route itself is a schematic. */
const DP_CITY = {
  'ATLANTA, GA': [33.75, -84.39], 'DALLAS, TX': [32.78, -96.8], 'MEMPHIS, TN': [35.15, -90.05], 'SAVANNAH, GA': [32.08, -81.09],
  'CHARLOTTE, NC': [35.23, -80.84], 'MACON, GA': [32.84, -83.63], 'BIRMINGHAM, AL': [33.52, -86.8], 'JACKSONVILLE, FL': [30.33, -81.66],
};
/** Sample history for each load: only what the records already say (pickup, delivery, uploads, the exception). */
const DP_HIST = {
  'ld-5520': [['OCT 7', 'PICKED UP · ATLANTA, GA']],
  'ld-5521': [],
  'ld-5518': [['3 HRS AGO', 'BILL OF LADING UPLOADED'], ['OCT 4', 'DELIVERED · CHARLOTTE, NC'], ['OCT 3', 'PICKED UP · SAVANNAH, GA']],
  'ld-5517': [['OCT 6', 'TRUCK PLACED OUT OF SERVICE AT PICKUP']],
  'ld-5501': [['OCT 1', 'DELIVERED · ATLANTA, GA'], ['SEP 30', 'PICKED UP · JACKSONVILLE, FL']],
};

/* ── the load, as it stands this visit (simulated changes ride on WSX.over; Fleet reads the same load status) ── */
const dpLoads = () => vals(LOADS);
const dpSt = (l) => ov(`load:${l.id}`, l.status);
const dpCol = (l) => ov(`dpcol:${l.id}`, l.col);
const dpVeh = (l) => ov(`dpveh:${l.id}`, l.vehicle);
const dpDrv = (l) => ov(`dpdrv:${l.id}`, l.driver);
const dpExc = (l) => ov(`dpexc:${l.id}`, l.exception);
const dpEnds = (l) => l.lane.split(' → ');
const dpTown = (c) => c.split(',')[0];
const dpByCol = (c) => dpLoads().filter((l) => dpCol(l) === c);
const dpTone = (l) => (dpCol(l) === 'ISSUE' ? 'bad' : dpSt(l)[1]);
const dpExceptions = () => dpLoads().filter((l) => dpExc(l) || ['bad', 'warn'].includes(dpSt(l)[1]));
const dpShort = (name) => name.split(' ').map((w, i, a) => (i < a.length - 1 ? `${w[0]}.` : w)).join(' ');
const dpRef = (l) => l.ref.replace('LOAD ', '');
const dpTrucks = () => vals(VEHICLES).filter((v) => v.client === 'c-tk');
const dpAct = () => (VP === 'mobile' ? 'dp.open' : 'dp.load');
/** A truck's loads in the order it runs them (a load moved onto it this visit runs after its current work). */
const dpTruckLoads = (vid) => dpLoads().filter((l) => dpVeh(l) === vid).sort((a, b) => (WSX.over[`dpveh:${a.id}`] ? 1 : 0) - (WSX.over[`dpveh:${b.id}`] ? 1 : 0) || dpDay(a.pickup) - dpDay(b.pickup));
function dpHeading(from, to) {
  const a = DP_CITY[from];
  const b = DP_CITY[to];
  if (!a || !b) return null;
  const dx = (b[1] - a[1]) * Math.cos((((a[0] + b[0]) / 2) * Math.PI) / 180);
  const dy = b[0] - a[0];
  return { deg: (Math.atan2(dx, dy) * 180) / Math.PI, word: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'EASTBOUND' : 'WESTBOUND') : dy > 0 ? 'NORTHBOUND' : 'SOUTHBOUND' };
}
const dpNeedle = (deg) => `<svg class="dp-needle" viewBox="0 0 16 16" aria-hidden="true"><g transform="rotate(${deg.toFixed(0)} 8 8)"><path d="M8 1.5 11.6 12 8 10 4.4 12Z"/></g></svg>`;
/** Where the load is on its lane by the schedule (0 at pickup, 1 at delivery). Never a GPS position. */
function dpProgress(l) {
  const col = dpCol(l);
  if (col === 'DELIVERED') return 1;
  if (col !== 'MOVING') return 0;
  const a = dpDay(l.pickup);
  const b = dpDay(l.delivery);
  return b > a ? Math.min(0.88, Math.max(0.12, (DP_TODAY - a) / (b - a))) : 0.5;
}
const dpPod = (l) => /PROOF OF DELIVERY/.test(l.exception || '');

/* ── the board ── */
/** A load card: the lane as a route (origin above destination), its dates, truck and driver, the sample rate. */
function dpCard(l, { flow = false, slim = false } = {}) {
  const st = dpSt(l);
  const [o, d] = dpEnds(l);
  const v = VEHICLES[dpVeh(l)];
  const drv = DRIVERS[dpDrv(l)];
  const sel = l.id === WSX.dp.load;
  const exc = dpExc(l);
  const p = dpProgress(l);
  const rt = `<span class="dp-rt ${p > 0 ? 'dp-rt--go' : ''} ${p >= 1 ? 'dp-rt--in' : ''}" style="--p:${p}"><span class="dp-rt__s"><i></i><b>${flow ? dpTown(o) : o}</b>${flow ? '' : `<small>${l.pickup}</small>`}</span><span class="dp-rt__s dp-rt__s--d"><i></i><b>${flow ? dpTown(d) : d}</b>${flow ? '' : `<small>${l.delivery}</small>`}</span></span>`;
  // in a truck's lane the truck is the row: the card keeps the load, its lane and its state
  // a finished load steps back: one line, still a click away
  if (slim) return `<div class="pk dp-card dp-card--slim dp-card--${dpTone(l)} ${sel ? 'is-sel' : ''}" data-a="${dpAct()}" data-v="${l.id}" title="${l.ref} · ${l.lane} · ${st[0]}" aria-pressed="${sel}"><span class="dp-card__h"><b>${dpRef(l)}</b>${sw(st)}</span><span class="dp-card__to">${dpTown(o)} → ${dpTown(d)}</span></div>`;
  if (flow) return `<div class="pk dp-card dp-card--flow dp-card--${dpTone(l)} ${sel ? 'is-sel' : ''}" data-a="${dpAct()}" data-v="${l.id}" title="${l.ref} · ${l.lane} · ${l.pickup} → ${l.delivery}" aria-pressed="${sel}"><span class="dp-card__h"><b>${dpRef(l)}</b><small>${l.pickup}</small></span>${rt}${sw(st)}</div>`;
  return `<div class="pk dp-card dp-card--${dpTone(l)} ${sel ? 'is-sel' : ''}" data-a="${dpAct()}" data-v="${l.id}" title="${l.ref} · ${l.lane}" aria-pressed="${sel}">
    <span class="dp-card__h"><b>${dpRef(l)}</b>${sw(st)}</span>
    ${rt}
    <span class="dp-card__f"><span>${v ? v.unit : 'NO TRUCK'} · ${drv ? dpShort(drv.name) : 'NO DRIVER'}</span><em>${l.rate}</em></span>
    ${exc && dpCol(l) === 'ISSUE' ? `<span class="dp-card__x">${ico('warning')}<span>${exc.split(' — ')[0].replace('TRUCK PLACED ', '')}</span></span>` : ''}
  </div>`;
}
/** A load as a token, for rows that group loads (by client, by owner, on schedule). */
const dpChip = (l, short = false) => {
  const [o, d] = dpEnds(l);
  return `<button type="button" class="dp-chip dp-chip--${dpTone(l)} ${l.id === WSX.dp.load ? 'is-sel' : ''}" data-a="${dpAct()}" data-v="${l.id}" title="${l.ref} · ${l.lane} · ${dpSt(l)[0]}"><i class="pip pip--${dpTone(l)}"></i><b>${dpRef(l)}</b><span>${short ? dpTown(d) : `${dpTown(o)} → ${dpTown(d)}`}</span></button>`;
};
/** What each column adds up to — read from the loads in it, never a figure of its own. */
function dpColFoot(c, list) {
  const first = (k) => [...list].sort((a, b) => dpDay(a[k]) - dpDay(b[k]))[0];
  if (c === 'BOOKED') return list.length ? `NEXT PICKUP · ${first('pickup').pickup}` : 'NOTHING BOOKED';
  if (c === 'MOVING') return list.length ? `NEXT DELIVERY · ${first('delivery').delivery}` : 'NOTHING ON THE ROAD';
  if (c === 'DELIVERED') {
    const n = list.filter((l) => dpPod(l) && dpSt(l)[0] !== 'POD REQUESTED').length;
    return n ? `${n} PROOF OF DELIVERY MISSING` : 'PAPERS IN ORDER';
  }
  return list.length ? `${list.length} NEED${list.length === 1 ? 'S' : ''} A DECISION` : 'NO EXCEPTIONS';
}
function dpBoardStates() {
  const add = `<div class="dp-add">${simBtn('dp:new', { label: 'ENTER A LOAD BY HAND', effect: 'OPENS MANUAL LOAD ENTRY FOR T&K TRANSPORT. NO LOAD BOARD FEEDS AIO.', rec: 'dp:board', apply: () => {}, sm: true })}</div>`;
  return `<div class="dp-cols">${DP_COLS.map(([c, label, tone]) => {
    const list = dpByCol(c);
    return `<div class="dp-col dp-col--${tone}"><header class="dp-col__h"><i class="pip pip--${tone}"></i><b>${label}</b><span>${list.length}</span></header><div class="dp-col__b" data-keep="dp-col-${c}">${list.map((l) => dpCard(l, { slim: /COMPLETE/.test(dpSt(l)[0]) })).join('') || '<span class="dp-col__none">NO LOADS</span>'}${c === 'BOOKED' && VP !== 'mobile' ? add : ''}</div><footer class="dp-col__f">${dpColFoot(c, list)}</footer></div>`;
  }).join('')}</div>`;
}
function dpBoardTrucks() {
  const rows = dpTrucks().map((v) => {
    const s = vAvail(v);
    const list = dpTruckLoads(v.id);
    const t = v.ticket ? TICKETS[v.ticket] : null;
    const note = t ? `<span class="dp-lane__note">${ico('wrench')}<b>${t.ref}</b><span>${ov(`ticket:${t.id}`, t.status)[0].replace('AWAITING CUSTOMER AUTHORIZATION', 'AWAITING APPROVAL')}</span></span>` : '';
    return `<div class="dp-lane"><button type="button" class="dp-lane__trk dp-lane__trk--${s[1]}" data-a="go" data-v="fleet:${v.id}:dispatch" title="${v.unit} · ${v.ymm} — OPEN IN FLEET"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><b>${v.unit}</b>${sw([s[0].split(' · ')[0], s[1]])}</button><div class="dp-lane__l" data-keep="dp-lane-${v.id}">${list.map((l, i) => `${i ? `<i class="dp-lane__j" aria-hidden="true">${ico('fwd')}</i>` : ''}${dpCard(l, { flow: true })}`).join('')}${note}</div></div>`;
  }).join('');
  const more = ACCOUNTS['c-tk'].trucks - dpTrucks().length;
  return `<div class="dp-lanes"><div class="dp-lanes__h"><span>TRUCK</span><span>ITS LOADS · IN THE ORDER IT RUNS THEM</span><span>${more} MORE T&K TRUCKS ARE NOT ON FILE IN THIS SAMPLE</span></div>${rows}</div>`;
}
function dpBoardClients() {
  const c = ACCOUNTS['c-tk'];
  const mine = dpLoads().filter((l) => l.client === c.id);
  const tally = DP_COLS.map(([col, label, tone]) => {
    const n = mine.filter((l) => dpCol(l) === col).length;
    const first = mine.find((l) => dpCol(l) === col);
    return n ? `<button type="button" class="dp-tally__s dp-tally__s--${tone} ${first && WSX.dp.state === col ? 'is-on' : ''}" style="flex:${n}" data-a="dp.state" data-v="${col}"><b>${n}</b>${label}</button>` : '';
  }).join('');
  const others = vals(ACCOUNTS).filter((x) => !x.lanes.includes('dispatch'));
  const trucks = dpTrucks().length;
  return `<div class="dp-clients"><div class="dp-client"><span class="dp-client__b">${badge(c)}</span><span class="dp-client__t"><small>${c.dot} · ${c.mc} · ${c.state}</small><b>${c.name}</b><span>${sw(LIFE[c.life])}<em>${c.contact}</em></span></span>
      <div class="dp-client__ro">${ro(mine.length, 'LOADS')}${ro(`${trucks}/${c.trucks}`, 'TRUCKS ON FILE')}${ro(new Set(mine.map((l) => l.driver).filter(Boolean)).size, 'DRIVER')}</div>
      <button type="button" class="wbtn wbtn--sm" data-a="go" data-v="client:${c.id}:dispatch">${ico('company')}CLIENT 360</button>
      <div class="dp-tally">${tally}</div></div>
    <div class="dp-others"><div class="sec-l"><span>NOT ON AIO DISPATCH · ${others.length}</span><span>ONLY T&K USES DISPATCH IN THIS SAMPLE</span></div><div class="dp-others__l">${others.map((x) => `<span class="dp-other" title="${x.name} · DISPATCH NOT USED">${badge(x)}<b>${x.name}</b></span>`).join('')}</div></div></div>`;
}
function dpBoardExceptions() {
  const exc = dpExceptions().sort((a, b) => TONE_RANK[dpTone(a)] - TONE_RANK[dpTone(b)]);
  const calm = dpLoads().filter((l) => !exc.includes(l));
  const cards = exc.map((l) => {
    const [o, d] = dpEnds(l);
    const v = VEHICLES[dpVeh(l)];
    const sel = l.id === WSX.dp.load;
    const text = dpExc(l) || dpSt(l)[0];
    const next = l.id === 'ld-5517' ? 'MOVE THE LOAD TO A WORKING TRUCK' : dpPod(l) ? 'REQUEST PROOF OF DELIVERY' : '';
    const drv = DRIVERS[dpDrv(l)];
    const sub = vals(SUBMISSIONS).find((x) => x.load === l.id);
    const rows = [['TRUCK', v ? `${v.unit} · ${vAvail(v)[0].split(' · ')[0]}` : 'NONE'], ['DRIVER', drv ? drv.name : 'NONE'], sub ? ['FACTORING', `${sub.ref.replace('SUBMISSION', 'SUB.')} · WAITING`] : ['SINCE', l.pickup]];
    const fx2 = `<dl class="dp-ex__fx">${rows.map(([k, x]) => `<div><dt>${k}</dt><dd>${x}</dd></div>`).join('')}</dl>`;
    return `<div class="pk dp-ex dp-ex--${dpTone(l)} ${sel ? 'is-sel' : ''}" data-a="${dpAct()}" data-v="${l.id}" title="${l.ref} · ${text}" aria-pressed="${sel}"><span class="dp-ex__h"><b>${l.ref}</b>${sw(dpSt(l))}</span><span class="dp-ex__t">${text.split(' — ')[0]}</span><span class="dp-ex__w">${text.split(' — ')[1] ?? ''}</span>${fx2}${next ? `<span class="dp-ex__n"><small>NEXT</small>${next}${ico('fwd')}</span>` : ''}<span class="dp-ex__f">${dpTown(o)} → ${dpTown(d)} · ${v ? v.unit : 'NO TRUCK'} · ${l.delivery}</span></div>`;
  }).join('');
  return `<div class="dp-exs">${cards || '<div class="dp-col__none">NO EXCEPTIONS</div>'}<div class="dp-calm"><div class="sec-l"><span>ON SCHEDULE · ${calm.length}</span></div><div class="dp-calm__l">${calm.map((x) => dpChip(x)).join('')}</div></div></div>`;
}
function dpBoardMine() {
  const owners = ['s-alex', ...new Set(dpLoads().map((l) => l.owner))].filter((x, i, a) => a.indexOf(x) === i);
  const head = `<div class="dp-own__h"><span>WHO</span>${DP_COLS.map(([, label, tone]) => `<span><i class="pip pip--${tone}"></i>${label}</span>`).join('')}<span>TRUCKS</span></div>`;
  return `<div class="dp-own">${head}${owners.map((sid) => {
    const list = dpLoads().filter((l) => l.owner === sid);
    const trucks = [...new Set(list.map((l) => dpVeh(l)).filter(Boolean))];
    const you = sid === 's-alex';
    const who = `<span class="dp-own__who">${av(sid)}<span><b>${you ? 'YOU' : STAFF[sid].name}</b><small>${you ? `${STAFF[sid].name} · ` : ''}${list.length} LOAD${list.length === 1 ? '' : 'S'}</small></span></span>`;
    if (!list.length) return `<div class="dp-own__r dp-own__r--you">${who}<span class="dp-own__none">NOTHING IN DISPATCH IS ASSIGNED TO YOU</span></div>`;
    const cells = DP_COLS.map(([c]) => `<div class="dp-own__c">${list.filter((l) => dpCol(l) === c).map((l) => dpChip(l, true)).join('') || '<span class="dp-own__dash">—</span>'}</div>`).join('');
    return `<div class="dp-own__r">${who}${cells}<div class="dp-own__c">${trucks.map((vid) => `<button type="button" class="dp-chip dp-chip--trk" data-a="go" data-v="fleet:${vid}:dispatch" title="${VEHICLES[vid].unit} — OPEN IN FLEET">${ico('truck')}<b>${VEHICLES[vid].unit}</b></button>`).join('')}</div></div>`;
  }).join('')}<div class="dp-own__r dp-own__r--you dp-own__r--none"><span class="dp-own__who"><span class="dp-own__q">${ico('people')}</span><span><b>NO DISPATCHER</b><small>${dpLoads().filter((l) => !l.owner).length} LOADS</small></span></span><span class="dp-own__none dp-own__none--ok">${ico('pass')}EVERY LOAD HAS A DISPATCHER</span></div></div>`;
}
function dpBoard() {
  const v = WSX.dp.view;
  const body = { loads: dpBoardStates, trucks: dpBoardTrucks, clients: dpBoardClients, exceptions: dpBoardExceptions, mine: dpBoardMine }[v]();
  return `<section class="rg dp-board dp-board--${v}"><div class="dp-board__b" data-swap="board:${v}">${body}</div></section>`;
}

/* ── the route stage ── */
/** The route's drawing space. Ultra-wide draws it taller, so the stage is filled by the route, not by air. */
const DP_GEO = { std: { w: 1000, h: 250, x0: 80, x1: 920, yb: 150, yc: 8 }, wide: { w: 1000, h: 400, x0: 70, x1: 930, yb: 262, yc: -6 } };
let DP_RT = DP_GEO.std;
const dpPt = (t) => [DP_RT.x0 + (DP_RT.x1 - DP_RT.x0) * t, DP_RT.yb - 2 * t * (1 - t) * (DP_RT.yb - DP_RT.yc)];
const dpPath = (a, b, n = 48) => Array.from({ length: n + 1 }, (_, i) => dpPt(a + ((b - a) * i) / n)).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
const dpPct = (x, y) => `left:${((x / DP_RT.w) * 100).toFixed(2)}%;top:${((y / DP_RT.h) * 100).toFixed(2)}%`;
/** The lane drawn as a route: an origin, a destination, the road between, where the load is by its schedule. */
function dpRoute(l, { compact = false } = {}) {
  DP_RT = WSX.device === 'wide' && !compact ? DP_GEO.wide : DP_GEO.std;
  const col = dpCol(l);
  const st = dpSt(l);
  const [o, d] = dpEnds(l);
  const p = dpProgress(l);
  const issue = col === 'ISSUE';
  const ties = Array.from({ length: 27 }, (_, i) => (i + 1) / 28).map((t) => {
    const [x, y] = dpPt(t);
    const tx = DP_RT.x1 - DP_RT.x0;
    const ty = -2 * (1 - 2 * t) * (DP_RT.yb - DP_RT.yc);
    const n = Math.hypot(tx, ty);
    const [nx, ny] = [(-ty / n) * 6, (tx / n) * 6];
    return `M${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}L${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}`;
  }).join('');
  const a = dpDay(l.pickup);
  const b = dpDay(l.delivery);
  const days = b > a ? Array.from({ length: b - a - 1 }, (_, i) => a + i + 1) : [];
  const dayMarks = days.map((dd) => {
    const [x, y] = dpPt((dd - a) / (b - a));
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" class="dp-r-day"/>`;
  }).join('');
  const [ox, oy] = dpPt(0);
  const [dx, dy] = dpPt(1);
  const [mx, my] = dpPt(p);
  const podTone = dpPod(l) ? (st[0] === 'POD REQUESTED' ? 'gold' : 'warn') : 'ok';
  const svg = `<svg class="dp-r" viewBox="0 0 ${DP_RT.w} ${DP_RT.h}" aria-hidden="true">
    <path d="${dpPath(0, 1)}" class="dp-r-bed"/><path d="${ties}" class="dp-r-ties"/>
    <path d="${dpPath(p, 1)}" class="dp-r-left ${issue ? 'dp-r-left--bad' : ''}"/>
    ${p > 0 ? `<path d="${dpPath(0, p)}" pathLength="1" class="dp-r-done" data-swap="done:${l.id}:${p}"/>` : ''}
    ${dayMarks}
    <circle cx="${ox}" cy="${oy}" r="9" class="dp-r-end dp-r-end--o ${issue ? 'dp-r-end--bad' : p > 0 ? 'dp-r-end--done' : ''}"/>
    <circle cx="${dx}" cy="${dy}" r="9" class="dp-r-end dp-r-end--d ${p >= 1 ? `dp-r-end--${podTone}` : ''}"/>
    ${issue ? `<path d="M${ox - 4} ${oy - 4}l8 8M${ox + 4} ${oy - 4}l-8 8" class="dp-r-x"/>` : ''}
  </svg>`;
  // the plates and the scheduled position are HTML, so the type keeps its size at every scale
  const days2 = (x) => (x == null ? '' : daysWord(x));
  const oWord = issue ? ['STOPPED HERE · OUT OF SERVICE', 'bad'] : col === 'BOOKED' ? [a > DP_TODAY ? `PICKUP IN ${days2(a - DP_TODAY)}` : 'PICKUP TO BE SET', 'mute'] : ['PICKED UP', 'ok'];
  const dWord = p >= 1 ? (dpPod(l) ? [st[0] === 'POD REQUESTED' ? 'DELIVERED · POD REQUESTED' : 'DELIVERED · POD NEEDED', podTone] : ['DELIVERED', 'ok']) : issue ? [b < DP_TODAY ? days2(b - DP_TODAY) : 'NOT MOVING', 'bad'] : b > DP_TODAY ? [`DUE IN ${days2(b - DP_TODAY)}`, 'gold'] : b === DP_TODAY ? ['DUE TODAY', 'gold'] : ['NEW DATE NEEDED', 'gold'];
  const plate = (side, label, city, word) => `<div class="dp-pl dp-pl--${side}" style="${dpPct(side === 'o' ? ox : dx, oy + 22)}"><small>${label}</small><b>${city}</b>${sw(word)}</div>`;
  const marker = col === 'MOVING' ? `<span class="dp-mk" style="${dpPct(mx, my)}" data-swap="mk:${l.id}"><i class="dp-mk__ring" aria-hidden="true"></i>${ico('truck')}</span><span class="dp-mk__tag" style="${dpPct(mx, my - 26)}"><b>TODAY · OCT 8</b><small>BY SCHEDULE</small></span>` : '';
  const v = VEHICLES[dpVeh(l)];
  const busy = v && dpTruckLoads(v.id).find((x) => x.id !== l.id && dpCol(x) === 'MOVING');
  const [px, py] = dpPt(0.5);
  const peak = issue ? ['NOT MOVING', 'NEEDS A WORKING TRUCK', 'bad'] : col === 'BOOKED' ? (busy ? [`${v.unit} · ON ${busy.ref}`, `FREE AFTER ${busy.delivery} · ${dpEnds(busy)[1]}`, 'mute'] : ['WAITING FOR PICKUP', v ? v.unit : 'NO TRUCK YET', 'mute']) : null;
  const peakTag = peak && !compact ? `<span class="dp-mk__tag dp-mk__tag--${peak[2]}" style="${dpPct(px, py - 14)}"><b>${peak[0]}</b><small>${peak[1]}</small></span>` : '';
  const dayTags = compact ? '' : days.filter((dd) => dd !== DP_TODAY || col !== 'MOVING').map((dd) => {
    const [x, y] = dpPt((dd - a) / (b - a));
    return `<span class="dp-daytag" style="${dpPct(x, y - 20)}">${dd === DP_TODAY ? 'TODAY · OCT 8' : `OCT ${dd - DP_MON.OCT * 31}`}</span>`;
  }).join('');
  return `<div class="dp-routebox" style="aspect-ratio:${DP_RT.w} / ${DP_RT.h};--ar:${(DP_RT.w / DP_RT.h).toFixed(3)}" data-swap="route:${l.id}">${svg}${plate('o', `PICKUP · ${l.pickup}`, o, oWord)}${plate('d', `DELIVERY · ${l.delivery}`, d, dWord)}${marker}${peakTag}${dayTags}</div>`;
}
/** The truck's run: every load on the selected load's truck, in order — movement from one lane to the next. */
function dpRun(l, big = false) {
  const v = VEHICLES[dpVeh(l)];
  if (!v) return `<div class="dp-run"><span class="dp-run__l"><small>TRUCK</small><b>NONE</b></span><span class="dp-run__n">NO TRUCK ON THIS LOAD</span></div>`;
  const list = dpTruckLoads(v.id);
  const t = v.ticket ? TICKETS[v.ticket] : null;
  const leg = (x) => {
    const [o, d] = dpEnds(x);
    const tone = dpTone(x);
    const on = x.id === l.id;
    const mini = big ? `<svg viewBox="0 0 120 28" aria-hidden="true"><path d="M6 22 Q60 -6 114 22" class="dp-leg__arc"/><circle cx="6" cy="22" r="3.5" class="dp-leg__o"/><circle cx="114" cy="22" r="3.5" class="dp-leg__d"/></svg>` : '';
    return `<button type="button" class="dp-leg dp-leg--${tone} ${on ? 'is-on' : ''}" data-a="${dpAct()}" data-v="${x.id}" title="${x.ref} · ${x.lane} · ${dpSt(x)[0]}" aria-pressed="${on}">${mini}<span class="dp-leg__h"><b>${dpRef(x)}</b><small>${x.pickup}</small><i class="pip pip--${tone}"></i></span><span class="dp-leg__t">${list.length > 4 && !big ? `TO ${dpTown(d)}` : `${dpTown(o)} → ${dpTown(d)}`}</span></button>`;
  };
  return `<div class="dp-run ${big ? 'dp-run--big' : ''}"><span class="dp-run__l"><small>${v.unit} · ITS RUN</small><b>${list.length} LOAD${list.length === 1 ? '' : 'S'}</b></span><div class="dp-run__c">${list.map((x, i) => `${i ? '<i class="dp-run__j" aria-hidden="true"></i>' : ''}${leg(x)}`).join('')}${t ? `<span class="dp-run__n">${ico('wrench')}${t.ref} · ${ov(`ticket:${t.id}`, t.status)[0].replace('AWAITING CUSTOMER AUTHORIZATION', 'AWAITING APPROVAL')}</span>` : ''}</div></div>`;
}
function dpStage(l, { compact = false } = {}) {
  const st = dpSt(l);
  const [o, d] = dpEnds(l);
  const hd = dpHeading(o, d);
  const tone = dpTone(l);
  const ro2 = (k, v, s = '') => `<div><dt>${k}</dt><dd>${v}${s ? ` <small>${s}</small>` : ''}</dd></div>`;
  return `<section class="dp-stage ${compact ? 'dp-stage--c' : ''}">
    <img class="dp-stage__img" src="./brand/all-in-one-hero-truck.jpg" alt="">
    <div class="dp-stage__id" data-swap="id:${l.id}">
      <div class="dp-stage__ref"><small>${clientName(l.client)} · ${compact ? l.pickup : `DISPATCHER ${staffName(l.owner)}`}</small><b>${l.ref}</b></div>
      <div class="dp-stage__st"><span class="dp-big dp-big--${tone}">${st[0]}</span>${hd ? `<span class="dp-dir">${dpNeedle(hd.deg)}${hd.word}</span>` : ''}</div>
      ${compact ? '' : `<dl class="dp-stage__ro">${ro2('PICKUP', l.pickup)}${ro2('DELIVERY', l.delivery)}${ro2('RATE', l.rate, 'SAMPLE')}</dl>`}
    </div>
    <div class="dp-routewrap">${dpRoute(l, { compact })}<span class="dp-stage__note">${ico('info')}SCHEMATIC · NO LIVE TRACKING</span></div>
    ${compact ? '' : dpRun(l, WSX.device === 'wide')}
  </section>`;
}

/* ── the load panel ── */
function dpNext(l) {
  const st = dpSt(l);
  const col = dpCol(l);
  const rec = `load:${l.id}`;
  const [o, d] = dpEnds(l);
  const drv = DRIVERS[dpDrv(l)];
  if (l.id === 'ld-5517') {
    if (st[0] === 'REASSIGNED') return nextBlock('REASSIGNED TO UNIT 07 · NEW PICKUP DATE NEEDED', '', 'done');
    return nextBlock('MOVE THE LOAD TO A WORKING TRUCK', simBtn(`dp:mv:${l.id}`, {
      label: 'REASSIGN TO UNIT 07', effect: 'MOVES LOAD 5517 TO UNIT 07 AFTER ITS CURRENT DELIVERY.', rec, primary: true,
      apply: () => Object.assign(WSX.over, { [`load:${l.id}`]: ['REASSIGNED', 'gold'], [`dpcol:${l.id}`]: 'BOOKED', [`dpveh:${l.id}`]: 'v-tk-07', [`dpdrv:${l.id}`]: 'd-tk-1', [`dpexc:${l.id}`]: '' }),
    }));
  }
  if (dpPod(l)) {
    if (st[0] === 'POD REQUESTED') return nextBlock('POD REQUESTED · FACTORING WAITS ON IT', '', 'done');
    return nextBlock('REQUEST PROOF OF DELIVERY', simBtn(`dp:pod:${l.id}`, { label: 'REQUEST PROOF OF DELIVERY', effect: `ASKS ${drv ? drv.name : 'THE DRIVER'} AND ${clientName(l.client)} FOR THE SIGNED POD.`, rec, primary: true, apply: () => (WSX.over[`load:${l.id}`] = ['POD REQUESTED', 'gold']) }));
  }
  if (col === 'MOVING') return nextBlock(`DELIVERS ${l.delivery} · ${d}`, simBtn(`dp:call:${l.id}`, { label: 'LOG A CHECK CALL', effect: 'RECORDS A CHECK CALL WITH THE DRIVER. AIO HAS NO LIVE TRACKING.', rec, apply: () => {} }), 'calm');
  if (col === 'BOOKED') return nextBlock(`PICKS UP ${l.pickup} · ${o}`, drv ? simBtn(`dp:sheet:${l.id}`, { label: 'SEND LOAD DETAILS', effect: `SENDS THE PICKUP DETAILS FOR ${l.ref} TO ${drv.name}.`, rec, apply: () => {} }) : '', 'calm');
  return nextBlock(`${st[0]} · NOTHING OPEN`, '', 'done');
}
function dpTruckTile(l) {
  const v = VEHICLES[dpVeh(l)];
  if (!v) return `<div class="dp-none">${ico('truck')}<span>NO TRUCK ON THIS LOAD</span></div>`;
  const s = vAvail(v);
  const t = v.ticket ? TICKETS[v.ticket] : null;
  return `<button type="button" class="dp-trk dp-trk--${s[1]}" data-a="go" data-v="fleet:${v.id}:dispatch" aria-label="${v.unit} · ${s[0]} — open in Fleet" title="${v.unit} · ${v.ymm} — OPEN IN FLEET"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><span class="dp-trk__t"><small>TRUCK${WSX.over[`dpveh:${l.id}`] ? ' · REASSIGNED' : ''}</small><b>${v.unit}</b><span>${v.ymm.replace(/^\d{4} /, '')}</span>${sw([s[0].split(' · ')[0], s[1]])}${t ? `<em>${t.ref} · ${ov(`ticket:${t.id}`, t.status)[0].replace('AWAITING CUSTOMER AUTHORIZATION', 'AWAITING APPROVAL')}</em>` : ''}</span><span class="dp-go">FLEET${ico('fwd')}</span></button>`;
}
function dpDriverTile(l) {
  const d = DRIVERS[dpDrv(l)];
  if (!d) return `<div class="dp-drv dp-drv--none"><span class="dp-drv__i">${ico('steering')}</span><span class="dp-drv__t"><small>DRIVER</small><b>NO DRIVER ON THIS LOAD</b></span></div>`;
  return `<button type="button" class="dp-drv" data-a="go" data-v="client:${d.client}:drivers" aria-label="${d.name} — open in Client 360" title="${d.name} — OPEN IN CLIENT 360"><span class="dp-drv__i">${d.name.split(' ').map((w) => w[0]).join('')}</span><span class="dp-drv__t"><small>DRIVER</small><b>${d.name}</b><em>${d.cdl}</em></span><span class="dp-go">CLIENT 360${ico('fwd')}</span></button>`;
}
function dpPapers(l) {
  const docs = vals(DOCS).filter((x) => x.owner === `load:${l.id}`);
  const col = dpCol(l);
  const slot = (label, word) => `<div class="dch dp-slot"><span class="dch__sheet dch__sheet--miss"></span><span class="dp-slot__t"><b>${label} · ${l.ref}</b><small>${word[0] === 'NONE ON FILE' ? 'NOT IN THIS SAMPLE' : 'NOT ON FILE'}</small></span>${sw(word)}</div>`;
  const bol = docs.find((x) => /BILL OF LADING/.test(x.title));
  const pod = dpPod(l) ? (dpSt(l)[0] === 'POD REQUESTED' ? ['REQUESTED', 'gold'] : ['NOT RECEIVED', 'bad']) : ['BOOKED', 'MOVING', 'ISSUE'].includes(col) ? ['AT DELIVERY', 'mute'] : ['NONE ON FILE', 'mute'];
  return `<div class="dp-papers">${bol ? docChip(bol.id) : slot('BILL OF LADING', col === 'BOOKED' || col === 'ISSUE' ? ['AT PICKUP', 'mute'] : ['NONE ON FILE', 'mute'])}${slot('PROOF OF DELIVERY', pod)}</div>`;
}
function dpPanel(l, { split = false, phone = false } = {}) {
  const st = dpSt(l);
  const [o, d] = dpEnds(l);
  const exc = dpExc(l);
  const sub = vals(SUBMISSIONS).find((s) => s.load === l.id);
  const key = `${l.id}:${st[0]}`;
  const head = `<header class="cx__h"><div class="cx__hd" data-swap="hd:${key}"><div class="cx__crumb"><span>DISPATCH</span>${ico('fwd')}<span>${clientName(l.client)}</span>${ico('fwd')}<span>${l.ref}</span></div><h2 class="cx__t">${o} → ${d}</h2><span class="dp-cx__s">${sw(st)}<span class="pk__s">PICKUP ${l.pickup} · DELIVERY ${l.delivery}</span></span></div></header>`;
  const excPlate = exc ? `<div class="dp-exc dp-exc--${dpTone(l) === 'bad' ? 'bad' : 'warn'}">${ico('warning')}<span><small>EXCEPTION</small><b>${exc.split(' — ')[0]}</b>${exc.split(' — ')[1] ? `<em>${exc.split(' — ')[1]}</em>` : ''}</span></div>` : '';
  const assign = `<div class="dp-asg"><div class="sec-l"><span>ASSIGNED</span><span>${dpVeh(l) ? 'TRUCK · DRIVER' : 'NEEDS A TRUCK'}</span></div>${dpTruckTile(l)}${dpDriverTile(l)}</div>`;
  const papers = `<div><div class="sec-l"><span>PAPERS · BOL / POD</span></div>${dpPapers(l)}</div>`;
  const fx = facts([['CLIENT', `<a data-a="go" data-v="client:${l.client}:dispatch">${clientName(l.client)}</a>`], ['RATE', `${l.rate} <small>SAMPLE RATE</small>`], ['DISPATCHER', staffName(l.owner)], sub ? ['FACTORING', `<a data-a="go" data-v="client:${l.client}:factoring">${sub.ref}</a>`, `${sub.status[0]}${sub.blocker ? ` · WAITS ON ${sub.blocker}` : ''}`] : null]);
  const hist = mhist(`load:${l.id}`, DP_HIST[l.id] || [], 'HISTORY');
  const mini = phone ? `<div class="dp-cx__stage">${dpStage(l, { compact: true })}</div>` : '';
  const body = split
    ? `<div class="dp-cx__col">${dpNext(l)}${excPlate}${fx}${hist}</div><div class="dp-cx__col">${assign}${papers}</div>`
    : `${mini}${dpNext(l)}${excPlate}${assign}${papers}${fx}${hist}`;
  return `<section class="rg cx dp-cx ${split ? 'dp-cx--split' : ''}">${head}<div class="cx__b" data-keep="dp-cx" data-swap="b:${key}">${body}</div></section>`;
}

/* ── ultra-wide: the trucks themselves, beside the board ── */
function dpFleetCol() {
  const cards = dpTrucks().map((v) => {
    const s = vAvail(v);
    const list = dpTruckLoads(v.id);
    const now = list.find((l) => dpCol(l) === 'MOVING') || list.find((l) => dpCol(l) === 'ISSUE') || list.find((l) => dpCol(l) === 'BOOKED');
    const drv = v.driver ? DRIVERS[v.driver] : null;
    return `<div class="dp-fc dp-fc--${s[1]}"><div class="dp-fc__stage"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><b>${v.unit}</b><span>${sw([s[0].split(' · ')[0], s[1]])}</span></div>
      <div class="dp-fc__b"><dl class="fx">${[['MAKE', v.ymm], ['DRIVER', drv ? drv.name : 'NONE ASSIGNED'], ['NOW', now ? `${now.ref} · ${dpSt(now)[0]}` : 'NO LOAD']].map(([k, x]) => `<div><dt>${k}</dt><dd>${x}</dd></div>`).join('')}</dl><div class="dp-fc__chips">${list.map((x) => dpChip(x)).join('')}</div><button type="button" class="wbtn wbtn--sm" data-a="go" data-v="fleet:${v.id}:dispatch">${ico('truck')}${v.unit} IN FLEET</button></div></div>`;
  }).join('');
  return rgn('THE TRUCKS · T&K TRANSPORT', `${dpTrucks().length} OF ${ACCOUNTS['c-tk'].trucks} ON FILE`, '', `<div class="dp-fleet">${cards}</div>`, 'dp-fleetrg', 'dp-fleet');
}

/* ── composition ── */
function dpBar() {
  const all = dpLoads();
  const v = WSX.dp.view;
  const exc = dpExceptions().length;
  const moving = dpByCol('MOVING').length;
  if (VP === 'mobile') return wsBar('05 · WORK', 'DISPATCH', [ro(all.length, 'LOADS'), ro(moving, 'MOVING', { tone: 'gold' }), ro(exc, 'EXCEPTIONS', { tone: 'bad' })].join(''));
  const r = [ro(all.length, 'LOADS', { a: 'dp.view', v: 'loads', on: v === 'loads' }), ro(moving, 'MOVING', { tone: 'gold' }), ro(exc, 'EXCEPTIONS', { tone: 'bad', a: 'dp.view', v: 'exceptions', on: v === 'exceptions' }), ro(dpTrucks().length, 'TRUCKS', { a: 'dp.view', v: 'trucks', on: v === 'trucks' }), ro(1, 'CLIENT', { a: 'dp.view', v: 'clients', on: v === 'clients' })];
  return wsBar('05 · WORK', 'DISPATCH', (VP === 'tablet' ? r.slice(0, 4) : r).join(''), dpSvc());
}
const dpSvc = () => `<span class="dp-svc"><i class="pip pip--ok"></i><b>DISPATCHING · ACTIVE</b><small>MANUAL LOAD ENTRY · NO LOAD BOARD</small></span>`;
function dpViews() {
  const n = { loads: dpLoads().length, trucks: dpTrucks().length, clients: 1, exceptions: dpExceptions().length, mine: dpLoads().filter((l) => l.owner === 's-alex').length };
  return seg(DP_VIEWS.map(([id, label]) => [id, label, n[id]]), WSX.dp.view, 'dp.view', VP === 'desktop' ? '' : 'wseg--scroll');
}
function dispatchView() {
  const l = LOADS[WSX.dp.load];
  if (VP === 'mobile') {
    const v = WSX.dp.view;
    const s = WSX.dp.state;
    const list = v === 'loads'
      ? `${seg(DP_COLS.map(([c, label]) => [c, label, dpByCol(c).length]), s, 'dp.state', 'wseg--fit dp-states')}<div class="dp-mlist" data-swap="m:${s}">${dpByCol(s).map((x) => dpCard(x)).join('') || '<span class="dp-col__none">NO LOADS IN THIS STATE</span>'}</div>`
      : dpBoard();
    const trucks = `<div class="dp-mtrucks"><div class="sec-l"><span>T&K TRUCKS · ${dpTrucks().length} ON FILE</span></div>${dpTrucks().map((t) => {
      const st = vAvail(t);
      const now = dpTruckLoads(t.id).find((x) => ['MOVING', 'ISSUE'].includes(dpCol(x)));
      return `<button type="button" class="dp-mtrk dp-mtrk--${st[1]}" data-a="go" data-v="fleet:${t.id}:dispatch"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[t.id].cab)}</svg><span><b>${t.unit}</b><small>${now ? `${now.ref} · ${dpTown(dpEnds(now)[1])}` : 'NO LOAD'}</small></span>${sw([st[0].split(' · ')[0], st[1]])}</button>`;
    }).join('')}</div>`;
    return `<div class="ws dp dp--m">${dpBar()}${dpViews()}${list}${v === 'loads' ? trucks : ''}${ntb('<b>DISPATCHING IS ACTIVE.</b> MANUAL LOAD ENTRY · NO LOAD BOARD.')}</div>${phoneSheet(dpPanel(l, { phone: true }), { label: l.ref })}`;
  }
  if (VP === 'tablet') return `<div class="ws dp dp--t">${dpBar()}<div class="dp-segrow">${dpViews()}</div>${dpBoard()}${dpStage(l)}${dpPanel(l, { split: true })}</div>`;
  const wide = WSX.device === 'wide';
  return `<div class="ws dp">${dpBar()}<div class="dp-grid ${wide ? 'dp-grid--w' : ''}"><div class="dp-segrow">${dpViews()}</div>${dpBoard()}${dpStage(l)}${wide ? dpFleetCol() : ''}${dpPanel(l)}</div></div>`;
}

/* ── actions ── */
ACT['dp.load'] = (id) => {
  if (!LOADS[id]) return;
  WSX.dp.load = id;
  WSX.dp.state = dpCol(LOADS[id]);
  WSX.pending = null;
};
ACT['dp.open'] = (id) => {
  ACT['dp.load'](id);
  WSX.sheet = true;
};
ACT['dp.view'] = (v) => {
  WSX.dp.view = v;
  WSX.pending = null;
  if (v === 'exceptions' && !dpExceptions().some((l) => l.id === WSX.dp.load) && dpExceptions()[0]) ACT['dp.load'](dpExceptions()[0].id);
};
ACT['dp.state'] = (s) => {
  WSX.dp.state = s;
  WSX.pending = null;
  const first = dpByCol(s)[0];
  if (first && VP !== 'mobile') WSX.dp.load = first.id;
};

registerWorkspace({
  id: 'dispatch', no: '05', name: 'DISPATCH', group: 'money', page: 'work', lane: 'dispatch', view: () => dispatchView(),
  shape: 'A LOAD BOARD', line: 'EVERY LOAD, ITS ROUTE, ITS TRUCK, ITS PAPERS.',
  states: [['MAIN', []], ['SELECTED', [['dp.load', 'ld-5520']]], ['DEEPER', [['dp.load', 'ld-5518'], ['sim.ask', 'dp:pod:ld-5518']]], ['PHONE', [['dp.open', 'ld-5517']], 'phone']],
  demos: [
    ['FOLLOW THE LOADS', [['dp.load', 'ld-5521', 'LOAD 5521 · BOOKED'], ['dp.load', 'ld-5520', 'LOAD 5520 · ON THE ROAD'], ['dp.load', 'ld-5518', 'LOAD 5518 · DELIVERED · POD NEEDED'], ['dp.load', 'ld-5501', 'LOAD 5501 · COMPLETE']]],
    ['CLEAR AN EXCEPTION', [['dp.load', 'ld-5517', 'LOAD 5517 · TRUCK OUT OF SERVICE'], ['sim.ask', 'dp:mv:ld-5517', 'REASSIGN TO UNIT 07'], ['sim.ok', 'dp:mv:ld-5517', 'CONFIRM · SIMULATED'], ['dp.view', 'trucks', 'THE BOARD BY TRUCK']]],
    ['THE BOARD, FIVE WAYS', [['dp.view', 'trucks', 'BY TRUCK'], ['dp.view', 'clients', 'BY CLIENT'], ['dp.view', 'exceptions', 'EXCEPTIONS'], ['dp.view', 'mine', 'MY LOADS'], ['dp.view', 'loads', 'BY STATE']]],
  ],
  audit: [
    [['dp.view', 'trucks']], [['dp.view', 'clients']], [['dp.view', 'exceptions']], [['dp.view', 'mine']],
    [['dp.load', 'ld-5521']], [['dp.load', 'ld-5501']], [['dp.load', 'ld-5520'], ['sim.ask', 'dp:call:ld-5520']],
    [['dp.load', 'ld-5517'], ['sim.ask', 'dp:mv:ld-5517']], [['dp.load', 'ld-5517'], ['sim.ok', 'dp:mv:ld-5517'], ['dp.view', 'trucks']],
    [['dp.state', 'DELIVERED']], [['dp.load', 'ld-5518'], ['sim.ok', 'dp:pod:ld-5518']],
  ],
  phoneAct: { 'dp.load': 'dp.open' },
  enter: (a) => {
    if (LOADS[a]) return ACT['dp.load'](a);
    if (VEHICLES[a]) {
      WSX.dp.view = 'trucks';
      const first = dpTruckLoads(a).find((l) => ['MOVING', 'ISSUE'].includes(dpCol(l))) || dpTruckLoads(a)[0];
      if (first) ACT['dp.load'](first.id);
    }
    if (ACCOUNTS[a]) WSX.dp.view = 'clients';
  },
  label: () => LOADS[WSX.dp.load]?.ref ?? 'DISPATCH',
  route: (s) => {
    if (s[0] === 'work' && s[1] === 'dispatch') return true;
    if (s[0] === 'rec' && s[1] === 'load' && LOADS[s[2]]) return ACT['dp.load'](s[2]), true;
    return false;
  },
});
