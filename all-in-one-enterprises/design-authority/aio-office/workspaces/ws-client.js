/*
 * PROOF 04 — CLIENTS / CLIENT 360. Relationship-centered: the directory · the company (identity plate, the twelve
 * services as one connected line — lit where the client uses AIO — and one section at a time) · a drill-in panel that
 * keeps the path back (ABC TRUCKING LLC › INSURANCE › UNIT 1). Permissions hold inside it: billing is founder-only.
 */
const clRecords = (cid) => {
  const out = [];
  for (const [type, def] of Object.entries(RECORD_TYPES)) {
    if (['document', 'thread', 'invoice', 'application'].includes(type)) continue;
    for (const r of vals(def.table)) if (r.client === cid) out.push({ type, r, lane: def.lane, s: ov(`${type}:${r.id}`, statusWord(r)) });
  }
  return out;
};
const clOpen = (cid) => clRecords(cid).filter((x) => x.s && !['ok', 'mute'].includes(x.s[1]) && x.type !== 'vehicle' && x.type !== 'driver');
const stackTop = () => WSX.client.stack[WSX.client.stack.length - 1];

/* ── directory ── */
function clDirectory() {
  const { q, filter, id } = WSX.client;
  const list = vals(ACCOUNTS).filter((c) => (filter === 'all' || c.life.toLowerCase() === filter) && (!q || c.name.includes(q.toUpperCase())));
  const rows = list.map((c) => {
    const open = clOpen(c.id).length;
    return `<div class="pk cl-dir ${c.id === id ? 'is-sel' : ''}" data-a="cl.client" data-v="${c.id}">${badge(c)}<span style="min-width:0"><b class="pk__t">${c.name}</b><span class="pk__s">${c.state} · ${c.lanes.length} SERVICES</span></span><span class="cl-dir__r">${open ? `<b>${open}</b>` : ''}<i class="pip pip--${LIFE[c.life][1]}" title="${LIFE[c.life][0]}"></i></span></div>`;
  }).join('');
  return rgn('CLIENTS', `${list.length}`, '', `<div class="fl-rost__tools"><label class="wfld">${ico('search')}<input id="cl-q" data-input="cl.q" value="${q}" placeholder="FIND A CLIENT" aria-label="Find a client"></label>${VP === 'desktop' ? '' : seg([['all', 'ALL'], ['active', 'ACTIVE'], ['prebuilt', 'PREBUILT'], ['invited', 'INVITED']], filter, 'cl.filter')}</div>${rows || '<div class="grp">NO CLIENTS MATCH</div>'}`, 'cl-dirrg', 'cl-dir');
}

/* ── identity + services ── */
function clIdentity(c) {
  const meta = CLIENT_META[c.id];
  return `<section class="cl-id">
    <span class="cl-plate"><b>${c.b}</b></span>
    <div class="cl-id__t"><small>${c.dot} · ${c.mc} · ${c.state}</small><h2>${c.name}</h2><span>${sw(LIFE[c.life])}<em>${c.contact}</em><em>CLIENT SINCE ${meta.since}</em></span></div>
    <div class="cl-id__acts">${simBtn(`cl:msg:${c.id}`, { label: 'MESSAGE', effect: 'OPENS A CONVERSATION WITH THE PRIMARY CONTACT.', apply: () => {}, rec: `client:${c.id}` })}${simBtn(`cl:doc:${c.id}`, { label: 'REQUEST DOCUMENT', effect: 'ASKS THE CLIENT FOR A DOCUMENT IN THEIR OFFICE.', apply: () => {}, rec: `client:${c.id}` })}</div>
  </section>`;
}
const SVC_SHORT = { permitting: 'PERMITS', filing: 'FUEL TAX', compliance: 'COMPLIANCE', vehicles: 'FLEET', dispatch: 'DISPATCH', brokerage: 'BROKERAGE', insurance: 'INSURANCE', factoring: 'FACTORING', bookkeeping: 'BOOKS', drivers: 'DRIVERS', maintenance: 'SHOP', roadready: 'ROAD READY' };
function clServices(c) {
  const recs = clRecords(c.id);
  const nodes = LANES.map((l) => {
    const on = c.lanes.includes(l.slug);
    const mine = recs.filter((x) => x.lane === l.slug);
    const tone = mine.length ? worst(mine.map((x) => (x.s ? x.s[1] : 'ok'))) : 'ok';
    const sel = WSX.client.view === 'service' && WSX.client.service === l.slug;
    if (!on) return `<span class="cl-svc cl-svc--off" title="${l.name} · NOT USED">${ico(l.icon)}<span>${SVC_SHORT[l.slug]}</span></span>`;
    return `<button type="button" class="cl-svc ${sel ? 'is-on' : ''} cl-svc--${tone}" data-a="cl.service" data-v="${l.slug}" title="${l.name}">${ico(l.icon)}<i class="pip pip--${tone}"></i><span>${SVC_SHORT[l.slug]}</span>${mine.length ? `<em>${mine.length}</em>` : ''}</button>`;
  }).join('');
  return `<section class="cl-svcs"><div class="cl-svcs__h"><span class="rg__t">SERVICES</span><span class="rg__n">${c.lanes.length} OF 12 · LIT WHERE ${c.name.split(' ')[0]} USES AIO</span></div><div class="cl-svcs__line">${nodes}</div></section>`;
}
function clSections(c) {
  const items = [['overview', 'OVERVIEW'], ['fleet', 'FLEET', vals(VEHICLES).filter((v) => v.client === c.id).length], ['people', 'PEOPLE', vals(DRIVERS).filter((d) => d.client === c.id).length + 1], ['documents', 'DOCUMENTS', vals(DOCS).filter((d) => d.client === c.id).length], ['activity', 'ACTIVITY'], ...(FOUNDER ? [['billing', 'BILLING', vals(INVOICES).filter((i) => i.client === c.id).length]] : [])];
  const active = WSX.client.view === 'service' ? '' : WSX.client.view;
  const svc = WSX.client.view === 'service' ? `<span class="cl-focus">${ico(laneBySlug(WSX.client.service).icon)}${laneBySlug(WSX.client.service).name}<button type="button" class="cx__back" data-a="cl.view" data-v="overview" aria-label="Back to overview">${ico('close')}</button></span>` : '';
  return `<div class="cl-secs">${seg(items, active, 'cl.view', 'wseg--scroll')}${svc}</div>`;
}

/* ── the focused section ── */
const recRowCl = (type, r, extra = '') => {
  const s = ov(`${type}:${r.id}`, statusWord(r));
  const sel = stackTop() === `${type}:${r.id}`;
  return `<div class="pk cl-rec ${sel ? 'is-sel' : ''}" data-a="cl.push" data-v="${type}:${r.id}"><span class="cl-rec__i">${ico(OWNER_ICON[type])}</span><span style="min-width:0"><b class="pk__t">${RECORD_TYPES[type].title(r)}</b><span class="pk__s">${OWNER_LABEL[type]}${extra}</span></span>${sw(s)}</div>`;
};
function clContent(c) {
  const { view, service } = WSX.client;
  if (c.life !== 'ACTIVE' && view === 'overview') {
    const mig = vals(MIG_CASES).find((m) => m.client === c.id);
    return `<div class="cl-gate">${ico('lock')}<div><b>${c.life === 'PREBUILT' ? 'PREBUILT · NOT ACTIVE YET' : 'INVITED · AWAITING CLIENT CONFIRMATION'}</b><span>${c.life === 'PREBUILT' ? 'STAFF PREPARED THIS CLIENT. ONLY THE CLIENT’S CONFIRMATION MAKES IT ACTIVE.' : `INVITE SENT ${mig?.invited ?? ''}. NOTHING IS ACTIVE UNTIL THE CLIENT CONFIRMS.`}</span></div></div>${clOverview(c)}`;
  }
  if (view === 'overview') return clOverview(c);
  if (view === 'service') {
    const recs = clRecords(c.id).filter((x) => x.lane === service);
    return `<div class="rg rg--flat cl-list">${recs.map((x) => recRowCl(x.type, x.r, x.r.due ? ` · DUE ${x.r.due}` : x.r.exp ? ` · EXPIRES ${x.r.exp}` : '')).join('') || '<div class="grp">NO RECORDS IN THIS SERVICE YET</div>'}</div>`;
  }
  if (view === 'fleet') {
    const vs = vals(VEHICLES).filter((v) => v.client === c.id);
    return `<div class="cl-fleet">${vs.map((v) => {
      const s = vAvail(v);
      return `<button type="button" class="cl-truck ${stackTop() === `vehicle:${v.id}` ? 'is-sel' : ''}" data-a="cl.push" data-v="vehicle:${v.id}"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><b>${v.unit}</b><span>${v.ymm.replace(/^\d{4} /, '')}</span>${sw(s)}</button>`;
    }).join('') || '<div class="grp">NO TRUCKS ON FILE</div>'}</div>`;
  }
  if (view === 'people') return `<div class="rg rg--flat cl-list"><div class="pk"><span class="cl-rec__i">${ico('profile')}</span><span><b class="pk__t">${c.contact}</b><span class="pk__s">PRIMARY CONTACT</span></span>${sw(['CONTACT', 'mute'])}</div>${vals(DRIVERS).filter((d) => d.client === c.id).map((d) => recRowCl('driver', d, ` · ${d.cdl}`)).join('')}</div>`;
  if (view === 'documents') return `<div class="rg rg--flat cl-list">${vals(DOCS).filter((d) => d.client === c.id).map((d) => `<div class="pk cl-rec ${stackTop() === `document:${d.id}` ? 'is-sel' : ''}" data-a="cl.push" data-v="document:${d.id}"><span class="cl-rec__i">${ico('folder')}</span><span style="min-width:0"><b class="pk__t">${d.title}</b><span class="pk__s">${d.type} · ${d.added}</span></span><span class="vis ${d.vis === 'client' ? 'vis--client' : ''}">${d.vis === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY'}</span></div>`).join('') || '<div class="grp">NO DOCUMENTS YET</div>'}</div>`;
  if (view === 'activity') {
    const ev = [...clRecords(c.id).slice(0, 4).map((x) => [x.r.due || x.r.exp || 'OCT 2026', `${RECORD_TYPES[x.type].title(x.r)} · ${x.s?.[0] ?? ''}`]), [CLIENT_META[c.id].since, `CLIENT SINCE · ${CLIENT_META[c.id].via}`]];
    return `<div class="rg rg--flat" style="padding:12px 16px"><ul class="mh">${ev.map(([w, t]) => `<li><b>${t}</b><small>${w}</small></li>`).join('')}</ul></div>`;
  }
  if (view === 'billing') return `<div class="rg rg--flat cl-list">${vals(INVOICES).filter((i) => i.client === c.id).map((i) => `<div class="pk cl-rec ${stackTop() === `invoice:${i.id}` ? 'is-sel' : ''}" data-a="cl.push" data-v="invoice:${i.id}"><span class="cl-rec__i">${ico('summary')}</span><span><b class="pk__t">${i.ref}</b><span class="pk__s">${i.what}</span></span><span class="lt-amt">${i.amount}</span>${sw(ov(`invoice:${i.id}`, i.status))}</div>`).join('') || '<div class="grp">NO INVOICES</div>'}<div style="padding:10px 14px">${ntb('SAMPLE AMOUNTS · FOUNDER / BILLING GRANT ONLY')}</div></div>`;
  return '';
}
function clOverview(c) {
  const open = clOpen(c.id);
  const att = open.sort((a, b) => TONE_RANK[a.s[1]] - TONE_RANK[b.s[1]]).slice(0, 4);
  const trucks = vals(VEHICLES).filter((v) => v.client === c.id).length;
  const docs = vals(DOCS).filter((d) => d.client === c.id).length;
  const ppl = vals(DRIVERS).filter((d) => d.client === c.id).length;
  return `<div class="cl-ov">
    <div class="cl-ov__att"><div class="sec-l">NEEDS ATTENTION · ${open.length}</div><div class="rg rg--flat cl-list">${att.map((x) => recRowCl(x.type, x.r)).join('') || '<div class="grp">NOTHING NEEDS ATTENTION</div>'}</div></div>
    <div class="cl-ov__ro"><div class="sec-l">AT A GLANCE</div><div class="cl-glance">${[['fleet', trucks, 'TRUCKS'], ['people', ppl, 'DRIVERS'], ['documents', docs, 'DOCUMENTS'], ['overview', open.length, 'OPEN WORK']].map(([v, n, l]) => `<button type="button" class="cl-g" data-a="cl.view" data-v="${v}"><b>${n}</b><span>${l}</span></button>`).join('')}</div></div>
  </div>`;
}

/* ── drill-in panel ── */
function clStackLabel(key) {
  const [type, id] = key.split(':');
  const r = rec(type, id);
  return type === 'vehicle' ? r.unit : type === 'policy' ? 'POLICY' : type === 'driver' ? r.name : RECORD_TYPES[type].title(r).split(' · ')[0];
}
function clPanel(c) {
  const st = WSX.client.stack;
  const crumbs = [`<a data-a="cl.pop" data-v="0">${c.name}</a>`, ...(WSX.client.view === 'service' ? [`<a data-a="cl.pop" data-v="0">${laneBySlug(WSX.client.service).name}</a>`] : []), ...st.map((k, i) => (i === st.length - 1 ? `<span>${clStackLabel(k)}</span>` : `<a data-a="cl.pop" data-v="${i + 1}">${clStackLabel(k)}</a>`))].join(ico('fwd'));
  const back = st.length ? `<button type="button" class="cx__back" data-a="cl.back" aria-label="Back">${ico('back')}</button>` : '';
  if (!st.length) {
    const open = clOpen(c.id).sort((a, b) => TONE_RANK[a.s[1]] - TONE_RANK[b.s[1]]);
    const top = open[0];
    return `<section class="rg cx cl-cx"><header class="cx__h"><div class="cx__crumb">${crumbs}</div><h2 class="cx__t">THE RELATIONSHIP</h2></header><div class="cx__b" data-keep="cl-cx">${top ? nextBlock(RECORD_TYPES[top.type].title(top.r), `<button type="button" class="wbtn wbtn--gold" data-a="cl.push" data-v="${top.type}:${top.r.id}">OPEN ${ico('fwd')}</button>`) : nextBlock('NOTHING NEEDS ATTENTION', '', 'calm')}${facts([['CONTACT', c.contact], ['CLIENT SINCE', CLIENT_META[c.id].since, CLIENT_META[c.id].via], ['SERVICES', `${c.lanes.length} OF 12`], ['POWER UNITS', String(c.trucks)], ['LIFECYCLE', sw(LIFE[c.life])]])}${mhist(`client:${c.id}`, [...clRecords(c.id).filter((x) => x.r.due || x.r.exp).slice(0, 3).map((x) => [x.r.due || x.r.exp, RECORD_TYPES[x.type].title(x.r)]), [CLIENT_META[c.id].since, `CLIENT SINCE · ${CLIENT_META[c.id].via}`]])}</div></section>`;
  }
  const [type, id] = stackTop().split(':');
  const r = rec(type, id);
  return `<section class="rg cx cl-cx"><header class="cx__h"><div class="cx__crumb">${back}${crumbs}</div><h2 class="cx__t">${RECORD_TYPES[type].title(r)}</h2>${sw(ov(`${type}:${r.id}`, statusWord(r)))}</header><div class="cx__b ws-in" data-keep="cl-cx">${clRecordBody(type, r)}</div></section>`;
}
/** One record, in the client's context — linked records open on top of it; the crumb walks back. */
function clRecordBody(type, r) {
  const chip = (t, id, label) => `<button type="button" class="cl-link" data-a="cl.push" data-v="${t}:${id}">${ico(OWNER_ICON[t])}${label}${ico('fwd')}</button>`;
  if (type === 'policy') {
    const s = ov(`policy:${r.id}`, r.status);
    return `${r.days <= 7 && s[0] !== 'QUOTE SENT' ? nextBlock('SEND THE RENEWAL QUOTE', simBtn(`cl:pol:${r.id}`, { label: 'SEND QUOTE TO CLIENT', effect: 'SENDS THE RENEWAL SUMMARY TO THE CLIENT’S OFFICE. AIO NEVER BINDS COVERAGE.', apply: () => (WSX.over[`policy:${r.id}`] = ['QUOTE SENT', 'gold']), rec: `policy:${r.id}`, primary: true })) : nextBlock(r.renewal, '', 'calm')}
      ${facts([['COVERAGE', r.title], ['PLACED WITH', r.partner], ['EXPIRES', r.exp, daysWord(r.days)], ['OWNER', staffName(r.owner)]])}
      <div><div class="sec-l">COVERED TRUCKS</div><div class="cl-links">${r.vehicles.map((v) => chip('vehicle', v, VEHICLES[v].unit)).join('') || '<span class="pk__s">NONE LINKED</span>'}</div></div>
      ${r.docs.length ? `<div><div class="sec-l">DOCUMENTS</div>${r.docs.map(docChip).join('')}</div>` : ''}${ntb('REFERRAL AND ASSISTANCE ONLY — NOTHING IS BOUND')}`;
  }
  if (type === 'vehicle') {
    const conns = fleetConns(r);
    return `<div class="cl-vstage"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[r.id].cab)}</svg><span>${sw(vAvail(r))}</span></div>
      <div class="cl-conns">${CONN.map(([k, l, i]) => `<div class="cl-conn cl-conn--${conns[k].tone}">${ico(i)}<span><small>${l}</small><b>${conns[k].word}</b></span></div>`).join('')}</div>
      <button type="button" class="wbtn wbtn--gold" data-a="go" data-v="fleet:${r.id}">${ico('truck')}OPEN ${r.unit} IN FLEET</button>`;
  }
  if (type === 'driver') return `${facts([['CDL', r.cdl], ['MEDICAL CARD', r.med], ['TRUCK', r.vehicle ? VEHICLES[r.vehicle].unit : 'NONE']])}${r.vehicle ? `<div class="cl-links">${chip('vehicle', r.vehicle, VEHICLES[r.vehicle].unit)}</div>` : ''}${vals(DUES).filter((d) => d.links.includes(`driver:${r.id}`)).map((d) => `<button type="button" class="wbtn" data-a="go" data-v="comp:${d.id}">${ico('shield-check')}${d.what.split(' · ')[0]} · ${d.due.replace(', 2026', '')}</button>`).join('')}`;
  if (type === 'deadline') return `${nextBlock(DUE_META[r.id]?.need ?? r.what, `<button type="button" class="wbtn wbtn--gold" data-a="go" data-v="comp:${r.id}">${ico('shield-check')}OPEN IN COMPLIANCE</button>`)}${facts([['DUE', r.due, daysWord(r.days)], ['KIND', r.kind], ['OWNER', staffName(DUE_META[r.id]?.owner)]])}<div class="cl-links">${r.links.filter((k) => /^(vehicle|driver|policy):/.test(k)).map((k) => chip(k.split(':')[0], k.split(':')[1], clStackLabel(k))).join('')}</div>`;
  if (type === 'request') return `${r.blocker ? nextBlock(r.blocker, '', '') : nextBlock(`DUE ${r.due}`, '', 'calm')}${facts([['SERVICE', r.title], ['SECTION', r.section], ['DUE', r.due], ['OWNER', staffName(r.owner)]])}<div class="cl-links">${r.vehicles.map((v) => chip('vehicle', v, VEHICLES[v].unit)).join('')}</div>${r.docs.map(docChip).join('')}`;
  if (type === 'ticket') return `${nextBlock(ov(`ticket:${r.id}`, r.status)[0], '', 'calm')}${facts([['ISSUE', r.issue], ['PROVIDER', PROVIDERS[r.provider].name.replace('SAMPLE PROVIDER · ', '')], ['URGENCY', r.urgency]])}<div class="cl-links">${chip('vehicle', r.vehicle, VEHICLES[r.vehicle].unit)}</div>`;
  if (type === 'profile') return `<div class="cl-meter"><b>${r.done} OF ${r.total}</b><span class="cp-bar"><i style="width:${(r.done / r.total) * 100}%"></i></span></div>${r.items.slice(0, 6).map(([t, s, tone]) => `<div class="cl-chk">${sw([s, tone])}<span>${t}</span></div>`).join('')}${ntb('ROAD READY IS AVAILABLE, NOT ACTIVE, UNTIL THE CLIENT STARTS IT')}`;
  if (type === 'subscription' || type === 'cycle') return `${facts(type === 'cycle' ? [['PERIOD', r.period], ['STEP', CYCLE_STEPS[r.step]], ['DUE', r.due]] : [['PACKAGE', r.pkg], ['OWNER', staffName(r.owner)]])}<button type="button" class="wbtn wbtn--gold" data-a="go" data-v="books:${r.client}">${ico('calculator')}OPEN IN BOOKKEEPING</button>`;
  if (type === 'document') return `${docChip(r.id)}${facts([['BELONGS TO', clStackLabel(r.owner)], ['ADDED', r.added], ['STATUS', sw(r.status)]])}`;
  if (type === 'invoice') return FOUNDER ? `${facts([['FOR', r.what], ['AMOUNT', `${r.amount} <small>SAMPLE</small>`], ['DATE', r.date]])}${simBtn(`cl:inv:${r.id}`, { label: 'SEND REMINDER', effect: 'EMAILS A PAYMENT REMINDER. NO CHARGE IS MADE.', apply: () => {}, rec: `invoice:${r.id}`, founder: true })}` : ntb('BILLING IS FOUNDER / BILLING GRANT ONLY');
  if (type === 'quarter') return `${facts([['QUARTER', r.q], ['DUE', r.due], ['NEXT', r.next]])}`;
  if (type === 'load') return `${facts([['LANE', r.lane], ['PICKUP · DELIVERY', `${r.pickup} · ${r.delivery}`], ['TRUCK', VEHICLES[r.vehicle].unit]])}<div class="cl-links">${chip('vehicle', r.vehicle, VEHICLES[r.vehicle].unit)}</div>`;
  if (type === 'submission') return facts([['INVOICE', r.invoice], ['PROVIDER', r.provider], ['WAITING ON', r.blocker ?? '—']]);
  return facts([['RECORD', RECORD_TYPES[type].title(r)]]);
}

function clientBar(c) {
  const all = vals(ACCOUNTS);
  const n = (l) => all.filter((x) => x.life === l).length;
  const f = WSX.client.filter;
  const r = [ro(all.length, 'CLIENTS', { a: 'cl.filter', v: 'all', on: f === 'all' }), ro(n('ACTIVE'), 'ACTIVE', { a: 'cl.filter', v: 'active', on: f === 'active' }), ro(n('PREBUILT'), 'PREBUILT', { tone: 'gold', a: 'cl.filter', v: 'prebuilt', on: f === 'prebuilt' }), ro(n('INVITED'), 'INVITED', { tone: 'gold', a: 'cl.filter', v: 'invited', on: f === 'invited' })].join('');
  if (VP === 'mobile') return wsBar('MORE · CLIENTS', 'CLIENT 360', '', `<button type="button" class="wbtn wbtn--sm" data-a="cl.dir">${ico('people')}CLIENTS</button>`);
  return wsBar('MORE · CLIENTS', 'CLIENT 360', VP === 'tablet' ? '' : r, VP === 'tablet' ? `<button type="button" class="wbtn" data-a="cl.dir">${ico('people')}ALL CLIENTS</button>` : '');
}
function clientView() {
  const c = ACCOUNTS[WSX.client.id];
  const main = `<div class="cl-main">${clIdentity(c)}${clServices(c)}${clSections(c)}<div class="cl-body" data-keep="cl-body">${clContent(c)}</div></div>`;
  if (VP === 'mobile') {
    const sheet = WSX.sheet === 'dir' ? phoneSheet(`<div class="cx">${clDirectory()}</div>`) : phoneSheet(clPanel(c));
    return `<div class="ws cl cl--m">${clientBar(c)}${main}</div>${sheet}`;
  }
  if (VP === 'tablet') return `<div class="ws cl cl--t">${clientBar(c)}<div class="cl-t2">${main}${clPanel(c)}</div></div>${WSX.sheet === 'dir' ? phoneSheet(`<div class="cx">${clDirectory()}</div>`) : ''}`;
  return `<div class="ws cl">${clientBar(c)}<div class="cl-grid">${clDirectory()}${main}${clPanel(c)}</div></div>`;
}

ACT['cl.client'] = (id) => {
  Object.assign(WSX.client, { id, view: 'overview', service: null, stack: [] });
  WSX.sheet = false;
  WSX.pending = null;
};
ACT['cl.service'] = (slug) => {
  Object.assign(WSX.client, { view: 'service', service: slug, stack: [] });
  WSX.pending = null;
};
ACT['cl.view'] = (v) => {
  Object.assign(WSX.client, { view: v, service: null, stack: [] });
  WSX.pending = null;
};
ACT['cl.push'] = (key) => {
  const st = WSX.client.stack;
  if (st[st.length - 1] !== key) st.push(key);
  if (VP === 'mobile') WSX.sheet = true;
  WSX.pending = null;
};
ACT['cl.back'] = () => {
  WSX.client.stack.pop();
  WSX.pending = null;
  if (VP === 'mobile' && !WSX.client.stack.length) WSX.sheet = false;
};
ACT['cl.pop'] = (n) => {
  WSX.client.stack = WSX.client.stack.slice(0, Number(n));
  WSX.pending = null;
  if (VP === 'mobile' && !WSX.client.stack.length) WSX.sheet = false;
};
ACT['cl.dir'] = () => (WSX.sheet = 'dir');
ACT['cl.q'] = (q) => (WSX.client.q = q);
ACT['cl.filter'] = (f) => (WSX.client.filter = f);
