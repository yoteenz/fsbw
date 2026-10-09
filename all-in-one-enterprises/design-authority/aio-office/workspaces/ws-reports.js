/*
 * REPORTS · AREAS — the ten areas behind the approved REPORTS root (../studio.js reports(), drawn unchanged; its links
 * reports/<area> open here). Built around a report: a slim bar with the area switcher and the period · an obsidian
 * stage that draws what the area reports, composed for its subject (the office at a glance, a lifecycle and service
 * matrix, twelve lanes, an invoice track, two filing windows, a 90-day distribution, a load chart, a close funnel, a
 * case matrix, an export sheet) · the rows behind it · a panel with the records behind the selected mark, each one
 * opening in its department. Every figure is a count of the sample records; nothing is estimated and no money is
 * summed. FINANCIAL / REVENUE is founder-only and shows invoice statuses only; staff see the approved no-access lock.
 */
WSX.rp = { area: 'overview', sel: {}, month: 'OCT' };

/* ── the areas, the period, the dates ── */
const rpSlug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const RP_AREAS = AREAS.map(([label, icon, state, , gate]) => ({ slug: rpSlug(label), label, icon, state, gate: gate || null }));
const rpArea = (slug = WSX.rp.area) => RP_AREAS.find((a) => a.slug === slug) ?? RP_AREAS[0];
const rpShown = () => RP_AREAS.filter((a) => FOUNDER || a.gate !== 'finance');
const RP_MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const RP_CUM = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
/** 'OCT 6, 2026' · 'OCT 6' · 'TODAY' → { m, d, y, n } (n counts days in the sample calendar); anything else → null. */
function rpDate(s) {
  const t = String(s || '');
  if (/^TODAY/.test(t)) return rpDate(TODAY);
  const x = /^([A-Z]{3}) (\d{1,2})(?:, (\d{4}))?/.exec(t);
  if (!x || !RP_MON.includes(x[1])) return null;
  const y = Number(x[3] || 2026);
  return { m: x[1], d: Number(x[2]), y, n: (y - 2026) * 365 + RP_CUM[RP_MON.indexOf(x[1])] + Number(x[2]) };
}
const RP_NOW = rpDate(TODAY).n;
/** A day number back to 'OCT 9'. */
const rpDay = (n) => {
  const mi = RP_CUM.findLastIndex((c) => c < n);
  return `${RP_MON[mi]} ${n - RP_CUM[mi]}`;
};
const RP_MONTHS = ['JUL', 'AUG', 'SEP', 'OCT'];
const RP_MONTH_NAME = { JUL: 'JULY', AUG: 'AUGUST', SEP: 'SEPTEMBER', OCT: 'OCTOBER' };
/** The period, in the root's words (THIS MONTH · OCT 2026). */
const rpMonth = (m = WSX.rp.month) => (m === 'OCT' ? 'THIS MONTH · OCT 2026' : m === 'SEP' ? 'LAST MONTH · SEP 2026' : `${m} 2026`);
const rpIn = (s, m = WSX.rp.month) => {
  const d = rpDate(s);
  return !!d && d.m === m && d.y === 2026;
};

/* ── selection ── */
const RP = {};
const rpKey = () => {
  const k = WSX.rp.sel[WSX.rp.area];
  return k ? k : RP[WSX.rp.area].def();
};
const rpA = () => (VP === 'mobile' ? 'rp.open' : 'rp.sel');
const rpOn = (k) => (rpKey() === k ? 'is-on' : '');
const rpBtn = (k, label = '') => `data-a="${rpA()}" data-v="${k}" aria-pressed="${rpKey() === k}"${label ? ` aria-label="${label}"` : ''}`;
const rpWide = () => WSX.device === 'wide';

/* ── tones and counts ── */
const RP_TONES = ['bad', 'warn', 'gold', 'ok', 'mute'];
const RP_TONE_WORD = { bad: 'BLOCKED · LATE', warn: 'AT RISK', gold: 'IN PROGRESS', ok: 'CURRENT · DONE', mute: 'NOT STARTED' };
const rpCount = (tones) => tones.reduce((o, t) => ((o[t] = (o[t] || 0) + 1), o), {});
const rpSum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const rpWorst = (tones) => tones.reduce((w, t) => (TONE_RANK[t] < TONE_RANK[w] ? t : w), 'mute');
const rpUnit = (n, unit) => (n === 1 ? unit.replace(/S$/, '') : unit);
const rpHead = (t) => (t.bad || t.warn ? [`${(t.bad || 0) + (t.warn || 0)} NEED ACTION`, t.bad ? 'bad' : 'warn'] : ['ALL CURRENT', 'ok']);
/** Every working record a lane owns (documents, threads, invoices, trucks and drivers are reported elsewhere). */
function rpAll() {
  const out = [];
  for (const [type, def] of Object.entries(RECORD_TYPES)) {
    if (['document', 'thread', 'invoice', 'application', 'vehicle', 'driver', 'shipment'].includes(type)) continue;
    for (const r of vals(def.table)) out.push({ type, r, s: ov(`${type}:${r.id}`, statusWord(r)), lane: def.lane });
  }
  return out;
}
const rpByTone = (a, b) => TONE_RANK[a.s?.[1] ?? 'mute'] - TONE_RANK[b.s?.[1] ?? 'mute'];

/* ── shared parts ── */
const rpBadge = (cid) => `<span class="rp-bd ${ACCOUNTS[cid]?.life === 'ACTIVE' ? '' : 'rp-bd--pre'}">${ACCOUNTS[cid]?.b ?? '—'}</span>`;
/** A stacked tone bar: one segment per status tone, worst first, each one carrying its count. */
const rpBar = (tones, cls = '') => `<span class="rp-sb ${cls}" aria-hidden="true">${RP_TONES.filter((t) => tones[t]).map((t) => `<i class="rp-f--${t}" style="flex:${tones[t]} 0 0">${tones[t]}</i>`).join('')}</span>`;
const rpLegend = (items) => `<span class="rp-lg">${items.map(([t, w]) => `<span><i class="rp-sq rp-f--${t}"></i>${w}</span>`).join('')}</span>`;
/** The stage: obsidian, one per area, drawn for what the area reports. */
function rpStage(slug, { kick, fig, of = '', label, aside = '' }, body, cls = '') {
  return `<section class="rp-st rp-st--${slug} ${cls}" data-swap="st:${slug}"><header class="rp-st__h"><div class="rp-st__id"><small>${kick}</small><span class="rp-st__fig"><b>${fig}</b>${of ? `<em>${of}</em>` : ''}<span>${label}</span></span></div>${aside ? `<div class="rp-st__aside">${aside}</div>` : ''}</header><div class="rp-st__b">${body}</div></section>`;
}
/** A region (list or side panel) keyed by area, so each area's list opens at its top. */
const rpRegion = (title, n, tools, body, cls, key) => `<section class="rg ${cls}" data-key="${key}"><header class="rg__h"><span class="rg__t">${title}</span>${n != null && n !== '' ? `<span class="rg__n">${n}</span>` : ''}${tools ? `<span>${tools}</span>` : ''}</header><div class="rg__b" data-keep="${key}">${body}</div></section>`;
/** The rows behind the stage: a header and rows on one column template (a shorter one on tablet and phone). */
function rpList(title, n, cols, colsM, head, rows, empty = 'NOTHING HERE') {
  const h = `<div class="rp-row rp-row--h" aria-hidden="true">${head.map(([l, x]) => `<span class="${x ? 'rp-x' : ''}">${l}</span>`).join('')}</div>`;
  return rpRegion(title, n, '', `<div class="rp-rows" style="--c:${cols};--cm:${colsM}">${h}${rows.join('') || `<div class="rp-empty">${empty}</div>`}</div>`, 'rp-ls', `ls:${WSX.rp.area}`);
}
const rpRow = (k, cells, tip = '') => `<div class="pk rp-row ${rpKey() === k ? 'is-sel' : ''}" ${rpBtn(k)}${tip ? ` title="${tip}"` : ''}>${cells}</div>`;
const rpGrp = (label, n) => `<div class="grp rp-grp"><span>${label}</span><span>${n}</span></div>`;
/** The panel: where the selected mark is, its plate, and the records behind it. */
function rpPanel(crumb, plate, body, key) {
  return `<section class="rg cx rp-cx"><header class="cx__h"><div class="cx__crumb"><span>${rpArea().label}</span>${ico('fwd')}<span>${crumb}</span></div>${plate}</header><div class="cx__b" data-keep="rp-cx" data-swap="b:${WSX.rp.area}:${key}">${body}</div></section>`;
}
const rpPlate = (lead, kick, title, status, key) => `<div class="rp-pl" data-swap="pl:${key}"><span class="rp-pl__i">${lead}</span><span class="rp-pl__t"><small>${kick}</small><b>${title}</b></span>${status ? `<span class="rp-pl__s">${sw(status)}</span>` : ''}</div>`;
/** A row that opens something: a record in its department (nav), another workspace (go) or a mark here (rp.sel). */
function rpLink({ a = 'nav', v, lead, title, sub = '', status = null, on = false, tip = '' }) {
  return `<div class="pk rp-rec ${on ? 'is-sel' : ''}" data-a="${a}" data-v="${v}"${tip ? ` title="${tip}"` : ''}><span class="rp-rec__i">${lead}</span><span class="rp-rec__t"><b class="pk__t">${title}</b>${status || sub ? `<span class="rp-rec__m">${status ? sw(status) : ''}${sub ? `<span class="pk__s">${sub}</span>` : ''}</span>` : ''}</span>${ico('fwd', 'rp-rec__go')}</div>`;
}
const rpRecLink = (type, r, sub) => rpLink({ v: `rec/${type}/${r.id}`, lead: ico(OWNER_ICON[type]), title: RECORD_TYPES[type].title(r), sub: sub ?? clientName(r.client), status: ov(`${type}:${r.id}`, statusWord(r)), tip: `OPEN IN ${OWNER_LABEL[type]}` });
const rpPickLink = (k, lead, title, sub, status) => rpLink({ a: rpA(), v: k, lead, title, sub, status, on: rpKey() === k });
const rpRecs = (rows, empty = 'NOTHING BEHIND THIS MARK') => `<div class="rp-recs">${rows.join('') || `<div class="rp-empty">${empty}</div>`}</div>`;
const rpSec = (label, right = '') => `<div class="sec-l"><span>${label}</span>${right ? `<span>${right}</span>` : ''}</div>`;
const rpNavBtn = (route, label, icon = 'fwd', gold = true) => `<button type="button" class="wbtn ${gold ? 'wbtn--gold' : ''}" data-a="nav" data-v="${route}">${label}${ico(icon)}</button>`;
const rpGoBtn = (v, label, icon, gold = false) => `<button type="button" class="wbtn ${gold ? 'wbtn--gold' : ''}" data-a="go" data-v="${v}">${ico(icon)}${label}</button>`;
const rpRos = (list) => `<div class="ros rp-ros">${list.join('')}</div>`;
/** The big count in a panel: a number, what it counts, and the date it hangs on. */
const rpDue = (n, word, kick, date, tone, pct = null) => `<div class="rp-due rp-due--${tone}"><div><b>${n}</b><span>${word}</span></div><div class="rp-due__r"><small>${kick}</small><b>${date}</b>${pct != null ? `<span class="rp-due__bar"><i style="width:${pct}%"></i></span>` : ''}</div></div>`;

/* ═══════════════ OVERVIEW · the office at a glance ═══════════════ */
const rpLaneTone = (l) => (l.none ? 'mute' : l.blocked ? 'bad' : l.att ? 'warn' : l.att === 0 ? 'ok' : 'mute');
const rpLaneWord = (l) => (l.none ? ['NO WORKSPACE YET', 'mute'] : l.blocked ? [`${l.blocked} BLOCKED`, 'bad'] : l.att ? [`${l.att} NEED ATTENTION`, 'warn'] : l.att === 0 ? ['NOTHING NEEDS ATTENTION', 'ok'] : ['NOT CONNECTED YET', 'mute']);
const rpInv = (i) => ov(`invoice:${i.id}`, i.status);
const rpQState = (q) => ov(`quarter:${q.id}`, q.bucket);
const rpDState = (d) => ov(`deadline:${d.id}`, d.state);
const rpLState = (l) => ov(`load:${l.id}`, l.status);
/** What each area counts, by status tone — the overview's ledger. */
const RP_TALLY = {
  clients: () => {
    const t = rpCount(vals(ACCOUNTS).map((c) => LIFE[c.life][1]));
    return { unit: 'CLIENTS', tones: t, head: [`${t.ok || 0} ACTIVE`, 'ok'] };
  },
  services: () => ({ unit: 'LANES', tones: rpCount(LANES.map(rpLaneTone)) }),
  financial_revenue: () => ({ unit: 'INVOICES', tones: rpCount(vals(INVOICES).map((i) => rpInv(i)[1])) }),
  filing_history: () => ({ unit: 'RETURNS', tones: rpCount(vals(QUARTERS).map((q) => rpQState(q)[1])) }),
  compliance: () => ({ unit: 'DEADLINES', tones: rpCount(vals(DUES).map((d) => rpDState(d)[1])) }),
  dispatch_brokerage: () => ({ unit: 'LOADS', tones: rpCount(vals(LOADS).map((l) => rpLState(l)[1])) }),
  bookkeeping: () => ({ unit: 'CLIENTS', tones: rpCount(vals(SUBSCRIPTIONS).map((s) => rpSubState(s)[1])) }),
  migration: () => ({ unit: 'CASES', tones: rpCount(vals(MIG_CASES).map((m) => migStatus(m)[1])) }),
  exports: () => {
    const t = rpCount(rpPkgs().map((p) => rpPkgState(p)[1]));
    return { unit: 'PACKAGES', tones: t, head: [`${(t.gold || 0) + (t.ok || 0)} READY`, 'gold'] };
  },
};
/** Everything that needs someone, across AIO: lane records, migration cases and (founder) invoices. */
function rpNeed() {
  const out = rpAll().filter((x) => ['bad', 'warn'].includes(x.s?.[1])).map((x) => ({ k: `r:${x.type}:${x.r.id}`, icon: OWNER_ICON[x.type], title: RECORD_TYPES[x.type].title(x.r), where: OWNER_LABEL[x.type], client: x.r.client, s: x.s, when: x.r.due || x.r.exp || x.r.delivery || '' }));
  for (const m of vals(MIG_CASES)) if (['bad', 'warn'].includes(migStatus(m)[1])) out.push({ k: `m:${m.id}`, icon: 'migrate', title: m.name, where: 'INTAKE · MIGRATION', client: m.client, s: migStatus(m), when: `STARTED ${m.started}` });
  if (FOUNDER) for (const i of vals(INVOICES)) if (['bad', 'warn'].includes(rpInv(i)[1])) out.push({ k: `i:${i.id}`, icon: 'summary', title: `${i.ref} · ${i.what}`, where: 'BILLING · FOUNDER', client: i.client, s: rpInv(i), when: i.date });
  return out.sort((a, b) => TONE_RANK[a.s[1]] - TONE_RANK[b.s[1]]);
}
/** What happened in the period, counted from dated records. */
function rpEvents() {
  const ev = [
    ['FILED', vals(QUARTERS).filter((q) => rpIn(rpFiledOn(q))).length, 'filing_history'],
    ['LOADS PICKED UP', vals(LOADS).filter((l) => rpIn(l.pickup)).length, 'dispatch_brokerage'],
    ['CASES OPENED', vals(MIG_CASES).filter((m) => rpIn(m.started)).length, 'migration'],
    ['DEADLINES DUE', vals(DUES).filter((d) => rpIn(d.due)).length, 'compliance'],
  ];
  if (FOUNDER) ev.push(['INVOICES DATED', vals(INVOICES).filter((i) => rpIn(i.date)).length, 'financial_revenue']);
  return ev;
}
/** The one mark that most needs someone in an area (the ledger's last column on ultra-wide). */
function rpTop(slug) {
  const first = (list, st) => [...list].sort((a, b) => TONE_RANK[st(a)[1]] - TONE_RANK[st(b)[1]])[0];
  if (slug === 'clients') { const c = first(vals(ACCOUNTS), (x) => [0, x.life === 'ACTIVE' ? 'ok' : 'gold']); return [c.name, [LIFE[c.life][0].split(' · ')[0], LIFE[c.life][1]]]; }
  if (slug === 'services') { const l = first(LANES, (x) => [0, rpLaneTone(x)]); return [l.name, rpLaneWord(l)]; }
  if (slug === 'financial_revenue') { const i = first(vals(INVOICES), rpInv); return [`${i.ref} · ${clientName(i.client)}`, rpInv(i)]; }
  if (slug === 'filing_history') { const q = first(vals(QUARTERS), rpQState); return [`${q.q} · ${clientName(q.client)}`, rpQState(q)]; }
  if (slug === 'compliance') { const d = [...vals(DUES)].sort((a, b) => a.days - b.days)[0]; return [d.what, rpDState(d)]; }
  if (slug === 'dispatch_brokerage') { const l = first(vals(LOADS), rpLState); return [`${l.ref} · ${l.lane}`, rpLState(l)]; }
  if (slug === 'bookkeeping') { const b = first(vals(SUBSCRIPTIONS), rpSubState); return [`${clientName(b.client)} · ${b.pkg}`, rpSubState(b)]; }
  if (slug === 'migration') { const m = first(vals(MIG_CASES), migStatus); return [m.name, migStatus(m)]; }
  const p = rpPkgs().find((x) => x.st === 'csv');
  return [p.t, rpPkgState(p)];
}
/** The records behind one area of the ledger, worst first. */
function rpBehind(slug) {
  if (slug === 'clients') return vals(ACCOUNTS).sort((a, b) => (a.life === 'ACTIVE') - (b.life === 'ACTIVE')).slice(0, 4).map((c) => rpLink({ a: 'go', v: `client:${c.id}`, lead: `<b>${c.b}</b>`, title: c.name, sub: `${c.lanes.length} SERVICES`, status: LIFE[c.life] }));
  if (slug === 'services') return LANES.filter((l) => l.blocked || l.att).sort((a, b) => (b.blocked || 0) - (a.blocked || 0) || (b.att || 0) - (a.att || 0)).slice(0, 4).map((l) => rpLink({ v: `work/${l.slug}`, lead: ico(l.icon), title: l.name, status: rpLaneWord(l) }));
  if (slug === 'financial_revenue') return vals(INVOICES).sort((a, b) => TONE_RANK[rpInv(a)[1]] - TONE_RANK[rpInv(b)[1]]).map((i) => rpLink({ v: `rec/invoice/${i.id}`, lead: ico('summary'), title: i.ref, sub: clientName(i.client), status: rpInv(i) }));
  if (slug === 'filing_history') return vals(QUARTERS).map((r) => ({ r, s: rpQState(r) })).sort(rpByTone).slice(0, 4).map(({ r }) => rpRecLink('quarter', r, `${clientName(r.client)} · ${r.q}`));
  if (slug === 'compliance') return vals(DUES).sort((a, b) => a.days - b.days).slice(0, 4).map((r) => rpRecLink('deadline', r));
  if (slug === 'dispatch_brokerage') return vals(LOADS).map((r) => ({ r, s: rpLState(r) })).sort(rpByTone).slice(0, 4).map(({ r }) => rpRecLink('load', r));
  if (slug === 'bookkeeping') return vals(SUBSCRIPTIONS).sort((a, b) => TONE_RANK[rpSubState(a)[1]] - TONE_RANK[rpSubState(b)[1]]).map((s) => rpLink({ v: `rec/subscription/${s.id}`, lead: ico('calculator'), title: clientName(s.client), sub: s.pkg, status: rpSubState(s) }));
  if (slug === 'migration') return vals(MIG_CASES).sort((a, b) => TONE_RANK[migStatus(a)[1]] - TONE_RANK[migStatus(b)[1]]).slice(0, 4).map((m) => rpLink({ v: `intake/case/${m.id}`, lead: ico('migrate'), title: m.name, sub: MIG_BRANCH[m.branch][0], status: migStatus(m) }));
  return [];
}
RP.overview = {
  def: () => {
    const score = (s) => {
      const t = RP_TALLY[s]().tones;
      return (t.bad || 0) * 10 + (t.warn || 0);
    };
    return `a:${rpShown().filter((a) => a.slug !== 'overview').map((a) => a.slug).sort((x, y) => score(y) - score(x))[0]}`;
  },
  ros: (m) => {
    const need = rpNeed().length;
    const r = [ro(need, 'NEED ACTION', { tone: need ? 'bad' : '' }), ro(vals(ACCOUNTS).filter((c) => c.life === 'ACTIVE').length, 'ACTIVE CLIENTS', { a: 'rp.area', v: 'clients' }), ro(vals(DUES).filter((d) => d.days <= 30).length, 'DUE IN 30 DAYS', { tone: 'warn', a: 'rp.area', v: 'compliance' })];
    return (m ? r : [...r, ro(rpEvents()[0][1], `FILED · ${WSX.rp.month}`, { a: 'rp.area', v: 'filing_history' })]).join('');
  },
  hero: () => {
    const rows = rpShown().filter((a) => a.slug !== 'overview').map((a) => {
      const t = RP_TALLY[a.slug]();
      const k = `a:${a.slug}`;
      return `<div class="rp-ld ${rpOn(k)}" ${rpBtn(k, a.label)}><span class="rp-ld__n">${ico(a.icon)}<b>${a.label}</b></span>${rpBar(t.tones, 'rp-ld__bar')}<span class="rp-ld__h">${sw(t.head ?? rpHead(t.tones))}<small>${rpSum(t.tones)} ${t.unit}</small></span>${rpWide() ? (() => { const [tt, ts] = rpTop(a.slug); return `<span class="rp-ld__top"><small>MOST URGENT</small><b>${tt}</b>${sw(ts)}</span>`; })() : ''}</div>`;
    }).join('');
    const ev = rpEvents();
    const aside = `<div class="rp-pe"><span class="rp-pe__k">${ico('calendar')}${rpMonth()}</span><span class="rp-pe__row">${ev.map(([l, n, slug]) => `<button type="button" class="rp-pe__i" data-a="rp.area" data-v="${slug}"><b>${n}</b><span>${l}</span></button>`).join('')}</span></div>`;
    const need = rpNeed().length;
    return rpStage('overview', { kick: 'ACROSS AIO · STATE ON OCT 8', fig: need, label: 'RECORDS NEED ACTION', aside }, `<div class="rp-ld-list">${rows}</div>${rpLegend(RP_TONES.map((t) => [t, RP_TONE_WORD[t]]))}`);
  },
  list: () => {
    const need = rpNeed();
    const rows = need.map((x) => rpRow(x.k, `<span class="rp-ic">${ico(x.icon)}</span><span class="rp-main"><b class="pk__t">${x.title}</b><span class="pk__s">${x.client ? `${clientName(x.client)} · ` : ''}${x.where}</span><span class="rp-mo">${sw(x.s)}</span></span><span class="rp-x rp-c">${x.when}</span><span class="rp-x">${sw(x.s)}</span>`, x.title));
    return rpList('NEEDS ACTION ACROSS AIO', `${need.length}`, '30px minmax(0,1fr) 150px 210px', '30px minmax(0,1fr)', [['', 0], ['RECORD', 0], ['WHEN', 1], ['STATUS', 1]], rows, 'NOTHING NEEDS ACTION');
  },
  panel: (k) => {
    const [kind, a, b] = k.split(':');
    if (kind === 'r') return rpRecPanel(a, b);
    if (kind === 'm') return RP.migration.panel(k);
    if (kind === 'i') return RP.financial_revenue.panel(k);
    const area = rpArea(a);
    const t = RP_TALLY[a]();
    const behind = rpBehind(a);
    const head = t.head ?? rpHead(t.tones);
    return rpPanel(area.label, rpPlate(ico(area.icon), `REPORT AREA · ${area.state[0]}`, area.label, head, `ov:${a}`), `${nextBlock(`${rpSum(t.tones)} ${t.unit} · ${head[0]}`, `<button type="button" class="wbtn wbtn--gold" data-a="rp.area" data-v="${a}">OPEN ${area.label}${ico('fwd')}</button>`, head[1] === 'ok' || head[1] === 'gold' ? 'calm' : '')}
      <div>${rpSec('BY STATUS')}${rpBar(t.tones, 'rp-sb--lg')}${facts(RP_TONES.filter((x) => t.tones[x]).map((x) => [RP_TONE_WORD[x], `${t.tones[x]} ${rpUnit(t.tones[x], t.unit)}`]))}</div>
      ${behind.length ? `<div>${rpSec('THE RECORDS BEHIND IT', `${behind.length} SHOWN`)}${rpRecs(behind)}</div>` : ''}`, `ov:${a}`);
  },
  side: () => {
    const ev = rpEvents();
    const max = Math.max(1, ...ev.map(([, n]) => n));
    return rpRegion('IN THE PERIOD', rpMonth(), '', `<div class="rp-hb">${ev.map(([l, n, slug]) => `<div class="rp-hb__r" data-a="rp.area" data-v="${slug}"><span>${l}</span><span class="rp-hb__t"><i style="width:${(n / max) * 100}%"></i></span><b>${n}</b></div>`).join('')}</div><div class="rp-sd__note">${ntb('COUNTED FROM DATED SAMPLE RECORDS · NO TRENDS UNTIL STATUS HISTORY IS READ')}</div>`, 'rp-sd', 'sd:overview');
  },
};
/** Any lane record, in brief: what it is, what it waits on, and the way into its department. */
function rpRecPanel(type, id) {
  const r = rec(type, id);
  const s = ov(`${type}:${id}`, statusWord(r));
  const wait = r.blocker || r.exception || r.question || null;
  const when = r.due ? ['DUE', r.due] : r.exp ? ['EXPIRES', r.exp] : r.delivery ? ['DELIVERY', r.delivery] : null;
  return rpPanel(OWNER_LABEL[type], rpPlate(ico(OWNER_ICON[type]), `${OWNER_LABEL[type]} · ${clientName(r.client)}`, RECORD_TYPES[type].title(r), s, `${type}:${id}`), `${nextBlock(wait || (when ? `${when[0]} ${when[1]}` : s?.[0] ?? ''), rpNavBtn(`rec/${type}/${id}`, `OPEN IN ${OWNER_LABEL[type]}`))}
    ${facts([['CLIENT', clientName(r.client)], when, r.owner ? ['OWNER', staffName(r.owner)] : null, ['STATUS', sw(s)]])}
    <div class="rp-links">${rpGoBtn(`client:${r.client}:${RECORD_TYPES[type].lane}`, 'CLIENT 360', 'company')}</div>`, `${type}:${id}`);
}

/* ═══════════════ CLIENTS · the lifecycle and the services each client uses ═══════════════ */
const rpOpenOf = (cid, all = rpAll()) => all.filter((x) => x.r.client === cid && ['bad', 'warn', 'gold'].includes(x.s?.[1]));
RP.clients = {
  def: () => 'c:c-abc',
  asOf: 'AS OF OCT 8, 2026',
  ros: (m) => {
    const all = vals(ACCOUNTS);
    const n = (l) => all.filter((c) => c.life === l).length;
    const r = [ro(all.length, 'CLIENTS'), ro(n('ACTIVE'), 'ACTIVE', { a: rpA(), v: 'life:ACTIVE', on: rpKey() === 'life:ACTIVE' }), ro(n('PREBUILT'), 'PREBUILT', { tone: 'gold', a: rpA(), v: 'life:PREBUILT', on: rpKey() === 'life:PREBUILT' }), ro(n('INVITED'), 'INVITED', { tone: 'gold', a: rpA(), v: 'life:INVITED', on: rpKey() === 'life:INVITED' })];
    return (m ? r.slice(1) : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const all = vals(ACCOUNTS);
    const recs = rpAll();
    const life = ['ACTIVE', 'PREBUILT', 'INVITED'].map((l) => [l, all.filter((c) => c.life === l).length]);
    const aside = `<div class="rp-life"><span class="rp-life__bar" aria-hidden="true">${life.map(([l, n]) => `<i class="rp-f--${LIFE[l][1]}" style="flex:${n} 0 0"></i>`).join('')}</span><span class="rp-life__keys">${life.map(([l, n]) => `<button type="button" class="rp-key ${rpOn(`life:${l}`)}" ${rpBtn(`life:${l}`)}><i class="rp-sq rp-f--${LIFE[l][1]}"></i><b>${n}</b>${l}</button>`).join('')}</span></div>`;
    const col = k.startsWith('l:') ? k.slice(2) : null;
    const lifeOn = k.startsWith('life:') ? k.slice(5) : null;
    const head = `<div class="rp-mx__h"><span class="rp-mx__cap">CLIENT</span>${LANES.map((l) => `<button type="button" class="rp-mx__lh ${col === l.slug ? 'is-on' : ''}" ${rpBtn(`l:${l.slug}`, l.name)} title="${l.name}">${ico(l.icon)}<span>${SVC_SHORT[l.slug]}</span></button>`).join('')}<span class="rp-mx__cap rp-mx__cap--r">USES</span></div>`;
    const rows = all.map((c) => {
      const cells = LANES.map((l) => {
        if (!c.lanes.includes(l.slug)) return `<i class="rp-mx__d rp-mx__d--off ${col === l.slug ? 'is-col' : ''}"></i>`;
        const open = recs.filter((x) => x.r.client === c.id && x.lane === l.slug && ['bad', 'warn', 'gold'].includes(x.s?.[1]));
        return `<i class="rp-mx__d rp-mx__d--${open.length ? rpWorst(open.map((x) => x.s[1])) : 'on'} ${col === l.slug ? 'is-col' : ''}"></i>`;
      }).join('');
      const kk = `c:${c.id}`;
      return `<div class="rp-mx__r ${rpOn(kk)} ${lifeOn === c.life ? 'is-life' : ''}" ${rpBtn(kk, `${c.name} · ${c.lanes.length} SERVICES`)}><span class="rp-mx__who">${rpBadge(c.id)}<b>${c.name}</b></span>${cells}<b class="rp-mx__n">${c.lanes.length}</b></div>`;
    }).join('');
    const foot = `<div class="rp-mx__f"><span class="rp-mx__cap">CLIENTS USING IT</span>${LANES.map((l) => `<b class="${col === l.slug ? 'is-on' : ''}">${all.filter((c) => c.lanes.includes(l.slug)).length}</b>`).join('')}<span></span></div>`;
    return rpStage('clients', { kick: 'LIFECYCLE · SERVICES PER CLIENT', fig: life[0][1], of: `OF ${all.length}`, label: 'ACTIVE BY THE ACTIVE-CLIENT RULE', aside }, `<div class="rp-mx">${head}${rows}${foot}</div>${rpLegend([['hollow', 'USES AIO · NOTHING OPEN'], ['gold', 'IN PROGRESS'], ['warn', 'AT RISK'], ['bad', 'BLOCKED · LATE'], ['off', 'NOT USED']])}`);
  },
  list: () => {
    const all = vals(ACCOUNTS);
    const recs = rpAll();
    const rows = ['ACTIVE', 'PREBUILT', 'INVITED'].map((l) => {
      const list = all.filter((c) => c.life === l);
      return list.length ? `${rpGrp(LIFE[l][0], list.length)}${list.map((c) => rpRow(`c:${c.id}`, `${rpBadge(c.id)}<span class="rp-main"><b class="pk__t">${c.name}</b><span class="pk__s">${c.state} · ${CLIENT_META[c.id].since}</span></span><span class="rp-num">${c.lanes.length}<small>/12</small></span><span class="rp-num rp-x">${rpOpenOf(c.id, recs).length}</span><span class="rp-num rp-x">${c.trucks}</span><span class="rp-x">${sw([LIFE[c.life][0].split(' · ')[0], LIFE[c.life][1]])}</span>`, c.name)).join('')}` : '';
    });
    return rpList('CLIENTS BY LIFECYCLE', `${all.length}`, '30px minmax(0,1fr) 70px 60px 60px 110px', '30px minmax(0,1fr) 56px', [['', 0], ['CLIENT', 0], ['SERVICES', 0], ['OPEN', 1], ['TRUCKS', 1], ['LIFECYCLE', 1]], rows);
  },
  panel: (k) => {
    const [kind, id] = [k.split(':')[0], k.slice(k.indexOf(':') + 1)];
    const all = vals(ACCOUNTS);
    if (kind === 'l') {
      const l = laneBySlug(id);
      const users = all.filter((c) => c.lanes.includes(id));
      const open = l.slug === 'vehicles' ? rpGoBtn('fleet:v-tk-09', 'OPEN VEHICLES & FLEET', 'truck', true) : rpNavBtn(`work/${l.slug}`, `OPEN ${SVC_SHORT[l.slug]}`);
      return rpPanel(SVC_SHORT[id], rpPlate(ico(l.icon), `SERVICE ${l.n}`, l.name, [`${users.length} OF ${all.length} CLIENTS`, users.length ? 'gold' : 'mute'], `l:${id}`), `${nextBlock(`${users.length} CLIENT${users.length === 1 ? '' : 'S'} USE ${SVC_SHORT[id]}`, open, 'calm')}<div>${rpSec('CLIENTS USING IT', `${users.length}`)}${rpRecs(users.map((c) => rpLink({ a: 'go', v: `client:${c.id}${l.slug === 'vehicles' ? '' : `:${l.slug}`}`, lead: `<b>${c.b}</b>`, title: c.name, sub: `${c.state} · ${c.lanes.length} SERVICES`, status: [LIFE[c.life][0].split(' · ')[0], LIFE[c.life][1]] })), 'NO CLIENT USES IT YET')}</div>`, k);
    }
    if (kind === 'life') {
      const list = all.filter((c) => c.life === id);
      return rpPanel(id, rpPlate(ico('people'), 'LIFECYCLE', LIFE[id][0], [`${list.length} CLIENT${list.length === 1 ? '' : 'S'}`, LIFE[id][1]], k), `${nextBlock(id === 'ACTIVE' ? 'CONFIRMED BY THE CLIENT' : 'NEVER COUNTS AS ACTIVE', '', 'calm')}<div>${rpSec('CLIENTS', `${list.length}`)}${rpRecs(list.map((c) => rpPickLink(`c:${c.id}`, `<b>${c.b}</b>`, c.name, `${c.state} · ${c.lanes.length} SERVICES`)))}</div>${id === 'ACTIVE' ? '' : ntb('ONLY THE CLIENT’S CONFIRMATION MAKES A CLIENT ACTIVE')}`, k);
    }
    const c = ACCOUNTS[id];
    const open = rpOpenOf(id).sort(rpByTone);
    const life = [LIFE[c.life][0].split(' · ')[0], LIFE[c.life][1]];
    const chips = c.lanes.map((s) => laneBySlug(s)).sort((a, b) => a.n.localeCompare(b.n)).map((l) => `<button type="button" class="rp-chip" data-a="go" data-v="client:${c.id}${l.slug === 'vehicles' ? '' : `:${l.slug}`}" title="${l.name} · CLIENT 360">${ico(l.icon)}${SVC_SHORT[l.slug]}</button>`).join('');
    return rpPanel(c.b, rpPlate(`<b>${c.b}</b>`, `${c.dot} · ${c.state}`, c.name, life, `c:${id}`), `${nextBlock(c.life === 'ACTIVE' ? (open.length ? `${open.length} OPEN RECORD${open.length === 1 ? '' : 'S'}` : 'NOTHING OPEN') : LIFE[c.life][0], rpGoBtn(`client:${id}`, 'OPEN IN CLIENT 360', 'company', true), c.life === 'ACTIVE' ? '' : 'calm')}
      ${rpRos([ro(`${c.lanes.length}`, 'OF 12 SERVICES'), ro(open.length, 'OPEN', { tone: open.length ? 'gold' : '' }), ro(c.trucks, 'TRUCKS')])}
      <div>${rpSec('SERVICES', `${c.lanes.length}`)}<div class="rp-chips">${chips}</div></div>
      <div>${rpSec('OPEN RECORDS', `${open.length}`)}${rpRecs(open.slice(0, 5).map((x) => rpRecLink(x.type, x.r, OWNER_LABEL[x.type])), 'NOTHING OPEN')}</div>
      ${c.life === 'ACTIVE' ? '' : ntb('PREBUILT AND INVITED NEVER COUNT AS ACTIVE')}`, `c:${id}`);
  },
  side: () => {
    const all = vals(ACCOUNTS);
    const rows = LANES.map((l) => [l, all.filter((c) => c.lanes.includes(l.slug)).length]).sort((a, b) => b[1] - a[1]);
    return rpRegion('CLIENTS PER SERVICE', `OF ${all.length}`, '', `<div class="rp-hb">${rows.map(([l, n]) => `<div class="rp-hb__r ${rpOn(`l:${l.slug}`)}" ${rpBtn(`l:${l.slug}`, l.name)}><span>${ico(l.icon)}${SVC_SHORT[l.slug]}</span><span class="rp-hb__t"><i style="width:${(n / all.length) * 100}%"></i></span><b>${n}</b></div>`).join('')}</div><div class="rp-sd__note">${ntb('CLIENT GROWTH IS NOT CONNECTED YET · NO PERCENTAGES')}</div>`, 'rp-sd', 'sd:clients');
  },
};

/* ═══════════════ SERVICES · twelve lanes, as each lane reports itself ═══════════════ */
const RP_ACTIVATION = { permitting: 'PERMITTING', filing: 'FUEL TAX (IFTA)', dispatch: 'DISPATCHING', brokerage: 'BROKERAGE', factoring: 'FACTORING (PARTNER)', insurance: 'INSURANCE (REFERRAL)', bookkeeping: 'BOOKKEEPING', roadready: 'AUTHORITY SERVICES' };
const rpActivation = (slug) => SERVICES.find((s) => s[0] === RP_ACTIVATION[slug]) ?? null;
RP.services = {
  def: () => 'l:filing',
  asOf: 'AS OF OCT 8, 2026',
  ros: (m) => {
    const sum = (f) => LANES.reduce((n, l) => n + (l[f] || 0), 0);
    const r = [ro(sum('active'), 'ACTIVE WORK'), ro(sum('att'), 'NEED ATTENTION', { tone: 'warn' }), ro(sum('blocked'), 'BLOCKED', { tone: 'bad' }), ro(LANES.filter((l) => l.none || l.active == null).length, 'WITHOUT FIGURES')];
    return (m ? r.slice(0, 3) : r).join('');
  },
  hero: () => {
    const max = 15;
    const sum = (f) => LANES.reduce((n, l) => n + (l[f] || 0), 0);
    const grid = `<div class="rp-cols__grid" aria-hidden="true">${[0, 5, 10, 15].map((v) => `<i style="bottom:${(v / max) * 100}%"><span>${v}</span></i>`).join('')}</div>`;
    const cols = LANES.map((l) => {
      const k = `l:${l.slug}`;
      const none = l.none || l.active == null;
      return `<div class="rp-col ${rpOn(k)} ${none ? 'rp-col--none' : ''}" ${rpBtn(k, `${l.name} · ${none ? rpLaneWord(l)[0] : `${l.active} ACTIVE`}`)}><span class="rp-col__plot"><i class="rp-col__bar" style="height:${none ? 100 : (l.active / max) * 100}%">${none ? '' : `<em>${l.active}</em>`}</i></span><span class="rp-col__sig">${l.att ? `<b class="rp-sig rp-sig--warn">${l.att}</b>` : ''}${l.blocked ? `<b class="rp-sig rp-sig--bad">${l.blocked}</b>` : ''}</span><span class="rp-col__no">${l.n}</span><span class="rp-col__nm">${SVC_SHORT[l.slug]}</span></div>`;
    }).join('');
    return rpStage('services', { kick: 'ACTIVE WORK BY LANE · AS EACH LANE REPORTS IT', fig: sum('active'), label: 'ACTIVE WORK ACROSS TEN LANES', aside: rpLegend([['ivory', 'ACTIVE WORK'], ['warn', 'NEED ATTENTION'], ['bad', 'BLOCKED'], ['none', 'NOT CONNECTED']]) }, `<div class="rp-cols">${grid}${cols}</div>`);
  },
  list: () => {
    const recs = rpAll();
    const rows = LANES.map((l) => rpRow(`l:${l.slug}`, `<span class="rp-no">${l.n}</span><span class="rp-main rp-main--i">${ico(l.icon)}<span><b class="pk__t">${l.name}</b><span class="rp-mo">${sw(rpLaneWord(l))}</span></span></span><span class="rp-num">${l.none || l.active == null ? '—' : l.active}</span><span class="rp-num rp-num--warn">${l.att ?? '—'}</span><span class="rp-num rp-num--bad rp-x">${l.blocked ?? 0}</span><span class="rp-num rp-x">${recs.filter((x) => x.lane === l.slug).length}</span><span class="rp-x">${sw(rpLaneWord(l))}</span>`, l.name));
    return rpList('THE TWELVE LANES', 'SAMPLE SIGNALS', '30px minmax(0,1fr) 62px 76px 64px 64px 170px', '26px minmax(0,1fr) 50px 50px', [['#', 0], ['LANE', 0], ['ACTIVE', 0], ['ATTENTION', 0], ['BLOCKED', 1], ['RECORDS', 1], ['SIGNAL', 1]], rows);
  },
  panel: (k) => {
    const l = laneBySlug(k.slice(2));
    const recs = rpAll().filter((x) => x.lane === l.slug).sort(rpByTone);
    const act = rpActivation(l.slug);
    const users = vals(ACCOUNTS).filter((c) => c.lanes.includes(l.slug)).length;
    const none = l.none || l.active == null;
    const open = l.slug === 'vehicles' ? rpGoBtn('fleet:v-tk-09', 'OPEN VEHICLES & FLEET', 'truck', true) : rpNavBtn(`work/${l.slug}`, `OPEN ${SVC_SHORT[l.slug]}`);
    return rpPanel(SVC_SHORT[l.slug], rpPlate(ico(l.icon), `LANE ${l.n}`, l.name, rpLaneWord(l), k), `${nextBlock(l.blocked ? `${l.blocked} BLOCKED · ${l.att ?? 0} NEED ATTENTION` : l.att ? `${l.att} NEED ATTENTION` : rpLaneWord(l)[0], open, l.blocked || l.att ? '' : 'calm')}
      ${rpRos([ro(none ? '—' : l.active, 'ACTIVE WORK'), ro(l.att ?? '—', 'ATTENTION', { tone: l.att ? 'warn' : '' }), ro(l.blocked ?? 0, 'BLOCKED', { tone: l.blocked ? 'bad' : '' })])}
      ${facts([act ? ['ACTIVATION', sw([act[1], act[2]]), act[3]] : null, ['CLIENTS USING IT', `${users} OF ${vals(ACCOUNTS).length}`]])}
      <div>${rpSec('RECORDS IN THIS REVIEW', `${recs.length}`)}${rpRecs(recs.slice(0, 5).map((x) => rpRecLink(x.type, x.r)), l.slug === 'vehicles' ? 'TRUCKS ARE REPORTED IN FLEET' : 'NO SAMPLE RECORDS IN THIS LANE')}</div>
      ${ntb(none ? 'ACTIVE WORK IS NOT CONNECTED FOR THIS LANE YET' : 'COUNTS ARE THE LANE’S OWN SIGNALS · NO TRENDS YET')}`, k);
  },
  side: () => {
    const recs = rpAll();
    return rpRegion('RECORDS IN THIS REVIEW', 'BY LANE', '', `<div class="rp-hb rp-hb--tone">${LANES.map((l) => {
      const mine = recs.filter((x) => x.lane === l.slug);
      return `<div class="rp-hb__r ${rpOn(`l:${l.slug}`)}" ${rpBtn(`l:${l.slug}`, l.name)}><span>${ico(l.icon)}${SVC_SHORT[l.slug]}</span>${mine.length ? rpBar(rpCount(mine.map((x) => x.s?.[1] ?? 'mute')), 'rp-sb--ink') : '<span class="rp-hb__none">—</span>'}<b>${mine.length}</b></div>`;
    }).join('')}</div>`, 'rp-sd', 'sd:services');
  },
};

/* ═══════════════ FINANCIAL / REVENUE · founder only, invoice statuses only ═══════════════ */
const RP_INV = [['DRAFT', 'mute'], ['SENT', 'gold'], ['PAID', 'ok'], ['PAST DUE', 'bad']];
RP.financial_revenue = {
  def: () => 'i:inv-3305',
  ros: (m) => {
    const all = vals(INVOICES);
    const n = (w) => all.filter((i) => rpInv(i)[0] === w).length;
    const r = [ro(all.length, 'INVOICES'), ro(n('PAST DUE'), 'PAST DUE', { tone: 'bad', a: rpA(), v: 'st:PAST DUE', on: rpKey() === 'st:PAST DUE' }), ro(n('SENT'), 'SENT', { tone: 'gold', a: rpA(), v: 'st:SENT', on: rpKey() === 'st:SENT' }), ro(all.filter((i) => rpIn(i.date)).length, `DATED · ${WSX.rp.month}`)];
    return (m ? r.slice(0, 3) : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const all = vals(INVOICES);
    const stations = RP_INV.map(([w, tone]) => {
      const list = all.filter((i) => rpInv(i)[0] === w);
      const sk = `st:${w}`;
      return `<div class="rp-fs rp-fs--${tone} ${rpOn(sk)}"><button type="button" class="rp-fs__n" ${rpBtn(sk, `${list.length} ${w}`)}><i class="rp-sq rp-f--${tone}"></i><b>${list.length}</b><span>${w}</span></button><div class="rp-fs__tk">${list.map((i) => `<button type="button" class="rp-tk ${k === `i:${i.id}` ? 'is-on' : ''} ${rpIn(i.date) ? '' : 'is-dim'}" ${rpBtn(`i:${i.id}`, `${i.ref} · ${clientName(i.client)}`)}><b>${i.ref.replace('INVOICE ', '')}</b><span>${ACCOUNTS[i.client].b}</span><em>${i.what}</em><small>${i.date === '—' ? 'NOT DATED' : i.date.replace(', 2026', '')}</small></button>`).join('') || '<span class="rp-fs__none">NONE</span>'}</div></div>`;
    }).join('');
    const ghost = `<div class="rp-gh"><span class="rp-gh__l">${ico('lock')}REVENUE FIGURES · NOT CONNECTED YET</span>${['COLLECTED', 'BY SERVICE', 'AGING', 'BALANCES'].map((f) => `<span class="rp-gh__f">${f}</span>`).join('')}</div>`;
    return rpStage('financial_revenue', { kick: 'FOUNDER · FINANCE ONLY · SAMPLE INVOICES', fig: all.length, label: 'INVOICES BY STATUS', aside: `<span class="rp-tag">${ico('lock')}NO TOTALS · NEVER ESTIMATED</span><span class="rp-tag rp-tag--per">DATED IN ${WSX.rp.month} 2026 · ${all.filter((i) => rpIn(i.date)).length}</span>` }, `<div class="rp-fin"><span class="rp-fin__ex" aria-hidden="true"><em>NOT PAID BY THE DUE DATE</em></span>${stations}</div>${ghost}`);
  },
  list: () => {
    const rows = vals(INVOICES).sort((a, b) => TONE_RANK[rpInv(a)[1]] - TONE_RANK[rpInv(b)[1]]).map((i) => rpRow(`i:${i.id}`, `${rpBadge(i.client)}<span class="rp-main"><b class="pk__t">${i.ref}</b><span class="pk__s">${i.what}</span><span class="rp-mo">${sw(rpInv(i))}</span></span><span class="rp-x rp-c">${clientName(i.client)}</span><span class="rp-c">${i.date === '—' ? 'NOT DATED' : i.date.replace(', 2026', '')}</span><span class="rp-x">${sw(rpInv(i))}</span>`, `${i.ref} · ${i.what}`));
    return rpList('SAMPLE INVOICES', 'STATUSES ONLY', '30px minmax(0,1fr) 170px 80px 110px', '30px minmax(0,1fr) 70px', [['', 0], ['INVOICE', 0], ['CLIENT', 1], ['DATE', 0], ['STATUS', 1]], rows);
  },
  panel: (k) => {
    if (k.startsWith('st:')) {
      const w = k.slice(3);
      const list = vals(INVOICES).filter((i) => rpInv(i)[0] === w);
      return rpPanel(w, rpPlate(ico('summary'), 'INVOICES BY STATUS', w, [`${list.length} INVOICE${list.length === 1 ? '' : 'S'}`, RP_INV.find(([x]) => x === w)[1]], k), `<div>${rpSec('INVOICES', `${list.length}`)}${rpRecs(list.map((i) => rpPickLink(`i:${i.id}`, ico('summary'), i.ref, `${clientName(i.client)} · ${i.date}`)), 'NO INVOICE HAS THIS STATUS')}</div>${ntb('AMOUNTS, TOTALS AND BALANCES ARE NOT CONNECTED')}`, k);
    }
    const i = INVOICES[k.slice(2)];
    const s = rpInv(i);
    const rec = `invoice:${i.id}`;
    const next = s[0] === 'PAST DUE'
      ? nextBlock('PAYMENT IS PAST DUE', simBtn(`rp:inv:${i.id}`, { label: 'SEND REMINDER', effect: 'EMAILS A PAYMENT REMINDER. NO CHARGE IS MADE.', apply: () => {}, rec, primary: true, founder: true }))
      : s[0] === 'DRAFT'
        ? nextBlock('NOT SENT TO THE CLIENT YET', simBtn(`rp:inv:${i.id}`, { label: 'SEND INVOICE', effect: 'EMAILS THE INVOICE TO THE CLIENT. NO CHARGE IS MADE.', apply: () => (WSX.over[rec] = ['SENT', 'gold']), rec, primary: true, founder: true }))
        : nextBlock(s[0] === 'PAID' ? 'PAID' : 'AWAITING PAYMENT', '', s[0] === 'PAID' ? 'done' : 'calm');
    return rpPanel(i.ref, rpPlate(ico('summary'), `INVOICE · ${clientName(i.client)}`, i.ref, s, k), `${next}
      ${facts([['FOR', i.what], ['CLIENT', clientName(i.client)], ['DATE', i.date === '—' ? 'NOT DATED' : i.date], ['STATUS', sw(s)]])}
      <div class="rp-links">${rpNavBtn(`rec/invoice/${i.id}`, i.ref, 'fwd', false)}<button type="button" class="wbtn" data-a="nav" data-v="client/${i.client}/billing">${ico('company')}CLIENT 360 · BILLING</button></div>
      ${mhist(rec, [[i.date === '—' ? 'DRAFT' : i.date, `INVOICE ${s[0]}`]])}${ntb('AMOUNTS, TOTALS AND BALANCES ARE NOT CONNECTED')}`, k);
  },
  side: () => rpRegion('WHAT IS NOT CONNECTED', 'FOUNDER · FINANCE', '', `<div class="rp-sd__ghost">${['COLLECTED REVENUE', 'REVENUE BY SERVICE', 'RECEIVABLES AGING', 'BALANCES', 'MARGINS'].map((f) => `<span>${f}</span>`).join('')}</div><div class="rp-sd__note">${ntb('FIGURES COME ONLY FROM COLLECTED PAYMENTS · NEVER ESTIMATED')}</div>`, 'rp-sd', 'sd:fin'),
};

/* ═══════════════ FILING HISTORY · returns filed, quarter by quarter ═══════════════ */
const rpFiledOn = (q) => {
  if (!['FILED', 'COMPLETE'].includes(rpQState(q)[0])) return null;
  const m = /FILED (\w{3} \d{1,2})/.exec(q.next);
  return m ? `${m[1]}, 2026` : null;
};
/** The filing windows the sample holds: each quarter, the month it is due in. */
const rpWindows = () => [...new Set(vals(QUARTERS).map((q) => q.q))].sort().map((q) => {
  const due = vals(QUARTERS).find((x) => x.q === q).due;
  return { q, due, mon: rpDate(due).m, list: vals(QUARTERS).filter((x) => x.q === q) };
});
RP.filing_history = {
  def: () => 'q:ifta-hf-q3',
  ros: (m) => {
    const all = vals(QUARTERS);
    const filed = all.filter(rpFiledOn);
    const onTime = filed.filter((q) => rpDate(rpFiledOn(q)).n <= rpDate(q.due).n).length;
    const r = [ro(filed.filter((q) => rpIn(rpFiledOn(q))).length, `FILED · ${WSX.rp.month}`, { tone: 'gold' }), ro(filed.length, 'RETURNS FILED'), ro(`${onTime}/${filed.length}`, 'ON TIME'), ro(all.length - filed.length, 'OPEN', { tone: 'warn' })];
    return (m ? [r[0], r[1], r[3]] : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const x = (d) => (((d - 0.5) / 31) * 100).toFixed(2);
    const today = rpDate(TODAY);
    const wins = rpWindows().map((w) => {
      const filed = w.list.filter(rpFiledOn).sort((a, b) => rpDate(rpFiledOn(a)).n - rpDate(rpFiledOn(b)).n);
      const open = w.list.filter((q) => !rpFiledOn(q)).sort((a, b) => TONE_RANK[rpQState(a)[1]] - TONE_RANK[rpQState(b)[1]]);
      const tday = today.m === w.mon ? today.d : null;
      const due = rpDate(w.due).d;
      // one row per return: where it stands in the window, and how far it is from the due date
      const row = (q) => {
        const f = rpFiledOn(q);
        const s = rpQState(q);
        const d = f ? rpDate(f).d : tday ?? 1;
        const gap = due - d;
        const word = f ? `${gap} DAY${gap === 1 ? '' : 'S'} BEFORE DUE` : `${s[0]} · ${gap} DAYS LEFT`;
        return `<div class="rp-fr ${f ? 'rp-fr--filed' : `rp-fr--open rp-fr--${s[1]}`} ${k === `q:${q.id}` ? 'is-on' : ''} ${f && rpIn(f) ? 'is-per' : ''}" ${rpBtn(`q:${q.id}`, `${w.q} · ${clientName(q.client)} · ${f ? `FILED ${f}` : s[0]}`)}><span class="rp-fr__l">${rpBadge(q.client)}</span><span class="rp-fr__t"><i class="rp-fr__s" style="left:${x(d)}%"></i><i class="rp-fr__m" style="left:${x(d)}%"></i><em style="left:${x(d)}%">${word}</em></span></div>`;
      };
      const per = w.mon === WSX.rp.month;
      const wk = `w:${w.q}`;
      return `<div class="rp-fw ${per ? 'is-per' : ''} ${rpOn(wk)}">
        <button type="button" class="rp-fw__h" ${rpBtn(wk, `${w.q} · ${filed.length} FILED`)}><b>${w.q}</b><span>WINDOW · ${w.mon} 1–31</span><em>${filed.length} FILED${open.length ? ` · ${open.length} OPEN` : ''}</em></button>
        <div class="rp-fw__plot">
          <div class="rp-fw__rows">${filed.length ? `<span class="rp-fr__g">FILED</span>${filed.map(row).join('')}` : ''}${open.length ? `<span class="rp-fr__g">OPEN</span>${open.map(row).join('')}` : ''}</div>
          <div class="rp-fw__ax"><span class="rp-fw__lab"></span><div class="rp-fw__trk">${[1, 8, 15, 22].map((d) => `<span style="left:${x(d)}%">${w.mon} ${d}</span>`).join('')}</div></div>
          <div class="rp-fw__over"><span class="rp-fw__lab"></span><div class="rp-fw__trk">${tday ? `<i class="rp-fw__today" style="left:${x(tday)}%"><span>TODAY</span></i>` : ''}<i class="rp-fw__dl"><span>DUE ${w.due.replace(', 2026', '')}</span></i></div></div>
        </div>
      </div>`;
    }).join('');
    const all = vals(QUARTERS);
    const filed = all.filter(rpFiledOn);
    const onTime = filed.filter((q) => rpDate(rpFiledOn(q)).n <= rpDate(q.due).n).length;
    const r = [ro(filed.filter((q) => rpIn(rpFiledOn(q))).length, `FILED · ${WSX.rp.month}`, { tone: 'gold' }), ro(filed.length, 'RETURNS FILED'), ro(`${onTime}/${filed.length}`, 'ON TIME'), ro(all.length - filed.length, 'OPEN', { tone: 'warn' })];
    return (m ? [r[0], r[1], r[3]] : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const trackW = { mobile: 260, tablet: 300, desktop: 300, wide: 620 }[VP === 'desktop' && rpWide() ? 'wide' : VP];
    const step = (36 / trackW) * 31;
    const x = (d) => (((d - 0.5) / 31) * 100).toFixed(2);
    const wins = rpWindows().map((w) => {
      const filed = w.list.filter(rpFiledOn).sort((a, b) => rpDate(rpFiledOn(a)).n - rpDate(rpFiledOn(b)).n);
      const open = w.list.filter((q) => !rpFiledOn(q)).sort((a, b) => TONE_RANK[rpQState(a)[1]] - TONE_RANK[rpQState(b)[1]]);
      const ends = [];
      const tok = filed.map((q) => {
        const d = rpDate(rpFiledOn(q)).d;
        let lv = ends.findIndex((e) => d - e >= step);
        if (lv < 0) lv = ends.length;
        ends[lv] = d;
        return `<button type="button" class="rp-ft ${k === `q:${q.id}` ? 'is-on' : ''} ${rpIn(rpFiledOn(q)) ? 'is-per' : ''}" style="left:${x(d)}%;bottom:${lv * 26}px" ${rpBtn(`q:${q.id}`, `${clientName(q.client)} · FILED ${rpFiledOn(q)}`)}>${ACCOUNTS[q.client].b}</button>`;
      }).join('');
      const today = rpDate(TODAY);
      const tday = today.m === w.mon ? today.d : null;
      const otok = open.map((q, i) => `<button type="button" class="rp-ft rp-ft--open rp-ft--${rpQState(q)[1]} ${k === `q:${q.id}` ? 'is-on' : ''}" style="left:${x(tday ?? 1)}%;bottom:${i * 26}px" ${rpBtn(`q:${q.id}`, `${clientName(q.client)} · ${rpQState(q)[0]}`)}>${ACCOUNTS[q.client].b}</button>`).join('');
      const per = w.mon === WSX.rp.month;
      const wk = `w:${w.q}`;
      return `<div class="rp-fw ${per ? 'is-per' : ''} ${rpOn(wk)}">
        <button type="button" class="rp-fw__h" ${rpBtn(wk, `${w.q} · ${filed.length} FILED`)}><b>${w.q}</b><span>WINDOW · ${w.mon} 1–31</span><em>${filed.length} FILED${open.length ? ` · ${open.length} OPEN` : ''}</em></button>
        <div class="rp-fw__plot">
          <div class="rp-fw__ln"><span class="rp-fw__lab">FILED</span><div class="rp-fw__trk">${tok}</div></div>
          <div class="rp-fw__ln rp-fw__ln--open"><span class="rp-fw__lab">OPEN</span><div class="rp-fw__trk">${otok || '<span class="rp-fw__none">NONE</span>'}</div></div>
          <div class="rp-fw__ax"><span class="rp-fw__lab"></span><div class="rp-fw__trk">${[1, 8, 15, 22].map((d) => `<span style="left:${x(d)}%">${w.mon} ${d}</span>`).join('')}</div></div>
          <div class="rp-fw__over"><span class="rp-fw__lab"></span><div class="rp-fw__trk">${tday ? `<i class="rp-fw__today" style="left:${x(tday)}%"><span>TODAY</span></i>` : ''}<i class="rp-fw__dl"><span>DUE ${w.due.replace(', 2026', '')}</span></i></div></div>
        </div>
      </div>`;
    }).join('');
    const all = vals(QUARTERS);
    const filed = all.filter(rpFiledOn);
    const onTime = filed.filter((q) => rpDate(rpFiledOn(q)).n <= rpDate(q.due).n).length;
    const inMonth = filed.filter((q) => rpIn(rpFiledOn(q))).length;
    return rpStage('filing_history', { kick: `IFTA RETURNS · FILED · ${rpMonth()}`, fig: inMonth, of: `OF ${filed.length}`, label: inMonth ? `FILED IN ${RP_MONTH_NAME[WSX.rp.month]}` : `NOTHING FILED IN ${RP_MONTH_NAME[WSX.rp.month]}`, aside: `${rpLegend([['ivory', 'FILED · DAYS BEFORE DUE'], ['open', 'OPEN · DAYS LEFT']])}<span class="rp-tag">${onTime} OF ${filed.length} FILED BEFORE THE DUE DATE</span>` }, `<div class="rp-fws">${wins}</div>`);
  },
  list: () => {
    const all = vals(QUARTERS);
    const filed = all.filter(rpFiledOn).sort((a, b) => rpDate(rpFiledOn(b)).n - rpDate(rpFiledOn(a)).n);
    const open = all.filter((q) => !rpFiledOn(q)).sort((a, b) => TONE_RANK[rpQState(a)[1]] - TONE_RANK[rpQState(b)[1]]);
    const row = (q) => {
      const f = rpFiledOn(q);
      const sub = f ? `IFTA · FILED ${rpDate(f).n <= rpDate(q.due).n ? 'ON TIME' : 'LATE'}` : q.next;
      return rpRow(`q:${q.id}`, `${rpBadge(q.client)}<span class="rp-main"><b class="pk__t">${q.q} · ${clientName(q.client)}</b><span class="pk__s">${sub}</span><span class="rp-mo">${sw(rpQState(q))}</span></span><span class="rp-c">${f ? f.replace(', 2026', '') : '—'}</span><span class="rp-c rp-x">${q.due.replace(', 2026', '')}</span><span class="rp-x">${av(q.owner)}</span><span class="rp-x">${sw(rpQState(q))}</span>`, `${q.q} · ${clientName(q.client)}`);
    };
    return rpList('RETURNS · NEWEST FIRST', `${all.length}`, '30px minmax(0,1fr) 70px 70px 40px 130px', '30px minmax(0,1fr) 54px', [['', 0], ['RETURN', 0], ['FILED ON', 0], ['DUE', 1], ['OWNER', 1], ['STATUS', 1]], [rpGrp('FILED', filed.length), ...filed.map(row), rpGrp('OPEN', open.length), ...open.map(row)]);
  },
  panel: (k) => {
    if (k.startsWith('w:')) {
      const w = rpWindows().find((x) => x.q === k.slice(2));
      const filed = w.list.filter(rpFiledOn);
      return rpPanel(w.q, rpPlate(ico('fuel'), `IFTA · DUE ${w.due}`, `${w.q} RETURNS`, [`${filed.length} FILED`, 'ok'], k), `${nextBlock(`${filed.length} FILED · ${w.list.length - filed.length} OPEN`, '', 'calm')}<div>${rpSec('RETURNS', `${w.list.length}`)}${rpRecs(w.list.map((q) => rpPickLink(`q:${q.id}`, `<b>${ACCOUNTS[q.client].b}</b>`, clientName(q.client), rpFiledOn(q) ? `FILED ${rpFiledOn(q)}` : q.next, rpQState(q))))}</div>`, k);
    }
    const q = QUARTERS[k.slice(2)];
    const s = rpQState(q);
    const f = rpFiledOn(q);
    const dueN = rpDate(q.due).n;
    const box = f ? rpDue(dueN - rpDate(f).n, 'DAYS BEFORE DUE', `FILED ${f}`, `DUE ${q.due}`, 'ok') : rpDue(Math.max(0, dueN - RP_NOW), 'DAYS LEFT', 'DUE', q.due, s[1], Math.max(0, Math.min(100, ((92 - (dueN - RP_NOW)) / 92) * 100)));
    return rpPanel(`${q.q} · ${ACCOUNTS[q.client].b}`, rpPlate(ico('fuel'), `IFTA · ${clientName(q.client)}`, `${q.q} RETURN`, s, k), `${box}${nextBlock(f ? 'FILED BEFORE THE DUE DATE' : q.next, rpNavBtn(`rec/quarter/${q.id}`, 'OPEN IN FILING & FUEL TAXES'), f ? 'done' : '')}
      ${facts([['QUARTER', q.q], ['FILED ON', f ?? 'NOT FILED YET'], ['CLIENT MILES', q.miles, q.miles === '—' ? '' : 'SAMPLE · WHOLE FLEET'], ['GALLONS', q.gallons], ['OWNER', staffName(q.owner)]])}
      <div class="rp-links">${rpGoBtn(`client:${q.client}:filing`, 'CLIENT 360', 'company')}</div>${ntb('TAX DUE BY JURISDICTION IS NOT IN THIS VIEW YET')}`, k);
  },
  side: () => {
    const wins = rpWindows();
    const cids = [...new Set(vals(QUARTERS).map((q) => q.client))];
    return rpRegion('RETURNS BY CLIENT', `${cids.length} CLIENTS`, '', `<div class="rp-qm" style="--n:${wins.length}"><span></span>${wins.map((w) => `<span class="rp-qm__h">${w.q}</span>`).join('')}${cids.map((cid) => `<span class="rp-qm__c">${rpBadge(cid)}<b>${clientName(cid)}</b></span>${wins.map((w) => {
      const q = w.list.find((x) => x.client === cid);
      return q ? `<button type="button" class="rp-qm__x rp-qm__x--${rpFiledOn(q) ? 'filed' : rpQState(q)[1]} ${rpOn(`q:${q.id}`)}" ${rpBtn(`q:${q.id}`, `${w.q} · ${clientName(cid)}`)}>${rpFiledOn(q) ? `FILED ${rpFiledOn(q).replace(', 2026', '')}` : rpQState(q)[0]}</button>` : '<span class="rp-qm__x rp-qm__x--none">NO CASE</span>';
    }).join('')}`).join('')}</div>`, 'rp-sd', 'sd:filing');
  },
};

/* ═══════════════ COMPLIANCE · how the next 90 days are spread ═══════════════ */
const RP_BINS = [['now', 'NOW', -999, 0], ['1', '1–10', 1, 10], ['11', '11–20', 11, 20], ['21', '21–30', 21, 30], ['31', '31–40', 31, 40], ['41', '41–50', 41, 50], ['51', '51–60', 51, 60], ['61', '61–70', 61, 70], ['71', '71–80', 71, 80], ['81', '81–90', 81, 90]];
const RP_BUCKETS = [['now', 'NOW', -999, 0, 'bad'], ['30', '30 DAYS', 1, 30, 'warn'], ['60', '60 DAYS', 31, 60, 'gold'], ['90', '90 DAYS', 61, 90, 'mute']];
const RP_KIND_ICON = { VEHICLE: 'truck', 'DRIVER CREDENTIAL': 'steering', 'DRIVER PROGRAM': 'people', COVERAGE: 'umbrella', REGISTRATION: 'id-card' };
const rpDayWord = (d) => (d < 0 ? `${d}` : d === 0 ? 'NOW' : `${d}`);
RP.compliance = {
  def: () => 'd:dl-rj-ucr',
  asOf: 'NEXT 90 DAYS · FROM OCT 8',
  ros: (m) => {
    const all = vals(DUES);
    const r = [ro(all.filter((d) => d.days <= 0).length, 'NOW', { tone: 'bad', a: rpA(), v: 'b:now', on: rpKey() === 'b:now' }), ro(all.filter((d) => d.days > 0 && d.days <= 7).length, 'THIS WEEK', { tone: 'warn' }), ro(all.filter((d) => d.days <= 30).length, 'IN 30 DAYS', { a: rpA(), v: 'b:30', on: rpKey() === 'b:30' }), ro(all.length, 'NEXT 90 DAYS')];
    return (m ? [r[0], r[2], r[3]] : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const all = vals(DUES);
    const in30 = all.filter((d) => d.days <= 30).length;
    const buckets = RP_BUCKETS.map(([id, label, lo, hi, tone]) => {
      const n = all.filter((d) => d.days >= lo && d.days <= hi).length;
      return `<button type="button" class="rp-bk rp-f--${tone} ${rpOn(`b:${id}`)}" style="flex:${Math.max(n, 0.6)} 0 0" ${rpBtn(`b:${id}`, `${n} · ${label}`)}><b>${n}</b><span>${label}</span></button>`;
    }).join('');
    const kind = k.startsWith('k:') ? k.slice(2) : null;
    const bins = RP_BINS.map(([id, label, lo, hi]) => {
      const list = all.filter((d) => d.days >= lo && d.days <= hi).sort((a, b) => a.days - b.days);
      const start = lo < 1 ? 'OVERDUE' : rpDay(RP_NOW + lo);
      return `<div class="rp-hg__c ${id === '31' || id === '61' ? 'is-cut' : ''} ${rpOn(`w:${id}`)}"><div class="rp-hg__stack">${list.map((d) => `<button type="button" class="rp-dt rp-dt--${rpDState(d)[1]} ${k === `d:${d.id}` ? 'is-on' : ''} ${kind && kind !== d.kind ? 'is-dim' : ''}" ${rpBtn(`d:${d.id}`, `${d.what} · ${d.due}`)}>${ico(RP_KIND_ICON[d.kind] ?? 'shield-check')}<b>${ACCOUNTS[d.client].b}</b><small>${rpDayWord(d.days)}</small>${rpWide() ? `<em>${d.what.split(' · ')[0]}</em>` : ''}</button>`).join('')}</div><button type="button" class="rp-hg__x" ${rpBtn(`w:${id}`, `${list.length} DUE · DAYS ${label}`)}><b>${label}</b><small>${start}</small></button></div>`;
    }).join('');
    const kinds = [...new Set(all.map((d) => d.kind))].map((kd) => [kd, all.filter((d) => d.kind === kd).length]).sort((a, b) => b[1] - a[1]);
    const kindRow = `<div class="rp-kd">${kinds.map(([kd, n]) => `<button type="button" class="rp-kd__i ${rpOn(`k:${kd}`)}" ${rpBtn(`k:${kd}`, `${n} · ${kd}`)}><b>${n}</b>${kd}</button>`).join('')}</div>`;
    return rpStage('compliance', { kick: 'DEADLINES · NEXT 90 DAYS FROM OCT 8', fig: in30, of: `OF ${all.length}`, label: 'DUE WITHIN 30 DAYS', aside: `<div class="rp-bks">${buckets}</div>` }, `<div class="rp-hg">${bins}<span class="rp-hg__cut" style="left:40%"><em>30 DAYS</em></span><span class="rp-hg__cut" style="left:70%"><em>60 DAYS</em></span></div>${kindRow}`);
  },
  list: () => {
    const all = vals(DUES).sort((a, b) => a.days - b.days);
    const rows = all.map((d) => rpRow(`d:${d.id}`, `<span class="rp-dd rp-dd--${rpDState(d)[1]}"><b>${rpDayWord(d.days)}</b><small>${d.days === 0 ? '' : d.days < 0 ? 'LATE' : 'DAYS'}</small></span><span class="rp-main"><b class="pk__t">${d.what}</b><span class="pk__s">${clientName(d.client)} · ${d.due.replace(', 2026', '')}</span><span class="rp-mo">${sw(rpDState(d))}</span></span><span class="rp-c rp-x">${d.kind}</span><span class="rp-x">${av(DUE_META[d.id]?.owner)}</span><span class="rp-x">${sw(rpDState(d))}</span>`, d.what));
    return rpList('DEADLINES BY DATE', `${all.length}`, '48px minmax(0,1fr) 140px 40px 150px', '48px minmax(0,1fr)', [['DAYS', 0], ['DEADLINE', 0], ['KIND', 1], ['OWNER', 1], ['STATUS', 1]], rows);
  },
  panel: (k) => {
    const all = vals(DUES).sort((a, b) => a.days - b.days);
    const [kind, id] = [k.split(':')[0], k.slice(k.indexOf(':') + 1)];
    if (kind !== 'd') {
      const bin = RP_BINS.find(([x]) => x === id);
      const bk = RP_BUCKETS.find(([x]) => x === id);
      const list = kind === 'w' ? all.filter((d) => d.days >= bin[2] && d.days <= bin[3]) : kind === 'b' ? all.filter((d) => d.days >= bk[2] && d.days <= bk[3]) : all.filter((d) => d.kind === id);
      const title = kind === 'w' ? (id === 'now' ? 'DUE NOW OR LATE' : `DAYS ${bin[1]}`) : kind === 'b' ? (id === 'now' ? 'DUE NOW OR LATE' : `WITHIN ${bk[1]}`) : id;
      return rpPanel(title, rpPlate(ico('shield-check'), kind === 'k' ? 'DEADLINES BY KIND' : 'DEADLINES IN THE WINDOW', title, [`${list.length} DUE`, list.length ? rpWorst(list.map((d) => rpDState(d)[1])) : 'mute'], k), `${nextBlock(list.length ? `${list.length} DEADLINE${list.length === 1 ? '' : 'S'} · NEXT ${list[0].due.replace(', 2026', '')}` : 'NOTHING DUE IN THIS WINDOW', '', 'calm')}<div>${rpSec('DEADLINES', `${list.length}`)}${rpRecs(list.map((d) => rpPickLink(`d:${d.id}`, `<b>${ACCOUNTS[d.client].b}</b>`, d.what, `${clientName(d.client)} · ${d.due.replace(', 2026', '')}`, rpDState(d))), 'NOTHING DUE IN THIS WINDOW')}</div>`, k);
    }
    const d = DUES[id];
    const s = rpDState(d);
    const m = DUE_META[d.id] ?? { owner: null, need: d.what, docs: [] };
    return rpPanel(d.kind, rpPlate(ico('shield-check'), `${d.kind} · ${clientName(d.client)}`, d.what, s, k), `${rpDue(d.days < 0 ? -d.days : d.days === 0 ? 'NOW' : d.days, d.days < 0 ? 'DAY LATE' : d.days === 0 ? 'BLOCKING' : 'DAYS LEFT', 'DUE', d.due, s[1], Math.max(0, Math.min(100, ((30 - Math.max(d.days, 0)) / 30) * 100)))}
      ${nextBlock(m.need, rpNavBtn(`rec/deadline/${d.id}`, 'OPEN IN COMPLIANCE', 'shield-check'))}
      ${facts([['CLIENT', clientName(d.client)], ['KIND', d.kind], ['OWNER', staffName(m.owner)]])}
      ${m.docs.length ? `<div>${rpSec('DOCUMENTS')}${m.docs.map(docChip).join('')}</div>` : ''}${ntb('DOT / SAFETY AND AUDITS ARE NOT CONNECTED YET')}`, k);
  },
  side: () => {
    const all = vals(DUES);
    const kinds = [...new Set(all.map((d) => d.kind))].map((kd) => [kd, all.filter((d) => d.kind === kd)]).sort((a, b) => b[1].length - a[1].length);
    return rpRegion('BY KIND', `${all.length} DEADLINES`, '', `<div class="rp-hb rp-hb--tone">${kinds.map(([kd, list]) => `<div class="rp-hb__r ${rpOn(`k:${kd}`)}" ${rpBtn(`k:${kd}`, kd)}><span>${kd}</span>${rpBar(rpCount(list.map((d) => rpDState(d)[1])), 'rp-sb--ink')}<b>${list.length}</b></div>`).join('')}</div><div class="rp-sd__note">${ntb('SAFETY SCORES AND AUDIT OUTCOMES ARE NOT CONNECTED')}</div>`, 'rp-sd', 'sd:comp');
  },
};

/* ═══════════════ DISPATCH & BROKERAGE · loads by state, day by day ═══════════════ */
const RP_LCOL = [['BOOKED', 'mute'], ['MOVING', 'gold'], ['DELIVERED', 'ok'], ['ISSUE', 'bad']];
const RP_GT = { from: rpDate('SEP 29').n, days: 14 };
RP.dispatch_brokerage = {
  def: () => 'l:ld-5517',
  ros: (m) => {
    const all = vals(LOADS);
    const r = [ro(all.filter((l) => rpIn(l.pickup)).length, `PICKED UP · ${WSX.rp.month}`, { tone: 'gold' }), ro(all.filter((l) => l.col === 'MOVING').length, 'MOVING', { a: rpA(), v: 's:MOVING', on: rpKey() === 's:MOVING' }), ro(all.filter((l) => l.exception).length, 'EXCEPTIONS', { tone: 'bad', a: rpA(), v: 's:EXCEPTIONS', on: rpKey() === 's:EXCEPTIONS' }), ro('PAUSED', 'BROKERAGE', { tone: 'bad', a: rpA(), v: 'brk', on: rpKey() === 'brk' })];
    return (m ? r.slice(0, 3) : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const all = vals(LOADS).sort((a, b) => rpDate(a.pickup).n - rpDate(b.pickup).n);
    const pct = (n) => ((n - RP_GT.from) / RP_GT.days) * 100;
    const days = Array.from({ length: RP_GT.days }, (_, i) => RP_GT.from + i);
    const ax = `<div class="rp-gt__ax"><span class="rp-gt__l"></span><div class="rp-gt__days">${days.map((n) => {
      const [mo, d] = rpDay(n).split(' ');
      return `<span class="${n === RP_NOW ? 'is-today' : ''}">${d === '1' || n === RP_GT.from ? `<em>${mo}</em>` : ''}${d}</span>`;
    }).join('')}</div></div>`;
    const stateOn = k.startsWith('s:') ? k.slice(2) : null;
    const rows = all.map((l) => {
      const s = rpLState(l);
      const p = rpDate(l.pickup).n;
      const dl = rpDate(l.delivery).n;
      const x = pct(p);
      const w = ((dl - p + 1) / RP_GT.days) * 100;
      const right = x + w > 66;
      const hit = stateOn === 'EXCEPTIONS' ? !!l.exception : stateOn ? l.col === stateOn : false;
      return `<div class="rp-gt__r ${rpOn(`l:${l.id}`)} ${rpIn(l.pickup) ? '' : 'is-dim'} ${hit ? 'is-hit' : ''}" ${rpBtn(`l:${l.id}`, `${l.ref} · ${s[0]}`)}><span class="rp-gt__l"><b>${l.ref.replace('LOAD ', '')}</b><small>${VEHICLES[l.vehicle].unit}</small></span><span class="rp-gt__t"><i class="rp-gt__b rp-f--${s[1]}" style="left:${x.toFixed(2)}%;width:${w.toFixed(2)}%"></i><span class="rp-gt__w ${right ? 'rp-gt__w--l' : ''}" style="${right ? `right:${(100 - x).toFixed(2)}%` : `left:${(x + w).toFixed(2)}%`}">${l.exception ? `<i class="rp-gt__ex rp-gt__ex--${s[1]}">!</i>` : ''}<span>${s[0]}</span></span></span></div>`;
    }).join('');
    const today = `<i class="rp-gt__today" style="left:calc(var(--gl) + (100% - var(--gl)) * ${((pct(RP_NOW) + 100 / RP_GT.days / 2) / 100).toFixed(4)})"></i>`;
    const tally = `<div class="rp-stt">${RP_LCOL.map(([c, tone]) => `<button type="button" class="rp-stt__i ${rpOn(`s:${c}`)}" ${rpBtn(`s:${c}`, `${c} · ${all.filter((l) => l.col === c).length}`)}><b>${all.filter((l) => l.col === c).length}</b><span><i class="rp-sq rp-f--${tone}"></i>${c}</span></button>`).join('')}</div>`;
    const brk = `<button type="button" class="rp-brk ${rpOn('brk')}" ${rpBtn('brk', 'BROKERAGE · PAUSED')}>${ico('link')}<b>BROKERAGE</b>${sw(['PAUSED', 'bad'])}<span>BUSINESS ACTIVATION REQUIRED · DEMO RECORDS NEVER COUNT</span></button>`;
    const inMonth = all.filter((l) => rpIn(l.pickup)).length;
    return rpStage('dispatch_brokerage', { kick: `DISPATCH LOADS · PICKED UP · ${rpMonth()}`, fig: inMonth, of: `OF ${all.length}`, label: 'LOADS BY STATE', aside: tally }, `<div class="rp-gt">${ax}<div class="rp-gt__rows">${rows}${today}</div></div>${brk}`);
  },
  list: () => {
    const all = vals(LOADS);
    const ex = all.filter((l) => l.exception).sort((a, b) => TONE_RANK[rpLState(a)[1]] - TONE_RANK[rpLState(b)[1]]);
    const rest = all.filter((l) => !l.exception).sort((a, b) => rpDate(b.pickup).n - rpDate(a.pickup).n);
    const row = (l) => rpRow(`l:${l.id}`, `<span class="rp-ic ${l.exception ? `rp-ic--${rpLState(l)[1]}` : ''}">${l.exception ? '<b>!</b>' : ico('pin')}</span><span class="rp-main"><b class="pk__t">${l.ref} · ${l.lane}</b><span class="pk__s">${l.exception ?? `${clientName(l.client)} · ${VEHICLES[l.vehicle].unit}`}</span><span class="rp-mo">${sw(rpLState(l))}</span></span><span class="rp-c rp-x">${VEHICLES[l.vehicle].unit}</span><span class="rp-c">${l.pickup} → ${l.delivery}</span><span class="rp-x">${sw(rpLState(l))}</span>`, `${l.ref} · ${l.lane}`);
    return rpList('LOADS · EXCEPTIONS FIRST', `${all.length}`, '30px minmax(0,1fr) 76px 120px 110px', '30px minmax(0,1fr) 92px', [['', 0], ['LOAD', 0], ['TRUCK', 1], ['PICKUP → DELIVERY', 0], ['STATUS', 1]], [rpGrp('EXCEPTIONS', ex.length), ...ex.map(row), rpGrp('ALL OTHER LOADS', rest.length), ...rest.map(row)]);
  },
  panel: (k) => {
    if (k === 'brk') {
      const act = rpActivation('brokerage');
      return rpPanel('BROKERAGE', rpPlate(ico('link'), 'SERVICE 06 · ACTIVATION', 'BROKERAGE IS PAUSED', ['PAUSED', 'bad'], k), `${nextBlock(act[3], '', 'calm')}
        ${facts([['ACTIVATION', sw([act[1], act[2]])], ['FIGURES', 'NONE REPORTED WHILE PAUSED']])}
        <div>${rpSec('DEMO RECORDS · NEVER COUNTED', `${vals(SHIPMENTS).length}`)}${rpRecs(vals(SHIPMENTS).map((r) => rpLink({ v: `rec/shipment/${r.id}`, lead: ico('link'), title: `${r.ref} · ${r.lane}`, sub: `DEMO · ${clientName(r.client)}`, status: ['DEMO', 'mute'] })))}</div>${ntb('NO SHIPMENTS, MARGINS OR CARRIER FIGURES ARE REPORTED')}`, k);
    }
    if (k.startsWith('s:')) {
      const c = k.slice(2);
      const list = vals(LOADS).filter((l) => (c === 'EXCEPTIONS' ? !!l.exception : l.col === c));
      return rpPanel(c, rpPlate(ico('pin'), 'LOADS BY STATE', c, [`${list.length} LOAD${list.length === 1 ? '' : 'S'}`, c === 'EXCEPTIONS' ? 'bad' : RP_LCOL.find(([x]) => x === c)[1]], k), `<div>${rpSec('LOADS', `${list.length}`)}${rpRecs(list.map((l) => rpPickLink(`l:${l.id}`, ico('pin'), `${l.ref} · ${l.lane}`, `${l.pickup} → ${l.delivery}`, rpLState(l))), 'NO LOADS IN THIS STATE')}</div>`, k);
    }
    const l = LOADS[k.slice(2)];
    const s = rpLState(l);
    const v = VEHICLES[l.vehicle];
    return rpPanel(l.ref, rpPlate(ico('pin'), `DISPATCH · ${clientName(l.client)}`, `${l.ref} · ${l.lane}`, s, k), `${nextBlock(l.exception ?? `DELIVERS ${l.delivery}`, rpNavBtn(`rec/load/${l.id}`, 'OPEN IN DISPATCH', 'pin'), l.exception ? '' : 'calm')}
      ${facts([['PICKUP · DELIVERY', `${l.pickup} · ${l.delivery}`], ['TRUCK', v.unit, v.ymm], ['DRIVER', l.driver ? DRIVERS[l.driver].name : 'NONE ASSIGNED'], ['DISPATCHER', staffName(l.owner)]])}
      <div class="rp-links">${rpGoBtn(`fleet:${l.vehicle}:dispatch`, `${v.unit} IN FLEET`, 'truck')}${rpGoBtn(`client:${l.client}:dispatch`, 'CLIENT 360', 'company')}</div>${mhist(`load:${l.id}`, [[l.delivery, l.col === 'DELIVERED' ? 'DELIVERED' : 'DELIVERY'], [l.pickup, 'PICKUP']], 'DAYS')}`, k);
  },
  side: () => {
    const all = vals(LOADS);
    const units = [...new Set(all.map((l) => l.vehicle))];
    return rpRegion('LOADS BY TRUCK', `${units.length} TRUCKS`, '', `<div class="rp-trk">${units.map((vid) => {
      const v = VEHICLES[vid];
      const mine = all.filter((l) => l.vehicle === vid);
      return `<button type="button" class="rp-trk__i" data-a="go" data-v="fleet:${vid}:dispatch" aria-label="${v.unit} IN FLEET"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[vid].cab)}</svg><span><b>${v.unit}</b><small>${mine.length} LOAD${mine.length === 1 ? '' : 'S'} · ${sw(vAvail(v))}</small></span>${rpBar(rpCount(mine.map((l) => rpLState(l)[1])), 'rp-sb--ink')}</button>`;
    }).join('')}</div>`, 'rp-sd', 'sd:dispatch');
  },
};

/* ═══════════════ BOOKKEEPING · the month's closes, step by step ═══════════════ */
/** The closes due in the period month: each client's books for the month before (BOOKS is seed data). */
function rpCloses(m = WSX.rp.month) {
  const out = [];
  for (const cid of Object.keys(BOOKS)) {
    for (const [p, per] of Object.entries(BOOKS[cid].periods)) {
      if (!per.due.startsWith(`${m} `)) continue;
      const step = typeof bkStep === 'function' ? bkStep(cid, p) : per.step;
      const cy = vals(CYCLES).find((c) => c.client === cid && c.period.slice(0, 3) === p.slice(0, 3) && c.period.endsWith(p.slice(-4)));
      const s = step >= 8 ? ['PERIOD COMPLETE', 'ok'] : cy ? ov(`cycle:${cy.id}`, cy.status) : [CYCLE_STEPS[step], 'gold'];
      out.push({ k: `k:${cid}:${p}`, cid, p, per, step, cy, s, sub: SUBSCRIPTIONS[BOOKS[cid].sub] });
    }
  }
  return out.sort((a, b) => a.step - b.step);
}
const rpSubState = (s) => {
  const cy = s.cycle && CYCLES[s.cycle];
  return cy ? ov(`cycle:${cy.id}`, cy.status) : ov(`subscription:${s.id}`, s.status);
};
RP.bookkeeping = {
  def: () => [...rpCloses()].sort((a, b) => TONE_RANK[a.s[1]] - TONE_RANK[b.s[1]])[0]?.k ?? 'sub:bk-rj',
  ros: (m) => {
    const cl = rpCloses();
    const dues = [...new Set(cl.filter((c) => c.step < 8).map((c) => c.per.due))].sort((a, b) => rpDate(a).n - rpDate(b).n);
    const r = [ro(cl.length, `CLOSES DUE · ${WSX.rp.month}`, { tone: 'gold' }), ro(dues[0] ?? '—', 'NEXT DUE'), ro(cl.filter((c) => c.cy?.question && c.step < 8).length, 'WITH QUESTIONS', { tone: 'warn' }), ro(Object.values(BOOKS).filter((b) => b.paused).length, 'PAUSED', { tone: 'bad', a: rpA(), v: 'sub:bk-rj', on: rpKey() === 'sub:bk-rj' })];
    return (m ? [r[0], r[2], r[3]] : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const cl = rpCloses();
    const books = { OCT: 'SEPTEMBER', SEP: 'AUGUST', AUG: 'JULY', JUL: 'JUNE' }[WSX.rp.month];
    const phases = BOOK_PHASES.map(([id, label, steps]) => `<div class="rp-fn__ph"><span class="rp-fn__pl">${label}</span>${steps.map((i) => {
      const reached = cl.filter((c) => c.step >= i).length;
      const at = cl.filter((c) => c.step === i);
      return `<div class="rp-fn ${rpOn(`s:${i}`)}" ${rpBtn(`s:${i}`, `${CYCLE_STEPS[i]} · ${reached} OF ${cl.length}`)}><span class="rp-fn__s"><i>${i + 1}</i>${CYCLE_STEPS[i]}</span><span class="rp-fn__t"><i style="width:${cl.length ? (reached / cl.length) * 100 : 0}%"></i></span><b>${reached}/${cl.length}</b><span class="rp-fn__at">${at.map((c) => `<button type="button" class="rp-fn__tok rp-fn__tok--${c.s[1]} ${k === c.k ? 'is-on' : ''}" ${rpBtn(c.k, `${clientName(c.cid)} · ${c.s[0]}`)}>${ACCOUNTS[c.cid].b}</button>`).join('')}</span></div>`;
    }).join('')}</div>`).join('');
    const paused = Object.entries(BOOKS).filter(([, b]) => b.paused).map(([cid, b]) => `<button type="button" class="rp-paused ${rpOn(`sub:${b.sub}`)}" ${rpBtn(`sub:${b.sub}`, `${clientName(cid)} · PAUSED`)}>${rpBadge(cid)}<b>${clientName(cid)}</b>${sw(rpSubState(SUBSCRIPTIONS[b.sub]))}<span>CLOSES PAUSED</span></button>`).join('');
    const body = cl.length ? `<div class="rp-fns">${phases}</div>` : `<div class="rp-empty rp-empty--st"><b>NO CLOSES DUE IN ${RP_MONTH_NAME[WSX.rp.month]} 2026</b><span>THE SEED DATA HOLDS CLOSES DUE IN SEP, OCT AND NOV</span></div>`;
    return rpStage('bookkeeping', { kick: `CLOSES DUE · ${rpMonth()}`, fig: cl.length, label: cl.length ? `${books} BOOKS · REACHED EACH STEP` : 'CLOSES DUE', aside: `<span class="rp-tag">${ico('info')}SEED DATA · NOT CONNECTED YET</span>${paused}` }, body);
  },
  list: () => {
    const cl = rpCloses();
    const rows = cl.map((c) => rpRow(c.k, `${rpBadge(c.cid)}<span class="rp-main"><b class="pk__t">${clientName(c.cid)}</b><span class="pk__s">${c.sub?.pkg ?? ''} · ${c.p} BOOKS</span><span class="rp-mo">${sw(c.s)}</span></span><span class="rp-steps" aria-label="STEP ${c.step + 1} OF 9">${CYCLE_STEPS.map((_, i) => `<i class="${i < c.step ? 'is-done' : i === c.step ? 'is-now' : ''}"></i>`).join('')}</span><span class="rp-c rp-x">${c.per.closed ? `CLOSED ${c.per.closed}` : `DUE ${c.per.due}`}</span><span class="rp-x">${sw(c.s)}</span>`, clientName(c.cid)));
    const paused = Object.entries(BOOKS).filter(([, b]) => b.paused).map(([cid, b]) => rpRow(`sub:${b.sub}`, `${rpBadge(cid)}<span class="rp-main"><b class="pk__t">${clientName(cid)}</b><span class="pk__s">${SUBSCRIPTIONS[b.sub].pkg} · CLOSES PAUSED</span><span class="rp-mo">${sw(rpSubState(SUBSCRIPTIONS[b.sub]))}</span></span><span class="rp-c">—</span><span class="rp-c rp-x">—</span><span class="rp-x">${sw(rpSubState(SUBSCRIPTIONS[b.sub]))}</span>`, clientName(cid)));
    return rpList('CLOSES', `${cl.length} DUE · ${WSX.rp.month}`, '30px minmax(0,1fr) 120px 110px 170px', '30px minmax(0,1fr) 80px', [['', 0], ['CLIENT', 0], ['STEP', 0], ['DUE', 1], ['STATUS', 1]], [...rows, rpGrp('PAUSED', paused.length), ...paused], `NO CLOSES DUE IN ${RP_MONTH_NAME[WSX.rp.month]}`);
  },
  panel: (k) => {
    if (k.startsWith('sub:')) {
      const s = SUBSCRIPTIONS[k.slice(4)];
      return rpPanel(ACCOUNTS[s.client].b, rpPlate(`<b>${ACCOUNTS[s.client].b}</b>`, `BOOKKEEPING · ${s.pkg}`, clientName(s.client), rpSubState(s), k), `${nextBlock('CLOSES ARE PAUSED', rpGoBtn(`books:${s.client}`, 'OPEN IN BOOKKEEPING', 'calculator', true), 'calm')}${facts([['PACKAGE', s.pkg], ['OWNER', staffName(s.owner)], ['CLOSES', 'NONE WHILE PAUSED']])}${ntb('BILLING IS FOUNDER / BILLING GRANT ONLY')}`, k);
    }
    if (k.startsWith('s:')) {
      const i = Number(k.slice(2));
      const cl = rpCloses();
      return rpPanel(`STEP ${i + 1}`, rpPlate(`<b>${i + 1}</b>`, 'CLOSE STEP', CYCLE_STEPS[i], [`${cl.filter((c) => c.step >= i).length} OF ${cl.length} REACHED`, 'gold'], k), `<div>${rpSec('AT THIS STEP', `${cl.filter((c) => c.step === i).length}`)}${rpRecs(cl.filter((c) => c.step === i).map((c) => rpPickLink(c.k, `<b>${ACCOUNTS[c.cid].b}</b>`, clientName(c.cid), `${c.p} BOOKS`, c.s)), 'NO CLOSE IS AT THIS STEP')}</div><div>${rpSec('PAST THIS STEP', `${cl.filter((c) => c.step > i).length}`)}${rpRecs(cl.filter((c) => c.step > i).map((c) => rpPickLink(c.k, `<b>${ACCOUNTS[c.cid].b}</b>`, clientName(c.cid), `STEP ${c.step + 1} · ${CYCLE_STEPS[c.step]}`, c.s)), 'NONE YET')}</div>`, k);
    }
    const [, cid, p] = k.split(':');
    const per = BOOKS[cid]?.periods[p];
    if (!per) return rpPanel('CLOSE', rpPlate(ico('calculator'), 'CLOSE', 'NOT IN THIS PERIOD', null, k), ntb('CHOOSE A CLOSE ON THE FUNNEL'), k);
    const c = rpCloses(rpDate(per.due).m).find((x) => x.k === k) ?? { step: per.step, s: [CYCLE_STEPS[per.step], 'gold'], cy: null, sub: SUBSCRIPTIONS[BOOKS[cid].sub] };
    const go = c.cy ? rpNavBtn(`rec/cycle/${c.cy.id}`, 'OPEN IN BOOKKEEPING', 'calculator') : rpGoBtn(`books:${cid}`, 'OPEN IN BOOKKEEPING', 'calculator', true);
    return rpPanel(`${ACCOUNTS[cid].b} · ${p}`, rpPlate(`<b>${ACCOUNTS[cid].b}</b>`, `CLOSE · ${clientName(cid)}`, `${p} CLOSE`, c.s, k), `<div class="rp-meter"><b>STEP ${c.step + 1} OF 9</b><span>${CYCLE_STEPS[c.step]}</span><span class="rp-steps rp-steps--lg">${CYCLE_STEPS.map((_, i) => `<i class="${i < c.step ? 'is-done' : i === c.step ? 'is-now' : ''}"></i>`).join('')}</span></div>
      ${nextBlock(c.step >= 8 ? `CLOSED ${per.closed ?? ''}` : c.cy?.question ?? `NEXT · ${CYCLE_STEPS[Math.min(8, c.step + 1)]}`, go, c.step >= 8 ? 'done' : c.cy?.question ? '' : 'calm')}
      ${facts([['PACKAGE', c.sub?.pkg ?? '—'], ['DUE', per.due], per.closed ? ['CLOSED', per.closed] : null, ['OWNER', staffName(c.sub?.owner)], ['DOCUMENTS', `${per.docs.filter((d) => d.status === 'RECEIVED').length} OF ${per.docs.length} RECEIVED`]])}
      ${ntb('BOOKKEEPING RUNS ON SEED DATA · NOT CONNECTED YET')}`, k);
  },
  side: () => {
    const subs = vals(SUBSCRIPTIONS);
    const pk = [...new Set(subs.map((s) => s.pkg))].map((p) => [p, subs.filter((s) => s.pkg === p)]);
    return rpRegion('PACKAGES', `${subs.length} CLIENTS`, '', `<div class="rp-hb rp-hb--tone">${pk.map(([p, list]) => `<div class="rp-hb__r"><span>${p}</span>${rpBar(rpCount(list.map((s) => rpSubState(s)[1])), 'rp-sb--ink')}<b>${list.length}</b></div>`).join('')}</div><div class="rp-sd__note">${ntb('CLOSE TIMELINESS NEEDS LIVE CLOSE DATES')}</div>`, 'rp-sd', 'sd:books');
  },
};

/* ═══════════════ MIGRATION · cases by lifecycle, by path ═══════════════ */
const RP_MLIFE = { KNOWN_UNMIGRATED: 'KNOWN', INTAKE_IN_PROGRESS: 'INTAKE', MIGRATION_IN_PROGRESS: 'MIGRATING', MIGRATION_REVIEW_REQUIRED: 'REVIEW', PREBUILT: 'PREBUILT', CLIENT_CONFIRMATION_REQUIRED: 'AWAITING CLIENT', ACTIVE: 'ACTIVE' };
const rpCaseWord = (m) => (/^BATCH \d+/.test(m.name) ? m.name.match(/^BATCH \d+/)[0] : m.name.split(' ')[0]);
RP.migration = {
  def: () => 'm:mig-bl',
  asOf: 'AS OF OCT 8, 2026',
  ros: (mob) => {
    const all = vals(MIG_CASES);
    const n = (ls) => all.filter((m) => ls.includes(migLife(m))).length;
    const r = [ro(all.length, 'CASES'), ro(n(['INTAKE_IN_PROGRESS', 'MIGRATION_IN_PROGRESS', 'MIGRATION_REVIEW_REQUIRED']), 'IN PROGRESS', { tone: 'gold' }), ro(n(['PREBUILT', 'CLIENT_CONFIRMATION_REQUIRED']), 'NOT ACTIVE YET', { tone: 'gold' }), ro(n(['ACTIVE']), 'CONFIRMED · ACTIVE')];
    return (mob ? r.slice(0, 3) : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const all = vals(MIG_CASES);
    const max = Math.max(1, ...MIG_LIFE.map(([l]) => all.filter((m) => migLife(m) === l).length));
    const tok = (m) => `<button type="button" class="rp-mt rp-mt--${migStatus(m)[1]} ${k === `m:${m.id}` ? 'is-on' : ''}" ${rpBtn(`m:${m.id}`, `${m.name} · ${migStatus(m)[0]}`)}><b>${rpCaseWord(m)}</b>${m.conflicts ? `<i>${m.conflicts}</i>` : ''}</button>`;
    if (VP === 'mobile') {
      const rows = MIG_LIFE.map(([l, w]) => {
        const list = all.filter((m) => migLife(m) === l);
        return `${l === 'CLIENT_CONFIRMATION_REQUIRED' ? '<span class="rp-ml__gate">THE CLIENT CONFIRMS</span>' : ''}<div class="rp-ml ${rpOn(`l:${l}`)}" ${rpBtn(`l:${l}`, `${w} · ${list.length}`)}><span class="rp-ml__w">${RP_MLIFE[l]}</span><b>${list.length}</b><span class="rp-ml__tk">${list.map(tok).join('')}</span></div>`;
      }).join('');
      return rpStage('migration', { kick: 'CASES BY LIFECYCLE · AS OF OCT 8', fig: all.length, label: 'MIGRATION CASES' }, `<div class="rp-mls"><span class="rp-ml__gate rp-ml__gate--staff">STAFF PREPARE</span>${rows}</div>`);
    }
    const head = `<div class="rp-mg__r rp-mg__r--h"><span class="rp-mg__b"></span>${MIG_LIFE.map(([l, w]) => {
      const n = all.filter((m) => migLife(m) === l).length;
      return `<button type="button" class="rp-mg__lh ${rpOn(`l:${l}`)}" ${rpBtn(`l:${l}`, `${w} · ${n}`)}><span class="rp-mg__col"><i style="height:${(n / max) * 100}%"></i></span><b>${n}</b><span>${RP_MLIFE[l]}</span></button>`;
    }).join('')}</div>`;
    const rows = Object.keys(MIG_BRANCH).filter((b) => all.some((m) => m.branch === b)).map((b) => `<div class="rp-mg__r ${rpOn(`b:${b}`)}"><button type="button" class="rp-mg__b" ${rpBtn(`b:${b}`, MIG_BRANCH[b][0])}>${ico(MIG_BRANCH[b][3])}<span>${MIG_BRANCH[b][0].replace(' CLIENT FILE', '').replace(' BATCH MIGRATION', '')}</span><small>${all.filter((m) => m.branch === b).length}</small></button>${MIG_LIFE.map(([l]) => `<span class="rp-mg__x">${all.filter((m) => m.branch === b && migLife(m) === l).map(tok).join('')}</span>`).join('')}</div>`).join('');
    const files = all.reduce((n, m) => n + m.files, 0);
    const conflicts = all.reduce((n, m) => n + m.conflicts, 0);
    return rpStage('migration', { kick: 'CASES BY LIFECYCLE · BY PATH · AS OF OCT 8', fig: all.length, label: 'MIGRATION CASES', aside: `<span class="rp-tag">${files} FILES READ</span><span class="rp-tag rp-tag--bad">${conflicts} CONFLICTS</span>` }, `<div class="rp-mg"><div class="rp-mg__band"><span class="rp-mg__b"></span><span class="rp-mg__staff">STAFF PREPARE</span><span class="rp-mg__client">THE CLIENT CONFIRMS</span></div>${head}${rows}</div>`);
  },
  list: () => {
    const all = vals(MIG_CASES).sort((a, b) => MIG_LIFE.findIndex(([l]) => l === migLife(a)) - MIG_LIFE.findIndex(([l]) => l === migLife(b)));
    const rows = all.map((m) => rpRow(`m:${m.id}`, `<span class="rp-ic">${ico(MIG_BRANCH[m.branch][3])}</span><span class="rp-main"><b class="pk__t">${m.name}</b><span class="pk__s">${MIG_BRANCH[m.branch][0]} · ${m.files} FILES</span><span class="rp-mo">${sw(migStatus(m))}</span></span><span class="rp-c rp-x">${RP_MLIFE[migLife(m)]}</span><span class="rp-c">${m.started}</span><span class="rp-x">${av(m.owner)}</span><span class="rp-x">${sw(migStatus(m))}</span>`, m.name));
    return rpList('CASES BY LIFECYCLE', `${all.length}`, '30px minmax(0,1fr) 110px 64px 40px 170px', '30px minmax(0,1fr) 56px', [['', 0], ['CASE', 0], ['LIFECYCLE', 1], ['STARTED', 0], ['OWNER', 1], ['STAGE', 1]], rows);
  },
  panel: (k) => {
    const all = vals(MIG_CASES);
    const [kind, id] = [k.split(':')[0], k.slice(k.indexOf(':') + 1)];
    if (kind === 'l' || kind === 'b') {
      const list = all.filter((m) => (kind === 'l' ? migLife(m) === id : m.branch === id));
      const title = kind === 'l' ? MIG_LIFE.find(([l]) => l === id)[1] : MIG_BRANCH[id][0];
      return rpPanel(kind === 'l' ? RP_MLIFE[id] : title, rpPlate(ico(kind === 'b' ? MIG_BRANCH[id][3] : 'migrate'), kind === 'l' ? 'LIFECYCLE' : 'MIGRATION PATH', title, [`${list.length} CASE${list.length === 1 ? '' : 'S'}`, list.length ? 'gold' : 'mute'], k), `<div>${rpSec('CASES', `${list.length}`)}${rpRecs(list.map((m) => rpPickLink(`m:${m.id}`, ico(MIG_BRANCH[m.branch][3]), m.name, `${m.files} FILES · STARTED ${m.started}`, migStatus(m))), 'NO CASE IS HERE')}</div>${kind === 'l' && ['PREBUILT', 'CLIENT_CONFIRMATION_REQUIRED'].includes(id) ? ntb('STAFF PREPARATION NEVER MAKES A CLIENT ACTIVE') : ''}`, k);
    }
    const m = MIG_CASES[id];
    const li = MIG_LIFE.findIndex(([l]) => l === migLife(m));
    return rpPanel(rpCaseWord(m), rpPlate(ico(MIG_BRANCH[m.branch][3]), MIG_BRANCH[m.branch][0], m.name, migStatus(m), k), `<div class="rp-meter"><b>${MIG_LIFE[li][1]}</b><span>STAGE ${li + 1} OF ${MIG_LIFE.length}</span><span class="rp-steps rp-steps--lg" style="--n:${MIG_LIFE.length}">${MIG_LIFE.map((_, i) => `<i class="${i < li ? 'is-done' : i === li ? 'is-now' : ''}"></i>`).join('')}</span></div>
      ${nextBlock(m.conflicts ? `${m.conflicts} CONFLICT${m.conflicts === 1 ? '' : 'S'} TO SETTLE` : migStatus(m)[0], rpNavBtn(`intake/case/${m.id}`, 'OPEN THE CASE', 'migrate'), m.conflicts ? '' : 'calm')}
      ${facts([['SOURCE', m.source], ['FILES', `${m.files}`], ['FOUND', m.found], ['OWNER', staffName(m.owner)], ['STARTED', m.started], m.confirmed ? ['CONFIRMED', m.confirmed] : null])}
      ${m.client ? `<div class="rp-links">${rpGoBtn(`client:${m.client}`, 'CLIENT 360', 'company')}</div>` : ''}${['PREBUILT', 'CLIENT_CONFIRMATION_REQUIRED'].includes(migLife(m)) ? ntb('ONLY THE CLIENT’S CONFIRMATION MAKES IT ACTIVE') : ''}`, k);
  },
  side: () => {
    const all = vals(MIG_CASES);
    return rpRegion('BY PATH', `${all.length} CASES`, '', `<div class="rp-hb rp-hb--tone">${Object.keys(MIG_BRANCH).filter((b) => all.some((m) => m.branch === b)).map((b) => {
      const list = all.filter((m) => m.branch === b);
      return `<div class="rp-hb__r ${rpOn(`b:${b}`)}" ${rpBtn(`b:${b}`, MIG_BRANCH[b][0])}><span>${ico(MIG_BRANCH[b][3])}${MIG_BRANCH[b][0].replace(' CLIENT FILE', '').replace(' BATCH MIGRATION', '')}</span>${rpBar(rpCount(list.map((m) => migStatus(m)[1])), 'rp-sb--ink')}<b>${list.length}</b></div>`;
    }).join('')}</div><div class="rp-sd__note">${ntb(`${all.reduce((n, m) => n + m.files, 0)} FILES READ ACROSS ${all.length} CASES`)}</div>`, 'rp-sd', 'sd:mig');
  },
};

/* ═══════════════ EXPORTS · what can leave AIO, by grant ═══════════════ */
function rpPkgs() {
  const m = WSX.rp.month;
  const filedN = vals(QUARTERS).filter((q) => rpIn(rpFiledOn(q))).length;
  const list = [
    { id: 'summary', t: 'PERIOD SUMMARY', fmt: 'CSV', note: 'CSV · WITH THE OVERVIEW', st: 'csv', per: true, cols: ['AREA', 'FIGURE', 'COUNT'], rows: () => [['CLIENTS', 'ACTIVE · AS OF OCT 8', `${vals(ACCOUNTS).filter((c) => c.life === 'ACTIVE').length}`], ['FILING HISTORY', `FILED IN ${m}`, `${filedN}`], ['COMPLIANCE', 'DUE IN 30 DAYS', `${vals(DUES).filter((d) => d.days <= 30).length}`], ['DISPATCH', `PICKED UP IN ${m}`, `${vals(LOADS).filter((l) => rpIn(l.pickup)).length}`], ['BOOKKEEPING', `CLOSES DUE IN ${m}`, `${rpCloses().length}`], ['MIGRATION', `CASES OPENED IN ${m}`, `${vals(MIG_CASES).filter((c) => rpIn(c.started)).length}`]] },
    { id: 'clients', t: 'CLIENT LIST', fmt: 'CSV', note: 'CSV · NAMES, LIFECYCLE, SERVICES', st: 'csv', cols: ['CLIENT', 'USDOT', 'STATE', 'LIFECYCLE', 'SERVICES'], rows: () => vals(ACCOUNTS).map((c) => [c.name, c.dot.replace('USDOT ', ''), c.state, c.life, `${c.lanes.length}`]) },
    { id: 'migration', t: 'MIGRATION CASES', fmt: 'CSV', note: 'CSV · BY LIFECYCLE', st: 'csv', cols: ['CASE', 'PATH', 'LIFECYCLE', 'FILES'], rows: () => vals(MIG_CASES).map((c) => [c.name, c.branch.toUpperCase(), RP_MLIFE[migLife(c)], `${c.files}`]) },
    { id: 'filing', t: 'FILING HISTORY', fmt: 'CSV', note: 'CSV · WHEN THE VIEW IS BUILT', st: 'later', cols: ['RETURN', 'CLIENT', 'STATUS', 'FILED ON'], rows: () => vals(QUARTERS).map((q) => [q.q, clientName(q.client), rpQState(q)[0], rpFiledOn(q)?.replace(', 2026', '') ?? '—']) },
    FOUNDER && { id: 'aging', t: 'RECEIVABLES AGING', fmt: 'CSV', note: 'CSV · FOUNDER · FINANCE · STATUSES ONLY', st: 'csv', founder: true, cols: ['INVOICE', 'CLIENT', 'DATE', 'STATUS'], rows: () => vals(INVOICES).filter((i) => rpInv(i)[0] !== 'PAID').map((i) => [i.ref.replace('INVOICE ', ''), clientName(i.client), i.date, rpInv(i)[0]]) },
    { id: 'pdf', t: 'PDF REPORTS', fmt: 'PDF', note: 'NO PDF RENDERER YET', st: 'later', cols: [], rows: () => [] },
  ];
  return list.filter(Boolean);
}
const rpPkgState = (p) => WSX.over[`rpx:${p.id}`] ?? (p.st === 'csv' ? ['CSV · READY', 'gold'] : ['LATER', 'mute']);
const rpFile = (p) => `${p.t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.per ? `${WSX.rp.month.toLowerCase()}-2026` : 'oct-8-2026'}.${p.fmt.toLowerCase()}`.toUpperCase();
RP.exports = {
  def: () => 'x:clients',
  ros: (m) => {
    const all = rpPkgs();
    const r = [ro(all.length, 'PACKAGES'), ro(all.filter((p) => p.st === 'csv').length, 'READY', { tone: 'gold' }), ro(all.filter((p) => p.st === 'later').length, 'LATER'), ro(all.filter((p) => WSX.over[`rpx:${p.id}`]).length, 'PREPARED · THIS VISIT')];
    return (m ? r.slice(0, 3) : r).join('');
  },
  hero: () => {
    const k = rpKey();
    const all = rpPkgs();
    const p = all.find((x) => `x:${x.id}` === k) ?? all[0];
    const rows = p.rows();
    const show = VP === 'mobile' ? 4 : rpWide() ? 14 : VP === 'tablet' ? 6 : 7;
    const shelf = `<div class="rp-shelf">${all.map((x) => `<button type="button" class="rp-pk ${`x:${x.id}` === k ? 'is-on' : ''} ${x.st === 'later' ? 'is-later' : ''}" ${rpBtn(`x:${x.id}`, x.t)}><span class="rp-pk__f">${x.fmt}</span><b>${x.t}</b></button>`).join('')}</div>`;
    const sheet = p.cols.length
      ? `<div class="rp-sheet ${p.st === 'later' ? 'is-later' : ''}" data-swap="sh:${p.id}:${WSX.rp.month}"><div class="rp-sheet__h"><span>${ico('download')}${rpFile(p)}</span><em>${rows.length} ROWS · ${p.cols.length} COLUMNS</em></div><table class="rp-sheet__t"><thead><tr><th>#</th>${p.cols.map((c, i) => `<th class="${i > 1 ? 'rp-x2' : ''} ${i > 2 ? 'rp-x3' : ''}">${c}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, show).map((r, n) => `<tr><td>${n + 1}</td>${r.map((v, i) => `<td class="${i > 1 ? 'rp-x2' : ''} ${i > 2 ? 'rp-x3' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table>${rows.length > show ? `<div class="rp-sheet__more">+ ${rows.length - show} MORE ROWS</div>` : ''}${p.st === 'later' ? `<div class="rp-sheet__later"><b>LATER</b><span>${p.note}</span></div>` : ''}</div>`
      : `<div class="rp-sheet rp-sheet--none" data-swap="sh:${p.id}"><b>${ico('pdf')}NO PDF RENDERER YET</b><span>PDF REPORTS ARRIVE AFTER CSV · NOTHING IS GENERATED</span></div>`;
    return rpStage('exports', { kick: `EXPORT PREVIEW · ${p.per ? rpMonth() : 'AS OF OCT 8'}`, fig: rows.length, label: `ROWS · ${p.t}`, aside: shelf }, sheet);
  },
  list: () => {
    const rows = rpPkgs().map((p) => rpRow(`x:${p.id}`, `<span class="rp-ic">${ico(p.fmt === 'PDF' ? 'pdf' : 'download')}</span><span class="rp-main"><b class="pk__t">${p.t}${p.founder ? ' <span class="founder">FOUNDER</span>' : ''}</b><span class="pk__s">${p.note}</span><span class="rp-mo">${sw(rpPkgState(p))}</span></span><span class="rp-num rp-x">${p.rows().length || '—'}</span><span class="rp-c rp-x">${p.per ? WSX.rp.month : 'OCT 8'}</span><span class="rp-x">${sw(rpPkgState(p))}</span>`, p.t));
    return rpList('EXPORT PACKAGES', 'CSV NOW · PDF LATER', '30px minmax(0,1fr) 60px 64px 180px', '30px minmax(0,1fr)', [['', 0], ['PACKAGE', 0], ['ROWS', 1], ['PERIOD', 1], ['STATUS', 1]], rows);
  },
  panel: (k) => {
    const p = rpPkgs().find((x) => `x:${x.id}` === k) ?? rpPkgs()[0];
    const s = rpPkgState(p);
    const rows = p.rows();
    const key = `rpx:${p.id}`;
    const next = p.st === 'csv'
      ? nextBlock(rpFile(p), simBtn(`rp:x:${p.id}`, { label: 'PREPARE EXPORT', effect: `PREPARES ${rpFile(p)} · ${rows.length} ROWS FOR ${p.per ? rpMonth() : 'OCT 8, 2026'}. NO FILE IS GENERATED.`, apply: () => (WSX.over[key] = ['PREPARED · SIMULATED', 'ok']), rec: key, primary: true, founder: !!p.founder }))
      : nextBlock(p.note, '', 'calm');
    const base = p.id === 'summary' ? [['OCT 1, 2026', 'PERIOD SUMMARY EXPORTED (SAMPLE) · ALEX R.']] : [];
    return rpPanel(p.t, rpPlate(ico(p.fmt === 'PDF' ? 'pdf' : 'download'), `EXPORT · ${p.fmt}`, p.t, s, k), `${next}
      ${facts([['FORMAT', p.fmt], ['ROWS', rows.length ? `${rows.length}` : '—'], ['COLUMNS', p.cols.join(' · ') || '—'], ['PERIOD', p.per ? rpMonth() : 'STATE ON OCT 8, 2026'], ['GRANT', p.founder ? 'FOUNDER · FINANCE' : 'REPORTS GRANT']])}
      ${base.length || WSX.hist[key] ? mhist(key, base, 'EXPORT LOG') : ''}${ntb('EVERY EXPORT IS LOGGED WITH YOUR NAME')}`, k);
  },
  side: () => {
    const log = rpPkgs().flatMap((p) => (WSX.hist[`rpx:${p.id}`] || []).map(([w, t]) => [w, `${p.t} · ${t}`, true]));
    return rpRegion('EXPORT LOG', `${log.length + 1}`, '', `<div class="rp-sd__log"><ul class="mh">${[...log, ['OCT 1, 2026', 'PERIOD SUMMARY EXPORTED (SAMPLE) · ALEX R.', false]].map(([w, t, sim]) => `<li class="${sim ? 'is-sim' : ''}"><b>${t}${sim ? ' <span class="simtag">SIMULATED</span>' : ''}</b><small>${w}</small></li>`).join('')}</ul></div><div class="rp-sd__note">${ntb('NOTHING LEAVES AIO IN THIS REVIEW')}</div>`, 'rp-sd', 'sd:exp');
  },
};

/* ── the bar, the switcher, the period ── */
function rpPeriod() {
  const m = RP[WSX.rp.area];
  if (m.asOf) return `<span class="rp-asof">${ico('calendar')}${m.asOf}</span>`;
  const i = RP_MONTHS.indexOf(WSX.rp.month);
  return `<div class="rp-per" role="group" aria-label="Period"><button type="button" class="wbtn wbtn--icon wbtn--sm" data-a="rp.month" data-v="${RP_MONTHS[Math.max(0, i - 1)]}" ${i === 0 ? 'disabled' : ''} aria-label="Earlier month">${ico('back')}</button><b>${rpMonth()}</b><button type="button" class="wbtn wbtn--icon wbtn--sm" data-a="rp.month" data-v="${RP_MONTHS[Math.min(RP_MONTHS.length - 1, i + 1)]}" ${i === RP_MONTHS.length - 1 ? 'disabled' : ''} aria-label="Later month">${ico('fwd')}</button></div>`;
}
const rpTabs = () => seg(rpShown().map((a) => [a.slug, a.label]), WSX.rp.area, 'rp.area', 'wseg--scroll rp-tabs');
function rpView() {
  const a = rpArea();
  if (!FOUNDER) return `<div class="ws rp rp--lock">${wsBar('REPORTS · AREAS', 'REPORTS', '')}<div class="rp-lock">${reportsNoAccess()}</div></div>`;
  const m = RP[a.slug];
  const k = rpKey();
  const bar = wsBar('REPORTS · AREAS', a.label, m.ros(VP !== 'desktop'), VP === 'mobile' ? '' : rpPeriod());
  if (VP === 'mobile') return `<div class="ws rp rp--m">${bar}${rpTabs()}<div class="rp-perrow">${rpPeriod()}</div>${m.hero(k)}${m.list(k)}</div>${phoneSheet(m.panel(k), { label: `${a.label} detail` })}`;
  if (VP === 'tablet') return `<div class="ws rp rp--t">${bar}<div class="rp-nav">${rpTabs()}</div>${m.hero(k)}<div class="rp-t2">${m.list(k)}${m.panel(k)}</div></div>`;
  const side = rpWide() && m.side ? m.side(k) : '';
  return `<div class="ws rp">${bar}<div class="rp-nav">${rpTabs()}</div><div class="rp-grid rp-grid--${a.slug} ${side ? 'has-side' : ''}">${m.hero(k)}${m.list(k)}${side}${m.panel(k)}</div></div>`;
}

/* ── actions ── */
ACT['rp.area'] = (slug) => {
  if (!RP[slug] || (slug === 'financial_revenue' && !FOUNDER)) return;
  WSX.rp.area = slug;
  WSX.pending = null;
  WSX.sheet = false;
};
ACT['rp.sel'] = (k) => {
  WSX.rp.sel[WSX.rp.area] = k;
  WSX.pending = null;
};
ACT['rp.open'] = (k) => {
  WSX.rp.sel[WSX.rp.area] = k;
  WSX.pending = null;
  WSX.sheet = true;
};
ACT['rp.month'] = (m) => {
  if (RP_MONTHS.includes(m)) WSX.rp.month = m;
  WSX.pending = null;
  // a close belongs to its period: a new month starts on that month's most urgent close
  const k = WSX.rp.sel.bookkeeping;
  if (k?.startsWith('k:') && !rpCloses().some((c) => c.k === k)) delete WSX.rp.sel.bookkeeping;
};

registerWorkspace({
  id: 'reports', no: 'R+', name: 'REPORTS · AREAS', group: 'office', page: 'reports', hidden: true, view: () => rpView(),
  shape: 'A REPORT', line: 'TEN AREAS. EVERY MARK OPENS ITS RECORDS.',
  states: [
    ['MAIN', []],
    ['SELECTED', [['rp.area', 'compliance'], ['rp.sel', 'd:dl-abc-med']]],
    ['DEEPER', [['rp.area', 'exports'], ['rp.sel', 'x:clients'], ['sim.ask', 'rp:x:clients']]],
    ['PHONE', [['rp.area', 'dispatch_brokerage'], ['rp.sel', 'l:ld-5517']], 'phone'],
  ],
  demos: [
    ['FROM THE OVERVIEW TO A RECORD', [['rp.sel', 'a:compliance', 'COMPLIANCE ON THE LEDGER'], ['rp.area', 'compliance', 'OPEN THE COMPLIANCE REPORT'], ['rp.sel', 'd:dl-rj-ucr', 'UCR · ONE DAY LATE'], ['nav', 'rec/deadline/dl-rj-ucr', 'OPEN IT IN COMPLIANCE'], ['ret', '', 'BACK TO THE REPORT']]],
    ['CHANGE THE PERIOD', [['rp.area', 'filing_history', 'FILING HISTORY'], ['rp.month', 'SEP', 'LAST MONTH · NOTHING FILED'], ['rp.month', 'JUL', 'JULY · Q2 FILED'], ['rp.month', 'OCT', 'THIS MONTH · Q3 FILED']]],
    ['PREPARE AN EXPORT', [['rp.area', 'exports', 'EXPORTS'], ['rp.sel', 'x:clients', 'THE CLIENT LIST'], ['sim.ask', 'rp:x:clients', 'PREPARE EXPORT'], ['sim.ok', 'rp:x:clients', 'CONFIRM · SIMULATED']]],
  ],
  audit: [
    [['rp.area', 'clients']], [['rp.area', 'clients'], ['rp.sel', 'l:insurance']], [['rp.area', 'clients'], ['rp.sel', 'life:PREBUILT']], [['rp.area', 'clients'], ['rp.sel', 'c:c-mt']],
    [['rp.area', 'services']], [['rp.area', 'services'], ['rp.sel', 'l:vehicles']], [['rp.area', 'services'], ['rp.sel', 'l:brokerage']],
    [['rp.area', 'financial_revenue']], [['rp.area', 'financial_revenue'], ['rp.sel', 'i:inv-3309']], [['rp.area', 'financial_revenue'], ['rp.sel', 'st:PAID']],
    [['rp.area', 'filing_history']], [['rp.area', 'filing_history'], ['rp.sel', 'q:ifta-rl-q3']], [['rp.area', 'filing_history'], ['rp.month', 'JUL'], ['rp.sel', 'w:Q2 2026']],
    [['rp.area', 'compliance']], [['rp.area', 'compliance'], ['rp.sel', 'w:21']], [['rp.area', 'compliance'], ['rp.sel', 'k:VEHICLE']],
    [['rp.area', 'dispatch_brokerage']], [['rp.area', 'dispatch_brokerage'], ['rp.sel', 'brk']], [['rp.area', 'dispatch_brokerage'], ['rp.sel', 's:MOVING']],
    [['rp.area', 'bookkeeping']], [['rp.area', 'bookkeeping'], ['rp.sel', 's:3']], [['rp.area', 'bookkeeping'], ['rp.month', 'SEP']], [['rp.area', 'bookkeeping'], ['rp.month', 'AUG']], [['rp.area', 'bookkeeping'], ['rp.sel', 'sub:bk-rj']],
    [['rp.area', 'migration']], [['rp.area', 'migration'], ['rp.sel', 'l:MIGRATION_REVIEW_REQUIRED']], [['rp.area', 'migration'], ['rp.sel', 'm:mig-mt']],
    [['rp.area', 'exports']], [['rp.area', 'exports'], ['rp.sel', 'x:pdf']], [['rp.area', 'exports'], ['rp.sel', 'x:filing']],
    [['rp.sel', 'r:request:req-hf-mc']], [['rp.sel', 'm:mig-bl']],
  ],
  phoneAct: { 'rp.sel': 'rp.open' },
  enter: (a, b) => {
    if (a && RP[a]) WSX.rp.area = a;
    if (b) WSX.rp.sel[WSX.rp.area] = b;
  },
  label: () => `REPORTS · ${rpArea().label}`,
  route: (s) => {
    if (s[0] !== 'reports' || !s[1]) return false;
    const a = RP_AREAS.find((x) => x.slug === s[1]);
    if (!a) return false;
    WSX.rp.area = a.slug;
    return true;
  },
});
