/*
 * HOME · TRIAGE — the deeper layer behind the approved HOME root (not a new app: the root's three counters, its rows
 * and its quick actions, opened up). A triage desk: the views on the left (NEEDS ATTENTION · DEADLINES · BLOCKED ·
 * ACTIVITY · NOTIFICATIONS · MY WORK · ALL OPEN WORK · QUICK ACTIONS), a priority-ordered stream in the middle, and the
 * selected item previewed on the right with OPEN IN <DEPARTMENT> — the department that owns the record does the work.
 * Reached from the root's VIEW ALL links, the + and WORK's MY WORK / ALL OPEN WORK. Sample records only.
 */
WSX.hm = { view: 'attention', item: null, lane: 'all', q: '', vis: 'all' };

const HM_VIEWS = [
  ['attention', 'NEEDS ATTENTION', 'warning', 'TRIAGE', 'ATTENTION'],
  ['deadlines', 'DEADLINES', 'calendar', 'TRIAGE', 'DEADLINES'],
  ['blocked', 'BLOCKED', 'blocked', 'TRIAGE', 'BLOCKED'],
  ['activity', 'ACTIVITY', 'history', 'STREAMS', 'ACTIVITY'],
  ['notifications', 'NOTIFICATIONS', 'notification', 'STREAMS', 'BELL'],
  ['mine', 'MY WORK', 'profile', 'WORK', 'MY WORK'],
  ['queue', 'ALL OPEN WORK', 'queued', 'WORK', 'ALL OPEN'],
  ['quick', 'QUICK ACTIONS', 'run', 'ACT', 'QUICK'],
];
/** SAMPLE · the rest of the activity feed (as Batch 1 HOME › RECENT ACTIVITY; the root shows the first five). */
const HM_ACTIVITY_MORE = [
  { go: 'rec/ticket/t-tk-2', t: 'REPAIR ESTIMATE UPLOADED FOR UNIT 09', time: '3 HRS AGO', vis: 'client' },
  { go: 'rec/load/ld-5518', t: 'LOAD 5518 DELIVERED — PROOF OF DELIVERY STILL NEEDED', time: 'YESTERDAY', vis: 'internal' },
  { go: 'rec/cycle/cy-tk-sep', t: 'SEPTEMBER BOOKS: 3 QUESTIONS SENT TO T&K TRANSPORT', time: '2 DAYS AGO', vis: 'client' },
  { go: 'intake/case/mig-hc', t: 'ACTIVATION INVITE SENT TO HEARTLAND FREIGHT CO.', time: 'OCT 6', vis: 'internal' },
];
/** SAMPLE · the bell (the live app has no notification feed yet). [title, detail, route, when, new, tone] */
const HM_NOTIFS = [
  ['MASON TRANSPORT REPLIED', 'WHEN WILL MY AUTHORITY BE ACTIVE?', 'rec/thread/th-mt', '1 HR AGO', true, 'gold'],
  ['T&K TRANSPORT UPLOADED 3 DOCUMENTS', 'FUEL RECEIPTS · BILL OF LADING · REPAIR ESTIMATE', 'more/documents_vault@c-tk', '3 HRS AGO', true, 'gold'],
  ['EXPIRING IN 6 DAYS', 'AUTO LIABILITY · DELTA HAULING LLC', 'rec/policy/pol-dh', 'TODAY', false, 'bad'],
  ['READY FOR REVIEW', 'Q3 2026 IFTA RETURN · RIVERSTONE LOGISTICS', 'rec/quarter/ifta-rl-q3', '5 HRS AGO', false, 'warn'],
  ['ASSIGNED TO YOU', 'MC AUTHORITY REINSTATEMENT · HORIZON FREIGHT', 'rec/request/req-hf-mc', '2 DAYS AGO', false, 'mute'],
];
/** SAMPLE · work assigned to you (as Batch 1 WORK › MY WORK: 7 assigned, 3 due this week). [type, id, due, group] */
const HM_MINE = [
  ['thread', 'th-mt', 'REPLY TODAY', 'TODAY'],
  ['document', 'doc-tk-1', 'REVIEW TODAY', 'TODAY'],
  ['request', 'req-hf-mc', 'DUE OCT 10', 'THIS WEEK'],
  ['policy', 'pol-dh', 'DUE OCT 14', 'LATER'],
  ['deadline', 'dl-abc-med', 'DUE OCT 29', 'LATER'],
  ['quarter', 'ifta-rl-q3', 'DUE OCT 31', 'LATER'],
  ['shipment', 'sh-4471', 'DEMO · PAUSED', 'PAUSED'],
];
const HM_MORE = { documents_vault: ['DOCUMENTS & VAULT', 'folder', 'documents'], messages: ['MESSAGES', 'letter', 'messages'], billing: ['BILLING', 'summary', 'billing'], growth_crm: ['GROWTH / CRM', 'tag', 'crm'] };
const HM_TONE = { bad: 0, warn: 1, gold: 2, ok: 3, mute: 4 };
const HM_QGROUP = { 'intake/flow/existing/0': 'START', 'intake/flow/new/0': 'START', 'work/compliance/expirations': 'FIND · TALK', 'more/messages': 'FIND · TALK' };

/** Where a route leads: the record (if any), the department that owns it, its icon, the client. */
function hmRoute(go) {
  const [path, at] = String(go).split('@');
  const s = path.split('/');
  if (s[0] === 'rec') {
    const type = s[1];
    const lane = RECORD_TYPES[type]?.lane;
    const r = rec(type, s[2]);
    const l = lane ? laneBySlug(lane) : null;
    return { type, id: s[2], r, dept: l ? l.name : OWNER_LABEL[type], icon: l ? l.icon : OWNER_ICON[type], dk: lane || type, root: lane ? 'WORK' : 'MORE', cid: r?.client ?? at };
  }
  if (s[0] === 'more') {
    const m = HM_MORE[s[1]] ?? [s[1].toUpperCase().replace(/_/g, ' '), 'menu', s[1]];
    return { type: 'more', id: s[1], dept: m[0], icon: m[1], dk: m[2], root: 'MORE', cid: at };
  }
  if (s[0] === 'intake') return { type: 'case', id: s[2], r: MIG_CASES[s[2]], dept: 'INTAKE', icon: 'migrate', dk: 'intake', root: 'INTAKE', cid: MIG_CASES[s[2]]?.client };
  const l = laneBySlug(s[1]);
  return { type: 'page', id: s[1], dept: l ? l.name : s[0].toUpperCase(), icon: l ? l.icon : 'folder', dk: s[1], root: s[0].toUpperCase(), cid: at };
}
const hmAgeRank = (t) => (/(\d+) HRS? AGO/.test(t) ? Number(RegExp.$1) : /YESTERDAY/.test(t) ? 24 : /(\d+) DAYS AGO/.test(t) ? 24 * Number(RegExp.$1) : 72);
const hmRead = () => ov('hm:notif', '') === 'read';
const hmNewCount = () => (hmRead() ? 0 : HM_NOTIFS.filter((n) => n[4]).length);

/** The items of a view, normalised: key, route, client, what, age, priority word, group. */
function hmItems(view = WSX.hm.view) {
  const mk = (o) => ({ ...hmRoute(o.go), ...o, key: o.go });
  let out = [];
  if (HOME_LISTS[view]) out = HOME_LISTS[view].map((i) => mk({ go: i[2], what: i[4], age: i[6], pri: [i[0], i[1]], grp: view === 'blocked' ? i[7] : i[0], gt: i[1] }));
  if (view === 'activity') {
    out = [...ACTIVITY.filter((e) => FOUNDER || !e.founder), ...HM_ACTIVITY_MORE].sort((a, b) => hmAgeRank(a.time) - hmAgeRank(b.time)).map((e) => mk({ go: e.go, what: e.t, age: e.time, pri: e.vis === 'client' ? ['CLIENT-VISIBLE', 'ok'] : ['INTERNAL', 'mute'], grp: /HRS? AGO/.test(e.time) ? 'TODAY' : 'EARLIER', gt: 'gold', vis: e.vis }));
    if (WSX.hm.vis !== 'all') out = out.filter((x) => x.vis === WSX.hm.vis);
  }
  if (view === 'notifications') out = HM_NOTIFS.map(([t, d, go, when, isNew, tone]) => { const n = isNew && !hmRead(); return mk({ go, what: t, sub2: d, age: when, pri: n ? ['NEW', 'gold'] : tone === 'bad' ? ['URGENT', 'bad'] : ['READ', 'mute'], grp: n ? 'NEW' : 'EARLIER', gt: n ? 'gold' : 'mute' }); }).sort((a, b) => (a.grp === b.grp ? 0 : a.grp === 'NEW' ? -1 : 1));
  if (view === 'mine') out = HM_MINE.map(([type, id, due, g]) => { const r = rec(type, id); return mk({ go: `rec/${type}/${id}`, what: RECORD_TYPES[type].title(r), age: due, pri: ov(`${type}:${id}`, statusWord(r)), grp: g, gt: g === 'TODAY' ? 'warn' : g === 'THIS WEEK' ? 'gold' : 'mute' }); });
  if (view === 'queue') {
    for (const [type, def] of Object.entries(RECORD_TYPES)) {
      if (!def.lane || ['vehicle', 'driver', 'profile', 'subscription'].includes(type)) continue;
      for (const r of vals(def.table)) {
        const s = ov(`${type}:${r.id}`, statusWord(r));
        if (s && ['bad', 'warn', 'gold'].includes(s[1])) out.push(mk({ go: `rec/${type}/${r.id}`, what: RECORD_TYPES[type].title(r), age: r.due || r.exp || r.delivery || '', pri: s, grp: { bad: 'BLOCKED OR LATE', warn: 'NEEDS ACTION', gold: 'IN PROGRESS' }[s[1]], gt: s[1] }));
      }
    }
    out.sort((a, b) => HM_TONE[a.pri[1]] - HM_TONE[b.pri[1]]);
  }
  if (view === 'quick') out = QUICK.filter((a) => FOUNDER || !a.grant).map((a) => ({ ...hmRoute(a.go), key: a.go, go: a.go, what: a.l, to: a.to, icon: a.i, grant: a.grant, grp: a.grant ? 'BY GRANT' : HM_QGROUP[a.go] ?? 'START', gt: 'gold', quick: true }));
  if (view !== 'quick' && WSX.hm.lane !== 'all') out = out.filter((x) => x.dk === WSX.hm.lane);
  const q = WSX.hm.q.trim().toUpperCase();
  if (q) out = out.filter((x) => `${x.what} ${x.dept} ${x.cid ? clientName(x.cid) : ''} ${x.to ?? ''}`.includes(q));
  return out;
}
/** A view's items without the desk's department filter or search (for counts and the department list). */
function hmAll(view) {
  const keep = { lane: WSX.hm.lane, q: WSX.hm.q, vis: WSX.hm.vis };
  Object.assign(WSX.hm, { lane: 'all', q: '', vis: view === WSX.hm.view ? keep.vis : 'all' });
  const list = hmItems(view);
  Object.assign(WSX.hm, keep);
  return list;
}
const hmTitle = (v = WSX.hm.view) => HM_VIEWS.find(([id]) => id === v)[1];
function hmSel(list = hmItems()) {
  return list.find((x) => x.key === WSX.hm.item) ?? list[0] ?? null;
}
const hmTrail = (x) => (x.type === 'case' ? 'INTAKE › CASES' : x.type === 'page' ? x.to ?? x.root : `${x.root} › ${x.dept}`);

/* ── the desk: views and departments ── */
function hmDesk() {
  const v = WSX.hm.view;
  const groups = [...new Set(HM_VIEWS.map((x) => x[3]))];
  const counts = { attention: HOME_LISTS.attention.length, deadlines: HOME_LISTS.deadlines.length, blocked: HOME_LISTS.blocked.length, mine: HM_MINE.length };
  const views = groups.map((g) => `<div class="grp"><span>${g}</span></div>${HM_VIEWS.filter((x) => x[3] === g).map(([id, l, i]) => {
    const n = id === 'notifications' ? hmNewCount() : id === 'quick' ? null : counts[id] ?? hmAll(id).length;
    const tone = id === 'blocked' ? 'bad' : id === 'deadlines' ? 'warn' : id === 'notifications' && n ? 'gold' : '';
    return `<button type="button" class="hm-v ${id === v ? 'is-on' : ''}" data-a="hm.view" data-v="${id}" aria-pressed="${id === v}">${ico(i)}<span>${l}</span>${n != null ? `<b class="${tone ? `hm-n--${tone}` : ''}">${id === 'notifications' ? (n ? `${n} NEW` : '0') : n}</b>` : ''}</button>`;
  }).join('')}`).join('');
  let depts = '';
  if (v !== 'quick') {
    const all = hmAll(v);
    const ds = [...new Map(all.map((x) => [x.dk, x])).values()];
    depts = `<div class="grp"><span>DEPARTMENTS</span><span>${ds.length}</span></div><div class="hm-desk__b"><button type="button" class="hm-d ${WSX.hm.lane === 'all' ? 'is-on' : ''}" data-a="hm.lane" data-v="all">${ico('menu')}<span>ALL DEPARTMENTS</span><b>${all.length}</b></button>${ds.map((x) => `<button type="button" class="hm-d ${WSX.hm.lane === x.dk ? 'is-on' : ''}" data-a="hm.lane" data-v="${x.dk}" title="${x.dept}">${ico(x.icon)}<span>${x.dept}</span><b>${all.filter((y) => y.dk === x.dk).length}</b></button>`).join('')}</div>`;
  }
  return rgn('TRIAGE DESK', '', '', `<nav class="hm-desk__b" aria-label="Triage views">${views}</nav>${depts}`, 'hm-desk', 'hm-desk');
}

/* ── the stream ── */
function hmRow(x, sel, a) {
  const c = x.cid ? ACCOUNTS[x.cid] : null;
  const tone = x.pri?.[1] ?? 'mute';
  return `<div class="pk hm-row ${sel ? 'is-sel' : ''}" data-a="${a}" data-v="${x.key}" title="${x.what}${c ? ` · ${c.name}` : ''}" aria-pressed="${sel}">
    <span class="hm-row__i hm-row__i--${tone}">${ico(x.icon)}</span>
    <span class="hm-row__t">${c ? `<span class="hm-row__who">${badge(c)}<b>${c.name}</b></span>` : `<span class="hm-row__who"><b>${x.dept}</b></span>`}<span class="hm-row__what">${x.what}</span>${x.sub2 ? `<span class="hm-row__sub">${x.sub2}</span>` : ''}<span class="hm-row__to">${ico('fwd')}${hmTrail(x)}</span></span>
    <span class="hm-row__r"><small>${x.age}</small>${x.pri ? sw(x.pri) : ''}</span>${WIDE && VP === 'desktop' ? hmRowMore(x) : ''}
  </div>`;
}
/** Ultra-wide: what the record itself says, and who owns it, under the row. */
function hmRowMore(x) {
  const s = x.r && x.type !== 'case' ? ov(`${x.type}:${x.id}`, statusWord(x.r)) : x.type === 'case' ? x.r?.stage : null;
  const own = x.r?.owner ?? (x.type === 'deadline' ? DUE_META[x.id]?.owner : null);
  if (!s && !own) return '';
  return `<span class="hm-row__more">${s ? `<span><small>RECORD</small>${sw(s)}</span>` : ''}${own && STAFF[own] ? `<span><small>OWNER</small>${av(own)}<b>${STAFF[own].name}</b></span>` : ''}</span>`;
}
function hmGroups(list, sel, a, render = hmRow) {
  const groups = [...new Set(list.map((x) => x.grp))];
  return groups.map((g) => {
    const xs = list.filter((x) => x.grp === g);
    return `<div class="hm-col"><div class="grp hm-grp"><span><i class="pip pip--${xs[0].gt}"></i>${g}</span><span>${xs.length}</span></div>${xs.map((x) => render(x, !!sel && x.key === sel.key, a)).join('')}</div>`;
  }).join('');
}
function hmQuickTile(x, sel, a) {
  return `<button type="button" class="hm-q ${sel ? 'is-on' : ''}" data-a="${a}" data-v="${x.key}" aria-pressed="${sel}"><span class="hm-q__i">${ico(x.icon)}</span><b>${x.what}${x.grant ? ' <span class="founder">BY GRANT</span>' : ''}</b><small>${x.to}</small></button>`;
}
function hmHonest() {
  const v = WSX.hm.view;
  if (HOME_LISTS[v]) return FOUNDER ? ntb('<b>NOT CONNECTED YET:</b> MAINTENANCE HOLDS, ROAD READY, EXCEPTIONS.') : '';
  return {
    activity: ntb('ONE OFFICE-WIDE FEED IS NOT BUILT YET.'),
    notifications: ntb('<b>NOT BUILT YET.</b> THE BELL HAS NO FEED.'),
    mine: ntb('MAINTENANCE AND DRIVERS DO NOT ASSIGN WORK YET.'),
    queue: ntb('<b>NO CROSS-LANE QUEUE YET.</b> READ FROM EACH LANE.'),
    quick: FOUNDER ? '' : ntb('ASSIGN WORK, NEW LEAD AND INVOICES NEED A GRANT.'),
  }[v] ?? '';
}
function hmStream() {
  const v = WSX.hm.view;
  const list = hmItems();
  const sel = VP === 'mobile' && !WSX.sheet ? null : hmSel(list);
  const a = VP === 'mobile' ? 'hm.open' : 'hm.item';
  const find = VP === 'mobile' ? '' : `<label class="wfld hm-find">${ico('search')}<input id="hm-q" data-input="hm.q" value="${WSX.hm.q}" placeholder="${v === 'quick' ? 'TYPE AN ACTION' : 'FIND IN THIS LIST'}" aria-label="Find"></label>`;
  let tools = find;
  if (v === 'activity') tools = `${seg([['all', 'ALL'], ['client', 'CLIENT-VISIBLE'], ['internal', 'INTERNAL']], WSX.hm.vis, 'hm.vis')}${VP === 'desktop' && !WIDE ? '' : find}`;
  if (v === 'notifications') tools = sw(hmNewCount() ? [`${hmNewCount()} UNREAD`, 'gold'] : ['ALL READ', 'ok']);
  const bar = v === 'notifications' && hmNewCount() ? `<div class="hm-bar">${simBtn('hm:read', { label: 'MARK ALL READ', effect: 'CLEARS THE UNREAD MARK ON YOUR NOTIFICATIONS ONLY.', apply: () => (WSX.over['hm:notif'] = 'read'), sm: true })}</div>` : '';
  const body = !list.length
    ? `<div class="hm-empty">${ico('pass')}<b>NOTHING HERE</b><span>${WSX.hm.q ? 'NO ITEM MATCHES THE SEARCH' : 'NOTHING IN THIS DEPARTMENT'}</span></div>`
    : v === 'quick'
      ? `<div class="hm-qwrap">${hmGroups(list, sel, a, hmQuickTile).replace(/class="hm-col"/g, 'class="hm-col hm-col--q"')}</div>`
      : `<div class="hm-cols hm-cols--${new Set(list.map((x) => x.grp)).size}">${hmGroups(list, sel, a)}</div>`;
  const head = v === 'quick' && VP !== 'mobile' ? `<div class="hm-cmd"><span class="hm-cmd__t"><small>HOME · QUICK ACTIONS</small><b>WHAT DO YOU WANT TO DO?</b></span>${find}</div>` : '';
  const title = v === 'quick' ? 'COMMANDS' : hmTitle();
  return `<section class="rg hm-stream ${v === 'quick' ? 'hm-stream--q' : ''}"><header class="rg__h"><span class="rg__t">${title}</span><span class="rg__n">${list.length}${WSX.hm.lane !== 'all' && v !== 'quick' ? ' · ONE DEPARTMENT' : ''}</span><span class="hm-tools">${v === 'quick' ? '' : tools}</span></header><div class="rg__b" data-keep="hm-stream">${head}${bar}<div class="hm-swap" data-swap="st:${v}:${WSX.hm.lane}:${WSX.hm.vis}">${body}</div><div class="hm-honest">${hmHonest()}</div></div></section>`;
}

/* ── the preview ── */
function hmFacts(type, r) {
  const S = (id) => staffName(id);
  switch (type) {
    case 'policy': return [['COVERAGE', r.title], ['PLACED WITH', r.partner], ['EXPIRES', r.exp, daysWord(r.days)], ['RENEWAL', r.renewal], ['OWNER', S(r.owner)]];
    case 'request': return [['SECTION', r.section], ['DUE', r.due], ['WAITING ON', r.blocker ?? '—'], ['OWNER', S(r.owner)]];
    case 'quarter': return [['QUARTER', r.q], ['DUE', r.due], ['NEXT', r.next], ['OWNER', S(r.owner)]];
    case 'thread': { const m = r.msgs[r.msgs.length - 1]; return [['SUBJECT', r.subject], ['LAST', m[2], `${m[1]} · ${m[3]}`], ['MESSAGES', String(r.msgs.length)]]; }
    case 'load': return [['LANE', r.lane], ['PICKUP · DELIVERY', `${r.pickup} · ${r.delivery}`], ['TRUCK', VEHICLES[r.vehicle]?.unit ?? '—'], ['ISSUE', r.exception ?? 'NONE'], ['DISPATCHER', S(r.owner)]];
    case 'deadline': return [['DUE', r.due, r.days <= 0 ? '' : daysWord(r.days)], ['KIND', r.kind], ['OWNER', S(DUE_META[r.id]?.owner)]];
    case 'shipment': return [['LANE', r.lane], ['SHIPPER', r.shipper], ['CARRIER', r.carrier], ['NOTE', 'BROKERAGE IS PAUSED · DEMO RECORD']];
    case 'document': return [['TYPE', r.type], ['ADDED', r.added], ['VISIBLE TO', r.vis === 'client' ? 'CLIENT AND STAFF' : 'STAFF ONLY']];
    case 'ticket': return [['ISSUE', r.issue], ['PROVIDER', PROVIDERS[r.provider].name.replace('SAMPLE PROVIDER · ', ''), PROVIDERS[r.provider].where], ['URGENCY', r.urgency]];
    case 'cycle': return [['PERIOD', r.period], ['STEP', `${r.step + 1} OF 9 · ${CYCLE_STEPS[r.step]}`], ['DUE', r.due]];
    case 'application': return [['JOB', r.job], ['APPLICANT', r.who], ['RECEIVED', r.at]];
    case 'submission': return [['INVOICE', r.invoice], ['PROVIDER', r.provider], ['WAITING ON', r.blocker ?? '—']];
    case 'invoice': return [['FOR', r.what], ['AMOUNT', `${r.amount} <small>SAMPLE</small>`], ['DATE', r.date]];
    case 'case': return [['SOURCE', r.source], ['FOUND', r.found], ['FILES', String(r.files)], ['OWNER', S(r.owner)], ['STARTED', r.started]];
    default: return [];
  }
}
/** For a record in MY WORK or ALL OPEN WORK: what it is waiting on, in the record's own words. */
function hmNeed(x) {
  const r = x.r ?? {};
  return r.blocker ?? r.exception ?? r.question ?? (x.type === 'quarter' ? r.next : null) ?? (x.type === 'policy' ? r.renewal : null) ?? (x.type === 'deadline' ? DUE_META[x.id]?.need : null) ?? `${x.pri?.[0] ?? 'OPEN'} · ${x.dept}`;
}
function hmPreview(list = hmItems()) {
  const x = hmSel(list);
  const v = WSX.hm.view;
  if (!x) return `<section class="rg cx hm-cx"><header class="cx__h"><div class="cx__crumb"><span>HOME</span>${ico('fwd')}<span>${hmTitle()}</span></div><h2 class="cx__t">NOTHING SELECTED</h2></header><div class="cx__b">${nextBlock('NOTHING IN THIS VIEW', '', 'calm')}</div></section>`;
  const i = list.indexOf(x);
  const step = `<span class="hm-step"><button type="button" class="cx__back" data-a="hm.step" data-v="-1" aria-label="Previous" ${i <= 0 ? 'disabled' : ''}>${ico('back')}</button><button type="button" class="cx__back" data-a="hm.step" data-v="1" aria-label="Next" ${i >= list.length - 1 ? 'disabled' : ''}>${ico('fwd')}</button></span>`;
  const crumb = `<div class="cx__crumb hm-crumb"><span>HOME</span>${ico('fwd')}<span>${hmTitle()}</span>${ico('fwd')}<span>${i + 1} OF ${list.length}</span>${step}</div>`;
  const c = x.cid ? ACCOUNTS[x.cid] : null;
  const open = `<button type="button" class="wbtn wbtn--gold" data-a="nav" data-v="${x.go}">${ico(x.icon)}OPEN IN ${x.dept}</button>`;
  let status = null;
  let title = x.what;
  let body = '';
  let hist = '';
  if (x.quick) {
    title = x.what;
    body = `${nextBlock(`OPENS ${x.to}`, `<button type="button" class="wbtn wbtn--gold" data-a="nav" data-v="${x.go}">${ico(x.icon)}OPEN ${ico('fwd')}</button>`)}${facts([['OPENS IN', x.to], ['WHO', x.grant ? `BY GRANT · ${x.grant}` : 'EVERY STAFF MEMBER'], ['WHAT HAPPENS', 'IT OPENS THERE · NOTHING STARTS HERE']])}${x.grant ? ntb('FOUNDER VIEW · STAFF SEE THIS ONLY WITH THE GRANT.') : ''}`;
  } else {
    let main = '';
    if (x.type === 'more') {
      const docs = vals(DOCS).filter((d) => d.client === x.cid && /UPLOADED/.test(ov(`document:${d.id}`, d.status)[0]));
      status = ['UPLOADED · UNDER REVIEW', 'gold'];
      main = `<div><div class="sec-l">${docs.length} DOCUMENTS</div><div class="hm-docs">${docs.map((d) => docChip(d.id)).join('')}</div></div>`;
    } else if (x.r) {
      status = x.type === 'case' ? x.r.stage : ov(`${x.type}:${x.id}`, statusWord(x.r));
      title = x.type === 'case' ? x.r.name : RECORD_TYPES[x.type].title(x.r);
      if (x.type === 'invoice' && !FOUNDER) main = ntb('BILLING IS FOUNDER / BILLING GRANT ONLY');
      else main = facts(hmFacts(x.type, x.r));
      const vids = [...(x.r.vehicles ?? []), ...(x.r.vehicle ? [x.r.vehicle] : [])].filter((id) => VEHICLES[id]);
      const docs = (x.r.docs ?? []).filter((id) => DOCS[id]);
      if (x.type === 'document') main += docChip(x.id);
      if (vids.length || docs.length) main += `<div><div class="sec-l">LINKED</div><div class="hm-links">${vids.map((id) => `<button type="button" class="cl-link" data-a="go" data-v="fleet:${id}">${ico('truck')}${VEHICLES[id].unit}${ico('fwd')}</button>`).join('')}</div>${docs.map(docChip).join('')}</div>`;
      const listed = !['mine', 'queue'].includes(v);
      hist = listed || WSX.hist[`${x.type}:${x.id}`] ? mhist(`${x.type}:${x.id}`, listed ? [[x.age, x.what]] : [], listed ? 'ON THIS DESK' : 'HISTORY') : '';
    }
    body = `${nextBlock(['mine', 'queue'].includes(v) ? hmNeed(x) : x.what, open)}${main}${hist}`;
  }
  const who = c ? `<button type="button" class="hm-client" data-a="go" data-v="client:${c.id}">${badge(c)}<span><b>${c.name}</b><small>CLIENT 360</small></span>${ico('fwd')}</button>` : '';
  const plate = `<div class="hm-rp" data-swap="rp:${v}:${x.key}"><span class="hm-rp__i">${ico(x.icon)}</span><span class="hm-rp__t"><small>${x.quick ? 'QUICK ACTION' : x.dept}${c ? ` · ${c.name}` : ''}</small><b>${title}</b></span>${status ? `<span class="hm-rp__s">${sw(status)}</span>` : ''}</div>`;
  return `<section class="rg cx hm-cx"><header class="cx__h">${crumb}${plate}</header><div class="cx__b" data-keep="hm-cx" data-swap="b:${v}:${x.key}">${body}${who}</div></section>`;
}

/* ── bar and compositions ── */
function hmBar() {
  const v = WSX.hm.view;
  const nw = hmNewCount();
  if (VP === 'mobile') return wsBar('HOME · TRIAGE', hmTitle(), [ro(HOME_LISTS.attention.length, 'ATTENTION', { a: 'hm.view', v: 'attention', on: v === 'attention' }), ro(HOME_LISTS.deadlines.length, 'THIS WEEK', { tone: 'warn', a: 'hm.view', v: 'deadlines', on: v === 'deadlines' }), ro(HOME_LISTS.blocked.length, 'BLOCKED', { tone: 'bad', a: 'hm.view', v: 'blocked', on: v === 'blocked' })].join(''));
  const r = [ro(HOME_LISTS.attention.length, 'NEED ATTENTION', { a: 'hm.view', v: 'attention', on: v === 'attention' }), ro(HOME_LISTS.deadlines.length, 'DUE THIS WEEK', { tone: 'warn', a: 'hm.view', v: 'deadlines', on: v === 'deadlines' }), ro(HOME_LISTS.blocked.length, 'BLOCKED', { tone: 'bad', a: 'hm.view', v: 'blocked', on: v === 'blocked' }), ro(HM_MINE.length, 'ASSIGNED TO YOU', { a: 'hm.view', v: 'mine', on: v === 'mine' }), ...(VP === 'tablet' ? [] : [ro(nw, 'NEW NOTIFICATIONS', { tone: nw ? 'gold' : '', a: 'hm.view', v: 'notifications', on: v === 'notifications' })])].join('');
  return wsBar('HOME · TRIAGE', hmTitle(), r, VP === 'desktop' ? '<span class="design-pill">SAMPLE RECORDS</span>' : '');
}
function hmTabs() {
  return seg(HM_VIEWS.map(([id, l, , , short]) => [id, VP === 'mobile' ? short : l, id === 'notifications' ? hmNewCount() || null : null]), WSX.hm.view, 'hm.view', 'wseg--scroll hm-tabs');
}
function homeView() {
  const list = hmItems();
  if (VP === 'mobile') return `<div class="ws hm hm--m">${hmBar()}${hmTabs()}${hmStream()}</div>${phoneSheet(hmPreview(list), { label: hmTitle() })}`;
  if (VP === 'tablet') return `<div class="ws hm hm--t">${hmBar()}${hmTabs()}<div class="hm-t2">${hmStream()}${hmPreview(list)}</div></div>`;
  return `<div class="ws hm">${hmBar()}<div class="hm-grid">${hmDesk()}${hmStream()}${hmPreview(list)}</div></div>`;
}

/* ── actions ── */
function hmGo(v) {
  Object.assign(WSX.hm, { view: v, item: null, lane: 'all', q: '', vis: 'all' });
}
ACT['hm.view'] = (v) => {
  hmGo(v);
  WSX.pending = null;
  WSX.sheet = false;
};
ACT['hm.item'] = (k) => {
  WSX.hm.item = k;
  WSX.pending = null;
};
ACT['hm.open'] = (k) => {
  ACT['hm.item'](k);
  WSX.sheet = true;
};
ACT['hm.step'] = (d) => {
  const list = hmItems();
  const i = list.indexOf(hmSel(list));
  const n = list[Math.max(0, Math.min(list.length - 1, i + Number(d)))];
  if (n) WSX.hm.item = n.key;
  WSX.pending = null;
};
ACT['hm.lane'] = (k) => {
  WSX.hm.lane = k;
  WSX.hm.item = null;
  WSX.pending = null;
};
ACT['hm.vis'] = (k) => {
  WSX.hm.vis = k;
  WSX.hm.item = null;
};
ACT['hm.q'] = (q) => {
  WSX.hm.q = q;
};

registerWorkspace({
  id: 'home', no: 'H+', name: 'HOME · TRIAGE', group: 'office', page: 'home', hidden: true, view: () => homeView(),
  shape: 'A TRIAGE DESK', line: 'EVERY ITEM, BY PRIORITY. EACH OPENS WHERE IT IS FIXED.',
  states: [
    ['MAIN', []],
    ['SELECTED', [['hm.item', 'rec/request/req-hf-mc']]],
    ['DEEPER', [['hm.view', 'notifications'], ['sim.ask', 'hm:read']]],
    ['PHONE', [['hm.item', 'rec/policy/pol-dh']], 'phone'],
  ],
  demos: [
    ['TRIAGE THE MORNING', [['hm.item', 'rec/request/req-hf-mc', 'HORIZON · BLOCKED'], ['hm.step', '1', 'NEXT ITEM'], ['hm.item', 'rec/deadline/dl-abc-med', 'A MEDICAL CARD · 21 DAYS'], ['nav', 'rec/deadline/dl-abc-med', 'OPEN IN COMPLIANCE'], ['ret', '', 'BACK TO THE DESK']]],
    ['DEADLINES, THEN BLOCKERS', [['hm.view', 'deadlines', 'DUE THIS WEEK'], ['hm.item', 'rec/request/req-rj-ucr', 'UCR · 1 DAY LATE'], ['hm.view', 'blocked', 'BLOCKED'], ['hm.item', 'rec/shipment/sh-4471', 'WAITING ON A CARRIER']]],
    ['QUICK ACTIONS', [['hm.view', 'quick', 'THE COMMANDS'], ['hm.item', 'work/compliance/expirations', 'VIEW DEADLINES'], ['hm.item', 'work/queue', 'ASSIGN WORK · BY GRANT'], ['nav', 'work/queue', 'ALL OPEN WORK']]],
  ],
  audit: [
    [['hm.view', 'deadlines']],
    [['hm.view', 'blocked']],
    [['hm.view', 'activity']],
    [['hm.view', 'activity'], ['hm.vis', 'client'], ['hm.item', 'rec/policy/pol-rj']],
    [['hm.view', 'activity'], ['hm.item', 'intake/case/mig-mt']],
    [['hm.view', 'notifications']],
    [['hm.view', 'notifications'], ['sim.ask', 'hm:read'], ['sim.ok', 'hm:read']],
    [['hm.view', 'mine']],
    [['hm.view', 'mine'], ['hm.item', 'rec/thread/th-mt']],
    [['hm.view', 'queue']],
    [['hm.view', 'queue'], ['hm.lane', 'maintenance'], ['hm.item', 'rec/ticket/t-tk-2']],
    [['hm.view', 'quick']],
    [['hm.view', 'quick'], ['hm.item', 'work/queue']],
    [['hm.item', 'more/documents_vault@c-tk']],
    [['hm.lane', 'permitting']],
  ],
  phoneAct: { 'hm.item': 'hm.open' },
  enter: (a) => a && HM_VIEWS.some(([id]) => id === a) && hmGo(a),
  label: () => hmTitle(),
  route: (s) => {
    if (s[0] === 'home' && s[1] === 'list') return hmGo(HOME_LISTS[s[2]] ? s[2] : 'attention'), true;
    if (s[0] === 'home' && ['activity', 'quick', 'notifications'].includes(s[1])) return hmGo(s[1]), true;
    if (s[0] === 'work' && (s[1] === 'mine' || s[1] === 'queue') && !s[2]) return hmGo(s[1]), true;
    return false;
  },
});
/* MY WORK and ALL OPEN WORK are reached from WORK: the approved navigation marks WORK while they are open. */
Object.defineProperty(wsById('home'), 'page', { get: () => (['mine', 'queue'].includes(WSX.hm.view) ? 'work' : 'home'), enumerable: true });
