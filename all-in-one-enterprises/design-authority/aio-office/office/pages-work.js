/*
 * AIO OFFICE unified review — WORK. MY WORK, ALL OPEN WORK and the twelve lane workspaces. Each lane is purpose-built
 * from its own contract (records, statuses, sections) — a load board for DISPATCH, expiry windows for COMPLIANCE, a
 * close stepper for BOOKKEEPING, readiness meters for ROAD READY — and every lane shares one grammar: the lane band
 * (its own photograph from WORK), section tabs, a landing, queues, a directory, record pages, and honest states for
 * sections the product has not built. An "@client" route filters a lane to one client (the client context).
 */
const withCtx = (route, r) => `${route}${r.client ? `@${r.client}` : ''}`;
const forClient = (list, r) => (r.client ? list.filter((x) => x.client === r.client) : list);
const vals = (o) => Object.values(o);

function laneFrame(slug, r, { tab, tabsList, kicker, title, sub, body }) {
  const l = laneBySlug(slug);
  const cur = tabsList.find(([k]) => k === tab);
  const c = r.client && client(r.client);
  const filtered = c ? `${ctxBar(r.client)}<div class="notice panel honest notice--gold" style="margin-top:8px">${ico('filter')}<span>SHOWING ${c.name} ONLY. CLEAR THE CLIENT TO SEE EVERY CLIENT IN THIS LANE.</span></div>` : '';
  return `<main class="main">${laneBand(l, kicker, title, sub)}
    <div class="after-band"><div class="panel" style="padding:10px 12px"><div class="pg__top"><button class="pg__back" data-act="back" aria-label="Back">${ico('back')}</button>${crumbs([['WORK', 'work'], [l.name, withCtx(`work/${slug}`, r)], ...(cur && cur[0] !== tabsList[0][0] ? [[cur[1]]] : [])])}<span style="margin-left:auto">${sample()}</span></div>
    ${tabs(tabsList.map(([k, t, n, tone]) => [k, t, n, withCtx(k === tabsList[0][0] ? `work/${slug}` : `work/${slug}/${k}`, r), tone]), tab)}</div></div>
    ${filtered}${returnBar()}<div style="margin-top:14px">${body}</div></main>`;
}
const lstat = (n, label, s = '', tone = '', go = '') => `<div class="lstat ${tone ? `lstat--${tone}` : ''}" ${go ? `data-go="${go}"` : ''}><b>${n}</b><span>${label}</span>${s ? `<small>${s}</small>` : ''}</div>`;
const serviceChips = (names) => `<div class="pill-row" style="margin-bottom:12px">${SERVICES.filter(([n]) => names.includes(n)).map(([n, w, t]) => st([`${n} · ${w}`, t])).join('')}</div>`;
const recRow = (type) => (x) => ({ go: recRoute(type, x.id), lead: badge(client(x.client)), title: RECORD_TYPES[type].title(x), sub: clientName(x.client), meta: x.due ? `DUE ${x.due}` : x.exp ? `EXPIRES ${x.exp}` : '', status: statusOf(type, x, statusWord(x)) });

function workPage(r) {
  const [, lane, tab] = r.seg;
  if (lane === 'mine') return myWorkPage(r);
  if (lane === 'queue') return allOpenWork(r);
  const L = LANE_PAGES[lane];
  if (!L) return missing(r);
  return L(tab, r);
}

/* ── MY WORK and ALL OPEN WORK ── */
const MY_WORK = [
  ['request', 'req-hf-mc', 'DUE OCT 10'],
  ['policy', 'pol-dh', 'DUE OCT 14'],
  ['quarter', 'ifta-rl-q3', 'DUE OCT 31'],
  ['deadline', 'dl-abc-med', 'DUE OCT 29'],
  ['thread', 'th-mt', 'REPLY TODAY'],
  ['document', 'doc-tk-1', 'REVIEW TODAY'],
  ['shipment', 'sh-4471', 'DEMO · PAUSED'],
];
function myWorkPage(r) {
  meta('WORK › MY WORK', 'NEW · FOR REVIEW', 'LIVE: PARTIAL — ASSIGNMENT EXISTS IN SOME LANES ONLY');
  const items = MY_WORK.map(([type, id, due]) => ({ type, r: rec(type, id), due })).filter((x) => !r.filter || RECORD_TYPES[x.type].lane === r.filter || (r.filter === 'other' && !RECORD_TYPES[x.type].lane));
  const lanesIn = [...new Set(MY_WORK.map(([t]) => RECORD_TYPES[t].lane || 'other'))];
  return `<main class="main">${pageHead({ trail: [['WORK', 'work'], ['MY WORK']], title: 'MY WORK', sub: 'EVERYTHING ASSIGNED TO YOU, ACROSS LANES. EACH ROW OPENS ITS CASE.', chips: [['SAMPLE', 'mute']] })}
    <div class="lstats">${lstat(7, 'ASSIGNED TO YOU')}${lstat(3, 'DUE THIS WEEK')}${lstat(1, 'BLOCKED', 'WAITING ON THE CLIENT', 'bad', 'rec/request/req-hf-mc')}${lstat(1, 'PAUSED SERVICE', 'BROKERAGE DEMO', '', 'work/brokerage')}</div>
    ${filterChips([['all', 'ALL', MY_WORK.length], ...lanesIn.map((l) => [l, l === 'other' ? 'DOCUMENTS & MESSAGES' : laneLabel(l), MY_WORK.filter(([t]) => (RECORD_TYPES[t].lane || 'other') === l).length])], r.filter || 'all', 'work/mine')}
    ${rows(items.map((x) => ({ go: recRoute(x.type, x.r.id), lead: icoTile(OWNER_ICON[x.type]), title: RECORD_TYPES[x.type].title(x.r), sub: `${OWNER_LABEL[x.type]} · ${clientName(x.r.client)}`, meta: x.due, status: statusOf(x.type, x.r, statusWord(x.r)) })))}
    ${notice('DRIVERS & CARRIERS AND MECHANIC / MAINTENANCE DO NOT ASSIGN WORK TO STAFF YET.')}</main>`;
}
function openWorkList() {
  const out = [];
  for (const [type, def] of Object.entries(RECORD_TYPES)) {
    if (!def.lane || ['vehicle', 'driver', 'profile', 'subscription'].includes(type)) continue;
    for (const x of vals(def.table)) {
      const s = statusOf(type, x, statusWord(x));
      if (isOpen(s)) out.push({ type, x, s, lane: def.lane });
    }
  }
  return out;
}
function allOpenWork(r) {
  meta('WORK › ALL OPEN WORK', 'NEW · FOR REVIEW', 'LIVE: NOT BUILT — NO CROSS-LANE QUEUE YET', 'Reads each lane’s own records; nothing is copied into a second queue.');
  const all = openWorkList().filter((w) => !r.client || w.x.client === r.client);
  const list = all.filter((w) => !r.filter || w.lane === r.filter);
  const lanes = [...new Set(all.map((w) => w.lane))];
  return `<main class="main">${pageHead({ trail: [['WORK', 'work'], ['ALL OPEN WORK']], title: 'ALL OPEN WORK', sub: 'SEARCH, FILTER AND SORT OPEN WORK ACROSS CLIENTS. SORTED BY STATUS, MOST URGENT FIRST.', chips: [['SAMPLE', 'mute']], actions: `<span class="btn btn--sm" data-act="search">${ico('search')}SEARCH</span><span class="btn btn--sm" data-act="switch">${ico('people')}CLIENT</span>` })}
    ${r.client ? ctxBar(r.client) : ''}
    ${filterChips([['all', 'ALL LANES', all.length], ...lanes.map((l) => [l, laneLabel(l), all.filter((w) => w.lane === l).length])], r.filter || 'all', 'work/queue')}
    ${rows(
      list
        .sort((a, b) => ['bad', 'warn', 'gold', 'mute'].indexOf(a.s[1]) - ['bad', 'warn', 'gold', 'mute'].indexOf(b.s[1]))
        .map((w) => ({ go: recRoute(w.type, w.x.id), lead: icoTile(OWNER_ICON[w.type]), title: RECORD_TYPES[w.type].title(w.x), sub: clientName(w.x.client), meta: `${laneLabel(w.lane)}${w.x.owner ? ` · ${staffName(w.x.owner)}` : ''}`, status: w.s })),
      'NOTHING OPEN',
    )}</main>`;
}

/* ═══════════════ the twelve lanes ═══════════════ */
const LANE_PAGES = {
  /* 01 */ permitting(tab = 'overview', r) {
    const SEC = { tags: 'TAGS / REGISTRATION', fuel: 'FUEL / ROAD TAX PERMITS', authorities: 'OPERATING AUTHORITIES', boc3: 'BOC-3', llc: 'LLC / INC', other: 'OTHER PERMITS' };
    const all = forClient(vals(REQUESTS), r);
    const by = (k) => all.filter((q) => q.section === SEC[k]);
    const T = [['overview', 'OVERVIEW'], ...Object.entries(SEC).map(([k, t]) => [k, t, by(k).length, k === 'boc3' ? 'mute' : ''])];
    meta(`WORK › PERMITTING & AUTHORITIES${tab !== 'overview' ? ` › ${SEC[tab] ?? tab}` : ''}`, tab === 'boc3' ? 'HONEST STATE' : 'NEW · FOR REVIEW', tab === 'boc3' ? 'LIVE: NOT BUILT — PARTNER / MANUAL WORKFLOW' : 'LIVE: PARTIAL · SERVICE REQUESTS');
    let body;
    if (tab === 'overview') {
      const open = all.filter((q) => isOpen(statusOf('request', q, q.status)));
      body = `${serviceChips(['PERMITTING', 'TAG SERVICES', 'AUTHORITY SERVICES', 'BOC-3', 'BUSINESS FORMATION'])}
        <div class="lstats">${lstat(open.length, 'OPEN REQUESTS')}${lstat(all.filter((q) => q.status[0] === 'INFORMATION NEEDED').length, 'WAITING ON CLIENTS', 'BLOCKED', 'bad')}${lstat(all.filter((q) => q.status[0] === 'OVERDUE').length, 'OVERDUE', '', 'bad')}${lstat(all.filter((q) => q.status[0] === 'AWAITING AGENCY').length, 'AWAITING AN AGENCY')}</div>
        <div class="split" style="margin-top:14px"><div class="stack">${section('NEEDS ACTION', 'BLOCKED AND OVERDUE FIRST.', rows(open.filter((q) => ['bad', 'warn'].includes(statusOf('request', q, q.status)[1])).map(recRow('request')), 'NOTHING NEEDS ACTION'))}
        ${section('ALL OPEN REQUESTS', '', rows(open.map(recRow('request'))))}</div>
        <aside class="aside">${section('BY SECTION', '', `<div class="panel rows">${Object.entries(SEC).map(([k, t]) => `<div class="row" data-go="${withCtx(`work/permitting/${k}`, r)}"><span class="row__t"><b>${t}</b><small>${by(k).length} REQUESTS</small></span>${k === 'boc3' ? `<span class="row__s">${st(['PARTNER PENDING', 'mute'])}</span>` : ''}${ico('fwd', 'chev')}</div>`).join('')}</div>`)}</aside></div>`;
    } else if (tab === 'boc3') {
      body = `${stateBlock({ kind: 'notbuilt', title: 'BOC-3 FILING', body: 'BOC-3 IS A PARTNER / MANUAL WORKFLOW UNTIL A PROCESS-AGENT PROVIDER IS READY. AIO TRACKS THE HAND-OFF; IT DOES NOT FILE.', fields: ['CLIENT', 'PROCESS AGENT', 'FILED ON', 'CONFIRMATION'], gap: 'SERVICE ACTIVATION: BOC-3 · PARTNER PENDING' })}${section('HAND-OFFS', '', rows(by('boc3').map(recRow('request')), 'NO BOC-3 HAND-OFFS'))}`;
    } else body = rows(by(tab).map(recRow('request')), `NO ${SEC[tab]} REQUESTS${r.client ? ' FOR THIS CLIENT' : ''}`);
    return laneFrame('permitting', r, { tab, tabsList: T, kicker: 'WORK › 01', title: 'PERMITTING & AUTHORITIES', sub: 'REGISTRATIONS, PERMITS, AUTHORITIES AND FORMATION.', body });
  },
  /* 02 */ filing(tab = 'overview', r) {
    const all = forClient(vals(QUARTERS), r);
    const T = [['overview', 'IFTA COMMAND'], ['queue', 'IFTA QUEUE', all.filter((q) => isOpen(statusOf('quarter', q, q.bucket))).length], ['approval', 'CLIENT APPROVAL'], ['filed', 'SUBMITTED / FILED'], ['history', 'FILING HISTORY']];
    meta(`WORK › FILING & FUEL TAXES${tab !== 'overview' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, tab === 'overview' ? 'APPROVED AUTHORITY' : 'NEW · FOR REVIEW', 'LIVE: PARTIAL · /office/ifta — MANUAL FILING; NO GOVERNMENT API', tab === 'overview' ? 'The approved IFTA LIGHT ANALYTICS COMMAND staff queue, shown unchanged inside the lane.' : '');
    const cap = { mobile: 393, tablet: 834, desktop: 1440 }[VP];
    let body;
    if (tab === 'overview') {
      body = `${serviceChips(['FUEL TAX (IFTA)', 'ROAD / USE TAX'])}<div class="split"><div class="embed"><div class="embed__bar"><span><b>APPROVED · IFTA LIGHT ANALYTICS COMMAND</b> — THE STAFF QUEUE AUTHORITY, SHOWN UNCHANGED WITH ITS OWN SAMPLE CASES. NOT REPLACED.</span><span>LIVE AT /office/ifta</span></div><div class="embed__shot"><img src="ifta/STAFF_QUEUE_${cap}.jpg" alt="Approved IFTA staff queue" loading="lazy"></div></div>
        <aside class="aside">${section('THIS QUARTER IN THE OFFICE', 'THE SAME CASES, LINKED TO THEIR CLIENTS.', rows(all.map((q) => ({ go: recRoute('quarter', q.id), lead: badge(client(q.client)), title: `IFTA ${q.q}`, sub: clientName(q.client), status: statusOf('quarter', q, q.bucket) }))))}</aside></div>`;
    } else if (tab === 'queue') {
      const buckets = ['NEEDS REVIEW', 'AWAITING CLIENT', 'BLOCKED', 'FILED', 'COMPLETE'];
      const list = all.filter((q) => !r.filter || slugify(statusOf('quarter', q, q.bucket)[0]) === r.filter);
      body = `${filterChips([['all', 'ALL', all.length], ...buckets.map((b) => [slugify(b), b, all.filter((q) => q.bucket[0] === b).length])], r.filter || 'all', 'work/filing/queue')}${rows(list.map((q) => ({ ...recRow('quarter')(q), meta: `DUE ${q.due} · ${staffName(q.owner)}` })))}`;
    } else if (tab === 'approval') {
      body = `${notice('THE CLIENT APPROVES EVERY RETURN IN THEIR OWN OFFICE BEFORE STAFF FILE IT.')}${rows(all.filter((q) => /AWAITING|NEEDS REVIEW/.test(statusOf('quarter', q, q.bucket)[0])).map(recRow('quarter')), 'NOTHING WAITING ON A CLIENT')}`;
    } else if (tab === 'filed') {
      body = rows(all.filter((q) => q.bucket[0] === 'FILED').map((q) => ({ ...recRow('quarter')(q), meta: q.next })), 'NOTHING FILED THIS QUARTER');
    } else {
      body = `${rows(all.filter((q) => ['FILED', 'COMPLETE'].includes(q.bucket[0])).map((q) => ({ ...recRow('quarter')(q), meta: q.next })))}${notice('OLDER QUARTERS APPEAR WHEN FILING HISTORY IS READ FROM THE LIVE RECORDS. REPORTS › FILING HISTORY HAS THE SAME LIST.')}`;
    }
    return laneFrame('filing', r, { tab, tabsList: T, kicker: 'WORK › 02', title: 'FILING & FUEL TAXES', sub: 'IFTA QUARTERS, CLIENT APPROVAL AND MANUAL FILING.', body });
  },
  /* 03 */ compliance(tab = 'overview', r) {
    const all = forClient(vals(DUES), r);
    const T = [['overview', 'OVERVIEW'], ['expirations', 'EXPIRATIONS', all.length], ['dot_safety', 'DOT / SAFETY', null, 'mute'], ['audits', 'AUDITS', null, 'mute'], ['corrective', 'CORRECTIVE WORK', null, 'mute']];
    const nb = { dot_safety: 'DOT / SAFETY', audits: 'AUDITS', corrective: 'CORRECTIVE WORK' };
    meta(`WORK › COMPLIANCE${tab !== 'overview' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, nb[tab] ? 'HONEST STATE' : 'NEW · FOR REVIEW', nb[tab] ? 'LIVE: NOT BUILT — NO COMPLIANCE CASE MODEL YET' : 'LIVE: PARTIAL · DEADLINES / RENEWALS');
    const win = (d) => (d.days < 0 || d.state[1] === 'bad' ? 'overdue' : d.days <= 7 ? 'week' : d.days <= 30 ? 'month' : 'later');
    const W = [['overdue', 'OVERDUE / BLOCKING'], ['week', 'NEXT 7 DAYS'], ['month', 'NEXT 30 DAYS'], ['later', 'LATER']];
    const windows = (list) => `<div class="win">${W.map(([k, t]) => {
      const xs = list.filter((d) => win(d) === k);
      return `<div><div class="win__h">${t}<i>${xs.length}</i></div>${rows(xs.map((d) => ({ go: recRoute('deadline', d.id), title: d.what, sub: clientName(d.client), meta: d.due, status: statusOf('deadline', d, d.state) })), 'NOTHING')}</div>`;
    }).join('')}</div>`;
    let body;
    if (tab === 'overview') {
      body = `<div class="lstats">${W.map(([k, t]) => lstat(all.filter((d) => win(d) === k).length, t, '', k === 'overdue' ? 'bad' : '', withCtx('work/compliance/expirations', r))).join('')}</div>
        <div style="margin-top:14px">${windows(all)}</div>
        ${section('SECTIONS', 'EXPIRATIONS ARE CONNECTED. THE OTHER THREE ARE NOT BUILT YET.', `<div class="grid3">${Object.entries(nb).map(([k, t]) => `<div class="lk lk--none" data-go="work/compliance/${k}"><span class="lk__l">${ico('shield-check')}${t}</span><b>NOT BUILT YET</b></div>`).join('')}</div>`)}`;
    } else if (tab === 'expirations') {
      const kinds = [...new Set(all.map((d) => d.kind))];
      const list = all.filter((d) => !r.filter || slugify(d.kind) === r.filter);
      body = `${filterChips([['all', 'ALL', all.length], ...kinds.map((k) => [slugify(k), k, all.filter((d) => d.kind === k).length])], r.filter || 'all', 'work/compliance/expirations')}${windows(list)}`;
    } else {
      const spec = {
        dot_safety: ['DOT / SAFETY', 'SAFETY SCORES, INSPECTIONS AND CRASHES PER CARRIER. THE LIVE APP DOES NOT READ FMCSA SAFETY DATA YET.', ['CARRIER', 'BASIC SCORES', 'LAST INSPECTION', 'OUT-OF-SERVICE RATE', 'ALERTS']],
        audits: ['AUDITS', 'NEW-ENTRANT AND COMPLIANCE REVIEWS: THE CHECKLIST, THE DOCUMENTS AND THE OUTCOME. NO AUDIT RECORD EXISTS IN THE LIVE APP.', ['CARRIER', 'AUDIT TYPE', 'SCHEDULED', 'DOCUMENTS READY', 'OUTCOME']],
        corrective: ['CORRECTIVE WORK', 'WHAT A CARRIER MUST FIX AFTER AN AUDIT OR INSPECTION, WITH OWNERS AND DUE DATES. NO CORRECTIVE-ACTION MODEL YET.', ['FINDING', 'CORRECTIVE ACTION', 'OWNER', 'DUE', 'EVIDENCE']],
      }[tab];
      if (!spec) return missing(r);
      body = `${stateBlock({ kind: 'notbuilt', title: spec[0], body: spec[1], fields: spec[2], gap: 'IA: COMPLIANCE › NOT_STARTED' })}${section('WHAT COMPLIANCE HAS TODAY', 'EXPIRATIONS — CONNECTED.', `<span class="btn" data-go="work/compliance/expirations">OPEN EXPIRATIONS ${ico('fwd')}</span>`)}`;
    }
    return laneFrame('compliance', r, { tab, tabsList: T, kicker: 'WORK › 03', title: 'COMPLIANCE', sub: 'EXPIRATIONS TODAY. DOT / SAFETY, AUDITS AND CORRECTIVE WORK NEXT.', body });
  },
  /* 04 */ vehicles(tab = 'fleet', r) {
    const all = forClient(vals(VEHICLES), r);
    const attention = all.filter((v) => isOpen(statusOf('vehicle', v, v.avail)) || v.compliance.length);
    const T = [['fleet', 'FLEET', all.length], ['attention', 'NEEDS ATTENTION', attention.length, 'bad'], ['clients', 'BY CLIENT']];
    meta(`WORK › VEHICLES & FLEET${tab !== 'fleet' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, 'NEW · FOR REVIEW', 'LIVE: DESIGN ONLY — NO STAFF VEHICLES WORKSPACE', 'The hub that links each truck to registrations, drivers, insurance, compliance, IFTA, dispatch, maintenance and documents.');
    const avail = [...new Set(all.map((v) => v.avail[0]))];
    let body;
    if (tab === 'fleet') {
      const list = all.filter((v) => !r.filter || slugify(v.avail[0]) === r.filter);
      body = `${filterChips([['all', 'ALL TRUCKS', all.length], ...avail.map((a) => [slugify(a), a, all.filter((v) => v.avail[0] === a).length])], r.filter || 'all', 'work/vehicles')}<div class="fleet">${list.map(unitCard).join('')}</div>`;
    } else if (tab === 'attention') body = `<div class="fleet">${attention.map(unitCard).join('')}</div>`;
    else if (tab === 'clients') {
      const ids = [...new Set(all.map((v) => v.client))];
      body = ids.map((id) => section(clientName(id), `${all.filter((v) => v.client === id).length} TRUCKS`, `<div class="fleet">${all.filter((v) => v.client === id).map(unitCard).join('')}</div>`, `<span class="btn btn--sm" data-go="client/${id}/vehicles">CLIENT 360 ${ico('fwd')}</span>`)).join('');
    } else return missing(r);
    body = `${designOnly('VEHICLES & FLEET HAS NO STAFF WORKSPACE IN THE LIVE APP. TRUCKS ARE RECORDED ON THE CLIENT SIDE (POWER UNITS); THIS HUB IS THE DESIGN COMPOSER CONNECTS TO THEM.')}<div style="margin-top:12px">${body}</div>`;
    return laneFrame('vehicles', r, { tab, tabsList: T, kicker: 'WORK › 04', title: 'VEHICLES & FLEET', sub: 'EVERY TRUCK, AND EVERYTHING IT IS CONNECTED TO.', body });
  },
  /* 05 */ dispatch(tab = 'board', r) {
    const all = forClient(vals(LOADS), r);
    const T = [['board', 'LOAD BOARD', all.length], ['clients', 'ACTIVE CLIENTS'], ['trucks', 'TRUCKS'], ['exceptions', 'STATUS & EXCEPTIONS', all.filter((l) => l.exception).length, 'bad'], ['my_loads', 'MY LOADS / MY TRUCKS', null, 'mute']];
    meta(`WORK › DISPATCH${tab !== 'board' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, tab === 'my_loads' ? 'HONEST STATE' : 'NEW · FOR REVIEW', tab === 'my_loads' ? 'LIVE: NOT BUILT' : 'LIVE: PARTIAL · DISPATCH (MANUAL LOAD ENTRY)');
    let body;
    if (tab === 'board') {
      const cols = ['BOOKED', 'MOVING', 'DELIVERED', 'ISSUE'];
      body = `${serviceChips(['DISPATCHING'])}<div class="board" style="--cols:4">${cols.map((c) => {
        const xs = all.filter((l) => l.col === c);
        return `<div class="col"><div class="col__h">${c}<i>${xs.length}</i></div>${xs.map((l) => `<div class="card" data-go="rec/load/${l.id}"><b>${l.ref}</b><small>${l.lane}</small><div class="card__m">${st(statusOf('load', l, l.status))}<span>${VEHICLES[l.vehicle].unit}</span><span>${l.delivery}</span></div></div>`).join('') || '<small class="muted">NOTHING HERE</small>'}</div>`;
      }).join('')}</div>`;
    } else if (tab === 'clients') {
      const ids = [...new Set(vals(LOADS).map((l) => l.client))];
      body = rows(ids.map((id) => ({ go: `client/${id}`, lead: badge(client(id)), title: clientName(id), sub: `${vals(LOADS).filter((l) => l.client === id && isOpen(l.status)).length} OPEN LOADS · ${vals(VEHICLES).filter((v) => v.client === id).length} TRUCKS`, status: LIFE[client(id).life] })));
    } else if (tab === 'trucks') {
      const ids = [...new Set(all.map((l) => l.client))];
      body = `<div class="fleet">${vals(VEHICLES).filter((v) => ids.includes(v.client)).map(unitCard).join('')}</div>`;
    } else if (tab === 'exceptions') {
      body = rows(all.filter((l) => l.exception).map((l) => ({ go: recRoute('load', l.id), lead: icoTile('pin'), title: l.ref, sub: l.exception, status: statusOf('load', l, l.status) })), 'NO EXCEPTIONS');
    } else if (tab === 'my_loads') {
      body = stateBlock({ kind: 'notbuilt', title: 'MY LOADS / MY TRUCKS', body: 'A DISPATCHER’S OWN LOADS AND TRUCKS. LOADS HAVE AN OWNER IN THE LIVE APP, BUT NO PERSONAL VIEW IS BUILT.', fields: ['LOAD', 'TRUCK', 'NEXT STOP', 'ETA', 'STATUS'], gap: 'IA: DISPATCH › MY_LOADS_MY_TRUCKS · NOT_STARTED' });
    } else return missing(r);
    return laneFrame('dispatch', r, { tab, tabsList: T, kicker: 'WORK › 05', title: 'DISPATCH', sub: 'LOADS, TRUCKS AND EXCEPTIONS FOR DISPATCH CLIENTS.', body });
  },
  /* 06 */ brokerage(tab = 'overview', r) {
    const all = forClient(vals(SHIPMENTS), r);
    const T = [['overview', 'OVERVIEW', null, 'bad'], ['quotes', 'QUOTES'], ['shipments', 'SHIPMENTS'], ['offers', 'CARRIER OFFERS'], ['stops', 'STOPS & STATUS'], ...(FOUNDER ? [['financials', 'LOAD FINANCIALS']] : [])];
    meta(`WORK › BROKERAGE${tab !== 'overview' ? ` › ${T.find(([k]) => k === tab)?.[1] ?? tab.toUpperCase()}` : ''}`, 'HONEST STATE', 'LIVE: PAUSED — BUSINESS ACTIVATION REQUIRED', 'Designed, but nothing here books a real load while the service is paused.');
    const paused = stateBlock({ kind: 'paused', title: 'BROKERAGE IS PAUSED', body: 'BUSINESS ACTIVATION IS REQUIRED BEFORE AIO BROKERS FREIGHT; AUTHORITY AND LICENSING ARE SEPARATE. THE PAGES BELOW ARE DESIGNED AND SHOW DEMO RECORDS ONLY. NOTHING HERE ACTIVATES THE SERVICE.' });
    let body;
    if (tab === 'overview') body = `${paused}${serviceChips(['BROKERAGE'])}${section('DEMO RECORDS', 'FOR REVIEW ONLY.', rows(all.map(recRow('shipment'))))}<div class="panel acts" style="margin-top:14px">${FOUNDER ? `<div class="acts__i acts__i--off" aria-disabled="true"><span>ACTIVATE BROKERAGE</span><small>NEEDS BUSINESS ACTIVATION OUTSIDE THIS REVIEW — NEVER A SWITCH HERE. FOUNDER ONLY.</small></div>` : `<div class="acts__note">${ico('lock')}ONLY THE FOUNDER CAN START BUSINESS ACTIVATION.</div>`}</div>`;
    else if (tab === 'quotes') body = `${paused}${rows(all.filter((s) => /QUOTE/.test(s.ref)).map(recRow('shipment')))}`;
    else if (tab === 'shipments') body = `${paused}${rows(all.filter((s) => /LOAD/.test(s.ref)).map(recRow('shipment')))}`;
    else if (tab === 'offers') body = `${paused}${stateBlock({ kind: 'empty', title: 'NO CARRIER OFFERS', body: 'OFFERS APPEAR WHEN A QUOTE IS SENT TO CARRIERS. NONE WHILE BROKERAGE IS PAUSED.', fields: ['CARRIER', 'RATE', 'EQUIPMENT', 'RESPONSE'] })}`;
    else if (tab === 'stops') body = `${paused}${stateBlock({ kind: 'empty', title: 'NO STOPS IN MOTION', body: 'STOPS AND CHECK CALLS APPEAR FOR BOOKED SHIPMENTS.', fields: ['STOP', 'APPOINTMENT', 'ARRIVED', 'DEPARTED'] })}`;
    else if (tab === 'financials') body = FOUNDER ? `${paused}${rows(all.map((s) => ({ go: recRoute('shipment', s.id), title: s.ref, sub: s.lane, meta: s.margin, status: ['DEMO', 'mute'] })))}${notice('LOAD FINANCIALS ARE FOUNDER · FINANCE ONLY. DEMO FIGURES — NOT REAL TRANSACTIONS.')}` : permissionPage('LOAD FINANCIALS', 'FINANCE ACCESS', 'work/brokerage');
    else return missing(r);
    return laneFrame('brokerage', r, { tab, tabsList: T, kicker: 'WORK › 06', title: 'BROKERAGE', sub: 'PAUSED · BUSINESS ACTIVATION REQUIRED.', body });
  },
  /* 07 */ insurance(tab = 'overview', r) {
    const all = forClient(vals(POLICIES), r);
    const T = [['overview', 'RENEWALS AHEAD'], ['intake', 'INTAKE'], ['quotes', 'QUOTES', all.filter((p) => /QUOTE|CUSTOMER REVIEW/.test(p.renewal + p.request[0])).length], ['policies', 'POLICIES', all.length], ['renewals', 'RENEWALS']];
    meta(`WORK › INSURANCE${tab !== 'overview' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, 'NEW · FOR REVIEW', 'LIVE: PARTIAL · INSURANCE (REFERRAL / ASSISTANCE — NO BIND WITHOUT LICENSING)');
    const W = [['URGENT · 7 DAYS', (p) => p.days <= 7], ['60 DAYS', (p) => p.days > 7 && p.days <= 60], ['LATER', (p) => p.days > 60]];
    let body;
    const ref = notice('<b>REFERRAL AND ASSISTANCE.</b> AIO HELPS CLIENTS RENEW WITH THEIR AGENCY. NOTHING IS BOUND WITHOUT LICENSING.', 'gold');
    if (tab === 'overview' || tab === 'renewals') {
      body = `${serviceChips(['INSURANCE (REFERRAL)'])}${ref}<div class="win" style="margin-top:14px;grid-template-columns:repeat(${VP === 'mobile' ? 1 : 3},minmax(0,1fr))">${W.map(([t, f]) => {
        const xs = all.filter(f);
        return `<div><div class="win__h">${t}<i>${xs.length}</i></div>${rows(xs.map((p) => ({ ...recRow('policy')(p), meta: `EXPIRES ${p.exp} · ${p.days} DAYS` })), 'NOTHING')}</div>`;
      }).join('')}</div>`;
    } else if (tab === 'intake') {
      body = `${ref}${stateBlock({ kind: 'empty', title: 'NO NEW INSURANCE REQUESTS', body: 'A CLIENT ASKING FOR COVERAGE HELP STARTS HERE: WHAT THEY HAVE, WHAT THEY NEED, AND THEIR TRUCKS. NONE THIS WEEK.', fields: ['CLIENT', 'COVERAGE ASKED FOR', 'TRUCKS', 'CURRENT AGENT', 'RECEIVED'] })}`;
    } else if (tab === 'quotes') {
      body = `${ref}${rows(all.filter((p) => /QUOTE|CUSTOMER REVIEW/.test(p.renewal + p.request[0])).map((p) => ({ ...recRow('policy')(p), meta: p.renewal })), 'NO QUOTES IN PROGRESS')}`;
    } else if (tab === 'policies') {
      body = rows(all.map((p) => ({ ...recRow('policy')(p), meta: `${p.partner} · EXPIRES ${p.exp}` })));
    } else return missing(r);
    return laneFrame('insurance', r, { tab, tabsList: T, kicker: 'WORK › 07', title: 'INSURANCE', sub: 'POLICIES, RENEWALS AND THE DOCUMENTS THAT PROVE THEM.', body });
  },
  /* 08 */ factoring(tab = 'submissions', r) {
    const all = forClient(vals(SUBMISSIONS), r);
    const T = [['submissions', 'SUBMISSIONS', all.length], ['providers', 'PROVIDER RELATIONSHIPS']];
    meta(`WORK › FACTORING${tab !== 'submissions' ? ' › PROVIDER RELATIONSHIPS' : ''}`, 'NEW · FOR REVIEW', 'LIVE: PARTIAL · FACTORING (PARTNER REFERRAL — NOT DIRECT FUNDING)');
    const ref = notice('<b>PARTNER REFERRAL — NOT DIRECT FUNDING.</b> AIO PREPARES THE PACKAGE; THE CLIENT’S OWN PROVIDER FUNDS IT. EXISTING PROVIDER RELATIONSHIPS ARE KEPT.', 'gold');
    let body;
    if (tab === 'submissions') {
      const cols = [['DOCUMENTS NEEDED', 'DOCUMENTS NEEDED'], ['SENT TO PROVIDER', 'SENT TO PROVIDER'], ['FUNDED', 'FUNDED']];
      body = `${serviceChips(['FACTORING (PARTNER)'])}${ref}<div class="board" style="--cols:3;margin-top:14px">${cols.map(([t, w]) => {
        const xs = all.filter((f) => statusOf('submission', f, f.status)[0] === w);
        return `<div class="col"><div class="col__h">${t}<i>${xs.length}</i></div>${xs.map((f) => `<div class="card" data-go="rec/submission/${f.id}"><b>${f.ref}</b><small>${f.invoice}</small><div class="card__m">${st(statusOf('submission', f, f.status))}<span>${clientName(f.client)}</span></div></div>`).join('') || '<small class="muted">NOTHING HERE</small>'}</div>`;
      }).join('')}</div>`;
    } else if (tab === 'providers') {
      const ids = [...new Set(all.map((f) => f.client))];
      body = `${ref}${rows(ids.map((id) => ({ go: `client/${id}`, lead: badge(client(id)), title: clientName(id), sub: `${all.find((f) => f.client === id).provider} · ${all.filter((f) => f.client === id).length} SUBMISSIONS`, status: ['RELATIONSHIP KEPT', 'ok'] })))}`;
    } else return missing(r);
    return laneFrame('factoring', r, { tab, tabsList: T, kicker: 'WORK › 08', title: 'FACTORING', sub: 'SUBMISSIONS TO EACH CLIENT’S OWN PROVIDER.', body });
  },
  /* 09 */ bookkeeping(tab = 'monthly', r) {
    const subs = forClient(vals(SUBSCRIPTIONS), r);
    const T = [['monthly', 'MONTHLY CLIENTS', subs.length], ['annual', 'ANNUAL CLIENTS', 0], ['packages', 'PACKAGES'], ['reconciliation', 'RECONCILIATION', null, 'mute'], ['deliverables', 'DELIVERABLES', null, 'mute']];
    meta(`WORK › BOOKKEEPING${tab !== 'monthly' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, ['reconciliation', 'deliverables'].includes(tab) ? 'HONEST STATE' : 'NEW · FOR REVIEW', ['reconciliation', 'deliverables'].includes(tab) ? 'LIVE: NOT BUILT' : 'LIVE: PARTIAL · BOOKKEEPING (SEED DATA TODAY)');
    let body;
    if (tab === 'monthly') {
      body = `${serviceChips(['BOOKKEEPING'])}<div class="grid3">${subs.map((b) => {
        const c = b.cycle && CYCLES[b.cycle];
        return `<div class="unit" data-go="${c ? `rec/cycle/${c.id}` : `rec/subscription/${b.id}`}"><div class="unit__top"><span class="unit__ico">${ico('calculator')}</span><span class="unit__t"><b>${clientName(b.client)}</b><small>${b.pkg}</small></span></div>${c ? `<div class="meter"><i style="width:${(c.step / (CYCLE_STEPS.length - 1)) * 100}%"></i></div><small class="muted">${c.period} · ${CYCLE_STEPS[c.step]} · DUE ${c.due}</small>${st(statusOf('cycle', c, c.status))}` : st(statusOf('subscription', b, b.status))}</div>`;
      }).join('')}</div>${section('THE CLOSE, STEP BY STEP', 'EVERY MONTHLY CLIENT MOVES THROUGH THE SAME NINE STEPS.', stepper(CYCLE_STEPS, -1).replace('class="steps"', 'class="steps steps--h"'))}`;
    } else if (tab === 'annual') body = stateBlock({ kind: 'empty', title: 'NO ANNUAL CLIENTS', body: 'ANNUAL BOOKKEEPING CLIENTS APPEAR HERE. NONE ARE SET UP IN THE SAMPLE.', fields: ['CLIENT', 'PACKAGE', 'YEAR', 'STATUS'] });
    else if (tab === 'packages') {
      body = `${notice('THE THREE PACKAGES ARE KEPT AS THEY ARE. PRICING IS FOUNDER-ONLY AND LIVES IN MORE › SERVICE CATALOG.')}<div class="grid3" style="margin-top:12px">${['ESSENTIALS', 'PLUS', 'ALL IN ONE BOOKKEEPING'].map((p) => `<div class="lk"><span class="lk__l">${ico('calculator')}PACKAGE</span><b>${p}</b><small class="muted">${subs.filter((b) => b.pkg === p).length} CLIENTS</small></div>`).join('')}</div>`;
    } else if (tab === 'reconciliation') body = stateBlock({ kind: 'notbuilt', title: 'RECONCILIATION', body: 'MATCHING BANK AND CARD LINES TO CATEGORIES FOR EACH CLOSE. THE STEP IS TRACKED ON THE CLOSE; THE WORKSPACE IS NOT BUILT.', fields: ['ACCOUNT', 'STATEMENT BALANCE', 'BOOK BALANCE', 'DIFFERENCE', 'UNMATCHED LINES'], gap: 'IA: BOOKKEEPING › RECONCILIATION · NOT_STARTED' });
    else if (tab === 'deliverables') body = stateBlock({ kind: 'notbuilt', title: 'DELIVERABLES', body: 'THE MONTHLY REPORTS EACH CLIENT RECEIVES. NO REPORT RENDERER OR DELIVERY RECORD EXISTS YET.', fields: ['CLIENT', 'PERIOD', 'PROFIT & LOSS', 'BALANCE SHEET', 'DELIVERED'], gap: 'IA: BOOKKEEPING › DELIVERABLES · NOT_STARTED' });
    else return missing(r);
    return laneFrame('bookkeeping', r, { tab, tabsList: T, kicker: 'WORK › 09', title: 'BOOKKEEPING', sub: 'ESSENTIALS · PLUS · ALL IN ONE BOOKKEEPING.', body });
  },
  /* 10 */ drivers(tab = 'matching', r) {
    const apps = forClient(vals(APPLICATIONS), r);
    const drv = forClient(vals(DRIVERS), r);
    const T = [['matching', 'MATCHING', apps.length], ['directory', 'DRIVERS', drv.length], ['credentials', 'CREDENTIALS', null, 'mute'], ['approvals', 'APPROVALS', null, 'mute']];
    meta(`WORK › DRIVERS & CARRIERS${tab !== 'matching' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, ['credentials', 'approvals'].includes(tab) ? 'HONEST STATE' : 'NEW · FOR REVIEW', ['credentials', 'approvals'].includes(tab) ? 'LIVE: NOT BUILT' : 'LIVE: PARTIAL · DRIVERLINK MATCHING');
    let body;
    if (tab === 'matching') body = `${notice('DRIVERS & CARRIERS DOES NOT ASSIGN WORK TO STAFF YET. APPLICATIONS ARE MATCHED TO CLIENTS’ OPEN POSITIONS.')}${rows(apps.map((a) => ({ go: recRoute('application', a.id), lead: icoTile('steering'), title: a.who, sub: a.job, meta: a.at, status: statusOf('application', a, a.status) })))}`;
    else if (tab === 'directory') body = rows(drv.map((d) => ({ go: recRoute('driver', d.id), lead: icoTile('steering'), title: d.name, sub: `${clientName(d.client)} · ${d.cdl}`, meta: d.med, status: statusOf('driver', d, d.status) })));
    else if (tab === 'credentials') body = `${stateBlock({ kind: 'notbuilt', title: 'CREDENTIALS & VERIFICATION', body: 'ONE CREDENTIAL FILE PER DRIVER — CDL, MEDICAL CARD, MVR, CLEARINGHOUSE — WITH VERIFICATION. NOT BUILT. COMPLIANCE ALREADY WATCHES THE EXPIRY DATES BELOW.', fields: ['DRIVER', 'CREDENTIAL', 'VERIFIED BY', 'VERIFIED ON', 'EXPIRES'], gap: 'IA: DRIVERS_CARRIERS › CREDENTIALS · NOT_STARTED' })}${section('WHAT COMPLIANCE TRACKS', '', rows(vals(DUES).filter((d) => d.kind.startsWith('DRIVER')).map((d) => ({ go: recRoute('deadline', d.id), title: d.what, sub: clientName(d.client), meta: d.due, status: statusOf('deadline', d, d.state) }))))}`;
    else if (tab === 'approvals') body = stateBlock({ kind: 'notbuilt', title: 'APPROVALS', body: 'THE CLIENT’S HIRE DECISION AND AIO’S QUALIFICATION SIGN-OFF. NOT BUILT; CLIENTS DECIDE OUTSIDE AIO TODAY.', fields: ['APPLICANT', 'CLIENT', 'QUALIFIED', 'DECISION', 'DATE'], gap: 'IA: DRIVERS_CARRIERS › APPROVALS · NOT_STARTED' });
    else return missing(r);
    return laneFrame('drivers', r, { tab, tabsList: T, kicker: 'WORK › 10', title: 'DRIVERS & CARRIERS', sub: 'MATCHING DRIVERS TO CLIENTS, AND THE DRIVERS ON FILE.', body });
  },
  /* 11 */ maintenance(tab = 'tickets', r) {
    const all = forClient(vals(TICKETS), r);
    const holds = forClient(vals(VEHICLES), r).filter((v) => v.ticket);
    const T = [['tickets', 'TICKETS', all.length], ['status', 'MAINTENANCE STATUS', holds.length, 'bad'], ['providers', 'PROVIDERS', vals(PROVIDERS).length], ['referrals', 'REFERRALS']];
    meta(`WORK › MECHANIC / MAINTENANCE${tab !== 'tickets' ? ` › ${T.find(([k]) => k === tab)?.[1]}` : ''}`, 'NEW · FOR REVIEW', 'LIVE: PARTIAL · FLEETCARE TICKETS');
    let body;
    if (tab === 'tickets') {
      const cols = [['SCHEDULED', (t) => t.status[0] === 'SCHEDULED'], ['WAITING', (t) => /AWAITING/.test(t.status[0])], ['DONE', (t) => /RETURNED/.test(statusOf('ticket', t, t.status)[0])]];
      body = `${notice('PROVIDERS OWN THE REPAIR. AIO COORDINATES THE TICKET, THE CLIENT’S AUTHORIZATION AND THE TRUCK’S AVAILABILITY. MAINTENANCE DOES NOT ASSIGN WORK TO STAFF YET.')}<div class="board" style="--cols:3;margin-top:14px">${cols.map(([t, f]) => {
        const xs = all.filter((x) => (t === 'DONE' ? f(x) : f(x) && !/RETURNED/.test(statusOf('ticket', x, x.status)[0])));
        return `<div class="col"><div class="col__h">${t}<i>${xs.length}</i></div>${xs.map((x) => `<div class="card" data-go="rec/ticket/${x.id}"><b>${x.ref} · ${VEHICLES[x.vehicle].unit}</b><small>${x.issue}</small><div class="card__m">${st(statusOf('ticket', x, x.status))}<span>${clientName(x.client)}</span></div></div>`).join('') || '<small class="muted">NOTHING HERE</small>'}</div>`;
      }).join('')}</div>`;
    } else if (tab === 'status') body = `<div class="fleet">${holds.map(unitCard).join('')}</div>`;
    else if (tab === 'providers') body = `${rows(vals(PROVIDERS).map((p) => ({ go: `more/mechanic_network/${p.id}`, lead: icoTile('wrench'), title: p.name, sub: p.where, status: p.verify })))}${notice('THE FULL NETWORK — PARTNERS, COVERAGE AND VERIFICATION — LIVES IN MORE › MECHANIC NETWORK.')}`;
    else if (tab === 'referrals') body = stateBlock({ kind: 'empty', title: 'NO OPEN REFERRALS', body: 'A REFERRAL SENDS A CLIENT TO A NETWORK PROVIDER WITHOUT A TICKET (FOR EXAMPLE, A NEW TIRE ACCOUNT). NONE OPEN.', fields: ['CLIENT', 'PROVIDER', 'REASON', 'SENT', 'OUTCOME'] });
    else return missing(r);
    return laneFrame('maintenance', r, { tab, tabsList: T, kicker: 'WORK › 11', title: 'MECHANIC / MAINTENANCE', sub: 'TICKETS, TRUCKS ON HOLD AND THE PROVIDERS WHO DO THE WORK.', body });
  },
  /* 12 */ roadready(tab = 'profiles', r) {
    const all = forClient(vals(PROFILES), r);
    const T = [['profiles', 'PROFILES', all.length], ['attention', 'OPEN ITEMS', all.reduce((n, p) => n + p.items.filter((i) => i[2] === 'bad' || i[2] === 'gold').length, 0)]];
    meta(`WORK › ROAD READY${tab !== 'profiles' ? ' › OPEN ITEMS' : ''}`, 'NEW · FOR REVIEW', 'LIVE: PARTIAL · ROAD READY (NO ENGAGEMENT STATE)');
    const aa = notice('<b>AVAILABLE IS NOT ACTIVE.</b> EVERY CLIENT CAN SEE ROAD READY AS AVAILABLE. IT IS ACTIVE ONLY WHEN THE CLIENT STARTS IT — THE LIVE APP HAS NO ENGAGEMENT STATE YET, SO NONE IS SHOWN AS ACTIVE BY DEFAULT.', 'gold');
    let body;
    if (tab === 'profiles') body = `${aa}<div class="grid3" style="margin-top:14px">${all.map((p) => `<div class="unit" data-go="rec/profile/${p.id}"><div class="unit__top"><span class="unit__ico">${ico('tests')}</span><span class="unit__t"><b>${clientName(p.client)}</b><small>${p.done} OF ${p.total} COMPLETE</small></span></div><div class="meter"><i style="width:${(p.done / p.total) * 100}%"></i></div>${st(statusOf('profile', p, p.mode))}</div>`).join('')}</div>`;
    else if (tab === 'attention') body = `${aa}${rows(all.flatMap((p) => p.items.filter((i) => i[2] === 'bad' || i[2] === 'gold').map((i) => ({ go: recRoute('profile', p.id), lead: badge(client(p.client)), title: i[0], sub: clientName(p.client), status: [i[1], i[2]] }))))}`;
    else return missing(r);
    return laneFrame('roadready', r, { tab, tabsList: T, kicker: 'WORK › 12', title: 'ROAD READY', sub: 'WHAT A CARRIER NEEDS BEFORE THE FIRST LOAD.', body });
  },
};
