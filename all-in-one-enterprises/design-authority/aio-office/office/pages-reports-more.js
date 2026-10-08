/*
 * AIO OFFICE unified review — REPORTS (the ten domains beyond the approved overview) and MORE (eleven destinations and
 * their child pages). Reports show only figures the sample records can back — counts of records — and say NOT CONNECTED
 * YET where the product cannot supply a figure. No live financial result is invented: the founder's finance figures are
 * the approved root's labelled sample and sums of sample invoices, marked as such. Access follows the role: staff without
 * a reports grant see the lock; FINANCIAL / REVENUE and BILLING are founder / finance only; staff never see grant controls.
 */
const REPORT_AREA = (slug) => AREAS.find((a) => slugify(a[0]) === slug);
const fig = (l, v, s, go = '', locked = false) => `<div class="panel fig ${locked ? 'fig--locked' : ''}" ${go ? `data-go="${go}"` : ''}><span class="fig__l">${l}</span><span class="fig__v">${v}</span><span class="fig__s">${s}</span></div>`;
const figNone = (l, s) => `<div class="panel fig"><span class="fig__l">${l}</span><span class="fig__v" style="font-size:15px;line-height:1.2;color:#8a8275">NOT CONNECTED YET</span><span class="fig__s">${s}</span></div>`;

function reportsPage(r) {
  const slug = r.seg[1];
  const area = REPORT_AREA(slug);
  if (!area) return missing(r);
  studioSet({ area: area[0] });
  const title = area[0];
  if (ROLE === 'staff') {
    meta(`REPORTS › ${title}`, 'APPROVED ROOT', 'LIVE: PARTIAL — REPORTS ARE GRANTED BY ROLE', 'The approved staff lock: staff without a reports grant never see figures.');
    return `<main class="main">${reportsBand()}<div class="${VP === 'desktop' ? 'measure ' : ''}after-band">${reportsNoAccess()}</div></main>`;
  }
  if (area[4] === 'finance' && !FOUNDER) {
    meta(`REPORTS › ${title}`, 'NEW · FOR REVIEW', 'LIVE: FOUNDER · FINANCE ONLY');
    return `<main class="main">${pageHead({ trail: [['REPORTS', 'reports'], [title]], title })}${permissionPage('FINANCIAL / REVENUE', 'FINANCE ACCESS', 'reports')}</main>`;
  }
  const D = REPORT_DOMAINS[slug](r);
  meta(`REPORTS › ${title}`, D.honest ? 'HONEST STATE' : 'NEW · FOR REVIEW', `LIVE: ${area[2][0]}`, D.note || '');
  const head = pageHead({
    trail: [['REPORTS', 'reports'], [title]],
    title,
    sub: D.sub,
    chips: [area[2], ['SAMPLE', 'mute']],
    actions: `<span class="select" data-act="period">${APP.period} ${ico('down')}</span>${D.csv === false ? `<span class="btn btn--ghost" aria-disabled="true">CSV LATER</span>` : `<span class="btn" data-sim="csv-${slug}" data-label="EXPORT ${title} CSV" data-effect="DOWNLOAD THE ROWS ON THIS PAGE AS CSV, FOR THE CHOSEN PERIOD. EVERY EXPORT IS LOGGED.">${ico('download')}EXPORT CSV</span>`}<span class="btn btn--ghost" aria-disabled="true">PDF LATER</span>`,
  });
  const body = `${D.filters ? filterChips(D.filters, r.filter || 'all', `reports/${slug}`) : ''}
    ${D.figs ? `<div class="figs" style="grid-template-columns:repeat(${VP === 'mobile' ? 2 : Math.min(4, D.figs.length)},minmax(0,1fr))">${D.figs.join('')}</div>` : ''}
    ${D.detail ? section(D.detailTitle || 'DETAIL', D.detailSub || 'EACH ROW OPENS ITS RECORD.', D.detail) : ''}
    ${D.extra || ''}
    ${section('HISTORY', 'HOW THIS AREA CHANGED OVER TIME.', D.history || `<div class="panel empty"><div class="empty__frame"><span>NOT CONNECTED YET</span></div><div class="empty__t">NO TRENDS UNTIL STATUS HISTORY IS READ FROM THE LIVE RECORDS. NO PERCENTAGES OR ESTIMATES UNTIL THEN.</div></div>`)}`;
  if (VP === 'desktop') {
    return `<main class="main">${head}<div style="display:grid;grid-template-columns:${WIDE ? 300 : 250}px minmax(0,1fr);gap:16px;align-items:start;margin-top:12px"><aside>${areasList()}</aside><div class="stack">${body}</div></div></main>`;
  }
  return `<main class="main">${head}${VP === 'tablet' ? `<div class="panel" style="padding:12px;margin-top:12px">${areasSelector()}</div>` : ''}<div class="stack" style="margin-top:12px">${body}</div>${VP === 'mobile' ? section('OTHER AREAS', '', areasList()) : ''}</main>`;
}

const REPORT_DOMAINS = {
  clients(r) {
    const all = vals(ACCOUNTS);
    const by = (l) => all.filter((c) => c.life === l).length;
    const list = all.filter((c) => !r.filter || slugify(c.life) === r.filter);
    return {
      sub: 'WHO IS A CLIENT, BY THE ACTIVE-CLIENT RULE. PREBUILT AND INVITED NEVER COUNT AS ACTIVE.',
      filters: [['all', 'ALL', all.length], ['active', 'ACTIVE', by('ACTIVE')], ['prebuilt', 'PREBUILT', by('PREBUILT')], ['invited', 'INVITED', by('INVITED')]],
      figs: [fig('ACTIVE CLIENTS', by('ACTIVE'), 'CONFIRMED BY THE CLIENT'), fig('PREBUILT', by('PREBUILT'), 'PREPARED · NOT ACTIVE', 'intake/prebuilt'), fig('AWAITING CONFIRMATION', by('INVITED'), 'INVITED', 'intake/activation'), figNone('NEW THIS PERIOD', 'NEEDS READABLE ACTIVATION DATES')],
      detail: rows(list.map((c) => ({ go: `client/${c.id}`, lead: badge(c), title: c.name, sub: `${c.lanes.length} SERVICES · ${c.trucks} TRUCKS`, meta: c.state, status: LIFE[c.life] }))),
      note: 'Sample review figures count the review’s sample clients; the approved root’s 48 is its own sample.',
    };
  },
  services() {
    const open = openWorkList();
    return {
      sub: 'ACTIVE WORK BY LANE, AS EACH LANE REPORTS IT.',
      figs: [fig('OPEN WORK', open.length, 'ACROSS CONNECTED LANES', 'work/queue'), fig('BLOCKED OR OVERDUE', open.filter((w) => w.s[1] === 'bad').length, 'NEEDS SOMEONE NOW', 'home/list/blocked'), figNone('TIME TO COMPLETE', 'NEEDS STATUS HISTORY'), fig('PAUSED SERVICES', 1, 'BROKERAGE · ACTIVATION REQUIRED', 'work/brokerage')],
      detailTitle: 'BY LANE',
      detail: serviceBars(),
    };
  },
  financial_revenue() {
    const sum = (f) => vals(INVOICES).filter(f).reduce((n, i) => n + Number(i.amount.replace(/[$,]/g, '')), 0);
    const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    return {
      sub: 'FOUNDER · FINANCE ONLY. COLLECTED MONEY, NEVER ESTIMATED.',
      figs: [fig('COLLECTED REVENUE', '$48,210', 'THE APPROVED ROOT’S SAMPLE FIGURE', '', true), fig('SAMPLE INVOICES PAID', money(sum((i) => i.status[0] === 'PAID')), 'SUM OF SAMPLE INVOICES', 'more/billing', true), fig('PAST DUE', money(sum((i) => i.status[0] === 'PAST DUE')), 'SAMPLE · 1 INVOICE', 'more/billing', true), figNone('REVENUE BY SERVICE', 'NEEDS INVOICE LINES BY SERVICE')],
      detailTitle: 'RECEIVABLES AGING',
      detail: rows(vals(INVOICES).filter((i) => i.status[0] !== 'PAID').map((i) => ({ go: recRoute('invoice', i.id), lead: badge(client(i.client)), title: i.ref, sub: i.what, meta: `${i.amount} · ${i.date}`, status: statusOf('invoice', i, i.status) }))),
      extra: notice('<b>SAMPLE FIGURES.</b> NOTHING HERE IS A REAL TRANSACTION. LIVE FIGURES COME ONLY FROM COLLECTED PAYMENTS — NO PROJECTIONS, MARGINS OR ESTIMATES.', 'gold'),
    };
  },
  filing_history(r) {
    const filed = vals(QUARTERS).filter((q) => ['FILED', 'COMPLETE'].includes(q.bucket[0]));
    const qs = [...new Set(filed.map((q) => q.q))];
    const list = filed.filter((q) => !r.filter || slugify(q.q) === r.filter);
    return {
      honest: true,
      sub: 'FILED QUARTERS, NEWEST FIRST. THE DATA IS READY; THE REPORT VIEW IS NOT BUILT.',
      filters: [['all', 'ALL QUARTERS', filed.length], ...qs.map((q) => [slugify(q), q, filed.filter((x) => x.q === q).length])],
      figs: [fig('QUARTERS FILED', filed.length, 'IN THE SAMPLE'), fig('FILED ON TIME', filed.length, 'BEFORE THE DUE DATE'), figNone('LATE FILINGS', 'NEEDS FILED-ON DATES FROM THE LIVE CASES')],
      detail: rows(list.map((q) => ({ go: recRoute('quarter', q.id), lead: badge(client(q.client)), title: `IFTA ${q.q} · ${clientName(q.client)}`, sub: q.next, status: q.bucket }))),
      extra: stateBlock({ kind: 'notbuilt', title: 'FILING HISTORY REPORT VIEW', body: 'THE IFTA CASES HOLD THE HISTORY. A REPORT VIEW WITH JURISDICTIONS, TAX DUE AND FILED-ON DATES IS NOT BUILT; THIS LIST READS THE CASES DIRECTLY.', fields: ['QUARTER', 'CLIENT', 'JURISDICTIONS', 'TAX DUE', 'FILED ON'] }),
      csv: false,
    };
  },
  compliance(r) {
    const all = vals(DUES);
    const list = all.filter((d) => !r.filter || slugify(d.kind) === r.filter);
    return {
      sub: 'EXPIRATIONS ONLY. SAFETY, AUDITS AND CORRECTIVE WORK ARE NOT CONNECTED.',
      filters: [['all', 'ALL', all.length], ...[...new Set(all.map((d) => d.kind))].map((k) => [slugify(k), k, all.filter((d) => d.kind === k).length])],
      figs: [fig('OVERDUE / BLOCKING', all.filter((d) => d.state[1] === 'bad').length, 'NEEDS ACTION NOW', 'work/compliance/expirations'), fig('DUE IN 30 DAYS', all.filter((d) => d.days >= 0 && d.days <= 30 && d.state[1] !== 'bad').length, 'IN THE WINDOW', 'work/compliance/expirations'), figNone('SAFETY SCORES', 'NO FMCSA SAFETY DATA YET'), figNone('AUDIT OUTCOMES', 'NO AUDIT RECORDS YET')],
      detail: rows(list.map((d) => ({ go: recRoute('deadline', d.id), lead: badge(client(d.client)), title: d.what, sub: clientName(d.client), meta: d.due, status: statusOf('deadline', d, d.state) }))),
    };
  },
  dispatch_brokerage() {
    const L = vals(LOADS);
    return {
      sub: 'DISPATCH LOADS. BROKERAGE IS PAUSED, SO IT HAS NO FIGURES.',
      figs: [fig('LOADS BOOKED', L.length, 'IN THE SAMPLE', 'work/dispatch'), fig('DELIVERED', L.filter((l) => l.col === 'DELIVERED').length, 'INCLUDING POD NEEDED', 'work/dispatch'), fig('EXCEPTIONS', L.filter((l) => l.exception).length, 'OPEN', 'work/dispatch/exceptions'), figNone('ON-TIME RATE', 'NEEDS APPOINTMENT TIMES')],
      detail: rows(L.map((l) => ({ go: recRoute('load', l.id), title: l.ref, sub: l.lane, meta: `${clientName(l.client)} · ${l.delivery}`, status: statusOf('load', l, l.status) }))),
      extra: stateBlock({ kind: 'paused', title: 'BROKERAGE FIGURES', body: 'BROKERAGE IS PAUSED UNTIL BUSINESS ACTIVATION. NO SHIPMENTS, MARGINS OR CARRIER FIGURES ARE REPORTED — DEMO RECORDS NEVER COUNT.' }),
    };
  },
  bookkeeping() {
    return {
      honest: true,
      sub: 'NOT CONNECTED YET. BOOKKEEPING RUNS ON SEED DATA TODAY.',
      figs: [figNone('CLOSES ON TIME', 'NEEDS CLOSE DATES'), figNone('OPEN QUESTIONS', 'NEEDS THE CLOSE RECORDS'), fig('MONTHLY CLIENTS', vals(SUBSCRIPTIONS).length, 'SAMPLE SUBSCRIPTIONS', 'work/bookkeeping')],
      extra: stateBlock({ kind: 'notbuilt', title: 'BOOKKEEPING REPORTS', body: 'CLOSE TIMELINESS, OPEN QUESTIONS AND DELIVERED REPORTS PER CLIENT. THE BOOKKEEPING RECORDS ARE SEED DATA; NOTHING IS REPORTED UNTIL THEY ARE LIVE.', fields: ['CLIENT', 'PERIOD', 'CLOSED ON', 'QUESTIONS', 'DELIVERED'] }),
      csv: false,
    };
  },
  migration(r) {
    const all = vals(MIG_CASES);
    const n = (lifes) => all.filter((m) => lifes.includes(migLife(m))).length;
    const list = all.filter((m) => !r.filter || slugify(migLife(m)) === r.filter);
    return {
      sub: 'MIGRATION CASES BY LIFECYCLE. ONLY CLIENT CONFIRMATION COUNTS AS ACTIVE.',
      filters: [['all', 'ALL', all.length], ...MIG_LIFE.filter(([k]) => all.some((m) => migLife(m) === k)).map(([k, t]) => [slugify(k), t, all.filter((m) => migLife(m) === k).length])],
      figs: [fig('IN PROGRESS', n(['INTAKE_IN_PROGRESS', 'MIGRATION_IN_PROGRESS', 'MIGRATION_REVIEW_REQUIRED']), 'BEING PREPARED', 'intake/status'), fig('PREBUILT', n(['PREBUILT']), 'NOT ACTIVE YET', 'intake/prebuilt'), fig('AWAITING CLIENT', n(['CLIENT_CONFIRMATION_REQUIRED']), 'INVITED', 'intake/activation'), fig('CONFIRMED · ACTIVE', n(['ACTIVE']), 'BY THE CLIENT', 'intake/history')],
      detail: rows(list.map((m) => ({ go: `intake/case/${m.id}`, title: m.name, sub: MIG_BRANCH[m.branch][0], meta: `${m.files} FILES`, status: migStatus(m) }))),
    };
  },
  exports() {
    const X = [
      ['PERIOD SUMMARY', 'CSV · WITH THE OVERVIEW', 'csv', null],
      ['CLIENT LIST', 'CSV · NAMES, LIFECYCLE, SERVICES', 'csv', null],
      ['MIGRATION CASES', 'CSV · BY LIFECYCLE', 'csv', null],
      ['FILING HISTORY', 'CSV · WHEN THE VIEW IS BUILT', 'later', null],
      ['RECEIVABLES AGING', 'CSV · FOUNDER · FINANCE', 'csv', 'finance'],
      ['PDF REPORTS', 'NO PDF RENDERER YET', 'later', null],
    ].filter((x) => FOUNDER || x[3] !== 'finance');
    return {
      sub: 'WHAT CAN LEAVE AIO, BY GRANT. EVERY EXPORT IS LOGGED.',
      csv: false,
      detailTitle: 'AVAILABLE EXPORTS',
      detailSub: 'CSV NOW · PDF LATER.',
      detail: `<div class="panel">${X.map(([t, s, k]) => `<div class="xrow" ${k === 'csv' ? `data-sim="exp-${slugify(t)}" data-label="EXPORT ${t}" data-effect="DOWNLOAD ${t} AS CSV FOR THE CHOSEN PERIOD. THE EXPORT IS LOGGED WITH YOUR NAME."` : 'aria-disabled="true"'}><span class="xrow__t">${t}</span><span class="xrow__s">${s}</span>${st(k === 'csv' ? ['CSV', 'gold'] : ['LATER', 'mute'])}</div>`).join('')}</div>`,
      history: timeline([['OCT 1, 2026', 'PERIOD SUMMARY EXPORTED (SAMPLE)', 'ALEX R.', 'internal']]),
    };
  },
};

/* ═══════════════ MORE ═══════════════ */
const MORE_ALIAS = { documents: 'documents_vault', crm: 'growth_crm', team: 'team_staff', settings: 'system_settings', help: 'help_support', catalog: 'service_catalog', network: 'mechanic_network' };
function morePage(r) {
  const entry = MORE_ALIAS[r.seg[1]] ?? r.seg[1];
  const fn = MORE_PAGES[entry];
  if (!fn) return missing(r);
  return fn(r.seg[2], r);
}
const moreHead = (title, sub, extra = {}) => pageHead({ trail: [['MORE', 'more'], [title]], title, sub, chips: extra.chips || [], actions: extra.actions || '' });
const SOPS = {
  'ifta-close': ['IFTA QUARTER CLOSE', 'FILING & FUEL TAXES', ['COLLECT MILES AND FUEL BY UNIT', 'REVIEW THE WORKSHEET', 'SEND FOR CLIENT APPROVAL', 'FILE MANUALLY WITH THE BASE STATE', 'RECORD THE FILING AND PAYMENT']],
  'mig-intake': ['MIGRATION INTAKE', 'INTAKE', ['CHOOSE THE PATH: EXISTING, NEW OR BULK', 'UPLOAD AND CHECK WHAT AIO READ', 'SETTLE CONFLICTS', 'SEND FOR FOUNDER REVIEW', 'INVITE THE CLIENT — ONLY THEIR CONFIRMATION MAKES THEM ACTIVE']],
  renewal: ['INSURANCE RENEWAL', 'INSURANCE', ['OPEN THE RENEWAL 60 DAYS OUT', 'REQUEST OPTIONS FROM THE AGENCY', 'SEND THE QUOTE SUMMARY TO THE CLIENT', 'CLIENT DECIDES WITH THEIR AGENCY — AIO NEVER BINDS', 'FILE THE NEW CERTIFICATE']],
  oos: ['OUT-OF-SERVICE TRUCK', 'DISPATCH · MAINTENANCE', ['HOLD THE TRUCK IN VEHICLES & FLEET', 'REASSIGN OR CANCEL AFFECTED LOADS', 'OPEN A MAINTENANCE TICKET', 'GET THE CLIENT’S AUTHORIZATION', 'RETURN THE TRUCK TO SERVICE']],
};
const SETTINGS = {
  workflows: ['WORKFLOWS', 'STATUSES, STEPS AND DUE-DATE RULES PER LANE.', true],
  integrations: ['INTEGRATIONS', 'ELD PROVIDERS, EMAIL AND STORAGE CONNECTIONS.', true],
  security: ['SECURITY', 'SIGN-IN RULES, SESSIONS AND THE ACCESS LOG.', true],
  data: ['DATA', 'RETENTION, EXPORTS AND DELETION REQUESTS.', true],
  notifications: ['NOTIFICATIONS', 'WHAT YOU ARE TOLD ABOUT, AND HOW.', false],
};
const MORE_PAGES = {
  clients(child, r) {
    meta('MORE › CLIENTS', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · /office/crm (CLIENT DIRECTORY)');
    const all = vals(ACCOUNTS);
    const list = all.filter((c) => !r.filter || slugify(c.life) === r.filter);
    return `<main class="main">${moreHead('CLIENTS', 'EVERY CLIENT ACCOUNT. EACH OPENS ITS CLIENT 360.', { chips: [['SAMPLE', 'mute']], actions: `<span class="btn btn--sm" data-act="search">${ico('search')}SEARCH</span><span class="btn btn--sm btn--gold" data-go="intake/flow/new/0">${ico('person-plus')}NEW CLIENT FILE</span>` })}
      ${filterChips([['all', 'ALL', all.length], ['active', 'ACTIVE', all.filter((c) => c.life === 'ACTIVE').length], ['prebuilt', 'PREBUILT', all.filter((c) => c.life === 'PREBUILT').length], ['invited', 'INVITED', all.filter((c) => c.life === 'INVITED').length]], r.filter || 'all', 'more/clients')}
      ${rows(list.map((c) => ({ go: `client/${c.id}`, lead: badge(c), title: c.name, sub: `${c.dot} · ${c.mc} · ${c.state}`, meta: c.lanes.map(laneLabel).slice(0, 3).join(' · '), status: LIFE[c.life] })))}
      ${notice('NEW CLIENTS START IN INTAKE. A PREBUILT CLIENT IS LISTED, BUT IS NOT ACTIVE UNTIL THEY CONFIRM.')}</main>`;
  },
  documents_vault(child, r) {
    meta('MORE › DOCUMENTS & VAULT', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · VAULT');
    const all = vals(DOCS).filter((d) => !r.client || d.client === r.client);
    const F = { client: (d) => d.vis === 'client', internal: (d) => d.vis === 'internal', review: (d) => /REVIEW|DRAFT/.test(statusOf('document', d, d.status)[0]), requested: (d) => /REQUESTED/.test(d.status[0]) };
    const list = all.filter((d) => !r.filter || F[r.filter]?.(d));
    return `<main class="main">${moreHead('DOCUMENTS & VAULT', 'CLIENT AND INTERNAL FILES — EACH ONE IS STAFF ONLY OR CLIENT-VISIBLE.', { chips: [['SAMPLE', 'mute']], actions: actionsBar([{ label: 'UPLOAD', sim: 'doc-up', ico: 'upload', effect: 'ADD A FILE TO A CLIENT’S VAULT, ATTACHED TO THE RECORD IT BELONGS TO.' }]) })}
      ${r.client ? ctxBar(r.client) : ''}
      ${filterChips([['all', 'ALL', all.length], ['review', 'NEEDS REVIEW', all.filter(F.review).length], ['requested', 'REQUESTED', all.filter(F.requested).length], ['client', 'CLIENT-VISIBLE', all.filter(F.client).length], ['internal', 'STAFF ONLY', all.filter(F.internal).length]], r.filter || 'all', 'more/documents_vault')}
      ${docRows(list, 'NO DOCUMENTS MATCH')}</main>`;
  },
  messages(child, r) {
    meta('MORE › MESSAGES', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · MESSAGES');
    const all = vals(THREADS);
    const list = all.filter((t) => !r.filter || slugify(statusOf('thread', t, t.status)[0]) === r.filter);
    return `<main class="main">${moreHead('MESSAGES', 'CLIENT CONVERSATIONS AND INTERNAL NOTES.', { chips: [['SAMPLE', 'mute']], actions: actionsBar([{ label: 'NEW MESSAGE', sim: 'msg-new', ico: 'letter', effect: 'START A CONVERSATION WITH A CLIENT.' }]) })}
      ${filterChips([['all', 'ALL', all.length], ['waiting_on_staff', 'WAITING ON US', all.filter((t) => t.status[0] === 'WAITING ON STAFF').length], ['waiting_on_client', 'WAITING ON CLIENT', all.filter((t) => t.status[0] === 'WAITING ON CLIENT').length]], r.filter || 'all', 'more/messages')}
      ${rows(list.map((t) => ({ go: recRoute('thread', t.id), lead: badge(client(t.client)), title: t.subject, sub: `${clientName(t.client)} · ${t.msgs[t.msgs.length - 1][3]}`, status: statusOf('thread', t, t.status) })))}</main>`;
  },
  growth_crm(child, r) {
    meta('MORE › GROWTH / CRM', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · /office/crm — BY GRANT');
    if (!FOUNDER) return `<main class="main">${moreHead('GROWTH / CRM', 'LEADS, PIPELINE AND FOLLOW-UPS.')}${permissionPage('GROWTH / CRM', 'THE CRM GRANT', 'more')}</main>`;
    if (child) {
      const l = LEADS[child];
      if (!l) return missing(r);
      return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['GROWTH / CRM', 'more/growth_crm'], [l.name]], title: l.name, sub: `LEAD · ${l.source}`, chips: [statusOf('lead', l, l.stage), ['SAMPLE', 'mute']] })}
        <div class="split" style="margin-top:14px"><div class="stack">${section('THE LEAD', '', kv([['NEEDS', l.need], ['SOURCE', l.source], ['NEXT FOLLOW-UP', l.follow], ['STAGE', st(statusOf('lead', l, l.stage))]], 2))}${section('HISTORY', '', timeline(histFor(`lead:${l.id}`, [['OCT 6, 2026', 'LEAD CREATED FROM THE WEBSITE FORM', 'AIO', 'internal']])))}</div>
        <aside class="aside">${actionsPanel([{ label: 'LOG A CALL', sim: 'crm-call', ico: 'letter', effect: 'RECORD THE CALL AND SET THE NEXT FOLLOW-UP.', set: `lead:${l.id}=CONTACTED|mute` }, { label: 'SEND A QUOTE', sim: 'crm-quote', founder: true, effect: 'SEND A SERVICE QUOTE FROM BILLING.', set: `lead:${l.id}=QUOTED|ok` }])}
        ${section('WHEN THEY SAY YES', 'A LEAD BECOMES A CLIENT THROUGH INTAKE — NEVER DIRECTLY ACTIVE.', `<span class="btn" data-go="intake/flow/new/0">${ico('person-plus')}START A NEW CLIENT FILE</span>`)}</aside></div></main>`;
    }
    const stages = ['NEW', 'CONTACTED', 'QUOTED', 'FOLLOW-UP OVERDUE'];
    return `<main class="main">${moreHead('GROWTH / CRM', 'LEADS, PIPELINE AND FOLLOW-UPS. FOUNDER AND STAFF WITH THE CRM GRANT.', { chips: [['BY GRANT', 'gold'], ['SAMPLE', 'mute']], actions: actionsBar([{ label: 'NEW LEAD', sim: 'crm-new', ico: 'person-plus', effect: 'ADD A LEAD TO THE PIPELINE.' }]) })}
      <div class="board" style="--cols:4;margin-top:12px">${stages.map((s) => {
        const xs = vals(LEADS).filter((l) => statusOf('lead', l, l.stage)[0] === s);
        return `<div class="col"><div class="col__h">${s}<i>${xs.length}</i></div>${xs.map((l) => `<div class="card" data-go="more/growth_crm/${l.id}"><b>${l.name}</b><small>${l.need}</small><div class="card__m">${st(statusOf('lead', l, l.stage))}<span>FOLLOW-UP ${l.follow}</span></div></div>`).join('') || '<small class="muted">NOTHING HERE</small>'}</div>`;
      }).join('')}</div></main>`;
  },
  billing(child, r) {
    meta('MORE › BILLING', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · /office/billing · /office/invoices — FOUNDER / BILLING GRANT');
    if (!FOUNDER) return `<main class="main">${moreHead('BILLING', 'QUOTES, INVOICES, PAYMENTS AND CREDITS.')}${permissionPage('BILLING', 'THE BILLING GRANT', 'more')}</main>`;
    const tab = child || 'invoices';
    const T = [['invoices', 'INVOICES', vals(INVOICES).length], ['payments', 'PAYMENTS'], ['credits', 'CREDITS'], ['quotes', 'QUOTES']].map(([k, t, n]) => [k, t, n, k === 'invoices' ? 'more/billing' : `more/billing/${k}`]);
    let body;
    if (tab === 'invoices') body = rows(vals(INVOICES).map((i) => ({ go: recRoute('invoice', i.id), lead: badge(client(i.client)), title: i.ref, sub: i.what, meta: `${i.amount} · ${i.date}`, status: statusOf('invoice', i, i.status) })));
    else if (tab === 'payments') body = rows(vals(INVOICES).filter((i) => statusOf('invoice', i, i.status)[0] === 'PAID').map((i) => ({ go: recRoute('invoice', i.id), title: `PAYMENT · ${i.ref}`, sub: clientName(i.client), meta: i.amount, status: ['RECEIVED', 'ok'] })));
    else if (tab === 'credits') body = stateBlock({ kind: 'empty', title: 'NO CREDITS', body: 'CREDITS ISSUED TO CLIENTS APPEAR HERE. NONE IN THE SAMPLE.', fields: ['CLIENT', 'REASON', 'AMOUNT', 'APPLIED TO'] });
    else if (tab === 'quotes') body = stateBlock({ kind: 'empty', title: 'NO OPEN QUOTES', body: 'SERVICE QUOTES SENT TO LEADS AND CLIENTS APPEAR HERE.', fields: ['TO', 'SERVICES', 'AMOUNT', 'SENT', 'STATUS'] });
    else return missing(r);
    return `<main class="main">${moreHead('BILLING', 'FOUNDER AND STAFF WITH THE BILLING GRANT.', { chips: [['BY GRANT', 'gold'], ['SAMPLE AMOUNTS', 'mute']], actions: actionsBar([{ label: 'CREATE INVOICE', sim: 'inv-new', ico: 'summary', founder: true, effect: 'DRAFT AN INVOICE FOR A CLIENT. NOTHING IS SENT OR CHARGED UNTIL YOU SEND IT.' }]) })}
      ${tabs(T, tab)}<div style="margin-top:12px">${body}</div>${notice('SAMPLE AMOUNTS — NOT REAL TRANSACTIONS. NO PAYMENT IS PROCESSED IN THIS REVIEW.')}</main>`;
  },
  service_catalog(child, r) {
    meta('MORE › SERVICE CATALOG', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · SERVICE ACTIVATION MATRIX (src/infrastructure/serviceActivation.ts)');
    if (child) {
      const s = SERVICES[Number(child)];
      if (!s) return missing(r);
      return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['SERVICE CATALOG', 'more/service_catalog'], [s[0]]], title: s[0], sub: s[3], chips: [[s[1], s[2]]] })}
        <div class="split" style="margin-top:14px"><div class="stack">${section('ACTIVATION', 'FROM THE LIVE ACTIVATION MATRIX.', kv([['STATUS', st([s[1], s[2]])], ['WHAT IT MEANS', s[3]], ['PRICE', FOUNDER ? 'SET BY THE FOUNDER — NOT SHOWN IN THE REVIEW' : 'FOUNDER ONLY']], 2))}</div>
        <aside class="aside">${actionsPanel([{ label: 'CHANGE ACTIVATION', founder: true, off: 'ACTIVATION IS A BUSINESS DECISION MADE OUTSIDE THIS REVIEW — NEVER A SWITCH HERE' }, { label: 'EDIT PRICING', founder: true, sim: 'svc-price', effect: 'CHANGE WHAT THIS SERVICE COSTS FOR NEW QUOTES.' }, { label: 'VIEW ONLY', off: 'STAFF SEE THE CATALOG; THEY DO NOT CHANGE IT' }].filter((a) => FOUNDER || a.label === 'VIEW ONLY'))}</aside></div></main>`;
    }
    return `<main class="main">${moreHead('SERVICE CATALOG', 'WHAT AIO OFFERS, AND WHETHER IT IS SWITCHED ON.', { chips: [FOUNDER ? ['PRICING · FOUNDER', 'gold'] : ['VIEW ONLY', 'mute']] })}
      ${rows(SERVICES.map(([n, w, t, s], i) => ({ go: `more/service_catalog/${i}`, title: n, sub: s, status: [w, t] })))}
      ${notice('ACTIVE · INTERNAL ONLY · PARTNER PENDING · PAUSED COME FROM THE LIVE ACTIVATION MATRIX. A PAUSED SERVICE IS NEVER SWITCHED ON HERE.')}</main>`;
  },
  team_staff(child, r) {
    meta('MORE › TEAM & STAFF', 'NEW · FOR REVIEW', 'LIVE: PARTIAL — ROLES EXIST; GRANT MANAGEMENT IS FOUNDER-ONLY', 'Grants are never tied to a name or email; they come from the role and the founder’s grants.');
    if (child) {
      const p = STAFF[child];
      if (!p) return missing(r);
      const grants = { 's-alex': ['ALL LANES', 'REPORTS', 'BILLING', 'CRM', 'TEAM'], 's-jordan': ['FILING', 'PERMITTING', 'INTAKE'], 's-maria': ['INSURANCE', 'COMPLIANCE'], 's-dev': ['DISPATCH', 'DRIVERS & CARRIERS', 'MAINTENANCE'], 's-kayla': ['BOOKKEEPING', 'BILLING'] }[p.id];
      return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['TEAM & STAFF', 'more/team_staff'], [p.name]], title: p.name, sub: p.area, chips: [[p.role.split(' (')[0], 'mute']] })}
        <div class="split" style="margin-top:14px"><div class="stack">${section('ROLE', '', kv([['ROLE', p.id === 's-alex' ? (FOUNDER ? 'FOUNDER' : 'STAFF') : p.role], ['WORKS IN', p.area]], 2))}
        ${FOUNDER ? section('GRANTS', 'WHAT THIS PERSON CAN OPEN. GRANTED BY ROLE, CHECKED ON THE SERVER.', `<div class="pill-row">${grants.map((g) => st([g, 'gold'])).join('')}</div>`) : notice('GRANTS ARE VISIBLE TO THE FOUNDER ONLY.')}</div>
        <aside class="aside">${actionsPanel([{ label: 'EDIT ROLE & GRANTS', founder: true, sim: 'team-grants', ico: 'security', effect: 'CHANGE WHAT THIS PERSON CAN OPEN. THE SERVER ENFORCES IT; HIDING A BUTTON IS NEVER THE CONTROL.' }, { label: 'DEACTIVATE', founder: true, sim: 'team-off', effect: 'END THIS PERSON’S ACCESS AT ONCE.' }, { label: 'MESSAGE', sim: 'team-msg', ico: 'letter', effect: 'SEND AN INTERNAL MESSAGE.' }])}</aside></div></main>`;
    }
    return `<main class="main">${moreHead('TEAM & STAFF', 'TEAM MEMBERS, ROLES AND GRANTS.', { chips: [FOUNDER ? ['ROLES · FOUNDER', 'gold'] : ['VIEW ONLY', 'mute']], actions: FOUNDER ? actionsBar([{ label: 'INVITE TEAM MEMBER', sim: 'team-invite', ico: 'person-plus', founder: true, effect: 'SEND AN INVITE WITH A ROLE. THE PERSON GETS ONLY WHAT THE ROLE GRANTS.' }]) : '' })}
      ${rows(vals(STAFF).map((p) => ({ go: `more/team_staff/${p.id}`, lead: `<span class="badge">${p.b}</span>`, title: p.name, sub: p.area, status: [p.id === 's-alex' ? (FOUNDER ? 'FOUNDER' : 'STAFF') : p.role.split(' · ')[0], p.id === 's-alex' && FOUNDER ? 'gold' : 'mute'] })))}
      ${FOUNDER ? '' : notice('ONLY THE FOUNDER MANAGES ROLES AND GRANTS. YOU CAN SEE WHO IS ON THE TEAM.')}</main>`;
  },
  mechanic_network(child, r) {
    meta('MORE › MECHANIC NETWORK', 'NEW · FOR REVIEW', 'LIVE: PARTIAL · FLEETCARE PROVIDERS');
    if (child) {
      const p = PROVIDERS[child];
      if (!p) return missing(r);
      const t = vals(TICKETS).filter((x) => x.provider === p.id);
      return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['MECHANIC NETWORK', 'more/mechanic_network'], [p.name]], title: p.name, sub: p.where, chips: [p.verify, ['SAMPLE', 'mute']] })}
        <div class="split" style="margin-top:14px"><div class="stack">${section('PROVIDER', '', kv([['LOCATION', p.where], ['VERIFICATION', st(p.verify)], ['OPEN TICKETS', String(t.length)]], 2))}${section('TICKETS WITH THIS PROVIDER', '', rows(t.map((x) => ({ go: recRoute('ticket', x.id), title: x.ref, sub: x.issue, status: statusOf('ticket', x, x.status) })), 'NONE'))}</div>
        <aside class="aside">${actionsPanel([{ label: 'VERIFY PROVIDER', sim: 'prov-verify', ico: 'security', founder: true, effect: 'MARK THE PROVIDER AIO VERIFIED AFTER CHECKING LICENSES AND INSURANCE.', set: `provider:${p.id}=AIO VERIFIED|ok` }, { label: 'MESSAGE PROVIDER', sim: 'prov-msg', ico: 'letter', effect: 'SEND A NOTE TO THE PROVIDER.' }])}</aside></div></main>`;
    }
    return `<main class="main">${moreHead('MECHANIC NETWORK', 'MAINTENANCE PROVIDERS AND PARTNERS. PROVIDERS OWN THE REPAIRS.', { chips: [['SAMPLE PROVIDERS', 'mute']] })}
      ${rows(vals(PROVIDERS).map((p) => ({ go: `more/mechanic_network/${p.id}`, lead: icoTile('wrench'), title: p.name, sub: p.where, meta: `${vals(TICKETS).filter((x) => x.provider === p.id).length} TICKETS`, status: statusOf('provider', p, p.verify) })))}</main>`;
  },
  system_settings(child, r) {
    meta('MORE › SYSTEM SETTINGS', 'NEW · FOR REVIEW', 'LIVE: PARTIAL — SETTINGS ARE SPREAD ACROSS PAGES TODAY');
    if (child) {
      const s = SETTINGS[child];
      if (!s) return missing(r);
      if (s[2] && !FOUNDER) return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['SYSTEM SETTINGS', 'more/system_settings'], [s[0]]], title: s[0], sub: s[1] })}${permissionPage(s[0], `THE ${s[0]} SETTINGS`, 'more/system_settings')}</main>`;
      const items = {
        workflows: [['IFTA QUARTER STEPS', 'FILING & FUEL TAXES'], ['RENEWAL WINDOW · 60 DAYS', 'INSURANCE'], ['MONTHLY CLOSE · 9 STEPS', 'BOOKKEEPING']],
        integrations: [['ELD PROVIDERS', 'SAMSARA · MOTIVE · GEOTAB · OMNITRACS · TRIMBLE · KEEPTRUCKIN'], ['EMAIL', 'OUTBOUND NOTICES'], ['DOCUMENT STORAGE', 'VAULT']],
        security: [['TWO-STEP SIGN-IN', 'REQUIRED FOR STAFF'], ['SESSION LENGTH', '12 HOURS'], ['ACCESS LOG', 'EVERY EXPORT AND GRANT CHANGE']],
        data: [['RETENTION', 'PER RECORD TYPE'], ['EXPORT REQUESTS', 'LOGGED'], ['DELETION REQUESTS', 'FOUNDER APPROVES']],
        notifications: [['NEW CLIENT MESSAGES', 'IN THE OFFICE AND BY EMAIL'], ['ASSIGNED TO ME', 'IN THE OFFICE'], ['DEADLINES · 7 DAYS', 'IN THE OFFICE']],
      }[child];
      return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['SYSTEM SETTINGS', 'more/system_settings'], [s[0]]], title: s[0], sub: s[1], chips: [['SAMPLE SETTINGS', 'mute']] })}
        ${rows(items.map(([t, v], i) => ({ title: t, sub: v, sim: `set-${child}-${i}`, status: ['EDIT', 'gold'] })))}${notice('EVERY CHANGE HERE IS SIMULATED AND RECORDED IN THE ACCESS LOG IN THE LIVE OFFICE.')}</main>`;
    }
    return `<main class="main">${moreHead('SYSTEM SETTINGS', FOUNDER ? 'WORKFLOWS, INTEGRATIONS, SECURITY AND DATA — ALL AREAS.' : 'THE AREAS YOUR ROLE IS GRANTED.', { chips: [FOUNDER ? ['ALL AREAS · FOUNDER', 'gold'] : ['GRANTED AREAS', 'mute']] })}
      ${rows(Object.entries(SETTINGS).map(([k, [t, s, f]]) => ({ go: `more/system_settings/${k}`, lead: icoTile(k === 'security' ? 'security' : k === 'integrations' ? 'connectivity' : k === 'data' ? 'database' : k === 'notifications' ? 'bell' : 'setup'), title: t, sub: s, status: f && !FOUNDER ? ['FOUNDER ONLY', 'mute'] : null })))}</main>`;
  },
  help_support(child, r) {
    meta('MORE › HELP & SUPPORT', 'NEW · FOR REVIEW', 'LIVE: NOT BUILT AS ONE PLACE — SOPS LIVE OUTSIDE AIO');
    if (child) {
      const s = SOPS[child];
      if (!s) return missing(r);
      return `<main class="main">${pageHead({ trail: [['MORE', 'more'], ['HELP & SUPPORT', 'more/help_support'], [s[0]]], title: s[0], sub: `SOP · ${s[1]}`, chips: [['SAMPLE SOP', 'mute']] })}
        ${section('STEPS', '', stepper(s[2], -1))}${notice('A SAMPLE SOP WRITTEN FROM THE OFFICE’S RULES. THE FOUNDER’S OWN SOPS REPLACE IT.')}</main>`;
    }
    return `<main class="main">${moreHead('HELP & SUPPORT', 'TRAINING, SOPS AND SUPPORT.', { actions: actionsBar([{ label: 'OPEN A SUPPORT REQUEST', sim: 'help-req', ico: 'help', effect: 'SEND A REQUEST TO THE AIO TEAM.' }]) })}
      ${section('STANDARD OPERATING PROCEDURES', 'HOW THE OFFICE DOES ITS WORK.', rows(Object.entries(SOPS).map(([k, [t, l]]) => ({ go: `more/help_support/${k}`, lead: icoTile('log'), title: t, sub: l }))))}</main>`;
  },
  account(child, r) {
    meta('MORE › ACCOUNT', 'HONEST STATE', 'LIVE: NOT BUILT', 'Designed so the profile menu and MORE › ACCOUNT open the same place.');
    return `<main class="main">${moreHead('ACCOUNT', 'YOUR PROFILE, SECURITY AND PREFERENCES — THE SAME PLACE AS THE PROFILE MENU.', { chips: [['NOT BUILT YET', 'mute']] })}
      <div class="split" style="margin-top:12px"><div class="stack">${section('PROFILE', '', kv([['NAME', 'ALEX R.'], ['ROLE', FOUNDER ? 'FOUNDER' : 'STAFF', 'FROM YOUR ROLE — NEVER FROM YOUR NAME OR EMAIL'], ['WORKS IN', FOUNDER ? 'ALL LANES' : 'ASSIGNED LANES']], 2))}
      ${section('SECURITY', '', rows([{ title: 'PASSWORD', sub: 'LAST CHANGED · SAMPLE', sim: 'acct-pw', status: ['CHANGE', 'gold'] }, { title: 'TWO-STEP SIGN-IN', sub: 'ON', sim: 'acct-2fa', status: ['ON', 'ok'] }, { title: 'SIGNED-IN DEVICES', sub: '2 DEVICES', sim: 'acct-dev', status: ['REVIEW', 'gold'] }]))}</div>
      <aside class="aside">${section('PREFERENCES', '', rows([{ title: 'NOTIFICATIONS', sub: 'IN THE OFFICE AND BY EMAIL', go: 'more/system_settings/notifications' }, { title: 'SIGN OUT', sub: 'END THIS SESSION', sim: 'acct-out' }]))}${stateBlock({ kind: 'notbuilt', title: 'ACCOUNT PAGE', body: 'THE LIVE OFFICE HAS NO ACCOUNT PAGE YET. THIS IS THE DESIGN.' })}</aside></div></main>`;
  },
};
