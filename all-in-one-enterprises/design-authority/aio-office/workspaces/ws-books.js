/*
 * PROOF 02 — BOOKKEEPING. Period-centered: clients and their close (left) · the month's close as a ledger rule and a
 * worktable for the active phase (center) · the selected document, charge or check in focus (right). Typography and
 * structure carry it; no photography. Amounts are SAMPLE line items, never balances. Reconciliation matching and report
 * delivery are not built in the live app and are said so in one line.
 */
const BK_CLIENTS = ['c-tk', 'c-rl', 'c-dh', 'c-rj'];
const bkPeriod = (cid = WSX.books.client, p = WSX.books.period) => BOOKS[cid]?.periods[p];
const bkDocState = (cid, p, d) => ov(`bkdoc:${cid}:${p}:${d.id}`, d.status);
const bkItemState = (cid, p, q) => WSX.over[`bkq:${cid}:${p}:${q.id}`] ?? null;
const DOC_TONE = { RECEIVED: 'ok', MISSING: 'bad', REQUESTED: 'warn', 'NOT YET DUE': 'mute' };
const CAT_ICON = { FUEL: 'fuel', SUPPLIES: 'tag', REPAIRS: 'wrench', 'OWNER PERSONAL': 'profile', 'ASK THE CLIENT': 'letter' };
function bkCounts(cid = WSX.books.client, p = WSX.books.period) {
  const per = bkPeriod(cid, p);
  if (!per) return { missing: 0, questions: 0 };
  return { missing: per.docs.filter((d) => /MISSING|REQUESTED/.test(bkDocState(cid, p, d))).length, questions: per.items.filter((q) => !bkItemState(cid, p, q)).length };
}
function bkStep(cid = WSX.books.client, p = WSX.books.period) {
  const per = bkPeriod(cid, p);
  if (!per) return -1;
  return WSX.over[`bkstep:${cid}:${p}`] ?? per.step;
}
const phaseOf = (step) => BOOK_PHASES.find(([, , steps]) => steps.includes(step))?.[0] ?? 'collect';

/* ── the close as a ledger rule ── */
function bkSpine() {
  const step = bkStep();
  const c = bkCounts();
  const counts = { collect: c.missing, reconcile: c.questions, review: null, deliver: null };
  const phases = BOOK_PHASES.map(([id, label, steps]) => {
    const state = steps[steps.length - 1] < step ? 'done' : steps.includes(step) ? 'now' : 'later';
    return `<button type="button" class="bk-ph bk-ph--${state} ${id === WSX.books.phase ? 'is-on' : ''}" style="grid-column:${steps[0] + 1} / ${steps[steps.length - 1] + 2}" data-a="bk.phase" data-v="${id}"><b>${label}</b><span>${state === 'done' ? 'DONE' : state === 'now' ? 'NOW' : 'LATER'}${counts[id] ? ` · ${counts[id]} OPEN` : ''}</span></button>`;
  }).join('');
  const nodes = CYCLE_STEPS.map((s, i) => `<div class="bk-node bk-node--${i < step ? 'done' : i === step ? 'now' : 'later'}"><i>${i < step ? ico('pass') : i + 1}</i><span>${s}</span></div>`).join('');
  return `<section class="bk-spine"><div class="bk-spine__ph">${phases}</div><div class="bk-spine__rule">${nodes}</div></section>`;
}

/* ── worktable for the active phase ── */
function bkTable() {
  const { client: cid, period: p, phase, item } = WSX.books;
  const per = bkPeriod();
  if (BOOKS[cid].paused) return rgn('CLOSES PAUSED', '', '', `<div class="bk-paused">${sw(['PAST DUE', 'bad'])}<b>CLOSES ARE PAUSED FOR ${clientName(cid)}</b><span>BILLING IS FOUNDER / BILLING GRANT ONLY.</span>${simBtn(`bk:rj:remind`, { label: 'SEND PAST-DUE REMINDER', effect: 'EMAILS THE CLIENT A PAYMENT REMINDER. NO CHARGE IS MADE.', apply: () => {}, rec: `client:${cid}`, primary: true, founder: true })}</div>`, 'bk-table');
  if (!per) return rgn('NO CLOSE FOR THIS PERIOD', '', '', `<div class="bk-paused"><b>${clientName(cid)} WAS NOT A BOOKKEEPING CLIENT IN ${p}</b></div>`, 'bk-table');
  const sel = (k) => (item === k ? 'is-sel' : '');
  if (phase === 'collect') {
    const rows = per.docs.map((d) => {
      const s = bkDocState(cid, p, d);
      return `<tr class="lt-row ${sel(`doc:${d.id}`)}" data-a="bk.item" data-v="doc:${d.id}"><td><b class="pk__t">${d.name}</b></td><td class="lt-m">${d.source}</td><td>${sw([s, DOC_TONE[s] || 'mute'])}</td><td class="lt-m lt-r">${bkDocDate(cid, p, d)}</td></tr>`;
    });
    return rgn(`DOCUMENTS FOR ${p}`, `${per.docs.length - bkCounts().missing} OF ${per.docs.length} IN`, '', `<table class="lt" data-swap="t:${cid}:${p}:collect"><thead><tr><th>DOCUMENT</th><th>FROM</th><th>STATUS</th><th class="lt-r">WHEN</th></tr></thead><tbody>${rows.join('') || '<tr><td colspan="4" class="lt-empty">NOTHING REQUESTED YET</td></tr>'}</tbody></table>`, 'bk-table', 'bk-table');
  }
  if (phase === 'reconcile') {
    const rows = per.items.map((q) => {
      const s = bkItemState(cid, p, q);
      return `<tr class="lt-row ${sel(`q:${q.id}`)}" data-a="bk.item" data-v="q:${q.id}"><td class="lt-m">${q.date}</td><td><b class="pk__t">${q.desc}</b><span class="pk__s">${q.acct}</span></td><td class="lt-r lt-amt">${q.amt}</td><td class="lt-q">${s ? `${sw([s === 'ASK THE CLIENT' ? 'ASKED' : s, s === 'ASK THE CLIENT' ? 'gold' : 'ok'])} <span class="simtag">SIM</span>` : `<span class="bk-ask">${q.ask}</span>`}</td></tr>`;
    });
    const accts = per.docs.filter((d) => /STATEMENT/.test(d.name)).map((d) => `<tr class="lt-row ${sel(`acct:${d.id}`)}" data-a="bk.item" data-v="acct:${d.id}"><td colspan="2"><b class="pk__t">${d.name.replace(' STATEMENT', '')}</b><span class="pk__s">STATEMENT ${bkDocState(cid, p, d)}</span></td><td></td><td>${sw(bkStep() > 4 ? ['RECONCILED', 'ok'] : bkStep() === 4 ? ['IN PROGRESS', 'gold'] : ['NOT STARTED', 'mute'])}</td></tr>`).join('');
    return rgn('CHARGES NEEDING A CATEGORY', per.items.length ? `${bkCounts().questions} OPEN · AMOUNTS ARE SAMPLES` : 'NONE', '', `<table class="lt" data-swap="t:${cid}:${p}:reconcile"><thead><tr><th>DATE</th><th>CHARGE</th><th class="lt-r">AMOUNT</th><th>QUESTION</th></tr></thead><tbody>${rows.join('') || '<tr><td colspan="4" class="lt-empty">NO OPEN QUESTIONS THIS PERIOD</td></tr>'}<tr class="lt-sub"><td colspan="4">ACCOUNTS</td></tr>${accts}</tbody></table><div style="padding:10px 14px">${ntb('<b>MATCHING TRANSACTIONS TO STATEMENTS IS NOT BUILT.</b> THE STEP IS TRACKED HERE; MATCHING HAPPENS OUTSIDE AIO.')}</div>`, 'bk-table', 'bk-table');
  }
  if (phase === 'review') {
    const done = bkChecks();
    const rows = REVIEW_CHECKS.map((t, i) => `<tr class="lt-row ${sel(`chk:${i}`)}" data-a="bk.item" data-v="chk:${i}"><td style="width:36px"><span class="bk-tick bk-tick--${done[i] ? 'ok' : 'open'}">${done[i] ? ico('pass') : ''}</span></td><td><b class="pk__t">${t}</b></td><td>${sw(done[i] ? ['DONE', 'ok'] : ['OPEN', 'mute'])}</td></tr>`).join('');
    return rgn('STAFF REVIEW', `${done.filter(Boolean).length} OF ${REVIEW_CHECKS.length}`, '', `<table class="lt" data-swap="t:${cid}:${p}:review"><tbody>${rows}</tbody></table>`, 'bk-table', 'bk-table');
  }
  const delivered = bkStep() >= 7;
  const reports = [['pl', 'PROFIT & LOSS'], ['bs', 'BALANCE SHEET']].map(([k, t]) => `<tr class="lt-row ${sel(`rep:${k}`)}" data-a="bk.item" data-v="rep:${k}"><td><b class="pk__t">${t} · ${p}</b><span class="pk__s">${BOOKS[cid].sub ? SUBSCRIPTIONS[BOOKS[cid].sub].pkg : ''}</span></td><td>${sw(delivered ? ['DELIVERED', 'ok'] : ['NOT PREPARED', 'mute'])}</td><td class="lt-m lt-r">${delivered ? per.closed ?? '' : ''}</td></tr>`).join('');
  return rgn('REPORT PACKAGE', '', '', `<table class="lt" data-swap="t:${cid}:${p}:deliver"><tbody>${reports}</tbody></table><div style="padding:10px 14px">${ntb('<b>THE DELIVERY WORKSPACE IS NOT BUILT.</b> DELIVERED IS RECORDED AS A CLOSE STATUS.')}</div>`, 'bk-table', 'bk-table');
}
const bkDocDate = (cid, p, d) => (bkDocState(cid, p, d) === 'RECEIVED' && d.status !== 'RECEIVED' ? 'JUST NOW' : d.date);
function bkChecks() {
  const c = bkCounts();
  const step = bkStep();
  const signed = !!WSX.over[`bksign:${WSX.books.client}:${WSX.books.period}`] || step > 5;
  return [c.missing === 0, c.questions === 0, c.questions === 0 && step >= 3, step > 5, signed];
}

/* ── focus panel ── */
function bkFocus() {
  const { client: cid, period: p, item } = WSX.books;
  const per = bkPeriod();
  const crumb = (t) => `<div class="cx__crumb"><span>${clientName(cid)}</span>${ico('fwd')}<span>${p}</span>${t ? `${ico('fwd')}<span>${t}</span>` : ''}</div>`;
  if (!per || !item) {
    const c = bkCounts();
    const step = bkStep();
    return `<section class="rg cx bk-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${cid}:${p}:none">${crumb()}<h2 class="cx__t">${per ? `${p} CLOSE` : clientName(cid)}</h2>${per ? sw([CYCLE_STEPS[step] ?? '—', step >= 8 ? 'ok' : 'gold']) : ''}</div></header><div class="cx__b" data-swap="b:${cid}:${p}:none">${per ? `<div class="bk-meter"><b>${Math.min(step + 1, 9)}<small>/ 9</small></b><span><small>STEP · ${CYCLE_STEPS[step] ?? '—'}</small><span class="bk-meter__bar bk-meter__bar--9">${CYCLE_STEPS.map((_, j) => `<i class="${j < step ? 'd' : ''} ${j === step ? 'is-sel' : ''}"></i>`).join('')}</span></span></div>` : ''}${per ? `${nextBlock(c.missing ? `${c.missing} DOCUMENT${c.missing > 1 ? 'S' : ''} STILL MISSING` : c.questions ? `${c.questions} CHARGES NEED A CATEGORY` : step >= 8 ? 'THIS PERIOD IS CLOSED' : 'READY FOR STAFF REVIEW', '', c.missing || c.questions ? '' : 'calm')}${facts([['CLIENT', clientName(cid)], ['PACKAGE', SUBSCRIPTIONS[BOOKS[cid].sub]?.pkg ?? '—'], ['DUE', per.due], ['OWNER', staffName(SUBSCRIPTIONS[BOOKS[cid].sub]?.owner)]])}` : ''}</div></section>`;
  }
  const [kind, id] = item.split(':');
  let title = '';
  let body = '';
  if (kind === 'doc') {
    const d = per.docs.find((x) => x.id === id);
    const s = bkDocState(cid, p, d);
    title = d.name;
    const key = `bkdoc:${cid}:${p}:${d.id}`;
    const open = /MISSING|REQUESTED/.test(s);
    const reminded = (WSX.hist[key] || []).length > 0;
    const track = [['ASKED', open || s === 'RECEIVED', d.date.replace('ASKED ', '')], ['REMINDED', reminded, reminded ? 'JUST NOW' : ''], ['RECEIVED', s === 'RECEIVED', s === 'RECEIVED' ? bkDocDate(cid, p, d) : '']];
    body = `<div class="bk-doc"><span class="bk-docsheet bk-docsheet--${DOC_TONE[s] || 'mute'}"><i></i><i></i><i></i><i></i><em>${s}</em></span><span class="bk-doc__t"><small>FROM ${d.source}</small><b>${d.name}</b><span class="bk-track">${track.map(([l, on, w]) => `<span class="${on ? 'is-on' : ''}"><i></i><b>${l}</b><small>${w || '—'}</small></span>`).join('')}</span></span></div>
      ${open ? nextBlock(`${clientName(cid)} HAS NOT SENT IT YET`, `${simBtn(`bk:rem:${key}`, { label: 'REMIND THE CLIENT', effect: 'SENDS A REMINDER TO THE CLIENT’S OFFICE AND EMAIL.', apply: () => {}, rec: key, primary: true })}${simBtn(`bk:got:${key}`, { label: 'MARK RECEIVED', effect: 'RECORDS THE DOCUMENT AS RECEIVED FOR THIS PERIOD.', apply: () => (WSX.over[key] = 'RECEIVED'), rec: key })}`) : nextBlock('RECEIVED', '', 'done')}
      ${facts([['FOR', `${clientName(cid)} · ${p}`], ['NEEDED FOR', /RECEIPT/.test(d.name) ? 'FUEL COSTS AND IFTA' : /PAY/.test(d.name) ? 'DRIVER WAGES' : 'MATCHING THE MONTH']])}
      ${d.link ? docChip(d.link) : ''}${mhist(key, open ? [[d.date.replace('ASKED ', ''), 'REQUESTED FROM THE CLIENT']] : [[d.date, 'RECEIVED']])}`;
  }
  if (kind === 'q') {
    const q = per.items.find((x) => x.id === id);
    const key = `bkq:${cid}:${p}:${q.id}`;
    const s = WSX.over[key];
    title = q.desc;
    body = `${s ? nextBlock(s === 'ASK THE CLIENT' ? 'ASKED THE CLIENT' : `CATEGORIZED AS ${s}`, `<button type="button" class="wbtn wbtn--sm" data-a="bk.cat" data-v="${q.id}|">UNDO</button>`, 'done') : nextBlock(q.ask, `<div class="bk-cats">${q.options.map((o) => `<button type="button" class="bk-opt ${o === 'ASK THE CLIENT' ? 'bk-opt--ask' : ''}" data-a="bk.cat" data-v="${q.id}|${o}">${ico(CAT_ICON[o] || 'tag')}<b>${o}</b></button>`).join('')}</div>`)}
      <div class="bk-amt"><small>AMOUNT · SAMPLE</small><b>${q.amt}</b><span>${q.date} · ${q.acct}</span></div>
      ${facts([['ACCOUNT', q.acct], ['PERIOD', p], ['STATUS', s ? sw([s === 'ASK THE CLIENT' ? 'ASKED' : 'CATEGORIZED', s === 'ASK THE CLIENT' ? 'gold' : 'ok']) : sw(['NEEDS A CATEGORY', 'warn'])]])}
      ${s ? `<span class="simtag" style="justify-self:start">SIMULATED · NOT SAVED</span>` : ''}`;
  }
  if (kind === 'acct') {
    const d = per.docs.find((x) => x.id === id);
    title = d.name.replace(' STATEMENT', '');
    body = `${ntb('<b>MATCHING IS NOT BUILT.</b> STATEMENT RECEIVED; RECONCILIATION IS TRACKED AS A STEP.')}${facts([['STATEMENT', bkDocState(cid, p, d), d.date], ['STEP', CYCLE_STEPS[bkStep()]]])}`;
  }
  if (kind === 'chk') {
    const i = Number(id);
    const done = bkChecks();
    title = REVIEW_CHECKS[i];
    const all = done.slice(0, 4).every(Boolean);
    const signKey = `bksign:${cid}:${p}`;
    body = i === 4 && !done[4]
      ? nextBlock(all ? 'SIGN OFF THE STAFF REVIEW' : 'FINISH THE CHECKS ABOVE FIRST', all ? simBtn(`bk:sign:${signKey}`, { label: 'SIGN OFF REVIEW', effect: 'RECORDS YOUR STAFF REVIEW SIGN-OFF AND MOVES THE CLOSE TO REPORTS PREPARED.', apply: () => { WSX.over[signKey] = true; WSX.over[`bkstep:${cid}:${p}`] = 6; }, rec: signKey, primary: true }) : '', all ? '' : 'calm')
      : nextBlock(done[i] ? 'DONE' : i < 3 ? 'RESOLVE IT IN THE EARLIER PHASE' : 'CHECK BEFORE SIGN-OFF', i === 0 && !done[0] ? `<button type="button" class="wbtn" data-a="bk.phase" data-v="collect">GO TO COLLECT</button>` : i < 3 && !done[i] ? `<button type="button" class="wbtn" data-a="bk.phase" data-v="reconcile">GO TO RECONCILE</button>` : '', done[i] ? 'done' : 'calm');
    const n = done.filter(Boolean).length;
    body = `<div class="bk-meter"><b>${n}<small>/ ${REVIEW_CHECKS.length}</small></b><span><small>STAFF REVIEW</small><span class="bk-meter__bar">${done.map((x, j) => `<i class="${x ? 'd' : ''} ${j === i ? 'is-sel' : ''}"></i>`).join('')}</span></span></div>${body}`;
    body += facts([['STATE', sw(done[i] ? ['DONE', 'ok'] : ['OPEN', 'mute'])], ['REVIEWER', staffName(SUBSCRIPTIONS[BOOKS[cid].sub]?.owner)]]);
  }
  if (kind === 'rep') {
    title = id === 'pl' ? 'PROFIT & LOSS' : 'BALANCE SHEET';
    const delivered = bkStep() >= 7;
    body = `<div class="bk-cover"><small>${clientName(cid)}</small><b>${title}</b><span>${p}</span>${sw(delivered ? ['DELIVERED', 'ok'] : ['NOT PREPARED', 'mute'])}</div>${ntb('<b>THE DELIVERY WORKSPACE IS NOT BUILT.</b> REPORTS ARE PREPARED IN THE BOOKKEEPING SYSTEM.')}`;
  }
  // the rest of this step stays in reach below the focus, so the panel keeps working instead of ending in blank paper
  const go = VP === 'mobile' ? 'bk.open' : 'bk.item';
  const sib = (rows, label) => (rows.length > 1 ? `<div class="bk-sib"><div class="sec-l"><span>${label}</span><span>${rows.length}</span></div>${rows.map(([k, t, st, i]) => `<button type="button" class="pk bk-sib__r ${k === item ? 'is-sel' : ''}" data-a="${go}" data-v="${k}" title="${t}" aria-current="${k === item}">${ico(i)}<b class="pk__t">${t}</b>${sw(st)}</button>`).join('')}</div>` : '');
  if (kind === 'doc') body += sib(per.docs.map((d) => { const st = bkDocState(cid, p, d); return [`doc:${d.id}`, d.name, [st, DOC_TONE[st] || 'mute'], 'folder']; }), `DOCUMENTS FOR ${p}`);
  if (kind === 'q' || kind === 'acct') body += sib(per.items.map((q) => { const st = bkItemState(cid, p, q); return [`q:${q.id}`, q.desc, st ? [st === 'ASK THE CLIENT' ? 'ASKED' : st, st === 'ASK THE CLIENT' ? 'gold' : 'ok'] : ['OPEN', 'warn'], 'tag']; }), 'CHARGES THIS MONTH');
  if (kind === 'chk') body += sib(REVIEW_CHECKS.map((t, j) => [`chk:${j}`, t, bkChecks()[j] ? ['DONE', 'ok'] : ['OPEN', 'mute'], bkChecks()[j] ? 'pass' : 'pending']), 'STAFF REVIEW');
  if (kind === 'rep') body += sib([['rep:pl', 'PROFIT & LOSS'], ['rep:bs', 'BALANCE SHEET']].map(([k, t]) => [k, t, bkStep() >= 7 ? ['DELIVERED', 'ok'] : ['NOT PREPARED', 'mute'], 'summary']), `REPORTS FOR ${p}`);
  const sk = `${cid}:${p}:${item}`;
  return `<section class="rg cx bk-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${sk}">${crumb(kind === 'q' ? 'CHARGE' : kind === 'doc' ? 'DOCUMENT' : kind === 'chk' ? 'REVIEW' : kind === 'rep' ? 'REPORT' : 'ACCOUNT')}<h2 class="cx__t">${title}</h2></div></header><div class="cx__b" data-keep="bk-cx" data-swap="b:${sk}">${body}</div></section>`;
}

/* ── clients rail ── */
function bkRail(asStrip = false) {
  const p = WSX.books.period;
  const items = BK_CLIENTS.map((cid) => {
    const b = BOOKS[cid];
    const per = b.periods[p];
    const step = per ? bkStep(cid, p) : -1;
    const bar = per ? `<span class="bk-mini">${CYCLE_STEPS.map((_, i) => `<i class="${i < step ? 'd' : i === step ? 'n' : ''}"></i>`).join('')}</span>` : '';
    const state = b.paused ? sw(['PAUSED · PAST DUE', 'bad']) : per ? sw([step >= 8 ? 'CLOSED' : CYCLE_STEPS[step], step >= 8 ? 'ok' : 'gold']) : sw(['NO CLOSE', 'mute']);
    if (asStrip) return `<button type="button" class="bk-chip ${cid === WSX.books.client ? 'is-sel' : ''}" data-a="bk.client" data-v="${cid}">${badge(ACCOUNTS[cid])}<span>${ACCOUNTS[cid].name}</span>${bar}</button>`;
    return `<div class="pk bk-cl ${cid === WSX.books.client ? 'is-sel' : ''}" data-a="bk.client" data-v="${cid}">${badge(ACCOUNTS[cid])}<span style="min-width:0"><b class="pk__t">${ACCOUNTS[cid].name}</b><span class="pk__s">${SUBSCRIPTIONS[b.sub].pkg}${per ? ` · DUE ${per.due}` : ''}</span>${bar}${state}</span></div>`;
  }).join('');
  const cad = seg([['monthly', 'MONTHLY'], ['annual', 'ANNUAL']], WSX.books.cadence, 'bk.cadence', 'wseg--cad');
  const none = `<div class="bk-none"><b>NO ANNUAL CLIENTS IN THIS SAMPLE</b><span>ANNUAL CLOSES WOULD LIST HERE BY TAX YEAR.</span></div>`;
  const list = WSX.books.cadence === 'annual' ? none : items;
  if (asStrip) return `<div class="bk-stripwrap">${cad}<div class="bk-strip">${WSX.books.cadence === 'annual' ? none : items}</div></div>`;
  return rgn(WSX.books.cadence === 'annual' ? 'ANNUAL CLIENTS' : `MONTHLY · ${p}`, WSX.books.cadence === 'annual' ? '0' : '4', '', `<div class="bk-rail__tools">${cad}</div>${list}`, 'bk-rail', 'bk-rail');
}
function bkBar() {
  const { client: cid, period: p } = WSX.books;
  const per = bkPeriod();
  const c = bkCounts();
  const due = per ? `${per.due}` : '—';
  const pi = BOOK_PERIODS.indexOf(p);
  const period = `<div class="bk-period"><button type="button" class="wbtn wbtn--icon wbtn--sm" data-a="bk.period" data-v="${BOOK_PERIODS[Math.max(0, pi - 1)]}" ${pi === 0 ? 'disabled aria-disabled="true"' : ''} aria-label="Previous period">${ico('back')}</button><b>${p}</b><button type="button" class="wbtn wbtn--icon wbtn--sm" data-a="bk.period" data-v="${BOOK_PERIODS[Math.min(BOOK_PERIODS.length - 1, pi + 1)]}" ${pi === BOOK_PERIODS.length - 1 ? 'disabled aria-disabled="true"' : ''} aria-label="Next period">${ico('fwd')}</button></div>`;
  const r = per ? [ro(due, 'CLOSE DUE'), ro(c.missing, 'DOCUMENTS MISSING', { tone: c.missing ? 'bad' : '', a: c.missing ? 'bk.phase' : '', v: 'collect' }), ro(c.questions, 'QUESTIONS', { tone: c.questions ? 'warn' : '', a: c.questions ? 'bk.phase' : '', v: 'reconcile' }), ro(`${Math.min(bkStep() + 1, 9)}/9`, 'STEP', { tone: 'gold' })].join('') : '';
  if (VP === 'mobile') return `${wsBar('09 · WORK', 'BOOKKEEPING', '', period)}${per ? `<div class="ros ros--m">${r}</div>` : ''}`;
  return wsBar('09 · WORK', 'BOOKKEEPING', r, `${period}<span class="chipsel">${badge(ACCOUNTS[cid])}${ACCOUNTS[cid].name}</span>`);
}
/** Ultra-wide only: the month at a glance — the close as a timeline, what is in, what is answered. */
function bkMonth() {
  const { client: cid, period: p } = WSX.books;
  const per = bkPeriod();
  if (!per) return '';
  const step = bkStep();
  const c = bkCounts();
  const docsIn = per.docs.length - c.missing;
  const answered = per.items.length - c.questions;
  const checks = bkChecks().filter(Boolean).length;
  const tally = (n, of, l, tone) => `<div class="bk-tally"><b class="${tone}">${n}<small>/ ${of}</small></b><span>${l}</span><i style="width:${of ? (n / of) * 100 : 100}%"></i></div>`;
  const tl = CYCLE_STEPS.map((t, i) => `<li class="${i < step ? 'd' : i === step ? 'n' : ''}"><i>${i < step ? ico('pass') : i + 1}</i><span>${t}</span>${i === step ? `<small>NOW</small>` : i === 8 && per.closed ? `<small>${per.closed}</small>` : ''}</li>`).join('');
  return rgn('THE MONTH', p, '', `<div class="bk-month" data-swap="m:${cid}:${p}">${tally(docsIn, per.docs.length, 'DOCUMENTS IN', c.missing ? 'bad' : 'ok')}${tally(answered, per.items.length, 'CHARGES ANSWERED', c.questions ? 'warn' : 'ok')}${tally(checks, REVIEW_CHECKS.length, 'REVIEW CHECKS', '')}<div class="sec-l">THE CLOSE · DUE ${per.due}</div><ol class="bk-tl">${tl}</ol></div>`, 'bk-monthrg', 'bk-month');
}
function bkAnnualTable() {
  return rgn('ANNUAL CLOSES', '0', '', `<div class="bk-paused"><b>NO ANNUAL BOOKKEEPING CLIENTS IN THIS SAMPLE</b><span>ANNUAL CLOSES WOULD BE WORKED HERE BY TAX YEAR. NOTHING IS INVENTED.</span>${ntb('<b>SAMPLE DATA HAS MONTHLY CLIENTS ONLY.</b> SWITCH BACK TO MONTHLY.')}</div>`, 'bk-table');
}
function booksView() {
  const annual = WSX.books.cadence === 'annual';
  const per = annual ? null : bkPeriod();
  const table = annual ? bkAnnualTable() : bkTable();
  const focus = annual ? `<section class="rg cx bk-cx"><header class="cx__h"><h2 class="cx__t">ANNUAL</h2>${sw(['NO SAMPLE CLIENTS', 'mute'])}</header><div class="cx__b">${nextBlock('NOTHING TO WORK ON', '', 'calm')}</div></section>` : bkFocus();
  if (VP === 'mobile') {
    const items = annual ? table : bkMobileList();
    return `<div class="ws bk bk--m">${bkBar()}${bkRail(true)}${per ? `${seg(BOOK_PHASES.map(([id, l]) => [id, l]), WSX.books.phase, 'bk.phase', 'wseg--fit')}<div class="bk-mstep">${sw([`STEP ${bkStep() + 1} OF 9 · ${CYCLE_STEPS[bkStep()]}`, 'gold'])}</div>` : ''}${items}</div>${annual ? '' : phoneSheet(focus, { label: 'Bookkeeping detail' })}`;
  }
  if (VP === 'tablet') return `<div class="ws bk bk--t">${bkBar()}${bkRail(true)}${per ? bkSpine() : ''}<div class="bk-t2">${table}${focus}</div></div>`;
  return `<div class="ws bk">${bkBar()}${per ? bkSpine() : '<div></div>'}<div class="bk-grid ${WIDE && per ? 'bk-grid--4' : ''}">${bkRail()}${table}${focus}${WIDE && per ? bkMonth() : ''}</div></div>`;
}
/** Phone: the active phase as a list; tapping a row opens it in the drawer. */
function bkMobileList() {
  const html = bkTable();
  return html.replace(/data-a="bk\.item"/g, 'data-a="bk.open"');
}

/* ── actions ── */
ACT['bk.cadence'] = (c) => {
  WSX.books.cadence = c;
  WSX.books.item = null;
  WSX.pending = null;
  WSX.sheet = false;
};
ACT['bk.client'] = (cid) => {
  WSX.books.client = cid;
  if (!BOOKS[cid].periods[WSX.books.period] && !BOOKS[cid].paused) WSX.books.period = 'SEP 2026';
  const per = bkPeriod();
  WSX.books.phase = per ? phaseOf(bkStep()) : 'collect';
  WSX.books.item = null;
  WSX.pending = null;
};
ACT['bk.period'] = (p) => {
  WSX.books.period = p;
  const per = bkPeriod();
  WSX.books.phase = per ? phaseOf(Math.min(bkStep(), 8)) : 'collect';
  WSX.books.item = null;
  WSX.pending = null;
};
ACT['bk.phase'] = (ph) => {
  WSX.books.phase = ph;
  WSX.books.item = null;
  WSX.pending = null;
};
ACT['bk.item'] = (k) => {
  WSX.books.item = k;
  WSX.pending = null;
};
ACT['bk.open'] = (k) => {
  WSX.books.item = k;
  WSX.sheet = true;
  WSX.pending = null;
};
ACT['bk.cat'] = (v) => {
  const [qid, choice] = v.split('|');
  const { client: cid, period: p } = WSX.books;
  const key = `bkq:${cid}:${p}:${qid}`;
  if (choice) {
    WSX.over[key] = choice;
    WSX.sims.unshift(`CHARGE ${choice === 'ASK THE CLIENT' ? 'SENT TO THE CLIENT' : `CATEGORIZED AS ${choice}`}`);
    WSX.flash = `SIMULATED · ${choice === 'ASK THE CLIENT' ? 'ASKED THE CLIENT' : `CATEGORIZED AS ${choice}`}`;
    // move to the next open charge
    const next = bkPeriod().items.find((q) => !bkItemState(cid, p, q));
    if (next && VP !== 'mobile') WSX.books.item = `q:${next.id}`;
  } else delete WSX.over[key];
};
