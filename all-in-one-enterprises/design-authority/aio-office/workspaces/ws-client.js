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
    return `<button type="button" class="cl-svc ${sel ? 'is-on' : ''} cl-svc--${tone}" data-a="cl.service" data-v="${l.slug}" title="${l.name}" aria-pressed="${sel}">${sel ? `<i class="cl-svc__ring" data-swap="ring:${c.id}:${l.slug}" aria-hidden="true"></i>` : ''}${ico(l.icon)}<i class="pip pip--${tone}"></i><span>${SVC_SHORT[l.slug]}</span>${mine.length ? `<em>${mine.length}</em>` : ''}</button>`;
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
  return `<div class="pk cl-rec ${sel ? 'is-sel' : ''}" data-a="cl.push" data-v="${type}:${r.id}" title="${RECORD_TYPES[type].title(r)}"><span class="cl-rec__i">${ico(OWNER_ICON[type])}</span><span style="min-width:0"><b class="pk__t">${RECORD_TYPES[type].title(r)}</b><span class="pk__s">${OWNER_LABEL[type]}${extra}</span></span>${sw(s)}</div>`;
};
function clContent(c) {
  const { view, service } = WSX.client;
  if (c.life !== 'ACTIVE' && view === 'overview') {
    const mig = vals(MIG_CASES).find((m) => m.client === c.id);
    return `<div class="cl-gate">${ico('lock')}<div><b>${c.life === 'PREBUILT' ? 'PREBUILT · NOT ACTIVE YET' : 'INVITED · AWAITING CLIENT CONFIRMATION'}</b><span>${c.life === 'PREBUILT' ? 'STAFF PREPARED THIS CLIENT. ONLY THE CLIENT’S CONFIRMATION MAKES IT ACTIVE.' : `INVITE SENT ${mig?.invited ?? ''}. NOTHING IS ACTIVE UNTIL THE CLIENT CONFIRMS.`}</span></div></div>${clOverview(c)}`;
  }
  if (view === 'overview') return clOverview(c);
  if (view === 'service') return clService(c, service);
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
const MON = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
/** 'OCT 20, 2026' → a sortable number (sample dates are all written this way). */
const dayOf = (d) => {
  const m = /^([A-Z]{3}) (\d{1,2}), (\d{4})$/.exec(d || '');
  return m ? Number(m[3]) * 400 + MON[m[1]] * 32 + Number(m[2]) : Infinity;
};
/** The service state: a plate for the service (what it is for this client, how much is open, the next date), its
 *  records, the trucks and documents those records touch, and the latest in the service. Only sample records. */
function clService(c, slug) {
  const lane = laneBySlug(slug);
  const recs = clRecords(c.id).filter((x) => x.lane === slug);
  const open = recs.filter((x) => x.s && !['ok', 'mute'].includes(x.s[1]));
  const worst = [...open].sort((a, b) => TONE_RANK[a.s[1]] - TONE_RANK[b.s[1]])[0];
  const dated = recs.map((x) => [x.r.due || x.r.exp, x]).filter(([d]) => d).sort((a, b) => dayOf(a[0]) - dayOf(b[0]));
  const vids = [...new Set(recs.flatMap((x) => x.r.vehicles || (x.r.vehicle ? [x.r.vehicle] : [])))].filter((id) => VEHICLES[id]);
  const docs = [...new Set(recs.flatMap((x) => x.r.docs || []))].filter((id) => DOCS[id]);
  const owners = [...new Set(recs.map((x) => x.r.owner).filter(Boolean))];
  const plate = `<div class="cl-sp" data-swap="sp:${c.id}:${slug}"><span class="cl-sp__i">${ico(lane.icon)}</span><span class="cl-sp__t"><small>SERVICE · ${c.name}</small><b>${lane.name}</b></span><span>${sw(worst ? [`${open.length} OPEN`, worst.s[1]] : recs.length ? ['ALL CURRENT', 'ok'] : ['NO RECORDS', 'mute'])}</span>
    <div class="cl-sp__ro">${ro(recs.length, 'RECORDS')}${ro(open.length, 'OPEN', { tone: open.length ? 'gold' : '' })}${ro(dated[0] ? dated[0][0].replace(/, \d{4}$/, '') : '—', 'NEXT DATE')}${ro(owners.length ? owners.map((o) => STAFF[o]?.b ?? '—').join(' · ') : '—', 'OWNER')}</div></div>`;
  const list = `<div class="rg rg--flat cl-list">${recs.map((x) => recRowCl(x.type, x.r, x.r.due ? ` · DUE ${x.r.due}` : x.r.exp ? ` · EXPIRES ${x.r.exp}` : '')).join('') || '<div class="grp">NO RECORDS IN THIS SERVICE YET</div>'}</div>`;
  const trucks = vids.length ? `<div><div class="sec-l"><span>TRUCKS ON THESE RECORDS · ${vids.length}</span></div><div class="cl-ovfleet">${vids.slice(0, 2).map((id) => { const v = VEHICLES[id]; return `<button type="button" class="cl-truck cl-truck--xs" data-a="cl.push" data-v="vehicle:${v.id}" aria-label="${v.unit} · ${vAvail(v)[0]}" title="${v.unit} · ${vAvail(v)[0]}"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><span class="cl-truck__l"><b>${v.unit}</b>${sw([vAvail(v)[0].split(' · ')[0], vAvail(v)[1]])}</span></button>`; }).join('')}</div></div>` : '';
  const papers = docs.length ? `<div><div class="sec-l"><span>DOCUMENTS · ${docs.length}</span></div><div class="rg rg--flat cl-list">${docs.slice(0, 3).map((id) => { const d = DOCS[id]; return `<div class="pk cl-rec ${stackTop() === `document:${d.id}` ? 'is-sel' : ''}" data-a="cl.push" data-v="document:${d.id}" title="${d.title}"><span class="cl-rec__i">${ico('folder')}</span><span style="min-width:0"><b class="pk__t">${d.title}</b><span class="pk__s">${d.type} · ${d.added}</span></span></div>`; }).join('')}</div></div>` : '';
  const latest = dated.length ? mhist(`svc:${c.id}:${slug}`, dated.slice(0, 3).map(([d, x]) => [d, `${RECORD_TYPES[x.type].title(x.r)} · ${x.s?.[0] ?? ''}`]), 'DATES IN THIS SERVICE') : '';
  const row = [trucks, papers || latest].filter(Boolean);
  return `<div class="cl-sv">${plate}${list}${row.length ? `<div class="cl-sv__row">${row.join('')}</div>` : ''}${papers && latest ? latest : ''}</div>`;
}
function clOverview(c) {
  const open = clOpen(c.id);
  const att = open.sort((a, b) => TONE_RANK[a.s[1]] - TONE_RANK[b.s[1]]);
  const vs = vals(VEHICLES).filter((v) => v.client === c.id);
  const docs = vals(DOCS).filter((d) => d.client === c.id).length;
  const ppl = vals(DRIVERS).filter((d) => d.client === c.id).length;
  // the overview fits one screen: with a fleet to show, a desktop lists the two most urgent (the count says how many)
  const show = !vs.length ? 5 : WSX.device === 'wide' ? 4 : WSX.device === 'desktop' ? 2 : 3;
  // figures are instruments: one strip, each one opens its section
  const strip = `<div class="ros cl-ros">${ro(open.length, 'OPEN WORK', { tone: open.length ? 'gold' : '' })}${ro(vs.length, 'TRUCKS', { a: 'cl.view', v: 'fleet' })}${ro(ppl, 'DRIVERS', { a: 'cl.view', v: 'people' })}${ro(docs, 'DOCUMENTS', { a: 'cl.view', v: 'documents' })}</div>`;
  const attention = `<div class="cl-ov__att"><div class="sec-l"><span>NEEDS ATTENTION · ${open.length}</span>${open.length > show ? `<span>${show} SHOWN</span>` : ''}</div><div class="rg rg--flat cl-list">${att.slice(0, show).map((x) => recRowCl(x.type, x.r)).join('') || '<div class="grp">NOTHING NEEDS ATTENTION</div>'}</div></div>`;
  const fleet = vs.length ? `<div class="cl-ov__fleet"><div class="sec-l"><span>THEIR FLEET · ${vs.length}</span><a data-a="cl.view" data-v="fleet">ALL ${ico('fwd')}</a></div><div class="cl-ovfleet">${vs.slice(0, 2).map((v) => `<button type="button" class="cl-truck cl-truck--xs" data-a="cl.push" data-v="vehicle:${v.id}" aria-label="${v.unit} · ${vAvail(v)[0]}" title="${v.unit} · ${vAvail(v)[0]}"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><span class="cl-truck__l"><b>${v.unit}</b>${sw([vAvail(v)[0].split(' · ')[0], vAvail(v)[1]])}</span></button>`).join('')}</div></div>` : '';
  const latest = `<div class="cl-ov__act">${mhist(`client:${c.id}`, [...clRecords(c.id).filter((x) => x.r.due || x.r.exp).slice(0, 2).map((x) => [x.r.due || x.r.exp, RECORD_TYPES[x.type].title(x.r)]), [CLIENT_META[c.id].since, `CLIENT SINCE · ${CLIENT_META[c.id].via}`]], 'LATEST')}</div>`;
  return `<div class="cl-ov">${strip}${attention}${fleet ? `<div class="cl-ov__row">${fleet}${latest}</div>` : latest}</div>`;
}

/* ── drill-in panel ── */
const CRUMB = { policy: 'POLICY', request: 'REQUEST', document: 'DOCUMENT', deadline: 'DEADLINE', quarter: 'IFTA', invoice: 'INVOICE', subscription: 'PACKAGE', cycle: 'CLOSE', profile: 'ROAD READY', submission: 'SUBMISSION' };
/** The breadcrumb word for a record: short enough that the trail stays on one line. */
function clStackLabel(key) {
  const [type, id] = key.split(':');
  const r = rec(type, id);
  if (type === 'vehicle') return r.unit;
  if (type === 'driver') return r.name.split(' ').map((w, i, a) => (i < a.length - 1 ? `${w[0]}.` : w)).join(' ');
  if (type === 'ticket' || type === 'load') return r.ref;
  return CRUMB[type] ?? RECORD_TYPES[type].title(r).split(' · ')[0];
}
/** The record plate: the client's own identity language, carried into whatever is open. */
function recPlate(c, type, title, status, key) {
  return `<div class="cl-rp" data-swap="rp:${key}"><span class="cl-rp__i">${ico(OWNER_ICON[type] || 'company')}</span><span class="cl-rp__t"><small>${OWNER_LABEL[type] || 'CLIENT'} · ${c.name}</small><b>${title}</b></span>${status ? `<span class="cl-rp__s">${sw(status)}</span>` : ''}</div>`;
}
function clPanel(c) {
  const st = WSX.client.stack;
  const svc = WSX.client.view === 'service' ? laneBySlug(WSX.client.service) : null;
  const crumbs = [`<a data-a="cl.pop" data-v="0" title="${c.name}">${c.b}</a>`, ...(svc ? [`<a data-a="cl.pop" data-v="0" title="${svc.name}">${SVC_SHORT[svc.slug]}</a>`] : []), ...st.map((k, i) => (i === st.length - 1 ? `<span>${clStackLabel(k)}</span>` : `<a data-a="cl.pop" data-v="${i + 1}">${clStackLabel(k)}</a>`))].join(ico('fwd'));
  const back = st.length ? `<button type="button" class="cx__back" data-a="cl.back" aria-label="Back">${ico('back')}</button>` : '';
  if (!st.length) {
    const open = clOpen(c.id).sort((a, b) => TONE_RANK[a.s[1]] - TONE_RANK[b.s[1]]);
    const top = open[0];
    return `<section class="rg cx cl-cx"><header class="cx__h">${recPlate(c, 'client', 'THE RELATIONSHIP', [LIFE[c.life][0].split(' · ')[0], LIFE[c.life][1]], `rel:${c.id}`)}</header><div class="cx__b" data-keep="cl-cx" data-swap="b:rel:${c.id}">${top ? nextBlock(RECORD_TYPES[top.type].title(top.r), `<button type="button" class="wbtn wbtn--gold" data-a="cl.push" data-v="${top.type}:${top.r.id}">OPEN ${ico('fwd')}</button>`) : nextBlock('NOTHING NEEDS ATTENTION', '', 'calm')}${facts([['CONTACT', c.contact], ['CLIENT SINCE', CLIENT_META[c.id].since, CLIENT_META[c.id].via], ['SERVICES', `${c.lanes.length} OF 12`], ['POWER UNITS', String(c.trucks)], ['LIFECYCLE', sw(LIFE[c.life])]])}${mhist(`client:${c.id}`, [...clRecords(c.id).filter((x) => x.r.due || x.r.exp).slice(0, 3).map((x) => [x.r.due || x.r.exp, RECORD_TYPES[x.type].title(x.r)]), [CLIENT_META[c.id].since, `CLIENT SINCE · ${CLIENT_META[c.id].via}`]])}</div></section>`;
  }
  const [type, id] = stackTop().split(':');
  const r = rec(type, id);
  const key = `${c.id}:${stackTop()}`;
  return `<section class="rg cx cl-cx"><header class="cx__h"><div class="cx__crumb">${back}${crumbs}</div>${recPlate(c, type, RECORD_TYPES[type].title(r), ov(`${type}:${r.id}`, statusWord(r)), key)}</header><div class="cx__b" data-keep="cl-cx" data-swap="b:${key}">${clRecordBody(type, r)}</div></section>`;
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
    return `<div class="fl-slab fl-slab--mini"><div class="cl-vstage"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[r.id].cab)}</svg><span>${sw(vAvail(r))}</span><b>${r.unit}</b></div>
      <div class="fl-cluster">${CONN.map(([k, l, i]) => `<button type="button" class="fl-cg fl-cg--${conns[k].tone}" data-a="go" data-v="fleet:${r.id}:${k}" aria-label="${l} · ${conns[k].word} — open in Fleet">${ico(i)}<span>${l}</span><small>${conns[k].tagW || conns[k].word}</small></button>`).join('')}</div></div>
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
  const main = `<div class="cl-main">${clIdentity(c)}${clServices(c)}${clSections(c)}<div class="cl-body" data-keep="cl-body" data-swap="body:${c.id}:${WSX.client.view}:${WSX.client.service ?? ''}">${clContent(c)}</div></div>`;
  if (VP === 'mobile') {
    const sheet = WSX.sheet === 'dir' ? phoneSheet(`<div class="cx">${clDirectory()}</div>`, { label: 'Clients' }) : phoneSheet(clPanel(c), { label: ACCOUNTS[WSX.client.id].name });
    return `<div class="ws cl cl--m">${clientBar(c)}${main}</div>${sheet}`;
  }
  if (VP === 'tablet') return `<div class="ws cl cl--t">${clientBar(c)}<div class="cl-t2">${main}${clPanel(c)}</div></div>${WSX.sheet === 'dir' ? phoneSheet(`<div class="cx">${clDirectory()}</div>`, { side: true, label: 'Clients' }) : ''}`;
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
