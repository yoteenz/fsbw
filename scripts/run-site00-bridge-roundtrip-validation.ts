#!/usr/bin/env npx tsx
/**
 * P0.BRIDGE.1A-FSBW — Live SITE 00 → Supabase → FSBW round-trip validation (production control plane).
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Site00DesignBridge } from '../api/_lib/site00DesignBridge/bridge.js';
import { FSBW_REPO_BINDING } from '../api/_lib/site00DesignBridge/types.js';
import type { BridgeRoundTripValidationReceipt, RepoHealthValidationReceipt } from '../api/_lib/site00DesignBridge/validationReceipts.js';
import {
  BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID,
  BRIDGE_ROUNDTRIP_FIXTURE_PATH,
  BRIDGE_ROUNDTRIP_VALIDATION_ID,
} from '../api/_lib/site00DesignBridge/validationReceipts.js';
import { getSupabaseAdmin } from '../api/_lib/supabase.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const artifactsDir = '/opt/cursor/artifacts';

function gitHead(): string {
  return execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function run(cmd: string): { code: number; output: string } {
  try {
    const output = execSync(cmd, { cwd: repoRoot, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { code: 0, output };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

async function ensureChangeRequest(baseCommit: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from('site00_design_change_requests')
    .select('change_request_id')
    .eq('change_request_id', BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID)
    .maybeSingle();

  if (existing) return;

  const { error } = await supabase.from('site00_design_change_requests').insert({
    change_request_id: BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID,
    project_id: 'STUDIO_WORLD_WEBSITE',
    repo_binding: FSBW_REPO_BINDING,
    status: 'READY_FOR_REPO',
    design_version: 'site00-bridge-validation@1',
    base_source_commit: baseCommit,
    target_branch: 'master',
    operations: [
      {
        type: 'UPDATE_PAGE_METADATA',
        targetPath: BRIDGE_ROUNDTRIP_FIXTURE_PATH,
        value: {
          bridgeValidation: true,
          validationId: BRIDGE_ROUNDTRIP_VALIDATION_ID,
          executionClass: 'BRIDGE_ROUNDTRIP_VALIDATION',
          founderApprovedTestFixture: true,
        },
      },
    ],
    metadata: {
      executionClass: 'BRIDGE_ROUNDTRIP_VALIDATION',
      founderApprovedTestFixture: true,
      customerImpact: 'NONE',
    },
    founder_approved_at: new Date().toISOString(),
    risk_level: 'LOW',
  });

  if (error) throw new Error(`Failed to seed change request: ${error.message}`);
}

async function fetchReceiptEvents(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_change_receipts')
    .select('event')
    .eq('change_request_id', BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => (r as { event: string }).event);
}

async function fetchChangeStatus(): Promise<{ status: string; fsbw_status: string | null } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('site00_design_change_requests')
    .select('status, fsbw_status')
    .eq('change_request_id', BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as { status: string; fsbw_status: string | null } | null;
}

async function main() {
  mkdirSync(artifactsDir, { recursive: true });

  const typecheck = run('npx tsc --noEmit');
  const bridgeTests = run('npm run test -- api/_lib/site00DesignBridge/site00DesignBridge.test.ts');
  const captureTests = run(
    'npm run test -- src/studio-os-core/route-intelligence/route-intelligence.test.ts -t "on-demand|capture|Voice Lab|family-derived|snapshot"',
  );

  const repoHealth: RepoHealthValidationReceipt = {
    typecheck: typecheck.code === 0 ? 'PASS' : 'FAIL',
    build: 'FAIL',
    tests: bridgeTests.code === 0 && captureTests.code === 0 ? 'PASS' : 'FAIL',
    captureRegression: captureTests.code === 0 ? 'PASS' : 'FAIL',
    bridgeTests: bridgeTests.code === 0 ? 'PASS' : 'FAIL',
    status: typecheck.code === 0 && bridgeTests.code === 0 && captureTests.code === 0 ? 'GREEN' : 'BLOCKED',
    timestamp: new Date().toISOString(),
    details: {
      typecheckErrors: typecheck.code !== 0 ? typecheck.output.slice(0, 2000) : undefined,
    },
  };

  writeFileSync(join(artifactsDir, 'repo-health-validation-receipt.json'), JSON.stringify(repoHealth, null, 2));

  if (repoHealth.status !== 'GREEN') {
    console.error(JSON.stringify({ ok: false, repoHealth }, null, 2));
    process.exit(1);
  }

  const baseCommit = gitHead();
  await ensureChangeRequest(baseCommit);

  const bridge = new Site00DesignBridge({ repoRoot });
  const change = await bridge.getChangeById(BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID);
  if (!change) throw new Error('Change request missing after seed');

  const dryPlan = await bridge.runDryRun(change);
  if (dryPlan.status !== 'VALID') {
    console.error(JSON.stringify({ ok: false, dryPlan }, null, 2));
    process.exit(1);
  }

  const applyResult = await bridge.applyMaterializationPlan(change);
  repoHealth.build = applyResult.buildPassed ? 'PASS' : 'FAIL';
  if (!applyResult.buildPassed) {
    const build = run('npm run build');
    repoHealth.build = build.code === 0 ? 'PASS' : 'FAIL';
  }
  repoHealth.status = repoHealth.build === 'PASS' ? 'GREEN' : 'BLOCKED';
  writeFileSync(join(artifactsDir, 'repo-health-validation-receipt.json'), JSON.stringify(repoHealth, null, 2));

  const statusChain = await fetchReceiptEvents();
  const changeStatus = await fetchChangeStatus();
  const duplicate = await bridge.applyMaterializationPlan(change);

  const roundTrip: BridgeRoundTripValidationReceipt = {
    validationId: BRIDGE_ROUNDTRIP_VALIDATION_ID,
    changeRequestId: BRIDGE_ROUNDTRIP_CHANGE_REQUEST_ID,
    projectId: 'STUDIO_WORLD_WEBSITE',
    repo: FSBW_REPO_BINDING,
    sourceCommitBefore: applyResult.commitBefore ?? baseCommit,
    sourceCommitAfter: applyResult.commitAfter ?? baseCommit,
    executionClass: 'BRIDGE_ROUNDTRIP_VALIDATION',
    operationType: 'UPDATE_PAGE_METADATA',
    scope: BRIDGE_ROUNDTRIP_FIXTURE_PATH,
    dryRunStatus: dryPlan.status,
    applyStatus: applyResult.ok ? 'APPLIED' : 'FAILED',
    testsStatus: applyResult.testsPassed ? 'PASS' : 'FAIL',
    buildStatus: applyResult.buildPassed ? 'PASS' : 'FAIL',
    receiptStatus: statusChain.includes('APPLIED') ? 'PERSISTED' : 'INCOMPLETE',
    idempotencyStatus: duplicate.ok === false && /idempotency/i.test(duplicate.error ?? '') ? 'PROVED' : 'UNKNOWN',
    customerImpact: 'NONE',
    supabaseTable: 'site00_design_change_requests / site00_change_receipts',
    statusChain,
    timestamp: new Date().toISOString(),
  };

  writeFileSync(join(artifactsDir, 'bridge-roundtrip-validation-receipt.json'), JSON.stringify(roundTrip, null, 2));

  const site00Readable =
    changeStatus?.status === 'APPLIED' || changeStatus?.fsbw_status === 'APPLIED';

  const ok =
    applyResult.ok &&
    roundTrip.receiptStatus === 'PERSISTED' &&
    roundTrip.idempotencyStatus === 'PROVED' &&
    site00Readable;

  console.log(
    JSON.stringify(
      {
        ok,
        repoHealth,
        roundTrip,
        changeStatus,
        applyResult,
        duplicateBlocked: duplicate.error,
        fixtureTail: readFileSync(join(repoRoot, BRIDGE_ROUNDTRIP_FIXTURE_PATH), 'utf8').slice(-120),
      },
      null,
      2,
    ),
  );

  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
