/*
 * 06 · BROKERAGE — PAUSED. Built around a match: the shipper on one side, the carrier on the other, the load between
 * them with the rate confirmation status where they meet. The live catalog has BROKERAGE PAUSED (business activation
 * required; authority / licensing separate), so this is the future workspace in a paused state: every commercial action
 * is drawn disabled and says PAUSED — NOT ACTIVE, and nothing here simulates a booking. Load financials (the sample
 * margin) are founder · finance only.
 */
WSX.br = { id: 'sh-4471', sec: 'shipments', side: 'load' };

const BR_SECS = [['quotes', 'QUOTES'], ['shipments', 'SHIPMENTS'], ['offers', 'CARRIER OFFERS'], ['stops', 'STOPS / STATUS'], ['money', 'LOAD FINANCIALS']];
const BR_STEPS = ['QUOTE', 'SHIPMENT', 'CARRIER', 'RATE CONFIRMATION', 'PICKUP', 'DELIVERY', 'INVOICE'];
/** Where each section lives in the composition: the shipper side, the load between, or the carrier side. */
const BR_HOME = { quotes: 'shipper', shipments: 'load', offers: 'carrier', stops: 'load', money: 'load' };
const BR_SVC = SERVICES.find(([n]) => n === 'BROKERAGE');
const BR_CITY = { 'NASHVILLE, TN': [36.16, -86.78], 'COLUMBUS, OH': [39.96, -83.0], 'KNOXVILLE, TN': [35.96, -83.92], 'ATLANTA, GA': [33.75, -84.39] };

const brRecs = () => vals(SHIPMENTS);
const brRec = () => SHIPMENTS[WSX.br.id] || brRecs()[0];
const brIsQuote = (r) => /^QUOTE/.test(r.ref);
const brSt = (r) => ov(`shipment:${r.id}`, r.status);
const brEnds = (r) => r.lane.split(' → ');
const brTown = (c) => c.split(',')[0];
const brShipper = (r) => r.shipper.replace('SAMPLE SHIPPER · ', '');
const brMono = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);
const brCarrier = (r) => (r.carrier && r.carrier !== '—' ? vals(ACCOUNTS).find((a) => a.name === r.carrier) ?? null : null);
const brMargin = (r) => (r.margin && r.margin !== '—' ? r.margin.split(' ')[0] : null);
const brStep = (r) => (brIsQuote(r) ? 0 : brCarrier(r) ? 3 : 2);
const brShort = (w) => w.replace('RATE CONFIRMATION ', '').replace('QUOTE ', '');
const brSecs = () => BR_SECS.filter(([id]) => id !== 'money' || FOUNDER);
/** How long the HOME blocked list says a record has waited, and on whom. */
const brWait = (r) => HOME_LISTS.blocked.find((b) => b[2] === `rec/shipment/${r.id}`);
function brHeading(from, to) {
  const a = BR_CITY[from];
  const b = BR_CITY[to];
  if (!a || !b) return null;
  const dx = (b[1] - a[1]) * Math.cos((((a[0] + b[0]) / 2) * Math.PI) / 180);
  const dy = b[0] - a[0];
  return { deg: (Math.atan2(dx, dy) * 180) / Math.PI, word: Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'EASTBOUND' : 'WESTBOUND') : dy > 0 ? 'NORTHBOUND' : 'SOUTHBOUND' };
}
/** A commercial action, drawn as it will be — and disabled, because brokerage is paused. */
const brOff = (label, sm = false) => `<span class="br-off"><button type="button" class="wbtn ${sm ? 'wbtn--sm' : ''}" disabled aria-disabled="true" title="${label} — PAUSED, NOT ACTIVE">${ico('lock')}${label}</button><span class="br-off__t">PAUSED — NOT ACTIVE</span></span>`;
const brSeals = (r) => {
  const c = brCarrier(r);
  const left = brIsQuote(r) ? ['QUOTE', ['SENT', brSt(r)[1]]] : ['SHIPMENT', ['ON FILE', 'ok']];
  const right = c ? ['RATE CONFIRMATION', [brShort(brSt(r)[0]), brSt(r)[1]]] : ['RATE CONFIRMATION', ['NO CARRIER', 'mute']];
  return { left, right };
};

/* ── the two plates and the load between them ── */
function brShipPlate(r) {
  const name = brShipper(r);
  const on = WSX.br.side === 'shipper';
  return `<button type="button" class="br-plate br-plate--ship ${on ? 'is-on' : ''}" data-a="br.side" data-v="shipper" aria-pressed="${on}" data-swap="sp:${r.id}"><span class="br-plate__k">${ico('company')}SHIPPER</span><span class="br-plate__id"><span class="br-mono">${brMono(name)}</span><span><b>${name}</b><small>SAMPLE SHIPPER · NOT AN AIO CLIENT</small></span></span><span class="br-plate__ro"><span><small>PICKS UP IN</small><b>${brEnds(r)[0]}</b></span><span><small>RECORDS</small><b>${brRecs().filter((x) => x.shipper === r.shipper).length}</b></span></span><i class="br-port br-port--r br-port--${brSeals(r).left[1][1]}" aria-hidden="true"></i></button>`;
}
function brCarPlate(r) {
  const c = brCarrier(r);
  const on = WSX.br.side === 'carrier';
  const tone = brSeals(r).right[1][1];
  if (!c) return `<button type="button" class="br-plate br-plate--car br-plate--none ${on ? 'is-on' : ''}" data-a="br.side" data-v="carrier" aria-pressed="${on}" data-swap="cp:${r.id}"><span class="br-plate__k">${ico('truck')}CARRIER</span><span class="br-plate__id"><span class="br-mono br-mono--none">—</span><span><b>NO CARRIER YET</b><small>OFFERS OPEN WHEN BROKERAGE IS ACTIVE</small></span></span><span class="br-plate__ro"><span><small>ON FILE</small><b>${brRecs().map(brCarrier).filter(Boolean).length} CARRIER</b></span></span><i class="br-port br-port--l br-port--mute" aria-hidden="true"></i></button>`;
  return `<button type="button" class="br-plate br-plate--car ${on ? 'is-on' : ''}" data-a="br.side" data-v="carrier" aria-pressed="${on}" data-swap="cp:${r.id}"><span class="br-plate__k">${ico('truck')}CARRIER</span><span class="br-plate__id">${badge(c)}<span><b>${c.name}</b><small>AIO CLIENT · ${c.mc} · ${c.state}</small></span></span><span class="br-plate__ro"><span><small>POWER UNITS</small><b>${c.trucks}</b></span><span><small>ACCOUNT</small><b>${sw(LIFE[c.life])}</b></span></span><i class="br-port br-port--l br-port--${tone}" aria-hidden="true"></i></button>`;
}
function brLoadPlate(r, { compact = false } = {}) {
  const st = brSt(r);
  const [o, d] = brEnds(r);
  const hd = brHeading(o, d);
  const { left, right } = brSeals(r);
  const tickets = compact ? '' : `<div class="br-tix" role="tablist">${brRecs().map((x) => `<button type="button" role="tab" class="br-tix__b ${x.id === r.id ? 'is-on' : ''}" data-a="br.ship" data-v="${x.id}" aria-selected="${x.id === r.id}"><b>${x.ref}</b><i class="pip pip--${brSt(x)[1]}"></i></button>`).join('')}<span class="br-stamp">${ico('lock')}PAUSED · NOT ACTIVE</span></div>`;
  const seal = (side, [label, word]) => `<span class="br-seal br-seal--${side} br-seal--${word[1]}"><small>${label}</small>${sw(word)}</span>`;
  return `<section class="br-load ${WSX.br.side === 'load' ? 'is-on' : ''}" data-swap="lp:${r.id}">
    ${tickets}
    <div class="br-load__mid">${compact ? '' : seal('l', left)}<button type="button" class="br-load__ref" data-a="br.side" data-v="load"><small>${clientName(r.client)} · BROKERAGE${compact ? '' : ` · ${staffName(r.owner)}`}</small><b>${r.ref}</b>${sw(st)}</button>${compact ? '' : seal('r', right)}</div>
    <div class="br-lane"><span class="br-lane__e"><small>PICKUP</small><b>${o}</b></span><span class="br-lane__bar" aria-hidden="true"><i></i><i></i></span><span class="br-lane__e br-lane__e--d"><small>DELIVERY</small><b>${d}</b></span>${hd ? `<span class="br-lane__dir"><svg viewBox="0 0 16 16" aria-hidden="true"><g transform="rotate(${hd.deg.toFixed(0)} 8 8)"><path d="M8 1.5 11.6 12 8 10 4.4 12Z"/></g></svg>${hd.word} · NOT TENDERED</span>` : ''}</div>
  </section>`;
}

/* ── the section, worked between the two sides ── */
function brNext(r) {
  const c = brCarrier(r);
  const [title, action] = brIsQuote(r) ? ['THE SHIPPER ANSWERS THE QUOTE', 'FOLLOW UP ON THE QUOTE'] : c ? ['THE CARRIER SIGNS THE RATE CONFIRMATION', 'RESEND RATE CONFIRMATION'] : ['A CARRIER TAKES THE LOAD', 'OFFER TO CARRIERS'];
  return `<div class="br-next"><span class="br-next__l">${ico('lock')}NEXT STEP · WHEN BROKERAGE IS ACTIVE</span><span class="br-next__t">${title}</span><div class="br-next__acts">${brOff(action)}</div></div>`;
}
function brPipe(r) {
  const step = brStep(r);
  const st = brSt(r);
  return `<ol class="br-pipe">${BR_STEPS.map((s, i) => {
    const state = i < step ? 'done' : i === step ? 'now' : 'later';
    return `<li class="br-pipe__s br-pipe__s--${state} ${i === step ? `br-pipe__s--${st[1]}` : ''}"><i>${i < step ? ico('pass') : i > step ? ico('lock') : i + 1}</i><b>${s}</b><small>${i < step ? 'DONE' : i === step ? brShort(st[0]) : 'PAUSED'}</small></li>`;
  }).join('')}</ol>`;
}
function brWorkBody(r, sec) {
  const c = brCarrier(r);
  const st = brSt(r);
  const [o, d] = brEnds(r);
  const wait = brWait(r);
  if (sec === 'money') {
    if (!FOUNDER) return ntb('<b>LOAD FINANCIALS ARE FOUNDER · FINANCE ONLY.</b>');
    const m = brMargin(r);
    return `<div class="br-money"><span class="br-money__k">MARGIN · ${r.ref}<span class="founder">FOUNDER · FINANCE</span></span><b>${m ?? '—'}</b><small>${m ? 'SAMPLE FIGURE FROM THE RECORD' : 'NO CARRIER, SO NO MARGIN YET'}</small></div>${facts([['SHIPPER RATE', 'NOT IN THIS SAMPLE'], ['CARRIER RATE', 'NOT IN THIS SAMPLE'], ['MARGIN', m ? `${m} <small>SAMPLE</small>` : '—']])}${ntb('<b>ONLY THE SAMPLE MARGIN IS SHOWN.</b> NO RATE IS INVENTED.')}`;
  }
  if (sec === 'stops') {
    const stop = (n, kind, city) => `<div class="br-stop"><span class="br-stop__n">${n}</span><span class="br-stop__t"><small>STOP ${n} · ${kind}</small><b>${city}</b><em>NO APPOINTMENT IN THIS SAMPLE</em></span>${sw(['NOT TENDERED', 'mute'])}</div>`;
    return `<div class="br-stops"><div class="sec-l"><span>STOPS · ${r.ref}</span><span>2</span></div>${stop(1, 'PICKUP', o)}${stop(2, 'DELIVERY', d)}</div><div><div class="sec-l"><span>STATUS</span><span>${BR_STEPS[brStep(r)]}</span></div>${brPipe(r)}</div>`;
  }
  if (sec === 'offers') {
    const ghost = ['CARRIER', 'EQUIPMENT', 'OFFERED RATE', 'ANSWER'].map((f) => `<span>${f}</span>`).join('');
    return `<div class="br-offers"><div class="sec-l"><span>CARRIER OFFERS · ${r.ref}</span><span>0</span></div><div class="br-ghost">${ghost}</div>${ntb('<b>CARRIER OFFERS ARE NOT BUILT</b> AND BROKERAGE IS PAUSED.')}</div>${c ? facts([['ASSIGNED', c.name, `AIO CLIENT · ${c.mc}`], ['RATE CONFIRMATION', sw(st), wait ? `${wait[7]} · ${wait[6]}` : '']]) : facts([['ASSIGNED', 'NO CARRIER YET']])}${brNext(r)}`;
  }
  // quotes and shipments: the deal as it stands
  const rows = [
    ['SHIPPER', brShipper(r), 'SAMPLE SHIPPER'],
    ['LANE', r.lane],
    brIsQuote(r) ? ['QUOTE', sw(st), 'NO QUOTED RATE IN THIS SAMPLE'] : ['CARRIER', c ? c.name : 'NO CARRIER YET', c ? `AIO CLIENT · ${c.mc}` : ''],
    brIsQuote(r) ? ['CARRIER', 'NO CARRIER YET', 'OFFERS OPEN WHEN ACTIVE'] : ['RATE CONFIRMATION', sw(st), wait ? `${wait[7]} · ${wait[6]}` : ''],
    ['OWNER', staffName(r.owner)],
    ['ACCOUNT', `<a data-a="go" data-v="client:${r.client}:brokerage">${clientName(r.client)}</a>`],
  ];
  return `${brNext(r)}${facts(rows)}`;
}
function brWork(r, { two = false } = {}) {
  const sec = WSX.br.sec;
  const label = BR_SECS.find(([id]) => id === sec)[1];
  const focus = WSX.br.side === 'load';
  const pipe = two && sec !== 'stops' ? `<div class="br-work__aside"><div class="sec-l"><span>STATUS</span><span>${BR_STEPS[brStep(r)]}</span></div>${brPipe(r)}</div>` : '';
  const split = sec === 'stops' && VP !== 'mobile';
  return `<section class="rg br-work ${focus ? 'is-focus' : ''}"><header class="rg__h"><span class="rg__t">${label}</span><span class="rg__n">${r.ref}</span></header><div class="br-work__b ${pipe || split ? 'br-work__b--two' : ''}" data-keep="br-work" data-swap="w:${r.id}:${sec}">${split ? brWorkBody(r, sec) : `<div class="br-work__main">${brWorkBody(r, sec)}</div>${pipe}`}</div></section>`;
}

/* ── the two sides in depth ── */
function brShipSide(r) {
  const shippers = [...new Map(brRecs().map((x) => [x.shipper, x])).values()];
  const focus = WSX.br.side === 'shipper';
  const rows = shippers.map((x) => {
    const n = brShipper(x);
    const sel = x.id === r.id;
    return `<div class="pk br-row ${sel ? 'is-sel' : ''}" data-a="${VP === 'mobile' ? 'br.open' : 'br.ship'}" data-v="${x.id}" title="${n} · ${x.ref} · ${x.lane}" aria-pressed="${sel}"><span class="br-mono br-mono--s">${brMono(n)}</span><span class="br-row__t"><b class="pk__t">${n}</b><span class="pk__s">${x.ref} · FROM ${brTown(brEnds(x)[0])}</span></span>${sw([brShort(brSt(x)[0]), brSt(x)[1]])}</div>`;
  }).join('');
  const body = `<div class="br-list">${rows}</div>
    <div class="br-sub"><div class="sec-l"><span>${brIsQuote(r) ? 'THE QUOTE' : 'THE SHIPPER’S LOAD'}</span><span>${r.ref}</span></div>${facts([[brIsQuote(r) ? 'QUOTE' : 'LOAD', r.ref], ['PICKUP', brEnds(r)[0]], ['DELIVERY', brEnds(r)[1]], ['QUOTED RATE', 'NOT IN THIS SAMPLE']])}</div>
    <div class="br-sub__acts">${brOff('NEW QUOTE', true)}</div>
    ${ntb('SHIPPERS ARE SAMPLE NAMES. NO SHIPPER RECORD IN AIO.')}`;
  return `<section class="rg br-side br-side--ship ${focus ? 'is-focus' : ''}"><header class="rg__h"><span class="rg__t">SHIPPER SIDE</span><span class="rg__n">${shippers.length} SAMPLE SHIPPERS</span></header><div class="rg__b br-side__b" data-keep="br-ship" data-swap="ss:${r.id}">${body}</div></section>`;
}
/** The carrier's packet: what AIO already knows about the carrier, read from its own records. */
function brPacket(c) {
  const pol = vals(POLICIES).find((p) => p.client === c.id);
  const ucr = vals(DUES).find((x) => x.client === c.id && /UCR/.test(x.what));
  const ifta = vals(QUARTERS).find((q) => q.client === c.id && q.q === 'Q3 2026');
  const rows = [
    ['id-card', 'AUTHORITY', `${c.mc} · ${c.dot}`, ['ON FILE', 'mute'], `client:${c.id}:permitting`],
    pol && ['umbrella', `INSURANCE · EXP ${pol.exp.replace(', 2026', '')}`, pol.title, ov(`policy:${pol.id}`, pol.status), `client:${c.id}:insurance`],
    ucr && ['shield-check', `UCR · DUE ${ucr.due.replace(', 2026', '')}`, ucr.what, ov(`deadline:${ucr.id}`, ucr.state), `comp:${ucr.id}`],
    ifta && ['fuel', 'IFTA · Q3 2026', ifta.next, ifta.bucket, `client:${c.id}:filing`],
  ].filter(Boolean);
  return `<div class="br-pkt">${rows.map(([i, k, v, s, go]) => `<button type="button" class="br-pkt__r br-pkt__r--${s[1]}" data-a="go" data-v="${go}" title="${k} · ${v} — OPEN"><span class="br-pkt__i">${ico(i)}</span><span class="br-pkt__t"><small>${k}</small><b>${v}</b></span>${sw(s)}${ico('fwd', 'br-pkt__c')}</button>`).join('')}</div>`;
}
function brCarSide(r) {
  const c = brCarrier(r);
  const onFile = [...new Set(brRecs().map(brCarrier).filter(Boolean))];
  const focus = WSX.br.side === 'carrier';
  const pc = c || onFile[0];
  const body = `${c ? '' : `<div class="br-none">${ico('truck')}<span><b>NO CARRIER ON ${r.ref}</b><small>OFFERS OPEN WHEN BROKERAGE IS ACTIVE</small></span></div>`}
    <div class="br-sub"><div class="sec-l"><span>${c ? 'CARRIER PACKET' : 'THE CARRIER ON FILE'}</span><span>${pc.name}</span></div>${brPacket(pc)}</div>
    <div class="br-sub"><div class="sec-l"><span>OFFERS</span><span>0</span></div>${ntb('<b>OFFERS ARE NOT BUILT.</b> PACKET READ FROM AIO RECORDS.')}</div>
    <div class="br-sub__acts">${brOff(c ? 'SEND RATE CONFIRMATION' : 'OFFER TO CARRIER', true)}</div>`;
  return `<section class="rg br-side br-side--car ${focus ? 'is-focus' : ''}"><header class="rg__h"><span class="rg__t">CARRIER SIDE</span><span class="rg__n">${onFile.length} CARRIER ON FILE</span></header><div class="rg__b br-side__b" data-keep="br-car" data-swap="cs:${r.id}">${body}</div></section>`;
}

/* ── paused: what is off, what is open, and why ── */
function brWhy() {
  const off = ['SEND QUOTES', 'OFFER LOADS TO CARRIERS', 'SEND RATE CONFIRMATIONS', 'BOOK LOADS', 'INVOICE SHIPPERS'];
  const open = ['READ THE SAMPLE RECORDS', 'READ A CARRIER’S PACKET', 'FOLLOW LINKS TO CLIENT 360 AND COMPLIANCE'];
  return `<section class="rg cx br-cx"><header class="cx__h"><div class="cx__crumb"><span>BROKERAGE</span>${ico('fwd')}<span>SERVICE CATALOG</span></div><h2 class="cx__t">BROKERAGE IS PAUSED</h2>${sw(['PAUSED', 'bad'])}</header><div class="cx__b">
    <div class="br-whyplate">${ico('lock')}<span><small>LIVE SERVICE CATALOG</small><b>${BR_SVC[0]} · ${BR_SVC[1]}</b><em>${BR_SVC[3]}</em></span></div>
    ${facts([['SERVICE', BR_SVC[0]], ['STATE', sw([BR_SVC[1], BR_SVC[2]])], ['NEEDS', 'BUSINESS ACTIVATION'], ['LICENSING', 'AUTHORITY / LICENSING SEPARATE'], ['RECORDS HERE', `${brRecs().length} · SAMPLE ONLY`]])}
    <div><div class="sec-l"><span>OFF WHILE PAUSED</span><span>${off.length}</span></div><div class="br-why__l">${off.map((x) => `<span class="br-why__i br-why__i--off">${ico('lock')}${x}</span>`).join('')}</div></div>
    <div><div class="sec-l"><span>OPEN WHILE PAUSED</span><span>${open.length}</span></div><div class="br-why__l">${open.map((x) => `<span class="br-why__i">${ico('pass')}${x}</span>`).join('')}</div></div>
    ${ntb('ACTIVATION HAPPENS OUTSIDE THIS WORKSPACE.')}
  </div></section>`;
}

/* ── composition ── */
function brBar() {
  const all = brRecs();
  const q = all.filter(brIsQuote).length;
  const blocked = all.filter((r) => brSt(r)[1] === 'bad').length;
  const plate = `<div class="br-paused">${ico('lock')}<span><b>PAUSED</b><small>${VP === 'mobile' ? 'BUSINESS ACTIVATION REQUIRED' : 'BUSINESS ACTIVATION REQUIRED · AUTHORITY / LICENSING SEPARATE'}</small></span><button type="button" class="wbtn wbtn--sm br-why" data-a="br.why">WHY PAUSED</button></div>`;
  const s = WSX.br.sec;
  if (VP === 'mobile') return `${wsBar('06 · WORK', 'BROKERAGE', [ro(all.length, 'RECORDS'), ro(blocked, 'BLOCKED', { tone: 'bad' })].join(''))}${plate}`;
  const r = [ro(all.length, 'RECORDS'), ro(q, 'QUOTES', { a: 'br.sec', v: 'quotes', on: s === 'quotes' }), ro(all.length - q, 'SHIPMENTS', { a: 'br.sec', v: 'shipments', on: s === 'shipments' }), ro(blocked, 'BLOCKED', { tone: 'bad' })];
  return wsBar('06 · WORK', 'BROKERAGE', (VP === 'tablet' ? r.slice(1) : r).join(''), plate);
}
const brSegs = () => seg(brSecs().map(([id, label]) => [id, label, id === 'money' ? 'FOUNDER' : id === 'quotes' ? brRecs().filter(brIsQuote).length : id === 'shipments' ? brRecs().filter((x) => !brIsQuote(x)).length : id === 'offers' ? 0 : null]), WSX.br.sec, 'br.sec', VP === 'desktop' ? '' : 'wseg--scroll');
/** Phone: one record as a compact two-sided card — shipper, the load, carrier — and the paused line. */
function brCard(r) {
  const c = brCarrier(r);
  const { left, right } = brSeals(r);
  const [o, d] = brEnds(r);
  const n = brShipper(r);
  return `<div class="pk br-card ${r.id === WSX.br.id ? 'is-sel' : ''}" data-a="br.open" data-v="${r.id}" title="${r.ref} · ${n} · ${r.lane}"><span class="br-card__h"><b>${r.ref}</b>${sw(brSt(r))}</span>
    <span class="br-card__m"><span class="br-card__s"><span class="br-mono br-mono--s">${brMono(n)}</span><small>${n}</small></span><i class="br-card__j br-card__j--${left[1][1]}"></i><span class="br-card__l"><b>${brTown(o)} → ${brTown(d)}</b><small>${right[0] === 'RATE CONFIRMATION' ? `RATE CON · ${right[1][0]}` : right[1][0]}</small></span><i class="br-card__j br-card__j--${right[1][1]}"></i><span class="br-card__s">${c ? badge(c) : '<span class="br-mono br-mono--s br-mono--none">—</span>'}<small>${c ? c.name : 'NO CARRIER'}</small></span></span>
    <span class="br-card__f">${ico('lock')}PAUSED — NOT ACTIVE</span></div>`;
}
function brokerView() {
  const r = brRec();
  const wide = WSX.device === 'wide';
  const why = WSX.sheet === 'why';
  if (VP === 'mobile') {
    const list = brRecs().filter((x) => (WSX.br.sec === 'quotes' ? brIsQuote(x) : WSX.br.sec === 'shipments' ? !brIsQuote(x) : true));
    const side = WSX.br.side;
    const inner = `<section class="rg cx br-cx br-cx--m"><header class="cx__h"><div class="cx__crumb"><span>BROKERAGE</span>${ico('fwd')}<span>${clientName(r.client)}</span>${ico('fwd')}<span>${r.ref}</span></div><h2 class="cx__t">${r.lane}</h2>${seg([['shipper', 'SHIPPER'], ['load', 'THE LOAD'], ['carrier', 'CARRIER']], side, 'br.side', 'wseg--fit')}</header><div class="cx__b" data-keep="br-m" data-swap="m:${r.id}:${side}:${WSX.br.sec}">${side === 'load' ? `${brLoadPlate(r, { compact: true })}${brWorkBody(r, WSX.br.sec)}` : side === 'shipper' ? `${brShipPlate(r)}${brShipSide(r)}` : `${brCarPlate(r)}${brCarSide(r)}`}</div></section>`;
    return `<div class="ws br br--m">${brBar()}${brSegs()}<div class="br-mlist">${list.map(brCard).join('')}</div>${ntb('<b>BROKERAGE IS PAUSED.</b> SAMPLE RECORDS · NOTHING BOOKS FROM HERE.')}</div>${why ? phoneSheet(brWhy(), { label: 'Brokerage paused' }) : phoneSheet(inner, { label: r.ref })}`;
  }
  const plates = `<div class="br-plates">${brShipPlate(r)}${brLoadPlate(r)}${brCarPlate(r)}</div>`;
  if (VP === 'tablet') {
    const side = WSX.br.side === 'shipper' ? brShipSide(r) : brCarSide(r);
    return `<div class="ws br br--t">${brBar()}<div class="br-segrow">${brSegs()}</div>${plates}<div class="br-t2">${brWork(r)}<div class="br-t2__side">${seg([['shipper', 'SHIPPER SIDE'], ['carrier', 'CARRIER SIDE']], WSX.br.side === 'shipper' ? 'shipper' : 'carrier', 'br.side', 'wseg--fit')}${side}</div></div></div>${why ? phoneSheet(brWhy(), { side: true, label: 'Brokerage paused' }) : ''}`;
  }
  return `<div class="ws br">${brBar()}<div class="br-segrow">${brSegs()}<span class="br-segrow__n">${ico('lock')}SAMPLE RECORDS · NOTHING BOOKS FROM HERE</span></div><div class="br-grid ${wide ? 'br-grid--w' : ''}">${plates}<div class="br-cols">${brShipSide(r)}${brWork(r, { two: wide })}${brCarSide(r)}</div></div></div>${why ? phoneSheet(brWhy(), { side: true, label: 'Brokerage paused' }) : ''}`;
}

/* ── actions (none of them commercial) ── */
ACT['br.ship'] = (id) => {
  if (!SHIPMENTS[id]) return;
  WSX.br.id = id;
  WSX.pending = null;
  if (WSX.br.sec === 'quotes' && !brIsQuote(SHIPMENTS[id])) WSX.br.sec = 'shipments';
  if (WSX.br.sec === 'shipments' && brIsQuote(SHIPMENTS[id])) WSX.br.sec = 'quotes';
};
ACT['br.open'] = (id) => {
  ACT['br.ship'](id);
  WSX.br.side = 'load';
  WSX.sheet = true;
};
ACT['br.sec'] = (s) => {
  WSX.br.sec = s;
  WSX.pending = null;
  if (s === 'quotes') WSX.br.id = brRecs().find(brIsQuote)?.id ?? WSX.br.id;
  if (s === 'shipments') WSX.br.id = brRecs().find((x) => !brIsQuote(x))?.id ?? WSX.br.id;
  if (VP !== 'mobile') WSX.br.side = BR_HOME[s];
};
ACT['br.side'] = (s) => {
  WSX.br.side = s;
  WSX.pending = null;
};
ACT['br.why'] = () => {
  WSX.sheet = 'why';
  WSX.pending = null;
};

registerWorkspace({
  id: 'broker', no: '06', name: 'BROKERAGE', group: 'money', page: 'work', lane: 'brokerage', view: () => brokerView(),
  shape: 'A MATCH · PAUSED', line: 'SHIPPER, LOAD, CARRIER. PAUSED UNTIL ACTIVATED.',
  states: [['MAIN', []], ['SELECTED', [['br.ship', 'sh-4468']]], ['DEEPER', [['br.why', '']]], ['PHONE', [['br.open', 'sh-4471'], ['br.side', 'carrier']], 'phone']],
  demos: [
    ['TWO SIDES OF ONE LOAD', [['br.ship', 'sh-4471', 'LOAD 4471'], ['br.side', 'shipper', 'THE SHIPPER'], ['br.side', 'carrier', 'THE CARRIER · R&J TRUCKING'], ['br.sec', 'stops', 'STOPS AND STATUS']]],
    ['A QUOTE WITH NO CARRIER', [['br.sec', 'quotes', 'QUOTE 4468'], ['br.sec', 'offers', 'CARRIER OFFERS · NOT BUILT'], ['br.why', '', 'WHY IT IS PAUSED']]],
    ['FOLLOW THE CARRIER', [['br.ship', 'sh-4471', 'LOAD 4471'], ['go', 'comp:dl-rj-ucr', 'R&J UCR · OVERDUE'], ['ret', '', 'BACK TO LOAD 4471']]],
  ],
  audit: [[['br.sec', 'quotes']], [['br.sec', 'offers']], [['br.sec', 'stops']], [['br.sec', 'money']], [['br.ship', 'sh-4468'], ['br.sec', 'stops']], [['br.ship', 'sh-4468'], ['br.sec', 'money']], [['br.side', 'shipper']], [['br.ship', 'sh-4468'], ['br.side', 'carrier']]],
  phoneAct: { 'br.ship': 'br.open' },
  enter: (a, b) => {
    if (SHIPMENTS[a]) ACT['br.ship'](a);
    if (b && BR_HOME[b]) ACT['br.sec'](b);
  },
  label: () => SHIPMENTS[WSX.br.id]?.ref ?? 'BROKERAGE',
  route: (s) => {
    if (s[0] === 'work' && s[1] === 'brokerage') return true;
    if (s[0] === 'rec' && s[1] === 'shipment' && SHIPMENTS[s[2]]) return ACT['br.ship'](s[2]), true;
    return false;
  },
});
