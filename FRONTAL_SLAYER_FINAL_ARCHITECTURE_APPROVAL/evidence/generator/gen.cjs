// Generates 03/04/05 CSVs, 16 decision board MD, 20 manifest JSON and the board data embed.
const fs = require('fs');
const path = require('path');
const pages = require('./pages.cjs');
const decisions = require('./decisions.cjs');
const workflows = require('./workflows.cjs');
const OUT = process.argv[2];
const AUDIT_COMMIT = '4863456a3c73e9c3acb8cc913294a5a1025ed1ab';

const csvCell = (v) => {
  const s = Array.isArray(v) ? v.join('; ') : (v == null ? '' : String(v));
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const writeCsv = (file, header, rows) => {
  const body = [header.map(csvCell).join(',')].concat(rows.map(r => r.map(csvCell).join(','))).join('\n') + '\n';
  fs.writeFileSync(path.join(OUT, file), body);
  return rows.length;
};

// ---------- 03 page responsibility matrix ----------
const n03 = writeCsv('03_PAGE_RESPONSIBILITY_MATRIX.csv',
  ['PAGE ID','TREE','FAMILY','PAGE','TYPE','CURRENT ROUTE','CANONICAL ROUTE','PARENT','DISPOSITION','CONDITION (A-H)','AUDIT STATUS','MARKER','RESPONSIBILITY','DATA OWNER','MIRROR','BACKEND READINESS','VISUAL PRESERVATION','MISSING FUNCTIONALITY','RISKS','DECISIONS','SPRINT','DATA DEPENDENCIES'],
  pages.map(p => [p.id,p.tree,p.family,p.name,p.type,p.route,p.canonical,p.parent,p.disp,p.cond,p.auditStatus,p.marker,p.responsibility,p.owner,p.mirror,p.backend,p.visual,p.missing,p.risk,p.decisions,p.sprint,p.deps]));

// ---------- 04 workflow matrix ----------
const n04 = writeCsv('04_CUSTOMER_ADMIN_WORKFLOW_MATRIX.csv',
  ['WORKFLOW ID','WORKFLOW','AREA','CURRENT STATE','ENTRY POINT','USER ACTION','API','AUTHORITATIVE RECORD','STRIPE / EXTERNAL','ADMIN VISIBILITY','ADMIN ACTION','CUSTOMER STATUS UPDATE','NOTIFICATION','AUDIT EVENT','FAILURE RECOVERY','VERIFICATION TEST','PRIOR BROKEN WORKFLOWS','RISKS','DECISIONS','SPRINT'],
  workflows.map(x => [x.id,x.name,x.area,x.current,x.entry,x.userAction,x.api,x.record,x.external,x.adminVisibility,x.adminAction,x.customerUpdate,x.notification,x.audit,x.failureRecovery,x.test,x.bw,x.risks,x.decisions,x.sprint]));

// ---------- 05 route migration ----------
// Consumers from evidence/X2_crossproject_stripe_routes.md §4 (literal-string scan; counts are in-app references).
const C = {
  '/account': ['106 in-app','email digital_cash_update','PSA route catalog'],
  '/account/orders': ['48 in-app','10 order/payment email templates + consult_offer_sent','stored notification actionRoute ?orderNumber=&consultOffer=1','PSA nudges'],
  '/account/orders/:orderId/review': ['2 in-app'],
  '/account/concierge': ['24 in-app','email birthday_reward','email support link #priority-messages (every email)','anchor #order-tracking','PSA route catalog'],
  '/account/rewards': ['62 in-app','6 email templates + every email header','PSA upgradePath + catalog','Stripe docs'],
  '/account/load-card': ['3 in-app'],
  '/account/collectibles': ['6 in-app'],
  '/checkout/upgrade': ['16 in-app','Stripe success/cancel URL (in-flight sessions)'],
  '/wishlist': ['60 in-app','email wishlist_price_drop','PSA catalog'],
  '/wishlist/lists, /wishlist/lists/:listId': ['8 in-app'],
  '/wishlist/shared/:token': ['4 in-app','share links sent outside the app (permanent)'],
  '/account/reviews': ['2 in-app'],
  '/account/affiliate': ['7 in-app','6 affiliate_* email templates','PSA catalog'],
  '/account/referrals': ['7 in-app','email referral_redeemed','PSA catalog'],
  '/account/alerts': ['11 in-app'],
  '/account/settings': ['9 in-app','4 security/profile email templates'],
  '/account/shipping': ['7 in-app'],
  '/account/payment': ['2 in-app'],
  '/account/consult-offer': ['2 in-app (App.tsx, consultOfferFromQuote.ts)'],
  '/tools/hairstyle-analysis': ['3 in-app','11 doc references','purchase flow enters /checkout from here'],
  '/mobile/profile, /mobile/concierge, /mobile/rewards, /mobile/analysis': ['3-4 in-app each (MobileBottomNav, MobileMansionRoutes); internal only'],
  '/desktop/account': ['4 in-app; internal only'],
  '/tools/slay-tickets, /checkout/slay-tickets': ['16 in-app'],
  '/slay-cam': ['6 in-app'],
  '/admin/users': ['0 links (URL-only)'], '/admin/audit': ['0 links (URL-only)'], '/admin/analytics': ['0 links (URL-only)'], '/admin/notifications': ['0 links (URL-only)'],
  '/admin/alerts': ['1 (AdminHeader)'], '/admin/marketing/offers': ['1 (special-offer page)'], '/admin/referrals': ['1 (admin dashboard)'],
  '/admin/revenue/edit-inventory': ['2 (revenue, alerts)'], '/admin/revenue/view-waitlist': ['1 (revenue)'], '/admin/revenue/fulfilled-orders': ['1 (revenue)'],
  '/admin/clients/account': ['0 links; existing redirect'], '/admin/headquarters': ['12 in-app (Studio OS)','Studio OS bundles and docs'],
  '/admin/meetings/schedule': ['0 literal links (relative navigation)'], '/admin/reviews': ['5 in-app'], '/admin/pending': ['9 in-app'],
  // Admin counts below: literal-string grep of src/ in this sprint (no email links found; emailSupportLinks.ts mentions /admin/messages only in a comment)
  '/admin/dashboard': ['165 in-app (154 files; admin back links)'], '/admin/clients/overview': ['10 in-app'], '/admin/clients/deleted': ['1 in-app'],
  '/admin/meetings': ['9 in-app'], '/admin/messages': ['1 in-app'], '/admin/marketing': ['4 in-app'], '/admin/brand/edit/:copyKind': ['4 in-app'],
  '/admin/revenue': ['24 in-app'], '/admin/revenue/accounting-report': ['1 in-app'], '/admin/revenue/fraud-analysis': ['1 in-app'], '/admin/brand': ['9 in-app'],
  '/admin/trend-desk': ['1 in-app'], '/admin/slay-forecast-broadcast': ['1 in-app'], '/admin/workers': ['3 in-app'], '/admin/backend': ['1 in-app'], '/admin/studio/health': ['1 in-app'],
};
const EMAIL = (r) => (C[r] || []).some(s => /email/i.test(s));
const SAVED = (r) => (C[r] || []).some(s => /stored|share|Stripe success|PSA/i.test(s));
const routeRows = [];
const target = {
  'C-R1': '/account/orders (preserve query: orderNumber, consultOffer=1 opens the offer modal)',
  'C-R2': 'Admin-only harness; customers → /account/hair?tab=analyses (decision E2)',
  'C-R3': 'Unlinked; redirect each to its /account equivalent if B6 retires the Mobile Mansion',
  'A-R1': '/admin/backend?tab=ADMIN_USERS', 'A-R2': '/admin/backend?tab=AUDIT_LOG', 'A-R3': '/admin/backend?tab=SYSTEM_ALERTS',
  'A-R4': '/admin/brand?tab=ANALYTICS', 'A-R5': '/admin/marketing?tab=CUSTOMER_NOTIFICATIONS', 'A-R6': '/admin/marketing?tab=SPECIAL_OFFERS',
  'A-R7': '/admin/rewards?tab=REFERRALS', 'A-R8': '/admin/inventory?tab=STOCK', 'A-R9': '/admin/inventory?tab=WAITLIST',
  'A-R10': '/admin/orders?tab=DELIVERED', 'A-R11': '/admin/clients/:userId (resolve ?email= server-side)',
};
for (const p of pages) {
  const isNew = p.marker === 'NEW' && (p.route === '—' || p.route.startsWith('('));
  const cur = isNew ? '(none)' : p.route;
  const consumers = isNew ? 'none (new)' : (C[p.route] || ['UNVERIFIED (not in literal-string scan)']).join('; ');
  const auth = p.tree === 'admin' ? 'AdminGuard + requireAdmin (role per C2)' : (/wishlist\/shared|slay-cam|tools\/slay/.test(p.route) ? 'Public / signed-in as today' : 'AccountRouteGuard (signed-in); premium gate where noted');
  let redirect;
  if (target[p.id]) redirect = `${p.route} → ${target[p.id]}. Client <Navigate replace> preserving query/hash; keep for ≥12 months`;
  else if (isNew) redirect = 'n/a (new route)';
  else if (p.disp === 'NEST' || p.disp === 'MOVE') redirect = 'URL unchanged; only breadcrumb/parent changes';
  else redirect = 'URL unchanged';
  const email = isNew ? 'New links to be added to emails after S1/S2' : (EMAIL(p.route) ? 'YES: email deep links must keep resolving (no change planned)' : 'None found');
  const saved = isNew ? 'n/a' : (SAVED(p.route) ? 'YES: stored/persisted links (notifications JSON, PSA history, share links or Stripe return)' : 'Bookmarks only');
  const test = isNew ? `E2E: ${p.canonical} renders for owner, 404/403 for others` :
    target[p.id] ? `E2E: visit ${p.route.split(',')[0]} → lands on target with query preserved; no in-app link still points to the old URL (grep)` :
    `E2E: ${p.route.split(',')[0]} renders; every email/stored deep link resolves`;
  routeRows.push([p.id, p.tree, cur, p.canonical, p.disp, consumers, redirect, auth, saved, email, test, p.sprint, p.decisions]);
}
// Existing redirects and aliases that must survive the migration
const extra = [
  ['X-01','customer','/orders','/account/orders','KEEP (alias)','PSA order card path, PSA prompt + catalog, 10 in-app','Existing <Navigate>. Change it to preserve the query string','None (redirect)','YES: PSA chat history stores /orders','None','E2E: /orders?orderNumber=1 lands on /account/orders?orderNumber=1','S2',['B1']],
  ['X-02','customer','/account/notifications','/account/alerts','KEEP (redirect)','email meeting_reschedule, meeting_cancel; stored actionRoute (meeting-client-alert, autopay)','Existing <Navigate>; keep permanently','AccountRouteGuard','YES: stored notification actionRoute','YES','E2E: /account/notifications → /account/alerts','S2',['B1']],
  ['X-03','customer','/account/concierge#priority-messages','/account/concierge#priority-messages','KEEP','support link in every email','Anchor id must survive the Concierge refactor (B3); later may also open MY REQUESTS','AccountRouteGuard (premium)','YES','YES','E2E: anchor scrolls to priority messages','S2',['B3','B7']],
  ['X-04','customer','/account/concierge?orderId=…#order-tracking','/account/orders/:orderId','REDIRECT (when order detail ships)','pages/orders/page.tsx:4101','Concierge reads orderId and forwards to order detail','AccountRouteGuard','Bookmarks','None','E2E: old tracking link opens order detail','S2',['B3','C4']],
  ['X-05','customer','/checkout/upgrade?stripe=success&session_id=…','/checkout/upgrade','KEEP','Stripe Checkout success_url (server default)','Never move while sessions can be in flight','Signed-in','YES (Stripe)','None','E2E: Stripe test session returns and shows confirmation from server state','S0B-2',['A3']],
  ['X-06','admin','/admin','/admin/dashboard','KEEP (redirect)','existing','Existing','AdminGuard','Bookmarks','None','E2E','S3',['C1']],
  ['X-08','customer','/sign-in','/sign-in','KEEP (adjacent)','signInReturnTo.ts; AccountRouteGuard redirects','URL unchanged; return-to targets must accept the new /account/orders/:orderId and /account/hair routes','Public','Bookmarks','Auth emails (shared Supabase templates; R-17)','E2E: signed-out deep link to /account/orders/:orderId → sign-in → returns to the order','S2',['B1','H3']],
  ['X-07','admin','/admin/clients','/admin/clients/overview','KEEP (redirect)','existing','Existing','AdminGuard','Bookmarks','None','E2E','S3',['C1']],
];
const n05 = writeCsv('05_ROUTE_MIGRATION_AND_REDIRECT_PLAN.csv',
  ['ROW ID','TREE','CURRENT ROUTE','CANONICAL ROUTE','DISPOSITION','CONSUMERS (evidence X2 §4)','REDIRECT STRATEGY','AUTH','SAVED-LINK IMPACT','EMAIL-LINK IMPACT','REGRESSION TEST','SPRINT','DECISIONS'],
  routeRows.concat(extra));

// ---------- 16 decision board ----------
const groups = [...new Set(decisions.map(d => d.group))];
let md = `# 16 — Founder Decision Board V2

**Nothing on this board is approved.** Every decision has \`FOUNDER SELECTION: — (pending)\`. The OPUS RECOMMENDATION column is a recommendation only. A selection counts as recorded only when it is written to a durable decision record (doc 20 manifest updated in the repository, or the owner-only store of the interactive board, doc 21) and committed. A visual toggle is not approval.

${decisions.length} decisions in ${groups.length} groups. Prior audit decision ids (audit doc 24) are cross-referenced.

| Group | Decisions | Gates |
|---|---|---|
${groups.map(g => { const ds = decisions.filter(d => d.group === g); return `| ${g} | ${ds.map(d => d.id).join(', ')} | ${[...new Set(ds.map(d => d.gate).filter(Boolean))].join(', ')} |`; }).join('\n')}

`;
for (const g of groups) {
  md += `\n## ${g}\n`;
  for (const d of decisions.filter(x => x.group === g)) {
    const rec = d.options.find(o => o.key === d.rec);
    md += `\n### ${d.id} — ${d.subject}\n\n| Field | Value |\n|---|---|\n`;
    const row = (k, v) => { md += `| ${k} | ${String(v == null || v === '' ? '—' : v).replace(/\|/g, '\\|').replace(/\n/g, ' ')} |\n`; };
    row('DECISION ID', d.id);
    row('SUBJECT', d.subject);
    row('CURRENT STATE', d.current);
    row('EVIDENCE', d.evidence);
    row('OPTIONS', d.options.map(o => `**${o.key}.** ${o.label} — *${o.consequence}*`).join('<br>'));
    row('OPUS RECOMMENDATION', rec ? `Option ${rec.key}: ${rec.label}` : d.rec);
    row('RATIONALE', d.rationale);
    row('IMPACT', d.impact);
    row('REVERSIBILITY', d.reversibility);
    row('DEPENDENCIES', (d.deps || []).join(', '));
    row('FOUNDER SELECTION', '— (pending)');
    row('IMPLEMENTATION GATE', d.gate);
    row('PRIOR AUDIT IDS', (d.priorAuditIds || []).join(', '));
  }
}
md += `
## Engineering decisions not escalated

These are taken by engineering inside the approved architecture. They change no business rule, price, reward value or visual design, and they are listed so the founder can object.

| ID | Decision | Why it is not a founder decision |
|---|---|---|
| ENG-01 | Order numbers come from a database sequence | Fixes duplicate numbers (BW-22); no visible format change beyond uniqueness |
| ENG-02 | Every Stripe call carries an idempotency key; webhook events are stored and deduplicated by event id | Correctness only |
| ENG-03 | Containment migration uses \`REVOKE EXECUTE … FROM PUBLIC, anon, authenticated\` then \`GRANT … TO service_role\`, with a fresh timestamp unused by both repos | Required for the revoke to work (X2 §2); procedure within decision A1 |
| ENG-04 | Cached balances on \`profiles\` stay as columns, maintained by triggers from the ledgers (no column drops) | SITE00 \`api/profile.ts\` upserts these columns on every sign-in (X2 §1a) |
| ENG-05 | Redirects are client \`<Navigate replace>\` that preserve query and hash | Saved and email links keep working |
| ENG-06 | One \`StatusTimeline\`, \`OrderRow\`, \`LedgerHistory\`, \`AlertRow\` component extracted from existing markup | Reuse without redesign (doc 18) |
| ENG-07 | Mock data gated behind a non-production build flag | Implements A5 mechanically |
| ENG-08 | Fix the autopay cron mismatch (GET vs POST, secret name) only after A7 is decided | Today the mismatch keeps autopay off; fixing it first would switch on a risky path |
| ENG-09 | \`membership_payment_failures\` gets a unique key on the Stripe invoice id | Stops duplicate rows on webhook retries |
| ENG-10 | Webhook records the charge currency and the USD amount separately | Today a non-USD charge is recorded as USD (X2 §3b) |
`;
fs.writeFileSync(path.join(OUT, '16_FOUNDER_DECISION_BOARD_V2.md'), md);

// ---------- 20 manifest ----------
const tree = (t) => pages.filter(p => p.tree === t).map(p => ({ id: p.id, family: p.family, name: p.name, type: p.type, currentRoute: p.route, canonicalRoute: p.canonical, parent: p.parent, disposition: p.disp, condition: p.cond, marker: p.marker, sprint: p.sprint, decisions: p.decisions }));
const manifest = {
  manifestVersion: '2.0',
  sprintId: 'P0.FRONTAL-SLAYER.OPUS.ACCOUNT-ADMIN-FINAL-ARCHITECTURE-AND-FOUNDER-APPROVAL-PACKAGE.V1',
  status: 'PENDING_FOUNDER_APPROVAL',
  approvalRecorded: false,
  note: 'Recommendations only. founderSelection is null for every decision. Nothing here authorizes implementation.',
  repository: 'yoteenz/fsbw',
  branch: 'claude/frontal-slayer-audit-vclp3w',
  traceability: { initialAuditCommit: AUDIT_COMMIT, initialAuditFolder: 'FRONTAL_SLAYER_ACCOUNT_ADMIN_AUDIT/', evidence: ['evidence/R2_rewards_canon.md','evidence/V2_assets_components.md','evidence/X2_crossproject_stripe_routes.md'] },
  counts: {
    customerRoutedPages: 21, // 20 routed page rows (C-01…C-22 minus tab C-05 and adjacent C-10); C-14 holds two URLs
    customerFamilies: 10,
    adminRoutedPages: pages.filter(p => p.tree === 'admin' && !/^A-R/.test(p.id)).length,
    adminFamilies: 15,
    newPages: pages.filter(p => p.marker === 'NEW').map(p => p.id),
    consolidatedRoutes: pages.filter(p => p.marker === 'CONSOLIDATED').map(p => p.id),
    retiredOrRestricted: pages.filter(p => p.marker === 'RETIRED' || p.marker === 'BLOCKED').map(p => p.id),
    workflows: workflows.length,
    decisions: decisions.length,
  },
  customerTree: tree('customer'),
  adminTree: tree('admin'),
  decisions: decisions.map(d => ({ id: d.id, group: d.group, subject: d.subject, options: d.options.map(o => ({ key: o.key, label: o.label })), recommendation: d.rec, gate: d.gate, founderSelection: null, status: 'PENDING', decidedBy: null, decidedAt: null })),
  approvalRequirements: (() => {
    const order = ['S0B-1','S0B-2','S1','S1B','S2','S3','S4','S5','S6','S7'];
    const notes = { 'S0B-1': 'Rollback migration prepared; rehearsed on a Supabase branch (H2); SITE00 service-role key confirmed in production; SITE00 and JURNL signup smoke test' };
    const by = {}; order.forEach(k => by[k] = []);
    decisions.forEach(d => order.forEach(k => { if (new RegExp('(^|[^A-Z0-9-])' + k.replace('-', '\\-') + '(?![0-9A-Z-])').test(d.gate)) by[k].push(d.id); }));
    return order.map(k => ({ gate: k, requires: by[k], ...(notes[k] ? { plus: notes[k] } : {}) }))
      .concat([{ gate: 'none (independent)', requires: decisions.filter(d => !order.some(k => by[k].includes(d.id))).map(d => d.id) }]);
  })(),
  howToRecordApproval: 'Set founderSelection to an option key, status to APPROVED|REJECTED|DEFERRED, decidedBy and decidedAt (ISO 8601), commit the file. The interactive board (doc 21) can export this shape; the export is not a record until committed.',
};
fs.writeFileSync(path.join(OUT, '20_ARCHITECTURE_APPROVAL_MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n');

// ---------- board data ----------
if (process.argv[3]) fs.writeFileSync(process.argv[3], 'window.ARCH=' + JSON.stringify({ pages, decisions, workflows, auditCommit: AUDIT_COMMIT, generated: new Date().toISOString().slice(0,10) }) + ';\n');

console.log(JSON.stringify({ n03, n04, n05, decisions: decisions.length, manifestCounts: manifest.counts }, null, 1));

// ---------- 19 release readiness + E2E matrix ----------
{
  const role = { 'Orders/payment':'Customer + Admin', 'Membership':'Customer (standard → member)', 'Hair analysis':'Member + non-member', 'Consultations':'Customer + Admin', 'Rewards':'Member + Admin', 'Community':'Customer (delivered order) + Admin', 'Support':'Customer + Admin', 'Admin ops':'Admin + second shopper', 'Platform':'Customer + Admin', 'Account':'Customer (2 devices)' };
  const esc = (s) => String(s).replace(/\|/g, '\\|');
  const sprints = ['S0B-1','S0B-2','S1','S1B','S2','S3','S4','S5','S6'];
  let t = `# 19 — Release Readiness and E2E Test Matrix

**Every test below has status NOT RUN.** This sprint is planning only: no test was written or executed, and no result is implied. Status values used later: NOT RUN → PASS / FAIL / BLOCKED, each with a link to the CI run or recording.

## 1. Test environment (precondition for any PASS)

| Requirement | Detail | Decision |
|---|---|---|
| Staging deployment | Separate Vercel project pointing at a **Supabase branch** (never the shared production project) | H2 |
| Stripe | Test mode keys, webhook endpoint on staging, test clocks for renewals | H2 |
| Accounts | GUEST · CUSTOMER (no orders) · CUSTOMER (delivered order) · MEMBER 3 / 6 / 12 · BLACK spend tier · ADMIN · FOUNDER | H2 |
| Devices | Two browsers per customer (cross-device checks) · widths 375, 448, 720, 1024, 1280, 1920 | — |
| Cross-product | SITE00 sign-in + profile sync and JURNL signup against the same Supabase branch | H3 |
| Email | Resend test domain or capture inbox | — |

## 2. Release gates

| Gate | Must be true before release | Evidence |
|---|---|---|
| S0B-1 | R-01, R-04, R-10 closed; SQL suite green; advisor 0 anon-executable service functions; SITE00 and JURNL signup and profile sync pass on the branch | SQL suite run, advisor output, smoke recording |
| S0B-2 | No client path grants value (static gate + E2E W-08, W-11, W-31, W-32); BAW interim path works (W-02); autopay off or server-resolved (W-16) | CI + E2E recordings |
| S1 | W-01 cross-device parity; webhook replay idempotent; order numbers unique; quote total = PI amount | E2E + integration |
| S1B | BAW parity over option combinations | Parity suite |
| S2 / S3 | Every page in scope at status G or H per doc 13; redirect suite green (05 CSV); every admin mutation audited | Page DoD checklist |
| S4 | Ledger invariants hold; reversals on refund; expiry job idempotent | Integration suite |
| S5 / S6 | Content, consent, referral and support workflows green | E2E |
| S7 / launch | Decision H1 launch definition met; all D1–D16 evidence attached for launch-scope pages | Release readiness review |

## 3. Workflow E2E matrix

| Test | Workflow | Sprint | Accounts | Verification (from doc 04) | Authoritative record checked | Prior defects | Status |
|---|---|---|---|---|---|---|---|
`;
  for (const x of workflows) t += `| ${x.id} | ${esc(x.name)} | ${esc(x.sprint)} | ${role[x.area] || 'Customer'} | ${esc(x.test)} | ${esc(x.record)} | ${x.bw.join(', ') || '—'} | NOT RUN |\n`;
  t += `
## 4. Non-workflow suites

| Suite | Content | Sprint | Status |
|---|---|---|---|
| SQL / RLS | anon and authenticated cannot execute service RPCs; cannot write orders, notifications, reviews, meetings; privileged columns ignored on INSERT and UPDATE | S0B-1 | NOT RUN |
| Static gates | No mock imports in production bundle; no card-number inputs outside Stripe Elements; no client code writes membership, tickets, credits, cash or points; no new \`localStorage\` keys for server-owned data (doc 06) | S0B-2, then every sprint | NOT RUN |
| Redirects | Every REDIRECT/CONSOLIDATE row in 05 CSV lands on its target with query and hash preserved; every email and stored deep link resolves | S2/S3 | NOT RUN |
| Page Definition of Done | D1–D16 per page (doc 13) | S2–S6 | NOT RUN |
| Visual regression | Gates G1–G5 (doc 12): screenshots at the listed widths compared with the approved current pages | S2–S6 | NOT RUN |
| Accessibility | 44px targets, semantic buttons for the 135 non-semantic clickables, focus ring #EB1C24, contrast | S2/S3 | NOT RUN |
| Cross-product smoke | SITE00 sign-in + profile sync, JURNL signup, FRONTAL SLAYER signup | every DB sprint | NOT RUN |
| Reconciliation | Nightly Stripe ↔ orders and ledger ↔ cached balances produce zero unexplained mismatches over 7 days on staging | S1/S4 | NOT RUN |

## 5. Coverage of prior broken workflows

Every audit broken workflow (BW-01…BW-25) maps to at least one test above:

| BW | Tests |
|---|---|
`;
  for (let i = 1; i <= 25; i++) { const b = 'BW-' + String(i).padStart(2, '0'); const ts = workflows.filter(x => x.bw.includes(b)).map(x => x.id); t += `| ${b} | ${ts.join(', ') || 'MISSING'} |\n`; }
  fs.writeFileSync(path.join(OUT, '19_RELEASE_READINESS_AND_E2E_TEST_MATRIX.md'), t);
}
