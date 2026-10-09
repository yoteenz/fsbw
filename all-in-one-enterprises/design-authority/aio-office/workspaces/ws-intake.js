/*
 * INTAKE · MIGRATION CASES — the staff working layer around the APPROVED client-migration experience. It is built around
 * the migration lifecycle: every case (MIG_CASES) sits on THE MIGRATION LINE, an obsidian track from KNOWN · NOT MIGRATED
 * to ACTIVE · CLIENT CONFIRMED, its path (EXISTING · NEW · BULK) on its tab and its files counted. Two marks sit on the
 * line: where founder approval lands (PREBUILT) and the gate only the client opens (ACTIVE). The ten INTAKE sections
 * are views of the same work: each lights its stops and opens its working surface (the approved path, what AIO read,
 * the conflicts, the founder review, the prebuilt client, the invite, the history). The selected case opens its case
 * file with the one next step, the gate, and its current APPROVED screen, which opens unchanged in the viewer
 * (mig/<authority id>.jpg — the approved screens are shown as they are, never recreated). Reached from the approved
 * INTAKE root (pages-intake.js · intakeRoot, unchanged). SAMPLE cases; every action is SIMULATED and saves nothing.
 */
WSX.ik = { sec: 'status', id: 'mig-sr', flow: null, want: false, from: null };

/* ── SAMPLE, lane-local: short names for the line, and what the case files hold beyond MIG_CASES. The reading list and
 *    the BLUELINE conflicts are the ones the approved INTAKE root already shows; the batch duplicate restates
 *    '5 CLIENTS DETECTED · 1 POSSIBLE DUPLICATE'. No amounts anywhere. ── */
const IK_SHORT = { 'mig-sr': 'SUMMIT RIDGE', 'mig-bl': 'BLUELINE', 'mig-lv': 'LAKEVIEW', 'mig-b07': 'BATCH 07', 'mig-mt': 'MASON', 'mig-hc': 'HEARTLAND', 'mig-rl': 'RIVERSTONE', 'mig-tk': 'T&K' };
const IK_MONO = { 'mig-sr': 'SR', 'mig-bl': 'BL', 'mig-lv': 'LV', 'mig-b07': 'B7', 'mig-mt': 'MT', 'mig-hc': 'HC', 'mig-rl': 'RL', 'mig-tk': 'TK' };
const IK_READ = {
  'mig-lv': [
    ['BUSINESS IDENTITY', 'ARTICLES OF ORGANIZATION · EIN LETTER', ['READ', 'ok'], 'company'],
    ['PERMITS & AUTHORITY', 'USDOT REGISTRATION · MC CERTIFICATE', ['READ', 'ok'], 'id-card'],
    ['INSURANCE', 'CERTIFICATE OF INSURANCE', ['READ', 'ok'], 'umbrella'],
    ['VEHICLES', '2 CAB CARDS', ['READING', 'gold'], 'truck'],
    ['UNREADABLE', '1 PHOTO OF A RECEIPT · NEEDS A BETTER SCAN', ['NEEDS STAFF', 'warn'], 'image'],
  ],
};
const IK_CONF = {
  'mig-bl': [
    { t: 'TWO VEHICLE RECORDS SHARE VIN …4410', s: 'THE EXPORT AND A CAB CARD DISAGREE ON THE UNIT', a: ['SAMSARA EXPORT', 'UNIT 14'], b: ['SCANNED CAB CARD', 'UNIT 41'], opts: [['USE THE CAB CARD', 'USES THE UNIT NUMBER ON THE SCANNED CAB CARD AND RECORDS WHY.'], ['KEEP BOTH FOR REVIEW', 'KEEPS BOTH VALUES AND FLAGS THEM FOR THE FOUNDER. NOTHING IS MERGED.']] },
    { t: 'OWNER NAME DIFFERS', s: 'THE EIN LETTER AND THE MC CERTIFICATE', a: ['EIN LETTER', 'BLUELINE TRANSPORT LLC'], b: ['MC CERTIFICATE', 'BLUE LINE TRANSPORT'], opts: [['USE THE EIN LETTER', 'USES THE LEGAL NAME ON THE EIN LETTER AND RECORDS WHY.'], ['KEEP BOTH FOR REVIEW', 'KEEPS BOTH VALUES AND FLAGS THEM FOR THE FOUNDER. NOTHING IS MERGED.']] },
  ],
  'mig-b07': [
    { t: 'POSSIBLE DUPLICATE CLIENT', s: 'TWO FOLDERS CARRY ONE USDOT NUMBER', a: ['ZIP · FOLDER 2 (CSV)', 'DETECTED CLIENT 2'], b: ['ZIP · FOLDER 4 (PDF)', 'DETECTED CLIENT 4'], opts: [['KEEP AS TWO CLIENTS', 'KEEPS THE TWO DETECTED CLIENTS SEPARATE AND RECORDS WHY.'], ['MERGE FOR FOUNDER REVIEW', 'PROPOSES ONE CLIENT; THE FOUNDER DECIDES. NOTHING IS MERGED NOW.']] },
  ],
};
const IK_CONF_EFFECT = {
  'mig-bl': 'USES THE CAB CARD AND THE EIN LETTER, AND RECORDS WHY. NOTHING IS MERGED SILENTLY.',
  'mig-b07': 'KEEPS THE TWO DETECTED CLIENTS SEPARATE AND RECORDS WHY. NOTHING IS MERGED SILENTLY.',
};
/** The approved screen a simulated step lands on, per path. */
const IK_LANDS = {
  existing: { REVIEW: 'AIO-MIG-EXISTING-REVIEW-001', PREBUILT: 'AIO-MIG-EXISTING-PREBUILT-001', CLIENT_CONFIRMATION_REQUIRED: 'AIO-MIG-EXISTING-INVITED-001' },
  new: { REVIEW: 'AIO-MIG-NEW-REVIEW-001', PREBUILT: 'AIO-MIG-NEW-PREBUILT-001', CLIENT_CONFIRMATION_REQUIRED: 'AIO-MIG-NEW-CONFIRM-001' },
  bulk: { REVIEW: 'AIO-MIG-BATCH-APPROVAL-001', PREBUILT: 'AIO-MIG-BATCH-RUN-001', CLIENT_CONFIRMATION_REQUIRED: 'AIO-MIG-BATCH-COMPLETE-001' },
};
const IK_SEC = { existing: 'EXISTING', new: 'NEW', bulk: 'BULK', status: 'STATUS', extraction: 'EXTRACTION', match: 'MATCH', review: 'FOUNDER REVIEW', prebuilt: 'PREBUILT', activation: 'ACTIVATION', history: 'HISTORY' };
const IK_PATHS = ['existing', 'new', 'bulk'];
const IK_VIEWS = ['status', 'extraction', 'match', 'review', 'prebuilt', 'activation', 'history'];
/** Each stop on the line opens the section that works on it. */
const IK_STOP_SEC = { KNOWN_UNMIGRATED: 'status', INTAKE_IN_PROGRESS: 'extraction', MIGRATION_IN_PROGRESS: 'extraction', MIGRATION_REVIEW_REQUIRED: 'review', PREBUILT: 'prebuilt', CLIENT_CONFIRMATION_REQUIRED: 'activation', ACTIVE: 'history' };
const IK_SEC_LIVES = { extraction: ['INTAKE_IN_PROGRESS', 'MIGRATION_IN_PROGRESS'], match: ['MIGRATION_REVIEW_REQUIRED'], review: ['MIGRATION_REVIEW_REQUIRED'], prebuilt: ['PREBUILT'], activation: ['CLIENT_CONFIRMATION_REQUIRED'], history: ['ACTIVE'] };
const IK_LIFE_S = { KNOWN_UNMIGRATED: 'KNOWN', INTAKE_IN_PROGRESS: 'INTAKE', MIGRATION_IN_PROGRESS: 'MIGRATING', MIGRATION_REVIEW_REQUIRED: 'REVIEW', PREBUILT: 'PREBUILT', CLIENT_CONFIRMATION_REQUIRED: 'INVITED', ACTIVE: 'ACTIVE' };
const IK_FOUND_ICO = { COMPANY: 'company', PEOPLE: 'people', PERSON: 'people', VEHICLES: 'truck', DOCUMENTS: 'folder', 'CLIENTS DETECTED': 'people', 'POSSIBLE DUPLICATE': 'warning' };

/* ── state ── */
const ikCases = () => vals(MIG_CASES);
const ikSel = () => MIG_CASES[WSX.ik.id] ?? ikCases()[0];
const ikLife = (m) => ov(`ikl:${m.id}`, m.life);
const ikIdx = (m) => migIdx(ikLife(m));
const ikStage = (m) => ov(`iks:${m.id}`, m.stage);
const ikScreen = (m) => ov(`ikscr:${m.id}`, m.screen);
const ikShort = (m) => IK_SHORT[m.id] ?? m.name.split(' ')[0];
const ikMono = (m) => IK_MONO[m.id] ?? m.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
const ikIco = (b) => MIG_BRANCH[b]?.[3] ?? 'migrate';
const ikConfs = (m) => (IK_CONF[m.id] || []).map((c, i) => ({ ...c, i, got: WSX.over[`ikc:${m.id}:${i}`] ?? null }));
/** Conflicts still open on a case in review (the sample list where there is one, otherwise the count on the case). */
const ikOpenConf = (m) => (ikLife(m) !== 'MIGRATION_REVIEW_REQUIRED' ? 0 : IK_CONF[m.id] ? ikConfs(m).filter((c) => !c.got).length : m.conflicts);
const ikWithFounder = (m) => ikLife(m) === 'MIGRATION_REVIEW_REQUIRED' && !ikOpenConf(m) && !WSX.over[`ikret:${m.id}`] && (m.stage[0] === 'FOUNDER REVIEW' || !!WSX.over[`iksent:${m.id}`]);
const ikContact = (m) => (m.client ? ACCOUNTS[m.client]?.contact.split(' · ')[0] : null) ?? 'THE CLIENT';
const secOf = (k) => INTAKE_SECTIONS.find(([x]) => x === k);
/** Which cases a section shows: a path shows its branch, a stage shows the cases at it, STATUS shows every case. */
function ikIn(m, sec) {
  if (sec === 'status') return true;
  if (IK_PATHS.includes(sec)) return m.branch === sec;
  if (sec === 'match') return ikLife(m) === 'MIGRATION_REVIEW_REQUIRED' && m.conflicts > 0;
  return (IK_SEC_LIVES[sec] || []).includes(ikLife(m));
}
const ikView = (sec = WSX.ik.sec) => ikCases().filter((m) => ikIn(m, sec));
const ikLit = (life, sec = WSX.ik.sec) => !IK_SEC_LIVES[sec] || IK_SEC_LIVES[sec].includes(life);
/** Where a case's work is: its stage's section (a case in review with open conflicts settles them in MATCH first). */
const ikHome = (m) => (ikLife(m) === 'MIGRATION_REVIEW_REQUIRED' ? (ikOpenConf(m) ? 'match' : 'review') : IK_STOP_SEC[ikLife(m)]);
/** '1 COMPANY · 3 PEOPLE · 4 VEHICLES · 9 DOCUMENTS' → [[1, 'COMPANY'], …]; a case still being read shows its files. */
function ikFound(m) {
  const bins = m.found.split(' · ').map((p) => /^(\d+) (.+)$/.exec(p)).filter(Boolean).map(([, n, l]) => [Number(n), l]);
  return bins.length ? bins : [[m.files, 'FILES BEING READ']];
}
/** Who holds the case now: staff prepare, the founder approves (it lands on PREBUILT), only the client confirms. */
function ikHands(m) {
  const i = ikIdx(m);
  const f = ikWithFounder(m);
  return [
    ['STAFF PREPARE', i >= 4 || f ? 'done' : 'now', 'people'],
    ['FOUNDER APPROVES', i >= 4 ? 'done' : f ? 'now' : 'later', 'security'],
    ['CLIENT CONFIRMS', i >= 6 ? 'done' : i === 5 ? 'now' : 'later', 'lock'],
  ];
}
const ikWith = (m) => {
  const l = ikLife(m);
  if (l === 'ACTIVE') return ['NOBODY · DONE', 'THE CLIENT CONFIRMED'];
  if (l === 'CLIENT_CONFIRMATION_REQUIRED') return [`THE CLIENT · ${ikContact(m)}`, 'ONLY THE CLIENT CONFIRMS'];
  if (ikWithFounder(m)) return ['THE FOUNDER', 'APPROVAL LANDS ON PREBUILT'];
  return [`STAFF · ${staffName(m.owner)}`, l === 'PREBUILT' ? 'THE INVITE IS NEXT' : 'PREPARING THE CASE'];
};

/* ── simulated steps: a case moves along the line in place; the view follows it if it leaves ── */
function ikMove(m, life, stage) {
  WSX.over[`ikl:${m.id}`] = life;
  WSX.over[`iks:${m.id}`] = stage;
  const land = IK_LANDS[m.branch]?.[life];
  if (land) WSX.over[`ikscr:${m.id}`] = land;
  if (!ikIn(m, WSX.ik.sec)) WSX.ik.sec = IK_STOP_SEC[life];
}
function ikSettled(m) {
  if (ikOpenConf(m)) return;
  WSX.over[`iks:${m.id}`] = ['CONFLICTS SETTLED', 'gold'];
}
const ikConfBtn = (m, c, k) => simBtn(`ik:c:${m.id}:${c.i}:${k}`, {
  label: c.opts[k][0],
  effect: c.opts[k][1],
  apply: () => {
    WSX.over[`ikc:${m.id}:${c.i}`] = c.opts[k][0];
    ikSettled(m);
  },
  rec: `mig:${m.id}`,
  sm: true,
});

/** The one next step for a case (gold where staff or the founder can act; calm where the client holds it). */
function ikNext(m) {
  const id = m.id;
  const l = ikLife(m);
  const rec = `mig:${id}`;
  if (l === 'KNOWN_UNMIGRATED') return nextBlock('NOT STARTED · CHOOSE A PATH', '', 'calm');
  if (l === 'INTAKE_IN_PROGRESS' || l === 'MIGRATION_IN_PROGRESS') {
    const scan = (IK_READ[id] || []).some((r) => r[2][1] === 'warn');
    if (scan && !WSX.over[`ikscan:${id}`]) return nextBlock('1 FILE NEEDS A BETTER SCAN', simBtn(`ik:scan:${id}`, { label: 'REQUEST A BETTER SCAN', effect: `ASKS ${ikContact(m) === 'THE CLIENT' ? 'THE CLIENT' : ikContact(m)} FOR A CLEARER COPY OF THE RECEIPT PHOTO.`, apply: () => (WSX.over[`ikscan:${id}`] = true), rec, primary: true }));
    return nextBlock(scan ? 'WAITING ON THE CLIENT’S NEW SCAN' : 'AIO IS READING THE FILES', '', 'calm');
  }
  if (l === 'MIGRATION_REVIEW_REQUIRED') {
    const oc = ikOpenConf(m);
    if (oc) return nextBlock(`${oc} CONFLICT${oc > 1 ? 'S' : ''} TO SETTLE BEFORE REVIEW`, simBtn(`ik:conf:${id}`, { label: 'RESOLVE CONFLICTS', effect: IK_CONF_EFFECT[id] ?? 'SETTLES EACH CONFLICT AND RECORDS WHY. NOTHING IS MERGED SILENTLY.', apply: () => { ikConfs(m).forEach((c) => (WSX.over[`ikc:${id}:${c.i}`] ??= c.opts[0][0])); ikSettled(m); }, rec, primary: true }));
    if (ikWithFounder(m)) {
      if (!FOUNDER) return `${nextBlock('WITH THE FOUNDER FOR APPROVAL', '', 'calm')}${ntb('<b>THE FOUNDER APPROVES MIGRATIONS.</b> STAFF PREPARE AND SEND.')}`;
      return nextBlock('APPROVE · IT LANDS ON PREBUILT, NOT ACTIVE', `${simBtn(`ik:approve:${id}`, { label: 'APPROVE TO PREBUILT', effect: 'CREATES THE CLIENT AS PREBUILT — PREPARED, NOT ACTIVE. NO SERVICE STARTS.', apply: () => ikMove(m, 'PREBUILT', ['PREBUILT · NOT ACTIVE YET', 'mute']), rec, primary: true, founder: true })}${simBtn(`ik:back:${id}`, { label: 'SEND BACK', effect: 'RETURNS THE CASE TO STAFF WITH NOTES.', apply: () => { WSX.over[`ikret:${id}`] = true; WSX.over[`iks:${id}`] = ['RETURNED TO STAFF', 'warn']; }, rec, founder: true })}`);
    }
    return nextBlock(WSX.over[`ikret:${id}`] ? 'RETURNED WITH NOTES · SEND IT AGAIN' : 'READY FOR FOUNDER REVIEW', simBtn(`ik:send:${id}`, { label: 'SEND FOR FOUNDER REVIEW', effect: 'PUTS THE CASE IN THE FOUNDER REVIEW QUEUE.', apply: () => { WSX.over[`iksent:${id}`] = true; WSX.over[`ikret:${id}`] = false; WSX.over[`iks:${id}`] = ['FOUNDER REVIEW', 'gold']; WSX.over[`ikscr:${id}`] = IK_LANDS[m.branch].REVIEW; }, rec, primary: true }));
  }
  if (l === 'PREBUILT') return nextBlock('PREPARED, NOT ACTIVE · INVITE THE CLIENT', simBtn(`ik:invite:${id}`, { label: 'SEND ACTIVATION INVITE', effect: `EMAILS ${ikContact(m)} A SECURE LINK TO REVIEW AND CONFIRM THEIR INFORMATION.`, apply: () => { WSX.over[`ikinv:${id}`] = 'JUST NOW'; ikMove(m, 'CLIENT_CONFIRMATION_REQUIRED', ['INVITED · AWAITING CLIENT', 'gold']); }, rec, primary: true }));
  if (l === 'CLIENT_CONFIRMATION_REQUIRED') return nextBlock(`WAITING ON ${ikContact(m)} TO CONFIRM`, simBtn(`ik:resend:${id}`, { label: 'RESEND INVITE', effect: `SENDS THE SAME SECURE LINK TO ${ikContact(m)} AGAIN.`, apply: () => {}, rec, sm: true }), 'calm');
  return nextBlock(`CLIENT CONFIRMED · ${m.confirmed ?? 'THIS VISIT'}`, m.client ? `<button type="button" class="wbtn wbtn--sm" data-a="go" data-v="client:${m.client}">${ico('company')}OPEN IN CLIENT 360</button>` : '', 'done');
}

/* ── pieces ── */
const ikMonoTag = (m, sel = false) => `<i class="ik-mono ${sel ? 'is-sel' : ''}" title="${m.name}">${ikMono(m)}</i>`;
const ikTab = (b, full = false) => `<span class="ik-tok__tab">${ico(ikIco(b))}${full ? MIG_BRANCH[b][0] : b.toUpperCase()}</span>`;
/** A small approved screen that opens in the viewer. */
function ikMini(s, from = 'line') {
  const [b, i] = screenAt(s.id);
  return `<button type="button" class="ik-mini" data-a="ik.flow" data-v="${b}:${i}" title="${s.name} · APPROVED SCREEN" aria-label="${s.name} · open the approved screen"><span class="ik-mini__img"><img src="mig/${s.id}.jpg" alt=""></span><span class="ik-mini__t"><b>${String(i + 1).padStart(2, '0')}</b>${s.name}</span></button>`;
}
function ikScreensFor(sec, b) {
  const L = branchScreens(b);
  if (sec === 'extraction') return L.filter((s) => ['INTAKE_IN_PROGRESS', 'MIGRATION_IN_PROGRESS'].includes(s.life) && !['SELECT', 'INTAKE'].includes(s.state));
  if (sec === 'match') return L.filter((s) => ['NEEDS_REVIEW', 'CONFLICT'].includes(s.state) || s.id === 'AIO-MIG-BATCH-SUMMARY-001');
  if (sec === 'review') return L.filter((s) => s.life === 'MIGRATION_REVIEW_REQUIRED' && !['NEEDS_REVIEW', 'CONFLICT'].includes(s.state) && s.id !== 'AIO-MIG-BATCH-SUMMARY-001');
  if (sec === 'prebuilt') return L.filter((s) => s.life === 'PREBUILT');
  if (sec === 'history') return branchScreens('activation').filter((s) => s.life === 'ACTIVE');
  return L;
}
const ikMinis = (list, title = 'APPROVED SCREENS') => (list.length ? `<div class="ik-minis"><div class="sec-l"><span>${title}</span><span>${list.length}</span></div><div class="ik-minis__g">${list.map((s) => ikMini(s)).join('')}</div></div>` : '');

/* ── the migration line: the hero ── */
function ikStops(m, compact = false) {
  const cases = ikCases();
  const sel = ikIdx(m);
  const stops = MIG_LIFE.map(([k, label], i) => {
    const n = cases.filter((x) => ikLife(x) === k).length;
    const st = i < sel ? 'done' : i === sel ? 'now' : 'later';
    return `<button type="button" class="ik-stop ik-stop--${st} ${ikLit(k) ? 'is-lit' : ''} ${n ? '' : 'ik-stop--none'}" data-a="ik.stop" data-v="${k}" aria-label="${label} · ${n} ${n === 1 ? 'CASE' : 'CASES'}" title="${label} · ${n} ${n === 1 ? 'CASE' : 'CASES'}"><i class="ik-node">${n}${st === 'now' ? `<i class="ik-node__ring" data-swap="ring:${m.id}:${k}" aria-hidden="true"></i>` : ''}</i><b>${compact ? IK_LIFE_S[k] : label}</b></button>`;
  }).join('');
  return `<div class="ik-stops ${compact ? 'ik-stops--c' : ''}"><span class="ik-rail" aria-hidden="true"><i class="ik-rail__on" style="transform:scaleX(${(sel / 6).toFixed(3)})"></i></span><span class="ik-appr" title="FOUNDER APPROVAL LANDS ON PREBUILT" aria-hidden="true"></span><span class="ik-pin" title="ONLY THE CLIENT’S CONFIRMATION MAKES A CLIENT ACTIVE" aria-hidden="true">${ico('lock')}</span>${stops}</div>`;
}
function ikTok(x, inView, sel, wide) {
  const oc = ikOpenConf(x);
  const life = ikLife(x);
  const tip = `${x.name} · ${MIG_BRANCH[x.branch][0]} · ${x.files} FILES${oc ? ` · ${oc} CONFLICT${oc > 1 ? 'S' : ''}` : ''}`;
  const meta = wide ? `<span class="ik-tok__f"><i class="ik-files" aria-hidden="true"></i>${x.files} FILES · STARTED ${x.started}${av(x.owner)}</span><span class="ik-tok__x">${x.found}</span>` : `<span class="ik-tok__f"><i class="ik-files" aria-hidden="true"></i>${x.files} FILES</span>`;
  return `<button type="button" class="ik-tok ${sel ? 'is-sel' : ''} ${inView ? '' : 'is-dim'} ${oc ? 'ik-tok--bad' : ''}" data-a="ik.case" data-v="${x.id}" data-swap="tok:${x.id}:${life}" title="${tip}" aria-label="${tip}" aria-pressed="${sel}">${ikTab(x.branch, wide)}<b class="ik-tok__n">${wide ? x.name : ikShort(x)}</b>${meta}${oc ? `<span class="ik-tok__c"><i class="pip pip--bad"></i>${oc} CONFLICT${oc > 1 ? 'S' : ''}</span>` : ''}</button>`;
}
function ikLine(m) {
  const cases = ikCases();
  const view = new Set(ikView().map((x) => x.id));
  const wide = WSX.device === 'wide';
  const cols = MIG_LIFE.map(([k]) => {
    const here = cases.filter((x) => ikLife(x) === k);
    const toks = here.map((x) => ikTok(x, view.has(x.id), x.id === m.id, wide)).join('');
    const start = k === 'KNOWN_UNMIGRATED' ? `<span class="ik-col__l">START A FILE</span>${IK_PATHS.map((b) => `<button type="button" class="ik-start" data-a="ik.flow" data-v="${b}:0" title="${MIG_BRANCH[b][0]} · THE APPROVED FIRST SCREEN">${ico(ikIco(b))}${b.toUpperCase()}</button>`).join('')}` : '';
    return `<div class="ik-col ${ikLit(k) ? 'is-lit' : ''}">${toks}${start || (here.length ? '' : '<span class="ik-ghost">NONE NOW</span>')}</div>`;
  }).join('');
  return `<section class="ik-line ${IK_SEC_LIVES[WSX.ik.sec] ? 'ik-line--lens' : ''}" aria-label="The migration line">
    <header class="ik-line__h"><span class="ik-line__t">THE MIGRATION LINE</span><span class="ik-line__n">${cases.length} CASES · ${view.size} IN ${IK_SEC[WSX.ik.sec]}</span><span class="ik-line__g">${ico('lock')}STAFF PREPARATION DOES NOT MAKE A CLIENT ACTIVE</span></header>
    <div class="ik-zones" aria-hidden="true"><span class="ik-zone" style="grid-column:1 / 5">STAFF PREPARE</span><span class="ik-zone ik-zone--f" style="grid-column:5 / 6">FOUNDER APPROVES</span><span class="ik-zone ik-zone--c" style="grid-column:6 / 8">ONLY THE CLIENT CONFIRMS</span></div>
    ${ikStops(m)}
    <div class="ik-cols">${cols}</div>
  </section>`;
}

/* ── the ten sections: one row of views ── */
function ikSecs() {
  const sec = WSX.ik.sec;
  const btn = (k) => `<button type="button" role="tab" class="wseg__b ${k === sec ? 'is-on' : ''}" data-a="ik.sec" data-v="${k}" aria-selected="${k === sec}" title="${secOf(k)[1]}">${IK_SEC[k]}<i>${ikView(k).length}</i></button>`;
  const [, full, , sub] = secOf(sec);
  return `<div class="ik-secs"><div class="wseg has-thumb wseg--scroll ik-seg" role="tablist" aria-label="Intake sections" data-thumb><i class="thumb" aria-hidden="true" data-keep-attrs="style data-placed"></i>${IK_PATHS.map(btn).join('')}<i class="ik-seg__sep" aria-hidden="true"></i>${IK_VIEWS.map(btn).join('')}</div>${WSX.device === 'wide' ? `<span class="ik-secs__d" data-swap="d:${sec}" title="${full} · ${sub}">${sub}</span>` : ''}</div>`;
}

/* ── the working surface of each section ── */
function ikTable(m) {
  const list = ikCases().slice().sort((a, b) => ikIdx(a) - ikIdx(b));
  const rows = list.map((x) => `<div class="pk ik-tr ${x.id === m.id ? 'is-sel' : ''}" data-a="ik.case" data-v="${x.id}" title="${x.name} · ${x.source}"><span class="ik-tr__c">${ikMonoTag(x)}<span><b class="pk__t">${x.name}</b><span class="pk__s">${x.source}</span></span></span><span class="ik-tr__p">${ico(ikIco(x.branch))}${x.branch.toUpperCase()}</span><span class="ik-tr__f">${x.files}</span>${av(x.owner)}<span class="ik-tr__d">${x.started}</span>${sw(ikStage(x))}</div>`).join('');
  return `<div class="ik-th"><span>CASE</span><span>PATH</span><span>FILES</span><span>OWNER</span><span>STARTED</span><span>WHERE IT STANDS</span></div>${rows}`;
}
function ikFilm(b, m, label) {
  const L = branchScreens(b);
  const frames = L.map((s, i) => {
    const on = ikScreen(m) === s.id;
    const cs = ikCases().filter((x) => ikScreen(x) === s.id);
    return `<button type="button" class="ik-fr ${on ? 'is-here' : ''}" data-a="ik.flow" data-v="${b}:${i}" title="${String(i + 1).padStart(2, '0')} · ${s.name}" aria-label="${i + 1} · ${s.name} · open the approved screen"><span class="ik-fr__img"><img src="mig/${s.id}.jpg" alt=""></span><span class="ik-fr__n">${String(i + 1).padStart(2, '0')}${on ? '<em>HERE</em>' : ''}</span><span class="ik-fr__cs">${cs.map((x) => ikMonoTag(x, x.id === m.id)).join('')}</span></button>`;
  }).join('');
  return `<div class="ik-filmw">${label ? `<div class="sec-l"><span>${label}</span><span>${L.length} SCREENS · UNCHANGED</span></div>` : ''}<div class="ik-film" style="--n:${L.length}">${frames}</div></div>`;
}
function ikPathCases(b, m) {
  const list = ikCases().filter((x) => x.branch === b).sort((a, c) => ikIdx(a) - ikIdx(c));
  return `<div class="ik-pcs">${list.map((x) => {
    const [, i] = screenAt(ikScreen(x));
    return `<div class="pk ik-pc ${x.id === m.id ? 'is-sel' : ''}" data-a="ik.case" data-v="${x.id}" title="${x.name}">${ikMonoTag(x)}<span><b class="pk__t">${x.name}</b><span class="pk__s">SCREEN ${String(i + 1).padStart(2, '0')} · ${MIG_SCREENS.find((s) => s.id === ikScreen(x))?.name ?? ''}</span></span>${sw(ikStage(x))}</div>`;
  }).join('')}</div>`;
}
function ikReadRows(m) {
  const rows = IK_READ[m.id]
    ? IK_READ[m.id].map(([t, s, st, i]) => [t, s, st[1] === 'warn' && WSX.over[`ikscan:${m.id}`] ? ['SCAN REQUESTED', 'gold'] : st, i])
    : ikFound(m).map(([n, l]) => [l, `${n} FOUND IN ${m.files} FILES`, ['READ · CHECKED', 'ok'], IK_FOUND_ICO[l] ?? 'folder']);
  return rows.map(([t, s, st, i]) => `<div class="ik-rd__r ik-rd__r--${st[1]}"><span class="ik-rd__i">${ico(i)}</span><span class="ik-rd__t"><b>${t}</b><small>${s}</small></span>${sw(st)}</div>`).join('');
}
function ikPile(m) {
  return `<div class="ik-pile"><span class="ik-pile__g" aria-hidden="true"><i></i><i></i><i></i></span><span class="ik-pile__n"><b>${m.files}</b><small>FILES IN</small></span><span class="ik-pile__t"><small>FROM</small><b>${m.source}</b><small>STARTED ${m.started} · ${staffName(m.owner)}</small></span></div>`;
}
function ikConfCards(m) {
  const cs = ikConfs(m);
  if (!cs.length) return `<div class="ik-none">${ico('pass')}<b>NO CONFLICTS ON THIS CASE</b></div>`;
  return cs.map((c) => `<div class="ik-cf ${c.got ? 'is-done' : ''}"><div class="ik-cf__h"><span class="ik-cf__i">${ico(c.got ? 'pass' : 'warning')}</span><span><b>${c.t}</b><small>${c.s}</small></span></div>
    <div class="ik-cmp"><span class="ik-val"><small>${c.a[0]}</small><b>${c.a[1]}</b></span><i class="ik-cmp__ne" aria-hidden="true">≠</i><span class="ik-val"><small>${c.b[0]}</small><b>${c.b[1]}</b></span></div>
    <div class="ik-cf__f">${c.got ? sw([`SETTLED · ${c.got}`, 'ok']) : `${ikConfBtn(m, c, 0)}${ikConfBtn(m, c, 1)}`}</div></div>`).join('');
}
function ikChecks(m) {
  const oc = ikOpenConf(m);
  const f = ikWithFounder(m);
  const items = [
    [m.conflicts ? (oc ? `${oc} CONFLICT${oc > 1 ? 'S' : ''} OPEN` : 'CONFLICTS SETTLED') : 'NO CONFLICTS FOUND', !oc],
    [ikIdx(m) >= 4 ? 'FOUNDER APPROVED · PREBUILT' : f ? 'WITH THE FOUNDER' : 'NOT SENT TO THE FOUNDER YET', ikIdx(m) >= 4 || f],
    ikIdx(m) >= 6 ? ['CLIENT CONFIRMED · ACTIVE', true] : [ikIdx(m) === 5 ? 'WAITING ON THE CLIENT TO CONFIRM' : 'THE CLIENT CONFIRMS LATER · NOT NOW', null],
  ];
  return `<ul class="ik-chk">${items.map(([t, ok]) => `<li class="${ok === null ? 'is-lock' : ok ? 'is-ok' : 'is-open'}">${ico(ok === null ? 'lock' : ok ? 'pass' : 'pending')}<span>${t}</span></li>`).join('')}</ul>`;
}
function ikFigs(m, title = 'APPROVAL CREATES') {
  return `<div class="ik-figs"><div class="sec-l">${title}</div><div class="ros">${ikFound(m).map(([n, l]) => ro(n, l)).join('')}</div></div>`;
}
function ikSum(m, note = true) {
  return `<div class="ik-sum">${ikFigs(m)}<div class="ik-land"><span>${ico('security')}APPROVAL LANDS ON</span><b>PREBUILT · NOT ACTIVE YET</b></div>${ikChecks(m)}${FOUNDER || !note ? '' : ntb('<b>FOUNDER ONLY.</b> STAFF PREPARE THE CASE AND SEND IT.')}</div>`;
}
function ikQueue(list, m, sub) {
  return `<div class="ik-q">${list.map((x) => `<div class="pk ik-pc ${x.id === m.id ? 'is-sel' : ''}" data-a="ik.case" data-v="${x.id}" title="${x.name}">${ikMonoTag(x)}<span><b class="pk__t">${x.name}</b><span class="pk__s">${sub(x)}</span></span>${sw(ikStage(x))}</div>`).join('') || '<div class="ik-none"><b>NOTHING HERE NOW</b></div>'}</div>`;
}
function ikClientPlate(m) {
  const c = m.client ? ACCOUNTS[m.client] : null;
  const life = ikLife(m);
  const word = life === 'ACTIVE' ? ['ACTIVE · CLIENT CONFIRMED', 'ok'] : life === 'CLIENT_CONFIRMATION_REQUIRED' ? ['INVITED · NOT ACTIVE YET', 'gold'] : ['PREBUILT · NOT ACTIVE YET', 'mute'];
  return `<div class="ik-cpl"><span class="ik-cpl__b"><b>${c ? c.b : ikMono(m)}</b></span><span class="ik-cpl__t"><small>${c ? `${c.dot} · ${c.state}` : 'NEW CLIENT RECORD · SIMULATED'}</small><b>${c ? c.name : m.name}</b>${sw(word)}<small>${c ? c.contact : 'CONTACT FROM THE FILES'}</small></span>${c ? `<button type="button" class="wbtn wbtn--sm" data-a="go" data-v="client:${c.id}">${ico('company')}CLIENT 360${ico('fwd')}</button>` : ''}</div>`;
}
function ikJourney(x, m) {
  return `<div class="pk ik-jr ${x.id === m.id ? 'is-sel' : ''}" data-a="ik.case" data-v="${x.id}" title="${x.name}">${ikMonoTag(x)}<span class="ik-jr__t"><b class="pk__t">${x.name}</b><span class="pk__s">${MIG_BRANCH[x.branch][0]} · ${x.files} FILES</span></span><span class="ik-jr__l"><span><small>STARTED</small><b>${x.started}</b></span><i aria-hidden="true"></i><span><small>CONFIRMED</small><b>${(x.confirmed ?? '—').replace(', 2026', '')}</b></span></span>${sw(['ACTIVE · CLIENT CONFIRMED', 'ok'])}</div>`;
}
function ikWork(m) {
  const sec = WSX.ik.sec;
  const [, full] = secOf(sec);
  const b = m.branch;
  let n = '';
  let body = '';
  if (sec === 'status') {
    n = `${ikCases().length} CASES · IN LIFECYCLE ORDER`;
    body = ikTable(m);
  } else if (IK_PATHS.includes(sec)) {
    n = `${ikView(sec).length} CASES ON THIS PATH`;
    body = `${ikFilm(sec, m, 'THE APPROVED PATH')}${ikPathCases(sec, m)}`;
  } else if (sec === 'extraction') {
    n = `WHAT AIO READ · ${ikShort(m)}`;
    body = `<div class="ik-ex">${ikPile(m)}<div class="ik-rd"><div class="sec-l"><span>CLASSIFIED FROM ${m.files} FILES</span><span>STAFF CHECK EVERY ONE</span></div>${ikReadRows(m)}</div>${ikMinis(ikScreensFor('extraction', b))}</div>`;
  } else if (sec === 'match') {
    const oc = ikOpenConf(m);
    n = `${ikShort(m)} · ${oc ? `${oc} OPEN` : 'SETTLED'}`;
    body = `<div class="ik-mx"><div class="ik-cfs" style="--k:${Math.max(1, Math.min(2, ikConfs(m).length))}">${ikConfCards(m)}<span class="ik-cfs__n">SAMPLE VALUES · NOTHING IS MERGED SILENTLY</span></div>${ikMinis(ikScreensFor('match', b))}</div>`;
  } else if (sec === 'review') {
    const list = ikView('review');
    n = `${list.length} IN REVIEW · APPROVAL LANDS ON PREBUILT`;
    body = `<div class="ik-rv"><div><div class="sec-l"><span>THE QUEUE</span><span>${list.filter(ikWithFounder).length} WITH THE FOUNDER</span></div>${ikQueue(list, m, (x) => (ikOpenConf(x) ? `${ikOpenConf(x)} CONFLICT${ikOpenConf(x) > 1 ? 'S' : ''} OPEN` : ikWithFounder(x) ? 'WITH THE FOUNDER' : 'READY TO SEND'))}</div>${ikSum(m)}${ikMinis(ikScreensFor('review', b))}</div>`;
  } else if (sec === 'prebuilt') {
    const list = ikView('prebuilt');
    n = `${list.length} PREPARED · NOT ACTIVE`;
    body = list.length && ikIn(m, 'prebuilt') ? `<div class="ik-pb"><div class="ik-pb__a">${ikClientPlate(m)}${ikFigs(m, 'PREPARED BY STAFF')}</div><div class="ik-pb__b"><div class="sec-l">THE INVITE</div><div class="ik-land ik-land--q"><span>${ico('letter')}ACTIVATION INVITE</span><b>NOT SENT YET</b></div>${ikChecks(m)}</div>${ikMinis(ikScreensFor('prebuilt', b))}</div>` : `<div class="ik-none"><b>NO PREBUILT CLIENTS NOW</b></div>`;
  } else if (sec === 'activation') {
    const list = ikView('activation');
    n = `${list.length} WAITING · WHAT THE CLIENT SEES · ${branchScreens('activation').length} SCREENS`;
    const inv = ikIn(m, 'activation') ? `<div class="ik-ac__a">${ikClientPlate(m)}<div class="ik-ac__b"><div class="ik-land ik-land--q"><span>${ico('letter')}INVITE SENT</span><b>${WSX.over[`ikinv:${m.id}`] ?? m.invited ?? '—'} · TO ${ikContact(m)}</b></div>${ikChecks(m)}</div></div>` : `<div class="ik-none"><b>NO INVITES WAITING</b></div>`;
    body = `<div class="ik-ac">${inv}${ikFilm('activation', m, null)}</div>`;
  } else if (sec === 'history') {
    const list = ikView('history');
    n = `${list.length} COMPLETED · CLIENT CONFIRMED`;
    body = `<div class="ik-hi"><div class="ik-hi__l">${list.map((x) => ikJourney(x, m)).join('') || '<div class="ik-none"><b>NO COMPLETED MIGRATIONS</b></div>'}${ikIn(m, 'history') ? ikFigs(m, `BROUGHT INTO AIO · ${ikShort(m)}`) : ''}</div>${ikMinis(ikScreensFor('history', b), 'WHAT THEY SAW LAST')}</div>`;
  }
  // ultra-wide has the room: under the section's work, the case's whole approved path, its screen marked HERE
  const path = WSX.device === 'wide' && !IK_PATHS.includes(sec) && !['status', 'activation'].includes(sec) ? ikFilm(b, m, `THE APPROVED PATH · ${MIG_BRANCH[b][0]}`) : '';
  return rgn(full, n, '', `<div class="ik-w ik-w--${sec}" data-swap="w:${sec}:${m.id}">${body}${path}</div>`, 'ik-work', 'ik-work');
}

/* ── the case file ── */
function ikMeter(m) {
  const i = ikIdx(m);
  const segs = MIG_LIFE.map(([k], j) => `<i class="${j < i ? 'd' : j === i ? 'n' : ''} ${j === 6 ? 'g' : ''}" title="${MIG_LIFE[j][1]}"></i>`).join('');
  return `<div class="ik-meter"><div class="ik-meter__t"><b>${i + 1}<small> OF 7</small></b><span>${MIG_LIFE[i][1]}</span></div><div class="ik-meter__bar">${segs}</div></div>`;
}
function ikShot(m, big = false) {
  const id = ikScreen(m);
  const s = MIG_SCREENS.find((x) => x.id === id);
  const [b, i] = screenAt(id);
  return `<div class="ik-scr ${big ? 'ik-scr--big' : ''}"><button type="button" class="ik-shot" data-a="ik.view" data-v="${m.id}" aria-label="Open the approved screen · ${s.name}" title="${s.name} · OPEN THE APPROVED SCREEN"><img src="mig/${id}.jpg" alt=""><span class="ik-seal">${ico('pass')}APPROVED</span></button><div class="ik-scr__t"><small>CURRENT APPROVED SCREEN</small><b>${s.name}</b><span>${MIG_BRANCH[b][0]} · STEP ${i + 1} OF ${branchScreens(b).length}</span></div><button type="button" class="wbtn wbtn--sm ik-scr__go" data-a="ik.view" data-v="${m.id}">${ico('view')}OPEN THE APPROVED SCREEN</button></div>`;
}
function ikGate(m) {
  const life = ikLife(m);
  const hands = ikHands(m).map(([t, st, i]) => `<span class="ik-hand ik-hand--${st}"><i></i><b>${st === 'done' ? ico('pass') : ico(i)}${t}</b></span>`).join('');
  const lock = ['PREBUILT', 'CLIENT_CONFIRMATION_REQUIRED'].includes(life) ? `<button type="button" class="wbtn wbtn--sm ik-gate__x" disabled title="ONLY THE CLIENT’S CONFIRMATION MAKES A CLIENT ACTIVE">${ico('lock')}MARK ACTIVE · CLIENT ONLY</button>` : '';
  return `<div class="ik-gate"><div class="ik-gate__h"><span class="ik-gate__i">${ico('lock')}</span><span class="ik-gate__t"><b>STAFF PREPARATION DOES NOT MAKE A CLIENT ACTIVE.</b><span>APPROVAL LANDS ON PREBUILT.</span><span>ONLY THE CLIENT’S CONFIRMATION MAKES THEM ACTIVE.</span></span></div><div class="ik-hands">${hands}</div>${lock}</div>`;
}
function ikFacts(m) {
  const oc = ikOpenConf(m);
  const life = ikLife(m);
  const c = m.client ? ACCOUNTS[m.client] : null;
  const becomes = c
    ? [`<a data-a="go" data-v="client:${c.id}">${c.name}${ico('fwd')}</a>`, life === 'ACTIVE' ? 'ACTIVE · CLIENT CONFIRMED' : life === 'CLIENT_CONFIRMATION_REQUIRED' ? 'INVITED · NOT ACTIVE YET' : 'PREBUILT · NOT ACTIVE YET']
    : ikIdx(m) >= 4 ? [m.name, 'PREBUILT · NOT ACTIVE YET · SIMULATED'] : ['NO CLIENT YET', 'APPROVAL CREATES IT ON PREBUILT'];
  const [w, ws] = ikWith(m);
  return facts([
    ['FILES', `${m.files} FILES`, m.source],
    ['WHAT AIO FOUND', m.found],
    ['CONFLICTS', m.conflicts ? (oc ? `${oc} OPEN` : `${m.conflicts} SETTLED`) : 'NONE'],
    ['WITH', w, ws],
    ['OWNER', staffName(m.owner), STAFF[m.owner]?.area],
    ['STARTED', m.started],
    ['BECOMES', becomes[0], becomes[1]],
  ]);
}
const ikHist = (m) => [m.confirmed && [m.confirmed.replace(', 2026', ''), 'CLIENT CONFIRMED · ACTIVE'], m.invited && [m.invited, 'ACTIVATION INVITE SENT'], [m.started, `${m.files} FILES RECEIVED`]].filter(Boolean);
/** On the phone the case file also carries the section work for the case: what was read, or its conflicts. */
function ikDetail(m) {
  const l = ikLife(m);
  if (IK_SEC_LIVES.extraction.includes(l)) return `<div class="ik-rd"><div class="sec-l"><span>WHAT AIO READ</span><span>${m.files} FILES</span></div>${ikReadRows(m)}</div>`;
  if (l === 'MIGRATION_REVIEW_REQUIRED' && m.conflicts) return `<div class="ik-cfs"><div class="sec-l"><span>CONFLICTS</span><span>${ikOpenConf(m) ? `${ikOpenConf(m)} OPEN` : 'SETTLED'}</span></div>${ikConfCards(m)}</div>`;
  if (l === 'MIGRATION_REVIEW_REQUIRED') return ikSum(m, false);
  return '';
}
function ikCase(m, phone = false) {
  const wide = WSX.device === 'wide' && !phone;
  const crumb = `<div class="cx__crumb"><a data-go="intake">INTAKE</a>${ico('fwd')}<span>MIGRATION CASE</span>${ico('fwd')}<span>${ikShort(m)}</span></div>`;
  const plate = `<div class="ik-plate" data-swap="pl:${m.id}"><span class="ik-plate__i">${ico(ikIco(m.branch))}</span><span class="ik-plate__t"><small>${MIG_BRANCH[m.branch][0]} · SAMPLE CASE</small><b>${m.name}</b></span><span class="ik-plate__s">${sw(ikStage(m))}</span></div>`;
  const hist = mhist(`mig:${m.id}`, ikHist(m));
  const body = wide
    ? `<div class="ik-cx2"><div class="ik-cx2__a">${ikShot(m, true)}${hist}</div><div class="ik-cx2__b">${ikMeter(m)}${ikNext(m)}${ikFacts(m)}${ikGate(m)}</div></div>`
    : `${ikMeter(m)}${ikNext(m)}${phone ? ikDetail(m) : ''}${ikShot(m)}${ikFacts(m)}${ikGate(m)}${hist}`;
  return `<section class="rg cx ik-cx"><header class="cx__h">${crumb}${plate}</header><div class="cx__b" data-keep="ik-cx" data-swap="b:${m.id}">${body}</div></section>`;
}

/* ── the approved screen viewer: the authority image, unchanged ── */
function ikViewer() {
  const m = ikSel();
  const [b, n0] = WSX.ik.flow || screenAt(ikScreen(m));
  const L = branchScreens(b);
  const i = Math.max(0, Math.min(Number(n0) || 0, L.length - 1));
  const s = L[i];
  const life = MIG_LIFE.find(([k]) => k === s.life);
  const here = ikCases().filter((x) => ikScreen(x) === s.id);
  const client = b === 'activation';
  const fromCase = WSX.ik.from === 'case' || WSX.ik.from === 'panel';
  const back = WSX.ik.from === 'route' ? `<button type="button" class="wbtn wbtn--dark" data-go="intake">${ico('back')}BACK TO INTAKE</button>` : `<button type="button" class="wbtn wbtn--dark" data-a="ik.close">${ico('back')}BACK TO ${fromCase ? ikShort(m) : 'THE CASES'}</button>`;
  const phone = VP === 'mobile';
  const prev = phone ? `<button type="button" class="wbtn wbtn--icon" ${i > 0 ? `data-a="ik.step" data-v="${i - 1}"` : 'disabled'} aria-label="Previous screen">${ico('back')}</button>` : `<button type="button" class="wbtn" ${i > 0 ? `data-a="ik.step" data-v="${i - 1}"` : 'disabled'}>${ico('back')}PREVIOUS</button>`;
  const nav = `<div class="ik-vw__nav">${prev}${i < L.length - 1 ? `<button type="button" class="wbtn wbtn--gold" data-a="ik.step" data-v="${i + 1}">NEXT${ico('fwd')}</button>` : `<button type="button" class="wbtn" disabled>LAST SCREEN</button>`}<span class="ik-vw__sp"></span>${back}</div>`;
  const steps = `<div class="ik-vw__steps">${L.map((x, k) => `<button type="button" class="ik-vs ${k === i ? 'is-on' : ''}" data-a="ik.step" data-v="${k}" title="${x.name}" aria-current="${k === i}"><i>${String(k + 1).padStart(2, '0')}</i><span>${x.name}</span><span class="ik-vs__cs">${ikCases().filter((c) => ikScreen(c) === x.id).map((c) => ikMonoTag(c, c.id === m.id)).join('')}</span></button>`).join('')}</div>`;
  const info = `<div class="ik-vw__info">
      <div><div class="sec-l">${client ? 'WHAT THE CLIENT DOES HERE' : 'WHAT STAFF DO ON THIS SCREEN'}</div><ul class="ik-vw__do">${s.interactions.map((x) => `<li>${ico('pass')}${x.toUpperCase()}</li>`).join('')}</ul></div>
      ${here.length ? `<div><div class="sec-l">CASES ON THIS SCREEN</div><div class="ik-vw__cases">${here.map((x) => `<button type="button" class="ik-vw__case ${x.id === m.id ? 'is-sel' : ''}" data-a="ik.pick" data-v="${x.id}">${ikMonoTag(x)}${ikShort(x)}${ico('fwd')}</button>`).join('')}</div></div>` : ''}
      <div><div class="sec-l"><span>${MIG_BRANCH[b][0]}</span><span>${L.length} SCREENS</span></div>${steps}</div>
      ${ntb(client ? '<b>THE CLIENT’S OWN OFFICE.</b> STAFF SEE IT; ONLY THE CLIENT ACTS.' : '<b>SHOWN UNCHANGED.</b> ITS OWN DOCK PREDATES THE FIVE ROOTS.')}
    </div>`;
  return `<div class="wscrim ik-scrim" data-a="ik.close" data-key="scrim" aria-hidden="true"></div><div class="wsheet ik-vsheet" data-key="ik-vsheet" role="dialog" aria-modal="true" aria-label="Approved migration screen" tabindex="-1">
    <div class="ik-vbar"><span class="ik-vbar__l">${ico('security')}APPROVED MIGRATION SCREEN · UNCHANGED</span><button type="button" class="wbtn wbtn--icon wbtn--sm ik-vbar__x" data-a="ik.close" aria-label="Close">${ico('close')}</button></div>
    <div class="ik-vw" data-swap="vw:${s.id}">
      <header class="ik-vw__h"><div class="cx__crumb"><span>${MIG_BRANCH[b][0]}</span>${ico('fwd')}<span>STEP ${i + 1} OF ${L.length}</span></div><h2 class="cx__t">${s.name}</h2><span class="ik-vw__chips">${life ? sw([life[1], s.life === 'ACTIVE' ? 'ok' : s.life === 'PREBUILT' ? 'mute' : 'gold']) : ''}<span class="ik-vw__id">${s.id}</span></span></header>
      <div class="ik-vw__main"><figure class="ik-vw__img"><img src="mig/${s.id}.jpg" alt="${s.name} — the approved screen"></figure>${info}</div>
    </div>
    ${nav}
  </div>`;
}

/* ── bar, phone pieces, compositions ── */
function ikBar() {
  const cs = ikCases();
  const sec = WSX.ik.sec;
  const open = cs.filter((x) => ikLife(x) !== 'ACTIVE').length;
  const conf = cs.reduce((s, x) => s + ikOpenConf(x), 0);
  const rev = cs.filter((x) => ikLife(x) === 'MIGRATION_REVIEW_REQUIRED').length;
  const act = cs.filter((x) => ikLife(x) === 'ACTIVE').length;
  const files = cs.reduce((s, x) => s + x.files, 0);
  const back = WSX.ret?.ws === 'r-intake' ? '' : `<button type="button" class="wbtn wbtn--sm ${WSX.ret ? '' : 'wbtn--dark'}" data-go="intake">${ico('back')}${WSX.ret ? 'INTAKE' : 'BACK TO INTAKE'}</button>`;
  if (VP === 'mobile') return wsBar('INTAKE', 'MIGRATION CASES', [ro(open, 'OPEN'), ro(conf, 'CONFLICTS', { tone: conf ? 'bad' : '' }), ro(act, 'ACTIVE')].join(''), '');
  const r = [ro(open, 'OPEN CASES', { a: 'ik.sec', v: 'status', on: sec === 'status' }), ro(files, 'FILES IN'), ro(conf, 'CONFLICTS', { tone: conf ? 'bad' : '', a: 'ik.sec', v: 'match', on: sec === 'match' }), ro(rev, 'IN REVIEW', { tone: 'gold', a: 'ik.sec', v: 'review', on: sec === 'review' }), ro(act, 'ACTIVE', { a: 'ik.sec', v: 'history', on: sec === 'history' })];
  return wsBar('INTAKE', 'MIGRATION CASES', (VP === 'tablet' ? r.slice(0, 4) : r).join(''), `${back}${VP === 'desktop' ? '<span class="design-pill">SAMPLE CASES</span>' : ''}`);
}
function ikPhoneList(m) {
  const list = ikView().sort((a, b) => ikIdx(a) - ikIdx(b));
  const rows = list.map((x) => `<div class="pk ik-pr ${x.id === m.id && WSX.sheet ? 'is-sel' : ''}" data-a="ik.case" data-v="${x.id}" title="${x.name}">${ikMonoTag(x)}<span class="ik-pr__t"><b class="pk__t">${x.name}</b><span class="pk__s">${x.branch.toUpperCase()} · ${x.files} FILES${ikOpenConf(x) ? ` · ${ikOpenConf(x)} CONFLICT${ikOpenConf(x) > 1 ? 'S' : ''}` : ''}</span>${sw(ikStage(x))}</span>${ico('fwd', 'chev')}</div>`).join('');
  return rgn(`${IK_SEC[WSX.ik.sec]} · CASES`, `${list.length}`, '', rows || '<div class="ik-none"><b>NOTHING HERE NOW</b></div>', 'ik-plist');
}
function ikPhoneMore(m) {
  const sec = WSX.ik.sec;
  if (IK_PATHS.includes(sec)) return rgn('THE APPROVED PATH', MIG_BRANCH[sec][0], '', ikFilm(sec, m, 'EVERY SCREEN · TAP TO OPEN'), 'ik-pmore');
  if (sec === 'activation') return rgn('WHAT THE CLIENT SEES', 'IN THEIR OWN OFFICE', '', ikFilm('activation', m, 'EVERY SCREEN · TAP TO OPEN'), 'ik-pmore');
  const list = ikScreensFor(sec === 'status' ? 'none' : sec, m.branch);
  if (sec === 'status' || !list.length) return '';
  return rgn('APPROVED SCREENS', `${secOf(sec)[1]}`, '', `<div class="ik-pmore__b">${ikMinis(list, MIG_BRANCH[m.branch][0])}</div>`, 'ik-pmore');
}
function ikSheet(m) {
  if (WSX.sheet === 'view') return ikViewer();
  if (VP === 'mobile' && WSX.sheet) return phoneSheet(ikCase(m, true), { label: `${m.name} · migration case` });
  return '';
}
function intakeCasesView() {
  if (WSX.ik.want) {
    WSX.sheet = 'view';
    WSX.ik.want = false;
  }
  const m = ikSel();
  if (VP === 'mobile') return `<div class="ws ik ik--m">${ikBar()}<section class="ik-strip" aria-label="The migration line">${ikStops(m, true)}</section>${ikSecs()}${ikPhoneList(m)}${ikPhoneMore(m)}</div>${ikSheet(m)}`;
  if (VP === 'tablet') return `<div class="ws ik ik--t">${ikBar()}${ikSecs()}${ikLine(m)}<div class="ik-t2">${ikWork(m)}${ikCase(m)}</div></div>${ikSheet(m)}`;
  return `<div class="ws ik">${ikBar()}<div class="ik-grid">${ikSecs()}<div class="ik-mid">${ikLine(m)}${ikWork(m)}</div>${ikCase(m)}</div></div>${ikSheet(m)}`;
}

/* ── actions ── */
/** Keep the selection inside the view: a section keeps its case when it shows it, otherwise takes its first. */
function ikFitCase() {
  const list = ikView();
  if (list.length && !list.some((x) => x.id === WSX.ik.id)) WSX.ik.id = list.sort((a, b) => ikIdx(a) - ikIdx(b))[0].id;
}
/** Select a case; a case outside the view opens where its work is (a path view follows the case to its path). */
function ikPick(id, home = false) {
  const m = MIG_CASES[id];
  if (!m) return;
  WSX.ik.id = id;
  if (home) WSX.ik.sec = ikHome(m);
  else if (!ikIn(m, WSX.ik.sec)) WSX.ik.sec = IK_PATHS.includes(WSX.ik.sec) ? m.branch : ikHome(m);
  WSX.pending = null;
}
ACT['ik.sec'] = (k) => {
  if (!IK_SEC[k]) return;
  WSX.ik.sec = k;
  WSX.pending = null;
  ikFitCase();
};
ACT['ik.stop'] = (life) => ACT['ik.sec'](IK_STOP_SEC[life] ?? 'status');
ACT['ik.case'] = (id) => {
  ikPick(id);
  if (WSX.sheet === 'view') WSX.sheet = false;
};
ACT['ik.open'] = (id) => {
  ikPick(id);
  WSX.sheet = 'case';
};
/** Back from the viewer to the case it was opened from (the phone returns to the case drawer). */
ACT['ik.pick'] = (id) => {
  ikPick(id);
  WSX.ik.flow = null;
  WSX.sheet = VP === 'mobile' ? 'case' : false;
};
ACT['ik.view'] = (id) => {
  if (MIG_CASES[id]) WSX.ik.id = id;
  WSX.ik.from = VP === 'mobile' ? 'case' : 'panel';
  WSX.ik.flow = screenAt(ikScreen(ikSel()));
  WSX.sheet = 'view';
  WSX.pending = null;
};
ACT['ik.flow'] = (v) => {
  const [b, n] = String(v).split(':');
  if (!branchScreens(b).length) return;
  WSX.ik.flow = [b, Number(n) || 0];
  WSX.ik.from = WSX.sheet === 'case' ? 'case' : 'line';
  WSX.sheet = 'view';
  WSX.pending = null;
};
ACT['ik.step'] = (n) => {
  const f = WSX.ik.flow || screenAt(ikScreen(ikSel()));
  WSX.ik.flow = [f[0], Math.max(0, Math.min(Number(n) || 0, branchScreens(f[0]).length - 1))];
};
ACT['ik.close'] = () => {
  WSX.sheet = VP === 'mobile' && WSX.ik.from === 'case' ? 'case' : false;
  WSX.ik.flow = null;
  WSX.pending = null;
};

registerWorkspace({
  id: 'intake', no: 'I+', name: 'INTAKE · MIGRATION CASES', group: 'office', page: 'intake', hidden: true, view: () => intakeCasesView(),
  shape: 'THE MIGRATION LINE', line: 'EVERY CASE ON ITS WAY TO ACTIVE.',
  states: [
    ['MAIN', []],
    ['SELECTED', [['ik.sec', 'match'], ['ik.case', 'mig-bl']]],
    ['DEEPER', [['ik.case', 'mig-sr'], ['ik.view', 'mig-sr']]],
    ['PHONE', [['ik.case', 'mig-bl']], 'phone'],
  ],
  demos: [
    ['APPROVE · IT LANDS ON PREBUILT', [['ik.case', 'mig-sr', 'SUMMIT RIDGE · WITH THE FOUNDER'], ['sim.ask', 'ik:approve:mig-sr', 'APPROVE TO PREBUILT'], ['sim.ok', 'ik:approve:mig-sr', 'CONFIRM · SIMULATED'], ['ik.view', 'mig-sr', 'ITS APPROVED SCREEN · PREBUILT'], ['ik.close', '', 'BACK TO SUMMIT RIDGE']]],
    ['SETTLE BLUELINE’S CONFLICTS', [['ik.sec', 'match', 'MATCH & RECONCILE'], ['ik.case', 'mig-bl', 'BLUELINE · 2 CONFLICTS'], ['sim.ask', 'ik:conf:mig-bl', 'RESOLVE CONFLICTS'], ['sim.ok', 'ik:conf:mig-bl', 'CONFIRM · SIMULATED'], ['sim.ask', 'ik:send:mig-bl', 'SEND FOR FOUNDER REVIEW']]],
    ['WHAT THE CLIENT SEES', [['ik.case', 'mig-hc', 'HEARTLAND · AWAITING THE CLIENT'], ['ik.flow', 'activation:0', 'THE CLIENT’S FIRST SCREEN'], ['ik.step', '1', 'NEXT · COMPANY'], ['ik.step', '7', 'CONFIRM · ONLY THE CLIENT'], ['ik.close', '', 'BACK TO THE CASES']]],
  ],
  audit: [
    ...['existing', 'new', 'bulk', 'status', 'extraction', 'match', 'review', 'prebuilt', 'activation', 'history'].map((k) => [['ik.sec', k]]),
    ...['mig-lv', 'mig-b07', 'mig-mt', 'mig-hc', 'mig-rl', 'mig-tk'].map((id) => [['ik.case', id]]),
    [['ik.flow', 'existing:0']],
    [['ik.flow', 'new:9']],
    [['ik.flow', 'bulk:4']],
    [['ik.flow', 'activation:9']],
    [['ik.case', 'mig-hc'], ['ik.view', 'mig-hc']],
    [['ik.case', 'mig-sr'], ['sim.ask', 'ik:approve:mig-sr']],
    [['ik.case', 'mig-sr'], ['sim.ok', 'ik:approve:mig-sr']],
    [['ik.case', 'mig-mt'], ['sim.ok', 'ik:invite:mig-mt']],
    [['ik.sec', 'match'], ['ik.case', 'mig-bl'], ['sim.ask', 'ik:c:mig-bl:1:1']],
    [['ik.sec', 'match'], ['ik.case', 'mig-bl'], ['sim.ok', 'ik:conf:mig-bl']],
    [['ik.sec', 'extraction'], ['sim.ask', 'ik:scan:mig-lv']],
  ],
  phoneAct: { 'ik.case': 'ik.open' },
  enter: (a, b) => {
    if (MIG_CASES[a]) ikPick(a, true);
    else if (IK_SEC[a]) ACT['ik.sec'](a);
    else if (a === 'flow' && branchScreens(b).length) Object.assign(WSX.ik, { flow: [b, 0], want: true, from: 'line' });
  },
  label: () => `MIGRATION · ${ikShort(ikSel())}`,
  route: (s) => {
    if (s[0] === 'rec' && ['migration', 'mig'].includes(s[1]) && MIG_CASES[s[2]]) return ikPick(s[2], true), true;
    if (s[0] !== 'intake') return false;
    if (IK_SEC[s[1]] && !s[2]) return ACT['ik.sec'](s[1]), true;
    if (s[1] === 'case' && MIG_CASES[s[2]]) return ikPick(s[2], true), true;
    if (s[1] === 'flow' && branchScreens(s[2]).length) {
      const b = s[2];
      if (IK_PATHS.includes(b) && ikSel().branch !== b) ikPick(ikCases().find((x) => x.branch === b).id);
      WSX.ik.sec = IK_PATHS.includes(b) ? b : 'activation';
      ikFitCase();
      Object.assign(WSX.ik, { flow: [b, Math.max(0, Number(s[3]) || 0)], want: true, from: 'route' });
      return true;
    }
    return false;
  },
});
