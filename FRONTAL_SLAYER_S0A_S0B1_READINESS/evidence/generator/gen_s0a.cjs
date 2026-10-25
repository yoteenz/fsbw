// Generates 05 parity CSV, 06 triage CSV, 17 manifest template and the board V3 data embed.
const fs = require('fs'), path = require('path');
const OUT = process.argv[2];
const P = require('./parity.cjs');
const R = require('./triage.cjs');
const pages = require('../../../FRONTAL_SLAYER_FINAL_ARCHITECTURE_APPROVAL/evidence/generator/pages.cjs');
const CAT = { 1: 'TRUE FOUNDER DECISION', 2: 'ENGINEERING DEFAULT', 3: 'ALREADY ESTABLISHED', 4: 'BLOCKED BY MISSING EVIDENCE' };
const WAVE = { 0: 'No wave (default or established; listed for objection)', 1: 'WAVE 1 — Immediate security and operational safety', 2: 'WAVE 2 — Application payment and security containment', 3: 'WAVE 3 — Customer and admin experience architecture', 4: 'WAVE 4 — Rewards and membership economics', 5: 'WAVE 5 — Remaining product and experience decisions' };
const cell = v => { const s = Array.isArray(v) ? v.join('; ') : (v == null ? '' : String(v)); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const csv = (f, h, rows) => fs.writeFileSync(path.join(OUT, f), [h.map(cell).join(',')].concat(rows.map(r => r.map(cell).join(','))).join('\n') + '\n');

csv('05_EXPERIENCE_PARITY_MATRIX.csv',
  ['CAPABILITY ID','SHARED CAPABILITY','MOBILE PRESENTATION','MOBILE STATUS','DESKTOP/TABLET PRESENTATION','DESKTOP/TABLET STATUS','ADMIN PRESENTATION','ADMIN STATUS','AUTHORITATIVE DATA OWNER (TARGET)','CURRENT DATA SOURCE','IMPLEMENTATION STATUS','FOUNDER APPROVAL STATUS','DECISIONS','DO NOT DUPLICATE VISUALLY / NOTES'],
  P.map(p => [p.id, p.cap, p.mob, p.mobS, p.dsk, p.dskS, p.adm, p.admS, p.owner, p.src, p.impl, p.founder, p.decisions, p.note]));

csv('06_FOUNDER_DECISION_TRIAGE.csv',
  ['DECISION ID','ORIGIN','GROUP','SUBJECT','CURRENT STATE','EVIDENCE','ORIGINAL OPTIONS','ORIGINAL RECOMMENDATION','PRIOR AUDIT IDS','CLASSIFICATION','HISTORICAL AUTHORITY (CITED)','V2 RECOMMENDATION STATUS','PROPOSED DISPOSITION','REASON','DEPENDENCIES','IMPLEMENTATION GATE','APPROVAL WAVE','DECISION STATE','FOUNDER SELECTION'],
  R.map(r => [r.id, r.origin, r.group, r.subject, r.current, r.evidence, r.options.map(o => o.key + ') ' + o.label + ' — ' + o.consequence).join(' | '), r.originalRec, r.priorAuditIds, r.cat + ' ' + CAT[r.cat], r.authority, r.v2, r.disposition, r.reason, r.deps, (r.gate || '') + (r.impl ? ' / ' + r.impl : ''), WAVE[r.wave], r.state, '— (not recorded)']));

const orig = R.filter(r => r.origin.startsWith('V2'));
const counts = { original: orig.length, genuineFounder: orig.filter(r => r.cat === 1).length, engineeringDefaults: orig.filter(r => r.cat === 2).length, alreadyEstablished: orig.filter(r => r.cat === 3).length, blockedByEvidence: orig.filter(r => r.cat === 4).length, carriedForward: R.filter(r => r.origin.startsWith('Audit')).map(r => r.id), newExperienceDecisions: R.filter(r => r.origin.startsWith('NEW')).map(r => r.id) };
const waves = [1, 2, 3, 4, 5].map(w => ({ wave: w, title: WAVE[w], founderDecisions: R.filter(r => r.wave === w && r.cat === 1).map(r => r.id), defaultsForAcknowledgement: R.filter(r => r.wave === w && r.cat === 2).map(r => r.id), blockedByEvidence: R.filter(r => r.wave === w && r.cat === 4).map(r => r.id) }));

const manifest = {
  templateVersion: '3.0',
  sprintId: 'P0.FRONTAL-SLAYER.OPUS.S0A-FOUNDER-DECISION-TRIAGE-AND-S0B1-SECURITY-CONTAINMENT-READINESS.V1',
  status: 'TEMPLATE — NO DECISION RECORDED',
  approvalRecorded: false,
  howToRecord: 'For each decision you decide, set founderSelection to an option key (or "custom" with a note), state to FOUNDER APPROVED | FOUNDER REJECTED | DEFERRED, decidedBy, decidedAt (ISO 8601). Approving one wave does not approve any other wave. A selection in the board that is not recorded in its decision store, or not committed in this file, is SELECTED — NOT RECORDED and has no authority.',
  stateVocabulary: ['RECOMMENDED', 'SELECTED — NOT RECORDED', 'FOUNDER APPROVED', 'FOUNDER REJECTED', 'DEFERRED', 'BLOCKED', 'IMPLEMENTED', 'VERIFIED'],
  traceability: { architecturePackageCommit: 'df982a37', initialAuditCommit: '4863456a3c73e9c3acb8cc913294a5a1025ed1ab', priorBoard: 'https://claude.ai/artifact/CpzJCzVGRK5HpEDzz91r82' },
  experienceAuthority: { rule: 'Customer Mobile, Customer Desktop/Tablet and Administration are separate experience authorities sharing business records, not UI.', source: 'Founder sprint brief 2026-10-25', confirmedByFounder: null },
  counts, waves,
  waveApprovals: waves.map(w => ({ wave: w.wave, approvedBy: null, approvedAt: null, scopeNote: 'Approves only the listed decisions of this wave.' })),
  s0b1: { candidateMigrations: ['M1A','M2','M3'], blocked: ['M1B'], approvals: [
    { id: 'A1a', meaning: 'Rehearse M1A+M2+M3 on staging', state: 'RECOMMENDED', decidedBy: null, decidedAt: null },
    { id: 'A1b', meaning: 'Apply M1A+M2+M3 to production after staging evidence', state: 'RECOMMENDED', decidedBy: null, decidedAt: null, requires: ['A1a', 'staging evidence pack', 'H3 acknowledgement'] } ] },
  evidenceItems: [ { id: 'U-01', subject: 'Service-role key present in FS and SITE00 production', status: 'OPEN', resolvedBy: null, resolvedAt: null }, { id: 'H2-evidence', subject: 'Supabase plan tier, production domain, Stripe test keys', status: 'OPEN' }, { id: 'A8-evidence', subject: 'Read-only Stripe history for affected payments', status: 'OPEN' }, { id: 'XD-3-evidence', subject: 'Production domain and what ≥1024px visitors see', status: 'OPEN' } ],
  decisions: R.map(r => ({ id: r.id, origin: r.origin, group: r.group, subject: r.subject, classification: CAT[r.cat], wave: r.wave, options: r.options.map(o => ({ key: o.key, label: o.label })), recommendation: r.originalRec, v2RecommendationStatus: r.v2, proposedDisposition: r.disposition, state: r.state, founderSelection: null, note: '', decidedBy: null, decidedAt: null, implementationGate: r.impl || r.gate })),
};
fs.writeFileSync(path.join(OUT, '17_APPROVAL_MANIFEST_TEMPLATE.json'), JSON.stringify(manifest, null, 2) + '\n');

if (process.argv[3]) {
  const custPages = pages.filter(p => p.tree === 'customer');
  fs.writeFileSync(process.argv[3], 'window.S0A=' + JSON.stringify({ parity: P, triage: R, counts, waves, CAT, WAVE, mobilePages: custPages, adminPages: pages.filter(p => p.tree === 'admin') }).replace(/</g, '\\u003c') + ';\n');
}
console.log(JSON.stringify(counts));
