/*
 * AIO OFFICE unified review — HOME detail pages, Client 360 and the record pages every lane opens.
 * A record page is one family for every record type: header + status, client context, the record's own working
 * panel, history (simulated steps marked), actions (simulated; founder-only ones hidden for staff) and related records
 * — linked, never copied. Each type adds the panel its work needs (a renewal, a load, a close, a checklist…).
 */
const laneBySlug = (slug) => LANES.find((l) => l.slug === slug);
const recRoute = (type, id) => `rec/${type}/${id}`;
const MORE_LABEL = { documents: 'DOCUMENTS & VAULT', messages: 'MESSAGES' };
const laneLabel = (slug) => laneBySlug(slug)?.name ?? MORE_LABEL[slug] ?? slug.toUpperCase();
const isOpen = (s) => s && s[1] !== 'ok';

/** A related-record entry from a "type:id" key. */
function refItem(key, why = '') {
  const [type, id] = key.split(':');
  const r = rec(type, id);
  if (!r) return null;
  return { lane: OWNER_LABEL[type], title: RECORD_TYPES[type].title(r), go: recRoute(type, id), why, status: statusOf(type, r, statusWord(r)) };
}
/** A linked card on a record: what this record is connected to in another service (or that nothing is). */
function linkCard(label, icon, key, none = 'NONE ON FILE') {
  const item = key ? refItem(key) : null;
  if (!item) return `<div class="lk lk--none"><span class="lk__l">${ico(icon)}${label}</span><b>${none}</b></div>`;
  return `<div class="lk" data-go="${item.go}"><span class="lk__l">${ico(icon)}${label}</span><b>${item.title}</b>${item.status ? st(item.status) : ''}</div>`;
}
const docsOf = (key) => Object.values(DOCS).filter((d) => d.owner === key);
function docRows(list, empty = 'NO DOCUMENTS ON THIS RECORD') {
  return rows(
    list.map((d) => ({ go: recRoute('document', d.id), lead: icoTile('folder'), title: d.title, sub: `${d.type} · ${d.added}`, meta: d.vis === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY', status: statusOf('document', d, d.status) })),
    empty,
  );
}
function returnBar() {
  if (!APP.origin) return '';
  const r = parse(APP.origin);
  const l = laneBySlug(r.seg[1]);
  const label = l ? `${l.name}${r.seg[2] ? ` › ${r.seg[2].replace(/_/g, ' ').toUpperCase()}` : ''}` : r.seg[1] === 'mine' ? 'MY WORK' : 'ALL OPEN WORK';
  return `<div class="ret"><span class="btn btn--sm" data-go="${APP.origin}">${ico('back')}RETURN TO WORK · ${label}</span></div>`;
}

/* ═══════════════ HOME detail ═══════════════ */
function homePage(r) {
  const [, page, view] = r.seg;
  if (page === 'list') return homeList(view, r);
  if (page === 'activity') return homeActivity(r);
  if (page === 'quick') return homeQuick();
  if (page === 'notifications') return notifications();
  return missing(r);
}
function homeList(view, r) {
  const v = HOME_LISTS[view] ? view : 'attention';
  meta('HOME › FULL LISTS', 'NEW · FOR REVIEW', 'LIVE: PARTIAL — ATTENTION, DEADLINES AND BLOCKERS READ FROM THE CONNECTED LANES');
  const all = HOME_LISTS[v];
  const items = all.filter((i) => !r.filter || i[5] === r.filter);
  const lanes = [...new Set(all.map((i) => i[5]))];
  const titles = { attention: 'NEEDS ATTENTION', deadlines: 'DUE THIS WEEK', blocked: 'BLOCKED' };
  const toRow = (i) => ({ go: i[2], lead: badge(client(i[3])), title: clientName(i[3]), sub: i[4], meta: `${laneLabel(i[5])} · ${i[6]}`, status: [i[0], i[1]] });
  let list;
  if (v === 'blocked') {
    const groups = [...new Set(items.map((i) => i[7]))];
    list = groups.map((g) => `<div class="win__h" style="margin-top:12px">${g}</div>${rows(items.filter((i) => i[7] === g).map(toRow))}`).join('');
  } else list = rows(items.map(toRow), 'NOTHING IN THIS LANE');
  const honest = FOUNDER ? notice('<b>NOT CONNECTED YET:</b> COMPLIANCE EXCEPTIONS · DISPATCH EXCEPTIONS · MAINTENANCE HOLDS · ROAD READY ITEMS. THEY JOIN THIS LIST WHEN THEIR SOURCES ARE CONNECTED.') : '';
  return `<main class="main">${pageHead({ trail: [['HOME', 'home'], [titles[v]]], title: titles[v], sub: 'EVERY ITEM OPENS WHERE IT GETS FIXED. SAMPLE RECORDS.', chips: [['SAMPLE', 'mute']] })}
    ${tabs([['attention', 'NEEDS ATTENTION', 7, 'home/list/attention'], ['deadlines', 'DUE THIS WEEK', 4, 'home/list/deadlines'], ['blocked', 'BLOCKED', 2, 'home/list/blocked', 'bad']], v)}
    ${filterChips([['all', 'ALL LANES', all.length], ...lanes.map((l) => [l, laneLabel(l), all.filter((i) => i[5] === l).length])], r.filter || 'all', `home/list/${v}`)}
    ${list}${honest}</main>`;
}
const MORE_ACTIVITY = [
  { go: 'rec/load/ld-5518', t: 'LOAD 5518 DELIVERED — PROOF OF DELIVERY STILL NEEDED', time: 'YESTERDAY', vis: 'internal' },
  { go: 'rec/cycle/cy-tk-sep', t: 'SEPTEMBER BOOKS: 3 QUESTIONS SENT TO T&K TRANSPORT', time: '2 DAYS AGO', vis: 'client' },
  { go: 'rec/ticket/t-tk-2', t: 'REPAIR ESTIMATE UPLOADED FOR UNIT 09', time: '3 HRS AGO', vis: 'client' },
  { go: 'intake/case/mig-hc', t: 'ACTIVATION INVITE SENT TO HEARTLAND FREIGHT CO.', time: 'OCT 6', vis: 'internal' },
];
function homeActivity(r) {
  meta('HOME › RECENT ACTIVITY', 'NEW · FOR REVIEW', 'LIVE: PARTIAL — ONE ACTIVITY FEED DOES NOT EXIST YET; EVENTS ARE SPREAD ACROSS LANES');
  const all = [...ACTIVITY, ...MORE_ACTIVITY].filter((e) => FOUNDER || !e.founder);
  const list = all.filter((e) => !r.filter || e.vis === r.filter);
  return `<main class="main">${pageHead({ trail: [['HOME', 'home'], ['RECENT ACTIVITY']], title: 'RECENT ACTIVITY', sub: 'WHAT CHANGED ACROSS AIO. EACH EVENT OPENS THE RECORD IT BELONGS TO.', chips: [['SAMPLE', 'mute']] })}
    ${filterChips([['all', 'ALL', all.length], ['client', 'CLIENT-VISIBLE', all.filter((e) => e.vis === 'client').length], ['internal', 'INTERNAL', all.filter((e) => e.vis === 'internal').length]], r.filter || 'all', 'home/activity')}
    <div class="panel">${list.map((e) => `<div class="erow" data-go="${e.go}"><span class="erow__mark"></span><span class="erow__text">${e.t}</span><span class="erow__time">${e.time}</span><span class="erow__meta"><span class="tag-vis tag-vis--${e.vis}">${e.vis === 'client' ? 'CLIENT-VISIBLE' : 'INTERNAL'}</span></span></div>`).join('')}</div>
    ${notice('ONE OFFICE-WIDE ACTIVITY FEED IS NOT BUILT YET. THESE EVENTS COME FROM EACH LANE’S OWN HISTORY.')}</main>`;
}
function homeQuick() {
  meta('HOME › QUICK ACTIONS', 'NEW · FOR REVIEW', 'LIVE: PARTIAL');
  return `<main class="main">${pageHead({ trail: [['HOME', 'home'], ['QUICK ACTIONS']], title: 'QUICK ACTIONS', sub: 'EACH ONE OPENS WHERE THE WORK IS DONE.' })}${quickList(quickItems())}
    ${FOUNDER ? '' : notice('ASSIGN WORK, NEW LEAD AND CREATE INVOICE APPEAR WHEN YOUR ROLE IS GRANTED THEM.')}</main>`;
}
function notifications() {
  meta('HOME › NOTIFICATIONS', 'NEW · FOR REVIEW', 'LIVE: NOT BUILT — THE BELL HAS NO FEED YET', 'Designed so Composer can connect it to the lanes’ events.');
  const items = [
    ['MASON TRANSPORT REPLIED', 'WHEN WILL MY AUTHORITY BE ACTIVE?', 'rec/thread/th-mt', '1 HR AGO', ['NEW', 'gold']],
    ['T&K TRANSPORT UPLOADED 3 DOCUMENTS', 'FUEL RECEIPTS · BILL OF LADING · REPAIR ESTIMATE', 'more/documents_vault@c-tk', '3 HRS AGO', ['NEW', 'gold']],
    ['ASSIGNED TO YOU', 'MC AUTHORITY REINSTATEMENT · HORIZON FREIGHT', 'rec/request/req-hf-mc', '2 DAYS AGO', null],
    ['READY FOR REVIEW', 'Q3 2026 IFTA RETURN · RIVERSTONE LOGISTICS', 'rec/quarter/ifta-rl-q3', '5 HRS AGO', null],
    ['EXPIRING IN 6 DAYS', 'AUTO LIABILITY · DELTA HAULING LLC', 'rec/policy/pol-dh', 'TODAY', ['URGENT', 'bad']],
  ];
  return `<main class="main">${pageHead({ trail: [['HOME', 'home'], ['NOTIFICATIONS']], title: 'NOTIFICATIONS', sub: 'WHAT CHANGED FOR YOU. EACH ONE OPENS ITS RECORD.', chips: [['SAMPLE', 'mute'], ['NOT BUILT YET', 'mute']], actions: actionsBar([{ label: 'MARK ALL READ', sim: 'notif-read', effect: 'CLEAR THE UNREAD MARK ON EVERY NOTIFICATION FOR YOU ONLY.' }]) })}
    ${rows(items.map(([t, s, go, when, status]) => ({ go, lead: icoTile('bell'), title: t, sub: s, meta: when, status })))}</main>`;
}

/* ═══════════════ CLIENT 360 ═══════════════ */
function clientRecords(id) {
  const out = [];
  for (const [type, def] of Object.entries(RECORD_TYPES)) {
    if (['document', 'thread', 'invoice'].includes(type)) continue;
    for (const r of Object.values(def.table)) if (r.client === id) out.push({ type, r, s: statusOf(type, r, statusWord(r)) });
  }
  return out;
}
function client360(id, tab, r) {
  const c = client(id);
  if (!c) return missing(r);
  APP.ctx = id;
  meta('CLIENT 360', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · /office/clients/:id — SERVICES ARE SPREAD ACROSS LANE PAGES TODAY', 'One client record; every service reads it, none copies it.');
  const recs = clientRecords(id);
  const open = recs.filter((x) => isOpen(x.s) && x.type !== 'vehicle' && x.type !== 'driver');
  const docs = Object.values(DOCS).filter((d) => d.client === id);
  const threads = Object.values(THREADS).filter((t) => t.client === id);
  const vehicles = Object.values(VEHICLES).filter((v) => v.client === id);
  const drivers = Object.values(DRIVERS).filter((d) => d.client === id);
  const invoices = Object.values(INVOICES).filter((i) => i.client === id);
  const mig = Object.values(MIG_CASES).find((m) => m.client === id);
  const T = [
    ['overview', 'OVERVIEW', null],
    ['services', 'SERVICES', c.lanes.length],
    ['vehicles', 'VEHICLES', vehicles.length],
    ['people', 'PEOPLE', drivers.length + 1],
    ['documents', 'DOCUMENTS', docs.length],
    ['messages', 'MESSAGES', threads.length],
    ['history', 'HISTORY', null],
    ...(FOUNDER ? [['billing', 'BILLING', invoices.length]] : []),
  ].map(([k, l, n]) => [k, l, n, `client/${id}/${k}`]);
  const life =
    c.life === 'PREBUILT'
      ? `<div class="gate">${ico('lock')}<div><b>PREBUILT · NOT ACTIVE YET.</b><span>STAFF PREPARED THIS CLIENT FROM THEIR FILES. PREPARATION DOES NOT MAKE A CLIENT ACTIVE — THE CLIENT CONFIRMS IN THEIR OWN OFFICE. SERVICES SHOWN HERE ARE BEING PREPARED, NOT DELIVERED.</span></div></div>`
      : c.life === 'INVITED'
        ? `<div class="gate">${ico('letter')}<div><b>INVITED · AWAITING CLIENT CONFIRMATION.</b><span>THE ACTIVATION INVITE WAS SENT ${mig?.invited ?? ''}. NOTHING BECOMES ACTIVE UNTIL THE CLIENT CONFIRMS. STAFF NEVER CONFIRM ON THEIR BEHALF.</span></div></div>`
        : '';
  let body = '';
  if (tab === 'overview') {
    body = `<div class="split"><div class="stack">
      ${section('ACCOUNT', 'THE ONE RECORD EVERY SERVICE READS.', kv([['LEGAL NAME', c.name], ['USDOT', c.dot.replace('USDOT ', '')], ['MC', c.mc.replace('MC ', '')], ['BASE STATE', c.state], ['PRIMARY CONTACT', c.contact], ['POWER UNITS', String(c.trucks), 'FROM VEHICLES & FLEET'], ['LIFECYCLE', st(LIFE[c.life])], ['MIGRATION', mig ? `<a data-go="intake/case/${mig.id}" class="lnk">${mig.stage[0]}</a>` : 'NOT MIGRATED']], 2))}
      ${section('OPEN WORK', `${open.length} OPEN ACROSS ${new Set(open.map((x) => RECORD_TYPES[x.type].lane)).size} SERVICES.`, rows(open.map((x) => ({ go: recRoute(x.type, x.r.id), lead: icoTile(OWNER_ICON[x.type]), title: RECORD_TYPES[x.type].title(x.r), sub: OWNER_LABEL[x.type], status: x.s })), 'NOTHING OPEN FOR THIS CLIENT'))}
    </div><aside class="aside">
      ${section('SERVICES', 'OPEN A LANE FILTERED TO THIS CLIENT.', `<div class="panel rows">${c.lanes.map((s) => `<div class="row" data-go="work/${s}@${id}"><span class="row__lead">${icoTile(laneBySlug(s).icon)}</span><span class="row__t"><b>${laneBySlug(s).name}</b><small>${recs.filter((x) => RECORD_TYPES[x.type].lane === s).length} RECORDS</small></span>${ico('fwd', 'chev')}</div>`).join('')}</div>`)}
      ${section('MESSAGES', '', threads.length ? rows(threads.map((t) => ({ go: recRoute('thread', t.id), lead: icoTile('letter'), title: t.subject, status: statusOf('thread', t, t.status) }))) : rows([], 'NO CONVERSATIONS'))}
    </aside></div>`;
  }
  if (tab === 'services') {
    body = c.lanes
      .map((s) => {
        const list = recs.filter((x) => RECORD_TYPES[x.type].lane === s);
        return section(laneBySlug(s).name, '', rows(list.map((x) => ({ go: recRoute(x.type, x.r.id), title: RECORD_TYPES[x.type].title(x.r), sub: OWNER_LABEL[x.type], status: x.s })), 'NO RECORDS YET IN THIS SERVICE'), `<span class="btn btn--sm" data-go="work/${s}@${id}">OPEN LANE ${ico('fwd')}</span>`);
      })
      .join('');
  }
  if (tab === 'vehicles') body = section('POWER UNITS', 'EACH TRUCK IS ONE RECORD THAT EVERY SERVICE POINTS TO.', vehicles.length ? `<div class="fleet">${vehicles.map(unitCard).join('')}</div>` : stateBlock({ kind: 'empty', title: 'NO VEHICLES ON FILE', body: 'VEHICLES APPEAR WHEN THE CLIENT OR STAFF ADD THEM.' }));
  if (tab === 'people') body = section('PEOPLE', 'CONTACTS AND DRIVERS.', rows([{ lead: badge(c), title: c.contact, sub: 'PRIMARY CONTACT · OWNER OF THE ACCOUNT', sim: 'contact', status: ['CONTACT', 'mute'] }, ...drivers.map((d) => ({ go: recRoute('driver', d.id), lead: icoTile('steering'), title: d.name, sub: `${d.cdl} · ${d.med}`, status: statusOf('driver', d, d.status) }))]));
  if (tab === 'documents') body = section('DOCUMENTS', 'EACH ONE IS STAFF ONLY OR CLIENT-VISIBLE.', docRows(docs, 'NO DOCUMENTS YET'));
  if (tab === 'messages') body = section('MESSAGES', '', threads.length ? rows(threads.map((t) => ({ go: recRoute('thread', t.id), lead: icoTile('letter'), title: t.subject, sub: `${t.msgs.length} MESSAGES`, status: statusOf('thread', t, t.status) }))) : rows([], 'NO CONVERSATIONS YET'));
  if (tab === 'history') body = section('HISTORY', 'ACCOUNT EVENTS, NEWEST FIRST.', timeline([...(SESSION.history[`client:${id}`] || []), ...(mig ? [[mig.confirmed ?? mig.started, mig.confirmed ? 'CLIENT CONFIRMED THEIR INFORMATION — ACTIVE' : `MIGRATION STARTED · ${mig.source}`, mig.confirmed ? c.contact.split(' · ')[0] : staffName(mig.owner), mig.confirmed ? 'client' : 'internal']] : []), ['OCT 1, 2026', 'ACCOUNT REVIEWED BY STAFF', 'JORDAN LEE', 'internal']]));
  if (tab === 'billing') body = FOUNDER ? section('BILLING', 'INVOICES FOR THIS CLIENT · FOUNDER / BILLING GRANT.', rows(invoices.map((i) => ({ go: recRoute('invoice', i.id), title: i.ref, sub: i.what, meta: `${i.amount} · ${i.date}`, status: statusOf('invoice', i, i.status) })), 'NO INVOICES')) : permissionPage('BILLING', 'THE BILLING GRANT', `client/${id}`);
  return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['CLIENTS', 'more/clients'], [c.name]], title: c.name, sub: `CLIENT 360 · ${c.dot} · ${c.mc} · ${c.state}`, chips: [LIFE[c.life]], actions: actionsBar([{ label: 'MESSAGE CLIENT', sim: 'msg-client', ico: 'letter', effect: 'OPEN A NEW CONVERSATION WITH THE CLIENT’S PRIMARY CONTACT.' }, { label: 'REQUEST DOCUMENT', sim: 'req-doc', ico: 'folder', effect: 'ASK THE CLIENT FOR A DOCUMENT; IT APPEARS IN THEIR OFFICE AS A REQUEST.' }]) })}
    ${returnBar()}${life}${tabs(T, tab)}<div style="margin-top:12px">${body}</div></main>`;
}
function unitCard(v) {
  const s = statusOf('vehicle', v, v.avail);
  const chips = [
    v.driver ? ['DRIVER', ''] : ['NO DRIVER', 'is-warn'],
    v.policy ? ['INSURED', ''] : ['NO POLICY ON FILE', 'is-warn'],
    v.ticket ? ['OPEN TICKET', 'is-bad'] : null,
    v.compliance.length ? [`${v.compliance.length} DEADLINE${v.compliance.length > 1 ? 'S' : ''}`, 'is-warn'] : null,
    v.quarter ? ['IFTA', ''] : null,
    v.load ? ['ON LOAD', ''] : null,
  ].filter(Boolean);
  return `<div class="unit" data-go="rec/vehicle/${v.id}"><div class="unit__top"><span class="unit__ico">${ico('truck')}</span><span class="unit__t"><b>${v.unit}</b><small>${v.ymm}</small></span></div>
    <div>${st(s)}</div><div class="unit__links">${chips.map(([t, c]) => `<span class="${c}">${t}</span>`).join('')}</div><small class="muted">${clientName(v.client)} · ${v.plate}</small></div>`;
}

/* ═══════════════ RECORD PAGES ═══════════════ */
function recordFrame({ type, r, title, sub = '', chips = [], main, actions = [], rel = [], history = [], aside = '' }) {
  if (r.client) APP.ctx = r.client;
  const lane = RECORD_TYPES[type].lane;
  const L = lane && laneBySlug(lane);
  const more = { document: ['DOCUMENTS & VAULT', 'more/documents_vault'], thread: ['MESSAGES', 'more/messages'], invoice: ['BILLING', 'more/billing'] }[type];
  const trail = L ? [['WORK', 'work'], [L.name, `work/${lane}`], [title]] : [['MORE', 'more'], more, [title]];
  const s = statusOf(type, r, statusWord(r));
  const top = VP === 'desktop' ? '' : actionsBar(actions.filter((a) => !a.off).slice(0, 2));
  return `<main class="main">${pageHead({ trail, title, sub, chips: [s, ...chips].filter(Boolean), actions: top })}
    ${r.client ? ctxBar(r.client) : ''}${returnBar()}
    <div class="split" style="margin-top:14px">
      <div class="stack">${main}${section('HISTORY', 'NEWEST FIRST. SIMULATED STEPS ARE MARKED.', timeline(histFor(`${type}:${r.id}`, history)))}</div>
      <aside class="aside">${actions.length ? actionsPanel(actions) : ''}${rel.filter(Boolean).length ? section('RELATED', 'LINKED ACROSS AIO — ONE RECORD, NEVER A COPY.', related(rel.filter(Boolean))) : ''}${aside}</aside>
    </div></main>`;
}
function recordPage(type, id, route) {
  const def = RECORD_TYPES[type];
  const r = def && def.table[id];
  if (!r) return missing(route);
  const fn = REC[type];
  return fn(r);
}
const REC = {
  vehicle(v) {
    meta('VEHICLES & FLEET › VEHICLE', 'NEW · FOR REVIEW', 'LIVE: DESIGN ONLY — POWER UNITS EXIST CLIENT-SIDE; NO STAFF VEHICLE SCREEN', 'The hub every service links a truck to.');
    const load = v.load || Object.values(LOADS).find((l) => l.vehicle === v.id && isOpen(l.status))?.id;
    const main = `${section('THE TRUCK', '', kv([['UNIT', v.unit], ['YEAR · MAKE · MODEL', v.ymm], ['VIN (LAST 6)', v.vin], ['PLATE / REGISTRATION', v.plate], ['CLIENT', `<a class="lnk" data-go="client/${v.client}">${clientName(v.client)}</a>`], ['AVAILABILITY', st(statusOf('vehicle', v, v.avail))]], 2))}
      ${section('CONNECTED ACROSS AIO', 'EVERY SERVICE POINTS TO THIS ONE TRUCK.', `<div class="links">
        ${linkCard('REGISTRATION', 'id-card', v.request ? `request:${v.request}` : null, v.plate)}
        ${linkCard('DRIVER', 'steering', v.driver ? `driver:${v.driver}` : null, 'NO DRIVER ASSIGNED')}
        ${linkCard('INSURANCE', 'umbrella', v.policy ? `policy:${v.policy}` : null, 'NO POLICY ON FILE')}
        ${linkCard('IFTA', 'fuel', v.quarter ? `quarter:${v.quarter}` : null, 'NOT IN AN IFTA QUARTER')}
        ${linkCard('DISPATCH', 'pin', load ? `load:${load}` : null, 'NOT ON A LOAD')}
        ${linkCard('MAINTENANCE', 'wrench', v.ticket ? `ticket:${v.ticket}` : null, 'NO OPEN TICKET')}
        ${v.compliance.map((k) => linkCard('COMPLIANCE', 'shield-check', `deadline:${k}`)).join('') || linkCard('COMPLIANCE', 'shield-check', null, 'NOTHING DUE')}
        ${linkCard('DOCUMENTS', 'folder', null, `${docsOf(`vehicle:${v.id}`).length} ON THIS TRUCK`)}
      </div>`)}
      ${designOnly('THE LIVE APP HAS NO STAFF VEHICLE SCREEN. POWER UNITS ARE RECORDED ON THE CLIENT SIDE; THIS HUB IS THE DESIGN COMPOSER CONNECTS TO THEM.')}`;
    return recordFrame({
      type: 'vehicle', r: v, title: v.unit, sub: `${v.ymm} · ${clientName(v.client)}`, main,
      actions: [
        { label: 'UPDATE AVAILABILITY', sim: 'veh-avail', ico: 'truck', effect: 'SET THE TRUCK AVAILABLE, ON HOLD OR OUT OF SERVICE — DISPATCH READS IT.', set: `vehicle:${v.id}=AVAILABLE|ok` },
        { label: 'ASSIGN DRIVER', sim: 'veh-driver', ico: 'steering', effect: 'LINK A DRIVER FROM DRIVERS & CARRIERS.' },
        { label: 'OPEN MAINTENANCE TICKET', sim: 'veh-ticket', ico: 'wrench', effect: 'CREATE A TICKET IN MECHANIC / MAINTENANCE FOR THIS TRUCK.' },
        { label: 'REQUEST DOCUMENT', sim: 'veh-doc', ico: 'folder', effect: 'ASK THE CLIENT FOR A CAB CARD, INSPECTION OR TITLE.' },
      ],
      rel: [v.driver && refItem(`driver:${v.driver}`, 'ASSIGNED DRIVER'), v.policy && refItem(`policy:${v.policy}`, 'COVERS THIS TRUCK'), v.ticket && refItem(`ticket:${v.ticket}`, 'OPEN REPAIR')],
      history: [['OCT 6, 2026', 'AVAILABILITY UPDATED', 'DEV PATEL', 'internal'], ['SEP 12, 2026', 'ADDED BY THE CLIENT', clientName(v.client), 'client']],
    });
  },
  driver(d) {
    meta('DRIVERS & CARRIERS › DRIVER', 'NEW · FOR REVIEW', 'LIVE: PARTIAL — DRIVER PROFILES EXIST; CREDENTIAL TRACKING IS NOT BUILT');
    const dues = Object.values(DUES).filter((x) => x.links.includes(`driver:${d.id}`));
    const main = `${section('THE DRIVER', '', kv([['NAME', d.name], ['CLIENT', `<a class="lnk" data-go="client/${d.client}">${clientName(d.client)}</a>`], ['CDL', d.cdl], ['MEDICAL CARD', d.med], ['ASSIGNED TRUCK', d.vehicle ? `<a class="lnk" data-go="rec/vehicle/${d.vehicle}">${VEHICLES[d.vehicle].unit}</a>` : 'NONE']], 2))}
      ${section('CREDENTIALS', 'WHAT COMPLIANCE TRACKS TODAY. A FULL CREDENTIAL FILE IS NOT BUILT.', `<div class="panel check">${[
        ['COMMERCIAL DRIVER’S LICENSE', d.cdl, 'ok'],
        ['MEDICAL EXAMINER’S CERTIFICATE', d.med, /OCT 29, 2026/.test(d.med) ? 'gold' : 'ok'],
        ['CLEARINGHOUSE QUERY', dues.find((x) => /CLEARINGHOUSE/.test(x.what)) ? 'ANNUAL QUERY DUE DEC 1' : 'TRACKED BY COMPLIANCE', 'mute'],
        ['MOTOR VEHICLE RECORD', 'NOT TRACKED YET', 'mute'],
      ].map(([t, s, tone]) => `<div class="check__i"><span class="check__m check__m--${tone}">${ico(tone === 'ok' ? 'pass' : tone === 'gold' ? 'calendar' : 'info')}</span><span><b>${t}</b><small>${s}</small></span></div>`).join('')}</div>`)}`;
    return recordFrame({
      type: 'driver', r: d, title: d.name, sub: `DRIVER · ${clientName(d.client)}`, main,
      actions: [{ label: 'REQUEST UPDATED MEDICAL CARD', sim: 'drv-med', ico: 'id-card', effect: 'ASK THE CLIENT FOR THE NEW CERTIFICATE; COMPLIANCE CLOSES THE DEADLINE WHEN IT IS REVIEWED.' }, { label: 'VERIFY CREDENTIALS', off: 'CREDENTIAL VERIFICATION IS NOT BUILT YET' }],
      rel: [d.vehicle && refItem(`vehicle:${d.vehicle}`, 'DRIVES THIS TRUCK'), ...dues.map((x) => refItem(`deadline:${x.id}`, 'COMPLIANCE DEADLINE'))],
      history: [['SEP 2, 2026', 'DRIVER ADDED DURING MIGRATION', 'JORDAN LEE', 'internal']],
    });
  },
  application(a) {
    meta('DRIVERS & CARRIERS › APPLICATION', 'NEW · FOR REVIEW', 'LIVE: PARTIAL — DRIVERLINK MATCHING; APPROVALS NOT BUILT');
    const step = { 'UNDER REVIEW': 1, 'DOCUMENTS NEEDED': 2, 'INTERVIEW SCHEDULED': 3 }[a.status[0]] ?? 1;
    const main = `${section('THE APPLICATION', '', kv([['POSITION', a.job], ['APPLICANT', a.who], ['CLIENT', clientName(a.client)], ['RECEIVED', a.at]], 2))}
      ${section('MATCHING', 'WHERE THIS APPLICATION STANDS.', stepper(['RECEIVED', 'UNDER REVIEW', 'DOCUMENTS', 'INTERVIEW', 'DECISION'], step))}`;
    return recordFrame({
      type: 'application', r: a, title: a.who.replace('APPLICANT · ', ''), sub: a.job, main,
      actions: [{ label: 'REQUEST DOCUMENTS', sim: 'app-docs', effect: 'ASK THE APPLICANT FOR THEIR CDL, MEDICAL CARD AND MVR.', set: `application:${a.id}=DOCUMENTS NEEDED|warn` }, { label: 'SCHEDULE INTERVIEW', sim: 'app-int', effect: 'OFFER THE CLIENT AND APPLICANT A TIME.', set: `application:${a.id}=INTERVIEW SCHEDULED|ok` }, { label: 'APPROVE FOR HIRE', off: 'APPROVALS ARE NOT BUILT — THE CLIENT DECIDES OUTSIDE AIO TODAY' }],
      rel: [{ lane: 'CLIENT', title: clientName(a.client), go: `client/${a.client}`, why: 'HIRING CLIENT' }],
      history: [[a.at, 'APPLICATION RECEIVED', 'APPLICANT', 'internal']],
    });
  },
  policy(p) {
    meta('INSURANCE › POLICY', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · INSURANCE LANE (REFERRAL / ASSISTANCE)');
    const main = `${notice('<b>REFERRAL AND ASSISTANCE ONLY.</b> AIO HELPS THE CLIENT RENEW WITH THEIR AGENCY. NOTHING IS BOUND WITHOUT LICENSING.', 'gold')}
      ${section('COVERAGE', '', kv([['COVERAGE', p.title], ['PLACED WITH', p.partner], ['EXPIRES', p.exp, `${p.days} DAYS FROM TODAY`], ['OWNER', staffName(p.owner)], ['REQUEST', st(p.request)], ['COVERED TRUCKS', p.vehicles.length ? p.vehicles.map((v) => `<a class="lnk" data-go="rec/vehicle/${v}">${VEHICLES[v].unit}</a>`).join(' · ') : 'NONE LINKED']], 2))}
      ${section('RENEWAL', 'WHAT HAPPENS NEXT.', `<div class="panel" style="padding:14px"><b class="big-n" style="font-size:20px">${p.renewal}</b>${stepper(['WINDOW OPEN', 'OPTIONS REQUESTED', 'QUOTE READY', 'SENT TO CLIENT', 'CLIENT DECIDES', 'RENEWED'], p.days <= 7 ? 2 : p.days <= 60 ? 1 : 0).replace('class="steps"', 'class="steps steps--h" style="margin-top:12px;border:0;padding:0"')}</div>`)}
      ${section('DOCUMENTS', '', p.docs.length ? `<div class="grid2">${p.docs.map((d) => `<div data-go="rec/document/${d}">${docPreview(DOCS[d])}</div>`).join('')}</div>` : rows([], 'NO DOCUMENTS ON THIS POLICY'))}`;
    return recordFrame({
      type: 'policy', r: p, title: p.title, sub: `${clientName(p.client)} · EXPIRES ${p.exp}`, main,
      actions: [
        { label: 'SEND RENEWAL QUOTE TO CLIENT', sim: 'pol-send', ico: 'letter', effect: 'SEND THE QUOTE SUMMARY TO THE CLIENT’S OFFICE; THE CLIENT DECIDES WITH THEIR AGENCY.', set: `policy:${p.id}=QUOTE SENT TO CLIENT|gold` },
        { label: 'REQUEST UPDATED COI', sim: 'pol-coi', ico: 'folder', effect: 'ASK THE AGENCY FOR A NEW CERTIFICATE OF INSURANCE.' },
        { label: 'REASSIGN OWNER', sim: 'pol-owner', ico: 'people', founder: true, effect: 'MOVE THE POLICY TO ANOTHER STAFF MEMBER.' },
        { label: 'BIND COVERAGE', off: 'AIO DOES NOT BIND COVERAGE — REFERRAL / ASSISTANCE ONLY' },
      ],
      rel: [...p.vehicles.map((v) => refItem(`vehicle:${v}`, 'COVERED TRUCK')), ...Object.values(DUES).filter((d) => d.links.includes(`policy:${p.id}`)).map((d) => refItem(`deadline:${d.id}`, 'COMPLIANCE WATCHES THE EXPIRY')), ...Object.values(THREADS).filter((t) => t.client === p.client).map((t) => refItem(`thread:${t.id}`, 'CLIENT CONVERSATION'))],
      history: [['YESTERDAY', 'RENEWAL OPTIONS RECEIVED FROM THE AGENCY', staffName(p.owner), 'internal'], ['SEP 30, 2026', 'RENEWAL WINDOW OPENED', 'AIO', 'internal']],
    });
  },
  quarter(q) {
    meta('FILING & FUEL TAXES › IFTA QUARTER', 'APPROVED AUTHORITY', 'LIVE: PARTIAL · /office/ifta/:case — MANUAL FILING; NO GOVERNMENT API', 'The approved STAFF CASE authority is shown unchanged; the panels around it come from the office.');
    const cap = { mobile: 393, tablet: 834, desktop: 1440 }[VP];
    const main = `<div class="embed"><div class="embed__bar"><span><b>APPROVED · IFTA STAFF CASE</b> — THE LIGHT ANALYTICS COMMAND CASE PAGE, SHOWN UNCHANGED WITH ITS OWN SAMPLE CASE.</span><span>LIVE AT /office/ifta</span></div>
        <div class="embed__shot"><img src="ifta/STAFF_CASE_${cap}.jpg" alt="Approved IFTA staff case page" loading="lazy"></div></div>
      ${section('THIS QUARTER', 'THE OFFICE’S VIEW OF THE SAME CASE.', kv([['QUARTER', q.q], ['CLIENT', `<a class="lnk" data-go="client/${q.client}">${clientName(q.client)}</a>`], ['DUE', q.due], ['TOTAL MILES', q.miles], ['GALLONS', q.gallons], ['OWNER', staffName(q.owner)], ['NEXT', q.next]], 2))}
      ${section('DOCUMENTS', '', docRows(docsOf(`quarter:${q.id}`), 'NO DOCUMENTS ON THIS QUARTER'))}`;
    const blocked = q.bucket[0] === 'BLOCKED';
    return recordFrame({
      type: 'quarter', r: q, title: `IFTA ${q.q}`, sub: clientName(q.client), main,
      actions: blocked
        ? [{ label: 'START THIS QUARTER', off: 'THE CLIENT IS INVITED, NOT ACTIVE — NO FILING UNTIL THEY CONFIRM' }]
        : [
            { label: 'SEND FOR CLIENT APPROVAL', sim: 'q-approval', ico: 'letter', effect: 'SEND THE RETURN TO THE CLIENT’S OFFICE FOR APPROVAL BEFORE FILING.', set: `quarter:${q.id}=AWAITING CLIENT APPROVAL|gold` },
            { label: 'REQUEST FUEL RECEIPTS', sim: 'q-receipts', ico: 'folder', effect: 'ASK THE CLIENT FOR MISSING RECEIPTS BY UNIT.' },
            { label: 'RECORD MANUAL FILING', sim: 'q-filed', ico: 'pass', effect: 'RECORD THAT STAFF FILED WITH THE STATE (THERE IS NO GOVERNMENT API).', set: `quarter:${q.id}=FILED|ok` },
          ],
      rel: [...Object.values(VEHICLES).filter((v) => v.quarter === q.id).map((v) => refItem(`vehicle:${v.id}`, 'MILES AND FUEL COUNT FOR THIS TRUCK')), Object.values(MIG_CASES).find((m) => m.client === q.client) && { lane: 'INTAKE', title: 'MIGRATION CASE', go: `intake/case/${Object.values(MIG_CASES).find((m) => m.client === q.client).id}`, why: 'WHERE THIS CLIENT’S HISTORY CAME FROM' }],
      history: [['YESTERDAY', 'WORKSHEET PREPARED', staffName(q.owner), 'internal'], ['OCT 1, 2026', 'QUARTER OPENED', 'AIO', 'internal']],
    });
  },
  request(q) {
    meta('PERMITTING & AUTHORITIES › REQUEST', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · SERVICE REQUESTS (DEMO PERSISTENCE)');
    const steps = ['RECEIVED', 'INFORMATION NEEDED', 'UNDER REVIEW', 'SUBMITTED TO AGENCY', 'COMPLETED'];
    const idx = { 'INFORMATION NEEDED': 1, OVERDUE: 1, 'UNDER REVIEW': 2, 'IN PROGRESS': 2, 'AWAITING AGENCY': 3, COMPLETED: 4, 'PARTNER PENDING': 0 }[q.status[0]] ?? 0;
    const main = `${q.blocker ? notice(`<b>${q.status[0] === 'PARTNER PENDING' ? 'PARTNER PENDING' : 'BLOCKED'}:</b> ${q.blocker}`, q.status[1] === 'bad' ? 'bad' : 'gold') : ''}
      ${section('THE REQUEST', '', kv([['SERVICE', q.title], ['SECTION', q.section], ['CLIENT', `<a class="lnk" data-go="client/${q.client}">${clientName(q.client)}</a>`], ['DUE', q.due], ['OWNER', staffName(q.owner)]], 2))}
      ${section('PROGRESS', '', stepper(steps, idx))}
      ${section('DOCUMENTS', '', docRows(q.docs.map((d) => DOCS[d]), 'NO DOCUMENTS YET'))}`;
    return recordFrame({
      type: 'request', r: q, title: q.title, sub: `${clientName(q.client)} · DUE ${q.due}`, main,
      actions:
        q.status[0] === 'PARTNER PENDING'
          ? [{ label: 'FILE BOC-3', off: 'BOC-3 IS A PARTNER / MANUAL WORKFLOW UNTIL A PROVIDER IS READY' }, { label: 'NOTE PARTNER FOLLOW-UP', sim: 'boc3-note', effect: 'ADD AN INTERNAL NOTE TO THE PARTNER HAND-OFF.' }]
          : [
              { label: 'REQUEST DOCUMENT FROM CLIENT', sim: 'req-doc', ico: 'folder', effect: 'THE REQUEST APPEARS IN THE CLIENT’S OFFICE; THE CASE WAITS ON THE CLIENT.', set: `request:${q.id}=WAITING ON CLIENT|warn` },
              { label: 'MARK SUBMITTED TO AGENCY', sim: 'req-sub', ico: 'pass', effect: 'RECORD THE AGENCY SUBMISSION AND START WATCHING FOR A RESPONSE.', set: `request:${q.id}=AWAITING AGENCY|gold` },
              { label: 'REASSIGN', sim: 'req-assign', ico: 'people', founder: true, effect: 'MOVE THE REQUEST TO ANOTHER STAFF MEMBER.' },
            ],
      rel: [...q.vehicles.map((v) => refItem(`vehicle:${v}`, q.id === 'req-hf-mc' ? 'CANNOT DISPATCH UNTIL THE AUTHORITY IS ACTIVE' : 'REGISTERED UNIT')), ...Object.values(DUES).filter((d) => d.links.includes(`request:${q.id}`)).map((d) => refItem(`deadline:${d.id}`, 'COMPLIANCE DEADLINE')), ...Object.values(PROFILES).filter((p) => p.client === q.client).map((p) => refItem(`profile:${p.id}`, 'ROAD READY CHECKLIST'))],
      history: [['OCT 6, 2026', q.blocker ? `CLIENT ASKED FOR: ${q.blocker.split(' NOT')[0]}` : 'REQUEST REVIEWED', staffName(q.owner), q.blocker ? 'client' : 'internal'], ['OCT 1, 2026', 'REQUEST OPENED', 'AIO', 'internal']],
    });
  },
  deadline(d) {
    meta('COMPLIANCE › DEADLINE', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · EXPIRATIONS (DEADLINE / RENEWAL RECORDS)');
    const main = `${section('THE DEADLINE', '', kv([['WHAT', d.what], ['KIND', d.kind], ['DUE', d.due], ['WINDOW', d.days < 0 ? `${-d.days} DAY LATE` : d.days === 0 ? 'NOW' : `${d.days} DAYS`], ['CLIENT', `<a class="lnk" data-go="client/${d.client}">${clientName(d.client)}</a>`]], 2))}
      ${section('WHAT IT TOUCHES', 'THE RECORDS THIS DEADLINE PROTECTS.', related(d.links.map((k) => refItem(k)).filter(Boolean)))}`;
    return recordFrame({
      type: 'deadline', r: d, title: d.what, sub: `${clientName(d.client)} · DUE ${d.due}`, main,
      actions: [{ label: 'SEND REMINDER TO CLIENT', sim: 'dl-remind', ico: 'letter', effect: 'REMIND THE CLIENT IN THEIR OFFICE AND BY EMAIL.' }, { label: 'MARK RENEWED', sim: 'dl-done', ico: 'pass', effect: 'CLOSE THE DEADLINE ONCE THE NEW DOCUMENT IS REVIEWED.', set: `deadline:${d.id}=RENEWED|ok` }],
      rel: [],
      history: [['OCT 1, 2026', 'DEADLINE ENTERED THE 30-DAY WINDOW', 'AIO', 'internal']],
    });
  },
  load(l) {
    meta('DISPATCH › LOAD', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · DISPATCH (MANUAL LOAD ENTRY; NO LOAD BOARD)');
    const flow = ['BOOKED', 'DISPATCHED', 'IN TRANSIT', 'DELIVERED', 'POD RECEIVED', 'INVOICED'];
    const idx = { BOOKED: 0, 'IN TRANSIT': 2, 'POD NEEDED': 3, ISSUE: 1, COMPLETE: 5 }[l.status[0]] ?? 0;
    const sub = Object.values(SUBMISSIONS).find((f) => f.load === l.id);
    const main = `${l.exception ? notice(`<b>EXCEPTION:</b> ${l.exception}`, 'bad') : ''}
      ${section('THE LOAD', '', kv([['LANE', l.lane], ['PICKUP', l.pickup], ['DELIVERY', l.delivery], ['RATE', l.rate], ['TRUCK', `<a class="lnk" data-go="rec/vehicle/${l.vehicle}">${VEHICLES[l.vehicle].unit}</a>`], ['DRIVER', l.driver ? `<a class="lnk" data-go="rec/driver/${l.driver}">${DRIVERS[l.driver].name}</a>` : 'NONE — TRUCK OUT OF SERVICE'], ['DISPATCHER', staffName(l.owner)]], 2))}
      ${section('STATUS', '', stepper(flow, idx))}
      ${section('DOCUMENTS', '', docRows(docsOf(`load:${l.id}`), 'NO DOCUMENTS ON THIS LOAD'))}`;
    return recordFrame({
      type: 'load', r: l, title: l.ref, sub: `${l.lane} · ${clientName(l.client)}`, main,
      actions: [
        ...(l.status[0] === 'POD NEEDED' ? [{ label: 'REQUEST POD FROM DRIVER', sim: 'ld-pod', ico: 'folder', effect: 'ASK THE DRIVER FOR THE SIGNED PROOF OF DELIVERY; FACTORING WAITS ON IT.' }] : []),
        ...(l.status[0] === 'ISSUE' ? [{ label: 'REASSIGN TO ANOTHER TRUCK', sim: 'ld-truck', ico: 'truck', effect: 'MOVE THE LOAD TO AN AVAILABLE TRUCK FROM THE SAME CLIENT.', set: `load:${l.id}=BOOKED|mute` }, { label: 'CANCEL WITH THE BROKER', sim: 'ld-cancel', effect: 'RECORD THE CANCELLATION; THE CLIENT IS TOLD IN THEIR OFFICE.', set: `load:${l.id}=CANCELLED|mute` }] : []),
        { label: 'UPDATE STATUS', sim: 'ld-status', ico: 'pin', effect: 'MOVE THE LOAD TO ITS NEXT STATUS; THE CLIENT SEES IT.' },
      ],
      rel: [refItem(`vehicle:${l.vehicle}`, 'ASSIGNED TRUCK'), l.driver && refItem(`driver:${l.driver}`, 'ASSIGNED DRIVER'), sub && refItem(`submission:${sub.id}`, 'FACTORING SUBMISSION'), VEHICLES[l.vehicle].ticket && refItem(`ticket:${VEHICLES[l.vehicle].ticket}`, 'OPEN REPAIR ON THE TRUCK')],
      history: [[`${l.pickup}, 2026`, 'LOAD BOOKED', staffName(l.owner), 'client']],
    });
  },
  shipment(s) {
    meta('BROKERAGE › SHIPMENT', 'HONEST STATE', 'LIVE: PAUSED — BUSINESS ACTIVATION REQUIRED', 'A demo record only. Nothing in a paused service books a real load.');
    const main = `${stateBlock({ kind: 'paused', title: 'BROKERAGE IS PAUSED', body: 'BUSINESS ACTIVATION IS REQUIRED BEFORE AIO BROKERS FREIGHT. AUTHORITY AND LICENSING ARE SEPARATE. THIS RECORD IS A DEMO SO THE PAGE CAN BE REVIEWED.' })}
      ${section('THE SHIPMENT', 'DEMO RECORD.', kv([['REFERENCE', s.ref], ['SHIPPER', s.shipper], ['LANE', s.lane], ['CARRIER', s.carrier], ['MARGIN', FOUNDER ? s.margin : 'FOUNDER · FINANCE ONLY']], 2))}`;
    return recordFrame({
      type: 'shipment', r: s, title: s.ref, sub: s.lane, chips: [['DEMO', 'mute']], main,
      actions: [{ label: 'SEND RATE CONFIRMATION', off: 'BROKERAGE IS PAUSED — NO REAL LOADS ARE BOOKED' }, { label: 'ACTIVATE BROKERAGE', founder: true, off: 'NEEDS BUSINESS ACTIVATION OUTSIDE THIS REVIEW — NEVER A SWITCH HERE' }],
      rel: [{ lane: 'CLIENT · CARRIER', title: clientName(s.client), go: `client/${s.client}`, why: 'CARRIER ON THIS DEMO LOAD' }],
      history: [['OCT 7, 2026', 'DEMO RECORD CREATED FOR REVIEW', 'AIO', 'internal']],
    });
  },
  submission(f) {
    meta('FACTORING › SUBMISSION', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · FACTORING (PARTNER REFERRAL — NOT DIRECT FUNDING)');
    const idx = { 'DOCUMENTS NEEDED': 0, SUBMITTED: 1, FUNDED: 2 }[f.status[0]] ?? 0;
    const main = `${notice('<b>PARTNER REFERRAL.</b> AIO PREPARES THE PACKAGE; THE CLIENT’S OWN PROVIDER FUNDS IT. AIO NEVER ADVANCES MONEY.', 'gold')}
      ${f.blocker ? notice(`<b>WAITING ON:</b> ${f.blocker}`, 'bad') : ''}
      ${section('THE SUBMISSION', '', kv([['INVOICE', f.invoice], ['PROVIDER', f.provider, 'THE CLIENT’S EXISTING RELATIONSHIP — KEPT AS IS'], ['LOAD', `<a class="lnk" data-go="rec/load/${f.load}">${LOADS[f.load].ref}</a>`], ['CLIENT', clientName(f.client)]], 2))}
      ${section('PROGRESS', '', stepper(['DOCUMENTS NEEDED', 'SENT TO PROVIDER', 'FUNDED BY PROVIDER'], idx))}`;
    return recordFrame({
      type: 'submission', r: f, title: f.ref, sub: f.invoice, main,
      actions: f.status[0] === 'FUNDED' ? [{ label: 'NOTHING TO DO', off: 'FUNDED BY THE PROVIDER' }] : [{ label: 'REQUEST POD FROM CLIENT', sim: 'fs-pod', ico: 'folder', effect: 'ASK FOR THE SIGNED PROOF OF DELIVERY.' }, { label: 'SEND PACKAGE TO PROVIDER', sim: 'fs-send', ico: 'letter', effect: 'SEND THE INVOICE, RATE CONFIRMATION AND POD TO THE CLIENT’S PROVIDER.', set: `submission:${f.id}=SENT TO PROVIDER|gold` }],
      rel: [refItem(`load:${f.load}`, 'THE LOAD BEING FACTORED'), ...docsOf(`load:${f.load}`).map((d) => refItem(`document:${d.id}`, 'SUPPORTING DOCUMENT'))],
      history: [['OCT 5, 2026', 'SUBMISSION PREPARED', 'DEV PATEL', 'internal']],
    });
  },
  subscription(b) {
    meta('BOOKKEEPING › SUBSCRIPTION', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · BOOKKEEPING (SEED DATA TODAY)');
    const main = `${section('THE PACKAGE', 'ESSENTIALS · PLUS · ALL IN ONE BOOKKEEPING — THE THREE PACKAGES, UNCHANGED.', kv([['PACKAGE', b.pkg], ['CLIENT', `<a class="lnk" data-go="client/${b.client}">${clientName(b.client)}</a>`], ['OWNER', staffName(b.owner)], ['CURRENT CLOSE', b.cycle ? `<a class="lnk" data-go="rec/cycle/${b.cycle}">${CYCLES[b.cycle].period}</a>` : 'NONE — ACCOUNT PAST DUE']], 2))}
      ${b.status[0] === 'PAST DUE' ? notice('<b>PAST DUE:</b> MONTHLY CLOSES PAUSE UNTIL BILLING IS SETTLED. BILLING IS FOUNDER / BILLING GRANT ONLY.', 'bad') : ''}`;
    return recordFrame({
      type: 'subscription', r: b, title: `BOOKKEEPING · ${b.pkg}`, sub: clientName(b.client), main,
      actions: [b.cycle ? { label: 'OPEN CURRENT CLOSE', sim: 'bk-open', effect: 'OPEN THE MONTH’S CLOSE.' } : { label: 'START A CLOSE', off: 'PAUSED WHILE THE ACCOUNT IS PAST DUE' }, { label: 'CHANGE PACKAGE', founder: true, sim: 'bk-pkg', effect: 'MOVE THE CLIENT BETWEEN ESSENTIALS, PLUS AND ALL IN ONE BOOKKEEPING.' }],
      rel: [b.cycle && refItem(`cycle:${b.cycle}`, 'CURRENT CLOSE'), FOUNDER && Object.values(INVOICES).find((i) => i.client === b.client) && refItem(`invoice:${Object.values(INVOICES).find((i) => i.client === b.client).id}`, 'LATEST INVOICE')],
      history: [['SEP 1, 2026', 'PACKAGE STARTED', staffName(b.owner), 'internal']],
    });
  },
  cycle(c) {
    meta('BOOKKEEPING › MONTHLY CLOSE', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · RECONCILIATION AND DELIVERABLES NOT BUILT');
    const main = `${c.question ? notice(`<b>QUESTION FOR THE CLIENT:</b> ${c.question}`, 'gold') : ''}
      ${section('THE CLOSE', `${c.period} · DUE ${c.due}`, stepper(CYCLE_STEPS, c.step))}
      ${stateBlock({ kind: 'notbuilt', title: 'RECONCILIATION WORKSPACE', body: 'MATCHING BANK LINES TO CATEGORIES HAPPENS OUTSIDE AIO TODAY. THE STEP IS TRACKED HERE; THE WORK SURFACE IS NOT BUILT.', fields: ['BANK LINES', 'CATEGORY', 'MATCHED', 'DIFFERENCE'] })}`;
    return recordFrame({
      type: 'cycle', r: c, title: `${c.period} CLOSE`, sub: clientName(c.client), main,
      actions: [{ label: 'SEND QUESTIONS TO CLIENT', sim: 'cy-q', ico: 'letter', effect: 'SEND THE OPEN QUESTIONS TO THE CLIENT’S OFFICE.', set: `cycle:${c.id}=QUESTIONS FOR CUSTOMER|warn` }, { label: 'MARK STEP COMPLETE', sim: 'cy-step', ico: 'pass', effect: `COMPLETE “${CYCLE_STEPS[c.step]}” AND MOVE TO THE NEXT STEP.` }, { label: 'DELIVER REPORTS', off: 'DELIVERABLES ARE NOT BUILT YET' }],
      rel: [refItem(`subscription:${Object.values(SUBSCRIPTIONS).find((b) => b.cycle === c.id)?.id}`, 'PACKAGE'), ...Object.values(THREADS).filter((t) => t.client === c.client && /BOOKS/.test(t.subject)).map((t) => refItem(`thread:${t.id}`, 'QUESTIONS THREAD'))],
      history: [['OCT 1, 2026', 'PERIOD OPENED', 'KAYLA BROOKS', 'internal']],
    });
  },
  ticket(t) {
    meta('MECHANIC / MAINTENANCE › TICKET', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · FLEETCARE TICKETS');
    const p = PROVIDERS[t.provider];
    const main = `${notice('<b>PROVIDERS OWN THE REPAIR.</b> AIO COORDINATES THE TICKET, THE CLIENT’S AUTHORIZATION AND THE TRUCK’S AVAILABILITY.')}
      ${section('THE TICKET', '', kv([['ISSUE', t.issue], ['TRUCK', `<a class="lnk" data-go="rec/vehicle/${t.vehicle}">${VEHICLES[t.vehicle].unit}</a>`], ['PROVIDER', `<a class="lnk" data-go="more/mechanic_network/${p.id}">${p.name}</a>`], ['URGENCY', t.urgency], ['CLIENT', clientName(t.client)]], 2))}
      ${section('PROGRESS', '', stepper(['OPENED', 'PROVIDER ASSIGNED', 'ESTIMATE / AUTHORIZATION', 'IN SERVICE', 'RETURNED TO SERVICE'], { SCHEDULED: 1, 'AWAITING CUSTOMER AUTHORIZATION': 2, 'AWAITING PARTS': 3 }[t.status[0]] ?? 1))}
      ${section('DOCUMENTS', '', docRows(docsOf(`ticket:${t.id}`), 'NO DOCUMENTS ON THIS TICKET'))}`;
    return recordFrame({
      type: 'ticket', r: t, title: t.ref, sub: t.issue, main,
      actions: [{ label: 'REQUEST CLIENT AUTHORIZATION', sim: 'tk-auth', ico: 'letter', effect: 'SEND THE ESTIMATE TO THE CLIENT TO APPROVE.' }, { label: 'MESSAGE PROVIDER', sim: 'tk-prov', ico: 'wrench', effect: 'SEND A NOTE TO THE PROVIDER ON THIS TICKET.' }, { label: 'RETURN TRUCK TO SERVICE', sim: 'tk-done', ico: 'pass', effect: 'CLOSE THE TICKET AND MARK THE TRUCK AVAILABLE FOR DISPATCH.', set: `ticket:${t.id}=RETURNED TO SERVICE|ok` }],
      rel: [refItem(`vehicle:${t.vehicle}`, 'THE TRUCK'), ...Object.values(DUES).filter((d) => d.links.includes(`ticket:${t.id}`)).map((d) => refItem(`deadline:${d.id}`, 'COMPLIANCE')), ...Object.values(LOADS).filter((l) => l.vehicle === t.vehicle && l.status[1] === 'bad').map((l) => refItem(`load:${l.id}`, 'LOAD AFFECTED'))],
      history: [['3 HRS AGO', 'REPAIR ESTIMATE UPLOADED', clientName(t.client), 'client'], ['OCT 6, 2026', 'TICKET OPENED', 'DEV PATEL', 'internal']],
    });
  },
  profile(p) {
    meta('ROAD READY › PROFILE', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · ROAD READY (NO ENGAGEMENT STATE: AVAILABLE ≠ ACTIVE)');
    const owner = (t) => (/AUTHORITY|UCR|IRP/.test(t) ? 'permitting' : /BOC-3/.test(t) ? 'permitting/boc3' : /INSURANCE/.test(t) ? 'insurance' : /IFTA/.test(t) ? 'filing' : /EIN/.test(t) ? null : 'compliance');
    const main = `${notice('<b>AVAILABLE IS NOT ACTIVE.</b> ROAD READY IS AVAILABLE TO EVERY CLIENT; IT IS ACTIVE ONLY WHEN THE CLIENT STARTS IT. THE LIVE APP HAS NO ENGAGEMENT STATE YET.', 'gold')}
      ${section('READINESS', `${p.done} OF ${p.total} COMPLETE`, `<div class="panel" style="padding:14px"><div class="meter"><i style="width:${(p.done / p.total) * 100}%"></i></div></div>`)}
      ${section('CHECKLIST', 'EACH ITEM IS WORKED IN ITS OWN LANE.', `<div class="panel check">${p.items.map(([t, s, tone]) => {
        const o = owner(t);
        return `<div class="check__i" ${o ? `data-go="work/${o}@${p.client}"` : `data-go="client/${p.client}/documents"`}><span class="check__m check__m--${tone === 'mute' ? '' : tone}">${ico(tone === 'ok' ? 'pass' : tone === 'bad' ? 'close' : 'info')}</span><span><b>${t}</b><small>${o ? `WORKED IN ${laneLabel(o.split('/')[0])}` : 'CLIENT DOCUMENTS'}</small></span>${st([s, tone])}</div>`;
      }).join('')}</div>`)}`;
    return recordFrame({
      type: 'profile', r: p, title: 'ROAD READY', sub: clientName(p.client), main,
      actions: [{ label: 'SEND CHECKLIST TO CLIENT', sim: 'rr-send', ico: 'letter', effect: 'SHARE THE OPEN ITEMS IN THE CLIENT’S OFFICE.' }, { label: 'MARK ROAD READY ACTIVE', off: 'ONLY THE CLIENT STARTS ROAD READY' }],
      rel: [...Object.values(REQUESTS).filter((q) => q.client === p.client).map((q) => refItem(`request:${q.id}`, 'PERMITTING WORK'))],
      history: [['OCT 4, 2026', 'CHECKLIST REVIEWED', 'JORDAN LEE', 'internal']],
    });
  },
  document(d) {
    meta('DOCUMENTS & VAULT › DOCUMENT', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · VAULT (CLIENT DOCUMENTS)');
    const [ot, oid] = d.owner.split(':');
    const missingDoc = /REQUESTED|NOT RECEIVED/.test(d.status[0]);
    const main = `${missingDoc ? notice('<b>NOT RECEIVED.</b> THE CLIENT HAS BEEN ASKED FOR THIS DOCUMENT. THE WORK IT BELONGS TO WAITS ON IT.', 'bad') : ''}
      <div class="doc--big">${docPreview(d).replace('class="doc ', 'class="doc doc--big ')}</div>
      ${section('DETAILS', '', kv([['VISIBILITY', d.vis === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY', d.vis === 'client' ? 'THE CLIENT SEES THIS IN THEIR OFFICE' : 'NEVER SHOWN TO THE CLIENT'], ['BELONGS TO', `<a class="lnk" data-go="rec/${ot}/${oid}">${RECORD_TYPES[ot].title(rec(ot, oid))}</a>`], ['CLIENT', clientName(d.client)], ['ADDED', d.added]], 2))}
      ${notice('SAMPLE DOCUMENT — NO REAL FILE IS STORED OR SHOWN IN THIS REVIEW.')}`;
    return recordFrame({
      type: 'document', r: d, title: d.title, sub: `${d.type} · ${clientName(d.client)}`, main,
      actions: missingDoc
        ? [{ label: 'REMIND CLIENT', sim: 'doc-remind', ico: 'letter', effect: 'SEND A REMINDER TO THE CLIENT’S OFFICE.' }]
        : [
            { label: 'APPROVE DOCUMENT', sim: 'doc-ok', ico: 'pass', effect: 'MARK REVIEWED; THE WORK IT BELONGS TO CAN CONTINUE.', set: `document:${d.id}=APPROVED|ok` },
            { label: 'REQUEST A NEW VERSION', sim: 'doc-new', ico: 'folder', effect: 'ASK THE CLIENT TO UPLOAD AGAIN, WITH A REASON.' },
            { label: d.vis === 'client' ? 'MAKE STAFF ONLY' : 'SHARE WITH CLIENT', sim: 'doc-vis', ico: 'lock', founder: true, effect: 'CHANGE WHO CAN SEE THIS DOCUMENT. EVERY CHANGE IS RECORDED.' },
          ],
      rel: [refItem(d.owner, 'THE WORK THIS DOCUMENT BELONGS TO')],
      history: [[d.added, missingDoc ? 'REQUESTED FROM THE CLIENT' : 'UPLOADED', missingDoc ? 'AIO' : clientName(d.client), d.vis === 'client' ? 'client' : 'internal']],
    });
  },
  thread(t) {
    meta('MESSAGES › CONVERSATION', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · MESSAGES');
    const main = `${section('CONVERSATION', 'CLIENT MESSAGES, STAFF REPLIES AND INTERNAL NOTES — INTERNAL NOTES ARE NEVER SENT.', `<div class="panel" style="padding:14px"><div class="msgs">${t.msgs
      .map(([k, who, text, when]) => `<div class="msg msg--${k}"><b>${k === 'internal' ? `INTERNAL NOTE · ${who}` : who}</b><span>${text}</span><small>${when}</small></div>`)
      .join('')}${(SESSION.history[`thread:${t.id}`] || []).map(([when, what]) => `<div class="msg msg--staff"><b>ALEX R. · SIMULATED</b><span>${what}</span><small>${when}</small></div>`).join('')}</div>
      <div class="composer" style="margin-top:12px"><span>WRITE A REPLY…</span><span class="btn btn--sm btn--gold" data-sim="th-send" data-label="SEND REPLY" data-effect="SEND THE REPLY TO THE CLIENT’S OFFICE." data-set="thread:${t.id}=WAITING ON CLIENT|gold">SEND</span><span class="btn btn--sm" data-sim="th-note" data-label="ADD INTERNAL NOTE" data-effect="ADD A NOTE ONLY STAFF CAN SEE.">NOTE</span></div></div>`)}`;
    return recordFrame({
      type: 'thread', r: t, title: t.subject, sub: clientName(t.client), main,
      actions: [{ label: 'ASSIGN TO ME', sim: 'th-mine', ico: 'people', effect: 'MAKE YOU THE OWNER OF THIS CONVERSATION.' }, { label: 'MARK RESOLVED', sim: 'th-done', ico: 'pass', effect: 'CLOSE THE CONVERSATION; THE CLIENT CAN REOPEN IT.', set: `thread:${t.id}=RESOLVED|ok` }],
      rel: [{ lane: 'CLIENT 360', title: clientName(t.client), go: `client/${t.client}`, why: 'EVERYTHING FOR THIS CLIENT' }, ...(t.client === 'c-mt' ? [refItem('request:req-mt-boc3', 'WHAT THE CLIENT IS ASKING ABOUT')] : [])],
      history: [],
    });
  },
  invoice(i) {
    meta('BILLING › INVOICE', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · /office/invoices — FOUNDER / BILLING GRANT');
    if (!FOUNDER) return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['BILLING']], title: 'BILLING', sub: 'INVOICES, PAYMENTS AND CREDITS.' })}${permissionPage('BILLING', 'THE BILLING GRANT', 'more')}</main>`;
    const main = `${section('THE INVOICE', 'SAMPLE AMOUNTS — NOT REAL TRANSACTIONS.', kv([['REFERENCE', i.ref], ['FOR', i.what], ['AMOUNT', i.amount], ['DATE', i.date], ['CLIENT', `<a class="lnk" data-go="client/${i.client}">${clientName(i.client)}</a>`]], 2))}`;
    return recordFrame({
      type: 'invoice', r: i, title: i.ref, sub: i.what, main,
      actions: [{ label: 'SEND REMINDER', sim: 'inv-remind', ico: 'letter', founder: true, effect: 'EMAIL A PAYMENT REMINDER. NO CHARGE IS MADE.' }, { label: 'RECORD PAYMENT', sim: 'inv-paid', founder: true, ico: 'pass', effect: 'RECORD A PAYMENT RECEIVED OUTSIDE AIO.', set: `invoice:${i.id}=PAID|ok` }, { label: 'CHARGE CARD ON FILE', off: 'NO PAYMENT PROCESSING IN THIS REVIEW' }],
      rel: [{ lane: 'CLIENT 360', title: clientName(i.client), go: `client/${i.client}/billing`, why: 'ALL INVOICES FOR THIS CLIENT' }],
      history: [[i.date, 'INVOICE CREATED', 'KAYLA BROOKS', 'internal']],
    });
  },
};
