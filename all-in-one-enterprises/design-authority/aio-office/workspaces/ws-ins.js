/*
 * 07 — INSURANCE. Coverage-centred: the renewal runway on an obsidian stage (each policy's remaining coverage as a
 * bar from today to its expiry) · the coverage relationships (client → policy → insured trucks, with the units no
 * policy covers) · the selected policy drawn like a certificate (coverage lines and limits, partner or agent, term,
 * insured units, documents), its missing information and ONE next step. AIO gives REFERRAL AND ASSISTANCE ONLY:
 * nothing is bound (SERVICES · INSURANCE (REFERRAL) · PARTNER PENDING). Intake and quote requests are SAMPLE records.
 */
WSX.ins = { sec: 'policies', sel: 'policy:pol-dh', pol: 'pol-dh' };

const INS_SECS = [['intake', 'INTAKE'], ['quotes', 'QUOTES'], ['policies', 'POLICIES'], ['renewals', 'RENEWALS']];
/** The insurance request steps (the `request` word each policy carries). */
const INS_TRACK = ['NEW', 'INTERNAL REVIEW', 'CUSTOMER REVIEW', 'COMPLETED'];
/** SAMPLE · intake: a quote request from an existing client and the CRM lead asking for insurance help. No prices. */
const INS_INTAKE = {
  'in-tk': { id: 'in-tk', client: 'c-tk', kind: 'QUOTE REQUEST', title: 'COVERAGE QUOTE REQUEST', ask: 'AUTO LIABILITY AND CARGO', from: 'CLIENT OFFICE', received: 'OCT 7', owner: 's-maria', status: ['NEW', 'gold'], hist: [['OCT 7', 'QUOTE REQUEST RECEIVED FROM THE CLIENT OFFICE']] },
  'in-pw': { id: 'in-pw', lead: 'ld-crm-4', kind: 'LEAD · GROWTH / CRM', title: 'INSURANCE ASSISTANCE', ask: 'INSURANCE ASSISTANCE', from: 'WEBSITE', received: 'OCT 6', owner: null, status: ['FOLLOW-UP OVERDUE', 'bad'], hist: [['OCT 6', 'FOLLOW-UP DATE PASSED']] },
};
/** SAMPLE · policy history around TODAY (the deadline record and the client’s own messages say the rest). */
const INS_HIST = {
  'pol-dh': [['YESTERDAY', 'RENEWAL OPTIONS RECEIVED FROM THE PARTNER'], ['SEP 30', 'RENEWAL WINDOW OPENED']],
  'pol-rj': [['5 HRS AGO', 'CLIENT UPLOADED A RENEWAL']],
  'pol-abc': [['MAR 30, 2026', 'CERTIFICATE 2026–27 ON FILE']],
  'pol-rl': [],
};
const INS_MONTHS = [['NOV', 24], ['DEC', 54], ['JAN', 85], ['FEB', 116], ['MAR', 144], ['APR', 175]];
const INS_SPAN = 186;

const insPol = () => POLICIES[WSX.ins.pol] ?? POLICIES['pol-dh'];
const insPolicies = () => vals(POLICIES).sort((a, b) => a.days - b.days);
const insStatus = (p) => ov(`policy:${p.id}`, p.status);
const insReq = (p) => ov(`ins:req:${p.id}`, p.request);
const insUnits = (p) => p.vehicles.filter((v) => VEHICLES[v]);
const insX = (d) => ((Math.max(0, Math.min(INS_SPAN, d)) / INS_SPAN) * 100).toFixed(2);
const insPick = () => (VP === 'mobile' ? 'ins.open' : 'ins.sel');
const insFirst = (cid) => ACCOUNTS[cid].name.split(' ')[0];
const insTone = (p) => (insStatus(p)[0] === 'QUOTE SENT' ? 'gold' : p.days <= 7 ? 'bad' : p.days <= 60 ? 'gold' : 'calm');
const insShort = (exp) => exp.replace(', 2026', '');
/** A coverage line and its limit, read from the policy title ('AUTO LIABILITY $1M · CARGO $100K'). */
const insLines = (p) => p.title.split(' · ').map((x) => {
  const m = /^(.*?) (\$[\d.,]+[KM]?)$/.exec(x);
  return m ? [m[1], m[2]] : [x, null];
});
/** What is missing on a policy, from the records themselves. */
function insMissing(p) {
  const c = ACCOUNTS[p.client];
  const st = insStatus(p)[0];
  const out = [];
  if (p.days <= 7 && st !== 'QUOTE SENT') out.push({ t: 'RENEWAL QUOTE NOT SENT', s: `EXPIRES IN ${p.days} DAYS`, tone: 'bad' });
  if (/NEEDS STAFF REVIEW/.test(p.renewal) && st !== 'REVIEWED') out.push({ t: 'RENEWAL UPLOAD NOT REVIEWED', s: 'THE CLIENT SENT IT 5 HRS AGO', tone: 'warn' });
  const n = insUnits(p).length;
  if (n < c.trucks) out.push({ t: n ? `${c.trucks - n} OF ${c.trucks} POWER UNITS NOT LINKED` : 'NO INSURED UNITS LINKED', s: n ? `${n} ON THIS POLICY` : `${c.trucks} POWER UNITS ON FILE`, tone: n ? 'warn' : 'bad', act: ['units', 'REQUEST TRUCK LIST', 'ASKS THE CLIENT TO CONFIRM WHICH POWER UNITS THE POLICY COVERS.'] });
  if (!p.docs.some((d) => /CERTIFICATE/.test(DOCS[d]?.title ?? ''))) out.push({ t: 'NO CERTIFICATE OF INSURANCE', s: 'NOT ON FILE', tone: 'warn', act: ['coi', 'REQUEST CERTIFICATE', 'ASKS THE CLIENT’S AGENT FOR A CURRENT CERTIFICATE OF INSURANCE.'] });
  return out;
}
/** What is missing on an intake request (SAMPLE). */
function insNeeds(r) {
  if (r.lead) return [{ t: 'FIRST CONVERSATION', s: `FOLLOW-UP WAS DUE ${LEADS[r.lead].follow}`, tone: 'bad' }, { t: 'NOT A CLIENT YET', s: 'NO COMPANY RECORD', tone: 'mute' }];
  const c = ACCOUNTS[r.client];
  const units = vals(VEHICLES).filter((v) => v.client === r.client).length;
  const drivers = vals(DRIVERS).filter((d) => d.client === r.client).length;
  const asked = WSX.over[`ins:intake:${r.id}`];
  return [
    { t: 'DECLARATIONS PAGE · CURRENT POLICY', s: asked ? 'REQUESTED' : 'NOT RECEIVED', tone: asked ? 'gold' : 'bad' },
    { t: `POWER UNITS · ${units} OF ${c.trucks} ON FILE`, s: 'TRUCK LIST INCOMPLETE', tone: 'warn' },
    { t: 'LOSS RUNS · LAST 3 YEARS', s: asked ? 'REQUESTED' : 'NOT RECEIVED', tone: asked ? 'gold' : 'bad' },
    { t: `DRIVERS · ${drivers} ON FILE`, s: 'ON FILE', tone: 'ok' },
  ];
}
const insIntakeStatus = (r) => ov(`ins:intake:${r.id}`, r.status);
const insIntakeName = (r) => (r.lead ? LEADS[r.lead].name : clientName(r.client));
const insMark = (r) => (r.lead ? `<span class="badge badge--pre">${LEADS[r.lead].name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>` : badge(ACCOUNTS[r.client]));

/* ── the stage: the renewal runway — each policy's coverage left, today to its expiry ── */
function insRunway() {
  const big = WSX.ins.sec === 'renewals' && VP !== 'mobile';
  const compact = VP === 'mobile';
  const sel = WSX.ins.sel;
  const lanes = insPolicies().map((p) => {
    const tone = insTone(p);
    const on = sel === `policy:${p.id}`;
    const c = ACCOUNTS[p.client];
    const end = `<span class="ins-ln__end ${p.days > 110 ? 'ins-ln__end--l' : ''}" style="left:${insX(p.days)}%"><b>${insShort(p.exp)}</b><small>${daysWord(p.days)}</small></span>`;
    const win = p.id === 'pol-abc' ? `<i class="ins-ln__win" style="left:${insX(114)}%"></i>` : '';
    const id = compact ? `<span class="ins-ln__id">${badge(c)}</span>` : `<span class="ins-ln__id">${badge(c)}<span><b>${c.name}</b><small>${p.title}</small>${big ? `<em>${p.partner} · ${staffName(p.owner)}</em>` : ''}</span></span>`;
    const miss = insMissing(p);
    const note = big ? `<span class="ins-ln__note">${sw(insStatus(p))}<span>${insStatus(p)[0] === 'QUOTE SENT' ? 'QUOTE SENT · THE CLIENT DECIDES WITH THE PARTNER' : p.renewal}</span></span><span class="ins-ln__miss">${miss.map((m) => `<span class="ins-chip ins-chip--${m.tone}">${m.t}</span>`).join('') || '<span class="ins-chip ins-chip--ok">NOTHING MISSING</span>'}</span>` : '';
    return `<button type="button" class="ins-ln ins-ln--${tone} ${on ? 'is-sel' : ''}" data-a="${insPick()}" data-v="policy:${p.id}" aria-pressed="${on}" title="${c.name} · ${p.title} · EXPIRES ${p.exp}">${id}<span class="ins-ln__t"><span class="ins-ln__run"><i class="ins-ln__bar" style="width:${insX(p.days)}%"></i>${win}${end}</span>${note}</span></button>`;
  }).join('');
  const months = INS_MONTHS.map(([m, d]) => `<span class="ins-rw__m" style="left:${insX(d)}%">${m}</span>`).join('');
  const guides = [30, 60, 90].map((d) => `<i class="ins-rw__g" style="left:${insX(d)}%"></i>`).join('');
  return `<section class="ins-stage ${big ? 'ins-stage--big' : ''} ${compact ? 'ins-stage--c' : ''}">
    <header class="ins-stage__h"><span><small>RENEWAL RUNWAY</small><b>COVERAGE LEFT · TODAY TO EXPIRY</b></span><span class="ins-stage__k"><i class="ins-k ins-k--bad"></i>7 DAYS<i class="ins-k ins-k--gold"></i>60 DAYS<i class="ins-k ins-k--calm"></i>LATER</span></header>
    <div class="ins-rw">
      <div class="ins-rw__head">${months}</div>
      <div class="ins-rw__plot"><div class="ins-rw__over" aria-hidden="true"><i class="ins-rw__now"></i><i class="ins-rw__zone" style="width:${insX(30)}%"></i>${guides}${INS_MONTHS.map(([, d]) => `<i class="ins-rw__mt" style="left:${insX(d)}%"></i>`).join('')}</div>${lanes}</div>
      <div class="ins-rw__axis"><span class="ins-rw__today">TODAY · OCT 8</span><span class="ins-rw__span">${INS_SPAN} DAYS AHEAD</span></div>
    </div>
    ${big ? `<div class="ins-stage__foot">${ntb('<b>REFERRAL AND ASSISTANCE ONLY.</b> AIO HELPS CLIENTS RENEW WITH THEIR AGENCY — NOTHING IS BOUND.')}</div>` : ''}
  </section>`;
}

/* ── POLICIES: who is covered, by what, and which trucks ── */
function insTruck(vid) {
  const v = VEHICLES[vid];
  const a = vAvail(v);
  return `<button type="button" class="ins-trk" data-a="go" data-v="fleet:${vid}:insurance" title="${v.unit} · ${v.ymm} · ${a[0]} · OPEN IN FLEET" aria-label="${v.unit} · open in Fleet"><svg viewBox="0 0 500 210" aria-hidden="true">${truckShape(FLEET_META[vid].cab)}</svg><b>${v.unit}</b><i class="pip pip--${a[1]}"></i></button>`;
}
function insGap(p) {
  const c = ACCOUNTS[p.client];
  const n = insUnits(p).length;
  if (n >= c.trucks) return '';
  return `<span class="ins-trk ins-trk--miss ${n ? '' : 'ins-trk--none'}" title="${n ? `${c.trucks - n} OF ${c.trucks} POWER UNITS ARE NOT LINKED TO THIS POLICY` : `NO INSURED UNITS LINKED · ${c.trucks} POWER UNITS ON FILE`}">${n ? `+${c.trucks - n} NOT LINKED` : `NO UNITS LINKED · ${c.trucks} ON FILE`}</span>`;
}
function insChain(p) {
  const c = ACCOUNTS[p.client];
  const on = WSX.ins.sel === `policy:${p.id}`;
  const st = insStatus(p);
  return `<div class="ins-ch ${on ? 'is-sel' : ''}" data-key="ch:${p.id}">
    <button type="button" class="ins-ch__sel" data-a="${insPick()}" data-v="policy:${p.id}" aria-pressed="${on}" title="${c.name} · ${p.title} · ${p.partner}">
      <span class="ins-nd ins-nd--c">${badge(c)}<span><b>${c.name}</b><small>${c.dot} · ${c.state}</small></span></span>
      <i class="ins-wire" aria-hidden="true"></i>
      <span class="ins-nd ins-nd--p"><span class="ins-nd__i">${ico('umbrella')}</span><span><b>${p.title}</b>${sw([st[0] === 'EXPIRING SOON' ? `EXPIRES ${insShort(p.exp)}` : st[0], st[1]])}</span></span>
    </button>
    <i class="ins-wire ins-wire--u" aria-hidden="true"></i>
    <span class="ins-units">${insUnits(p).map(insTruck).join('')}${insGap(p)}</span>
  </div>`;
}
function insMap() {
  const pols = insPolicies();
  const units = pols.reduce((n, p) => n + insUnits(p).length, 0);
  const outside = vals(ACCOUNTS).filter((c) => c.life === 'ACTIVE' && !pols.some((p) => p.client === c.id));
  const outChains = WSX.device === 'wide' ? outside.map((c) => {
    const vs = vals(VEHICLES).filter((v) => v.client === c.id);
    return `<div class="ins-ch ins-ch--out" data-key="ch:${c.id}"><button type="button" class="ins-ch__sel" data-a="go" data-v="client:${c.id}" title="${c.name} · NO POLICY WITH AIO · OPEN IN CLIENT 360"><span class="ins-nd ins-nd--c">${badge(c)}<span><b>${c.name}</b><small>${c.dot} · ${c.state}</small></span></span><i class="ins-wire" aria-hidden="true"></i><span class="ins-nd ins-nd--none"><span class="ins-nd__i">${ico('umbrella')}</span><span><b>NO POLICY WITH AIO</b><small>INSURED OUTSIDE AIO</small></span></span></button><i class="ins-wire ins-wire--u" aria-hidden="true"></i><span class="ins-units">${vs.map((v) => insTruck(v.id)).join('')}<span class="ins-trk ins-trk--miss ins-trk--quiet">${c.trucks} POWER UNITS</span></span></div>`;
  }).join('') : '';
  const out = outside.length && WSX.device !== 'wide' ? `<div class="ins-out"><span class="ins-out__l">INSURED OUTSIDE AIO</span>${outside.map((c) => `<button type="button" class="ins-out__c" data-a="go" data-v="client:${c.id}" title="${c.name} · NO POLICY WITH AIO · OPEN IN CLIENT 360">${badge(c)}<b>${c.name}</b><small>${vals(VEHICLES).filter((v) => v.client === c.id).length} TRUCKS</small></button>`).join('')}</div>` : '';
  const head = VP === 'desktop' ? `<div class="ins-map__cols"><span class="ins-map__cp"><span>CLIENT</span><i></i><span>POLICY</span></span><i></i><span>INSURED TRUCKS</span></div>` : '';
  return rgn('COVERAGE', `${pols.length} POLICIES · ${units} INSURED UNITS`, '', `${head}<div class="ins-map" data-swap="map">${pols.map(insChain).join('')}${outChains}</div>${out}`, 'ins-maprg', 'ins-map');
}

/* ── RENEWALS on a phone: the policies by how soon they end ── */
function insRenewList() {
  const groups = [['NEXT 7 DAYS', (p) => p.days <= 7], ['NEXT 60 DAYS', (p) => p.days > 7 && p.days <= 60], ['LATER', (p) => p.days > 60]];
  const body = groups.map(([label, f]) => {
    const list = insPolicies().filter(f);
    if (!list.length) return '';
    return `<div class="grp"><span>${label}</span><span>${list.length}</span></div>${list.map((p) => `<div class="pk ins-rn ${WSX.ins.sel === `policy:${p.id}` ? 'is-sel' : ''}" data-a="${insPick()}" data-v="policy:${p.id}" title="${clientName(p.client)} · ${p.renewal}"><span class="ins-cd ins-cd--${insTone(p)}"><b>${p.days}</b><small>DAYS</small></span><span class="ins-rn__t"><b class="pk__t">${clientName(p.client)}</b><span class="pk__s">${p.renewal}</span></span></div>`).join('')}`;
  }).join('');
  return rgn('RENEWALS', `${insPolicies().length}`, '', `<div data-swap="t:renew">${body}</div><div class="ins-pad">${ntb('<b>REFERRAL AND ASSISTANCE ONLY.</b> NOTHING IS BOUND.')}</div>`, 'ins-sec', 'ins-sec');
}

/* ── QUOTES: renewals and new requests moving NEW → INTERNAL REVIEW → CUSTOMER REVIEW → COMPLETED ── */
function insTrack(word) {
  const i = Math.max(0, INS_TRACK.indexOf(word));
  return `<span class="ins-tr">${INS_TRACK.map((t, j) => `<span class="ins-tr__s ${j < i ? 'd' : j === i ? 'n' : ''}"><i></i><small>${t}</small></span>`).join('')}</span>`;
}
function insQuotes() {
  const pols = insPolicies().filter((p) => /QUOTE|REVIEW/.test(`${p.renewal} ${insReq(p)[0]}`) && insReq(p)[0] !== 'COMPLETED');
  const rows = [
    ...pols.map((p) => {
      const on = WSX.ins.sel === `policy:${p.id}`;
      return `<div class="pk ins-q ${on ? 'is-sel' : ''}" data-a="${insPick()}" data-v="policy:${p.id}" title="${clientName(p.client)} · ${p.renewal}">${badge(ACCOUNTS[p.client])}<span class="ins-q__t"><b class="pk__t">${clientName(p.client)}</b><span class="pk__s">RENEWAL · ${p.title}</span><span class="pk__s">${p.partner} · EXPIRES ${insShort(p.exp)}</span></span>${insTrack(insReq(p)[0])}<span class="ins-q__s">${sw(insStatus(p))}</span></div>`;
    }),
    ...vals(INS_INTAKE).filter((r) => !r.lead).map((r) => {
      const on = WSX.ins.sel === `intake:${r.id}`;
      return `<div class="pk ins-q ${on ? 'is-sel' : ''}" data-a="${insPick()}" data-v="intake:${r.id}" title="${insIntakeName(r)} · ${r.title}">${insMark(r)}<span class="ins-q__t"><b class="pk__t">${insIntakeName(r)}</b><span class="pk__s">NEW · ${r.ask}</span><span class="pk__s">SAMPLE · RECEIVED ${r.received}</span></span>${insTrack('NEW')}<span class="ins-q__s">${sw(insIntakeStatus(r))}</span></div>`;
    }),
  ];
  return rgn('QUOTES IN PROGRESS', `${rows.length}`, '', `<div data-swap="t:quotes">${rows.join('')}</div><div class="ins-pad">${ntb('QUOTES COME FROM THE PARTNER AGENCY OR THE CLIENT’S AGENT. AIO NEVER BINDS COVERAGE.')}</div>`, 'ins-sec', 'ins-sec');
}

/* ── INTAKE: who asked for coverage help, and what we still need from them ── */
function insIntake() {
  const cards = vals(INS_INTAKE).map((r) => {
    const on = WSX.ins.sel === `intake:${r.id}`;
    const needs = insNeeds(r);
    const open = needs.filter((n) => ['bad', 'warn'].includes(n.tone)).length;
    return `<button type="button" class="ins-in ${on ? 'is-sel' : ''}" data-a="${insPick()}" data-v="intake:${r.id}" aria-pressed="${on}" title="${insIntakeName(r)} · ${r.title}">
      <span class="ins-in__h">${insMark(r)}<span><b>${insIntakeName(r)}</b><small>${r.kind} · ${r.from} · ${r.received}</small></span>${sw(insIntakeStatus(r))}</span>
      <span class="ins-in__ask"><small>ASKED FOR</small><b>${r.ask}</b></span>
      <span class="ins-in__need"><small>${open ? `${open} THINGS STILL NEEDED` : 'NOTHING MISSING'}</small>${needs.map((n) => `<span class="ins-need ins-need--${n.tone}"><i class="pip pip--${n.tone}"></i><b>${n.t}</b></span>`).join('')}</span>
    </button>`;
  }).join('');
  return rgn('INTAKE · NEW COVERAGE REQUESTS', `${vals(INS_INTAKE).length} · SAMPLE`, '', `<div class="ins-ins" data-swap="t:intake">${cards}</div><div class="ins-pad">${ntb('SAMPLE REQUESTS. A CLIENT ASKING FOR COVERAGE HELP STARTS HERE · NO PRICES.')}</div>`, 'ins-sec', 'ins-sec');
}

/* ── the panel: the selected policy, drawn like a certificate ── */
function insCert(p) {
  const c = ACCOUNTS[p.client];
  const st = insStatus(p);
  const units = insUnits(p);
  const docs = p.docs.filter((d) => DOCS[d]);
  return `<div class="ins-cert" data-swap="cert:${p.id}">
    <div class="ins-cert__top"><span class="ins-seal">${ico('umbrella')}</span><span class="ins-cert__h"><small>INSURED · COVERAGE ON FILE</small><b>${c.name}</b><em>${c.dot} · ${c.mc} · ${c.state}</em></span></div>
    <div class="ins-cert__lines"><div class="ins-cert__lh"><span>COVERAGE</span><span>LIMIT</span></div>${insLines(p).map(([k, v]) => `<div class="ins-cert__l"><span>${k}</span><b>${v ?? '<small>NOT STATED</small>'}</b></div>`).join('')}</div>
    <dl class="ins-cert__f">
      <div><dt>PLACED WITH</dt><dd>${p.partner}</dd></div>
      <div><dt>AIO OWNER</dt><dd>${staffName(p.owner)}</dd></div>
      <div><dt>EFFECTIVE</dt><dd class="ins-cert__nr">NOT RECORDED</dd></div>
      <div><dt>EXPIRES</dt><dd class="ins-cert__exp ins-cert__exp--${insTone(p)}">${p.exp}<small>${daysWord(p.days)}</small></dd></div>
    </dl>
    <div class="ins-cert__sec"><div class="sec-l"><span>INSURED UNITS</span><span>${units.length} OF ${c.trucks} POWER UNITS</span></div><div class="ins-cert__units">${units.map(insTruck).join('')}${insGap(p)}</div></div>
    <div class="ins-cert__sec"><div class="sec-l"><span>DOCUMENTS</span><span>${docs.length}</span></div>${docs.map(docChip).join('') || `<div class="ins-nodoc">${ico('folder')}NO DOCUMENT ON FILE</div>`}</div>
    <div class="ins-cert__stamp">${sw(st)}<span>REFERRAL AND ASSISTANCE ONLY · NOTHING IS BOUND</span></div>
  </div>`;
}
function insNext(p) {
  const key = `policy:${p.id}`;
  const st = insStatus(p)[0];
  const name = clientName(p.client);
  if (p.days <= 7 && st !== 'QUOTE SENT') return nextBlock(`SEND THE RENEWAL QUOTE TODAY · EXPIRES ${insShort(p.exp)}`, simBtn(`ins:quote:${p.id}`, { label: 'SEND RENEWAL QUOTE TO THE CLIENT', effect: `SENDS THE RENEWAL SUMMARY TO ${name}’S OFFICE. THE CLIENT DECIDES WITH THE PARTNER AGENCY. AIO NEVER BINDS COVERAGE.`, apply: () => (WSX.over[key] = ['QUOTE SENT', 'gold']), rec: key, primary: true }));
  if (st === 'QUOTE SENT') return nextBlock('QUOTE SENT · THE CLIENT DECIDES WITH THE PARTNER', '', 'calm');
  if (/NEEDS STAFF REVIEW/.test(p.renewal) && st !== 'REVIEWED') return nextBlock('REVIEW THE RENEWAL THE CLIENT UPLOADED', simBtn(`ins:rev:${p.id}`, { label: 'MARK RENEWAL REVIEWED', effect: 'RECORDS STAFF REVIEW OF THE UPLOADED RENEWAL. THE CLIENT’S AGENT KEEPS THE POLICY.', apply: () => (WSX.over[key] = ['REVIEWED', 'ok']), rec: key, primary: true }));
  if (st === 'REVIEWED') return nextBlock('RENEWAL REVIEWED · NOTHING ELSE DUE', '', 'done');
  return nextBlock(p.renewal === 'NO ACTION' ? `NO ACTION · EXPIRES ${p.exp}` : p.renewal, '', 'calm');
}
function insMissBlock(items, rec) {
  if (!items.length) return `<div class="ins-miss ins-miss--ok">${ico('pass')}<b>NOTHING MISSING ON THIS POLICY</b></div>`;
  return `<div class="ins-miss"><div class="sec-l"><span>MISSING INFORMATION</span><span>${items.length}</span></div>${items.map((m) => `<div class="ins-miss__r ins-miss__r--${m.tone}"><i class="pip pip--${m.tone}"></i><span><b>${m.t}</b><small>${m.s}</small></span>${m.act ? simBtn(`ins:${m.act[0]}:${rec}`, { label: m.act[1], effect: m.act[2], apply: () => {}, rec, sm: true }) : ''}</div>`).join('')}</div>`;
}
/** Ultra-wide: the same client across the office — each record opens where it is worked. */
function insAcross(cid) {
  const recs = clRecords(cid).filter((x) => x.type !== 'policy').slice(0, 6);
  if (!recs.length) return '';
  const where = (x) => (x.type === 'deadline' ? `comp:${x.r.id}` : x.type === 'vehicle' ? `fleet:${x.r.id}` : x.type === 'driver' && x.r.vehicle ? `fleet:${x.r.vehicle}:driver` : x.type === 'quarter' && wsById('filing') ? `filing:${x.r.id}` : ['cycle', 'subscription'].includes(x.type) ? `books:${cid}` : `client:${cid}`);
  return `<div class="ins-across"><div class="sec-l"><span>${ACCOUNTS[cid].name} ACROSS AIO</span><span>${recs.length}</span></div>${recs.map((x) => `<button type="button" class="ins-across__r" data-a="go" data-v="${where(x)}" title="${RECORD_TYPES[x.type].title(x.r)} · ${OWNER_LABEL[x.type]}">${ico(OWNER_ICON[x.type])}<span><b>${RECORD_TYPES[x.type].title(x.r)}</b><small>${OWNER_LABEL[x.type]}</small></span>${x.s ? sw(x.s) : ''}</button>`).join('')}</div>`;
}
function insPolicyPanel(p) {
  const key = `policy:${p.id}`;
  const c = ACCOUNTS[p.client];
  const th = vals(THREADS).find((t) => t.client === p.client);
  const said = th?.msgs.filter(([k]) => k === 'client').pop();
  const note = said ? `<div class="ins-note"><small>${said[1]} · ${said[3]}</small><span>${said[2]}</span></div>` : '';
  const dl = vals(DUES).find((d) => d.links.includes(key));
  const links = `<div class="ins-links">${dl ? `<button type="button" class="wbtn wbtn--sm" data-a="go" data-v="comp:${dl.id}">${ico('shield-check')}COMPLIANCE · ${insShort(dl.due)}</button>` : ''}<button type="button" class="wbtn wbtn--sm" data-a="go" data-v="client:${p.client}:insurance">${ico('company')}CLIENT 360</button></div>`;
  const track = `<div class="ins-reqtr"><div class="sec-l"><span>RENEWAL REQUEST</span><span>${insReq(p)[0]}</span></div>${insTrack(insReq(p)[0])}</div>`;
  const two = WSX.device === 'wide' || (VP === 'tablet' && WSX.ins.sec === 'renewals');
  const side = `${insNext(p)}${note}${track}${insMissBlock(insMissing(p), key)}${links}${mhist(key, INS_HIST[p.id] ?? [])}${WSX.device === 'wide' ? insAcross(p.client) : ''}`;
  const body = two ? `<div class="ins-cols"><div class="ins-colx">${insCert(p)}</div><div class="ins-colx">${side}</div></div>` : `${insNext(p)}${note}${insCert(p)}${insMissBlock(insMissing(p), key)}${track}${links}${mhist(key, INS_HIST[p.id] ?? [])}`;
  return `<section class="rg cx ins-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${p.id}"><div class="cx__crumb"><span>INSURANCE</span>${ico('fwd')}<span>POLICY</span>${ico('fwd')}<span>${c.name}</span></div><h2 class="cx__t">${p.title}</h2></div></header><div class="cx__b" data-keep="ins-cx" data-swap="b:${p.id}">${body}</div></section>`;
}
function insIntakePanel(r) {
  const key = `intake:${r.id}`;
  const name = insIntakeName(r);
  const asked = WSX.over[`ins:intake:${r.id}`];
  const next = r.lead
    ? nextBlock(`CALL ${name} · FOLLOW-UP WAS DUE ${LEADS[r.lead].follow}`, simBtn(`ins:lead:${r.id}`, { label: 'LOG THE FOLLOW-UP CALL', effect: 'RECORDS THE CALL ON THE LEAD IN GROWTH / CRM.', apply: () => (WSX.over[`ins:intake:${r.id}`] = ['CONTACTED', 'gold']), rec: key, primary: true }))
    : asked ? nextBlock('DOCUMENTS REQUESTED · WAITING ON THE CLIENT', '', 'calm') : nextBlock(`ASK ${name} FOR THE DECLARATIONS PAGE AND LOSS RUNS`, simBtn(`ins:docs:${r.id}`, { label: 'REQUEST DOCUMENTS', effect: `ASKS ${name} TO UPLOAD THE DECLARATIONS PAGE AND LOSS RUNS IN THEIR OFFICE.`, apply: () => (WSX.over[`ins:intake:${r.id}`] = ['INFORMATION REQUESTED', 'gold']), rec: key, primary: true }));
  const plate = `<div class="ins-req" data-swap="req:${r.id}">${insMark(r)}<span class="ins-req__t"><small>${r.kind} · SAMPLE</small><b>${name}</b><em>RECEIVED ${r.received} · ${r.from}</em></span>${sw(insIntakeStatus(r))}</div>`;
  const f = r.lead ? [['ASKED FOR', r.ask], ['SOURCE', LEADS[r.lead].source], ['FOLLOW-UP', LEADS[r.lead].follow, 'OVERDUE'], ['OWNER', 'UNASSIGNED']] : [['ASKED FOR', r.ask], ['COMPANY', ACCOUNTS[r.client].dot, `${ACCOUNTS[r.client].trucks} POWER UNITS`], ['INSURED TODAY', 'OUTSIDE AIO'], ['OWNER', staffName(r.owner)]];
  const go = r.lead ? '' : `<div class="ins-links"><button type="button" class="wbtn wbtn--sm" data-a="go" data-v="client:${r.client}">${ico('company')}CLIENT 360</button></div>`;
  const miss = `<div class="ins-miss"><div class="sec-l"><span>STILL NEEDED</span><span>${insNeeds(r).filter((n) => ['bad', 'warn', 'gold'].includes(n.tone)).length}</span></div>${insNeeds(r).map((n) => `<div class="ins-miss__r ins-miss__r--${n.tone}"><i class="pip pip--${n.tone}"></i><span><b>${n.t}</b><small>${n.s}</small></span></div>`).join('')}</div>`;
  return `<section class="rg cx ins-cx"><header class="cx__h"><div class="cx__hd" data-swap="hd:${r.id}"><div class="cx__crumb"><span>INSURANCE</span>${ico('fwd')}<span>INTAKE</span>${ico('fwd')}<span>${name}</span></div><h2 class="cx__t">${r.title}</h2></div></header><div class="cx__b" data-keep="ins-cx" data-swap="b:${r.id}">${next}${plate}${miss}${facts(f)}${go}${mhist(key, r.hist)}${ntb('SAMPLE REQUEST · NO PREMIUMS OR PRICES ARE SHOWN')}</div></section>`;
}
function insPanel() {
  const [type, id] = WSX.ins.sel.split(':');
  if (type === 'intake' && INS_INTAKE[id]) return insIntakePanel(INS_INTAKE[id]);
  return insPolicyPanel(insPol());
}

function insBar() {
  const pols = insPolicies();
  const next = pols.find((p) => insStatus(p)[0] !== 'QUOTE SENT') ?? pols[0];
  const missing = pols.filter((p) => insMissing(p).length).length;
  const review = pols.filter((p) => /REVIEW/.test(insReq(p)[0])).length;
  const units = pols.reduce((n, p) => n + insUnits(p).length, 0);
  const s = WSX.ins.sec;
  if (VP === 'mobile') return wsBar('07 · WORK', 'INSURANCE', [ro(pols.length, 'POLICIES'), ro(`${next.days}D`, 'NEXT EXPIRY', { tone: next.days <= 7 ? 'bad' : 'gold' }), ro(missing, 'MISSING INFO', { tone: missing ? 'warn' : '' })].join(''));
  const r = [ro(pols.length, 'POLICIES', { a: 'ins.sec', v: 'policies', on: s === 'policies' }), ro(`${next.days} DAYS`, 'NEXT EXPIRY', { tone: next.days <= 7 ? 'bad' : 'gold', a: 'ins.sec', v: 'renewals', on: s === 'renewals' }), ro(review, 'IN REVIEW', { a: 'ins.sec', v: 'quotes', on: s === 'quotes' }), ro(missing, 'MISSING INFORMATION', { tone: missing ? 'warn' : '' }), ro(units, 'INSURED UNITS'), ro(vals(INS_INTAKE).length, 'INTAKE', { a: 'ins.sec', v: 'intake', on: s === 'intake' })];
  return wsBar('07 · WORK', 'INSURANCE', (VP === 'tablet' ? r.slice(0, 4) : r).join(''), VP === 'tablet' ? '' : `<span class="design-pill">REFERRAL ONLY · NOTHING IS BOUND</span>`);
}
function insSecs() {
  const n = { intake: vals(INS_INTAKE).length, quotes: insPolicies().filter((p) => /QUOTE|REVIEW/.test(`${p.renewal} ${insReq(p)[0]}`) && insReq(p)[0] !== 'COMPLETED').length + 1, policies: insPolicies().length, renewals: insPolicies().length };
  return seg(INS_SECS.map(([id, l]) => [id, l, VP === 'mobile' ? null : n[id]]), WSX.ins.sec, 'ins.sec', VP === 'mobile' ? 'wseg--fit' : '');
}
function insSection() {
  const s = WSX.ins.sec;
  if (s === 'intake') return insIntake();
  if (s === 'quotes') return insQuotes();
  if (s === 'renewals') return VP === 'mobile' ? insRenewList() : '';
  return insMap();
}

/* ── compositions ── */
function insView() {
  const big = WSX.ins.sec === 'renewals';
  if (VP === 'mobile') return `<div class="ws ins ins--m">${insBar()}${insSecs()}${insRunway()}${insSection()}</div>${phoneSheet(insPanel(), { label: 'Policy' })}`;
  if (VP === 'tablet') return big ? `<div class="ws ins ins--t ins--big">${insBar()}${insSecs()}${insRunway()}${insPanel()}</div>` : `<div class="ws ins ins--t">${insBar()}${insSecs()}${insRunway()}<div class="ins-t2">${insSection()}${insPanel()}</div></div>`;
  return `<div class="ws ins">${insBar()}<div class="ins-grid"><div class="ins-main ${big ? 'ins-main--big' : ''}">${insSecs()}${insRunway()}${insSection()}</div>${insPanel()}</div></div>`;
}

/* ── actions ── */
ACT['ins.sel'] = (key) => {
  const [type, id] = String(key).split(':');
  if (type === 'policy' && POLICIES[id]) WSX.ins.pol = id;
  else if (!(type === 'intake' && INS_INTAKE[id])) return;
  WSX.ins.sel = key;
  WSX.pending = null;
};
ACT['ins.open'] = (key) => {
  ACT['ins.sel'](key);
  WSX.sheet = true;
};
ACT['ins.sec'] = (s) => {
  WSX.ins.sec = s;
  WSX.pending = null;
  const [type] = WSX.ins.sel.split(':');
  if (s === 'intake' && type !== 'intake') WSX.ins.sel = 'intake:in-tk';
  if ((s === 'policies' || s === 'renewals') && type !== 'policy') WSX.ins.sel = `policy:${WSX.ins.pol}`;
};

registerWorkspace({
  id: 'ins', no: '07', name: 'INSURANCE', group: 'money', page: 'work', lane: 'insurance', view: () => insView(),
  shape: 'COVERAGE', line: 'WHO IS COVERED, BY WHAT, UNTIL WHEN.',
  states: [['MAIN', []], ['SELECTED', [['ins.sel', 'policy:pol-rj']]], ['DEEPER', [['ins.sel', 'policy:pol-dh'], ['sim.ask', 'ins:quote:pol-dh']]], ['PHONE', [['ins.open', 'policy:pol-dh']], 'phone']],
  demos: [
    ['SEND THE DELTA RENEWAL', [['ins.sec', 'renewals', 'THE RENEWAL RUNWAY'], ['ins.sel', 'policy:pol-dh', 'DELTA HAULING · 6 DAYS'], ['sim.ask', 'ins:quote:pol-dh', 'SEND THE RENEWAL QUOTE'], ['sim.ok', 'ins:quote:pol-dh', 'CONFIRM · SIMULATED']]],
    ['FOLLOW A POLICY TO ITS TRUCK', [['ins.sec', 'policies', 'COVERAGE'], ['ins.sel', 'policy:pol-abc', 'ABC · TWO INSURED UNITS'], ['go', 'fleet:v-abc-1:insurance', 'UNIT 1 IN FLEET'], ['ret', '', 'BACK TO THE POLICY']]],
    ['INTAKE TO QUOTE', [['ins.sec', 'intake', 'NEW REQUESTS'], ['ins.sel', 'intake:in-tk', 'T&K · QUOTE REQUEST'], ['ins.sec', 'quotes', 'QUOTES IN PROGRESS']]],
  ],
  audit: [[['ins.sec', 'intake']], [['ins.sec', 'quotes']], [['ins.sec', 'renewals']], [['ins.sel', 'policy:pol-abc']], [['ins.sel', 'policy:pol-rl']], [['ins.sec', 'intake'], ['ins.sel', 'intake:in-pw']], [['ins.sel', 'policy:pol-dh'], ['sim.ask', 'ins:quote:pol-dh'], ['sim.ok', 'ins:quote:pol-dh']], [['ins.sel', 'policy:pol-rj'], ['sim.ask', 'ins:units:policy:pol-rj']]],
  phoneAct: { 'ins.sel': 'ins.open' },
  enter: (a, b) => {
    const p = POLICIES[a] ?? (ACCOUNTS[a] && vals(POLICIES).find((x) => x.client === a));
    if (p) Object.assign(WSX.ins, { pol: p.id, sel: `policy:${p.id}`, sec: INS_SECS.some(([s]) => s === b) ? b : 'policies' });
  },
  label: () => (WSX.ins.sel.startsWith('intake:') ? 'INSURANCE INTAKE' : `${insFirst(insPol().client)} POLICY`),
  route: (s, client) => {
    if (s[0] === 'work' && s[1] === 'insurance') {
      const p = client && vals(POLICIES).find((x) => x.client === client);
      const sec = INS_SECS.some(([x]) => x === s[2]) ? s[2] : 'policies';
      Object.assign(WSX.ins, { sec, ...(p ? { pol: p.id, sel: `policy:${p.id}` } : {}) });
      if (sec === 'intake') WSX.ins.sel = 'intake:in-tk';
      return true;
    }
    if (s[0] === 'rec' && s[1] === 'policy' && POLICIES[s[2]]) return Object.assign(WSX.ins, { pol: s[2], sel: `policy:${s[2]}`, sec: 'policies' }), true;
    return false;
  },
});
