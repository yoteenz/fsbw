/*
 * LANE 10 — DRIVERS & CARRIERS. Credential-centred: the people (drivers on file and applicants) · the selected driver's
 * credentials drawn as the cards they carry (CDL, medical card) with a timeline of how close each expiry is, and what
 * they connect to (the truck, the carrier, the compliance deadline) · the credential panel with the one next step.
 * MATCHING lays the applications on their path to a decision; APPROVALS shows who drives for whom. Credential
 * verification and approvals are not built in the live app, and say so in place.
 */
WSX.dr = { sec: 'credentials', driver: 'd-abc-1', app: 'ap-2', cred: 'med', focus: 'd' };

const DR_SECS = [['matching', 'MATCHING'], ['credentials', 'CREDENTIALS'], ['approvals', 'APPROVALS']];
/** The application path, as the Batch 1 record draws it. The decision is the client's, outside AIO today. */
const DR_PATH = [['RECEIVED', 'RECEIVED'], ['UNDER REVIEW', 'UNDER REVIEW'], ['DOCUMENTS NEEDED', 'DOCUMENTS'], ['INTERVIEW SCHEDULED', 'INTERVIEW'], ['DECISION', 'DECISION']];
const DR_MON = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
/** SAMPLE history the records do not carry (from the deadlines and loads they link to). */
const DR_HIST = {
  'd-abc-1': [['OCT 1', 'MEDICAL CARD ENTERED THE 30-DAY WINDOW'], ['OCT 29, 2024', 'CURRENT MEDICAL CARD ISSUED']],
  'd-rl-1': [['DEC 1, 2025', 'LAST CLEARINGHOUSE QUERY · NO VIOLATIONS']],
  'd-tk-1': [['OCT 7', 'ON LOAD 5520 · UNIT 07']],
};

/* ── dates: 'OCT 29, 2026' (to the day) or 'SEP 2030' (to the month), against TODAY · OCT 8, 2026 ── */
function drDate(s) {
  const m = /([A-Z]{3})(?: (\d{1,2}),)? (\d{4})$/.exec(s || '');
  return m ? { y: Number(m[3]), m: DR_MON[m[1]], d: m[2] ? Number(m[2]) : null } : null;
}
function drSpan(s) {
  const dt = drDate(s);
  const days = Math.round((Date.UTC(dt.y, dt.m, dt.d ?? 15) - Date.UTC(2026, 9, 8)) / 86400000);
  const months = dt.y * 12 + dt.m - (2026 * 12 + 9);
  const exact = dt.d != null && days <= 90;
  return { days, months, exact, n: exact ? days : months < 24 ? months : Math.floor(months / 12), unit: exact ? (days === 1 ? 'DAY' : 'DAYS') : months < 24 ? (months === 1 ? 'MONTH' : 'MONTHS') : 'YEARS' };
}
/** The timeline is stretched where the decisions are: the next 30 and 90 days, then the year, then four years. */
const DR_AX = [[0, 0], [30, 24], [90, 42], [365, 66], [1460, 100]];
function drX(days) {
  const d = Math.max(0, Math.min(1460, days));
  for (let i = 1; i < DR_AX.length; i++) if (d <= DR_AX[i][0]) return DR_AX[i - 1][1] + ((d - DR_AX[i - 1][0]) / (DR_AX[i][0] - DR_AX[i - 1][0])) * (DR_AX[i][1] - DR_AX[i - 1][1]);
  return 100;
}

/* ── a driver's credentials, from the record (and the compliance deadlines that watch them) ── */
const drDues = (d) => vals(DUES).filter((x) => x.links.includes(`driver:${d.id}`));
function drCreds(d) {
  const [cls, state, exp] = d.cdl.split(' · ');
  const medDue = drDues(d).find((x) => x.kind === 'DRIVER CREDENTIAL');
  const cq = drDues(d).find((x) => /CLEARINGHOUSE/.test(x.what));
  const list = [
    { k: 'cdl', tag: 'CDL', label: `CDL · CLASS ${cls.split('-')[1]}`, short: 'CDL', name: 'COMMERCIAL DRIVER’S LICENSE', exp: exp.replace('EXP ', ''), cls: cls.split('-')[1], state, verb: 'EXPIRES' },
    { k: 'med', tag: 'MEDICAL', label: 'MEDICAL CARD', short: 'MEDICAL CARD', name: 'MEDICAL EXAMINER’S CERTIFICATE', exp: d.med.split(' · EXP ')[1], due: medDue, verb: 'EXPIRES' },
    ...(cq ? [{ k: 'cq', tag: 'QUERY', label: 'CLEARINGHOUSE QUERY', short: 'CLEARINGHOUSE', name: 'DRUG & ALCOHOL CLEARINGHOUSE · ANNUAL QUERY', exp: cq.due, due: cq, verb: 'DUE' }] : []),
  ];
  for (const c of list) {
    Object.assign(c, drSpan(c.exp));
    c.req = WSX.over[`drcred:${d.id}:${c.k}`];
    c.tone = c.req ? 'gold' : c.days <= 30 ? 'warn' : c.days <= 90 ? 'gold' : 'ok';
    c.word = c.req ? c.req : c.tone === 'ok' ? 'CURRENT' : `${c.verb} IN ${c.n} ${c.unit}`;
  }
  return list;
}
const drNearest = (d) => [...drCreds(d)].sort((a, b) => a.days - b.days)[0];
const drDriverList = () => vals(DRIVERS).sort((a, b) => drNearest(a).days - drNearest(b).days);
const drName = (a) => a.who.replace('APPLICANT · ', '');
const drIni = (name) => name.replace(/\./g, '').split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('');
const drRole = (a) => a.job.split(' · ')[0];
const drAppStatus = (a) => ov(`application:${a.id}`, a.status);
const drAppStep = (a) => Math.max(0, DR_PATH.findIndex(([w]) => w === drAppStatus(a)[0]));
const drTruckGo = (vid) => `fleet:${vid}:driver`;
const drDueLabel = (x) => (/CLEARINGHOUSE/.test(x.what) ? 'CLEARINGHOUSE QUERY' : /MEDICAL/.test(x.what) ? 'MEDICAL CARD' : x.what.split(' · ')[0]);

/* ── the people rail: drivers on file, then applicants ── */
function drDriverRow(d) {
  const n = drNearest(d);
  const sel = WSX.dr.focus === 'd' && WSX.dr.driver === d.id && WSX.dr.sec !== 'matching';
  const v = d.vehicle ? VEHICLES[d.vehicle] : null;
  return `<div class="pk dr-row ${sel ? 'is-sel' : ''}" data-a="dr.driver" data-v="${d.id}" aria-pressed="${sel}" title="${d.name} · ${clientName(d.client)} · ${n.label} ${n.word}"><span class="dr-ph">${drIni(d.name)}</span><span class="dr-row__t"><b class="pk__t">${d.name}</b><span class="pk__s">${clientName(d.client)}</span></span><span class="dr-row__r"><span class="dr-cd dr-cd--${n.tone}"><b>${n.n}</b><small>${n.unit}</small></span><small>${n.tag}</small></span></div>`;
}
function drAppRow(a) {
  const sel = WSX.dr.focus === 'a' && WSX.dr.app === a.id && WSX.dr.sec !== 'credentials';
  return `<div class="pk dr-row dr-row--app ${sel ? 'is-sel' : ''}" data-a="dr.app" data-v="${a.id}" aria-pressed="${sel}" title="${drName(a)} · ${a.job}"><span class="dr-ph dr-ph--app">${drIni(drName(a))}</span><b class="pk__t dr-row__n">${drName(a)}</b><small class="dr-row__w">${a.status[0] === 'INTERVIEW SCHEDULED' ? `INTERVIEW ${a.at}` : a.at}</small><span class="pk__s dr-row__s">${drRole(a).replace(' DRIVER', '')} · ${clientName(a.client)}</span><span class="dr-row__st">${sw(drAppStatus(a))}</span></div>`;
}
function drRail() {
  const ds = drDriverList();
  const as = vals(APPLICATIONS);
  return rgn('PEOPLE', `${ds.length + as.length}`, '', `<div class="grp"><span>DRIVERS ON FILE</span><span>${ds.length}</span></div>${ds.map(drDriverRow).join('')}<div class="grp"><span>APPLICANTS</span><span>${as.length}</span></div>${as.map(drAppRow).join('')}`, 'dr-rail', 'dr-rail');
}

/* ── the credential cards ── */
function drCards(d, act = 'dr.cred', only = null) {
  const cr = drCreds(d);
  const cdl = cr.find((c) => c.k === 'cdl');
  const med = cr.find((c) => c.k === 'med');
  const on = (k) => WSX.dr.cred === k;
  const c = ACCOUNTS[d.client];
  const lic = `<button type="button" class="dr-card dr-card--cdl dr-card--${cdl.tone} ${on('cdl') ? 'is-on' : ''}" data-a="${act}" data-v="cdl" aria-pressed="${on('cdl')}" aria-label="${cdl.name} · ${cdl.word}">
    <span class="dr-card__band"><b>COMMERCIAL DRIVER LICENSE</b><em>${cdl.state}</em></span>
    <span class="dr-card__body"><span class="dr-card__photo">${drIni(d.name)}</span><span class="dr-card__cls"><small>CLASS</small><b>${cdl.cls}</b></span><span class="dr-card__nm"><small>NAME</small><b>${d.name}</b><small>${c.name}</small></span></span>
    <span class="dr-card__foot"><span><small>EXPIRES</small><b>${cdl.exp}</b></span><span class="dr-card__left">${cdl.n} ${cdl.unit}</span><i class="dr-holo" aria-hidden="true"></i></span>
  </button>`;
  const mc = `<button type="button" class="dr-card dr-card--med dr-card--${med.tone} ${on('med') ? 'is-on' : ''}" data-a="${act}" data-v="med" aria-pressed="${on('med')}" aria-label="${med.name} · ${med.word}">
    <span class="dr-card__band"><b>MEDICAL EXAMINER’S CERTIFICATE</b>${ico('shield-check')}</span>
    <span class="dr-card__body"><span class="dr-card__nm"><small>DRIVER</small><b>${d.name}</b><small>${c.name}</small></span><span class="dr-card__big"><b>${med.n}</b><small>${med.unit} LEFT</small></span></span>
    <span class="dr-card__foot"><span><small>EXPIRES</small><b>${med.exp}</b></span>${med.req ? '' : `<span class="dr-card__left">${med.tone === 'ok' ? 'CURRENT' : 'RENEW NOW'}</span>`}</span>
    ${med.req ? `<em class="dr-stamp">${med.req}</em>` : ''}
  </button>`;
  if (only) return `<div class="dr-cards dr-cards--one" data-swap="dr-card:${d.id}:${only}">${only === 'cdl' ? lic : mc}</div>`;
  return `<div class="dr-cards" data-swap="dr-cards:${d.id}">${lic}${mc}</div>`;
}
/** How close each expiry is: one row per credential on a stretched time axis; the motor vehicle record is not tracked. */
function drTimeline(d, act = 'dr.cred') {
  const cr = drCreds(d);
  const ticks = [[0, 'TODAY'], [30, '30 DAYS'], [90, '90 DAYS'], [365, '1 YEAR'], [1460, '4 YEARS']];
  const axis = `<div class="dr-tl__ax">${ticks.map(([t, l]) => `<span style="left:${drX(t).toFixed(2)}%" class="${t === 0 ? 'is-today' : ''}">${l}</span>`).join('')}</div>`;
  const rows = cr.map((c) => {
    const x = drX(c.days);
    const on = WSX.dr.cred === c.k;
    const label = `${c.exp.replace(', 2026', '')} · ${c.n} ${c.unit}`;
    const place = x < 34 ? `left:calc(${x.toFixed(2)}% - 4px)` : x > 66 ? `right:calc(${(100 - x).toFixed(2)}% - 4px)` : `left:${x.toFixed(2)}%;transform:translateX(-50%)`;
    return `<button type="button" class="dr-tl__r ${on ? 'is-on' : ''}" data-a="${act}" data-v="${c.k}" aria-pressed="${on}" aria-label="${c.label} · ${c.word}"><span class="dr-tl__l">${c.label}</span><span class="dr-tl__tr"><i class="dr-tl__bar dr-tl__bar--${c.tone}" style="width:${x.toFixed(2)}%"></i><i class="dr-tl__m dr-tl__m--${c.tone}" style="left:${x.toFixed(2)}%"></i><span class="dr-tl__d dr-tl__d--${c.tone}" style="${place}">${label}</span></span></button>`;
  }).join('');
  const ghost = `<div class="dr-tl__r dr-tl__r--ghost"><span class="dr-tl__l">MVR</span><span class="dr-tl__tr"><span class="dr-tl__d">MOTOR VEHICLE RECORD · NOT TRACKED YET</span></span></div>`;
  const grid = ticks.map(([t]) => `<i class="dr-tl__g" style="left:${drX(t).toFixed(2)}%"></i>`).join('');
  return `<div class="dr-tl" data-swap="dr-tl:${d.id}"><div class="dr-tl__h"><span>HOW CLOSE EACH EXPIRY IS</span></div><div class="dr-tl__plot">${axis}<div class="dr-tl__rows"><div class="dr-tl__grid" aria-hidden="true">${grid}<i class="dr-tl__zone" style="width:${drX(30).toFixed(2)}%"></i></div>${rows}${ghost}</div></div></div>`;
}
function drCredStage(d) {
  const s = ov(`driver:${d.id}`, d.status);
  const c = ACCOUNTS[d.client];
  const v = d.vehicle ? VEHICLES[d.vehicle] : null;
  const [cls, state] = d.cdl.split(' · ');
  return `<section class="dr-stage">
    <div class="dr-stage__id" data-swap="dr-id:${d.id}">
      <div class="dr-who"><small>DRIVER · ${c.name}</small><b>${d.name}</b><span>${cls} · ${state}${v ? ` · ${v.unit}` : ''}</span></div>
      <div class="dr-stage__st"><span class="dr-big dr-big--${s[1]}">${s[0]}</span><button type="button" class="dr-client" data-a="go" data-v="client:${c.id}:drivers">${badge(c)}<span>${c.name}</span>${ico('fwd')}</button></div>
    </div>
    ${drCards(d)}
    ${drTimeline(d)}
  </section>`;
}

/* ── what the driver connects to ── */
function drTile(go, lead, small, title, foot) {
  return `<button type="button" class="dr-tile" data-a="go" data-v="${go}" title="${title}">${lead}<span class="dr-tile__t"><small>${small}</small><b>${title}</b>${foot}</span>${ico('fwd', 'dr-tile__go')}</button>`;
}
function drConnected(d) {
  const c = ACCOUNTS[d.client];
  const v = d.vehicle ? VEHICLES[d.vehicle] : null;
  const truck = v ? drTile(drTruckGo(v.id), `<span class="dr-tile__truck"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg></span>`, 'ASSIGNED TRUCK', v.unit, sw([vAvail(v)[0].split(' · ')[0], vAvail(v)[1]])) : `<div class="dr-tile dr-tile--none"><span class="dr-tile__t"><small>ASSIGNED TRUCK</small><b>NONE</b></span></div>`;
  const carrier = drTile(`client:${c.id}:drivers`, `<span class="dr-tile__b">${badge(c)}</span>`, 'DRIVES FOR', c.name, sw(c.lanes.includes('drivers') ? ['USES AIO DRIVERS', 'ok'] : ['DRIVERS SERVICE OFF', 'mute']));
  const dues = drDues(d);
  const due = dues.length ? dues.map((x) => drTile(`comp:${x.id}`, `<span class="dr-cd dr-cd--${x.days <= 30 ? 'warn' : x.days <= 90 ? 'gold' : 'mute'}"><b>${x.days}</b><small>DAYS</small></span>`, 'COMPLIANCE DEADLINE', drDueLabel(x), `<span class="pk__s">DUE ${x.due.replace(', 2026', '')}</span>`)).join('') : `<div class="dr-tile dr-tile--none"><span class="dr-tile__t"><small>COMPLIANCE DEADLINE</small><b>NONE IN 90 DAYS</b></span></div>`;
  return rgn(`CONNECTED · ${d.name}`, '', '', `<div class="dr-tiles" data-swap="dr-conn:${d.id}">${truck}${carrier}${due}</div>`, 'dr-connrg');
}

/* ── ultra-wide: every driver's credentials side by side ── */
function drMatrix() {
  const cols = [['cdl', 'CDL'], ['med', 'MEDICAL CARD'], ['cq', 'CLEARINGHOUSE']];
  const rows = drDriverList().map((d) => {
    const cr = drCreds(d);
    const on = WSX.dr.driver === d.id;
    return `<tr class="lt-row ${on ? 'is-sel' : ''}" data-a="dr.driver" data-v="${d.id}"><td><span class="dr-mx__who"><span class="dr-ph">${drIni(d.name)}</span><span><b class="pk__t">${d.name}</b><span class="pk__s">${clientName(d.client)}</span></span></span></td>${cols.map(([k]) => {
      const c = cr.find((x) => x.k === k);
      return `<td>${c ? `<span class="dr-mx__c"><span class="dr-cd dr-cd--${c.tone} dr-cd--s"><b>${c.n}</b><small>${c.unit}</small></span><span><b>${c.exp}</b>${sw([c.word, c.tone])}</span></span>` : '<span class="lt-m">NO DEADLINE</span>'}</td>`;
    }).join('')}<td><span class="lt-m">NOT TRACKED YET</span></td></tr>`;
  }).join('');
  return rgn('EVERY DRIVER · EVERY CREDENTIAL', `${vals(DRIVERS).length} DRIVERS`, '', `<table class="lt dr-mx"><thead><tr><th>DRIVER</th>${cols.map(([, l]) => `<th>${l}</th>`).join('')}<th>MVR</th></tr></thead><tbody>${rows}</tbody></table>`, 'dr-mxrg');
}

/* ── matching: applications on their path ── */
function drMatchStage(act = 'dr.app') {
  const apps = vals(APPLICATIONS);
  const roles = [...new Set(apps.map((a) => `${a.client}|${drRole(a)}`))];
  const selStep = WSX.dr.app && APPLICATIONS[WSX.dr.app] ? drAppStep(APPLICATIONS[WSX.dr.app]) : -1;
  const head = `<div class="dr-ph__row"><span class="dr-ph__lane"></span>${DR_PATH.map(([, l], i) => `<span class="dr-st ${i === selStep ? 'is-on' : ''} ${i === 4 ? 'dr-st--off' : ''}"><i>${i === 4 ? ico('lock') : i + 1}</i><b>${l}</b></span>`).join('')}</div>`;
  const lanes = roles.map((key) => {
    const [cid, role] = key.split('|');
    const mine = apps.filter((a) => a.client === cid && drRole(a) === role);
    const c = ACCOUNTS[cid];
    const cells = DR_PATH.map((_, i) => `<span class="dr-cell">${mine.filter((a) => drAppStep(a) === i).map((a) => {
      const on = WSX.dr.app === a.id && WSX.dr.focus === 'a';
      const st = drAppStatus(a);
      return `<button type="button" class="dr-tok dr-tok--${st[1]} ${on ? 'is-on' : ''}" data-a="${act}" data-v="${a.id}" aria-pressed="${on}" aria-label="${drName(a)} · ${st[0]}" title="${drName(a)} · ${st[0]}">${on ? `<i class="dr-tok__ring" data-swap="ring:${a.id}" aria-hidden="true"></i>` : ''}<b>${drIni(drName(a))}</b><span>${drName(a)}</span><em class="dr-tok__x">${sw(st)}<small>${a.status[0] === 'INTERVIEW SCHEDULED' ? `INTERVIEW ${a.at}` : `RECEIVED ${a.at}`}</small></em></button>`;
    }).join('')}</span>`).join('');
    const roster = vals(DRIVERS).filter((d) => d.client === cid);
    return `<div class="dr-lane"><div class="dr-lane__h">${badge(c)}<b>${role}</b><span>${c.name} · ${mine.length} APPLYING</span>${roster.length ? `<em>DRIVING NOW · ${roster.map((d) => d.name).join(' · ')}</em>` : ''}</div><div class="dr-ph__row dr-ph__row--lane"><span class="dr-ph__lane"></span>${cells}</div></div>`;
  }).join('');
  return `<section class="dr-stage dr-stage--match">
    <div class="dr-mh"><small>MATCHING · OPEN POSITIONS</small><b>THE PATH TO A DECISION</b><span>${apps.length} APPLICANTS · ${roles.length} POSITIONS</span></div>
    <div class="dr-path">${head}${lanes}</div>
    <div class="dr-dark-note">${ico('lock')}<span><b>DECISIONS ARE THE CLIENT’S.</b> APPROVALS ARE NOT BUILT; CLIENTS DECIDE OUTSIDE AIO TODAY.</span></div>
  </section>`;
}
function drCarrier(a) {
  const c = ACCOUNTS[a.client];
  const roster = vals(DRIVERS).filter((d) => d.client === c.id);
  const free = vals(VEHICLES).filter((v) => v.client === c.id && !v.driver);
  const carrier = drTile(`client:${c.id}:drivers`, `<span class="dr-tile__b">${badge(c)}</span>`, 'THE CARRIER', c.name, sw(c.lanes.includes('drivers') ? ['USES AIO DRIVERS', 'ok'] : ['DRIVERS SERVICE OFF', 'mute']));
  const rost = roster.map((d) => `<button type="button" class="dr-tile" data-a="dr.driver" data-v="${d.id}" title="${d.name}"><span class="dr-ph">${drIni(d.name)}</span><span class="dr-tile__t"><small>DRIVING NOW</small><b>${d.name}</b>${sw(ov(`driver:${d.id}`, d.status))}</span>${ico('fwd', 'dr-tile__go')}</button>`).join('');
  const trucks = free.map((v) => drTile(drTruckGo(v.id), `<span class="dr-tile__truck"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg></span>`, 'NO DRIVER', v.unit, sw([vAvail(v)[0].split(' · ')[0], vAvail(v)[1]]))).join('');
  return rgn(`THE CARRIER · ${c.name}`, '', '', `<div class="dr-tiles" data-swap="dr-car:${c.id}">${carrier}${rost}${trucks}</div>`, 'dr-connrg');
}

/* ── approvals: who drives for whom ── */
function drBoard(act = 'dr.pick') {
  const cids = [...new Set([...vals(DRIVERS).map((d) => d.client), ...vals(APPLICATIONS).map((a) => a.client)])];
  const cols = cids.map((cid) => {
    const c = ACCOUNTS[cid];
    const drv = vals(DRIVERS).filter((d) => d.client === cid);
    const apps = vals(APPLICATIONS).filter((a) => a.client === cid);
    const free = vals(VEHICLES).filter((v) => v.client === cid && !v.driver);
    const pick = (k) => `${WSX.dr.focus}:${WSX.dr.focus === 'd' ? WSX.dr.driver : WSX.dr.app}` === k;
    // a driver is a small licence: the class and state, the truck, and how long each card has left
    const dTok = drv.map((d) => {
      const cr = drCreds(d);
      const on = pick(`d:${d.id}`);
      const [cls, state] = d.cdl.split(' · ');
      const meters = cr.map((c) => `<span class="dr-bm"><small>${c.tag}</small><i><i class="dr-bm__f dr-bm__f--${c.tone}" style="width:${drX(c.days).toFixed(1)}%"></i></i><b class="dr-bm__v--${c.tone}">${c.n} ${c.unit}</b></span>`).join('');
      return `<button type="button" class="dr-bt dr-bt--drv ${on ? 'is-on' : ''}" data-a="${act}" data-v="d:${d.id}" aria-pressed="${on}" title="${d.name} · ${drNearest(d).label} ${drNearest(d).word}"><span class="dr-bt__band"><span>${cls} · ${state}</span><span>${d.vehicle ? VEHICLES[d.vehicle].unit : 'NO TRUCK'}</span></span><span class="dr-bt__main"><span class="dr-ph">${drIni(d.name)}</span><span class="dr-bt__t"><b>${d.name}</b>${sw(ov(`driver:${d.id}`, d.status))}</span>${d.vehicle ? `<span class="dr-bt__tk" aria-hidden="true"><svg viewBox="0 0 500 210">${truckShape(FLEET_META[d.vehicle].cab)}</svg></span>` : ''}</span><span class="dr-bt__ms">${meters}</span></button>`;
    }).join('');
    const aTok = apps.map((a) => {
      const on = pick(`a:${a.id}`);
      return `<button type="button" class="dr-bt dr-bt--app ${on ? 'is-on' : ''}" data-a="${act}" data-v="a:${a.id}" aria-pressed="${on}" title="${drName(a)} · ${drAppStatus(a)[0]}"><span class="dr-bt__main"><span class="dr-ph dr-ph--app">${drIni(drName(a))}</span><span class="dr-bt__t"><b>${drName(a)}</b>${sw(drAppStatus(a))}</span></span><span class="dr-bt__path" aria-hidden="true">${DR_PATH.map((_, i) => `<i class="${i < drAppStep(a) ? 'd' : i === drAppStep(a) ? 'n' : ''}"></i>`).join('')}</span><small class="dr-bt__role">${drRole(a).replace(' DRIVER', '')} · ${a.status[0] === 'INTERVIEW SCHEDULED' ? `INTERVIEW ${a.at}` : a.at}</small></button>`;
    }).join('');
    const tTok = free.map((v) => `<button type="button" class="dr-bt dr-bt--truck" data-a="go" data-v="${drTruckGo(v.id)}" title="${v.unit} · NO DRIVER · ${vAvail(v)[0]}"><span class="dr-bt__main"><span class="dr-bt__ico"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg></span><span class="dr-bt__t"><b>${v.unit}</b>${sw([vAvail(v)[0].split(' · ')[0], vAvail(v)[1]])}</span></span></button>`).join('');
    const dues = vals(DUES).filter((x) => x.client === cid && x.links.some((k) => k.startsWith('driver:')));
    const dueTok = dues.map((x) => `<button type="button" class="dr-bt dr-bt--due" data-a="go" data-v="comp:${x.id}" title="${x.what} · ${x.due}"><span class="dr-bt__main"><span class="dr-cd dr-cd--${x.days <= 30 ? 'warn' : x.days <= 90 ? 'gold' : 'mute'} dr-cd--s"><b>${x.days}</b><small>DAYS</small></span><span class="dr-bt__t"><b>${drDueLabel(x)}</b><small>DUE ${x.due.replace(', 2026', '')} · COMPLIANCE</small></span></span></button>`).join('');
    const grp = (label, n, html) => (n ? `<div class="dr-bg"><span class="dr-bg__l">${label}<i>${n}</i></span>${html}</div>` : '');
    return `<div class="dr-bcol"><div class="dr-bcol__h"><span class="dr-mono">${c.b}</span><span><b>${c.name}</b>${sw(c.lanes.includes('drivers') ? ['USES AIO DRIVERS', 'ok'] : ['SERVICE OFF', 'mute'])}</span></div>${grp('DRIVING', drv.length, dTok)}${grp('APPLYING', apps.length, aTok)}${grp('TRUCKS WITH NO DRIVER', free.length, tTok)}${grp('DRIVER DEADLINES', dues.length, dueTok)}</div>`;
  }).join('');
  return `<section class="dr-stage dr-stage--board">
    <div class="dr-mh"><small>APPROVALS · RELATIONSHIPS</small><b>WHO DRIVES FOR WHOM</b><span>${vals(DRIVERS).length} DRIVING · ${vals(APPLICATIONS).length} APPLYING</span></div>
    <div class="dr-board">${cols}</div>
    <div class="dr-dark-note">${ico('lock')}<span><b>APPROVALS ARE NOT BUILT.</b> THE CLIENT’S HIRE DECISION AND AIO’S SIGN-OFF HAPPEN OUTSIDE AIO TODAY.</span></div>
  </section>`;
}

/* ── the panel: one credential, or one applicant ── */
function drDriverPanel(d, hero = false) {
  const cr = drCreds(d);
  const cur = cr.find((c) => c.k === WSX.dr.cred) || drNearest(d);
  const key = `driver:${d.id}`;
  const c = ACCOUNTS[d.client];
  let next;
  if (cur.k === 'med' && cur.tone === 'warn') next = nextBlock(`${d.name.split(' ')[0]}’S MEDICAL CARD EXPIRES ${cur.exp.replace(', 2026', '')}`, simBtn(`dr:med:${d.id}`, { label: 'REQUEST THE RENEWED MEDICAL CARD', effect: `ASKS ${c.name} FOR ${d.name}’S RENEWED MEDICAL EXAMINER’S CERTIFICATE.`, apply: () => { WSX.over[`drcred:${d.id}:med`] = 'RENEWAL REQUESTED'; WSX.over[key] = ['NEW CARD REQUESTED', 'gold']; }, rec: key, primary: true }));
  else if (cur.req) next = nextBlock(`RENEWED CARD REQUESTED FROM ${c.name}`, '', 'calm');
  else if (cur.k === 'cq') next = nextBlock(DUE_META[cur.due.id]?.need ?? 'RUN THE ANNUAL QUERY', `<button type="button" class="wbtn wbtn--gold" data-a="go" data-v="comp:${cur.due.id}">${ico('shield-check')}OPEN IN COMPLIANCE</button>`);
  else next = nextBlock(`${cur.short} CURRENT · ${cur.verb} ${cur.exp}`, '', 'calm');
  const factsRows = cur.k === 'cdl'
    ? [['LICENSE', `CLASS ${cur.cls} · ${cur.state}`], ['EXPIRES', cur.exp, `IN ${cur.n} ${cur.unit}`], ['DRIVER', d.name], ['CARRIER', `<a data-a="go" data-v="client:${c.id}:drivers">${c.name}</a>`]]
    : cur.k === 'med'
      ? [['EXPIRES', cur.exp, `IN ${cur.n} ${cur.unit}`], ['DRIVER', d.name], ['CARRIER', `<a data-a="go" data-v="client:${c.id}:drivers">${c.name}</a>`], ['TRUCK', d.vehicle ? `<a data-a="go" data-v="${drTruckGo(d.vehicle)}">${VEHICLES[d.vehicle].unit}</a>` : 'NONE ASSIGNED']]
      : [['QUERY', 'ANNUAL · DRUG & ALCOHOL'], ['DUE', cur.exp, `IN ${cur.n} ${cur.unit}`], ['OWNER', staffName(DUE_META[cur.due.id]?.owner)], ['DRIVER', d.name]];
  const dl = cur.due ? `<button type="button" class="dr-link" data-a="go" data-v="comp:${cur.due.id}">${ico('shield-check')}<span><small>COMPLIANCE WATCHES THIS</small><b>${cur.due.what.split(' · ')[0]} · ${cur.due.due.replace(', 2026', '')}</b></span>${ico('fwd')}</button>` : '';
  const docs = vals(DOCS).filter((x) => x.owner === key && (cur.k === 'med' ? /MEDICAL/.test(x.title) : cur.k !== 'med' && !/MEDICAL/.test(x.title)));
  const sib = `<div class="dr-sib"><div class="sec-l"><span>CREDENTIALS · ${d.name}</span><span>${cr.length + 1}</span></div>${cr.map((x) => `<button type="button" class="dr-sib__r ${x.k === cur.k ? 'is-on' : ''}" data-a="dr.cred" data-v="${x.k}" aria-current="${x.k === cur.k}"><span class="dr-cd dr-cd--${x.tone} dr-cd--s"><b>${x.n}</b><small>${x.unit}</small></span><b>${x.label}</b>${sw([x.word, x.tone])}</button>`).join('')}<div class="dr-sib__r dr-sib__r--ghost"><span class="dr-cd dr-cd--mute dr-cd--s"><b>—</b></span><b>MVR · DRIVING RECORD</b>${sw(['NOT TRACKED YET', 'mute'])}</div></div>`;
  const hist = DR_HIST[d.id] || WSX.hist[key] ? mhist(key, DR_HIST[d.id] || []) : '';
  // phone: the card in focus above the next step, the timeline under it
  const heroCard = hero && cur.k !== 'cq' ? `<div class="dr-hero">${drCards(d, 'dr.cred', cur.k)}</div>` : '';
  const heroTl = hero ? `<div class="dr-hero">${drTimeline(d)}</div>` : '';
  const body = `${heroCard}${next}${heroTl}${facts(factsRows)}${dl}${docs.length ? `<div><div class="sec-l">DOCUMENTS</div>${docs.map((x) => docChip(x.id)).join('')}</div>` : ''}${sib}${hist}${ntb('<b>CREDENTIAL VERIFICATION IS NOT BUILT.</b> COMPLIANCE WATCHES THE DATES.')}`;
  const sk = `${d.id}:${cur.k}`;
  return `<section class="rg cx dr-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${sk}"><div class="cx__crumb"><span>DRIVERS & CARRIERS</span>${ico('fwd')}<span>${d.name}</span>${ico('fwd')}<span>${cur.short}</span></div><h2 class="cx__t">${cur.name}</h2><span class="dr-cx__s">${sw([cur.word, cur.tone])}<span class="pk__s">${d.name} · ${c.name}</span></span></div></header><div class="cx__b" data-keep="dr-cx" data-swap="b:${sk}">${body}</div></section>`;
}
function drAppPanel(a) {
  const st = drAppStatus(a);
  const key = `application:${a.id}`;
  const c = ACCOUNTS[a.client];
  const name = drName(a);
  let next;
  if (st[0] === 'UNDER REVIEW') next = nextBlock('REVIEWED · ASK FOR THE DRIVER’S PAPERS', simBtn(`dr:docs:${a.id}`, { label: 'REQUEST DOCUMENTS', effect: `ASKS ${name} FOR THEIR CDL, MEDICAL CARD AND MVR.`, apply: () => (WSX.over[key] = ['DOCUMENTS NEEDED', 'warn']), rec: key, primary: true }));
  else if (st[0] === 'DOCUMENTS NEEDED') next = nextBlock(`WAITING ON ${name}’S CDL, MEDICAL CARD AND MVR`, `${simBtn(`dr:rem:${a.id}`, { label: 'REMIND THE APPLICANT', effect: `ASKS ${name} AGAIN FOR THE MISSING DOCUMENTS.`, apply: () => {}, rec: key, primary: true })}${simBtn(`dr:int:${a.id}`, { label: 'SCHEDULE INTERVIEW', effect: `OFFERS ${c.name} AND ${name} A TIME.`, apply: () => (WSX.over[key] = ['INTERVIEW SCHEDULED', 'ok']), rec: key })}`);
  else if (st[0] === 'INTERVIEW SCHEDULED') next = nextBlock(`INTERVIEW WITH ${c.name}${a.status[0] === 'INTERVIEW SCHEDULED' ? ` · ${a.at}` : ''}`, simBtn(`dr:rmd:${a.id}`, { label: 'REMIND BOTH SIDES', effect: `REMINDS ${c.name} AND ${name} OF THE INTERVIEW.`, apply: () => {}, rec: key, sm: true }), 'calm');
  else next = nextBlock('THE CLIENT DECIDES', '', 'calm');
  const step = drAppStep(a);
  const path = `<div class="dr-mini"><div class="sec-l"><span>THE PATH</span><span>STEP ${step + 1} OF 5</span></div><ol class="dr-mini__p">${DR_PATH.map(([, l], i) => `<li class="${i < step ? 'd' : i === step ? 'n' : ''}"><i>${i < step ? ico('pass') : i === 4 ? ico('lock') : i + 1}</i><span>${l}</span></li>`).join('')}</ol></div>`;
  const received = a.status[0] === 'INTERVIEW SCHEDULED' ? null : a.at;
  const base = received ? [[received, 'APPLICATION RECEIVED']] : [[a.at, 'INTERVIEW SCHEDULED WITH THE CLIENT']];
  const body = `${next}${facts([['POSITION', drRole(a)], ['CARRIER', `<a data-a="go" data-v="client:${c.id}:drivers">${c.name}</a>`], [received ? 'RECEIVED' : 'INTERVIEW', received || a.at], ['STATUS', sw(st)]])}${path}${mhist(key, base)}${ntb('<b>SAMPLE APPLICANTS.</b> ONLY WHAT THE APPLICATION HOLDS.')}`;
  const sk = `${a.id}`;
  return `<section class="rg cx dr-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${sk}"><div class="cx__crumb"><span>DRIVERS & CARRIERS</span>${ico('fwd')}<span>MATCHING</span>${ico('fwd')}<span>${name}</span></div><h2 class="cx__t">${name}</h2><span class="dr-cx__s">${sw(st)}<span class="pk__s">${drRole(a)} · ${c.name}</span></span></div></header><div class="cx__b" data-keep="dr-cx" data-swap="b:${sk}">${body}</div></section>`;
}
function drPanel(hero = false) {
  const { sec, focus } = WSX.dr;
  const showApp = sec === 'matching' || (sec === 'approvals' && focus === 'a');
  return showApp ? drAppPanel(APPLICATIONS[WSX.dr.app]) : drDriverPanel(DRIVERS[WSX.dr.driver], hero);
}

/* ── the bar ── */
function drBar() {
  const ds = vals(DRIVERS);
  const soon = drDriverList().filter((d) => drNearest(d).days <= 30);
  const sec = WSX.dr.sec;
  const r = [
    ro(ds.length, 'DRIVERS', { a: 'dr.sec', v: 'credentials', on: sec === 'credentials' }),
    ro(soon.length, 'EXPIRE IN 30 DAYS', { tone: soon.length ? 'warn' : '', a: soon.length ? 'dr.driver' : '', v: soon[0]?.id ?? '' }),
    ro(vals(APPLICATIONS).length, 'APPLICANTS', { a: 'dr.sec', v: 'matching', on: sec === 'matching' }),
    ro(vals(APPLICATIONS).filter((a) => drAppStatus(a)[0] === 'INTERVIEW SCHEDULED').length, 'INTERVIEWS', { tone: 'gold', a: 'dr.app', v: 'ap-3' }),
    ro(new Set(ds.map((d) => d.client)).size, 'CARRIERS', { a: 'dr.sec', v: 'approvals', on: sec === 'approvals' }),
  ];
  if (VP === 'mobile') return `${wsBar('10 · WORK', 'DRIVERS & CARRIERS', '')}<div class="ros ros--m dr-ros">${[r[0], r[1], r[2], r[3]].join('')}</div>`;
  return wsBar('10 · WORK', 'DRIVERS & CARRIERS', r.join(''));
}
const drSeg = (cls = '') => seg(DR_SECS.map(([id, l]) => [id, l, id === 'matching' ? vals(APPLICATIONS).length : id === 'credentials' ? vals(DRIVERS).length : null]), WSX.dr.sec, 'dr.sec', cls);

/* ── compositions ── */
function drStage() {
  const { sec } = WSX.dr;
  if (sec === 'matching') return drMatchStage();
  if (sec === 'approvals') return drBoard();
  return drCredStage(DRIVERS[WSX.dr.driver]);
}
function drLower() {
  const { sec } = WSX.dr;
  if (sec === 'matching') return drCarrier(APPLICATIONS[WSX.dr.app]);
  if (sec === 'approvals') return '';
  return `${drConnected(DRIVERS[WSX.dr.driver])}${WIDE && VP === 'desktop' ? drMatrix() : ''}`;
}
/** Phone: each driver is a stack of the cards they carry — the licence in front, the medical card behind it. */
function drStacks() {
  return `<div class="dr-stacks">${drDriverList().map((d) => {
    const cr = drCreds(d);
    const cdl = cr[0];
    const med = cr[1];
    const n = drNearest(d);
    const on = WSX.sheet && WSX.dr.driver === d.id;
    return `<button type="button" class="dr-stack dr-stack--${med.tone} ${on ? 'is-on' : ''}" data-a="dr.open" data-v="${d.id}" aria-label="${d.name} · ${n.label} ${n.word}"><span class="dr-stack__band"><b>CDL · CLASS ${cdl.cls} · ${cdl.state}</b><span>${clientName(d.client)}</span></span><span class="dr-stack__body"><span class="dr-card__photo">${drIni(d.name)}</span><span class="dr-stack__nm"><b>${d.name}</b><small>MEDICAL ${med.exp.replace(', 2026', '')} · CDL ${cdl.exp}</small></span><span class="dr-cd dr-cd--${n.tone}"><b>${n.n}</b><small>${n.unit}</small></span></span></button>`;
  }).join('')}</div>`;
}
function drPhoneMatch() {
  const apps = vals(APPLICATIONS);
  const rows = apps.map((a) => `<div class="pk dr-row dr-row--app ${WSX.sheet && WSX.dr.app === a.id ? 'is-sel' : ''}" data-a="dr.open" data-v="${a.id}"><span class="dr-ph dr-ph--app">${drIni(drName(a))}</span><span class="dr-row__t"><b class="pk__t">${drName(a)}</b><span class="pk__s">${drRole(a)} · ${ACCOUNTS[a.client].b}</span></span><span class="dr-row__r">${sw(drAppStatus(a))}</span></div>`).join('');
  return `${drMatchStage('dr.open').replace('class="dr-stage dr-stage--match"', 'class="dr-stage dr-stage--match dr-stage--m"')}${rgn('APPLICANTS', `${apps.length}`, '', rows, 'dr-mlist')}`;
}
function drPhoneBoard() {
  return drBoard('dr.open').replace('class="dr-stage dr-stage--board"', 'class="dr-stage dr-stage--board dr-stage--m"');
}
function driversView() {
  const { sec } = WSX.dr;
  if (VP === 'mobile') {
    const body = sec === 'matching' ? drPhoneMatch() : sec === 'approvals' ? drPhoneBoard() : `${drStacks()}${ntb('<b>CREDENTIAL VERIFICATION IS NOT BUILT.</b> COMPLIANCE WATCHES THE DATES.')}`;
    return `<div class="ws dr dr--m">${drBar()}${drSeg('wseg--fit')}${body}</div>${phoneSheet(drPanel(true), { label: 'Driver or applicant detail' })}`;
  }
  if (VP === 'tablet') {
    const strip = sec === 'approvals' ? '' : `<div class="dr-strip">${sec === 'matching' ? vals(APPLICATIONS).map((a) => `<button type="button" class="dr-chip ${WSX.dr.app === a.id ? 'is-sel' : ''}" data-a="dr.app" data-v="${a.id}"><span class="dr-ph dr-ph--app">${drIni(drName(a))}</span><b>${drName(a)}</b></button>`).join('') : drDriverList().map((d) => `<button type="button" class="dr-chip ${WSX.dr.driver === d.id ? 'is-sel' : ''}" data-a="dr.driver" data-v="${d.id}"><span class="dr-ph">${drIni(d.name)}</span><b>${d.name}</b><i class="pip pip--${drNearest(d).tone}"></i></button>`).join('')}</div>`;
    const lower = drLower();
    return `<div class="ws dr dr--t dr--${sec}">${drBar()}<div class="dr-top">${drSeg()}</div>${strip}${drStage()}<div class="dr-t2 ${lower ? '' : 'dr-t2--one'}">${lower}${drPanel()}</div></div>`;
  }
  const mid = sec === 'approvals' ? `<div class="dr-mid dr-mid--board">${drStage()}</div>` : `${drRail()}<div class="dr-mid">${drStage()}${drLower()}</div>`;
  return `<div class="ws dr dr--${sec}">${drBar()}<div class="dr-grid"><div class="dr-top">${drSeg()}</div>${mid}${drPanel()}</div></div>`;
}

/* ── actions ── */
const drFirstCred = (d) => drNearest(d).k;
ACT['dr.sec'] = (s) => {
  WSX.dr.sec = s;
  if (s === 'credentials') WSX.dr.focus = 'd';
  if (s === 'matching') WSX.dr.focus = 'a';
  WSX.pending = null;
};
ACT['dr.driver'] = (id) => {
  Object.assign(WSX.dr, { driver: id, cred: drFirstCred(DRIVERS[id]), focus: 'd' });
  if (WSX.dr.sec === 'matching') WSX.dr.sec = 'credentials';
  WSX.pending = null;
};
ACT['dr.app'] = (id) => {
  Object.assign(WSX.dr, { app: id, focus: 'a' });
  if (WSX.dr.sec === 'credentials') WSX.dr.sec = 'matching';
  WSX.pending = null;
};
ACT['dr.cred'] = (k) => {
  WSX.dr.cred = k;
  WSX.pending = null;
};
/** Approvals: a person on the board, a driver (d:id) or an applicant (a:id). */
ACT['dr.pick'] = (v) => {
  const [t, id] = v.split(':');
  if (t === 'd') Object.assign(WSX.dr, { driver: id, cred: drFirstCred(DRIVERS[id]), focus: 'd' });
  else Object.assign(WSX.dr, { app: id, focus: 'a' });
  WSX.pending = null;
};
/** Phone: open a driver, an applicant or a board pick in the drawer. */
ACT['dr.open'] = (v) => {
  const id = v.includes(':') ? v.split(':')[1] : v;
  if (DRIVERS[id]) Object.assign(WSX.dr, { driver: id, cred: drFirstCred(DRIVERS[id]), focus: 'd' });
  else if (APPLICATIONS[id]) Object.assign(WSX.dr, { app: id, focus: 'a' });
  if (WSX.dr.sec === 'credentials' && WSX.dr.focus === 'a') WSX.dr.sec = 'matching';
  if (WSX.dr.sec === 'matching' && WSX.dr.focus === 'd') WSX.dr.sec = 'credentials';
  WSX.sheet = true;
  WSX.pending = null;
};

registerWorkspace({
  id: 'drivers', no: '10', name: 'DRIVERS & CARRIERS', group: 'fleet', page: 'work', lane: 'drivers', view: () => driversView(),
  shape: 'A DRIVER’S CREDENTIALS', line: 'WHO MAY DRIVE, FOR WHOM, AND UNTIL WHEN.',
  states: [
    ['MAIN', []],
    ['SELECTED', [['dr.driver', 'd-rl-1']]],
    ['DEEPER', [['dr.driver', 'd-abc-1'], ['dr.cred', 'med'], ['sim.ask', 'dr:med:d-abc-1']]],
    ['PHONE', [['dr.driver', 'd-abc-1']], 'phone'],
  ],
  demos: [
    ['RENEW A MEDICAL CARD', [['dr.driver', 'd-abc-1', 'TERRENCE HOLT · 21 DAYS'], ['dr.cred', 'med', 'THE MEDICAL CARD'], ['sim.ask', 'dr:med:d-abc-1', 'REQUEST THE RENEWED CARD'], ['sim.ok', 'dr:med:d-abc-1', 'CONFIRM · SIMULATED']]],
    ['APPLICANTS ON THEIR PATH', [['dr.sec', 'matching', 'MATCHING'], ['dr.app', 'ap-2', 'M. CHEN · DOCUMENTS NEEDED'], ['dr.app', 'ap-1', 'J. WILLIAMS · UNDER REVIEW'], ['dr.app', 'ap-3', 'R. DIAZ · INTERVIEW OCT 10']]],
    ['FOLLOW THE DRIVER', [['dr.driver', 'd-abc-1', 'TERRENCE HOLT'], ['go', 'fleet:v-abc-1:driver', 'HIS TRUCK IN FLEET'], ['ret', '', 'BACK TO TERRENCE HOLT'], ['dr.sec', 'approvals', 'WHO DRIVES FOR WHOM']]],
  ],
  audit: [
    [['dr.driver', 'd-abc-1'], ['dr.cred', 'cdl']],
    [['dr.driver', 'd-rl-1'], ['dr.cred', 'cq']],
    [['dr.driver', 'd-tk-1']],
    [['dr.driver', 'd-dh-1']],
    [['dr.sec', 'matching']],
    [['dr.sec', 'matching'], ['dr.app', 'ap-1']],
    [['dr.sec', 'matching'], ['dr.app', 'ap-3']],
    [['dr.sec', 'matching'], ['dr.app', 'ap-2'], ['sim.ask', 'dr:rem:ap-2']],
    [['dr.sec', 'approvals']],
    [['dr.sec', 'approvals'], ['dr.pick', 'a:ap-3']],
    [['dr.driver', 'd-abc-1'], ['sim.ok', 'dr:med:d-abc-1']],
  ],
  phoneAct: { 'dr.driver': 'dr.open', 'dr.app': 'dr.open', 'dr.pick': 'dr.open' },
  enter: (a, b) => {
    if (DRIVERS[a]) return Object.assign(WSX.dr, { sec: 'credentials', driver: a, cred: ['cdl', 'med', 'cq'].includes(b) ? b : drFirstCred(DRIVERS[a]), focus: 'd' });
    if (APPLICATIONS[a]) return Object.assign(WSX.dr, { sec: 'matching', app: a, focus: 'a' });
    if (['matching', 'credentials', 'approvals'].includes(a)) WSX.dr.sec = a;
  },
  label: () => (WSX.dr.focus === 'a' && WSX.dr.sec !== 'credentials' ? drName(APPLICATIONS[WSX.dr.app]) : DRIVERS[WSX.dr.driver]?.name ?? 'DRIVERS & CARRIERS'),
  route: (s) => {
    if (s[0] === 'work' && s[1] === 'drivers') return true;
    if (s[0] === 'rec' && s[1] === 'driver' && DRIVERS[s[2]]) return Object.assign(WSX.dr, { sec: 'credentials', driver: s[2], cred: drFirstCred(DRIVERS[s[2]]), focus: 'd' }), true;
    if (s[0] === 'rec' && s[1] === 'application' && APPLICATIONS[s[2]]) return Object.assign(WSX.dr, { sec: 'matching', app: s[2], focus: 'a' }), true;
    return false;
  },
});
