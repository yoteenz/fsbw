const fs = require('fs');
const R = require('./triage.cjs');
const OUT = process.argv[2];
const CAT = { 1: 'Founder', 2: 'Engineering default', 3: 'Established', 4: 'Blocked by evidence' };
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const recOf = r => { const o = r.options.find(x => x.key === r.originalRec); return o ? `${o.key}. ${o.label}` : '—'; };
const W = {
  1: { t: 'WAVE 1 — Immediate security and operational safety', auth: 'Rehearsing the S0B-1 database containment (M1A, M2, M3) on a staging environment, then, after a second explicit approval (A1b) backed by the staging evidence, applying the same files to production.', not: 'Any application change (S0B-2), any page-tree work, any rewards rule, M1B (blocked), any SITE00 object.' },
  2: { t: 'WAVE 2 — Application payment and security containment', auth: 'The S0B-2 containment items in doc 15: BAW interim checkout path, cancellation path, mock quarantine, Slay Ticket pause, autopay dormancy, Slay Cam copy.', not: 'Any visual redesign, any reward economics, the order of record (S1), any desktop/tablet presentation work.' },
  3: { t: 'WAVE 3 — Customer and admin experience architecture', auth: 'The mobile account tree (B1), the admin tree per page (C1), roles (C2), order stages (C4) and the experience-authority questions XD-1/XD-2.', not: 'Visual designs of new pages (each still needs its own approval), rewards rules, any change to the desktop Tower rooms.' },
  4: { t: 'WAVE 4 — Rewards and membership economics', auth: 'The rule values that S4–S6 implement. Established rules (D1, D2, D4, D11 amounts, D6 copy values, D8 amounts) are recorded, not re-asked.', not: 'Implementation of any reward; the $20 referral incentive is not implemented automatically.' },
  5: { t: 'WAVE 5 — Remaining product and experience decisions', auth: 'Product, legal-wording and visual decisions for S2/S3/S5/S6 and the launch definition.', not: 'Anything in waves 1–4.' },
};
let md = `# 07 — Founder Approval Waves

The 55 original decisions (plus 3 carried forward from the audit and 3 new experience decisions) are triaged in \`06_FOUNDER_DECISION_TRIAGE.csv\`. Only **genuine founder decisions** go into a wave. Engineering defaults are listed for **acknowledgement or objection**, not approval. Already-established rules are listed with their evidence, and can be **reversed** but need not be re-decided.

**Approving a wave approves only the decisions listed in that wave.** It does not approve implementation of other waves, any page design, or any production change that the wave does not name. **Nothing below has been approved.** Every state is RECOMMENDED or BLOCKED.

| Classification of the 55 originals | Count |
|---|---|
| Genuine founder decisions | ${R.filter(r => r.origin.startsWith('V2') && r.cat === 1).length} |
| Engineering defaults | ${R.filter(r => r.origin.startsWith('V2') && r.cat === 2).length} |
| Already established (evidence cited) | ${R.filter(r => r.origin.startsWith('V2') && r.cat === 3).length} |
| Blocked by missing evidence | ${R.filter(r => r.origin.startsWith('V2') && r.cat === 4).length} |
| **Total** | ${R.filter(r => r.origin.startsWith('V2')).length} |
| Carried forward from the audit (dropped by V2, never deleted) | D14 (FD-A5), D15 (FD-R4), D16 (FD-R12) |
| New, from the experience-authority correction | XD-1, XD-2, XD-3 |

`;
for (const w of [1, 2, 3, 4, 5]) {
  const rows = R.filter(r => r.wave === w);
  const f = rows.filter(r => r.cat === 1).length;
  md += `\n## ${W[w].t}\n\n**${f} founder decision${f === 1 ? '' : 's'}.** Approving this wave authorizes: ${W[w].auth}\n\n**It does not authorize:** ${W[w].not}\n\n| ID | Decision | Type | Original V2 recommendation | Proposed disposition (this sprint) | Gate |\n|---|---|---|---|---|---|\n`;
  for (const r of rows) md += `| ${r.id} | ${esc(r.subject)} | ${CAT[r.cat]} | ${esc(recOf(r))} | ${esc(r.disposition)} | ${esc(r.impl || r.gate)} |\n`;
}
const zero = R.filter(r => r.wave === 0);
md += `\n## No wave: engineering defaults and established rules (for acknowledgement or objection)\n\n| ID | Subject | Type | Evidence / reason | Disposition |\n|---|---|---|---|---|\n`;
for (const r of zero) md += `| ${r.id} | ${esc(r.subject)} | ${CAT[r.cat]} | ${esc(r.authority)} | ${esc(r.disposition)} |\n`;
md += `\n## Where the V2 recommendation was withdrawn or superseded\n\n| ID | Status | Why |\n|---|---|---|\n`;
for (const r of R.filter(r => ['WITHDRAWN', 'SUPERSEDED'].includes(r.v2))) md += `| ${r.id} | ${r.v2} | ${esc(r.reason)} — ${esc(r.authority)} |\n`;
md += `\n## Immediate founder actions (Wave 1)\n\n1. **H2: staging.** Ask the operator for three facts: the Supabase plan tier, the production domain, and whether Stripe test keys exist. Then choose the staging option (doc 13 recommends a separate staging Supabase project + Vercel Preview + Stripe test mode).\n2. **A1a: approve rehearsal** of M1A, M2 and M3 on staging. A1b (production) comes later, as a separate approval with the evidence attached.\n3. **H3: acknowledge** the shared-database rules and ask the SITE00 owner to run the SITE00/JURNL smoke test on staging (doc 11 §4).\n4. **U-01 (an action, not a decision):** have the operator complete doc 12 §3 checks A–D. **No keys in chat.**\n`;
fs.writeFileSync(OUT, md);
