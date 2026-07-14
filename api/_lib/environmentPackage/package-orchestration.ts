/**
 * Server-side package orchestration — approval, promotion, status, diagnostics.
 */

import {
  appendAuditEvent,
  getPackageById,
  getReadiness,
  immutableApprovalHash,
  insertApproval,
  listGenerationJobs,
  listOutputs,
  setCanonicalPackage,
  upsertPackage,
  upsertReadiness,
} from './persistence.js';
import {
  assertPackagePersistenceAvailable,
  resolveEnvironmentPackageServerFlags,
} from './config.js';
import { createEnvironmentPackageProductionJobs, processEnvironmentPackageJobs } from './generation-pipeline.js';
import { createEnvironmentPackageCdsHandoff } from './cds-handoff.js';

const ESTIMATE_LINE_ITEMS = [
  { kind: 'desktop', dollarsUsd: 0.18, runtimeMs: 45_000 },
  { kind: 'mobile', dollarsUsd: 0.15, runtimeMs: 40_000 },
  { kind: 'tablet', dollarsUsd: 0.15, runtimeMs: 40_000 },
  { kind: 'blueprint', dollarsUsd: 0.12, runtimeMs: 30_000 },
  { kind: 'construction', dollarsUsd: 0.12, runtimeMs: 35_000 },
  { kind: 'lighting', dollarsUsd: 0.09, runtimeMs: 25_000 },
  { kind: 'materials', dollarsUsd: 0.09, runtimeMs: 25_000 },
  { kind: 'heroAssets', dollarsUsd: 0.12, runtimeMs: 30_000 },
  { kind: 'thumbnailAssets', dollarsUsd: 0.06, runtimeMs: 15_000 },
  { kind: 'metadataGeneration', dollarsUsd: 0.03, runtimeMs: 5_000 },
  { kind: 'manifestGeneration', dollarsUsd: 0.03, runtimeMs: 5_000 },
];

export function calculateServerGenerationEstimate() {
  const estimatedDollarsUsd = ESTIMATE_LINE_ITEMS.reduce((s, i) => s + i.dollarsUsd, 0);
  const estimatedRuntimeMs = ESTIMATE_LINE_ITEMS.reduce((s, i) => s + i.runtimeMs, 0);
  return {
    estimatedCredits: 66,
    estimatedDollarsUsd: Math.round(estimatedDollarsUsd * 100) / 100,
    estimatedRuntimeMs,
    estimatedQueueTimeMs: Math.round(estimatedRuntimeMs * 1.15),
    provisional: !process.env.FAL_KEY?.trim(),
    lineItems: ESTIMATE_LINE_ITEMS,
    calculatedAt: new Date().toISOString(),
  };
}

export type ApproveResult =
  | { ok: true; approvalId: string; parentJobId: string; estimate: ReturnType<typeof calculateServerGenerationEstimate> }
  | { ok: false; code: string; message: string };

export async function approvePackageForProductionServer(input: {
  packageId: string;
  approvedBy: string;
  acceptEstimate: boolean;
}): Promise<ApproveResult> {
  const persistence = assertPackagePersistenceAvailable();
  if (!persistence.ok) {
    return { ok: false, code: persistence.code, message: persistence.message };
  }

  if (!input.acceptEstimate) {
    return { ok: false, code: 'PACKAGE_BUDGET_NOT_APPROVED', message: 'Founder must accept generation estimate.' };
  }

  const pkg = await getPackageById(input.packageId);
  if (!pkg) {
    return { ok: false, code: 'PACKAGE_NOT_PERSISTED', message: 'Package not persisted.' };
  }

  const readiness = await getReadiness(input.packageId);
  if (!readiness) {
    return { ok: false, code: 'PACKAGE_NOT_PRODUCTION_READY', message: 'Readiness record missing.' };
  }

  const estimate = calculateServerGenerationEstimate();
  const now = new Date().toISOString();

  await upsertReadiness({
    readiness_id: readiness.readiness_id,
    package_id: input.packageId,
    readiness_percent: 100,
    blockers: [],
    founder_approved: true,
    founder_approved_at: now,
    founder_approved_by: input.approvedBy,
    lifecycle_state: 'production-ready',
    generation_estimate: estimate,
    updated_at: now,
  });

  const auditPayload = {
    packageId: input.packageId,
    approvedBy: input.approvedBy,
    estimate,
    timestamp: now,
  };
  const approval = await insertApproval({
    package_id: input.packageId,
    approval_type: 'production',
    approved_by: input.approvedBy,
    approved_at: now,
    readiness_percent: 100,
    generation_estimate: estimate,
    audit_payload: auditPayload,
    immutable_hash: immutableApprovalHash(auditPayload),
  });
  if (!approval.ok) {
    return { ok: false, code: 'PACKAGE_APPROVAL_REQUIRED', message: approval.error };
  }

  await upsertPackage({
    package_id: input.packageId,
    approved_by: input.approvedBy,
    approved_at: now,
    status: 'production-ready',
    lifecycle_state: 'production-ready',
    generation_estimate: estimate,
    updated_at: now,
  });

  await appendAuditEvent({
    packageId: input.packageId,
    eventType: 'approved',
    actor: input.approvedBy,
    detail: 'Founder approved package for production',
    revision: pkg.revision as number,
    payload: { approvalId: approval.approvalId },
  });

  const jobs = await createEnvironmentPackageProductionJobs(input.packageId);
  if (!jobs.ok) {
    return { ok: false, code: jobs.code, message: jobs.message };
  }

  return { ok: true, approvalId: approval.approvalId, parentJobId: jobs.parentJobId, estimate };
}

export type PromoteResult =
  | { ok: true; handoffId?: string }
  | { ok: false; code: string; message: string };

export async function promotePackageToCanonicalServer(input: {
  packageId: string;
  promotedBy: string;
}): Promise<PromoteResult> {
  const flags = resolveEnvironmentPackageServerFlags();
  if (!flags.enablePackageCanonicalPromotion) {
    return { ok: false, code: 'PACKAGE_CANONICAL_CONFLICT', message: 'Canonical promotion disabled until verified.' };
  }

  const pkg = await getPackageById(input.packageId);
  if (!pkg) {
    return { ok: false, code: 'PACKAGE_NOT_PERSISTED', message: 'Package not found.' };
  }

  if (pkg.lifecycle_state !== 'awaiting-founder-approval' && pkg.status !== 'awaiting-founder-approval') {
    return { ok: false, code: 'PACKAGE_NOT_PRODUCTION_READY', message: 'Package must complete production before canonical promotion.' };
  }

  const outputs = await listOutputs(input.packageId);
  const required = ['desktop', 'mobile', 'tablet'];
  const missing = required.filter((t) => !outputs.find((o) => o.output_type === t && (o.status === 'generated' || o.status === 'cached')));
  if (missing.length > 0) {
    return { ok: false, code: 'PACKAGE_REQUIRED_OUTPUT_MISSING', message: `Missing outputs: ${missing.join(', ')}` };
  }

  await setCanonicalPackage(
    input.packageId,
    input.promotedBy,
    pkg.department_id as string,
    pkg.environment_id as string,
    pkg.theme as string
  );

  await appendAuditEvent({
    packageId: input.packageId,
    eventType: 'canonical-promoted',
    actor: input.promotedBy,
    detail: 'Founder promoted package to canonical',
    revision: pkg.revision as number,
  });

  const readiness = await getReadiness(input.packageId);
  const approvalId = readiness?.founder_approved_by ? `approval-${input.packageId}` : `approval-${input.packageId}`;

  let handoffId: string | undefined;
  if (flags.enablePackageCdsHandoff) {
    const handoff = await createEnvironmentPackageCdsHandoff({
      packageId: input.packageId,
      founderApprovalId: approvalId,
      actor: input.promotedBy,
    });
    if (handoff.ok) handoffId = handoff.handoffId;
  }

  return { ok: true, handoffId };
}

export async function getPackageStatusServer(packageId: string) {
  const persistence = assertPackagePersistenceAvailable();
  if (!persistence.ok) {
    return { ok: false as const, code: persistence.code, message: persistence.message };
  }

  const pkg = await getPackageById(packageId);
  if (!pkg) return { ok: false as const, code: 'PACKAGE_NOT_PERSISTED', message: 'Package not found.' };

  const outputs = await listOutputs(packageId);
  const readiness = await getReadiness(packageId);
  const jobs = await listGenerationJobs(packageId);
  const parentJob = jobs.find((j) => j.job_type === 'ENVIRONMENT_PACKAGE_PRODUCTION') ?? null;
  const health = (pkg.package_health as Record<string, unknown>) ?? {};

  return {
    ok: true as const,
    package: pkg,
    outputs,
    readiness,
    jobs,
    parentJob,
    health,
    diagnostics: {
      packageId,
      variantId: pkg.variant_id,
      databaseRecord: true,
      readinessPercent: readiness?.readiness_percent ?? 0,
      blockers: readiness?.blockers ?? [],
      parentJobId: parentJob?.job_id ?? null,
      childJobCount: jobs.filter((j) => j.parent_job_id).length,
      canonical: pkg.canonical,
      lifecycleState: pkg.lifecycle_state,
    },
  };
}

export async function runPackageWorkerTick(packageId: string) {
  return processEnvironmentPackageJobs(packageId);
}
