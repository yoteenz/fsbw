#!/usr/bin/env node
/**
 * Phone-readable GitHub Actions summary for AIO Production Readiness Suite.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const resultsPath = process.env.AIO_READINESS_RESULTS_PATH ?? '.ci/aio-production-readiness.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const invPath = 'tests/readiness/platform-inventory.json';

if (!existsSync(resultsPath)) {
  console.error('Missing readiness results');
  process.exit(1);
}

const r = JSON.parse(readFileSync(resultsPath, 'utf8'));
const inv = existsSync(invPath) ? JSON.parse(readFileSync(invPath, 'utf8')) : { domains: [] };

const lines = [
  '# AIO Production Readiness Suite',
  '',
  `**Run ID:** \`${r.runId}\``,
  `**Scope:** ${r.testScope}${r.domainSelect !== 'all' ? ` → ${r.domainSelect}` : ''}`,
  `**Project:** \`${r.projectRef}\``,
  `**Project guard:** ${r.projectGuard}`,
  '',
  '## Domain status',
  '',
  '| Domain | Status | Blocker |',
  '|--------|--------|---------|',
];

const labelOrder = inv.domains.map((d) => d.id);
const sorted = Object.values(r.domains).sort((a, b) => {
  const ai = labelOrder.indexOf(a.id);
  const bi = labelOrder.indexOf(b.id);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
});

for (const d of sorted) {
  const pad = d.label.length < 28 ? d.label + '.'.repeat(Math.max(0, 28 - d.label.length)) : d.label;
  lines.push(`| ${d.label} | **${d.status}** | ${d.blocker ?? '—'} |`);
}

lines.push('', '## Cross-cutting', '');
for (const [k, v] of Object.entries(r.crossCutting ?? {})) {
  lines.push(`- **${v.label ?? k}:** ${v.status}`);
}

lines.push(
  '',
  '## Blockers',
  '',
  `- P0: ${r.blockers?.P0 ?? 0}`,
  `- P1: ${r.blockers?.P1 ?? 0}`,
  `- P2: ${r.blockers?.P2 ?? 0}`,
  `- P3: ${r.blockers?.P3 ?? 0}`,
  '',
  `## FINAL READINESS`,
  '',
  `**${r.finalReadiness}**`,
  '',
  '_Deep Supabase migration + live freight validation: use **AIO Supabase Production Validate** workflow separately._',
  '',
);

const md = lines.join('\n');
if (summaryPath) writeFileSync(summaryPath, md + '\n');
console.log(md);
