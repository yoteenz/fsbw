#!/usr/bin/env node
/**
 * Write GitHub Actions job summary + final deployment-readiness status.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const AIO_REF = 'nnnljnhtmseagotvgxxt';
const resultsPath = process.env.AIO_CI_RESULTS_PATH ?? '.ci/aio-validation-results.json';
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const runId = process.env.GITHUB_RUN_ID ?? 'local';
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${runId}`
  : '';

let r = existsSync(resultsPath)
  ? JSON.parse(readFileSync(resultsPath, 'utf8'))
  : { project: AIO_REF };

function norm(v) {
  if (!v) return 'NOT RUN';
  return String(v);
}

const blockers = [];
const checks = [
  ['projectGuard', r.projectGuard],
  ['migrations', r.migrations],
  ['schema', r.schema],
  ['rlsEnablement', r.rlsEnablement],
  ['rls', r.rls],
  ['storage', r.storage],
  ['shipperRepository', r.shipperRepository],
  ['bookkeepingHandoff', r.bookkeepingHandoff],
  ['freightAutopilotPersistence', r.freightAutopilotPersistence],
  ['freightAutopilotIdempotency', r.freightAutopilotIdempotency],
  ['freightAutopilotMultiSession', r.freightAutopilotMultiSession],
  ['autopilotLiveRead', r.autopilotLiveRead],
  ['pretripPersistence', r.pretripPersistence],
  ['dispatchSnapshotPersistence', r.dispatchSnapshotPersistence],
  ['brokenPathRecovery', r.brokenPathRecovery],
  ['goldenPath', r.goldenPath],
  ['financialPrivacy', r.financialPrivacy],
  ['demoIsolation', r.demoIsolation],
  ['productionBuild', r.productionBuild],
  ['migrationHistory', r.migrationHistory?.historyStatus ?? r.migrationHistory],
];

for (const [name, status] of checks) {
  const s = norm(status);
  if (s === 'FAIL' || s === 'BLOCKED') {
    blockers.push(`${name}: ${s}`);
  }
}

let finalStatus = r.finalStatus;
if (!finalStatus) {
  if (blockers.length === 0) {
    finalStatus = 'READY TO DEPLOY';
  } else if (
    blockers.length === 1 &&
    blockers[0].startsWith('rls:') &&
    String(r.rls).includes('BLOCKED') &&
    r.migrations === 'PASS' &&
    r.schema === 'PASS' &&
    r.productionBuild === 'PASS'
  ) {
    finalStatus = 'NOT READY TO DEPLOY — BLOCKERS REMAIN';
  } else {
    finalStatus = 'NOT READY TO DEPLOY — BLOCKERS REMAIN';
  }
}

r.finalStatus = finalStatus;
writeFileSync(resultsPath, JSON.stringify(r, null, 2));

const lines = [
  '# AIO Supabase Production Validate',
  '',
  `**AIO PROJECT:** \`${AIO_REF}\``,
  runUrl ? `**Run:** ${runUrl}` : '',
  '',
  '| Gate | Status |',
  '|------|--------|',
  `| PROJECT GUARD | ${norm(r.projectGuard)} |`,
  `| MIGRATIONS | ${norm(r.migrations)} |`,
  `| SCHEMA | ${norm(r.schema)} |`,
  `| RLS (policies enabled) | ${norm(r.rlsEnablement)} |`,
  `| RLS (live tests) | ${norm(r.rls)} |`,
  `| STORAGE | ${norm(r.storage)} |`,
  `| SHIPPER REPOSITORY | ${norm(r.shipperRepository)} |`,
  `| BOOKKEEPING HANDOFF | ${norm(r.bookkeepingHandoff)} |`,
  `| FREIGHT AUTOPILOT PERSISTENCE | ${norm(r.freightAutopilotPersistence)} |`,
  `| FREIGHT AUTOPILOT IDEMPOTENCY | ${norm(r.freightAutopilotIdempotency)} |`,
  `| FREIGHT AUTOPILOT MULTI-SESSION | ${norm(r.freightAutopilotMultiSession)} |`,
  `| AUTOPILOT LIVE READ | ${norm(r.autopilotLiveRead)} |`,
  `| PRE-TRIP PERSISTENCE | ${norm(r.pretripPersistence)} |`,
  `| DISPATCH SNAPSHOT PERSISTENCE | ${norm(r.dispatchSnapshotPersistence)} |`,
  `| BROKEN PATH RECOVERY | ${norm(r.brokenPathRecovery)} |`,
  `| GOLDEN PATH | ${norm(r.goldenPath)} |`,
  `| FINANCIAL PRIVACY | ${norm(r.financialPrivacy)} |`,
  `| DEMO ISOLATION | ${norm(r.demoIsolation)} |`,
  `| PRODUCTION BUILD | ${norm(r.productionBuild)} |`,
  `| MIGRATION HISTORY | ${norm(r.migrationHistory?.historyStatus ?? r.migrationHistory)} |`,
  '',
  `## FINAL STATUS`,
  '',
  `**${finalStatus}**`,
  '',
];

if (r.rlsBlockedReason) {
  lines.push(`> RLS note: ${r.rlsBlockedReason}`, '');
}
if (blockers.length) {
  lines.push('### Blockers', ...blockers.map((b) => `- ${b}`), '');
}
if (r.migrationsPreflight?.localCount) {
  lines.push(`Local migrations: ${r.migrationsPreflight.localCount}`, '');
}

const md = lines.filter(Boolean).join('\n');
if (summaryPath) {
  writeFileSync(summaryPath, md + '\n');
}
console.log(md);
