/*
 * PROOF 03 — COMPLIANCE. Deadline- and risk-centered: a 90-day horizon (time is the axis, today is a line) · the queue
 * ordered by urgency · the selected case with its subject, requirement, owner, documents and the next step. One
 * canonical COMPLIANCE lane with four sections; DOT / SAFETY and AUDITS have no data in the live app and say so in place.
 */
const HZ = { start: -7, end: 84 };
const hzX = (d) => (((Math.max(HZ.start, Math.min(HZ.end, d)) - HZ.start) / (HZ.end - HZ.start)) * 100).toFixed(2);
const LANES_CP = ['VEHICLES', 'DRIVERS', 'COVERAGE', 'REGISTRATION'];
const dueState = (d) => ov(`deadline:${d.id}`, d.state);
const urgency = (d) => (dueState(d)[0] === 'RENEWED' ? 'done' : d.days <= 0 || d.state[1] === 'bad' ? 'now' : d.days <= 7 ? 'week' : d.days <= 30 ? 'month' : 'later');
const URG = [['now', 'NOW'], ['week', 'THIS WEEK'], ['month', 'NEXT 30 DAYS'], ['later', 'LATER'], ['done', 'RENEWED · THIS VISIT']];
function cpItems() {
  const { sec, filter } = WSX.comp;
  if (sec === 'corrective') return [DUES['dl-tk-09']];
  if (sec !== 'expirations') return [];
  return vals(DUES)
    .filter((d) => filter === 'all' || urgency(d) === filter || (filter === '30' && ['now', 'week', 'month'].includes(urgency(d))))
    .sort((a, b) => a.days - b.days);
}
const subjectOf = (d) => {
  const m = DUE_META[d.id];
  const key = m?.subject;
  if (!key) return { kind: 'COMPANY', title: clientName(d.client), sub: ACCOUNTS[d.client].dot, go: `client:${d.client}`, goLabel: 'CLIENT 360' };
  const [type, id] = key.split(':');
  if (type === 'vehicle') return { kind: 'TRUCK', title: VEHICLES[id].unit, sub: VEHICLES[id].ymm, go: `fleet:${id}:compliance`, goLabel: 'OPEN IN FLEET', truck: true };
  if (type === 'driver') return { kind: 'DRIVER', title: DRIVERS[id].name, sub: DRIVERS[id].cdl, go: DRIVERS[id].vehicle ? `fleet:${DRIVERS[id].vehicle}:driver` : `client:${d.client}`, goLabel: DRIVERS[id].vehicle ? `${VEHICLES[DRIVERS[id].vehicle].unit} IN FLEET` : 'CLIENT 360' };
  if (type === 'policy') return { kind: 'POLICY', title: POLICIES[id].title, sub: POLICIES[id].partner, go: `client:${d.client}:insurance`, goLabel: 'CLIENT 360' };
  if (type === 'request') return { kind: 'PERMIT', title: REQUESTS[id].title, sub: REQUESTS[id].section, go: `client:${d.client}:permitting`, goLabel: 'CLIENT 360' };
  return { kind: 'COMPANY', title: clientName(d.client), sub: '', go: `client:${d.client}`, goLabel: 'CLIENT 360' };
};

/* ── the horizon ── */
function cpHorizon(compact = false) {
  const { sec, item } = WSX.comp;
  const months = [['OCT', -7, 23], ['NOV', 24, 53], ['DEC', 54, 84]];
  const weeks = Array.from({ length: 13 }, (_, i) => HZ.start + 7 * i).filter((d) => d > HZ.start);
  const axis = `<div class="hz-months">${months.map(([m, a, b]) => `<span style="left:${hzX(a)}%;width:${(hzX(b) - hzX(a)).toFixed(2)}%">${m}</span>`).join('')}</div>`;
  const grid = `${weeks.map((d) => `<i class="hz-wk" style="left:${hzX(d)}%"></i>`).join('')}<i class="hz-zone hz-zone--late" style="left:0;width:${hzX(0)}%"></i><i class="hz-zone hz-zone--week" style="left:${hzX(0)}%;width:${(hzX(7) - hzX(0)).toFixed(2)}%"></i><i class="hz-30" style="left:${hzX(30)}%"><span>30 DAYS</span></i><i class="hz-today" style="left:${hzX(0)}%"><span>TODAY · OCT 8</span></i>`;
  if (sec === 'dot_safety' || sec === 'audits') {
    return `<section class="hz hz--ghost">${axis}<div class="hz-plot">${grid}<div class="hz-ghost"><div class="hz-ghost__m"><b>${sec === 'audits' ? 'NO AUDITS SCHEDULED IN AIO' : 'NO SAFETY DATA CONNECTED'}</b><span>${sec === 'audits' ? 'NEW-ENTRANT AND COMPLIANCE REVIEWS WOULD SIT ON THIS LINE' : 'INSPECTIONS, OUT-OF-SERVICE EVENTS AND SCORES WOULD SIT ON THIS LINE'}</span></div></div></div></section>`;
  }
  const items = cpItems();
  const lanes = compact ? [''] : LANES_CP;
  let calloutHidden = null;
  const rows = lanes.map((ln) => {
    const mine = items.filter((d) => compact || KIND_LANE[d.kind] === ln);
    // markers that would touch stack into a second or third line instead of overlapping
    const ends = [];
    const lineOf = {};
    [...mine].sort((a, b) => a.days - b.days).forEach((d) => {
      const x = Number(hzX(d.days));
      let r = ends.findIndex((e) => x - e >= (compact ? 11 : 4));
      if (r < 0) r = ends.length < 3 ? ends.length : 0;
      ends[r] = x;
      lineOf[d.id] = r;
    });
    const lines = Math.max(1, ends.length);
    const track = VP === 'tablet' ? 640 : WIDE ? 2200 : 1100;
    const marks = mine.map((d) => {
      const s = dueState(d);
      const on = d.id === item;
      let side = '';
      if (on && !compact) {
        const x = Number(hzX(d.days));
        const w = ((Math.max(d.what.split(' · ')[0].length, 18) * 6.3 + 30) / track) * 100;
        const free = (a, b) => !mine.some((o) => o.id !== d.id && lineOf[o.id] === lineOf[d.id] && Number(hzX(o.days)) > a && Number(hzX(o.days)) < b);
        side = x + w < 99 && free(x, x + w + 3) ? 'r' : x - w > 0 && free(x - w - 3, x) ? 'l' : '';
        if (!side) calloutHidden = d;
      }
      return `<button type="button" class="hz-m hz-m--${s[1]} ${on ? 'is-on' : ''}" aria-pressed="${on}" style="left:${hzX(d.days)}%;top:calc(50% + ${((lineOf[d.id] - (lines - 1) / 2) * 27).toFixed(1)}px)" data-a="cp.item" data-v="${d.id}" aria-label="${d.what} · ${d.due}"><b>${ACCOUNTS[d.client].b}</b>${on ? `<i class="hz-m__ring" data-swap="ring:${d.id}" aria-hidden="true"></i>` : ''}${on && side ? `<span class="hz-m__call ${side === 'l' ? 'hz-m__call--l' : ''}" data-swap="call:${d.id}">${d.what.split(' · ')[0]}<small>${d.due.replace(', 2026', '')} · ${daysWord(d.days)}</small></span>` : ''}</button>`;
    }).join('');
    return `<div class="hz-row" style="${lines > 1 ? `height:${(compact ? 20 : 15) + lines * 27}px` : ''}">${compact ? '' : `<span class="hz-lane">${ln}</span>`}<div class="hz-track">${marks}</div></div>`;
  }).join('');
  const sel = items.find((d) => d.id === item);
  const readout = sel && (compact || calloutHidden) ? `<span class="hz-sel" data-swap="sel:${sel.id}"><i class="pip pip--${dueState(sel)[1]}"></i>${sel.what.split(' · ')[0]}<small>${sel.due.replace(', 2026', '')} · ${daysWord(sel.days)}</small></span>` : '';
  return `<section class="hz ${compact ? 'hz--c' : ''}">${readout}${axis}<div class="hz-plot">${grid}<div class="hz-rows">${rows}</div></div></section>`;
}

/* ── the queue ── */
function cpQueue() {
  const { sec, item } = WSX.comp;
  if (sec === 'dot_safety' || sec === 'audits') return rgn('QUEUE', '0', '', `<div style="padding:14px">${ntb(sec === 'audits' ? '<b>AUDITS ARE NOT BUILT.</b> NO AUDIT RECORD EXISTS IN THE LIVE APP.' : '<b>DOT / SAFETY IS NOT BUILT.</b> THE LIVE APP DOES NOT READ FMCSA SAFETY DATA.')}</div>`, 'cp-q');
  const items = cpItems();
  const groups = URG.map(([g, label]) => {
    const list = items.filter((d) => urgency(d) === g);
    if (!list.length) return '';
    return `<div class="grp"><span>${label}</span><span>${list.length}</span></div>${list.map((d) => {
      const s = dueState(d);
      const m = DUE_META[d.id];
      return `<div class="pk cp-row ${d.id === item ? 'is-sel' : ''}" data-a="${VP === 'mobile' ? 'cp.open' : 'cp.item'}" data-v="${d.id}"><span class="cp-cd cp-cd--${s[1]}"><b>${d.days < 0 ? `${d.days}` : d.days === 0 ? 'NOW' : d.days}</b><small>${d.days === 0 ? '' : d.days < 0 ? 'DAY LATE' : 'DAYS'}</small></span><span style="min-width:0"><b class="pk__t">${d.what}</b><span class="pk__s">${clientName(d.client)} · ${d.due.replace(', 2026', '')}</span></span>${av(m.owner)}</div>`;
    }).join('')}`;
  }).join('');
  return rgn(sec === 'corrective' ? 'CORRECTIVE WORK' : 'BY URGENCY', `${items.length}`, '', `${sec === 'corrective' ? `<div style="padding:10px 12px 0">${ntb('<b>NO CORRECTIVE-ACTION MODEL YET.</b> SHOWN FROM THE OUT-OF-SERVICE RECORD.')}</div>` : ''}${groups || '<div class="grp">NOTHING IN THIS VIEW</div>'}`, 'cp-q', 'cp-q');
}

/* ── the case ── */
function cpCase() {
  const { sec, item } = WSX.comp;
  if (sec === 'dot_safety' || sec === 'audits') {
    const fields = sec === 'audits' ? ['CARRIER', 'AUDIT TYPE', 'SCHEDULED', 'DOCUMENTS READY', 'OUTCOME'] : ['CARRIER', 'BASIC SCORES', 'LAST INSPECTION', 'OUT-OF-SERVICE RATE', 'ALERTS'];
    return `<section class="rg cx cp-case"><header class="cx__h"><div class="cx__crumb"><span>COMPLIANCE</span>${ico('fwd')}<span>${sec === 'audits' ? 'AUDITS' : 'DOT / SAFETY'}</span></div><h2 class="cx__t">NOT IN THE PRODUCT YET</h2></header><div class="cx__b"><div class="cp-ghost">${fields.map((f) => `<span>${f}</span>`).join('')}</div>${ntb('THESE FIELDS APPEAR HERE WHEN THE SECTION IS BUILT. THE DESIGN KEEPS THE SAME HORIZON, QUEUE AND CASE.')}</div></section>`;
  }
  const d = DUES[item] && cpItems().some((x) => x.id === item) ? DUES[item] : cpItems()[0];
  if (!d) return `<section class="rg cx cp-case"><div class="cx__b">${ntb('NOTHING IN THIS VIEW')}</div></section>`;
  const s = dueState(d);
  const m = DUE_META[d.id];
  const subj = subjectOf(d);
  const key = `deadline:${d.id}`;
  const pct = Math.max(0, Math.min(100, ((30 - Math.max(d.days, 0)) / 30) * 100));
  const renewed = s[0] === 'RENEWED';
  const primary = d.id === 'dl-tk-09'
    ? simBtn(`cp:auth:${d.id}`, { label: 'REQUEST REPAIR AUTHORIZATION', effect: 'SENDS THE REPAIR ESTIMATE TO T&K TO APPROVE SO THE TRUCK CAN RETURN TO SERVICE.', apply: () => (WSX.over['ticket:t-tk-2'] = ['AUTHORIZATION REQUESTED', 'gold']), rec: key, primary: true })
    : d.id === 'dl-rj-ucr'
      ? simBtn(`cp:pay:${d.id}`, { label: 'ASK FOR PAYMENT AUTHORIZATION', effect: 'ASKS R&J TO AUTHORIZE THE UCR FEE IN THEIR OFFICE.', apply: () => {}, rec: key, primary: true })
      : simBtn(`cp:rem:${d.id}`, { label: m.docs.length ? 'REQUEST THE NEW DOCUMENT' : 'SEND REMINDER', effect: m.docs.length ? 'ASKS THE CLIENT TO UPLOAD THE RENEWED DOCUMENT IN THEIR OFFICE.' : 'REMINDS THE CLIENT IN THEIR OFFICE AND BY EMAIL.', apply: () => {}, rec: key, primary: true });
  const done = simBtn(`cp:done:${d.id}`, { label: 'MARK RENEWED', effect: 'CLOSES THE DEADLINE ONCE THE NEW DOCUMENT IS REVIEWED.', apply: () => (WSX.over[key] = ['RENEWED', 'ok']), rec: key });
  const reassign = simBtn(`cp:own:${d.id}`, { label: 'REASSIGN', effect: 'MOVES THIS DEADLINE TO ANOTHER STAFF MEMBER.', apply: () => {}, rec: key, founder: true, sm: true });
  // ultra-wide has the room: a truck subject is drawn as the Fleet slab, with its eight connections one tap from Fleet
  const vid = subj.truck ? DUE_META[d.id].subject.split(':')[1] : null;
  const slab = vid && WSX.device === 'wide' ? (() => {
    const v = VEHICLES[vid];
    const conns = fleetConns(v);
    return `<div class="fl-slab fl-slab--mini cp-slab" data-swap="slab:${d.id}"><div class="cl-vstage"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[vid].cab)}</svg><span>${sw(vAvail(v))}</span><b>${v.unit}</b></div><div class="fl-cluster">${CONN.map(([k, l, i]) => `<button type="button" class="fl-cg fl-cg--${conns[k].tone}" data-a="go" data-v="fleet:${vid}:${k}" aria-label="${l} · ${conns[k].word} — open in Fleet">${ico(i)}<span>${l}</span><small>${conns[k].tagW || conns[k].word}</small></button>`).join('')}</div></div>`;
  })() : '';
  const subjCard = `<div class="cp-subj">${subj.truck && !slab ? `<svg viewBox="0 0 500 210" class="cp-truck" aria-hidden="true">${truckShape(FLEET_META[DUE_META[d.id].subject.split(':')[1]].cab)}</svg>` : `<span class="cp-subj__b">${badge(ACCOUNTS[d.client])}</span>`}<span style="min-width:0"><small>${subj.kind}</small><b>${subj.title}</b><span>${subj.sub}</span></span><button type="button" class="wbtn wbtn--sm" data-a="go" data-v="${subj.go}">${subj.goLabel}${ico('fwd')}</button></div>`;
  const due = `<div class="cp-due cp-due--${s[1]}"><div><b>${renewed ? 'DONE' : d.days < 0 ? `${-d.days}` : d.days === 0 ? 'NOW' : d.days}</b><span>${renewed ? 'RENEWED' : d.days < 0 ? 'DAY LATE' : d.days === 0 ? 'BLOCKING' : 'DAYS LEFT'}</span></div><div class="cp-due__r"><small>DUE</small><b>${d.due}</b><span class="cp-bar"><i style="width:${renewed ? 0 : pct}%"></i></span></div></div>`;
  const left = `<div class="cp-col cp-col--a"><div class="sec-l">SUBJECT</div>${slab}${subjCard}<div class="sec-l">REQUIRED</div><p class="cx__lead">${m.need}</p></div>`;
  // connected context: what else this client has on the horizon
  const also = vals(DUES).filter((x) => x.client === d.client && x.id !== d.id).sort((a, b) => a.days - b.days);
  const related = `<div class="cp-col cp-col--c">${also.length ? `<div><div class="sec-l">ALSO DUE · ${clientName(d.client)}</div><div class="cp-also">${also.map((x) => { const xs = dueState(x); return `<button type="button" class="cp-also__r" data-a="cp.item" data-v="${x.id}"><span class="cp-cd cp-cd--${xs[1]} cp-cd--s"><b>${x.days < 0 ? x.days : x.days === 0 ? 'NOW' : x.days}</b></span><span><b>${x.what.split(' · ')[0]}</b><small>${x.due.replace(', 2026', '')}</small></span></button>`; }).join('')}</div></div>` : ''}${mhist(key, m.hist)}</div>`;
  const right = `<div class="cp-col cp-col--b"><div class="sec-l"><span>OWNER</span>${reassign}</div><div class="cp-own">${av(m.owner)}<b>${staffName(m.owner)}</b><small>${STAFF[m.owner].area}</small></div><div class="sec-l">DOCUMENTS</div>${m.docs.length ? m.docs.map(docChip).join('') : `<div class="ntb">${ico('folder')}<span>NO DOCUMENT ON FILE YET</span></div>`}</div>`;
  const next = renewed ? nextBlock('RENEWED FOR THIS VISIT', '', 'done') : nextBlock(m.need, `${primary}${done}`);
  return `<section class="rg cx cp-case"><header class="cx__h"><div class="cx__hd" data-swap="hd:${d.id}"><div class="cx__crumb"><span>COMPLIANCE</span>${ico('fwd')}<span>${sec === 'corrective' ? 'CORRECTIVE WORK' : 'EXPIRATIONS'}</span>${ico('fwd')}<span>${d.kind}</span></div><div class="cp-h"><div class="cp-h__t"><h2 class="cx__t">${d.what}</h2><span class="cp-h__s">${sw(s)}<span class="pk__s">${clientName(d.client)}</span></span></div>${due}</div></div></header><div class="cx__b" data-keep="cp-case" data-swap="b:${d.id}">${next}<div class="cp-cols">${left}${right}${related}</div></div></section>`;
}

function compBar() {
  const all = vals(DUES);
  const n = (f) => all.filter(f).length;
  const f = WSX.comp.filter;
  const r = [ro(n((d) => urgency(d) === 'now'), 'NOW', { tone: 'bad', a: 'cp.filter', v: 'now', on: f === 'now' }), ro(n((d) => urgency(d) === 'week'), 'THIS WEEK', { tone: 'warn', a: 'cp.filter', v: 'week', on: f === 'week' }), ro(n((d) => ['now', 'week', 'month'].includes(urgency(d))), 'IN 30 DAYS', { a: 'cp.filter', v: '30', on: f === '30' }), ...(VP === 'mobile' ? [] : [ro(all.length, 'TRACKED', { a: 'cp.filter', v: 'all', on: f === 'all' })])].join('');
  return wsBar('03 · WORK', 'COMPLIANCE', r);
}
function compSections() {
  if (VP === 'mobile') return seg([['expirations', 'EXPIRATIONS'], ['dot_safety', 'DOT / SAFETY', null, true], ['audits', 'AUDITS', null, true], ['corrective', 'CORRECTIVE']], WSX.comp.sec, 'cp.sec', 'wseg--fit');
  return seg([['expirations', 'EXPIRATIONS', vals(DUES).length], ['dot_safety', 'DOT / SAFETY', null, true], ['audits', 'AUDITS', null, true], ['corrective', 'CORRECTIVE WORK', 1]], WSX.comp.sec, 'cp.sec');
}
function compView() {
  if (VP === 'mobile') return `<div class="ws cp cp--m">${compBar()}${compSections()}${cpHorizon(true)}${cpQueue()}</div>${phoneSheet(cpCase(), { label: 'Compliance issue' })}`;
  if (VP === 'tablet') return `<div class="ws cp cp--t">${compBar()}${compSections()}${cpHorizon()}<div class="cp-t2">${cpQueue()}${cpCase()}</div></div>`;
  return `<div class="ws cp">${compBar()}<div class="cp-grid"><div class="cp-top">${compSections()}${cpHorizon()}</div>${cpQueue()}${cpCase()}</div></div>`;
}

ACT['cp.item'] = (id) => {
  WSX.comp.item = id;
  WSX.pending = null;
};
ACT['cp.open'] = (id) => {
  WSX.comp.item = id;
  WSX.sheet = true;
  WSX.pending = null;
};
ACT['cp.sec'] = (s) => {
  WSX.comp.sec = s;
  WSX.comp.filter = 'all';
  WSX.pending = null;
  const first = cpItems()[0];
  if (first) WSX.comp.item = s === 'expirations' && DUES['dl-abc-med'] ? WSX.comp.item : first.id;
};
ACT['cp.filter'] = (f) => {
  WSX.comp.filter = f;
  WSX.comp.sec = 'expirations';
  const list = cpItems();
  if (list.length && !list.some((d) => d.id === WSX.comp.item)) WSX.comp.item = list[0].id;
};
