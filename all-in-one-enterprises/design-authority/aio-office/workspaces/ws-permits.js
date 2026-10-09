/*
 * 01 — PERMITTING & AUTHORITIES. Application-centred: the six sections (choose) · the application rail, where every
 * filing hangs at its station — PREPARATION → REVIEW → SUBMITTED / AT AGENCY → COMPLETE — and BOC-3 waits on its
 * partner siding (work) · the selected application as a file: requirements, documents, agency, owner, the countdown
 * and one next step (act). The records are REQUESTS (office-data.js); the requirements, agencies and history below are
 * lane-local SAMPLE detail. Moving an application is SIMULATED and saves nothing.
 */
WSX.pm = { app: 'req-hf-mc', filter: 'all', station: 'prep' };

const PM_STATIONS = [
  ['prep', 'PREPARATION', 'PREP'],
  ['review', 'REVIEW', 'REVIEW'],
  ['agency', 'SUBMITTED / AT AGENCY', 'AGENCY'],
  ['done', 'COMPLETE', 'DONE'],
];
const PM_SECTIONS = [
  ['tags', 'TAGS / REGISTRATION', 'id-card', 'TAGS / REG'],
  ['fuel', 'FUEL / ROAD TAX PERMITS', 'fuel', 'FUEL / ROAD TAX'],
  ['auth', 'OPERATING AUTHORITIES', 'shield-check', 'AUTHORITIES'],
  ['boc3', 'BOC-3', 'letter', 'BOC-3'],
  ['llc', 'LLC / INC', 'company', 'LLC / INC'],
  ['other', 'OTHER PERMITS', 'folder', 'OTHER'],
];
/** SAMPLE · what each application needs, who it waits on and what happened — consistent with REQUESTS and DOCS. */
const PM_META = {
  'req-hf-mc': { short: 'MC REINSTATEMENT', agency: 'FMCSA', waiting: 'CLIENT', waitFor: 'EIN LETTER', reqs: [['REINSTATEMENT REQUEST', 'PREPARED', 'ok'], ['EIN CONFIRMATION LETTER (CP 575)', 'NOT RECEIVED', 'bad'], ['INSURANCE FILED WITH FMCSA', 'ON FILE', 'ok']], hist: [['OCT 6', 'EIN LETTER REQUESTED FROM THE CLIENT'], ['OCT 2', 'AUTHORITY FOUND INACTIVE · CASE OPENED']] },
  'req-rj-ucr': { short: 'UCR RENEWAL', agency: 'UCR PLAN · BASE STATE TN', waiting: 'CLIENT', waitFor: 'PAYMENT AUTHORIZATION', reqs: [['FLEET SIZE FOR THE FEE BRACKET', 'CONFIRMED', 'ok'], ['PAYMENT AUTHORIZATION', 'NOT RECEIVED', 'bad']], hist: [['OCT 7', 'DUE DATE PASSED'], ['OCT 1', 'PAYMENT AUTHORIZATION REQUESTED'], ['SEP 15', 'RENEWAL OPENED']] },
  'req-abc-irp': { short: 'IRP · UNIT 1', agency: 'FLORIDA HSMV · IRP', waiting: 'AIO', waitFor: 'STAFF REVIEW', reqs: [['CAB CARD APPLICATION', 'IN REVIEW', 'gold'], ['TITLE · UNIT 1', 'RECEIVED', 'ok'], ['PROOF OF INSURANCE', 'ON FILE', 'ok']], hist: [['OCT 5', 'CAB CARD APPLICATION UPLOADED'], ['SEP 28', 'APPLICATION STARTED']] },
  'req-dh-ifta': { short: 'IFTA LICENSE & DECALS', agency: 'OKLAHOMA TAX COMMISSION', waiting: 'AGENCY', waitFor: 'THE AGENCY', reqs: [['IFTA LICENSE APPLICATION', 'APPROVED', 'ok'], ['2027 DECAL ORDER', 'SUBMITTED', 'gold']], hist: [['TODAY', 'SENT TO THE OKLAHOMA TAX COMMISSION'], ['6 HRS AGO', 'APPLICATION APPROVED BY STAFF']] },
  'req-mt-boc3': { short: 'BOC-3 FILING', agency: 'FMCSA · VIA A PROCESS AGENT', waiting: 'PARTNER', waitFor: 'PROCESS AGENT PARTNER', reqs: [['COMPANY DETAILS', 'RECEIVED', 'ok'], ['PROCESS AGENT FILING', 'PARTNER PENDING', 'mute']], hist: [['40 MIN AGO', 'NOTE · DO NOT PROMISE A DATE'], ['OCT 2', 'CLIENT PREBUILT · NOT ACTIVE YET']] },
  'req-abc-llc': { short: 'LLC ANNUAL REPORT', agency: 'FLORIDA DIVISION OF CORPORATIONS', waiting: 'AIO', waitFor: 'PREPARATION', reqs: [['REGISTERED AGENT', 'CONFIRMED', 'ok'], ['PRINCIPAL ADDRESS', 'CONFIRMED', 'ok'], ['MEMBERS AND MANAGERS', 'TO CONFIRM', 'warn']], hist: [['OCT 3', 'PREPARATION STARTED']] },
  'req-tk-os': { short: 'OVERSIZE · GA\u00a0→\u00a0AL', agency: 'GEORGIA DOT · ALABAMA DOT', waiting: null, waitFor: '', reqs: [['ROUTE AND DIMENSIONS', 'RECEIVED', 'ok'], ['GEORGIA PERMIT', 'ISSUED', 'ok'], ['ALABAMA PERMIT', 'ISSUED', 'ok']], hist: [['OCT 2', 'BOTH PERMITS ISSUED'], ['SEP 29', 'APPLICATIONS SENT']] },
};
const PM_WHO = [['CLIENT', 'THE CLIENT', 'profile'], ['AIO', 'AIO', 'company'], ['AGENCY', 'THE AGENCY', 'id-card'], ['PARTNER', 'A PARTNER', 'link']];

/* ── state of an application (sample overrides apply) ── */
const pmStatus = (r) => ov(`request:${r.id}`, r.status);
const pmSec = (r) => PM_SECTIONS.find(([, n]) => n === r.section) || PM_SECTIONS[5];
function pmStage(r) {
  const w = pmStatus(r)[0];
  if (w === 'COMPLETED') return 'done';
  if (/AGENCY|SUBMITTED/.test(w)) return 'agency';
  if (w === 'UNDER REVIEW') return 'review';
  if (w === 'PARTNER PENDING') return 'partner';
  return 'prep';
}
function pmWaiting(r) {
  const st = pmStage(r);
  if (st === 'done') return null;
  if (st === 'agency') return ['AGENCY', PM_META[r.id].agency];
  if (st === 'partner') return ['PARTNER', PM_META[r.id].waitFor];
  if (st === 'review') return ['AIO', 'STAFF REVIEW'];
  return ov(`pmwait:${r.id}`, [PM_META[r.id].waiting, PM_META[r.id].waitFor]);
}
const pmReqs = (r) => PM_META[r.id].reqs.map(([t, w, tone], i) => {
  const o = WSX.over[`pmrq:${r.id}:${i}`];
  return o ? [t, o[0], o[1], true] : [t, w, tone, false];
});
/** Days from today (OCT 8, 2026) to a sample date written 'OCT 10, 2026'; null when there is no date. */
function pmDays(due) {
  const m = /^([A-Z]{3}) (\d{1,2}), (\d{4})$/.exec(due || '');
  if (!m) return null;
  return Math.round((Date.UTC(Number(m[3]), 'JANFEBMARAPRMAYJUNJULAUGSEPOCTNOVDEC'.indexOf(m[1]) / 3, Number(m[2])) - Date.UTC(2026, 9, 8)) / 864e5);
}
/** The countdown: [figure, word, tone]. */
function pmCount(r) {
  const d = pmDays(r.due);
  if (pmStage(r) === 'done') return ['DONE', 'COMPLETE', 'ok'];
  if (d == null) return ['—', 'NO DUE DATE', 'mute'];
  if (d < 0) return [String(-d), -d === 1 ? 'DAY LATE' : 'DAYS LATE', 'bad'];
  if (d === 0) return ['0', 'DUE TODAY', 'bad'];
  return [String(d), d === 1 ? 'DAY LEFT' : 'DAYS LEFT', d <= 7 ? 'warn' : d <= 30 ? 'gold' : 'mute'];
}
const PM_RANK = { bad: 0, warn: 1, gold: 2, mute: 3, ok: 4 };
const pmOrder = (list) => [...list].sort((a, b) => PM_RANK[pmStatus(a)[1]] - PM_RANK[pmStatus(b)[1]] || (pmDays(a.due) ?? 999) - (pmDays(b.due) ?? 999));
/** Does this application match the active filter (a section, or a state from the readouts)? */
function pmMatch(r, f = WSX.pm.filter) {
  if (f === 'all') return true;
  if (f === 'blocked') return pmStatus(r)[1] === 'bad';
  if (f === 'agency') return pmStage(r) === 'agency';
  if (f === 'due') return pmStage(r) !== 'done' && pmDays(r.due) != null && pmDays(r.due) <= 14;
  return pmSec(r)[0] === f;
}
const pmFilterName = (f) => ({ all: 'ALL SECTIONS', blocked: 'BLOCKED', agency: 'AT AN AGENCY', due: 'DUE IN 14 DAYS' })[f] ?? PM_SECTIONS.find(([k]) => k === f)?.[1] ?? '';

/* ── a folder: one application on the rail ── */
function pmFolder(r, { pos = '', mini = false } = {}) {
  const m = PM_META[r.id];
  const s = pmStatus(r);
  const sec = pmSec(r);
  const c = ACCOUNTS[r.client];
  const cd = pmCount(r);
  const on = r.id === WSX.pm.app;
  const dim = !pmMatch(r);
  const reqs = pmReqs(r);
  const pips = reqs.map(([t, w, tone]) => `<i class="pm-pip pm-pip--${tone}" title="${t} · ${w}"></i>`).join('');
  const lines = WIDE && !mini ? `<span class="pm-f__reqs">${reqs.map(([t, w, tone]) => `<span><i class="pm-pip pm-pip--${tone}"></i><em>${t}</em></span>`).join('')}</span>` : '';
  return `<button type="button" class="pm-f ${pos} ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''} pm-f--${s[1]}" data-a="pm.app" data-v="${r.id}" aria-pressed="${on}" aria-label="${r.title} · ${c.name} · ${s[0]}" title="${r.title} · ${c.name}">
    <span class="pm-f__tab">${ico(sec[2])}${sec[3]}</span>
    <span class="pm-f__c">${badge(c)}<span>${c.name}</span></span>
    <b class="pm-f__t">${m.short}</b>
    ${sw(s)}${lines}
    <span class="pm-f__ft"><span class="pm-f__cd pm-f__cd--${cd[2]}">${cd[2] === 'ok' ? `DONE ${r.due.replace(', 2026', '')}` : cd[0] === '—' ? 'NO DATE' : daysWord(pmDays(r.due))}</span><span class="pm-pips">${pips}</span></span>
    ${on ? `<i class="pm-f__ring" data-swap="ring:${r.id}" aria-hidden="true"></i>` : ''}
  </button>`;
}

/* ── the rail: four stations on one line, folders hanging above and below, BOC-3 on its siding ── */
function pmRail() {
  const by = Object.fromEntries(PM_STATIONS.map(([k]) => [k, []]));
  const partner = [];
  for (const r of pmOrder(vals(REQUESTS))) (pmStage(r) === 'partner' ? partner : by[pmStage(r)]).push(r);
  const sel = REQUESTS[WSX.pm.app];
  const si = PM_STATIONS.findIndex(([k]) => k === pmStage(sel));
  let col = 1;
  let side = 0; // the folders zigzag along the whole line: above, below, above…
  const parts = [];
  PM_STATIONS.forEach(([k, label], i) => {
    const list = by[k];
    const off = side;
    const n = Math.max(1, Math.ceil((Math.max(list.length, 1) + off) / 2));
    const state = si < 0 ? '' : i < si ? 'is-past' : i === si ? 'is-here' : i === si + 1 ? 'is-next' : '';
    parts.push(`<div class="pm-st ${state}" style="grid-column:${col} / span ${n}"><span class="pm-st__p" data-swap="st:${k}:${state}" title="${label}"><b>${String(i + 1).padStart(2, '0')}</b><span>${WIDE ? label : label.replace(' / ', ' /<br>')}</span><i>${list.length}</i>${state === 'is-next' ? '<em>NEXT</em>' : ''}</span></div>`);
    const slot = (j) => [col + Math.floor((off + j) / 2), (off + j) % 2];
    list.forEach((r, j) => {
      const [c, b] = slot(j);
      parts.push(`<div class="pm-slot pm-slot--${b ? 'b' : 'a'}" style="grid-column:${c}">${pmFolder(r)}</div>`);
    });
    if (!list.length) {
      const [c, b] = slot(0);
      parts.push(`<div class="pm-slot pm-slot--${b ? 'b' : 'a'}" style="grid-column:${c}"><span class="pm-ghost">NOTHING AT THIS STATION</span></div>`);
    }
    side = (off + Math.max(list.length, 1)) % 2;
    col += n;
  });
  const siding = `<div class="pm-siding ${pmStage(sel) === 'partner' ? 'is-here' : ''}"><span class="pm-siding__l"><b>PARTNER / MANUAL</b><small>OFF THE RAIL</small></span><span class="pm-siding__f">${partner.map((r) => pmFolder(r, { pos: 'pm-f--side' })).join('') || '<span class="pm-ghost">NOTHING WITH A PARTNER</span>'}</span><span class="pm-siding__n">${ico('info')}<span>BOC-3 IS A PARTNER / MANUAL WORKFLOW UNTIL A PROVIDER IS READY</span></span></div>`;
  const f = WSX.pm.filter;
  const shown = vals(REQUESTS).filter((r) => pmMatch(r)).length;
  const head = `<header class="pm-stage__h"><span class="pm-stage__t">THE APPLICATION RAIL</span><span class="pm-stage__n">${f === 'all' ? `${vals(REQUESTS).length} APPLICATIONS · 6 SECTIONS` : `${shown} OF ${vals(REQUESTS).length} · ${pmFilterName(f)}`}</span></header>`;
  const spur = `<i class="pm-spur ${pmStage(sel) === 'partner' ? 'is-here' : ''}" style="grid-column:1;grid-row:2 / 4" aria-hidden="true"></i>`;
  return `<section class="pm-stage">${head}<div class="pm-rail" style="grid-template-columns:repeat(${col - 1}, minmax(0, 1fr))">${spur}${parts.join('')}</div>${siding}</section>`;
}

/* ── who has the ball ── */
function pmWaitStrip() {
  const open = pmOrder(vals(REQUESTS)).filter((r) => pmWaiting(r));
  const cells = PM_WHO.map(([k, label, icon]) => {
    const mine = open.filter((r) => pmWaiting(r)[0] === k);
    const rows = mine.map((r) => `<div class="pk pm-w ${r.id === WSX.pm.app ? 'is-sel' : ''} ${pmMatch(r) ? '' : 'is-dim'}" data-a="pm.app" data-v="${r.id}" title="${r.title} · ${pmWaiting(r)[1]}"><b class="pk__t">${PM_META[r.id].short}</b><span class="pk__s">${ACCOUNTS[r.client].b} · ${pmWaiting(r)[1]}</span></div>`).join('');
    return `<div class="pm-wc"><div class="pm-wc__h">${ico(icon)}<span>${label}</span><b>${mine.length}</b></div>${rows || '<span class="pm-wc__none">NOTHING WAITING</span>'}</div>`;
  }).join('');
  return rgn('WAITING ON', `${open.length} OPEN`, '', `<div class="pm-wcs">${cells}</div>`, 'pm-wait', 'pm-wait');
}

/* ── the application file ── */
function pmTrack(r) {
  const st = pmStage(r);
  if (st === 'partner') return `<div class="pm-trk pm-trk--side"><i></i><span>PARTNER / MANUAL · OFF THE RAIL</span></div>`;
  const si = PM_STATIONS.findIndex(([k]) => k === st);
  return `<div class="pm-trk">${PM_STATIONS.map(([k, , s], i) => `<span class="${i < si ? 'd' : i === si ? 'n' : ''}"><i>${i < si ? ico('pass') : ''}</i><b>${s}</b></span>`).join('')}</div>`;
}
function pmNext(r) {
  const key = `request:${r.id}`;
  const s = pmStatus(r);
  const st = pmStage(r);
  const c = ACCOUNTS[r.client];
  const who = c.contact.split(' · ')[0];
  if (st === 'done') return nextBlock(r.id === 'req-tk-os' ? 'PERMITS ISSUED · NOTHING OPEN' : 'COMPLETE FOR THIS VISIT', '', 'done');
  if (st === 'partner') return nextBlock('NO DATE TO PROMISE · PARTNER PENDING', '', 'calm');
  if (r.id === 'req-hf-mc') {
    if (WSX.over[`pmrq:${r.id}:1`]) return nextBlock(`WAITING ON ${who} FOR THE EIN LETTER`, '', 'calm');
    return nextBlock('THE EIN LETTER IS MISSING', simBtn(`pm:doc:${r.id}`, { label: 'REQUEST THE MISSING DOCUMENT', effect: `ASKS ${who} AGAIN FOR THE EIN LETTER (CP 575) IN THE CLIENT OFFICE.`, apply: () => (WSX.over[`pmrq:${r.id}:1`] = ['REQUESTED AGAIN', 'warn']), rec: key, primary: true }));
  }
  if (r.id === 'req-rj-ucr') {
    if (WSX.over[`pmrq:${r.id}:1`]) return nextBlock(`WAITING ON ${who} TO AUTHORIZE THE FEE`, `<button type="button" class="wbtn" data-a="go" data-v="comp:dl-rj-ucr">${ico('shield-check')}SEE THE DEADLINE</button>`, 'calm');
    return nextBlock('THE CLIENT MUST AUTHORIZE THE UCR FEE', `${simBtn(`pm:pay:${r.id}`, { label: 'ASK FOR PAYMENT AUTHORIZATION', effect: `ASKS ${who} TO AUTHORIZE THE UCR FEE IN THE CLIENT OFFICE.`, apply: () => (WSX.over[`pmrq:${r.id}:1`] = ['ASKED AGAIN', 'warn']), rec: key, primary: true })}<button type="button" class="wbtn" data-a="go" data-v="comp:dl-rj-ucr">${ico('shield-check')}SEE THE DEADLINE</button>`);
  }
  if (r.id === 'req-abc-llc') {
    if (WSX.over[`pmrq:${r.id}:2`]) return nextBlock(`WAITING ON ${who} TO CONFIRM MEMBERS`, '', 'calm');
    return nextBlock(`CONFIRM MEMBERS WITH ${who}`, simBtn(`pm:conf:${r.id}`, { label: 'REQUEST CONFIRMATION', effect: `ASKS ${who} TO CONFIRM THE MEMBERS AND MANAGERS ON FILE.`, apply: () => { WSX.over[`pmrq:${r.id}:2`] = ['REQUESTED', 'warn']; WSX.over[`pmwait:${r.id}`] = ['CLIENT', 'MEMBER DETAILS']; }, rec: key, primary: true }));
  }
  if (st === 'review') return nextBlock('REVIEW DONE · SUBMIT TO THE STATE', simBtn(`pm:sub:${r.id}`, { label: 'MARK SUBMITTED', effect: `MOVES THE APPLICATION TO ${PM_META[r.id].agency}. IT THEN WAITS ON THE AGENCY.`, apply: () => { WSX.over[key] = ['AWAITING AGENCY', 'gold']; WSX.over[`pmrq:${r.id}:0`] = ['SUBMITTED', 'gold']; }, rec: key, primary: true }));
  if (st === 'agency') return nextBlock(`WAITING ON ${PM_META[r.id].agency}`, simBtn(`pm:iss:${r.id}`, { label: 'RECORD AGENCY APPROVAL', effect: 'RECORDS THE AGENCY’S APPROVAL AND COMPLETES THE APPLICATION.', apply: () => (WSX.over[key] = ['COMPLETED', 'ok']), rec: key, primary: true }));
  return nextBlock(s[0], '', 'calm');
}
function pmFile() {
  const r = REQUESTS[WSX.pm.app];
  const m = PM_META[r.id];
  const s = pmStatus(r);
  const sec = pmSec(r);
  const c = ACCOUNTS[r.client];
  const cd = pmCount(r);
  const key = `request:${r.id}`;
  const wait = pmWaiting(r);
  const reqs = pmReqs(r);
  const inN = reqs.filter(([, , t]) => t === 'ok').length;
  const plate = `<div class="pm-plate" data-swap="pl:${r.id}"><span class="pm-plate__i">${ico(sec[2])}</span><span class="pm-plate__t"><small>${sec[1]} · ${c.name}</small><b>${r.title}</b>${sw(s)}</span><span class="pm-cd pm-cd--${cd[2]}"><b>${cd[2] === 'ok' ? ico('pass') : cd[0]}</b><small>${cd[1]}</small></span></div>`;
  const reqList = `<div class="pm-reqs"><div class="sec-l"><span>REQUIREMENTS</span><span>${inN} OF ${reqs.length} IN</span></div>${reqs.map(([t, w, tone, sim]) => `<div class="pm-req pm-req--${tone} ${sim ? 'is-sim' : ''}"><i class="pm-pip pm-pip--${tone}"></i><b>${t}</b>${sw([w, tone])}</div>`).join('')}</div>`;
  const docs = `<div class="pm-docs"><div class="sec-l"><span>DOCUMENTS</span><span>${r.docs.length || ''}</span></div>${r.docs.length ? r.docs.map(docChip).join('') : `<div class="ntb">${ico('folder')}<span>NO DOCUMENT ON FILE YET</span></div>`}</div>`;
  const links = `<div class="pm-links"><button type="button" class="pm-link" data-a="go" data-v="client:${c.id}">${badge(c)}<span>${c.name}</span>${ico('fwd')}</button>${r.vehicles.map((v) => `<button type="button" class="pm-link" data-a="go" data-v="fleet:${v}:registration">${ico('truck')}<span>${VEHICLES[v].unit}</span>${ico('fwd')}</button>`).join('')}</div>`;
  const own = `<div class="pm-own">${r.owner ? av(r.owner) : '<span class="av av--none">—</span>'}<span><b>${staffName(r.owner)}</b><small>${r.owner ? STAFF[r.owner].area : 'NO AIO OWNER · PARTNER WORKFLOW'}</small></span>${r.owner ? simBtn(`pm:own:${r.id}`, { label: 'REASSIGN', effect: 'MOVES THIS APPLICATION TO ANOTHER STAFF MEMBER.', apply: () => {}, rec: key, founder: true, sm: true }) : ''}</div>`;
  const fx = facts([['AGENCY', m.agency], ['WAITING ON', wait ? `${PM_WHO.find(([k]) => k === wait[0])[1]} · ${wait[1]}` : 'NOTHING · COMPLETE'], ['DUE', r.due === '—' ? 'NO DUE DATE' : r.due, cd[2] === 'ok' ? '' : cd[0] === '—' ? '' : `${cd[0]} ${cd[1]}`], ['SECTION', r.section]]);
  const honest = pmStage(r) === 'partner' ? `${ntb('<b>BOC-3 IS A PARTNER / MANUAL WORKFLOW.</b> AIO DOES NOT FILE IT YET.')}${c.life !== 'ACTIVE' ? ntb(`<b>${LIFE[c.life][0]}.</b> NOTHING IS FILED UNTIL THE CLIENT CONFIRMS.`) : ''}` : '';
  const hist = mhist(key, m.hist);
  const also = vals(REQUESTS).filter((x) => x.client === r.client && x.id !== r.id);
  const prof = wsById('ready') ? vals(PROFILES).find((p) => p.client === r.client) : null;
  const rrN = prof ? (typeof rrDone === 'function' ? rrDone(prof) : prof.done) : 0;
  const alsoHtml = also.length || prof ? `<div class="pm-also"><div class="sec-l"><span>ALSO FOR ${c.name}</span><span>${also.length + (prof ? 1 : 0)}</span></div>${also.map((x) => `<button type="button" class="pm-also__r" data-a="pm.app" data-v="${x.id}" title="${x.title}">${ico(pmSec(x)[2])}<span><b>${PM_META[x.id].short}</b><small>${PM_STATIONS.find(([k]) => k === pmStage(x))?.[1] ?? 'PARTNER / MANUAL'}</small></span>${sw(pmStatus(x))}</button>`).join('')}${prof ? `<button type="button" class="pm-also__r" data-a="go" data-v="ready:${c.id}">${ico('tests')}<span><b>ROAD READY · ${rrN} OF ${prof.total}</b><small>AVAILABLE · NO ENGAGEMENT STATE</small></span>${ico('fwd')}</button>` : ''}</div>` : '';
  const body = WSX.device === 'wide'
    ? `${pmNext(r)}${honest}<div class="pm-cols"><div class="pm-col">${reqList}${docs}${alsoHtml}</div><div class="pm-col">${links}${own}${fx}${hist}</div></div>`
    : `${pmNext(r)}${honest}${reqList}${docs}${links}${own}${fx}${hist}${alsoHtml}`;
  return `<section class="rg cx pm-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${r.id}"><div class="cx__crumb"><span>PERMITTING</span>${ico('fwd')}<span>${sec[1]}</span>${ico('fwd')}<span>${c.b}</span></div>${plate}${pmTrack(r)}</div></header><div class="cx__b" data-keep="pm-cx" data-swap="b:${r.id}">${body}</div></section>`;
}

/* ── bar, sections, compositions ── */
function pmBar() {
  const all = vals(REQUESTS);
  const open = all.filter((r) => pmStage(r) !== 'done').length;
  const blocked = all.filter((r) => pmStatus(r)[1] === 'bad').length;
  const agency = all.filter((r) => pmStage(r) === 'agency').length;
  const due = all.filter((r) => pmMatch(r, 'due')).length;
  const f = WSX.pm.filter;
  if (VP === 'mobile') return wsBar('01 · WORK', 'PERMITTING', [ro(open, 'OPEN'), ro(blocked, 'BLOCKED', { tone: 'bad' }), ro(agency, 'AT AGENCY', { tone: 'gold' })].join(''));
  return wsBar('01 · WORK', 'PERMITTING & AUTHORITIES', [ro(open, 'OPEN', { a: 'pm.filter', v: 'all', on: f === 'all' }), ro(blocked, 'BLOCKED', { tone: 'bad', a: 'pm.filter', v: 'blocked', on: f === 'blocked' }), ro(due, 'DUE IN 14 DAYS', { tone: 'warn', a: 'pm.filter', v: 'due', on: f === 'due' }), ro(agency, 'AT AGENCY', { tone: 'gold', a: 'pm.filter', v: 'agency', on: f === 'agency' })].join(''));
}
function pmSections(scroll = false) {
  const all = vals(REQUESTS);
  const f = PM_SECTIONS.some(([k]) => k === WSX.pm.filter) ? WSX.pm.filter : 'all';
  return seg([['all', 'ALL SECTIONS', all.length], ...PM_SECTIONS.map(([k, n, , s]) => [k, WIDE || VP === 'desktop' ? n : s, all.filter((r) => pmSec(r)[0] === k).length, k === 'boc3'])], f, 'pm.filter', scroll ? 'wseg--scroll pm-secs' : 'pm-secs');
}
function permitsView() {
  const r = REQUESTS[WSX.pm.app];
  if (VP === 'mobile') {
    const all = pmOrder(vals(REQUESTS));
    const stn = WSX.pm.station;
    const counts = Object.fromEntries(PM_STATIONS.map(([k]) => [k, all.filter((x) => pmStage(x) === k).length]));
    const rail = `<div class="pm-mrail" role="tablist">${PM_STATIONS.map(([k, , s], i) => `<button type="button" role="tab" class="pm-mst ${k === stn ? 'is-on' : ''}" data-a="pm.station" data-v="${k}" aria-selected="${k === stn}"><i>${counts[k]}</i><span>${s}</span><small>${String(i + 1).padStart(2, '0')}</small></button>`).join('')}</div>`;
    const list = all.filter((x) => pmStage(x) === stn && pmMatch(x));
    const side = stn === 'prep' ? all.filter((x) => pmStage(x) === 'partner' && pmMatch(x)) : [];
    const rows = list.map((x) => pmFolder(x, { pos: 'pm-f--row', mini: true })).join('') || `<span class="pm-ghost pm-ghost--m">NOTHING ${stn === 'done' ? 'COMPLETE' : 'HERE'} IN ${pmFilterName(WSX.pm.filter)}</span>`;
    const sideRows = side.length ? `<div class="pm-msiding"><span class="pm-siding__l"><b>PARTNER / MANUAL</b><small>OFF THE RAIL</small></span>${side.map((x) => pmFolder(x, { pos: 'pm-f--row', mini: true })).join('')}</div>` : '';
    return `<div class="ws pm pm--m">${pmBar()}${pmSections(true)}<section class="pm-stage pm-stage--m">${rail}<div class="pm-mlist" data-swap="ml:${stn}:${WSX.pm.filter}">${rows}${sideRows}</div></section></div>${phoneSheet(pmFile(), { label: 'Application file' })}`;
  }
  if (VP === 'tablet') return `<div class="ws pm pm--t">${pmBar()}${pmSections(true)}${pmRail()}<div class="pm-t2">${pmWaitStrip()}${pmFile()}</div></div>`;
  return `<div class="ws pm">${pmBar()}${pmSections()}<div class="pm-grid"><div class="pm-main">${pmRail()}${pmWaitStrip()}</div>${pmFile()}</div></div>`;
}

/* ── actions ── */
ACT['pm.app'] = (id) => {
  WSX.pm.app = id;
  if (!pmMatch(REQUESTS[id])) WSX.pm.filter = 'all';
  const st = pmStage(REQUESTS[id]);
  WSX.pm.station = st === 'partner' ? 'prep' : st;
  WSX.pending = null;
};
ACT['pm.open'] = (id) => {
  ACT['pm.app'](id);
  WSX.sheet = true;
};
ACT['pm.filter'] = (f) => {
  WSX.pm.filter = f;
  WSX.pending = null;
  const list = pmOrder(vals(REQUESTS)).filter((r) => pmMatch(r));
  if (list.length && !pmMatch(REQUESTS[WSX.pm.app])) {
    WSX.pm.app = list[0].id;
    const st = pmStage(list[0]);
    WSX.pm.station = st === 'partner' ? 'prep' : st;
  }
};
ACT['pm.station'] = (k) => {
  WSX.pm.station = k;
  WSX.pending = null;
};

registerWorkspace({
  id: 'permits', no: '01', name: 'PERMITTING & AUTHORITIES', group: 'auth', page: 'work', lane: 'permitting', view: () => permitsView(),
  shape: 'AN APPLICATION', line: 'EVERY FILING: WHERE IT IS, WHAT IT NEEDS.',
  states: [['MAIN', []], ['SELECTED', [['pm.app', 'req-abc-irp']]], ['DEEPER', [['pm.app', 'req-abc-irp'], ['sim.ask', 'pm:sub:req-abc-irp']]], ['PHONE', [['pm.open', 'req-hf-mc']], 'phone']],
  demos: [
    ['MOVE AN APPLICATION', [['pm.app', 'req-abc-irp', 'IRP · UNIT 1 · UNDER REVIEW'], ['sim.ask', 'pm:sub:req-abc-irp', 'MARK SUBMITTED'], ['sim.ok', 'pm:sub:req-abc-irp', 'CONFIRM · IT MOVES TO THE AGENCY']]],
    ['CHASE A MISSING DOCUMENT', [['pm.app', 'req-hf-mc', 'MC REINSTATEMENT · BLOCKED'], ['sim.ask', 'pm:doc:req-hf-mc', 'REQUEST THE EIN LETTER'], ['sim.ok', 'pm:doc:req-hf-mc', 'CONFIRM · SIMULATED']]],
    ['WORK BY SECTION', [['pm.filter', 'auth', 'OPERATING AUTHORITIES'], ['pm.filter', 'boc3', 'BOC-3 · PARTNER / MANUAL'], ['pm.filter', 'other', 'OTHER PERMITS'], ['pm.filter', 'all', 'ALL SECTIONS']]],
  ],
  audit: [
    [['pm.filter', 'tags']], [['pm.filter', 'fuel']], [['pm.filter', 'auth']], [['pm.filter', 'boc3']], [['pm.filter', 'llc']], [['pm.filter', 'other']],
    [['pm.filter', 'blocked']], [['pm.filter', 'due']], [['pm.filter', 'agency']],
    [['pm.app', 'req-rj-ucr']], [['pm.app', 'req-dh-ifta']], [['pm.app', 'req-mt-boc3']], [['pm.app', 'req-abc-llc']], [['pm.app', 'req-tk-os']],
    [['pm.app', 'req-abc-irp'], ['sim.ok', 'pm:sub:req-abc-irp']], [['pm.app', 'req-rj-ucr'], ['sim.ask', 'pm:pay:req-rj-ucr']],
    [['pm.station', 'review']], [['pm.station', 'done']],
  ],
  phoneAct: { 'pm.app': 'pm.open' },
  enter: (a, b) => {
    if (a === 'sec') return void Object.assign(WSX.pm, { filter: b || 'all' });
    if (REQUESTS[a]) ACT['pm.app'](a);
  },
  label: () => PM_META[WSX.pm.app]?.short ?? 'PERMITTING',
  route: (s) => {
    if (s[0] === 'work' && s[1] === 'permitting') return true;
    if (s[0] === 'rec' && s[1] === 'request' && REQUESTS[s[2]]) return ACT['pm.app'](s[2]), (WSX.pm.filter = 'all'), true;
    return false;
  },
});
