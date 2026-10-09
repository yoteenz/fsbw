/*
 * 02 — FILING & FUEL TAXES. Quarter-centred: the quarter on an obsidian plate (Q3 2026 · the period · the October
 * filing window · RETURNS DUE OCT 31) with every client's dated step on its runway · the queue in the approved IFTA
 * buckets (NEEDS AIO · AWAITING CLIENT · READY TO FILE · FILED · COMPLETE) · the selected client quarter with the
 * approved four-step filing workflow and one next step. The approved IFTA staff screens open UNCHANGED in a viewer
 * (OPEN THE IFTA FILING ROOM) — never redrawn. Filing is manual staff work on the state portal: no government API.
 */
WSX.fi = { sec: 'ifta', q: 'ifta-rl-q3', room: 'case', back: false };

const FI_SECS = [['ifta', 'IFTA'], ['queue', 'FILING QUEUE'], ['approval', 'CLIENT APPROVAL'], ['filed', 'SUBMITTED / FILED'], ['history', 'FILING HISTORY']];
/** The approved IFTA queue buckets, in the order a return travels. */
const FI_BUCKETS = [['aio', 'NEEDS AIO', 'warn'], ['client', 'AWAITING CLIENT', 'gold'], ['ready', 'READY TO FILE', 'gold'], ['filed', 'FILED', 'ok'], ['complete', 'COMPLETE', 'ok']];
const FI_COL = { 'NEEDS REVIEW': 'aio', 'AWAITING CLIENT': 'client', 'READY TO FILE': 'ready', FILED: 'filed', COMPLETE: 'complete', BLOCKED: 'held' };
/** The approved four-step filing workflow. */
const FI_STEPS = ['DATA COLLECTION', 'AIO PREPARATION', 'CLIENT REVIEW', 'FILE & CONFIRM'];
/** Where a case stands, read from its status: [step (4 = all done, -1 = not started), who has it, word]. */
const FI_STAT = {
  'NEEDS CLIENT': [0, 'client', 'WAITING ON CLIENT'],
  'AIO REVIEW': [1, 'aio', 'AIO REVIEW'],
  'CLIENT APPROVAL': [2, 'client', 'WAITING ON CLIENT'],
  APPROVED: [3, 'aio', 'READY TO FILE'],
  FILED: [4, 'done', 'FILED'],
  ARCHIVED: [4, 'done', 'COMPLETE'],
  'NOT ENROLLED': [-1, 'held', 'NOT ENROLLED'],
};
/** SAMPLE · dates and history around TODAY (filed dates as REPORTS › FILING HISTORY lists them). */
const FI_META = {
  'ifta-rl-q3': { approve: 'OCT 13', hist: [['5 HRS AGO', 'RETURN READY FOR AIO REVIEW'], ['YESTERDAY', 'Q3 WORKSHEET DRAFTED']] },
  'ifta-tk-q3': { hist: [['3 HRS AGO', 'FUEL RECEIPTS · UNIT 07 UPLOADED']] },
  'ifta-hf-q3': { filed: 'OCT 6', hist: [['OCT 6', 'FILED ON TIME · PAYMENT CONFIRMED']] },
  'ifta-dh-q3': { filed: 'OCT 5', hist: [['OCT 5', 'FILED ON TIME']] },
  'ifta-rj-q3': { filed: 'OCT 2', hist: [['OCT 2', 'FILED ON TIME']] },
  'ifta-tk-q2': { filed: 'JUL 22', hist: [['JUL 22', 'FILED ON TIME']] },
  'ifta-hc-q3': { hist: [['OCT 6', 'INVITED · AWAITING CONFIRMATION']] },
};
const FI_PERIOD = { 'Q3 2026': 'JUL 1 – SEP 30, 2026', 'Q2 2026': 'APR 1 – JUN 30, 2026' };
const FI_DAYS = 23; // OCT 8 → OCT 31

const fiBucket = (q) => ov(`quarter:${q.id}`, q.bucket);
const fiStatus = (q) => ov(`fi:stat:${q.id}`, q.status);
const fiCol = (q) => FI_COL[fiBucket(q)[0]] ?? 'held';
const fiStep = (q) => FI_STAT[fiStatus(q)] ?? [-1, 'held', fiStatus(q)];
const fiFiled = (q) => ov(`fi:filed:${q.id}`, FI_META[q.id]?.filed ?? null);
const fiQ = () => QUARTERS[WSX.fi.q] ?? QUARTERS['ifta-rl-q3'];
const fiCases = () => vals(QUARTERS);
const fiFirst = (cid) => ACCOUNTS[cid].name.split(' ')[0];
const fiPick = () => (VP === 'mobile' ? 'fi.open' : 'fi.q');
const fiOct = (d) => Number(/^OCT (\d+)/.exec(d || '')?.[1]) || null;
const fiMiles = (q) => (q.miles === '—' ? '—' : q.miles);
const fiCount = (col) => fiCases().filter((q) => fiCol(q) === col).length;

/** Four small bars: where the return is in DATA COLLECTION → AIO PREPARATION → CLIENT REVIEW → FILE & CONFIRM. */
function fiPips(q) {
  const [step, who] = fiStep(q);
  return `<span class="fi-pips" aria-hidden="true">${FI_STEPS.map((_, i) => `<i class="${step < 0 ? 'x' : i < step ? 'd' : i === step ? (who === 'client' ? 'w' : 'n') : ''}"></i>`).join('')}</span>`;
}
const fiStepWord = (q) => {
  const [step, , word] = fiStep(q);
  return step < 0 ? 'NOT STARTED' : step > 3 ? word : `${String(step + 1).padStart(2, '0')} · ${FI_STEPS[step]}`;
};

/* ── the quarter: an obsidian plate — the period closed, then October day by day, one lane per client return ── */
const FI_LANES = ['ifta-rl-q3', 'ifta-tk-q3', 'ifta-hf-q3', 'ifta-dh-q3', 'ifta-rj-q3', 'ifta-hc-q3'];
const fiX = (day) => (17 + ((day - 1) / 30) * 80).toFixed(2); // OCT 1 → 17 %, OCT 31 → 97 % of the track
/** What a return's lane says: how far it has come this October and the next date on it. */
function fiLaneOf(q) {
  const s = fiStatus(q);
  const f = fiOct(fiFiled(q));
  const by = fiOct(FI_META[q.id]?.approve);
  if (s === 'NOT ENROLLED') return { tone: 'held', to: null, at: 1, word: 'INVITED · NO FILING UNTIL THEY CONFIRM' };
  if (s === 'FILED' || s === 'ARCHIVED') return { tone: 'ok', to: f ?? 8, at: f ?? 8, word: `${s === 'ARCHIVED' ? 'COMPLETE · ' : ''}FILED ${fiFiled(q) ?? ''}` };
  if (s === 'APPROVED') return { tone: 'gold', to: 8, at: 8, word: 'APPROVED · READY TO FILE' };
  if (s === 'CLIENT APPROVAL') return { tone: 'wait', to: 8, at: by ?? 31, word: `WAITING ON APPROVAL · BY ${FI_META[q.id]?.approve ?? 'OCT 31'}` };
  if (s === 'AIO REVIEW') return { tone: 'gold', to: 8, at: by ?? 31, word: `CLIENT APPROVAL BY ${FI_META[q.id]?.approve ?? 'OCT 31'}` };
  return { tone: 'wait', to: 8, at: 8, word: q.next.replace(/ FOR .*$/, '') };
}
function fiRunway(compact = false) {
  const sel = WSX.fi.q;
  const lanes = FI_LANES.map((id) => QUARTERS[id]).filter(Boolean).map((q) => {
    const l = fiLaneOf(q);
    const on = q.id === sel;
    const bar = l.to ? `<i class="fi-ln__bar fi-ln__bar--${l.tone}" style="left:${fiX(1)}%;width:${(fiX(l.to) - fiX(1)).toFixed(2)}%"></i>` : '';
    const rest = l.tone !== 'ok' && l.tone !== 'held' ? `<i class="fi-ln__rest" style="left:${fiX(l.to)}%;width:${(fiX(31) - fiX(l.to)).toFixed(2)}%"></i>` : '';
    const label = !compact || on ? `<span class="fi-ln__w">${l.word}</span>` : '';
    return `<button type="button" class="fi-ln fi-ln--${l.tone} ${on ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" aria-pressed="${on}" title="${clientName(q.client)} · ${l.word}"><span class="fi-ln__b">${ACCOUNTS[q.client].b}</span>${WSX.device === 'wide' ? `<span class="fi-ln__n"><b>${clientName(q.client)}</b><small>${q.miles === '—' ? 'MILES NOT IN YET' : `${q.miles} MI · ${q.gallons} GAL`}${q.owner ? ` · ${STAFF[q.owner].b}` : ''}</small></span>` : ''}<span class="fi-ln__t">${bar}${rest}<span class="fi-ln__mk" style="left:${fiX(l.at)}%">${l.tone === 'held' ? ico('lock') : ''}${label}</span></span></button>`;
  }).join('');
  const ticks = compact ? '' : Array.from({ length: 31 }, (_, i) => i + 1).map((n) => `<i class="fi-rw__tk ${[1, 8, 15, 22, 29].includes(n) ? 'fi-rw__tk--wk' : ''}" style="left:${fiX(n)}%"></i>`).join('');
  return `<div class="fi-rw ${compact ? 'fi-rw--c' : ''}" aria-label="Q3 2026 · the October filing window">
    <div class="fi-rw__head">${compact ? '' : '<span class="fi-rw__m fi-rw__m--q" style="left:0;width:15%">JUL – SEP</span>'}<span class="fi-rw__m fi-rw__m--oct" style="left:${fiX(1)}%;right:0">OCTOBER · FILING WINDOW</span></div>
    <div class="fi-rw__plot">
      <div class="fi-rw__over" aria-hidden="true"><i class="fi-rw__qz" style="left:0;width:15%"></i>${ticks}<i class="fi-rw__today" style="left:${fiX(8)}%"></i><i class="fi-rw__due" style="left:${fiX(31)}%"></i></div>
      ${lanes}
    </div>
    <div class="fi-rw__axis"><span class="fi-rw__d" style="left:${fiX(1)}%">OCT 1</span><span class="fi-rw__d fi-rw__d--today" style="left:${fiX(8)}%">TODAY · OCT 8</span><span class="fi-rw__d fi-rw__d--due">DUE OCT 31</span></div>
  </div>`;
}
function fiStage() {
  const compact = VP === 'mobile';
  const q3 = fiCases().filter((q) => q.q === 'Q3 2026');
  const open = q3.filter((q) => ['aio', 'client', 'ready'].includes(fiCol(q))).length;
  return `<section class="fi-stage ${compact ? 'fi-stage--c' : ''}">
    <img class="fi-stage__img" src="./brand/ifta/plates/public-road.jpg" alt="">
    <div class="fi-stage__id">
      <small>FUEL TAX · IFTA</small>
      <b>Q3 2026</b>
      <span>${FI_PERIOD['Q3 2026']}</span>
      <em>RETURNS DUE OCT 31, 2026</em>
      <div class="fi-cd"><b>${FI_DAYS}</b><span><i>DAYS TO FILE</i><small>${open} OPEN · ${q3.length - open} FILED OR HELD</small></span></div>
    </div>
    ${fiRunway(compact)}
  </section>`;
}

/* ── IFTA: the queue as the approved buckets — a return travels left to right ── */
function fiToken(q) {
  const b = fiBucket(q);
  const sel = q.id === WSX.fi.q;
  const meta = q.miles === '—' ? 'MILES NOT IN YET' : `${q.miles} MI · ${q.gallons} GAL`;
  return `<button type="button" class="fi-tok ${sel ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" aria-pressed="${sel}" title="${clientName(q.client)} · IFTA ${q.q} · ${b[0]} · ${fiStepWord(q)}">
    <span class="fi-tok__h">${badge(ACCOUNTS[q.client])}<span class="fi-tok__q">${q.q}</span>${q.owner ? av(q.owner) : ''}</span>
    <b class="fi-tok__n">${clientName(q.client)}</b>
    <span class="fi-tok__m">${meta}</span>
    <span class="fi-tok__f">${fiPips(q)}${sw(b)}</span>
    ${WSX.device === 'wide' ? `<span class="fi-tok__x"><small>${fiStepWord(q)}</small><span>${q.next}</span></span>` : ''}
  </button>`;
}
/** A client the queue does not hold yet (invited, not active): named beside the queue, never inside it. */
function fiHeld(chip = false) {
  const held = fiCases().filter((q) => fiCol(q) === 'held');
  if (!held.length) return '';
  if (chip) return held.map((q) => `<button type="button" class="fi-heldchip ${q.id === WSX.fi.q ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" aria-pressed="${q.id === WSX.fi.q}" title="${clientName(q.client)} · ${q.next}">${ico('lock')}OUTSIDE THE QUEUE · ${ACCOUNTS[q.client].b} · INVITED</button>`).join('');
  return `<div class="fi-held">${held.map((q) => `<button type="button" class="fi-held__r ${q.id === WSX.fi.q ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" aria-pressed="${q.id === WSX.fi.q}" title="${clientName(q.client)} · ${q.next}">${ico('lock')}<span class="fi-held__l">OUTSIDE THE QUEUE</span>${badge(ACCOUNTS[q.client])}<b>${clientName(q.client)}</b><span class="fi-held__w">INVITED · NO FILING UNTIL THEY CONFIRM</span></button>`).join('')}</div>`;
}
function fiBoard() {
  const all = fiCases();
  if (VP === 'mobile') {
    // phone: each bucket a lane, its returns side by side
    const lanes = FI_BUCKETS.map(([k, label, tone]) => {
      const list = all.filter((q) => fiCol(q) === k);
      return `<div class="fi-lane"><span class="fi-lane__h"><i class="pip pip--${tone}"></i><b>${label}</b><em>${list.length}</em></span><span class="fi-lane__b">${list.map(fiToken).join('') || '<span class="fi-none">NONE</span>'}</span></div>`;
    }).join('');
    return rgn('THE QUEUE', `${all.length} CLIENT QUARTERS`, '', `<div class="fi-lanes">${lanes}</div>${fiHeld()}`, 'fi-boardrg', 'fi-board');
  }
  const cols = FI_BUCKETS.map(([k, label, tone]) => {
    const list = all.filter((q) => fiCol(q) === k);
    return `<div class="fi-col fi-col--${k}"><div class="fi-col__h fi-col__h--${tone}"><b>${label}</b><em>${list.length}</em></div><div class="fi-col__b">${list.map(fiToken).join('') || '<span class="fi-none">NONE</span>'}</div></div>`;
  }).join('');
  const inQ = all.filter((q) => fiCol(q) !== 'held').length;
  const approved = `<button type="button" class="fi-qlink" data-a="fi.room" data-v="queue">${ico('view')}APPROVED IFTA QUEUE</button>`;
  return rgn('THE QUEUE', `${inQ} CLIENT QUARTERS`, `<span class="fi-tools">${fiHeld(true)}${approved}</span>`, `<div class="fi-board">${cols}</div>`, 'fi-boardrg', 'fi-board');
}

/* ── FILING QUEUE: every open return, in the order AIO should take them ── */
function fiQueue() {
  const order = { aio: 0, ready: 1, client: 2, held: 3 };
  const list = fiCases().filter((q) => fiCol(q) in order).sort((a, b) => order[fiCol(a)] - order[fiCol(b)]);
  const rows = list.map((q) => {
    const [, who] = fiStep(q);
    return `<tr class="lt-row ${q.id === WSX.fi.q ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}"><td><span class="fi-qc">${badge(ACCOUNTS[q.client])}<span><b class="pk__t">${clientName(q.client)}</b><span class="pk__s">IFTA ${q.q} · DUE ${q.due.replace(', 2026', '')}</span></span></span></td><td><span class="fi-qs">${fiPips(q)}<span class="pk__s">${fiStepWord(q)}</span></span></td><td class="lt-m">${who === 'client' ? 'CLIENT' : who === 'aio' ? 'AIO' : '—'}</td><td class="lt-r fi-num">${fiMiles(q)}</td><td class="lt-r fi-num">${q.gallons}</td><td>${sw(fiBucket(q))}</td></tr>`;
  }).join('');
  return rgn('OPEN RETURNS · Q3 2026', `${list.length}`, '', `<table class="lt fi-lt" data-swap="t:queue"><thead><tr><th>CLIENT</th><th>WORKFLOW</th><th>WITH</th><th class="lt-r">MILES</th><th class="lt-r">GALLONS</th><th>STATUS</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="lt-empty">NO OPEN RETURNS</td></tr>'}</tbody></table><div class="fi-pad">${ntb('<b>FILED BY HAND.</b> STAFF FILE ON THE STATE PORTAL — THERE IS NO GOVERNMENT API.')}</div>`, 'fi-sec', 'fi-sec');
}

/* ── CLIENT APPROVAL: the client approves every return in their own office before staff file it ── */
function fiApproval() {
  const groups = [
    ['send', 'TO SEND FOR APPROVAL', (q) => fiStatus(q) === 'AIO REVIEW'],
    ['wait', 'WAITING ON THE CLIENT', (q) => fiStatus(q) === 'CLIENT APPROVAL'],
    ['ok', 'APPROVED · READY TO FILE', (q) => fiStatus(q) === 'APPROVED'],
  ];
  const slip = (q, g) => {
    const by = FI_META[q.id]?.approve;
    return `<button type="button" class="fi-slip fi-slip--${g} ${q.id === WSX.fi.q ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" aria-pressed="${q.id === WSX.fi.q}" title="${clientName(q.client)} · IFTA ${q.q}"><span class="fi-slip__h">${badge(ACCOUNTS[q.client])}<span><b>${clientName(q.client)}</b><small>IFTA ${q.q} RETURN</small></span></span><span class="fi-slip__ro"><span><b>${fiMiles(q)}</b><small>MILES</small></span><span><b>${q.gallons}</b><small>GALLONS</small></span></span><span class="fi-slip__by">${g === 'ok' ? sw(['APPROVED', 'ok']) : sw([by ? `APPROVE BY ${by}` : 'NO DATE SET', g === 'send' ? 'warn' : 'gold'])}</span></button>`;
  };
  const cols = groups.map(([g, label, f]) => {
    const list = fiCases().filter(f);
    return `<div class="fi-ap"><div class="sec-l"><span>${label}</span><span>${list.length}</span></div>${list.map((q) => slip(q, g)).join('') || '<span class="fi-none">NONE</span>'}</div>`;
  }).join('');
  const collecting = fiCases().filter((q) => fiStatus(q) === 'NEEDS CLIENT');
  const coll = collecting.length ? `<div class="fi-coll">${collecting.map((q) => `<button type="button" class="fi-coll__r" data-a="${fiPick()}" data-v="${q.id}" title="${clientName(q.client)} · ${q.next}"><span class="fi-coll__l">STILL COLLECTING DATA</span>${badge(ACCOUNTS[q.client])}<b>${clientName(q.client)}</b><span class="fi-coll__w">${q.next}</span></button>`).join('')}</div>` : '';
  return rgn('CLIENT APPROVAL · Q3 2026', '', '', `<div class="fi-aps" data-swap="t:approval">${cols}</div>${coll}<div class="fi-pad">${ntb('THE CLIENT APPROVES THE RETURN IN THEIR OWN OFFICE BEFORE STAFF FILE IT.')}</div>`, 'fi-sec', 'fi-sec');
}

/* ── SUBMITTED / FILED: each return stamped with the day staff filed it ── */
function fiFiledView() {
  const list = fiCases().filter((q) => fiCol(q) === 'filed').sort((a, b) => (fiOct(fiFiled(b)) ?? 0) - (fiOct(fiFiled(a)) ?? 0));
  const rows = list.map((q) => `<div class="pk fi-fd ${q.id === WSX.fi.q ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" title="${clientName(q.client)} · ${q.next}"><span class="fi-stamp"><small>FILED</small><b>${fiFiled(q) ?? '—'}</b></span><span class="fi-fd__t"><b class="pk__t">${clientName(q.client)}</b><span class="pk__s">IFTA ${q.q} · ${fiMiles(q)} MI · ${q.gallons} GAL</span></span><span class="fi-fd__r">${sw(['ON TIME', 'ok'])}<span class="pk__s">${q.next.replace(/^FILED [A-Z]{3} \d+( · )?/, '') || staffName(q.owner)}</span></span></div>`).join('');
  return rgn('SUBMITTED / FILED · Q3 2026', `${list.length}`, '', `<div data-swap="t:filed">${rows || '<div class="grp">NOTHING FILED YET</div>'}</div><div class="fi-pad">${ntb('<b>MANUAL FILING.</b> STAFF SUBMIT ON THE STATE PORTAL AND RECORD IT HERE — NO GOVERNMENT API.')}</div>`, 'fi-sec', 'fi-sec');
}

/* ── FILING HISTORY: every client by quarter ── */
function fiHistory() {
  const qs = ['Q2 2026', 'Q3 2026'];
  const clients = [...new Set(fiCases().map((q) => q.client))];
  const cell = (cid, qq) => {
    const q = fiCases().find((x) => x.client === cid && x.q === qq);
    if (!q) return `<td><span class="fi-cell fi-cell--none" title="NO ${qq} RECORD IN THE SAMPLE">—</span></td>`;
    const b = fiBucket(q);
    return `<td><button type="button" class="fi-cell ${q.id === WSX.fi.q ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" aria-pressed="${q.id === WSX.fi.q}" title="${clientName(cid)} · IFTA ${qq} · ${b[0]}">${sw(b)}<small>${fiFiled(q) ? `FILED ${fiFiled(q)}` : `DUE ${q.due.replace(', 2026', '')}`}</small></button></td>`;
  };
  if (VP === 'mobile') {
    // phone: each client with the quarters on record, newest first
    const list = clients.map((cid) => `<div class="fi-hrow"><span class="fi-qc">${badge(ACCOUNTS[cid])}<b class="pk__t">${clientName(cid)}</b></span><span class="fi-hrow__q">${[...qs].reverse().map((qq) => { const q = fiCases().find((x) => x.client === cid && x.q === qq); return q ? `<button type="button" class="fi-cell ${q.id === WSX.fi.q ? 'is-sel' : ''}" data-a="${fiPick()}" data-v="${q.id}" title="${clientName(cid)} · IFTA ${qq} · ${fiBucket(q)[0]}"><small>${qq}</small>${sw(fiBucket(q))}</button>` : ''; }).join('')}</span></div>`).join('');
    return rgn('FILING HISTORY · BY CLIENT', `${fiCases().length} QUARTERS`, '', `<div data-swap="t:history">${list}</div><div class="fi-pad">${ntb('ONLY T&K’S Q2 2026 IS IN THE SAMPLE. OLDER QUARTERS COME FROM LIVE RECORDS.')}</div>`, 'fi-sec', 'fi-sec');
  }
  const rows = clients.map((cid) => `<tr><td><span class="fi-qc">${badge(ACCOUNTS[cid])}<b class="pk__t">${clientName(cid)}</b></span></td>${qs.map((qq) => cell(cid, qq)).join('')}</tr>`).join('');
  return rgn('FILING HISTORY · BY CLIENT', `${fiCases().length} QUARTERS`, '', `<table class="lt fi-hist" data-swap="t:history"><thead><tr><th>CLIENT</th>${qs.map((x) => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><div class="fi-pad">${ntb('ONLY T&K’S Q2 2026 IS IN THE SAMPLE. OLDER QUARTERS COME FROM LIVE RECORDS.')}</div>`, 'fi-sec', 'fi-sec');
}
function fiSection() {
  const s = WSX.fi.sec;
  if (s === 'queue') return fiQueue();
  if (s === 'approval') return fiApproval();
  if (s === 'filed') return fiFiledView();
  if (s === 'history') return fiHistory();
  return fiBoard();
}

/* ── the case: one client's quarter, its workflow and its one next step ── */
function fiNext(q) {
  const s = fiStatus(q);
  const key = `quarter:${q.id}`;
  const name = clientName(q.client);
  const set = (bucket, stat) => () => {
    WSX.over[key] = bucket;
    WSX.over[`fi:stat:${q.id}`] = stat;
  };
  if (s === 'NOT ENROLLED') return nextBlock('NO FILING UNTIL HEARTLAND CONFIRMS', `<button type="button" class="wbtn" data-a="go" data-v="client:${q.client}:filing">${ico('company')}SEE IN CLIENT 360</button>`, 'calm');
  if (s === 'NEEDS CLIENT') return nextBlock(q.next, simBtn(`fi:rcpt:${q.id}`, { label: 'REQUEST RECEIPTS', effect: `ASKS ${name} FOR THE MISSING FUEL RECEIPTS IN THEIR OFFICE.`, apply: () => {}, rec: key, primary: true }));
  if (s === 'AIO REVIEW') return nextBlock(q.next, simBtn(`fi:send:${q.id}`, { label: 'SEND FOR CLIENT APPROVAL', effect: `SENDS THE Q3 RETURN SUMMARY TO ${name} TO APPROVE IN THEIR OFFICE BY ${FI_META[q.id]?.approve ?? 'OCT 31'}.`, apply: set(['AWAITING CLIENT', 'gold'], 'CLIENT APPROVAL'), rec: key, primary: true }));
  if (s === 'CLIENT APPROVAL') return nextBlock(`WAITING ON ${name} TO APPROVE · BY ${FI_META[q.id]?.approve ?? 'OCT 31'}`, `${simBtn(`fi:nudge:${q.id}`, { label: 'REMIND THE CLIENT', effect: 'SENDS A REMINDER TO THE CLIENT’S OFFICE AND EMAIL.', apply: () => {}, rec: key, primary: true })}${simBtn(`fi:ok:${q.id}`, { label: 'MARK APPROVED', effect: 'RECORDS THE APPROVAL THE CLIENT GAVE IN THEIR OFFICE. THE RETURN IS READY TO FILE.', apply: set(['READY TO FILE', 'gold'], 'APPROVED'), rec: key })}`);
  if (s === 'APPROVED') return nextBlock('FILE THE RETURN ON THE STATE PORTAL', simBtn(`fi:file:${q.id}`, { label: 'MARK FILED', effect: 'RECORDS THAT STAFF FILED THE RETURN BY HAND ON THE STATE PORTAL. THERE IS NO GOVERNMENT API.', apply: () => { set(['FILED', 'ok'], 'FILED')(); WSX.over[`fi:filed:${q.id}`] = 'OCT 8'; }, rec: key, primary: true }));
  if (s === 'FILED') {
    const paid = /PAYMENT CONFIRMED/.test(q.next);
    return nextBlock(paid ? 'FILED AND PAID · CLOSE THE QUARTER' : `FILED ${fiFiled(q) ?? ''} · ON TIME`, simBtn(`fi:close:${q.id}`, { label: 'CLOSE THE QUARTER', effect: 'MARKS THE RETURN COMPLETE AND MOVES IT TO FILING HISTORY.', apply: set(['COMPLETE', 'ok'], 'ARCHIVED'), rec: key, primary: paid }), paid ? '' : 'calm');
  }
  return nextBlock(`COMPLETE · FILED ${fiFiled(q) ?? ''}`, '', 'done');
}
function fiFlow(q) {
  const [step, who] = fiStep(q);
  const f = fiFiled(q);
  const dates = ['', '', FI_META[q.id]?.approve ? `BY ${FI_META[q.id].approve}` : '', f ? f : `BY ${q.due.replace(', 2026', '')}`];
  return `<ol class="fi-flow">${FI_STEPS.map((t, i) => {
    const st = step < 0 ? 'x' : i < step ? 'd' : i === step ? (who === 'client' ? 'w' : 'n') : 'l';
    const word = { x: 'NOT STARTED', d: 'DONE', w: 'WAITING ON CLIENT', n: 'NOW · AIO', l: 'LATER' }[st];
    return `<li class="fi-flow__s fi-flow__s--${st}"><i>${st === 'd' ? ico('pass') : String(i + 1).padStart(2, '0')}</i><span><b>${t}</b><small>${word}</small></span><em>${st === 'd' && i < 3 ? '' : dates[i]}</em></li>`;
  }).join('')}</ol>`;
}
function fiTrucks(q) {
  const vs = vals(VEHICLES).filter((v) => v.quarter === q.id);
  if (!vs.length) return '';
  return `<div class="fi-blk"><div class="sec-l"><span>TRUCKS IN THIS RETURN · ${vs.length}</span></div><div class="fi-trucks">${vs.map((v) => `<button type="button" class="fi-truck" data-a="go" data-v="fleet:${v.id}:ifta" title="${v.unit} · ${v.ymm} · OPEN IN FLEET" aria-label="${v.unit} · open in Fleet"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[v.id].cab)}</svg><b>${v.unit}</b>${ico('fwd')}</button>`).join('')}</div></div>`;
}
function fiRoomBtn() {
  const w = VP === 'mobile' ? 393 : VP === 'tablet' ? 834 : 1440;
  return `<button type="button" class="fi-roombtn" data-a="fi.room" data-v="case" aria-label="Open the IFTA filing room · the approved screen"><span class="fi-roombtn__img"><img src="ifta/STAFF_CASE_393.jpg" alt=""></span><span class="fi-roombtn__t"><small>APPROVED IFTA AUTHORITY · ${w}</small><b>OPEN THE IFTA FILING ROOM</b></span>${ico('fwd')}</button>`;
}
function fiCase() {
  const q = fiQ();
  const b = fiBucket(q);
  const c = ACCOUNTS[q.client];
  const key = `quarter:${q.id}`;
  const docs = vals(DOCS).filter((d) => d.owner === key);
  const mig = vals(MIG_CASES).find((m) => m.client === q.client);
  const gate = fiStatus(q) === 'NOT ENROLLED' ? `<div class="fi-gate">${ico('lock')}<span><b>INVITED · AWAITING CLIENT CONFIRMATION</b><small>${mig?.invited ? `INVITE SENT ${mig.invited}. ` : ''}NOTHING IS ACTIVE UNTIL THE CLIENT CONFIRMS.</small></span></div>` : '';
  const figs = `<div class="ros fi-figs">${ro(fiMiles(q), 'TOTAL MILES')}${ro(q.gallons, 'TOTAL GALLONS')}${ro(q.due.replace(', 2026', ''), 'RETURN DUE', { tone: fiCol(q) === 'filed' || fiCol(q) === 'complete' ? '' : 'gold' })}</div>`;
  const plate = `<div class="fi-plate" data-swap="plate:${q.id}"><span class="fi-plate__i">${ico('fuel')}</span><span class="fi-plate__t"><small>IFTA ${q.q} · DUE ${q.due.replace(', 2026', '')}</small><b>${c.name}</b><span>${sw(b)}<em>${fiStepWord(q)}</em></span></span><button type="button" class="wbtn wbtn--sm fi-plate__go" data-a="go" data-v="client:${q.client}:filing" aria-label="${c.name} in Client 360">${ico('company')}CLIENT 360</button></div>`;
  const colA = `${gate}${fiNext(q)}${figs}<div class="fi-blk"><div class="sec-l"><span>FILING WORKFLOW</span><span>${fiStepWord(q)}</span></div>${fiFlow(q)}</div>`;
  const preview = WSX.device === 'wide' ? `<button type="button" class="fi-prev" data-a="fi.room" data-v="queue" aria-label="Open the approved fuel tax queue"><span class="fi-prev__img"><img src="ifta/STAFF_QUEUE_1440.jpg" alt=""></span><span class="fi-prev__t"><small>APPROVED IFTA AUTHORITY · UNCHANGED</small><b>THE FUEL TAX QUEUE</b></span>${ico('fwd')}</button>` : '';
  const colB = `${fiTrucks(q)}${docs.length ? `<div class="fi-blk"><div class="sec-l"><span>DOCUMENTS · ${docs.length}</span></div>${docs.map((d) => docChip(d.id)).join('')}</div>` : ''}${facts([['CLIENT', c.name, `${c.dot} · ${c.state}`], ['QUARTER', q.q, FI_PERIOD[q.q]], ['OWNER', staffName(q.owner)], ['FILING', 'MANUAL · STAFF', 'NO GOVERNMENT API']])}${mhist(key, FI_META[q.id]?.hist ?? [])}${preview}`;
  const body = WSX.device === 'wide' || VP === 'tablet' ? `<div class="fi-cols"><div class="fi-colx">${colA}</div><div class="fi-colx">${colB}</div></div>` : `${colA}${colB}`;
  return `<section class="rg cx fi-cx"><header class="cx__h"><div class="cx__crumb"><span>FILING</span>${ico('fwd')}<span>IFTA ${q.q}</span>${ico('fwd')}<span>${c.name}</span></div>${plate}${fiRoomBtn()}</header><div class="cx__b" data-keep="fi-cx" data-swap="b:${q.id}">${body}</div></section>`;
}

/* ── the approved IFTA screens, unchanged, in a viewer inside the workspace ── */
function fiRoom() {
  if (WSX.sheet !== 'room') return '';
  const q = fiQ();
  const w = VP === 'mobile' ? 393 : VP === 'tablet' ? 834 : 1440;
  const k = WSX.fi.room === 'queue' ? 'QUEUE' : 'CASE';
  const back = VP === 'mobile' ? (WSX.fi.back ? 'THE CASE' : 'THE QUARTER') : `${fiFirst(q.client)} · ${q.q}`;
  return `<div class="wscrim fi-crim" data-a="fi.back" data-key="scrim" aria-hidden="true"></div><div class="wsheet fi-room" data-key="sheet" role="dialog" aria-modal="true" aria-label="Approved IFTA authority" tabindex="-1">
    <div class="fi-room__bar">
      <button type="button" class="wbtn wbtn--sm wbtn--dark fi-room__back" data-a="fi.back">${ico('back')}BACK TO ${back}</button>
      <span class="fi-room__t"><b>APPROVED IFTA AUTHORITY · UNCHANGED</b><small>${k === 'CASE' ? 'IFTA FILING ROOM' : 'FUEL TAX QUEUE'} · STAFF · ${w} PX</small></span>
      ${seg([['case', 'FILING ROOM'], ['queue', VP === 'mobile' ? 'QUEUE' : 'FUEL TAX QUEUE']], WSX.fi.room, 'fi.room', 'fi-room__seg')}
      <button type="button" class="wbtn wbtn--icon wbtn--sm fi-room__x" data-a="sheet.close" aria-label="Close">${ico('close')}</button>
    </div>
    <div class="fi-room__body" data-keep="fi-room"><figure class="fi-room__fig" data-swap="room:${k}:${w}"><img src="ifta/STAFF_${k}_${w}.jpg" alt="The approved IFTA ${k === 'CASE' ? 'filing room' : 'fuel tax queue'} staff screen, ${w} pixels wide, shown unchanged"></figure></div>
    <div class="fi-room__foot">${ntb('THE APPROVED SCREEN WITH ITS OWN SAMPLE CASES · SHOWN AS APPROVED, NOT REDRAWN')}</div>
  </div>`;
}

function fiBar() {
  const r = FI_BUCKETS.map(([k, label, tone]) => ro(fiCount(k), label, { tone: k === 'aio' && fiCount(k) ? 'warn' : '', a: 'fi.bucket', v: k })).join('');
  if (VP === 'mobile') return wsBar('02 · WORK', 'FUEL TAXES', [ro(FI_DAYS, 'DAYS LEFT', { tone: 'gold' }), ro(fiCount('aio'), 'NEEDS AIO', { tone: 'warn' }), ro(fiCount('client'), 'AWAITING CLIENT')].join(''));
  return wsBar('02 · WORK', 'FILING & FUEL TAXES', r, VP === 'tablet' ? '' : `<span class="design-pill">MANUAL FILING · NO GOVERNMENT API</span>`);
}
function fiSecs() {
  const n = { queue: fiCases().filter((q) => ['aio', 'client', 'ready', 'held'].includes(fiCol(q))).length, approval: fiCases().filter((q) => ['AIO REVIEW', 'CLIENT APPROVAL', 'APPROVED'].includes(fiStatus(q))).length, filed: fiCount('filed') };
  return seg(FI_SECS.map(([id, l]) => [id, l, n[id]]), WSX.fi.sec, 'fi.sec', VP === 'mobile' ? 'wseg--scroll' : '');
}

/* ── compositions ── */
function filingView() {
  if (VP === 'mobile') {
    const sheet = WSX.sheet === 'room' ? fiRoom() : phoneSheet(fiCase(), { label: `${clientName(fiQ().client)} IFTA ${fiQ().q}` });
    return `<div class="ws fi fi--m">${fiBar()}${fiSecs()}${fiStage()}${fiSection()}</div>${sheet}`;
  }
  if (VP === 'tablet') return `<div class="ws fi fi--t">${fiBar()}${fiSecs()}${fiStage()}${fiSection()}${fiCase()}</div>${fiRoom()}`;
  return `<div class="ws fi">${fiBar()}<div class="fi-grid"><div class="fi-main">${fiSecs()}${fiStage()}${fiSection()}</div>${fiCase()}</div></div>${fiRoom()}`;
}

/* ── actions ── */
ACT['fi.q'] = (id) => {
  if (!QUARTERS[id]) return;
  WSX.fi.q = id;
  WSX.pending = null;
};
ACT['fi.open'] = (id) => {
  ACT['fi.q'](id);
  WSX.sheet = true;
};
ACT['fi.sec'] = (s) => {
  WSX.fi.sec = s;
  WSX.pending = null;
  const first = { queue: (q) => ['aio', 'client', 'ready', 'held'].includes(fiCol(q)), approval: (q) => ['AIO REVIEW', 'CLIENT APPROVAL', 'APPROVED'].includes(fiStatus(q)), filed: (q) => fiCol(q) === 'filed' }[s];
  if (first && !first(fiQ())) {
    const q = fiCases().find(first);
    if (q) WSX.fi.q = q.id;
  }
};
ACT['fi.bucket'] = (col) => {
  const q = fiCases().find((x) => fiCol(x) === col);
  WSX.fi.sec = 'ifta';
  WSX.pending = null;
  if (q) WSX.fi.q = q.id;
};
/** Open the approved IFTA screen (or switch between the filing room and the queue inside the viewer). */
ACT['fi.room'] = (v) => {
  if (WSX.sheet !== 'room') WSX.fi.back = WSX.sheet === true;
  WSX.fi.room = v === 'queue' ? 'queue' : 'case';
  WSX.sheet = 'room';
  WSX.pending = null;
};
/** Back from the viewer: to the case drawer it was opened from on a phone, otherwise to the quarter. */
ACT['fi.back'] = () => {
  WSX.sheet = WSX.fi.back && VP === 'mobile' ? true : false;
  WSX.fi.back = false;
};

registerWorkspace({
  id: 'filing', no: '02', name: 'FILING & FUEL TAXES', group: 'auth', page: 'work', lane: 'filing', view: () => filingView(),
  shape: 'A QUARTER', line: 'ONE QUARTER, EVERY RETURN, ONE DEADLINE.',
  states: [['MAIN', []], ['SELECTED', [['fi.q', 'ifta-tk-q3']]], ['DEEPER', [['fi.q', 'ifta-rl-q3'], ['fi.room', 'case']]], ['PHONE', [['fi.open', 'ifta-rl-q3']], 'phone']],
  demos: [
    ['FILE A RETURN', [['fi.q', 'ifta-rl-q3', 'RIVERSTONE · NEEDS AIO'], ['sim.ask', 'fi:send:ifta-rl-q3', 'SEND FOR CLIENT APPROVAL'], ['sim.ok', 'fi:send:ifta-rl-q3', 'CONFIRM · SIMULATED'], ['sim.ask', 'fi:ok:ifta-rl-q3', 'THE CLIENT APPROVED'], ['sim.ok', 'fi:ok:ifta-rl-q3', 'CONFIRM · SIMULATED'], ['sim.ask', 'fi:file:ifta-rl-q3', 'FILED BY HAND'], ['sim.ok', 'fi:file:ifta-rl-q3', 'CONFIRM · SIMULATED']]],
    ['THE APPROVED FILING ROOM', [['fi.q', 'ifta-tk-q3', 'T&K · AWAITING CLIENT'], ['fi.room', 'case', 'THE APPROVED IFTA SCREEN'], ['fi.room', 'queue', 'THE APPROVED QUEUE'], ['fi.back', '', 'BACK TO THE QUARTER']]],
    ['WALK THE LANE', [['fi.sec', 'queue', 'FILING QUEUE'], ['fi.sec', 'approval', 'CLIENT APPROVAL'], ['fi.sec', 'filed', 'SUBMITTED / FILED'], ['fi.sec', 'history', 'FILING HISTORY'], ['fi.sec', 'ifta', 'BACK TO IFTA']]],
  ],
  audit: [[['fi.sec', 'queue']], [['fi.sec', 'approval']], [['fi.sec', 'filed']], [['fi.sec', 'history']], [['fi.q', 'ifta-hc-q3']], [['fi.q', 'ifta-hf-q3']], [['fi.q', 'ifta-tk-q2']], [['fi.room', 'queue']], [['fi.q', 'ifta-rl-q3'], ['sim.ask', 'fi:send:ifta-rl-q3'], ['sim.ok', 'fi:send:ifta-rl-q3'], ['fi.sec', 'approval']]],
  phoneAct: { 'fi.q': 'fi.open' },
  enter: (a, b) => {
    const q = QUARTERS[a] ?? (ACCOUNTS[a] && fiCases().find((x) => x.client === a && x.q === 'Q3 2026'));
    if (q) Object.assign(WSX.fi, { q: q.id, sec: FI_SECS.some(([s]) => s === b) ? b : 'ifta' });
  },
  label: () => `${fiFirst(fiQ().client)} · ${fiQ().q}`,
  route: (s, client) => {
    if (s[0] === 'work' && s[1] === 'filing') {
      const q = client && fiCases().find((x) => x.client === client && x.q === 'Q3 2026');
      Object.assign(WSX.fi, { sec: FI_SECS.some(([x]) => x === s[2]) ? s[2] : 'ifta', ...(q ? { q: q.id } : {}) });
      return true;
    }
    if (s[0] === 'rec' && s[1] === 'quarter' && QUARTERS[s[2]]) return Object.assign(WSX.fi, { q: s[2], sec: 'ifta' }), true;
    return false;
  },
});
