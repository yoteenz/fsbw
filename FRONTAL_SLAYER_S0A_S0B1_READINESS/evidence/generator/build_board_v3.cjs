const fs = require('fs'), path = require('path');
const OUTDIR = process.argv[2];
const dataJs = fs.readFileSync(path.join(__dirname, 'board_data.js'), 'utf8');
global.window = {}; eval(dataJs); const A = window.S0A;
const mk = m => ({ EXISTING: { c: 'OWN', t: 'Existing' }, NEW: { c: 'NONE', t: 'New (proposed)' }, CONSOLIDATED: { c: 'STATIC', t: 'Folded' }, RETIRED: { c: 'COMING', t: 'Retired' }, BLOCKED: { c: 'HANDOFF', t: 'Blocked' } }[m] || { c: '', t: m });
const groupTree = (pages) => { const fams = [...new Set(pages.map(p => p.family))]; return fams.map(f => { const ps = pages.filter(p => p.family === f); const ids = new Set(ps.map(p => p.id)); return { family: f, items: ps.map(p => ({ name: p.name, route: p.canonical, tags: [mk(p.marker)], depth: ids.has(p.parent) ? 1 : 0 })) }; }); };
const mobilePages = A.mobilePages.filter(p => !['ADJACENT'].includes(p.family) && !/^\/desktop/.test(p.route));
const mobileGroups = [{ family: 'ENTRY (mobile)', items: [
  { name: 'Lobby ↔ Lounge', route: '/ → /lobby, /lobby/lounge', tags: [{ c: 'OWN', t: 'Existing' }] },
  { name: 'Shop / Tools', route: '/home/shop, /home/tools, /shop/*, /units/*, /tools/*', tags: [{ c: 'OWN', t: 'Existing' }] },
  { name: 'Build-A-Wig Atelier', route: '/build-a-wig/*', tags: [{ c: 'OWN', t: 'Existing' }] },
  { name: 'Bag · Checkout · Booking', route: '/bag, /checkout*, /booking/*', tags: [{ c: 'OWN', t: 'Existing' }] }] }].concat(groupTree(mobilePages));
const T = (name, route, kind, label, depth) => ({ name, route, tags: [{ c: kind, t: label }], depth: depth || 0 });
const desktopGroups = [
  { title: 'ENTRY (desktop/tablet)', items: [T('Landing ≥1024px', '/ → /desktop/penthouse?room=showroom', 'OWN', 'Existing'), T('After sign-in ≥768px', '→ /desktop/concierge?zone=reception', 'OWN', 'Existing'), T('Account ≥768px', '/account → /desktop/account', 'OWN', 'Existing')] },
  { title: 'L4 PENTHOUSE · /desktop/penthouse', items: [T('Showroom (default)', '?room=showroom', 'OWN', 'Existing', 1), T('Analysis Lab', '?room=analysis-lab', 'OWN', 'Existing', 1), T('Extensions Boutique', '?room=boutique', 'OWN', 'Existing', 1)] },
  { title: 'L3 LOBBY · /desktop/lobby', items: [T('Grand Lobby (default)', '?zone=grand-lobby', 'OWN', 'Existing', 1), T('Build-A-Wig Atelier', '?zone=build-a-wig-atelier', 'OWN', 'Existing', 1), T('Members Lounge', '?zone=members-lounge', 'COMING', 'Coming soon', 1)] },
  { title: 'L2 GALLERY · /desktop/gallery', items: [T('Cinema Suite (default)', '?zone=lounge', 'OWN', 'Existing', 1), T('Rewards Gallery · certification wall', '?zone=rewards-gallery', 'COMING', 'Coming soon', 1), T('Slay Cam Gallery', '?zone=slay-cam-gallery', 'COMING', 'Coming soon', 1)] },
  { title: 'L1 CONCIERGE · /desktop/concierge', items: [T('Reception (default; sign-in landing)', '?zone=reception', 'STATIC', 'Static content', 1), T('Founder Suite', '?zone=founder-suite', 'OWN', 'Existing', 1), T('PSA Suite (hologram)', '?zone=psa-suite', 'OWN', 'Existing', 1)] },
  { title: 'OFF-TOWER ROOMS', items: [T('Penthouse Suite (account root)', '/desktop/account', 'OWN', 'Existing'), T('12 panels → mobile /account/* pages', 'orders, rewards, settings, wishlist, referrals, affiliate, collectibles, load-card …', 'HANDOFF', 'Hand-off · XD-1', 1), T("Curator's Tablet (bag)", '/desktop/shopping-bag', 'OWN', 'Existing'), T('Acquisition tablet (checkout)', '/desktop/acquisition[/bookings|/gift-card|/slay-tickets]', 'OWN', 'Existing'), T('Transformation Suite (bookings)', '/desktop/booking-suite → mobile /booking/*', 'STATIC', 'Static · hand-off'), T('Alerts room', '/desktop/alerts (hardcoded content)', 'STATIC', 'Static · EC-4')] },
  { title: 'NO DESKTOP PRESENCE YET', items: [T('Order detail', 'mobile Concierge tracking only', 'NONE', 'None · XD-1'), T('Leave a review', 'mobile only', 'NONE', 'None · XD-1')] },
  { title: 'LEGACY', items: [T('Old desktop paths', '/desktop/lounge, /desktop/slay-cam → gallery; /desktop/notifications → alerts', 'COMING', 'Redirect'), T('Orphan page', 'src/pages/desktop-lobby (not routed)', 'COMING', 'Orphan')] },
];
const adminGroups = groupTree(A.adminPages);
const triage = A.triage;
const extraApprovals = [
  { id: 'A1a', origin: 'S0A split of A1', group: 'A. Security/payment', subject: 'Rehearse the S0B-1 database containment (M1A, M2, M3) on staging', current: 'Candidate SQL is review-ready in 10_CANDIDATE_MIGRATIONS; nothing executed.', cat: 1, wave: 1, state: 'RECOMMENDED', options: [{ key: '1', label: 'Approve the rehearsal on staging', consequence: 'Staging only; production untouched; produces the evidence pack for A1b' }, { key: '2', label: 'Not yet', consequence: 'R-01, R-04, R-10 stay open in production' }], originalRec: '1', disposition: 'Rehearse V0 → M1A → M2 → M3 → V1 on staging; SITE00/JURNL smoke; doc 14 test plan.', reason: 'Start of production-risk acceptance; no production change.', authority: 'Doc 09, 10, 14.', deps: ['H2', 'H3'], impl: 'S0B-1 rehearsal' },
  { id: 'A1b', origin: 'S0A split of A1', group: 'A. Security/payment', subject: 'Apply M1A, M2, M3 to production after the staging evidence', current: 'Requires A1a and a passed staging rehearsal.', cat: 1, wave: 1, state: 'BLOCKED', options: [{ key: '1', label: 'Approve the production apply', consequence: 'Closes R-01, R-04, R-10 in production; rollback files ready' }, { key: '2', label: 'Defer', consequence: 'Exposure remains' }], originalRec: '1', disposition: 'Blocked until A1a is recorded and the staging evidence pack is attached.', reason: 'Production DDL on a database shared with SITE00/JURNL.', authority: '.cursor/rules/supabase-production-migrations.mdc:33', deps: ['A1a', 'staging evidence', 'U-22 backups'], impl: 'S0B-1 production' },
];
const waveMeta = { 1: { title: 'Wave 1 · Immediate security and operational safety', scope: 'Approves only the staging rehearsal (A1a), later the production apply (A1b), staging choice (H2) and SITE00 coordination (H3).' }, 2: { title: 'Wave 2 · Application payment and security containment', scope: 'Approves only the S0B-2 containment items named here.' }, 3: { title: 'Wave 3 · Customer and admin experience architecture', scope: 'Mobile tree, admin pages, roles, order stages, and the desktop/tablet authority questions. Not visual designs.' }, 4: { title: 'Wave 4 · Rewards and membership economics', scope: 'Rule values only; established rules are recorded, not re-asked.' }, 5: { title: 'Wave 5 · Remaining product and experience decisions', scope: 'Product, legal wording, visual and launch decisions.' }, 0: { title: 'No wave · defaults and established rules', scope: 'For acknowledgement or objection; recording is optional.' } };
const migrations = [
  { id: 'M1A', title: 'Revoke EXECUTE on 10 FS value/quota RPC signatures', status: 'READY FOR REVIEW', detail: 'REVOKE … FROM PUBLIC, anon, authenticated; GRANT service_role. Includes the legacy 2-arg refund overload. All callers use fail-closed service clients.', closes: 'R-01', site00: 'none', gate: 'A1a → staging → A1b' },
  { id: 'M2', title: 'Drop 8 legacy customer write policies', status: 'READY FOR REVIEW', detail: 'orders insert/update, meetings insert/update/delete, notifications insert/update, reviews insert. SELECT policies kept. No browser or SITE00 writer.', closes: 'R-04 (and R-09 metadata path)', site00: 'none', gate: 'A1a → staging → A1b' },
  { id: 'M3', title: 'Accept the 4-pack; all-or-nothing grant', status: 'READY FOR REVIEW', detail: 'Grant and refund accept 1/3/4/6; an invalid count records no grant so a replay can repair it. 0 grant rows today.', closes: 'R-10 + mixed-cart defect', site00: 'none', gate: 'A1a → staging → A1b' },
  { id: 'M1B', title: 'Studio budget + public payload RPCs', status: 'BLOCKED', detail: 'Callers use getSupabaseAdmin(), which silently falls back to the anon key; blocked until the service-role key is confirmed (U-01).', closes: 'R-01 (Studio)', site00: 'none', gate: 'U-01 + Studio OS owner' },
];
const critical = [
  { id: 'R-01', risk: 'Public-key minting of hair-analysis credits (and quota RPCs)', conf: 'Live re-verified 2026-10-25', containment: 'M1A', approval: 'A1a/A1b' },
  { id: 'R-10', risk: '$60 four-comparison pack grants nothing', conf: 'Live re-verified', containment: 'M3', approval: 'A1a/A1b' },
  { id: 'R-05', risk: 'Slay Tickets credited without payment', conf: 'Code-confirmed', containment: 'S0B-2 #5 (410 + pause)', approval: 'A6 default' },
  { id: 'R-15', risk: 'Cancellation does not stop Stripe billing', conf: 'Code-confirmed; 0 subscriptions in DB', containment: 'S0B-2 #3 (portal)', approval: 'A4' },
  { id: 'R-03', risk: 'BAW options not charged (undercharged, not blocked)', conf: 'Code-confirmed (corrected)', containment: 'S0B-2 #1 (custom quote)', approval: 'A2' },
  { id: 'R-11', risk: 'No server order of record', conf: 'Code-confirmed; 0 orders in DB', containment: 'M2 now; S1 fix', approval: 'C4 (S1)' },
];
const evidence = [
  { id: 'U-01', what: 'Service-role key present in FS (Vercel) and SITE00 (Railway) production; bundles hold only anon keys', blocks: 'M1B; confidence for M1A/M2' },
  { id: 'U-17', what: 'Which domain serves production; is fsbw.vercel.app production?', blocks: 'XD-3, H2, mock quarantine' },
  { id: 'U-19', what: 'Supabase plan tier and branching', blocks: 'H2' },
  { id: 'U-20', what: 'Stripe test keys, Price IDs, portal configuration', blocks: 'H2, A4' },
  { id: 'U-21', what: 'Owner and effect of trg_log_profile_changes (out-of-band)', blocks: 'Future profile trigger changes' },
  { id: 'U-22', what: 'PITR / backups on the shared project', blocks: 'A1b' },
  { id: 'A8', what: 'Read-only Stripe history for affected payments', blocks: 'Remediation' },
  { id: 'U-18', what: 'What ≥1024px visitors see on production today', blocks: 'XD-3' },
];
const sprints = [
  { id: 'S0B-1 rehearsal', xp: 'Backend (all)', founder: ['A1a', 'H2'], other: 'H3 ack; staging', state: 'BLOCKED: H2 evidence' },
  { id: 'S0B-1 production', xp: 'Backend (all)', founder: ['A1b'], other: 'Staging evidence; U-22', state: 'BLOCKED' },
  { id: 'S0B-2', xp: 'Mobile checkout + desktop Acquisition + admin numbers', founder: ['A2', 'A4', 'A5', 'F1'], other: 'Defaults A3, A6, A7, E2', state: 'BLOCKED: wave 2' },
  { id: 'S0B-1b', xp: 'Backend', founder: [], other: 'U-01, U-21, SITE00 owner', state: 'BLOCKED' },
  { id: 'S1', xp: 'Records (all)', founder: ['C4'], other: 'S0B-1 done', state: 'BLOCKED' },
  { id: 'S1B', xp: 'BAW logic (both Ateliers)', founder: [], other: 'S1; E5 default', state: 'BLOCKED' },
  { id: 'S2-M', xp: 'Mobile only', founder: ['B1', 'B3', 'B8', 'G4', 'XD-2'], other: 'S1', state: 'BLOCKED: wave 3' },
  { id: 'S2-D', xp: 'Desktop/tablet only', founder: ['XD-1', 'XD-2'], other: 'S1', state: 'BLOCKED: XD-1' },
  { id: 'S3', xp: 'Admin only', founder: ['C1', 'C2', 'C3', 'G2', 'G3'], other: 'S1', state: 'BLOCKED' },
  { id: 'S4', xp: 'Ledger (all)', founder: ['D3', 'D5', 'D9', 'D11', 'D13', 'D15'], other: 'S1', state: 'BLOCKED: wave 4' },
  { id: 'S5', xp: 'Mobile + desktop + admin', founder: ['B2', 'E1', 'E3', 'D7', 'F2', 'F4', 'F5'], other: 'S4', state: 'BLOCKED' },
  { id: 'S6', xp: 'All', founder: ['D6', 'D8', 'B7', 'G5'], other: 'S4', state: 'BLOCKED' },
  { id: 'S7', xp: 'All', founder: ['H1', 'XD-3'], other: 'U-17, U-18', state: 'BLOCKED' },
];
const X = { mobileGroups, desktopGroups, adminGroups, extraApprovals, waveMeta, migrations, critical, evidence, sprints };
const slim = { parity: A.parity, triage: A.triage, counts: A.counts, waves: A.waves };
const html = fs.readFileSync(path.join(__dirname, 'board_v3_template.html'), 'utf8').replace('/*__DATA__*/', 'window.S0A=' + JSON.stringify(slim).replace(/</g, '\\u003c') + ';\nwindow.S0AX=' + JSON.stringify(X).replace(/</g, '\\u003c') + ';');
fs.mkdirSync(OUTDIR, { recursive: true });
fs.writeFileSync(path.join(OUTDIR, 'index.html'), html);
console.log('bytes', html.length);
