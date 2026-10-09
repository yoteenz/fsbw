/*
 * MORE · DESTINATIONS — the places behind the approved MORE root (../studio.js more(), unchanged), each composed for
 * its own work: a vault that keeps STAFF ONLY apart from CLIENT-VISIBLE, conversations where an internal note can never
 * be mistaken for a reply, a lead pipeline, invoices drawn as invoices, the bench, the service ecosystem, the provider
 * network, the settings console, the help desk and the signed-in account. CLIENTS is CLIENT 360 (its own workspace).
 * Sample records only (office-data.js); every change is SIMULATED and nothing is saved or sent.
 */
WSX.mo = {
  dest: 'documents_vault',
  sel: { documents_vault: 'doc-tk-3', messages: 'th-mt', growth_crm: 'ld-crm-1', billing: 'inv-3305', team_staff: 's-jordan', service_catalog: 'fuel_tax_ifta', mechanic_network: 'p-peach', system_settings: 'w1', help_support: 'h4', account: 'access' },
  area: 'workflows',
  docClient: 'all',
  docVis: 'all',
  thFilter: 'all',
  mode: 'reply',
  svcFilter: 'all',
  q: '',
};

/* ── the destinations: the approved root's groups, entries, icons and slugs, in its order ── */
const moSlug = (t) => t.toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '');
const MO_SHORT = { clients: 'CLIENTS', documents_vault: 'DOCUMENTS', messages: 'MESSAGES', growth_crm: 'CRM', billing: 'BILLING', service_catalog: 'CATALOG', team_staff: 'TEAM', mechanic_network: 'MECHANICS', system_settings: 'SETTINGS', help_support: 'HELP', account: 'ACCOUNT' };
const MO_DESTS = GROUPS.flatMap(([g, entries]) => entries.map(([t, icon]) => ({ slug: moSlug(t), name: t, icon, group: g, short: MO_SHORT[moSlug(t)] ?? t })));
const MO_BY = Object.fromEntries(MO_DESTS.map((d) => [d.slug, d]));
/** GROWTH / CRM and BILLING are by grant: the founder has them; staff without the grant see an honest no-access state. */
const MO_GATED = ['growth_crm', 'billing'];
const moLocked = (slug) => MO_GATED.includes(slug) && !FOUNDER;
const moShown = () => MO_DESTS.filter((d) => !moLocked(d.slug) || d.slug === WSX.mo.dest);
const moSel = (slug = WSX.mo.dest) => WSX.mo.sel[slug];
const moPickA = () => (VP === 'mobile' ? 'mo.open' : 'mo.pick');
const moWide = () => WSX.device === 'wide';
const moStaffByName = (n) => vals(STAFF).find((s) => s.name === n)?.id;
const moContact = (cid) => ACCOUNTS[cid]?.contact.split(' · ')[0] ?? '—';
const moToneOpen = (s) => s && ['bad', 'warn', 'gold'].includes(s[1]);

/* ── SAMPLE · two more conversations, consistent with the records they touch (HF's EIN letter, ABC's medical card) ── */
const MO_THREADS = {
  ...THREADS,
  'th-abc': { id: 'th-abc', client: 'c-abc', subject: 'TERRENCE HOLT · NEW MEDICAL CARD', status: ['WAITING ON STAFF', 'warn'], msgs: [['staff', 'MARIA SANTOS', 'TERRENCE’S MEDICAL CARD EXPIRES OCT 29. PLEASE SEND THE NEW ONE WHEN YOU HAVE IT.', 'OCT 1'], ['client', 'ANGELA BROOKS', 'HIS EXAM IS BOOKED FOR OCT 20. WILL THAT BE IN TIME?', '2 HRS AGO']] },
  'th-hf': { id: 'th-hf', client: 'c-hf', subject: 'EIN LETTER FOR THE REINSTATEMENT', status: ['WAITING ON CLIENT', 'gold'], msgs: [['staff', 'ALEX R.', 'WE NEED YOUR EIN CONFIRMATION LETTER (CP 575) TO FILE THE REINSTATEMENT.', 'OCT 6'], ['client', 'LUIS ORTEGA', 'LOOKING FOR IT — OUR ACCOUNTANT MAY HAVE THE ORIGINAL.', 'OCT 7'], ['internal', 'ALEX R.', 'INTERNAL NOTE: FILING IS DUE OCT 10. CALL LUIS TOMORROW IF NOTHING ARRIVES.', 'OCT 7']] },
};
const MO_THREAD_META = {
  'th-mt': { links: ['request:req-mt-boc3'], next: 'ANSWER OWEN · PROMISE NO DATE', draft: 'THANKS, OWEN. THE BOC-3 IS WITH OUR PARTNER. MORE SOON.' },
  'th-abc': { links: ['deadline:dl-abc-med', 'document:doc-abc-med'], next: 'CONFIRM OCT 20 IS IN TIME', draft: 'OCT 20 IS IN TIME. PLEASE UPLOAD THE NEW CARD.' },
  'th-dh': { links: ['policy:pol-dh'], next: 'THE RENEWAL SUMMARY GOES OUT TODAY', draft: 'NOTED: SAME CARGO LIMIT. THE SUMMARY FOLLOWS TODAY.' },
  'th-tk': { links: ['cycle:cy-tk-sep'], next: 'WAITING ON TINA KWAN', draft: 'A REMINDER ON THE THREE FUEL CARD CHARGES.' },
  'th-hf': { links: ['request:req-hf-mc', 'document:doc-hf-ein'], next: 'CALL LUIS IF NOTHING ARRIVES', draft: 'ANY LUCK WITH THE CP 575? IT IS DUE OCT 10.' },
};

/* ── SAMPLE · what each lead asks for (service names from the activation matrix) and its short history ── */
const MO_LEAD_META = {
  'ld-crm-1': { b: 'BM', needs: ['AUTHORITY SERVICES', 'FUEL TAX (IFTA)'], hist: [['TODAY', 'WEBSITE FORM RECEIVED']] },
  'ld-crm-2': { b: 'NH', needs: ['BOOKKEEPING'], hist: [['OCT 5', 'INTRO CALL · PACKAGES SENT'], ['OCT 3', 'REFERRED BY A CLIENT']] },
  'ld-crm-3': { b: 'CS', needs: ['DISPATCHING', 'FACTORING (PARTNER)'], hist: [['OCT 7', 'QUOTE SENT'], ['OCT 2', 'PHONE INQUIRY']] },
  'ld-crm-4': { b: 'PW', needs: ['INSURANCE (REFERRAL)'], hist: [['OCT 6', 'FOLLOW-UP MISSED'], ['SEP 29', 'WEBSITE FORM RECEIVED']] },
};
const MO_PIPE = [['NEW', 'FIRST CONTACT'], ['CONTACTED', 'TALKING'], ['QUOTED', 'DECIDING']];
const MO_WEEK = [['TUE', 'OCT 6'], ['WED', 'OCT 7'], ['THU', 'OCT 8'], ['FRI', 'OCT 9'], ['SAT', 'OCT 10'], ['SUN', 'OCT 11'], ['MON', 'OCT 12']];

/* ── the service ecosystem: the live activation matrix (SERVICES), placed by state ── */
const MO_STATES = [
  ['active', 'ACTIVE', 'ok', 'CLIENTS CAN START IT IN THEIR OFFICE', 'CLIENT'],
  ['internal', 'INTERNAL ONLY', 'gold', 'A STAFF WORKFLOW · CLIENTS DO NOT START IT', 'STAFF'],
  ['partner', 'PARTNER PENDING', 'mute', 'PARTNER OR MANUAL UNTIL A PROVIDER IS READY', 'PARTNER'],
  ['paused', 'PAUSED', 'bad', 'NOT OFFERED · BUSINESS ACTIVATION REQUIRED', 'NOBODY'],
];
const MO_SVC_META = {
  PERMITTING: ['id-card', 'permitting', 'PERMITS'], 'TAG SERVICES': ['tag', 'permitting', 'TAGS'], 'FUEL TAX (IFTA)': ['fuel', 'filing', 'FUEL TAX'], 'ROAD / USE TAX': ['truck', 'filing', 'ROAD TAX'],
  'AUTHORITY SERVICES': ['shield-check', 'permitting', 'AUTHORITY'], 'BOC-3': ['text', 'permitting', 'BOC-3'], 'BUSINESS FORMATION': ['company', 'permitting', 'FORMATION'], DISPATCHING: ['pin', 'dispatch', 'DISPATCH'],
  BROKERAGE: ['link', 'brokerage', 'BROKERAGE'], 'FACTORING (PARTNER)': ['cash', 'factoring', 'FACTORING'], 'INSURANCE (REFERRAL)': ['umbrella', 'insurance', 'INSURANCE'], BOOKKEEPING: ['calculator', 'bookkeeping', 'BOOKKEEPING'],
};
const MO_SVC = SERVICES.map(([name, state, tone, note]) => {
  const st = MO_STATES.find((s) => s[1] === state);
  const [icon, lane, short] = MO_SVC_META[name];
  return { id: moSlug(name), name, state, tone, note, key: st[0], icon, lane, short };
});
/** Where each service sits in the drawing (a 1000 × 600 field, AIO at the centre): its ring and its angle. */
const MO_ORBIT = { active: [210, 122], internal: [318, 190], partner: [430, 252] };
const MO_ANGLE = { permitting: 300, tag_services: 240, authority_services: 0, business_formation: 180, dispatching: 60, bookkeeping: 120, fuel_tax_ifta: 270, road_use_tax: 90, boc: 215, factoring_partner: 325, insurance_referral: 145, brokerage: 35 };

/* ── SAMPLE · the settings console (DESIGN ONLY: every change is simulated) ── */
const MO_AREAS = [
  { id: 'workflows', name: 'WORKFLOWS', icon: 'setup', staff: 'VIEW ONLY', items: [
    { id: 'w1', t: 'STAFF REVIEW BEFORE A CLIENT SEES A DOCUMENT', k: 'toggle', v: 'ON', who: 'EVERY CLIENT-VISIBLE UPLOAD' },
    { id: 'w2', t: 'CLIENT CONFIRMS BEFORE A MIGRATED CLIENT IS ACTIVE', k: 'lock', v: 'ALWAYS', who: 'INTAKE · REQUIRED BY THE MIGRATION MODEL' },
    { id: 'w3', t: 'DEADLINE REMINDERS TO CLIENTS', k: 'choice', v: '30 DAYS', o: ['14 DAYS', '30 DAYS', '60 DAYS'], who: 'COMPLIANCE AND RENEWALS' },
    { id: 'w4', t: 'NEW SERVICE REQUESTS GO TO', k: 'choice', v: 'LANE OWNER', o: ['LANE OWNER', 'FOUNDER'], who: 'WORK · EVERY LANE' },
  ] },
  { id: 'notifications', name: 'NOTIFICATIONS', icon: 'notification', staff: 'YOUR OWN', items: [
    { id: 'n1', t: 'CLIENT MESSAGES', k: 'choice', v: 'IN APP + EMAIL', o: ['IN APP', 'IN APP + EMAIL'], who: 'MESSAGES' },
    { id: 'n2', t: 'DOCUMENT UPLOADS', k: 'choice', v: 'IN APP', o: ['IN APP', 'DAILY DIGEST'], who: 'DOCUMENTS & VAULT' },
    { id: 'n3', t: 'DEADLINES DUE THIS WEEK', k: 'choice', v: 'DAILY DIGEST', o: ['DAILY DIGEST', 'OFF'], who: 'HOME AND COMPLIANCE' },
    { id: 'n4', t: 'MENTIONS IN INTERNAL NOTES', k: 'toggle', v: 'ON', who: 'MESSAGES · STAFF ONLY' },
  ] },
  { id: 'integrations', name: 'INTEGRATIONS', icon: 'connectivity', items: [
    { id: 'i1', t: 'IFTA FILING', k: 'state', v: 'MANUAL · NO GOVERNMENT API', who: 'FILING & FUEL TAXES' },
    { id: 'i2', t: 'LOAD BOARD', k: 'state', v: 'NOT CONNECTED · MANUAL LOADS', who: 'DISPATCH' },
    { id: 'i3', t: 'TELEMATICS EXPORTS', k: 'state', v: 'READ AT INTAKE ONLY', who: 'INTAKE · SAMSARA, MOTIVE, GEOTAB' },
    { id: 'i4', t: 'FMCSA SAFETY DATA', k: 'state', v: 'NOT CONNECTED', who: 'COMPLIANCE · DOT / SAFETY' },
    { id: 'i5', t: 'FACTORING PARTNER', k: 'state', v: 'PARTNER PENDING', who: 'FACTORING' },
    { id: 'i6', t: 'INSURANCE PARTNER', k: 'state', v: 'PARTNER PENDING', who: 'INSURANCE' },
  ] },
  { id: 'security', name: 'SECURITY', icon: 'security', items: [
    { id: 's1', t: 'TWO-STEP SIGN-IN FOR STAFF', k: 'toggle', v: 'ON', who: 'EVERY STAFF ACCOUNT' },
    { id: 's2', t: 'SIGN OUT AFTER INACTIVITY', k: 'choice', v: '30 MIN', o: ['15 MIN', '30 MIN', '60 MIN'], who: 'EVERY STAFF ACCOUNT' },
    { id: 's3', t: 'NEW GRANTS NEED FOUNDER APPROVAL', k: 'lock', v: 'ALWAYS', who: 'TEAM & STAFF' },
    { id: 's4', t: 'SIGN OUT EVERY STAFF SESSION', k: 'action', v: 'NOW', who: 'EVERY STAFF ACCOUNT' },
  ] },
  { id: 'data', name: 'DATA', icon: 'database', items: [
    { id: 'd1', t: 'EXPORT CLIENT RECORDS', k: 'action', v: 'CSV', who: 'EVERY CLIENT · FOUNDER' },
    { id: 'd2', t: 'ARCHIVE CLOSED CLIENTS AFTER', k: 'choice', v: '24 MONTHS', o: ['12 MONTHS', '24 MONTHS', 'NEVER'], who: 'CLIENTS NO LONGER SERVED' },
    { id: 'd3', t: 'AUDIT LOG OF STAFF ACTIONS', k: 'lock', v: 'ALWAYS ON', who: 'EVERY STAFF ACTION' },
  ] },
];

/* ── SAMPLE · help topics: short steps, each tied to the place it is about ── */
const MO_HELP = [
  ['START HERE', 'help', [
    ['h1', 'FIND A CLIENT, RECORD OR DOCUMENT', ['SEARCH FROM THE HEADER', 'CLIENT 360 HOLDS THE WHOLE PICTURE', 'EVERY RECORD LINKS TO ITS CLIENT'], 'client:c-abc'],
    ['h2', 'SAMPLE AND SIMULATED', ['SAMPLE RECORDS ARE ILLUSTRATIONS', 'SIMULATED ACTIONS ASK YOU TO CONFIRM', 'NOTHING IS SAVED OR SENT'], null],
    ['h3', 'YOUR ROLE AND GRANTS', ['THE FOUNDER GRANTS AREAS', 'BILLING AND CRM ARE BY GRANT', 'ASK THE FOUNDER FOR ACCESS'], 'account'],
  ]],
  ['PRIVACY', 'lock', [
    ['h4', 'STAFF ONLY OR CLIENT-VISIBLE', ['EVERY DOCUMENT CARRIES ONE LABEL', 'CLIENT-VISIBLE SHOWS IN THEIR OFFICE', 'STAFF ONLY NEVER LEAVES AIO'], 'documents_vault'],
    ['h5', 'INTERNAL NOTES IN MESSAGES', ['A NOTE IS DASHED AND LOCKED', 'THE CLIENT NEVER SEES A NOTE', 'SWITCH TO REPLY TO ANSWER'], 'messages'],
    ['h6', 'SHARING A STAFF-ONLY FILE', ['ONLY THE FOUNDER SHARES IT', 'THE CHANGE IS RECORDED', 'THE CLIENT SEES IT AT ONCE'], 'documents_vault'],
  ]],
  ['THE WORK', 'work', [
    ['h7', 'WHAT NEEDS ME TODAY', ['HOME LISTS WHAT NEEDS ATTENTION', 'WORK OPENS EACH LANE', 'THE GOLD BUTTON IS THE NEXT STEP'], null],
    ['h8', 'CLEARING A BLOCKER', ['OPEN THE BLOCKED RECORD', 'SEE WHO IT WAITS ON', 'ASK, REMIND OR REASSIGN'], null],
    ['h9', 'WHO OWNS WHAT', ['EVERY RECORD HAS ONE OWNER', 'TEAM & STAFF COUNTS THE LOAD', 'THE FOUNDER REASSIGNS'], 'team_staff'],
  ]],
  ['CLIENTS & INTAKE', 'company', [
    ['h10', 'BRINGING A CLIENT IN', ['INTAKE READS THEIR FILES', 'STAFF PREPARE UP TO PREBUILT', 'ONLY THE CLIENT MAKES IT ACTIVE'], null],
    ['h11', 'A SERVICE THAT IS NOT LIVE', ['THE CATALOG SAYS EACH STATE', 'PARTNER PENDING IS MANUAL', 'PAUSED IS NOT OFFERED'], 'service_catalog'],
    ['h12', 'A NEW LEAD', ['GROWTH / CRM HOLDS LEADS', 'FOLLOW UP ON THE DATE', 'A WON LEAD GOES TO INTAKE'], 'growth_crm'],
  ]],
];
const MO_TOPICS = MO_HELP.flatMap(([g, icon, list]) => list.map(([id, t, steps, go]) => ({ id, t, steps, go, g, icon })));

/* ── record links: a record opens where it is worked (its lane's workspace, else its client's service in Client 360) ── */
function moLinkAttrs(key) {
  const [type, id] = key.split(':');
  const r = rec(type, id) ?? (type === 'thread' ? MO_THREADS[id] : null);
  if (!r) return '';
  if (type === 'document') return `data-a="mo.jump" data-v="documents_vault|${id}"`;
  if (type === 'thread') return `data-a="mo.jump" data-v="messages|${id}"`;
  if (type === 'invoice') return `data-a="mo.jump" data-v="billing|${id}"`;
  if (type === 'vehicle') return `data-a="go" data-v="fleet:${id}"`;
  if (type === 'deadline') return `data-a="go" data-v="comp:${id}"`;
  if (type === 'cycle' || type === 'subscription') return `data-a="go" data-v="books:${r.client}"`;
  const lane = RECORD_TYPES[type]?.lane;
  const w = lane && wsByLane(lane);
  if (w && !w.root) return `data-go="rec/${type}/${id}"`;
  return `data-a="go" data-v="client:${r.client}${lane ? `:${lane}` : ''}"`;
}
function moShort(key) {
  const [type, id] = key.split(':');
  const r = rec(type, id) ?? MO_THREADS[id];
  if (!r) return '—';
  if (type === 'vehicle') return r.unit;
  if (type === 'driver') return r.name;
  if (type === 'ticket' || type === 'load') return r.ref;
  if (type === 'quarter') return `IFTA ${r.q}`;
  if (type === 'policy') return 'INSURANCE POLICY';
  if (type === 'cycle') return `${r.period.split(' ')[0]} CLOSE`;
  if (type === 'deadline') return r.what.split(' · ')[0];
  if (type === 'document') return r.title.split(' · ')[0].replace(/ \(.*\)$/, '');
  return RECORD_TYPES[type]?.title(r).split(' · ')[0] ?? '—';
}
const moLink = (key) => {
  const [type, id] = key.split(':');
  const r = rec(type, id) ?? MO_THREADS[id];
  return `<button type="button" class="mo-link" ${moLinkAttrs(key)} title="${r ? RECORD_TYPES[type]?.title(r) ?? '' : ''}">${ico(OWNER_ICON[type] || 'folder')}<span>${moShort(key)}</span>${ico('fwd')}</button>`;
};

/* ── shared pieces ── */
/** A record plate: the identity of what is open, dark, as every approved workspace carries it into its panel. */
function moPlate(icon, small, title, status, key, lead = '') {
  return `<div class="mo-rp" data-swap="rp:${key}">${lead || `<span class="mo-rp__i">${ico(icon)}</span>`}<span class="mo-rp__t"><small>${small}</small><b>${title}</b>${status ? `<span>${sw(status)}</span>` : ''}</span></div>`;
}
function moCx(head, body, key, crumb = []) {
  return `<section class="rg cx mo-cx"><header class="cx__h">${crumb.length ? `<div class="cx__crumb">${crumb.map((c) => `<span>${c}</span>`).join(ico('fwd'))}</div>` : ''}${head}</header><div class="cx__b" data-keep="mo-cx" data-swap="b:${key}">${body}</div></section>`;
}
const moCrumb = (...xs) => [MO_BY[WSX.mo.dest].name, ...xs];
const moSib = (label, rows) => (rows.length > 1 ? `<div class="mo-sib"><div class="sec-l"><span>${label}</span><span>${rows.length}</span></div>${rows.join('')}</div>` : '');
const moSibRow = (id, icon, t, s) => `<button type="button" class="mo-sib__r ${moSel() === id ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${id}" title="${t}" aria-current="${moSel() === id}">${ico(icon)}<b>${t}</b>${s ? sw(s) : ''}</button>`;
/** History: the record's own past plus anything simulated this visit; nothing at all when there is neither. */
const moHist = (key, base, title) => (base.length || (WSX.hist[key] || []).length ? mhist(key, base, title) : '');
const moFeat = (n, l, tone = '') => `<span class="mo-feat ${tone ? `mo-feat--${tone}` : ''}"><b>${n}</b><small>${l}</small></span>`;

/* ═══════════════ DOCUMENTS & VAULT · a vault with two compartments ═══════════════ */
const moDocVis = (d) => ov(`vis:${d.id}`, d.vis);
const moDocSt = (d) => ov(`document:${d.id}`, d.status);
const MO_DOC_F = {
  all: () => true,
  client: (d) => moDocVis(d) === 'client',
  internal: (d) => moDocVis(d) === 'internal',
  review: (d) => /UNDER REVIEW/.test(moDocSt(d)[0]),
  requested: (d) => /REQUESTED|NOT RECEIVED/.test(moDocSt(d)[0]),
};
const moDocsOf = (c = WSX.mo.docClient) => vals(DOCS).filter((d) => c === 'all' || d.client === c);
const moDocs = () => moDocsOf().filter(MO_DOC_F[WSX.mo.docVis]).sort((a, b) => TONE_RANK[moDocSt(a)[1]] - TONE_RANK[moDocSt(b)[1]]);
const moStamp = (s) => (/UNDER REVIEW/.test(s[0]) ? 'IN REVIEW' : /NOT RECEIVED/.test(s[0]) ? 'NOT RECEIVED' : s[0]);
const moSheet = (miss) => `<span class="mo-sheet ${miss ? 'mo-sheet--miss' : ''}" aria-hidden="true"><i></i><i></i><i></i></span>`;
function moDocRow(d) {
  const s = moDocSt(d);
  const miss = /REQUESTED|NOT RECEIVED/.test(s[0]);
  return `<div class="pk mo-doc ${moSel() === d.id ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${d.id}" title="${d.title} · ${clientName(d.client)}">${moSheet(miss)}<span class="mo-doc__t"><b class="pk__t">${d.title}</b><span class="mo-doc__s">${sw([moStamp(s), s[1]])}<span class="pk__s">${moWide() ? ACCOUNTS[d.client].name : ACCOUNTS[d.client].b} · ${d.added}</span></span>${moWide() ? `<span class="mo-doc__o">${ico(OWNER_ICON[d.owner.split(':')[0]] || 'folder')}${OWNER_LABEL[d.owner.split(':')[0]]} · ${moShort(d.owner)}</span>` : ''}</span></div>`;
}
function moDocBar() {
  const all = moDocsOf();
  const n = (f) => all.filter(MO_DOC_F[f]).length;
  const f = WSX.mo.docVis;
  const r = (k, l, tone) => ro(n(k), l, { tone, a: 'mo.doc.vis', v: k, on: f === k });
  if (VP === 'mobile') return [r('client', 'CLIENT-VISIBLE'), r('internal', 'STAFF ONLY'), r('review', 'TO REVIEW', 'gold')].join('');
  return [r('all', 'DOCUMENTS'), r('client', 'CLIENT-VISIBLE'), r('internal', 'STAFF ONLY'), r('review', 'TO REVIEW', 'gold'), r('requested', 'REQUESTED', 'bad')].join('');
}
function moDocRail(strip = false) {
  const ids = ['all', ...Object.keys(ACCOUNTS)];
  const rev = (c) => moDocsOf(c).filter(MO_DOC_F.review).length;
  if (strip) {
    return `<div class="mo-chips wseg--scroll">${ids.map((id) => `<button type="button" class="mo-chip ${WSX.mo.docClient === id ? 'is-sel' : ''}" data-a="mo.doc.client" data-v="${id}" title="${id === 'all' ? 'ALL CLIENTS' : clientName(id)}">${id === 'all' ? `<span class="mo-chip__i">${ico('folder')}</span>` : badge(ACCOUNTS[id])}<span>${id === 'all' ? 'ALL' : ACCOUNTS[id].name}</span><i>${moDocsOf(id).length}</i></button>`).join('')}</div>`;
  }
  const rows = ids.map((id) => {
    const n = moDocsOf(id).length;
    const r = rev(id);
    const lead = id === 'all' ? `<span class="badge mo-allb">${ico('folder')}</span>` : badge(ACCOUNTS[id]);
    return `<div class="pk mo-cl ${WSX.mo.docClient === id ? 'is-sel' : ''}" data-a="mo.doc.client" data-v="${id}" title="${id === 'all' ? 'ALL CLIENTS' : clientName(id)}">${lead}<span class="mo-cl__t"><b class="pk__t">${id === 'all' ? 'ALL CLIENTS' : ACCOUNTS[id].name}</b><span class="pk__s">${n ? `${n} DOCUMENT${n === 1 ? '' : 'S'}` : 'NO DOCUMENTS YET'}</span></span>${r ? `<em class="mo-cnt" title="${r} TO REVIEW">${r}</em>` : ''}</div>`;
  }).join('');
  return rgn('BY CLIENT', `${Object.keys(ACCOUNTS).length}`, '', rows, 'mo-rail', 'mo-rail');
}
function moVault() {
  const list = moDocs();
  const c = WSX.mo.docClient;
  const pub = list.filter((d) => moDocVis(d) === 'client');
  const prv = list.filter((d) => moDocVis(d) === 'internal');
  const allPub = moDocsOf().filter((d) => moDocVis(d) === 'client').length;
  const allPrv = moDocsOf().length - allPub;
  const none = (t) => `<div class="mo-none">${t}</div>`;
  const filt = WSX.mo.docVis === 'all' ? '' : ` · ${{ client: 'CLIENT-VISIBLE', internal: 'STAFF ONLY', review: 'TO REVIEW', requested: 'REQUESTED' }[WSX.mo.docVis]}`;
  const head = `<header class="mo-vault__h"><span class="mo-vault__t"><small>THE VAULT · ${c === 'all' ? 'EVERY CLIENT' : ACCOUNTS[c].name}${filt}</small><b>${list.length} DOCUMENT${list.length === 1 ? '' : 'S'}</b></span><span class="mo-split" title="${allPub} CLIENT-VISIBLE · ${allPrv} STAFF ONLY"><i class="mo-split__c" style="flex:${allPub || 0.0001}"></i><i class="mo-split__s" style="flex:${allPrv || 0.0001}"></i></span><span class="mo-split__l"><b>${allPub}</b> CLIENT-VISIBLE<b>${allPrv}</b> STAFF ONLY</span></header>`;
  const comp = (kind, rows) => `<section class="mo-comp mo-comp--${kind}"><header class="mo-comp__h"><span class="mo-comp__i">${ico(kind === 'client' ? 'view' : 'lock')}</span><span class="mo-comp__t"><b>${kind === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY'}</b><small>${kind === 'client' ? 'SHOWN IN THE CLIENT’S OFFICE' : 'NEVER SHOWN TO THE CLIENT'}</small></span><em>${rows.length}</em></header><div class="mo-comp__b" data-keep="mo-v-${kind}">${rows.map(moDocRow).join('') || none(kind === 'client' ? 'NOTHING CLIENT-VISIBLE HERE' : 'NOTHING STAFF-ONLY HERE')}</div></section>`;
  return `<section class="mo-vault" data-swap="vault:${c}:${WSX.mo.docVis}">${head}<div class="mo-vault__cols">${comp('client', pub)}<i class="mo-wall" aria-hidden="true"><span>${ico('lock')}</span></i>${comp('staff', prv)}</div></section>`;
}
function moDocPanel() {
  const d = DOCS[moSel()] && moDocs().some((x) => x.id === moSel()) ? DOCS[moSel()] : moDocs()[0];
  if (!d) return moCx(`<h2 class="cx__t">NOTHING IN THIS VIEW</h2>`, ntb('NO DOCUMENT MATCHES THIS FILTER'), 'doc:none', moCrumb());
  const s = moDocSt(d);
  const vis = moDocVis(d);
  const c = ACCOUNTS[d.client];
  const key = `document:${d.id}`;
  const miss = /REQUESTED|NOT RECEIVED/.test(s[0]);
  const visBtn = vis === 'client'
    ? simBtn(`mo:vis:${d.id}`, { label: 'MAKE STAFF ONLY', effect: `HIDES THIS DOCUMENT FROM ${c.name}’S OFFICE.`, apply: () => (WSX.over[`vis:${d.id}`] = 'internal'), rec: key, sm: true })
    : simBtn(`mo:vis:${d.id}`, { label: 'SHARE WITH CLIENT', effect: `${c.name} WILL SEE THIS IN THEIR OFFICE.`, apply: () => (WSX.over[`vis:${d.id}`] = 'client'), rec: key, sm: true, founder: true });
  const visp = `<div class="mo-visp mo-visp--${vis === 'client' ? 'client' : 'staff'}" data-swap="vis:${d.id}:${vis}"><span class="mo-visp__i">${ico(vis === 'client' ? 'view' : 'lock')}</span><span class="mo-visp__t"><b>${vis === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY'}</b><small>${vis === 'client' ? `${c.name} SEES IT IN THEIR OFFICE` : `NEVER SHOWN TO ${c.name}`}</small></span>${visBtn || (vis === 'client' ? '' : `<span class="founder">FOUNDER SHARES</span>`)}</div>`;
  const due = vals(DUES).find((x) => x.links.includes(d.owner));
  let next;
  if (/UNDER REVIEW/.test(s[0])) next = nextBlock('REVIEW THE UPLOAD', `${simBtn(`mo:ok:${d.id}`, { label: 'ACCEPT', effect: 'FILES THE DOCUMENT ON ITS RECORD AS ON FILE.', apply: () => (WSX.over[key] = ['ON FILE', 'ok']), rec: key, primary: true })}${simBtn(`mo:again:${d.id}`, { label: 'ASK FOR A NEW COPY', effect: `ASKS ${c.name} TO UPLOAD IT AGAIN.`, apply: () => (WSX.over[key] = ['REQUESTED AGAIN', 'warn']), rec: key })}`);
  else if (miss || s[0] === 'REQUESTED AGAIN') next = nextBlock(`${moContact(d.client)} HAS NOT SENT IT`, simBtn(`mo:rem:${d.id}`, { label: 'REMIND THE CLIENT', effect: 'SENDS A REMINDER TO THE CLIENT’S OFFICE AND EMAIL.', apply: () => {}, rec: key, primary: true }));
  else if (s[1] === 'warn') next = nextBlock('REQUEST THE RENEWED DOCUMENT', `${simBtn(`mo:new:${d.id}`, { label: 'REQUEST NEW DOCUMENT', effect: 'ASKS THE CLIENT TO UPLOAD THE RENEWED DOCUMENT.', apply: () => {}, rec: key, primary: true })}${due ? `<button type="button" class="wbtn" data-a="go" data-v="comp:${due.id}">${ico('shield-check')}COMPLIANCE</button>` : ''}`);
  else if (s[0] === 'DRAFT') next = nextBlock('THE DRAFT IS FINISHED ON ITS RECORD', '', 'calm');
  else next = nextBlock('ON FILE · NOTHING TO DO', '', 'calm');
  const page = `<div class="mo-dview"><span class="mo-page mo-page--${s[1]} ${miss ? 'mo-page--miss' : ''}"><i></i><i></i><i></i><i></i><em>${moStamp(s)}</em></span>${facts([['CLIENT', `<a data-a="go" data-v="client:${c.id}">${c.name}</a>`], ['BELONGS TO', moLink(d.owner)], ['FILE', d.type === '—' ? 'NOT RECEIVED YET' : d.type], ['ADDED', d.added]])}</div>`;
  const sib = moSib(`ALSO FOR ${c.name}`, moDocsOf(d.client).map((x) => moSibRow(x.id, moDocVis(x) === 'client' ? 'view' : 'lock', x.title, [moStamp(moDocSt(x)), moDocSt(x)[1]])));
  const head = moPlate('folder', `${moDocVis(d) === 'client' ? 'CLIENT-VISIBLE' : 'STAFF ONLY'} · ${c.name}`, d.title, s, `doc:${d.id}`);
  return moCx(head, `${visp}${next}${page}${mhist(key, [[d.added, miss ? 'REQUESTED FROM THE CLIENT' : 'ADDED TO THE VAULT']])}${sib}`, `doc:${d.id}`, moCrumb(c.b, 'DOCUMENT'));
}
function moDocBody() {
  if (VP === 'mobile') return `${moDocRail(true)}${moVault()}`;
  if (VP === 'tablet') return `<div class="mo-t2">${`<div class="mo-tcol">${moDocRail(true)}${moVault()}</div>`}${moDocPanel()}</div>`;
  return `<div class="mo-g mo-g--doc">${moDocRail()}${moVault()}${moDocPanel()}</div>`;
}

/* ═══════════════ MESSAGES · the conversation, with internal notes drawn apart ═══════════════ */
const moThSt = (t) => ov(`thread:${t.id}`, t.status);
const moMsgs = (t) => [...t.msgs, ...(WSX.over[`mo:sent:${t.id}`] || [])];
const MO_TH_F = { all: () => true, staff: (t) => moThSt(t)[0] === 'WAITING ON STAFF', client: (t) => moThSt(t)[0] === 'WAITING ON CLIENT' };
const moThreads = () => vals(MO_THREADS).filter(MO_TH_F[WSX.mo.thFilter]).sort((a, b) => TONE_RANK[moThSt(a)[1]] - TONE_RANK[moThSt(b)[1]]);
const moThread = () => MO_THREADS[moSel()] ?? moThreads()[0] ?? vals(MO_THREADS)[0];
function moThBar() {
  const all = vals(MO_THREADS);
  const f = WSX.mo.thFilter;
  const notes = all.reduce((n, t) => n + moMsgs(t).filter((m) => m[0] === 'internal').length, 0);
  const r = [ro(all.length, 'CONVERSATIONS', { a: 'mo.th.filter', v: 'all', on: f === 'all' }), ro(all.filter(MO_TH_F.staff).length, 'WAITING ON STAFF', { tone: 'warn', a: 'mo.th.filter', v: 'staff', on: f === 'staff' }), ro(all.filter(MO_TH_F.client).length, 'WAITING ON CLIENT', { a: 'mo.th.filter', v: 'client', on: f === 'client' })];
  if (VP !== 'mobile') r.push(ro(notes, 'INTERNAL NOTES'));
  return r.join('');
}
function moThRow(t) {
  const st = moThSt(t);
  const last = moMsgs(t).at(-1);
  const c = ACCOUNTS[t.client];
  return `<div class="pk mo-th ${moThread().id === t.id ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${t.id}" title="${t.subject} · ${c.name}">${badge(c)}<span class="mo-th__t"><b class="pk__t">${t.subject}</b><span class="pk__s">${c.name} · ${last[3]}</span>${sw(st)}</span>${st[0] === 'WAITING ON STAFF' ? '<i class="mo-unread" title="WAITING ON STAFF"></i>' : ''}</div>`;
}
function moThList() {
  const list = moThreads();
  return rgn('CONVERSATIONS', `${list.length}`, '', `<div class="mo-tools">${seg([['all', 'ALL'], ['staff', 'ON US'], ['client', 'ON CLIENT']], WSX.mo.thFilter, 'mo.th.filter')}</div>${list.map(moThRow).join('') || '<div class="grp">NOTHING IN THIS VIEW</div>'}`, 'mo-rail mo-thl', 'mo-thl');
}
function moMsg([kind, who, text, when, sim], c) {
  const tag = sim ? '<span class="simtag">SIMULATED</span>' : '';
  if (kind === 'client') return `<div class="mo-m mo-m--client"><span class="mo-m__who">${badge(c)}<b>${who}</b><small>CLIENT · ${when}</small></span><p>${text}</p></div>`;
  if (kind === 'internal') return `<div class="mo-m mo-m--note" ${sim ? 'data-swap="sent"' : ''}><span class="mo-m__who"><span class="mo-m__lock">${ico('lock')}</span><b>INTERNAL NOTE · STAFF ONLY</b><small>${who} · ${when}</small>${tag}</span><p>${text.replace(/^INTERNAL NOTE:\s*/, '')}</p></div>`;
  return `<div class="mo-m mo-m--staff" ${sim ? 'data-swap="sent"' : ''}><span class="mo-m__who">${tag}<small>${when} · SENT TO CLIENT</small><b>${who}</b>${av(moStaffByName(who))}</span><p>${text}</p></div>`;
}
function moComposer(t) {
  const mode = WSX.mo.mode;
  const k = `mo:draft:${t.id}:${mode}`;
  const draft = ov(k, mode === 'reply' ? MO_THREAD_META[t.id].draft : '');
  const contact = moContact(t.client);
  const send = simBtn(`mo:send:${t.id}:${mode}`, {
    label: mode === 'reply' ? 'SEND REPLY' : 'ADD NOTE',
    effect: mode === 'reply' ? `SENDS THIS REPLY TO ${contact} IN THEIR OFFICE AND BY EMAIL.` : 'ADDS A STAFF-ONLY NOTE. THE CLIENT NEVER SEES IT.',
    apply: () => {
      const text = String(ov(k, mode === 'reply' ? MO_THREAD_META[t.id].draft : '')).trim() || (mode === 'reply' ? 'THANK YOU. WE ARE ON IT.' : 'CHECKED. FOLLOWING UP.');
      WSX.over[`mo:sent:${t.id}`] = [...(WSX.over[`mo:sent:${t.id}`] || []), [mode === 'reply' ? 'staff' : 'internal', 'ALEX R.', text, 'JUST NOW', true]];
      if (mode === 'reply') WSX.over[`thread:${t.id}`] = ['WAITING ON CLIENT', 'gold'];
      WSX.over[k] = '';
    },
    rec: `thread:${t.id}`,
    primary: mode === 'reply',
  });
  return `<div class="mo-compo mo-compo--${mode}"><div class="mo-compo__top">${seg([['reply', 'REPLY TO CLIENT'], ['note', 'INTERNAL NOTE']], mode, 'mo.mode')}<span class="mo-compo__who">${ico(mode === 'reply' ? 'view' : 'lock')}${mode === 'reply' ? `VISIBLE TO ${contact}` : 'ONLY STAFF SEE THIS'}</span></div><div class="mo-compo__row"><label class="wfld mo-compo__f">${ico(mode === 'reply' ? 'letter' : 'edit')}<input id="mo-draft" data-input="mo.draft" value="${draft}" placeholder="${mode === 'reply' ? 'WRITE A REPLY' : 'WRITE A NOTE FOR STAFF'}" aria-label="${mode === 'reply' ? 'Reply to the client' : 'Internal note'}"></label>${send}</div></div>`;
}
function moConvo(t, inSheet = false) {
  const c = ACCOUNTS[t.client];
  const st = moThSt(t);
  const head = `<header class="mo-cvh"><div class="mo-cvh__t"><small>${c.name} · ${c.contact}</small><h2>${t.subject}</h2></div>${sw(st)}</header>`;
  const legend = `<div class="mo-legend"><span class="mo-key mo-key--c"><i></i>CLIENT</span><span class="mo-key mo-key--s"><i></i>STAFF REPLY</span><span class="mo-key mo-key--n">${ico('lock')}NOTE · STAFF ONLY</span></div>`;
  const msgs = `<div class="mo-msgs" data-keep="mo-msgs">${moMsgs(t).map((m) => moMsg(m, c)).join('')}</div>`;
  if (inSheet) return `${legend}${msgs}${moComposer(t)}`;
  if (moWide()) {
    // ultra-wide: the same conversation as the client sees it, beside the office's view — notes never cross over
    const seen = moMsgs(t).filter((m) => m[0] !== 'internal');
    const notes = moMsgs(t).length - seen.length;
    const cview = `<aside class="mo-cview"><header class="mo-cview__h"><span>${ico('view')}</span><span><small>THE CLIENT’S OFFICE</small><b>AS ${moContact(t.client)} SEES IT</b></span></header><div class="mo-cview__b" data-keep="mo-cview">${seen.map(([kind, who, text, when]) => `<div class="mo-cv mo-cv--${kind === 'client' ? 'me' : 'aio'}"><small>${kind === 'client' ? 'YOU' : 'AIO · ' + who} · ${when}</small><p>${text}</p></div>`).join('')}</div><footer class="mo-cview__f">${ico('lock')}<span>${notes} INTERNAL NOTE${notes === 1 ? '' : 'S'} · NEVER SHOWN HERE</span></footer></aside>`;
    return `<section class="mo-convo" data-swap="cv:${t.id}">${head}${legend}<div class="mo-convo__split"><div class="mo-convo__office"><div class="mo-convo__cap">${ico('people')}THE OFFICE · EVERYTHING</div>${msgs}</div>${cview}</div>${moComposer(t)}</section>`;
  }
  return `<section class="mo-convo" data-swap="cv:${t.id}">${head}${legend}${msgs}${moComposer(t)}</section>`;
}
function moThContext(t) {
  const c = ACCOUNTS[t.client];
  const m = MO_THREAD_META[t.id];
  const st = moThSt(t);
  const all = moMsgs(t);
  const notes = all.filter((x) => x[0] === 'internal').length;
  const staff = [...new Set(all.filter((x) => x[0] !== 'client').map((x) => moStaffByName(x[1])).filter(Boolean))];
  const priv = `<div class="mo-priv"><span class="mo-priv__c"><b>${all.length - notes}</b><small>${all.length - notes === 1 ? 'MESSAGE' : 'MESSAGES'} THE CLIENT SEES</small></span><span class="mo-priv__n">${ico('lock')}<b>${notes}</b><small>${notes === 1 ? 'NOTE' : 'NOTES'} ONLY STAFF SEE</small></span></div>`;
  return `${nextBlock(m.next, '', st[0] === 'WAITING ON STAFF' ? '' : 'calm')}${priv}<div><div class="sec-l">LINKED RECORDS</div><div class="mo-links">${m.links.map(moLink).join('')}</div></div>${facts([['CLIENT', `<a data-a="go" data-v="client:${c.id}">${c.name}</a>`], ['CONTACT', c.contact], ['STAFF ON IT', `<span class="mo-avs">${staff.map(av).join('')}</span>`], ['STATUS', sw(st)]])}`;
}
function moThPanel() {
  const t = moThread();
  const c = ACCOUNTS[t.client];
  const head = moPlate('letter', `CONVERSATION · ${c.name}`, t.subject, moThSt(t), `th:${t.id}`);
  if (VP === 'mobile') return moCx(head, `${moConvo(t, true)}${moThContext(t)}`, `th:${t.id}`, moCrumb(c.b));
  return moCx(head, moThContext(t), `th:${t.id}`, moCrumb(c.b, 'CONVERSATION'));
}
function moThBody() {
  const t = moThread();
  if (VP === 'mobile') return `<div class="mo-tools mo-tools--m">${seg([['all', 'ALL'], ['staff', 'ON US'], ['client', 'ON CLIENT']], WSX.mo.thFilter, 'mo.th.filter', 'wseg--fit')}</div><div class="rg mo-mlist">${moThreads().map(moThRow).join('') || '<div class="grp">NOTHING IN THIS VIEW</div>'}</div>`;
  if (VP === 'tablet') return `<div class="mo-tcol mo-tcol--msg"><div class="mo-chips wseg--scroll">${moThreads().map((x) => `<button type="button" class="mo-chip ${x.id === t.id ? 'is-sel' : ''}" data-a="mo.pick" data-v="${x.id}" title="${x.subject}">${badge(ACCOUNTS[x.client])}<span>${ACCOUNTS[x.client].name}</span>${moThSt(x)[0] === 'WAITING ON STAFF' ? '<i class="mo-unread"></i>' : ''}</button>`).join('')}</div><div class="mo-t2">${moConvo(t)}${moThPanel()}</div></div>`;
  return `<div class="mo-g mo-g--msg">${moThList()}${moConvo(t)}${moThPanel()}</div>`;
}

/* ═══════════════ GROWTH / CRM · the pipeline, the overdue lane and the week of follow-ups ═══════════════ */
const moStage = (l) => ov(`lead:${l.id}`, l.stage);
const moFollow = (l) => ov(`leadf:${l.id}`, l.follow);
const moLead = () => LEADS[moSel()] ?? vals(LEADS)[0];
const moSvcByName = (n) => MO_SVC.find((s) => s.name === n);
function moCrmBar() {
  const all = vals(LEADS);
  const n = (w) => all.filter((l) => moStage(l)[0] === w).length;
  const r = [ro(all.length, 'LEADS'), ro(n('NEW'), 'NEW', { tone: 'gold' }), ro(n('QUOTED'), 'QUOTED'), ro(n('FOLLOW-UP OVERDUE'), 'OVERDUE', { tone: 'bad' })];
  if (VP !== 'mobile') r.push(ro(all.filter((l) => moFollow(l) === 'TODAY').length, 'FOLLOW UP TODAY'));
  return r.join('');
}
function moLeadTok(l) {
  const m = MO_LEAD_META[l.id];
  const s = moStage(l);
  const f = moFollow(l);
  return `<button type="button" class="mo-tok ${moLead().id === l.id ? 'is-sel' : ''} mo-tok--${s[1]}" data-a="${moPickA()}" data-v="${l.id}" title="${l.name} · ${l.need}"><span class="mo-tok__b">${m.b}</span><span class="mo-tok__t"><b>${l.name}</b><small>${l.need}</small></span><span class="mo-tok__f">${sw([f === 'TODAY' ? 'TODAY' : f, s[1] === 'bad' ? 'bad' : f === 'TODAY' ? 'gold' : 'mute'])}<small>${l.source}</small></span></button>`;
}
function moPipe() {
  const all = vals(LEADS);
  const cols = MO_PIPE.map(([w, sub], i) => {
    const list = all.filter((l) => moStage(l)[0] === w);
    return `<div class="mo-pcol"><header class="mo-pcol__h"><span class="mo-pcol__n">${String(i + 1).padStart(2, '0')}</span><span><b>${w}</b><small>${sub}</small></span><em>${list.length}</em></header><div class="mo-pcol__b">${list.map(moLeadTok).join('') || '<span class="mo-pcol__e">NONE AT THIS STAGE</span>'}</div></div>`;
  }).join('');
  const exit = `<div class="mo-pcol mo-pcol--exit"><header class="mo-pcol__h"><span class="mo-pcol__n">${ico('intake')}</span><span><b>WON</b><small>BECOMES A CLIENT</small></span><em>0</em></header><div class="mo-pcol__b"><span class="mo-pcol__e">NO WON LEADS IN THIS SAMPLE</span><button type="button" class="wbtn wbtn--sm wbtn--ghost" data-go="intake">${ico('intake')}OPEN INTAKE</button></div></div>`;
  const over = all.filter((l) => moStage(l)[1] === 'bad');
  const lane = `<div class="mo-over ${over.length ? '' : 'mo-over--clear'}"><span class="mo-over__l">${ico(over.length ? 'warning' : 'pass')}<b>${over.length ? 'FOLLOW-UP OVERDUE' : 'NO OVERDUE FOLLOW-UPS'}</b></span><div class="mo-over__b">${over.map(moLeadTok).join('')}</div></div>`;
  return `<section class="mo-pipe" data-swap="pipe"><header class="mo-pipe__h"><span class="mo-pipe__t"><small>THE PIPELINE · SAMPLE LEADS</small><b>FROM FIRST CONTACT TO CLIENT</b></span></header><div class="mo-pipe__cols">${cols}${exit}</div>${lane}</section>`;
}
function moWeekStrip() {
  const all = vals(LEADS);
  const day = (d) => all.filter((l) => (moFollow(l) === 'TODAY' ? 'OCT 8' : moFollow(l)) === d);
  return rgn('FOLLOW-UPS · THIS WEEK', 'OCT 6 – OCT 12', '', `<div class="mo-week">${MO_WEEK.map(([w, d], i) => {
    const list = day(d);
    const today = d === 'OCT 8';
    return `<div class="mo-day ${today ? 'mo-day--today' : ''} ${i < 2 ? 'mo-day--past' : ''}"><span class="mo-day__h"><b>${w}</b><small>${today ? 'TODAY' : d}</small></span>${list.map((l) => `<button type="button" class="mo-fu mo-fu--${moStage(l)[1]} ${moLead().id === l.id ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${l.id}" title="${l.name}"><span class="mo-dot">${MO_LEAD_META[l.id].b}</span><small>${l.name}</small></button>`).join('')}${list.length ? '' : '<i class="mo-day__free"></i>'}</div>`;
  }).join('')}</div>`, 'mo-weekrg');
}
function moDemand() {
  const want = {};
  for (const l of vals(LEADS)) for (const n of MO_LEAD_META[l.id].needs) want[n] = (want[n] || 0) + 1;
  const rows = Object.entries(want).map(([n, k]) => {
    const s = moSvcByName(n);
    return `<button type="button" class="mo-dem" data-a="mo.jump" data-v="service_catalog|${s.id}" title="${n} · ${s.state}"><span class="mo-dem__i">${ico(s.icon)}</span><b>${n}</b><span class="mo-dem__n">${k} LEAD${k === 1 ? '' : 'S'}</span>${sw([s.state, s.tone])}</button>`;
  }).join('');
  const partner = Object.keys(want).filter((n) => moSvcByName(n).key !== 'active').length;
  return rgn('WHAT LEADS ASK FOR', `${partner} OF ${Object.keys(want).length} NOT SELF-SERVE`, '', rows, 'mo-demrg');
}
function moCrmPanel() {
  const l = moLead();
  const m = MO_LEAD_META[l.id];
  const s = moStage(l);
  const key = `lead:${l.id}`;
  const step = {
    NEW: ['MAKE FIRST CONTACT TODAY', simBtn(`mo:call:${l.id}`, { label: 'LOG FIRST CALL', effect: 'RECORDS THE CALL AND MOVES THE LEAD TO CONTACTED.', apply: () => { WSX.over[key] = ['CONTACTED', 'mute']; WSX.over[`leadf:${l.id}`] = 'OCT 12'; }, rec: key, primary: true })],
    CONTACTED: ['SEND THE QUOTE', simBtn(`mo:quote:${l.id}`, { label: 'SEND QUOTE', effect: 'SENDS THE SERVICE QUOTE. NO PRICE IS SHOWN IN THIS REVIEW.', apply: () => (WSX.over[key] = ['QUOTED', 'ok']), rec: key, primary: true })],
    QUOTED: [`FOLLOW UP ${moFollow(l)}`, `${simBtn(`mo:won:${l.id}`, { label: 'MARK WON · START INTAKE', effect: 'CLOSES THE LEAD AS WON AND OPENS AN INTAKE CASE.', apply: () => (WSX.over[key] = ['WON · INTAKE', 'ok']), rec: key, primary: true })}`],
    'FOLLOW-UP OVERDUE': [`FOLLOW-UP WAS DUE ${moFollow(l)}`, simBtn(`mo:late:${l.id}`, { label: 'CALL NOW', effect: 'RECORDS THE CALL AND SETS THE NEXT FOLLOW-UP.', apply: () => { WSX.over[key] = ['CONTACTED', 'mute']; WSX.over[`leadf:${l.id}`] = 'OCT 12'; }, rec: key, primary: true })],
  }[s[0]];
  const next = step ? nextBlock(step[0], step[1], '') : nextBlock('HANDED TO INTAKE', `<button type="button" class="wbtn" data-go="intake">${ico('intake')}OPEN INTAKE</button>`, 'done');
  const needs = `<div><div class="sec-l"><span>WHAT THEY NEED · CAN AIO SERVE IT</span></div><div class="mo-needs">${m.needs.map((n) => { const v = moSvcByName(n); return `<button type="button" class="mo-need" data-a="mo.jump" data-v="service_catalog|${v.id}" title="${v.note}"><span class="mo-need__i">${ico(v.icon)}</span><b>${n}</b>${sw([v.state, v.tone])}</button>`; }).join('')}</div></div>`;
  const head = moPlate('person-plus', `LEAD · ${l.source}`, l.name, s, `lead:${l.id}`, `<span class="mo-rp__b">${m.b}</span>`);
  return moCx(head, `${next}${needs}${facts([['NEEDS', l.need], ['SOURCE', l.source], ['FOLLOW-UP', moFollow(l)], ['STAGE', sw(s)]])}${mhist(key, m.hist)}${ntb('LEADS ARE SAMPLES · NO PRICE IS QUOTED HERE')}`, `lead:${l.id}`, moCrumb('LEAD'));
}
function moCrmBody() {
  if (VP === 'mobile') {
    const all = vals(LEADS);
    const groups = [...MO_PIPE.map(([w]) => [w, all.filter((l) => moStage(l)[0] === w)]), ['FOLLOW-UP OVERDUE', all.filter((l) => moStage(l)[1] === 'bad')]];
    return `<section class="mo-pipe mo-pipe--m">${groups.map(([w, list]) => `<div class="mo-pm"><span class="mo-pm__h"><b>${w}</b><em>${list.length}</em></span>${list.map(moLeadTok).join('') || '<span class="mo-pcol__e">NONE</span>'}</div>`).join('')}</section>${moWeekStrip()}${moDemand()}`;
  }
  if (VP === 'tablet') return `<div class="mo-tcol mo-tcol--crm">${moPipe()}${moWeekStrip()}<div class="mo-t2">${moDemand()}${moCrmPanel()}</div></div>`;
  return `<div class="mo-g mo-g--crm"><div class="mo-col">${moPipe()}<div class="mo-row2">${moWeekStrip()}${moDemand()}</div></div>${moCrmPanel()}</div>`;
}

/* ═══════════════ BILLING · invoices drawn as invoices (founder / billing grant) ═══════════════ */
const MO_INV_ORDER = ['PAST DUE', 'SENT', 'DRAFT', 'PAID'];
const moInvSt = (i) => ov(`invoice:${i.id}`, i.status);
const moInv = () => INVOICES[moSel()] ?? vals(INVOICES)[0];
function moBillBar() {
  const all = vals(INVOICES);
  const n = (w) => all.filter((i) => moInvSt(i)[0] === w).length;
  return [ro(all.length, 'INVOICES'), ro(n('PAST DUE'), 'PAST DUE', { tone: 'bad' }), ro(n('SENT'), 'SENT', { tone: 'gold' }), ro(n('DRAFT'), 'DRAFT'), ...(VP === 'mobile' ? [] : [ro(n('PAID'), 'PAID')])].join('');
}
function moInvRow(i) {
  const s = moInvSt(i);
  const c = ACCOUNTS[i.client];
  return `<div class="pk mo-inv ${moInv().id === i.id ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${i.id}" title="${i.ref} · ${i.what}">${badge(c)}<span class="mo-inv__t"><b class="pk__t">${i.ref}</b><span class="pk__s">${c.name}</span></span><span class="mo-inv__r"><b class="mo-amt">${i.amount}</b>${sw(s)}</span></div>`;
}
function moInvList() {
  const all = vals(INVOICES);
  const groups = MO_INV_ORDER.map((w) => [w, all.filter((i) => moInvSt(i)[0] === w)]).filter(([, l]) => l.length);
  const other = all.filter((i) => !MO_INV_ORDER.includes(moInvSt(i)[0]));
  return rgn('INVOICES', 'SAMPLE AMOUNTS', '', `${groups.map(([w, l]) => `<div class="grp"><span>${w}</span><span>${l.length}</span></div>${l.map(moInvRow).join('')}`).join('')}${other.map(moInvRow).join('')}`, 'mo-rail', 'mo-invl');
}
function moInvPaper(i) {
  const s = moInvSt(i);
  const c = ACCOUNTS[i.client];
  const steps = [['DRAFT', 'mute'], ['SENT', 'gold'], ['PAID', 'ok']];
  const at = s[0] === 'PAID' ? 2 : s[0] === 'DRAFT' ? 0 : 1;
  const track = `<ol class="mo-life">${steps.map(([w], k) => `<li class="${k < at ? 'd' : k === at ? 'n' : ''} ${k === 1 && s[0] === 'PAST DUE' ? 'late' : ''}"><i>${k < at ? ico('pass') : k + 1}</i><b>${w}</b>${k === 1 && s[0] === 'PAST DUE' ? '<small>PAST DUE</small>' : ''}</li>`).join('')}</ol>`;
  const sent = s[0] !== 'DRAFT';
  return `<section class="mo-desk" data-swap="paper:${i.id}"><span class="mo-desk__cap ${sent ? '' : 'mo-desk__cap--staff'}">${ico(sent ? 'view' : 'lock')}${sent ? `CLIENT-VISIBLE · AS ${c.name} SEES IT` : 'DRAFT · STAFF ONLY UNTIL SENT'}</span><div class="mo-paper"><header class="mo-paper__h"><span class="mo-paper__co"><b>ALL IN ONE ENTERPRISES INC.</b><small>AIO OFFICE · BILLING</small></span><span class="mo-paper__no"><small>INVOICE</small><b>${i.ref.replace('INVOICE ', '')}</b></span></header>
    <div class="mo-paper__to"><div><small>BILL TO</small><b>${c.name}</b><span>${c.contact}</span><span>${c.dot} · ${c.state}</span></div><div><small>DATE</small><b>${i.date}</b><small>STATUS</small>${sw(s)}</div></div>
    <table class="mo-paper__t"><thead><tr><th>SERVICE</th><th class="r">AMOUNT</th></tr></thead><tbody><tr><td>${i.what}</td><td class="r mo-amt">${i.amount}</td></tr></tbody></table>
    <footer class="mo-paper__f"><span>SAMPLE AMOUNT · NOT A BALANCE</span><span>${i.ref}</span></footer>
    <em class="mo-stamp mo-stamp--${s[1]}">${s[0]}</em></div>${track}</section>`;
}
function moBillPanel() {
  const i = moInv();
  const s = moInvSt(i);
  const c = ACCOUNTS[i.client];
  const key = `invoice:${i.id}`;
  const books = /BOOKKEEPING/.test(i.what);
  let next;
  if (s[0] === 'PAST DUE') next = nextBlock(`${c.name} IS PAST DUE`, simBtn(`mo:inv:${i.id}`, { label: 'SEND PAST-DUE REMINDER', effect: 'EMAILS A PAYMENT REMINDER. NO CHARGE IS MADE.', apply: () => {}, rec: key, primary: true, founder: true }));
  else if (s[0] === 'DRAFT') next = nextBlock('READY TO SEND', simBtn(`mo:inv:${i.id}`, { label: 'SEND INVOICE', effect: `SENDS ${i.ref} TO ${c.name}. NO CHARGE IS MADE.`, apply: () => { WSX.over[key] = ['SENT', 'gold']; }, rec: key, primary: true, founder: true }));
  else if (s[0] === 'SENT') next = nextBlock('WAITING ON PAYMENT', simBtn(`mo:inv:${i.id}`, { label: 'SEND REMINDER', effect: 'EMAILS A FRIENDLY REMINDER. NO CHARGE IS MADE.', apply: () => {}, rec: key, founder: true }), 'calm');
  else next = nextBlock('PAID · NOTHING TO DO', '', 'done');
  const head = moPlate('summary', `INVOICE · ${c.name}`, i.what, s, `inv:${i.id}`);
  const links = `<div class="mo-links"><button type="button" class="mo-link" data-a="go" data-v="client:${c.id}">${ico('company')}<span>CLIENT 360</span>${ico('fwd')}</button>${books ? `<button type="button" class="mo-link" data-a="go" data-v="books:${c.id}">${ico('calculator')}<span>BOOKKEEPING</span>${ico('fwd')}</button>` : ''}</div>`;
  const sib = moSib('INVOICES', vals(INVOICES).map((x) => moSibRow(x.id, 'summary', `${x.ref} · ${ACCOUNTS[x.client].b}`, moInvSt(x))));
  const body = `${next}${VP === 'mobile' ? moInvPaper(i) : ''}${facts([['CLIENT', c.name], ['FOR', i.what], ['AMOUNT', `${i.amount} <small>SAMPLE · NOT A BALANCE</small>`], ['DATE', i.date]])}${links}${mhist(key, [[i.date === '—' ? 'NOT SENT' : i.date, s[0] === 'DRAFT' ? 'DRAFTED' : 'INVOICE SENT']])}${ntb('QUOTES, PAYMENTS AND CREDITS ARE NOT BUILT')}${sib}`;
  return moCx(head, body, `inv:${i.id}`, moCrumb(c.b, i.ref));
}
function moBillBody() {
  if (VP === 'mobile') return `<div class="rg mo-mlist">${vals(INVOICES).sort((a, b) => MO_INV_ORDER.indexOf(moInvSt(a)[0]) - MO_INV_ORDER.indexOf(moInvSt(b)[0])).map(moInvRow).join('')}</div>${ntb('SAMPLE AMOUNTS · NEVER A BALANCE OR A TOTAL')}`;
  if (VP === 'tablet') return `<div class="mo-tcol"><div class="mo-chips wseg--scroll">${vals(INVOICES).map((x) => `<button type="button" class="mo-chip ${x.id === moInv().id ? 'is-sel' : ''}" data-a="mo.pick" data-v="${x.id}">${badge(ACCOUNTS[x.client])}<span>${x.ref}</span><i class="pip pip--${moInvSt(x)[1]}"></i></button>`).join('')}</div><div class="mo-t2">${moInvPaper(moInv())}${moBillPanel()}</div></div>`;
  return `<div class="mo-g mo-g--bill">${moInvList()}${moInvPaper(moInv())}${moBillPanel()}</div>`;
}

/* ═══════════════ TEAM & STAFF · the bench: who owns how much (counted from the records' owners) ═══════════════ */
const MO_OWN_TYPES = [['request', REQUESTS], ['policy', POLICIES], ['quarter', QUARTERS], ['load', LOADS], ['shipment', SHIPMENTS], ['subscription', SUBSCRIPTIONS]];
function moOwned(sid) {
  const out = [];
  for (const [type, table] of MO_OWN_TYPES) for (const r of vals(table)) if (r.owner === sid) out.push({ key: `${type}:${r.id}`, type, r, lane: RECORD_TYPES[type].lane, t: RECORD_TYPES[type].title(r), s: ov(`${type}:${r.id}`, statusWord(r)) });
  for (const [id, m] of Object.entries(DUE_META)) if (m.owner === sid && DUES[id]) out.push({ key: `deadline:${id}`, type: 'deadline', r: DUES[id], lane: 'compliance', t: DUES[id].what, s: ov(`deadline:${id}`, DUES[id].state) });
  for (const m of vals(MIG_CASES)) if (m.owner === sid) out.push({ key: null, type: 'intake', r: m, lane: 'intake', t: m.name, s: m.stage });
  return out;
}
const moLaneName = (slug) => (slug === 'intake' ? 'INTAKE' : laneBySlug(slug)?.name ?? slug.toUpperCase());
const moRole = (sid) => (sid === 's-alex' ? (FOUNDER ? 'FOUNDER' : 'STAFF') : STAFF[sid].role);
const moGrants = (sid) => (sid === 's-alex' && FOUNDER ? ['ALL AREAS', 'BILLING', 'GROWTH / CRM', 'ROLES', 'FINANCE REPORTS'] : sid === 's-kayla' ? ['WORK LANES', 'BILLING GRANT'] : ['WORK LANES']);
const moPerson = () => STAFF[moSel()] ?? STAFF['s-jordan'];
function moTeamBar() {
  const ids = Object.keys(STAFF);
  const owned = ids.flatMap(moOwned);
  return [ro(ids.length, 'PEOPLE'), ro(owned.length, 'RECORDS OWNED'), ro(owned.filter((x) => moToneOpen(x.s)).length, 'OPEN', { tone: 'gold' }), ...(VP === 'mobile' ? [] : [ro(owned.filter((x) => x.s?.[1] === 'bad').length, 'LATE OR BLOCKED', { tone: 'bad' })])].join('');
}
function moBench() {
  const ids = Object.keys(STAFF);
  const max = Math.max(...ids.map((id) => moOwned(id).length));
  const cols = ids.map((id) => {
    const p = STAFF[id];
    const own = moOwned(id);
    const open = own.filter((x) => moToneOpen(x.s)).length;
    const bad = own.filter((x) => x.s?.[1] === 'bad').length;
    const on = moPerson().id === id;
    const h = (n) => `${((n / max) * 100).toFixed(1)}%`;
    return `<button type="button" class="mo-seat ${on ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${id}" title="${p.name} · ${own.length} OWNED · ${open} OPEN" aria-pressed="${on}"><span class="mo-seat__bar"><span class="mo-seat__col" style="height:${h(own.length)}"><i class="mo-seat__open" style="height:${own.length ? ((open / own.length) * 100).toFixed(1) : 0}%"></i></span><b>${own.length}</b></span><span class="mo-seat__p"><span class="mo-seat__av ${id === 's-alex' ? 'is-you' : ''}">${p.b}</span><span class="mo-seat__t"><b>${p.name}</b><small>${moRole(id)}</small></span></span><span class="mo-seat__n"><span>${open} OPEN</span>${bad ? `<span class="mo-seat__bad">${bad} LATE</span>` : ''}</span></button>`;
  }).join('');
  return `<section class="mo-bench" data-swap="bench"><header class="mo-bench__h"><span class="mo-bench__t"><small>THE BENCH · RECORDS EACH PERSON OWNS</small><b>WHO CARRIES WHAT</b></span><span class="mo-bench__k"><span><i class="k-open"></i>OPEN</span><span><i class="k-done"></i>SETTLED</span></span></header><div class="mo-bench__cols">${cols}</div></section>`;
}
function moOwnList(p) {
  const own = moOwned(p.id);
  const lanes = [...new Set(own.map((x) => x.lane))];
  const rows = lanes.map((ln) => {
    const list = own.filter((x) => x.lane === ln).sort((a, b) => TONE_RANK[a.s?.[1] ?? 'mute'] - TONE_RANK[b.s?.[1] ?? 'mute']);
    return `<div class="grp"><span>${moLaneName(ln)}</span><span>${list.length}</span></div>${list.map((x) => `<div class="pk mo-own" ${x.key ? moLinkAttrs(x.key) : 'data-go="intake"'} title="${x.t}"><span class="mo-own__i">${ico(x.type === 'intake' ? 'intake' : OWNER_ICON[x.type])}</span><span class="mo-own__t"><b class="pk__t">${x.t}</b><span class="pk__s">${x.r.client ? clientName(x.r.client) : x.r.source ?? ''}</span></span>${sw(x.s)}</div>`).join('')}`;
  }).join('');
  return rgn(`${p.name} · OWNS`, `${own.length} RECORDS`, '', rows || '<div class="grp">NOTHING OWNED</div>', 'mo-ownrg', 'mo-own');
}
function moTeamPanel() {
  const p = moPerson();
  const own = moOwned(p.id);
  const open = own.filter((x) => moToneOpen(x.s));
  const lanes = [...new Set(own.map((x) => x.lane))];
  const most = Object.keys(STAFF).sort((a, b) => moOwned(b).filter((x) => moToneOpen(x.s)).length - moOwned(a).filter((x) => moToneOpen(x.s)).length)[0];
  const next = FOUNDER
    ? nextBlock(p.id === most ? `${p.name.split(' ')[0]} CARRIES THE MOST OPEN WORK` : `${open.length} OPEN WITH ${p.name.split(' ')[0]}`, `${simBtn(`mo:reas:${p.id}`, { label: 'REASSIGN A RECORD', effect: `MOVES ONE OF ${p.name}’S RECORDS TO ANOTHER OWNER.`, apply: () => {}, rec: `staff:${p.id}`, primary: p.id === most, founder: true })}${p.id === 's-alex' ? '' : simBtn(`mo:role:${p.id}`, { label: 'CHANGE GRANTS', effect: `CHANGES WHAT ${p.name} CAN OPEN IN THE OFFICE.`, apply: () => {}, rec: `staff:${p.id}`, founder: true })}`, p.id === most ? '' : 'calm')
    : nextBlock(`${open.length} OPEN WITH ${p.name.split(' ')[0]}`, '', 'calm');
  const lead = `<span class="mo-rp__b ${p.id === 's-alex' ? 'is-you' : ''}">${p.b}</span>`;
  const head = moPlate('people', `${moRole(p.id)}${p.id === 's-alex' ? ' · YOU' : ''}`, p.name, null, `p:${p.id}:${FOUNDER}`, lead);
  return moCx(head, `${next}${facts([['ROLE', moRole(p.id)], ['AREAS', p.area], ['GRANTS', moGrants(p.id).join(' · ')], ['WORKS IN', lanes.map(moLaneName).join(' · ') || '—']])}<div class="mo-tally">${moFeat(own.length, 'OWNED')}${moFeat(open.length, 'OPEN', 'gold')}${moFeat(own.filter((x) => x.s?.[1] === 'bad').length, 'LATE OR BLOCKED', 'bad')}</div>${FOUNDER ? '' : ntb('ROLES AND GRANTS ARE FOUNDER-ONLY · VIEW ONLY')}${moHist(`staff:${p.id}`, [])}`, `p:${p.id}`, moCrumb('PERSON'));
}
function moTeamBody() {
  if (VP === 'mobile') {
    const ids = Object.keys(STAFF);
    const max = Math.max(...ids.map((id) => moOwned(id).length));
    return `<div class="rg mo-mlist">${ids.map((id) => { const own = moOwned(id); const open = own.filter((x) => moToneOpen(x.s)).length; return `<div class="pk mo-pr ${moPerson().id === id ? 'is-sel' : ''}" data-a="mo.open" data-v="${id}"><span class="av ${id === 's-alex' ? 'av--you' : ''}">${STAFF[id].b}</span><span class="mo-pr__t"><b class="pk__t">${STAFF[id].name}</b><span class="pk__s">${moRole(id)}</span><span class="mo-hbar"><i style="width:${((own.length / max) * 100).toFixed(1)}%"><i style="width:${own.length ? ((open / own.length) * 100).toFixed(1) : 0}%"></i></i></span></span><span class="mo-pr__n"><b>${own.length}</b><small>${open} OPEN</small></span></div>`; }).join('')}</div>`;
  }
  if (VP === 'tablet') return `<div class="mo-tcol mo-tcol--team">${moBench()}<div class="mo-t2">${moOwnList(moPerson())}${moTeamPanel()}</div></div>`;
  return `<div class="mo-g mo-g--team"><div class="mo-col mo-col--team">${moBench()}${moOwnList(moPerson())}</div>${moTeamPanel()}</div>`;
}

/* ═══════════════ SERVICE CATALOG · the ecosystem: AIO at the centre, each service on the ring of its state ═══════════════ */
const moSvc = () => MO_SVC.find((s) => s.id === moSel()) ?? MO_SVC[0];
const moSvcClients = (s) => vals(ACCOUNTS).filter((c) => c.lanes.includes(s.lane));
function moSvcBar() {
  const f = WSX.mo.svcFilter;
  return MO_STATES.map(([k, w, tone]) => ro(MO_SVC.filter((s) => s.key === k).length, w, { tone: { internal: 'gold', paused: 'bad' }[k] ?? '', a: 'mo.svc.filter', v: f === k ? 'all' : k, on: f === k })).join('');
}
function moOrbit() {
  const sel = moSvc();
  const f = WSX.mo.svcFilter;
  const pos = (s) => {
    const [rx, ry] = MO_ORBIT[s.key === 'paused' ? 'partner' : s.key];
    const a = (MO_ANGLE[s.id] * Math.PI) / 180;
    return [500 + rx * Math.cos(a), 300 + ry * Math.sin(a)];
  };
  const rings = Object.entries(MO_ORBIT).map(([k, [rx, ry]]) => `<ellipse cx="500" cy="300" rx="${rx}" ry="${ry}" class="mo-ring mo-ring--${k} ${f !== 'all' && f !== k ? 'is-dim' : ''}"/>`).join('');
  const [sx, sy] = pos(sel);
  const spoke = `<path data-swap="spoke:${sel.id}" d="M500 300 L${sx.toFixed(1)} ${sy.toFixed(1)}" pathLength="1" class="mo-spoke ${sel.key === 'paused' ? 'mo-spoke--off' : ''}"/>`;
  const nodes = MO_SVC.map((s) => {
    const [x, y] = pos(s);
    const on = s.id === sel.id;
    const dim = f !== 'all' && f !== s.key;
    return `<button type="button" class="mo-node mo-node--${s.key} ${y < 299 ? 'mo-node--up' : ''} ${on ? 'is-sel' : ''} ${dim ? 'is-dim' : ''}" style="left:${(x / 10).toFixed(2)}%;top:${(y / 6).toFixed(2)}%" data-a="${moPickA()}" data-v="${s.id}" aria-pressed="${on}" aria-label="${s.name} · ${s.state}" title="${s.name} · ${s.state}">${on ? `<i class="mo-node__ring" data-swap="ring:${s.id}" aria-hidden="true"></i>` : ''}<span class="mo-node__c">${ico(s.icon)}</span><b>${s.short}</b></button>`;
  }).join('');
  const legend = `<div class="mo-olegend">${MO_STATES.map(([k, w, tone]) => `<button type="button" class="mo-ol mo-ol--${k} ${f === k ? 'is-on' : ''}" data-a="mo.svc.filter" data-v="${f === k ? 'all' : k}" aria-pressed="${f === k}"><i></i><b>${w}</b><em>${MO_SVC.filter((s) => s.key === k).length}</em></button>`).join('')}</div>`;
  return `<section class="mo-eco"><header class="mo-eco__h"><span class="mo-eco__t"><small>THE AIO SERVICE ECOSYSTEM · LIVE ACTIVATION</small><b>12 SERVICES · 4 STATES</b></span>${legend}</header><div class="mo-orbitwrap"><div class="mo-orbit"><svg viewBox="0 0 1000 600" class="mo-osvg" aria-hidden="true"><defs><radialGradient id="mo-glow"><stop offset="0" stop-color="rgba(231,171,60,0.22)"/><stop offset="1" stop-color="rgba(231,171,60,0)"/></radialGradient></defs><ellipse cx="500" cy="300" rx="250" ry="150" fill="url(#mo-glow)"/>${rings}${spoke}</svg><span class="mo-core"><b>AIO</b><small>ALL IN ONE</small></span>${nodes}</div></div></section>`;
}
function moSvcPanel() {
  const s = moSvc();
  const st = MO_STATES.find((x) => x[0] === s.key);
  const clients = moSvcClients(s);
  const lane = laneBySlug(s.lane);
  const lw = wsByLane(s.lane);
  let next;
  if (s.key === 'paused') next = nextBlock('STAYS PAUSED UNTIL THE BUSINESS IS ACTIVATED', '', 'calm');
  else if (s.key === 'partner') next = nextBlock('WORKED BY HAND WITH A PARTNER', '', 'calm');
  else next = nextBlock(s.key === 'internal' ? 'STAFF RUN IT FOR THE CLIENT' : 'CLIENTS START IT IN THEIR OFFICE', `<button type="button" class="wbtn ${lw ? 'wbtn--gold' : ''}" data-go="work/${s.lane}">${ico(lane.icon)}OPEN ${lane.name}</button>`, s.key === 'internal' ? 'calm' : '');
  const head = moPlate(s.icon, `SERVICE · ${st[1]}`, s.name, [s.state, s.tone], `svc:${s.id}`);
  const who = `<div class="mo-who">${MO_STATES.map(([k, w, , , starts]) => `<span class="${k === s.key ? 'is-on' : ''}"><b>${starts}</b><small>${k === s.key ? 'STARTS IT' : w}</small></span>`).join('')}</div>`;
  const body = `${next}<p class="cx__lead">${s.note}</p><div><div class="sec-l"><span>WHO STARTS IT</span></div>${who}</div>${facts([['STATE', sw([s.state, s.tone]), st[3]], ['WORK LANE', `<a data-go="work/${s.lane}">${lane.name}</a>`], ['CLIENTS', `${clients.length} OF ${vals(ACCOUNTS).length} IN THE LANE`]])}${clients.length ? `<div class="mo-badges">${clients.map((c) => `<button type="button" class="mo-bdg" data-a="go" data-v="client:${c.id}:${s.lane}" title="${c.name}">${badge(c)}</button>`).join('')}</div>` : ''}${FOUNDER ? ntb('PRICING · FOUNDER ONLY · NOT IN THIS SAMPLE') : ntb('VIEW ONLY · PRICING IS FOUNDER-ONLY')}`;
  return moCx(head, body, `svc:${s.id}`, moCrumb(st[1]));
}
function moSvcBody() {
  if (VP === 'mobile') {
    return `<section class="mo-ecom">${MO_STATES.map(([k, w, tone, means]) => `<div class="mo-band mo-band--${k}"><span class="mo-band__h"><i></i><b>${w}</b><em>${MO_SVC.filter((s) => s.key === k).length}</em></span><small>${means}</small><div class="mo-band__b">${MO_SVC.filter((s) => s.key === k).map((s) => `<button type="button" class="mo-node mo-node--${k} mo-node--flat ${moSvc().id === s.id ? 'is-sel' : ''}" data-a="mo.open" data-v="${s.id}" title="${s.name}"><span class="mo-node__c">${ico(s.icon)}</span><b>${s.short}</b></button>`).join('')}</div></div>`).join('')}</section>`;
  }
  if (VP === 'tablet') return `<div class="mo-tcol mo-tcol--svc">${moOrbit()}${moSvcPanel()}</div>`;
  return `<div class="mo-g mo-g--svc">${moOrbit()}${moSvcPanel()}</div>`;
}

/* ═══════════════ MECHANIC NETWORK · each provider, the work it holds, the truck and the client ═══════════════ */
const moProvSt = (p) => ov(`provider:${p.id}`, p.verify);
const moProv = () => PROVIDERS[moSel()] ?? vals(PROVIDERS)[0];
const moProvName = (p) => p.name.replace('SAMPLE PROVIDER · ', '');
const moTickets = (p) => vals(TICKETS).filter((t) => t.provider === p.id);
function moNetBar() {
  const all = vals(PROVIDERS);
  return [ro(all.length, 'PROVIDERS'), ro(all.filter((p) => moProvSt(p)[1] === 'ok').length, 'AIO VERIFIED'), ro(all.filter((p) => moProvSt(p)[1] !== 'ok').length, 'PENDING REVIEW', { tone: 'gold' }), ...(VP === 'mobile' ? [] : [ro(vals(TICKETS).length, 'OPEN TICKETS')])].join('');
}
function moNetRow(p) {
  const st = moProvSt(p);
  const on = moProv().id === p.id;
  const tk = moTickets(p)[0];
  const v = tk && VEHICLES[tk.vehicle];
  const ts = tk && ov(`ticket:${tk.id}`, tk.status);
  const plate = `<button type="button" class="mo-prov ${on ? 'is-sel' : ''} mo-prov--${st[1]}" data-a="${moPickA()}" data-v="${p.id}" aria-pressed="${on}" title="${moProvName(p)}"><span class="mo-prov__i">${ico('wrench')}</span><span class="mo-prov__t"><small>${p.where}</small><b>${moProvName(p)}</b>${sw(st)}</span></button>`;
  if (!tk) return `<div class="mo-net__row">${plate}<span class="mo-net__none">NO OPEN WORK</span></div>`;
  return `<div class="mo-net__row ${on ? 'is-on' : ''}">${plate}<i class="mo-wire"></i><button type="button" class="mo-ntk mo-ntk--${ts[1]}" ${moLinkAttrs(`ticket:${tk.id}`)} title="${tk.ref} · ${tk.issue}"><small>${tk.ref}</small><b>${tk.issue.split(' · ')[0]}</b>${sw([ts[0].replace('AWAITING CUSTOMER AUTHORIZATION', 'AWAITING APPROVAL'), ts[1]])}</button><i class="mo-wire"></i><button type="button" class="mo-ntruck" data-a="go" data-v="fleet:${v.id}:maintenance" title="${v.unit} · ${v.ymm}"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><b>${v.unit}</b></button><i class="mo-wire"></i><button type="button" class="mo-ncl" data-a="go" data-v="client:${v.client}:maintenance" title="${clientName(v.client)}">${badge(ACCOUNTS[v.client])}<span>${clientName(v.client)}</span></button></div>`;
}
function moCoverage() {
  const cs = vals(ACCOUNTS);
  const states = [...new Set(cs.map((c) => c.state))];
  const provIn = (stt) => vals(PROVIDERS).find((p) => p.where.endsWith(`, ${stt}`));
  const cov = states.filter((s) => provIn(s)).length;
  return rgn('COVERAGE · CLIENT HOME STATES', `${cov} OF ${states.length} HAVE A NETWORK SHOP`, '', `<div class="mo-cov">${states.map((s) => { const p = provIn(s); const c = cs.filter((x) => x.state === s); return `<div class="mo-st ${p ? `mo-st--${moProvSt(p)[1]}` : 'mo-st--none'}" title="${s} · ${p ? moProvName(p) : 'NO NETWORK SHOP'}"><b>${s}</b><span>${c.map((x) => x.b).join(' · ')}</span><small>${p ? moProvName(p).split(' ').slice(0, 2).join(' ') : 'NO SHOP YET'}</small></div>`; }).join('')}</div>`, 'mo-covrg');
}
function moNetStage() {
  return `<section class="mo-net"><header class="mo-net__h"><span class="mo-net__t"><small>THE NETWORK · PROVIDER → TICKET → TRUCK → CLIENT</small><b>WHO HOLDS OUR TRUCKS TODAY</b></span>${ntb('PROVIDERS OWN THE REPAIR · AIO COORDINATES')}</header><div class="mo-net__rows">${vals(PROVIDERS).map(moNetRow).join('')}</div></section>`;
}
function moNetPanel() {
  const p = moProv();
  const st = moProvSt(p);
  const tks = moTickets(p);
  const key = `provider:${p.id}`;
  const next = st[1] !== 'ok'
    ? nextBlock('VERIFY BEFORE MORE WORK IS SENT', FOUNDER ? simBtn(`mo:ver:${p.id}`, { label: 'MARK AIO VERIFIED', effect: `MARKS ${moProvName(p)} AS AIO VERIFIED FOR THIS VISIT.`, apply: () => (WSX.over[key] = ['AIO VERIFIED', 'ok']), rec: key, primary: true, founder: true }) : '<span class="founder">THE FOUNDER VERIFIES</span>')
    : nextBlock(tks.length ? `${tks.length} TICKET${tks.length === 1 ? '' : 'S'} WITH THIS SHOP` : 'NO OPEN WORK', simBtn(`mo:pmsg:${p.id}`, { label: 'MESSAGE PROVIDER', effect: `SENDS A NOTE TO ${moProvName(p)}.`, apply: () => {}, rec: key }), 'calm');
  const head = moPlate('wrench', `PROVIDER · ${p.where}`, moProvName(p), st, `prov:${p.id}`);
  const work = tks.map((t) => `<div class="mo-ptk">${moLink(`ticket:${t.id}`)}${moLink(`vehicle:${t.vehicle}`)}<span class="pk__s">${t.issue}</span></div>`).join('');
  return moCx(head, `${next}<div class="mo-verify mo-verify--${st[1]}"><span>${ico(st[1] === 'ok' ? 'shield-check' : 'pending')}</span><span><b>${st[0]}</b><small>${st[1] === 'ok' ? 'CHECKED BY AIO · WORK CAN BE SENT' : 'NOT YET CHECKED BY AIO'}</small></span></div>${work ? `<div><div class="sec-l">OPEN WORK</div>${work}</div>` : ''}${facts([['LOCATION', p.where], ['VERIFICATION', sw(st)], ['OPEN TICKETS', String(tks.length)], ['NAME', 'SAMPLE PROVIDER']])}${moHist(key, [])}`, `prov:${p.id}`, moCrumb('PROVIDER'));
}
function moNetBody() {
  if (VP === 'mobile') return `<section class="mo-net mo-net--m">${vals(PROVIDERS).map(moNetRow).join('')}</section>${moCoverage()}`;
  if (VP === 'tablet') return `<div class="mo-tcol mo-tcol--net">${moNetStage()}<div class="mo-t2">${moCoverage()}${moNetPanel()}</div></div>`;
  return `<div class="mo-g mo-g--net"><div class="mo-col mo-col--net">${moNetStage()}${moCoverage()}</div>${moNetPanel()}</div>`;
}

/* ═══════════════ SYSTEM SETTINGS · the console (founder: every area · staff: granted areas) ═══════════════ */
const moAreas = () => MO_AREAS.filter((a) => FOUNDER || a.staff);
const moArea = () => moAreas().find((a) => a.id === WSX.mo.area) ?? moAreas()[0];
const moSetVal = (it) => ov(`set:${it.id}`, it.v);
const moSetItem = () => moArea().items.find((x) => x.id === moSel()) ?? moArea().items[0];
const moCanEdit = (a) => FOUNDER || a.staff === 'YOUR OWN';
function moSetBar() {
  const items = moAreas().flatMap((a) => a.items);
  const changed = items.filter((i) => WSX.over[`set:${i.id}`] != null).length;
  return [ro(moAreas().length, FOUNDER ? 'AREAS' : 'GRANTED AREAS'), ro(items.length, 'SETTINGS'), ro(changed, 'CHANGED · SIMULATED', { tone: changed ? 'gold' : '' })].join('');
}
function moSetValue(it) {
  const v = moSetVal(it);
  if (it.k === 'toggle') return `<span class="mo-sv mo-sv--tog ${v === 'ON' ? 'is-on' : ''}"><i></i>${v}</span>`;
  if (it.k === 'lock') return `<span class="mo-sv mo-sv--lock">${ico('lock')}${v}</span>`;
  if (it.k === 'state') return `<span class="mo-sv mo-sv--state">${sw([v, /PENDING|INTAKE/.test(v) ? 'gold' : 'mute'])}</span>`;
  if (it.k === 'action') return `<span class="mo-sv mo-sv--act">${ico('run')}${v}</span>`;
  return `<span class="mo-sv mo-sv--choice">${it.o.map((o) => `<i class="${o === v ? 'is-on' : ''}">${o}</i>`).join('')}</span>`;
}
function moSetRail() {
  return rgn(FOUNDER ? 'AREAS · ALL' : 'GRANTED AREAS', `${moAreas().length}`, '', moAreas().map((a) => `<div class="pk mo-area ${moArea().id === a.id ? 'is-sel' : ''}" data-a="mo.area" data-v="${a.id}"><span class="mo-area__i">${ico(a.icon)}</span><span class="mo-area__t"><b class="pk__t">${a.name}</b><span class="pk__s">${a.items.length} SETTINGS · ${FOUNDER ? 'FOUNDER' : a.staff}</span></span></div>`).join('') + (FOUNDER ? '' : `<div style="padding:12px">${ntb('OTHER AREAS ARE FOUNDER-ONLY')}</div>`), 'mo-rail', 'mo-areas');
}
function moConsole() {
  const a = moArea();
  const it = moSetItem();
  const rows = a.items.map((x) => `<div class="pk mo-set ${x.id === it.id ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${x.id}" title="${x.t}"><span class="mo-set__t"><b class="pk__t">${x.t}</b><span class="pk__s">${x.who}</span></span>${moSetValue(x)}${WSX.over[`set:${x.id}`] != null ? '<span class="simtag">SIM</span>' : ''}</div>`).join('');
  const log = a.items.flatMap((x) => (WSX.hist[`set:${x.id}`] || []).map(([w, t]) => [w, `${x.t} · ${t}`]));
  const changes = `<div class="mo-log"><div class="sec-l"><span>CHANGE LOG · THIS VISIT</span><span>${log.length}</span></div>${log.length ? `<ul class="mh">${log.slice(0, 4).map(([w, t]) => `<li class="is-sim"><b>${t} <span class="simtag">SIMULATED</span></b><small>${w}</small></li>`).join('')}</ul>` : `<div class="mo-log__e">${ico('history')}<span>NO CHANGES YET · EVERY CHANGE IS LOGGED</span></div>`}</div>`;
  return `<section class="mo-console" data-swap="area:${a.id}"><header class="mo-console__h"><span class="mo-console__i">${ico(a.icon)}</span><span class="mo-console__t"><small>${FOUNDER ? 'FOUNDER · ALL AREAS' : `GRANTED · ${a.staff}`}</small><b>${a.name}</b></span><span class="design-pill">DESIGN ONLY</span></header><div class="mo-console__b" data-keep="mo-console">${rows}${changes}</div><footer class="mo-console__f">${ico('info')}<span>CHANGES HERE ARE SIMULATED · NOTHING IS SAVED</span></footer></section>`;
}
function moSetPanel() {
  const a = moArea();
  const it = moSetItem();
  const v = moSetVal(it);
  const key = `set:${it.id}`;
  const can = moCanEdit(a);
  let control = '';
  if (!can) control = ntb('VIEW ONLY · THE FOUNDER CHANGES THIS');
  else if (it.k === 'toggle') control = `<div class="nx__acts">${simBtn(`mo:set:${it.id}`, { label: v === 'ON' ? 'TURN OFF' : 'TURN ON', effect: `${it.t} WILL BE ${v === 'ON' ? 'OFF' : 'ON'}.`, apply: () => (WSX.over[key] = v === 'ON' ? 'OFF' : 'ON'), rec: key, primary: true })}</div>`;
  else if (it.k === 'choice') control = `<div class="mo-opts">${it.o.map((o) => (o === v ? `<span class="mo-opt is-on">${ico('pass')}${o}</span>` : simBtn(`mo:set:${it.id}:${o}`, { label: o, effect: `${it.t} · ${o}.`, apply: () => (WSX.over[key] = o), rec: key, sm: true }))).join('')}</div>`;
  else if (it.k === 'action') control = `<div class="nx__acts">${simBtn(`mo:set:${it.id}`, { label: it.id === 'd1' ? 'EXPORT CSV' : 'SIGN OUT EVERYONE', effect: it.id === 'd1' ? 'PREPARES A CSV OF CLIENT RECORDS. NO FILE IN THIS REVIEW.' : 'ENDS EVERY STAFF SESSION. EVERYONE SIGNS IN AGAIN.', apply: () => {}, rec: key, primary: true, founder: true })}</div>`;
  else if (it.k === 'lock') control = ntb('NOT A SETTING · ALWAYS ON');
  else control = ntb('A STATE, NOT A SWITCH · CHANGES WHEN IT IS BUILT');
  const head = moPlate(a.icon, `${a.name} · ${can ? 'EDITABLE' : 'VIEW ONLY'}`, it.t, null, `set:${it.id}`);
  const sib = moSib(`IN ${a.name}`, a.items.map((x) => moSibRow(x.id, x.k === 'lock' ? 'lock' : a.icon, x.t, null)));
  return moCx(head, `<div class="mo-now"><small>NOW</small>${moSetValue(it)}</div>${it.k === 'choice' || it.k === 'toggle' || it.k === 'action' ? `<div class="nx"><span class="nx__l">${can ? 'CHANGE IT' : 'VIEW ONLY'}</span>${control}</div>` : control}${facts([['AFFECTS', it.who], ['AREA', a.name], ['WHO CHANGES IT', a.staff === 'YOUR OWN' ? 'EACH PERSON · THEIR OWN' : 'THE FOUNDER']])}${moHist(key, [])}${sib}`, `set:${it.id}`, moCrumb(a.name));
}
function moSetBody() {
  if (VP === 'mobile') return `<div class="mo-chips wseg--scroll">${moAreas().map((a) => `<button type="button" class="mo-chip ${moArea().id === a.id ? 'is-sel' : ''}" data-a="mo.area" data-v="${a.id}"><span class="mo-chip__i">${ico(a.icon)}</span><span>${a.name}</span></button>`).join('')}</div>${moConsole()}${FOUNDER ? '' : ntb('OTHER AREAS ARE FOUNDER-ONLY')}`;
  if (VP === 'tablet') return `<div class="mo-tcol">${`<div class="mo-chips wseg--scroll">${moAreas().map((a) => `<button type="button" class="mo-chip ${moArea().id === a.id ? 'is-sel' : ''}" data-a="mo.area" data-v="${a.id}"><span class="mo-chip__i">${ico(a.icon)}</span><span>${a.name}</span></button>`).join('')}</div>`}<div class="mo-t2">${moConsole()}${moSetPanel()}</div></div>`;
  return `<div class="mo-g mo-g--set">${moSetRail()}${moConsole()}${moSetPanel()}</div>`;
}

/* ═══════════════ HELP & SUPPORT · the help desk ═══════════════ */
const moTopic = () => MO_TOPICS.find((t) => t.id === moSel()) ?? MO_TOPICS[0];
const moTopicsShown = () => MO_TOPICS.filter((t) => !WSX.mo.q || `${t.t} ${t.steps.join(' ')} ${t.g}`.includes(WSX.mo.q.toUpperCase()));
function moAsk() {
  const quick = ['h4', 'h5', 'h3', 'h10'].map((id) => MO_TOPICS.find((t) => t.id === id));
  return `<section class="mo-ask"><span class="mo-ask__t"><small>HELP & SUPPORT · AIO OFFICE</small><b>HOW CAN WE HELP?</b></span><label class="wfld mo-ask__f">${ico('search')}<input id="mo-q" data-input="mo.q" value="${WSX.mo.q}" placeholder="SEARCH HELP" aria-label="Search help"></label><div class="mo-ask__q">${quick.map((t) => `<button type="button" class="mo-qk ${moTopic().id === t.id ? 'is-on' : ''}" data-a="${moPickA()}" data-v="${t.id}">${t.t}</button>`).join('')}</div></section>`;
}
function moShelves() {
  const shown = moTopicsShown();
  const shelves = MO_HELP.map(([g, icon]) => {
    const list = shown.filter((t) => t.g === g);
    if (!list.length) return '';
    return `<section class="mo-shelf"><header class="mo-shelf__h"><span class="mo-shelf__i">${ico(icon)}</span><b>${g}</b><em>${list.length}</em></header>${list.map((t) => `<button type="button" class="mo-topic ${moTopic().id === t.id ? 'is-sel' : ''}" data-a="${moPickA()}" data-v="${t.id}" title="${t.t}"><span><b>${t.t}</b>${moWide() ? `<ol class="mo-tsteps">${t.steps.map((x) => `<li>${x}</li>`).join('')}</ol>` : `<small>${t.steps[0]}</small>`}</span>${ico('fwd')}</button>`).join('')}</section>`;
  }).join('');
  return `<div class="mo-shelves" data-swap="sh:${WSX.mo.q}">${shelves || `<div class="mo-none">NO TOPIC MATCHES · ASK SUPPORT BELOW</div>`}</div>`;
}
function moSupport() {
  return `<section class="mo-sup"><span class="mo-sup__t"><small>STILL STUCK?</small><b>CONTACT AIO SUPPORT</b></span><div class="mo-sup__acts">${simBtn('mo:sup:req', { label: 'OPEN A SUPPORT REQUEST', effect: 'SENDS YOUR QUESTION TO AIO SUPPORT WITH THIS PAGE ATTACHED.', apply: () => {}, rec: 'support', primary: true })}${simBtn('mo:sup:founder', { label: 'MESSAGE THE FOUNDER', effect: 'SENDS A STAFF MESSAGE TO ALEX R.', apply: () => {}, rec: 'support' })}</div>${ntb('TRAINING VIDEOS AND SOPS ARE NOT BUILT')}</section>`;
}
function moHelpPanel() {
  const t = moTopic();
  const go = t.go ? (t.go.includes(':') ? `data-a="go" data-v="${t.go}"` : `data-a="mo.dest" data-v="${t.go}"`) : t.id === 'h10' ? 'data-go="intake"' : 'data-go="home"';
  const where = t.go ? (t.go.includes(':') ? 'CLIENT 360' : MO_BY[t.go].name) : t.id === 'h10' ? 'INTAKE' : 'HOME';
  const head = moPlate(t.icon, `HELP · ${t.g}`, t.t, null, `h:${t.id}`);
  const steps = `<ol class="mo-steps">${t.steps.map((s, i) => `<li><i>${i + 1}</i><b>${s}</b></li>`).join('')}</ol>`;
  const sib = moSib(`MORE IN ${t.g}`, MO_TOPICS.filter((x) => x.g === t.g).map((x) => moSibRow(x.id, x.icon, x.t, null)));
  return moCx(head, `${steps}<button type="button" class="wbtn wbtn--dark mo-gobtn" ${go}>${ico('fwd')}GO TO ${where}</button>${VP === 'desktop' && !moWide() ? '' : moSupport()}${sib}`, `h:${t.id}`, moCrumb(t.g));
}
function moHelpBody() {
  if (VP === 'mobile') return `${moAsk()}${moShelves()}${moSupport()}`;
  if (VP === 'tablet') return `<div class="mo-tcol mo-tcol--help">${moAsk()}<div class="mo-t2">${moShelves()}${moHelpPanel()}</div></div>`;
  return `<div class="mo-g mo-g--help"><div class="mo-col mo-col--help">${moAsk()}${moShelves()}${moWide() ? '' : moSupport()}</div>${moHelpPanel()}</div>`;
}

/* ═══════════════ ACCOUNT · the signed-in person (role from VIEW AS) ═══════════════ */
const MO_ACCT = [['profile', 'PROFILE'], ['access', 'ROLE & ACCESS'], ['security', 'SECURITY'], ['prefs', 'PREFERENCES']];
const moAccess = () => [
  ['CLIENTS · CLIENT 360', true, 'FULL', 'company'],
  ['DOCUMENTS & VAULT', true, 'FULL', 'folder'],
  ['MESSAGES · INTERNAL NOTES', true, 'FULL', 'letter'],
  ['WORK · EVERY LANE', true, FOUNDER ? 'FULL' : 'ASSIGNED WORK', 'work'],
  ['GROWTH / CRM', FOUNDER, FOUNDER ? 'FULL' : 'BY GRANT', 'person-plus'],
  ['BILLING', FOUNDER, FOUNDER ? 'FULL' : 'BY GRANT', 'summary'],
  ['SERVICE CATALOG', true, FOUNDER ? 'WITH PRICING' : 'VIEW ONLY', 'tag'],
  ['TEAM & STAFF', true, FOUNDER ? 'ROLES AND GRANTS' : 'VIEW ONLY', 'people'],
  ['SYSTEM SETTINGS', true, FOUNDER ? 'ALL AREAS' : 'GRANTED AREAS', 'setup'],
  ['FINANCIAL REPORTS', FOUNDER, FOUNDER ? 'FULL' : 'FOUNDER · FINANCE', 'reports'],
];
function moAcctBar() {
  const own = moOwned('s-alex');
  return [ro(FOUNDER ? 'FOUNDER' : 'STAFF', 'ROLE', { tone: 'gold' }), ro(moAccess().filter((x) => x[1]).length, 'AREAS OPEN'), ro(own.length, 'RECORDS YOU OWN'), ...(VP === 'mobile' ? [] : [ro(2, 'SESSIONS')])].join('');
}
function moAcctPlate() {
  return `<section class="mo-me" data-swap="me:${FOUNDER}"><span class="mo-me__p"><b>AR</b></span><span class="mo-me__t"><small>SIGNED IN · THIS DEVICE</small><b>ALEX R.</b><span>${sw([FOUNDER ? 'FOUNDER' : 'STAFF', 'gold'])}<em>${STAFF['s-alex'].area}</em><em>SET BY VIEW AS</em></span></span>${simBtn('mo:me:edit', { label: 'EDIT PROFILE', effect: 'CHANGES YOUR NAME OR INITIALS IN THE OFFICE.', apply: () => {}, rec: 'me' })}</section>`;
}
function moAcctSection(sec = WSX.mo.sel.account) {
  if (sec === 'profile') return `<div class="mo-sec" data-swap="acct:profile">${moWide() ? '<div class="sec-l">PROFILE</div>' : ''}${facts([['NAME', 'ALEX R.'], ['INITIALS', 'AR'], ['ROLE', FOUNDER ? 'FOUNDER' : 'STAFF', 'FROM VIEW AS IN THIS REVIEW'], ['AREAS', STAFF['s-alex'].area], ['WORK EMAIL', 'NOT IN THIS SAMPLE']])}</div>`;
  if (sec === 'access') {
    const grants = `<div class="mo-grants"><div class="sec-l"><span>GRANTS IN THIS OFFICE</span><a data-a="mo.dest" data-v="team_staff">THE BENCH ${ico('fwd')}</a></div><div class="mo-grants__r">${Object.keys(STAFF).map((id) => `<span class="mo-grant">${av(id)}<span><b>${STAFF[id].name}</b><small>${id === 's-alex' && FOUNDER ? 'ALL AREAS' : moGrants(id).slice(-1)[0]}</small></span></span>`).join('')}</div></div>`;
    return `<div class="mo-sec" data-swap="acct:access:${FOUNDER}">${moWide() ? '<div class="sec-l">ROLE & ACCESS</div>' : ''}<div class="mo-access">${moAccess().map(([t, ok, w, icon]) => `<div class="mo-acc ${ok ? '' : 'mo-acc--no'}"><span class="mo-acc__i">${ico(ok ? icon : 'lock')}</span><b>${t}</b>${sw([w, ok ? (w === 'FULL' || w === 'ALL AREAS' || w === 'WITH PRICING' || w === 'ROLES AND GRANTS' ? 'ok' : 'gold') : 'mute'])}</div>`).join('')}</div>${grants}</div>`;
  }
  if (sec === 'security') {
    const sess = [['THIS DEVICE', 'ACTIVE NOW', 'ok'], ['PHONE · SAMPLE', '2 DAYS AGO', 'mute']];
    return `<div class="mo-sec" data-swap="acct:security">${moWide() ? '<div class="sec-l">SECURITY · DESIGN ONLY</div>' : ''}${facts([['TWO-STEP SIGN-IN', sw(['ON', 'ok'])], ['PASSWORD', 'CHANGED 41 DAYS AGO · SAMPLE']])}<div><div class="sec-l">SESSIONS</div><div class="mo-sess">${sess.map(([d, w, tone]) => `<div class="mo-ses"><span class="mo-ses__i">${ico(d === 'THIS DEVICE' ? 'deploy' : 'signal')}</span><b>${d}</b>${sw([w, tone])}</div>`).join('')}</div></div><div class="nx__acts">${simBtn('mo:me:out', { label: 'SIGN OUT OTHER SESSIONS', effect: 'ENDS THE SESSION ON YOUR PHONE.', apply: () => {}, rec: 'me', primary: true })}${simBtn('mo:me:pw', { label: 'CHANGE PASSWORD', effect: 'SENDS A SECURE LINK TO CHANGE IT.', apply: () => {}, rec: 'me' })}</div>${ntb('SECURITY IS DESIGN ONLY IN THIS REVIEW')}</div>`;
  }
  return `<div class="mo-sec" data-swap="acct:prefs">${moWide() ? '<div class="sec-l">PREFERENCES</div>' : ''}${facts([['START PAGE', 'HOME'], ['NOTIFICATIONS', '<a data-a="mo.jump" data-v="system_settings|n1">IN SYSTEM SETTINGS</a>'], ['DENSITY', 'COMPACT'], ['MOTION', 'FOLLOWS THE DEVICE SETTING']])}<div class="nx__acts">${simBtn('mo:me:start', { label: 'START ON WORK', effect: 'OPENS WORK INSTEAD OF HOME WHEN YOU SIGN IN.', apply: () => {}, rec: 'me' })}</div></div>`;
}
function moAcctPanel() {
  const own = moOwned('s-alex');
  const open = own.filter((x) => moToneOpen(x.s));
  const head = moPlate('profile', 'YOUR WORK · ALEX R.', `${own.length} RECORDS YOU OWN`, null, `me:${FOUNDER}`);
  const rows = open.slice(0, 5).map((x) => `<div class="pk mo-own" ${x.key ? moLinkAttrs(x.key) : 'data-go="intake"'} title="${x.t}"><span class="mo-own__i">${ico(x.type === 'intake' ? 'intake' : OWNER_ICON[x.type])}</span><span class="mo-own__t"><b class="pk__t">${x.t}</b><span class="pk__s">${moLaneName(x.lane)}</span></span>${sw(x.s)}</div>`).join('');
  return moCx(head, `${nextBlock(`${open.length} OPEN WITH YOU`, `<button type="button" class="wbtn" data-a="mo.jump" data-v="team_staff|s-alex">${ico('people')}SEE THE BENCH</button>`, 'calm')}<div class="rg rg--flat mo-mine">${rows}</div>${ntb('ACCOUNT IS NOT BUILT YET IN THE LIVE OFFICE')}`, `me:${FOUNDER}`, moCrumb('ALEX R.'));
}
function moAcctBody() {
  const tabs = seg(MO_ACCT, WSX.mo.sel.account, 'mo.acct', VP === 'mobile' ? 'wseg--fit' : '');
  if (VP === 'mobile') return `${moAcctPlate()}${tabs}${moAcctSection()}${moAcctPanel()}`;
  if (VP === 'tablet') return `<div class="mo-tcol mo-tcol--acct">${moAcctPlate()}${tabs}<div class="mo-t2">${moAcctSection()}${moAcctPanel()}</div></div>`;
  if (moWide()) return `<div class="mo-g mo-g--acct"><div class="mo-col mo-col--acctw">${moAcctPlate()}<div class="mo-acct4">${moAcctSection('access')}<div class="mo-acct4__r">${moAcctSection('profile')}${moAcctSection('security')}${moAcctSection('prefs')}</div></div></div>${moAcctPanel()}</div>`;
  return `<div class="mo-g mo-g--acct"><div class="mo-col mo-col--acct">${moAcctPlate()}${tabs}${moAcctSection()}</div>${moAcctPanel()}</div>`;
}

/* ═══════════════ the honest no-access state (staff without the grant) ═══════════════ */
function moNoAccess(d) {
  const crm = d.slug === 'growth_crm';
  const who = [['s-alex', 'FOUNDER'], ...(crm ? [] : [['s-kayla', 'BILLING GRANT']])];
  return `<section class="mo-lock" data-swap="lock:${d.slug}"><span class="mo-lock__i">${ico('lock')}</span><small>${crm ? 'BY GRANT' : 'FOUNDER · BILLING GRANT'}</small><b>${d.name} IS NOT IN YOUR ROLE</b><p>NOTHING IS HIDDEN BEHIND A BLANK. IT IS SIMPLY NOT SHOWN.</p><div class="mo-lock__who"><span class="sec-l">WHO CAN OPEN IT</span>${who.map(([id, g]) => `<span class="mo-lock__p">${av(id)}<b>${id === 's-alex' ? 'THE FOUNDER' : STAFF[id].name}</b><small>${g}</small></span>`).join('')}</div><div class="nx__acts">${simBtn(`mo:ask:${d.slug}`, { label: `ASK FOR ${crm ? 'THE CRM' : 'THE BILLING'} GRANT`, effect: 'SENDS A GRANT REQUEST TO THE FOUNDER.', apply: () => {}, rec: `grant:${d.slug}`, primary: true })}<button type="button" class="wbtn wbtn--ghost" data-a="mo.dest" data-v="messages">${ico('letter')}MESSAGES</button></div></section>`;
}

/* ═══════════════ the frame: bar, destination switch, the destination, the drawer ═══════════════ */
const MO_VIEW = {
  documents_vault: [moDocBar, moDocBody, moDocPanel],
  messages: [moThBar, moThBody, moThPanel],
  growth_crm: [moCrmBar, moCrmBody, moCrmPanel],
  billing: [moBillBar, moBillBody, moBillPanel],
  team_staff: [moTeamBar, moTeamBody, moTeamPanel],
  service_catalog: [moSvcBar, moSvcBody, moSvcPanel],
  mechanic_network: [moNetBar, moNetBody, moNetPanel],
  system_settings: [moSetBar, moSetBody, moSetPanel],
  help_support: [() => [ro(MO_TOPICS.length, 'TOPICS'), ro(MO_HELP.length, 'SHELVES'), ro(moTopicsShown().length, WSX.mo.q ? 'MATCH' : 'SHOWN', { tone: WSX.mo.q ? 'gold' : '' })].join(''), moHelpBody, moHelpPanel],
  account: [moAcctBar, moAcctBody, moAcctPanel],
};
const moDestBtn = (d, cls) => {
  const on = d.slug === WSX.mo.dest;
  const label = moWide() || cls === 'mo-idx__r' ? d.name : d.short;
  if (d.slug === 'clients') return `<button type="button" class="${cls} ${cls}--out" data-a="go" data-v="client:c-abc" title="CLIENTS · OPENS CLIENT 360">${ico(d.icon)}<span>${label}</span>${ico('fwd', 'mo-out')}</button>`;
  return `<button type="button" role="tab" class="${cls} ${on ? 'is-on' : ''} ${moLocked(d.slug) ? `${cls}--lock` : ''}" data-a="mo.dest" data-v="${d.slug}" title="${d.name}" aria-selected="${on}">${ico(moLocked(d.slug) ? 'lock' : d.icon)}<span>${label}</span></button>`;
};
function moSwitch() {
  const shown = moShown();
  const groups = GROUPS.map(([g]) => shown.filter((d) => d.group === g)).filter((l) => l.length);
  const inner = groups.map((l) => l.map((d) => moDestBtn(d, 'mo-dsw__b')).join('')).join('<i class="mo-dsw__sep" aria-hidden="true"></i>');
  return `<nav class="mo-dsw has-thumb ${VP === 'desktop' ? '' : 'wseg--scroll'}" role="tablist" aria-label="More destinations" data-thumb><i class="thumb" aria-hidden="true" data-keep-attrs="style data-placed"></i>${inner}</nav>`;
}
function moIndex() {
  return `<section class="rg cx mo-idx"><header class="cx__h"><h2 class="cx__t">EVERY DESTINATION</h2></header><div class="cx__b">${GROUPS.map(([g]) => { const list = moShown().filter((d) => d.group === g); return list.length ? `<div class="mo-idx__g"><div class="sec-l">${g}</div>${list.map((d) => moDestBtn(d, 'mo-idx__r')).join('')}</div>` : ''; }).join('')}${FOUNDER ? '' : ntb('GROWTH / CRM AND BILLING SHOW BY GRANT')}</div></section>`;
}
function moView() {
  if (!MO_BY[WSX.mo.dest] || WSX.mo.dest === 'clients') WSX.mo.dest = 'documents_vault';
  const d = MO_BY[WSX.mo.dest];
  const [bar, body, panel] = MO_VIEW[d.slug];
  const locked = moLocked(d.slug);
  const pill = { system_settings: 'DESIGN ONLY', account: 'DESIGN ONLY', billing: 'SAMPLE AMOUNTS', growth_crm: 'SAMPLE LEADS' }[d.slug];
  const no = `MORE · ${d.group}`;
  const vp = VP === 'mobile' ? 'm' : VP === 'tablet' ? 't' : 'd';
  const content = `<div class="mo-body" data-swap="dest:${d.slug}:${locked}">${locked ? moNoAccess(d) : body()}</div>`;
  if (VP === 'mobile') {
    const strip = `<div class="mo-strip wseg--scroll has-thumb" data-thumb><i class="thumb" aria-hidden="true" data-keep-attrs="style data-placed"></i>${moShown().map((x) => moDestBtn(x, 'mo-sb')).join('')}</div>`;
    const ros = locked ? '' : `<div class="ros mo-ros">${bar()}</div>`;
    const sheet = WSX.sheet === 'dests' ? phoneSheet(moIndex(), { side: true, label: 'More' }) : WSX.sheet && !locked ? phoneSheet(panel(), { label: `${d.name} detail` }) : '';
    return `<div class="ws mo mo--m mo--${d.slug}">${wsBar(no, d.name, '', `<button type="button" class="wbtn wbtn--sm" data-a="mo.dests">${ico('more')}ALL</button>`)}${ros}${strip}${content}</div>${sheet}`;
  }
  return `<div class="ws mo mo--${vp} mo--${d.slug} ${moWide() ? 'mo--w' : ''}">${wsBar(no, d.name, locked ? '' : bar(), pill && !locked ? `<span class="design-pill">${pill}</span>` : '')}${moSwitch()}${content}</div>`;
}

/* ── actions ── */
ACT['mo.dest'] = (slug) => {
  if (slug === 'clients') return ACT.go('client:c-abc');
  if (!MO_BY[slug]) return;
  WSX.mo.dest = slug;
  WSX.sheet = false;
  WSX.pending = null;
};
ACT['mo.pick'] = (id) => {
  WSX.mo.sel[WSX.mo.dest] = id;
  WSX.pending = null;
};
ACT['mo.open'] = (id) => {
  WSX.mo.sel[WSX.mo.dest] = id;
  WSX.sheet = true;
  WSX.pending = null;
};
/** Inside MORE: open another destination on one of its items (a document from a thread, a service from a lead). */
ACT['mo.jump'] = (v) => {
  const [slug, id] = v.split('|');
  if (slug === 'system_settings') {
    const a = MO_AREAS.find((x) => x.items.some((i) => i.id === id));
    if (a) WSX.mo.area = a.id;
  }
  if (slug === 'documents_vault') Object.assign(WSX.mo, { docClient: 'all', docVis: 'all' });
  if (slug === 'messages') WSX.mo.thFilter = 'all';
  WSX.mo.dest = slug;
  if (id) WSX.mo.sel[slug] = id;
  WSX.sheet = VP === 'mobile' && !!id && slug !== 'account' ? true : false;
  WSX.pending = null;
};
ACT['mo.dests'] = () => {
  WSX.sheet = 'dests';
  WSX.pending = null;
};
ACT['mo.doc.client'] = (c) => {
  WSX.mo.docClient = c;
  WSX.pending = null;
  const list = moDocs();
  if (list.length && !list.some((d) => d.id === moSel('documents_vault'))) WSX.mo.sel.documents_vault = list[0].id;
};
ACT['mo.doc.vis'] = (f) => {
  WSX.mo.docVis = f;
  WSX.pending = null;
  const list = moDocs();
  if (list.length && !list.some((d) => d.id === moSel('documents_vault'))) WSX.mo.sel.documents_vault = list[0].id;
};
ACT['mo.th.filter'] = (f) => {
  WSX.mo.thFilter = f;
  WSX.pending = null;
  const list = moThreads();
  if (list.length && !list.some((t) => t.id === moSel('messages'))) WSX.mo.sel.messages = list[0].id;
};
ACT['mo.mode'] = (m) => {
  WSX.mo.mode = m;
  WSX.pending = null;
};
ACT['mo.draft'] = (v) => {
  const t = moThread();
  WSX.over[`mo:draft:${t.id}:${WSX.mo.mode}`] = String(v).toUpperCase();
};
ACT['mo.svc.filter'] = (f) => {
  WSX.mo.svcFilter = f;
  WSX.pending = null;
  if (f !== 'all' && moSvc().key !== f) WSX.mo.sel.service_catalog = MO_SVC.find((s) => s.key === f).id;
};
ACT['mo.area'] = (a) => {
  WSX.mo.area = a;
  WSX.mo.sel.system_settings = (MO_AREAS.find((x) => x.id === a) ?? MO_AREAS[0]).items[0].id;
  WSX.pending = null;
};
ACT['mo.q'] = (q) => {
  WSX.mo.q = String(q).toUpperCase();
  const shown = moTopicsShown();
  if (shown.length && !shown.some((t) => t.id === moSel('help_support'))) WSX.mo.sel.help_support = shown[0].id;
};
ACT['mo.acct'] = (s) => {
  WSX.mo.sel.account = s;
  WSX.pending = null;
};

/** Where a link from elsewhere lands: a destination (optionally one item), or a document, thread or invoice. */
function moEnter(a, b, client) {
  const map = { document: 'documents_vault', thread: 'messages', invoice: 'billing', lead: 'growth_crm', provider: 'mechanic_network', staff: 'team_staff', service: 'service_catalog', documents: 'documents_vault' };
  const slug = MO_BY[a] && a !== 'clients' ? a : map[a];
  if (!slug) return false;
  WSX.mo.dest = slug;
  WSX.sheet = false;
  if (slug === 'documents_vault') Object.assign(WSX.mo, { docClient: client && ACCOUNTS[client] ? client : 'all', docVis: 'all' });
  if (slug === 'messages') WSX.mo.thFilter = 'all';
  if (slug === 'documents_vault' && client && ACCOUNTS[client] && !b) {
    const first = moDocs()[0];
    if (first) WSX.mo.sel.documents_vault = first.id;
  }
  if (b) WSX.mo.sel[slug] = b;
  return true;
}

registerWorkspace({
  id: 'more', no: 'M+', name: 'MORE · DESTINATIONS', group: 'office', page: 'more', hidden: true, view: () => moView(),
  shape: 'ELEVEN DESTINATIONS', line: 'EACH PLACE IN MORE, SHAPED FOR ITS WORK.',
  states: [
    ['MAIN', []],
    ['SELECTED', [['mo.dest', 'messages'], ['mo.pick', 'th-mt']]],
    ['DEEPER', [['mo.dest', 'messages'], ['mo.pick', 'th-mt'], ['sim.ask', 'mo:send:th-mt:reply']]],
    ['PHONE', [['mo.dest', 'documents_vault'], ['mo.open', 'doc-abc-med']], 'phone'],
  ],
  demos: [
    ['WHO SEES EACH DOCUMENT', [['mo.dest', 'documents_vault', 'DOCUMENTS & VAULT'], ['mo.pick', 'doc-tk-3', 'CLIENT-VISIBLE · T&K SEES IT'], ['mo.pick', 'doc-abc-med', 'STAFF ONLY · NEVER SHOWN'], ['mo.doc.vis', 'internal', 'ONLY WHAT STAFF SEE'], ['mo.doc.vis', 'all', 'THE WHOLE VAULT']]],
    ['ANSWER A CLIENT', [['mo.dest', 'messages', 'MESSAGES'], ['mo.pick', 'th-mt', 'OWEN IS WAITING'], ['sim.ask', 'mo:send:th-mt:reply', 'SEND THE REPLY'], ['sim.ok', 'mo:send:th-mt:reply', 'CONFIRM · SIMULATED']]],
    ['WALK THE DESTINATIONS', [['mo.dest', 'growth_crm', 'GROWTH / CRM'], ['mo.dest', 'service_catalog', 'SERVICE CATALOG'], ['mo.dest', 'team_staff', 'TEAM & STAFF'], ['mo.dest', 'mechanic_network', 'MECHANIC NETWORK'], ['mo.dest', 'system_settings', 'SYSTEM SETTINGS']]],
  ],
  audit: [
    [['mo.pick', 'doc-hf-ein']],
    [['mo.pick', 'doc-rl-q3']],
    [['mo.doc.client', 'c-tk']],
    [['mo.doc.vis', 'review']],
    [['mo.pick', 'doc-dh-dec'], ['sim.ask', 'mo:vis:doc-dh-dec']],
    [['mo.dest', 'messages'], ['mo.pick', 'th-hf']],
    [['mo.dest', 'messages'], ['mo.pick', 'th-abc'], ['mo.mode', 'note']],
    [['mo.dest', 'messages'], ['mo.pick', 'th-mt'], ['sim.ask', 'mo:send:th-mt:reply'], ['sim.ok', 'mo:send:th-mt:reply']],
    [['mo.dest', 'growth_crm']],
    [['mo.dest', 'growth_crm'], ['mo.pick', 'ld-crm-4']],
    [['mo.dest', 'growth_crm'], ['mo.pick', 'ld-crm-3']],
    [['mo.dest', 'billing']],
    [['mo.dest', 'billing'], ['mo.pick', 'inv-3309']],
    [['mo.dest', 'billing'], ['mo.pick', 'inv-3301']],
    [['mo.dest', 'team_staff']],
    [['mo.dest', 'team_staff'], ['mo.pick', 's-kayla']],
    [['mo.dest', 'team_staff'], ['mo.pick', 's-alex']],
    [['mo.dest', 'service_catalog']],
    [['mo.dest', 'service_catalog'], ['mo.pick', 'brokerage']],
    [['mo.dest', 'service_catalog'], ['mo.svc.filter', 'partner']],
    [['mo.dest', 'mechanic_network']],
    [['mo.dest', 'mechanic_network'], ['mo.pick', 'p-gulf']],
    [['mo.dest', 'system_settings']],
    [['mo.dest', 'system_settings'], ['mo.area', 'integrations']],
    [['mo.dest', 'system_settings'], ['mo.area', 'security'], ['mo.pick', 's2']],
    [['mo.dest', 'system_settings'], ['mo.area', 'data'], ['mo.pick', 'd1']],
    [['mo.dest', 'help_support']],
    [['mo.dest', 'help_support'], ['mo.pick', 'h10']],
    [['mo.dest', 'help_support'], ['mo.q', 'PRIVACY']],
    [['mo.dest', 'account']],
    [['mo.dest', 'account'], ['mo.acct', 'profile']],
    [['mo.dest', 'account'], ['mo.acct', 'security']],
    [['mo.dest', 'account'], ['mo.acct', 'prefs']],
    [['mo.dests', '']],
  ],
  phoneAct: { 'mo.pick': 'mo.open' },
  enter: (a, b) => moEnter(a, b),
  label: () => MO_BY[WSX.mo.dest]?.name ?? 'MORE',
  route: (s, client) => {
    if (s[0] === 'more' && s[1] && s[1] !== 'clients' && (MO_BY[s[1]] || s[1] === 'documents')) return moEnter(s[1], null, client);
    if (s[0] === 'rec' && s[1] === 'document' && DOCS[s[2]]) return moEnter('document', s[2]);
    if (s[0] === 'rec' && s[1] === 'thread' && MO_THREADS[s[2]]) return moEnter('thread', s[2]);
    if (s[0] === 'rec' && s[1] === 'invoice' && INVOICES[s[2]]) return moEnter('invoice', s[2]);
    return false;
  },
});
