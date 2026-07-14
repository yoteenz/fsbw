import type { EnvironmentAssetPackage } from './EnvironmentAssetPackage';
import { resolveOutputUrl } from './EnvironmentPackageOutputs';
import type {
  GenerationCostEstimate,
  GenerationEstimateLineItem,
  PackageLifecycleState,
  ProductionReadinessRecord,
  ReadinessChecklist,
  ReadinessChecklistKey,
  ReadinessCheckStatus,
} from './ProductionReadinessGate';
import {
  buildEmptyChecklist,
  buildReadinessId,
  isLifecycleProductionReady,
  PRODUCTION_READINESS_SCHEMA_VERSION,
  READINESS_CHECKLIST_KEYS,
} from './ProductionReadinessGate';
import {
  appendPackageAuditEntry,
  getProductionReadinessForPackage,
  saveProductionReadiness,
} from './ProductionReadinessRepository';

const ESTIMATE_LINE_ITEMS: Array<{ kind: string; credits: number; dollarsUsd: number; runtimeMs: number }> = [
  { kind: 'desktop', credits: 12, dollarsUsd: 0.18, runtimeMs: 45_000 },
  { kind: 'mobile', credits: 10, dollarsUsd: 0.15, runtimeMs: 40_000 },
  { kind: 'tablet', credits: 10, dollarsUsd: 0.15, runtimeMs: 40_000 },
  { kind: 'blueprint', credits: 8, dollarsUsd: 0.12, runtimeMs: 30_000 },
  { kind: 'construction', credits: 8, dollarsUsd: 0.12, runtimeMs: 35_000 },
  { kind: 'lighting', credits: 6, dollarsUsd: 0.09, runtimeMs: 25_000 },
  { kind: 'materials', credits: 6, dollarsUsd: 0.09, runtimeMs: 25_000 },
  { kind: 'heroAssets', credits: 8, dollarsUsd: 0.12, runtimeMs: 30_000 },
  { kind: 'thumbnailAssets', credits: 4, dollarsUsd: 0.06, runtimeMs: 15_000 },
  { kind: 'metadataGeneration', credits: 2, dollarsUsd: 0.03, runtimeMs: 5_000 },
  { kind: 'manifestGeneration', credits: 2, dollarsUsd: 0.03, runtimeMs: 5_000 },
  { kind: 'futureOutputs', credits: 0, dollarsUsd: 0, runtimeMs: 0 },
];

export type ReadinessEvaluation = {
  record: ProductionReadinessRecord;
  readinessPercent: number;
  blockers: ReadinessChecklistKey[];
  canGenerate: boolean;
};

export type FounderApprovalResult = {
  ok: boolean;
  code?: string;
  message?: string;
  record?: ProductionReadinessRecord;
  queueAuthorized?: boolean;
};

function setCheck(
  checklist: ReadinessChecklist,
  key: ReadinessChecklistKey,
  status: ReadinessCheckStatus,
  message: string | null,
  blocker: boolean
): void {
  checklist[key] = { key, status, message, blocker };
}

export function calculateGenerationEstimate(
  _pkg: EnvironmentAssetPackage
): GenerationCostEstimate {
  const lineItems: GenerationEstimateLineItem[] = ESTIMATE_LINE_ITEMS.map((item) => ({
    kind: item.kind,
    estimatedCredits: item.credits,
    estimatedDollarsUsd: item.dollarsUsd,
    estimatedRuntimeMs: item.runtimeMs,
  }));

  const estimatedCredits = lineItems.reduce((sum, i) => sum + i.estimatedCredits, 0);
  const estimatedDollarsUsd = lineItems.reduce((sum, i) => sum + i.estimatedDollarsUsd, 0);
  const estimatedRuntimeMs = lineItems.reduce((sum, i) => sum + i.estimatedRuntimeMs, 0);

  return {
    estimatedCredits,
    estimatedDollarsUsd: Math.round(estimatedDollarsUsd * 100) / 100,
    estimatedRuntimeMs,
    estimatedQueueTimeMs: Math.round(estimatedRuntimeMs * 1.15),
    lineItems,
    calculatedAt: new Date().toISOString(),
  };
}

function inferLifecycleState(pkg: EnvironmentAssetPackage): PackageLifecycleState {
  if (pkg.archivedAt) return 'archived';
  if (pkg.marketplaceReady) return 'marketplace-ready';
  if (pkg.status === 'generating') return 'generating';
  if (pkg.status === 'production-ready' && pkg.stage === 'production-package') return 'production-ready';
  const hasMobile = Boolean(resolveOutputUrl(pkg.outputs, 'mobile'));
  const hasDesktop = Boolean(resolveOutputUrl(pkg.outputs, 'desktop'));
  if (hasMobile || hasDesktop) return 'preview-ready';
  return 'draft';
}

export function evaluateReadinessChecklist(
  pkg: EnvironmentAssetPackage,
  record: ProductionReadinessRecord
): ReadinessChecklist {
  const checklist = buildEmptyChecklist();
  const hasMobile = Boolean(resolveOutputUrl(pkg.outputs, 'mobile'));
  const hasDesktop = Boolean(resolveOutputUrl(pkg.outputs, 'desktop'));
  const bibleLocked = Boolean(pkg.departmentBibleVersion && pkg.departmentBibleVersion.length > 0);

  setCheck(checklist, 'environmentApproved', pkg.environmentId ? 'passed' : 'failed', null, !pkg.environmentId);
  setCheck(checklist, 'departmentBibleLocked', bibleLocked ? 'passed' : 'failed', bibleLocked ? null : 'Department bible unlocked', !bibleLocked);
  setCheck(checklist, 'variantSelected', pkg.variantId ? 'passed' : 'failed', null, !pkg.variantId);
  setCheck(checklist, 'promptFrozen', pkg.promptHash ? 'passed' : 'failed', pkg.promptHash ? null : 'Prompt missing', !pkg.promptHash);
  setCheck(checklist, 'promptVersionRecorded', pkg.promptVersion ? 'passed' : 'failed', pkg.promptVersion ? null : 'Prompt version missing', !pkg.promptVersion);
  setCheck(checklist, 'seedFrozen', pkg.seed ? 'passed' : 'failed', pkg.seed ? null : 'Seed missing', !pkg.seed);
  setCheck(checklist, 'providerSelected', pkg.provider ? 'passed' : 'failed', pkg.provider ? null : 'Provider missing', !pkg.provider);
  setCheck(
    checklist,
    'generationBudgetApproved',
    record.generationEstimate.estimatedDollarsUsd > 0 ? 'passed' : 'failed',
    'Generation budget missing',
    record.generationEstimate.estimatedDollarsUsd <= 0
  );
  setCheck(checklist, 'desktopPreviewApproved', hasDesktop ? 'passed' : 'pending', hasDesktop ? null : 'Desktop preview not approved', false);
  setCheck(checklist, 'mobilePreviewApproved', hasMobile ? 'passed' : 'pending', hasMobile ? null : 'Mobile preview not approved', false);
  setCheck(checklist, 'themeConfirmed', pkg.theme ? 'passed' : 'failed', pkg.theme ? null : 'Theme missing', !pkg.theme);
  setCheck(checklist, 'canonicalStatusConfirmed', pkg.canonical ? 'passed' : 'pending', null, false);
  setCheck(checklist, 'founderNotesReviewed', record.founderApproved ? 'passed' : 'pending', null, false);
  setCheck(checklist, 'dependenciesResolved', 'passed', null, false);
  setCheck(
    checklist,
    'generationEstimateAccepted',
    record.founderApproved ? 'passed' : 'pending',
    'Generation estimate not accepted',
    false
  );
  setCheck(checklist, 'blueprintGenerationEnabled', 'passed', null, false);
  setCheck(checklist, 'constructionGenerationEnabled', 'passed', null, false);
  setCheck(checklist, 'lightingGenerationEnabled', 'passed', null, false);
  setCheck(checklist, 'materialsGenerationEnabled', 'passed', null, false);
  setCheck(checklist, 'marketplaceEligibilityReviewed', 'not-required', null, false);

  return checklist;
}

export function calculateReadinessPercent(checklist: ReadinessChecklist): number {
  const scorable = READINESS_CHECKLIST_KEYS.filter((k) => checklist[k].status !== 'not-required');
  if (scorable.length === 0) return 0;
  const passed = scorable.filter((k) => checklist[k].status === 'passed').length;
  return Math.round((passed / scorable.length) * 100);
}

export function detectReadinessBlockers(checklist: ReadinessChecklist): ReadinessChecklistKey[] {
  return READINESS_CHECKLIST_KEYS.filter(
    (k) => checklist[k].blocker || checklist[k].status === 'failed'
  );
}

export function createProductionReadinessForPackage(
  pkg: EnvironmentAssetPackage
): ProductionReadinessRecord {
  const now = new Date().toISOString();
  const estimate = calculateGenerationEstimate(pkg);
  const base: ProductionReadinessRecord = {
    schemaVersion: PRODUCTION_READINESS_SCHEMA_VERSION,
    readinessId: buildReadinessId(pkg.packageId),
    packageId: pkg.packageId,
    variantId: pkg.variantId,
    lifecycleState: inferLifecycleState(pkg),
    checklist: buildEmptyChecklist(),
    readinessPercent: 0,
    blockers: [],
    generationEstimate: estimate,
    founderApproved: false,
    founderApprovedAt: null,
    founderApprovedBy: null,
    founderRejectedAt: null,
    founderRejectedBy: null,
    rejectionReason: null,
    auditLog: [],
    authorizedQueueEntry: null,
    createdAt: now,
    updatedAt: now,
    revision: pkg.revision,
  };

  const checklist = evaluateReadinessChecklist(pkg, base);
  const blockers = detectReadinessBlockers(checklist);
  const readinessPercent = calculateReadinessPercent(checklist);

  let record: ProductionReadinessRecord = {
    ...base,
    checklist,
    blockers,
    readinessPercent,
  };

  record = appendPackageAuditEntry(record, {
    eventType: 'created',
    actor: null,
    detail: 'Production readiness record created',
    occurredAt: now,
    revision: pkg.revision,
  });

  saveProductionReadiness(record);
  return record;
}

export function validatePackageReadiness(pkg: EnvironmentAssetPackage): ReadinessEvaluation {
  let record = getProductionReadinessForPackage(pkg.packageId);
  if (!record) record = createProductionReadinessForPackage(pkg);

  const checklist = evaluateReadinessChecklist(pkg, record);
  const blockers = detectReadinessBlockers(checklist);
  const readinessPercent = calculateReadinessPercent(checklist);
  const lifecycleState = record.founderApproved && readinessPercent === 100
    ? 'production-ready'
    : inferLifecycleState(pkg);

  const updated: ProductionReadinessRecord = {
    ...record,
    checklist,
    blockers,
    readinessPercent,
    lifecycleState,
    generationEstimate: calculateGenerationEstimate(pkg),
    updatedAt: new Date().toISOString(),
  };

  const audited = appendPackageAuditEntry(updated, {
    eventType: 'readiness-evaluated',
    actor: null,
    detail: `Readiness ${readinessPercent}% — ${blockers.length} blocker(s)`,
    occurredAt: updated.updatedAt,
    revision: pkg.revision,
  });

  saveProductionReadiness(audited);

  return {
    record: audited,
    readinessPercent,
    blockers,
    canGenerate: readinessPercent === 100 && blockers.length === 0 && audited.founderApproved,
  };
}

export function assertPackageCanEnterGenerationQueue(
  pkg: EnvironmentAssetPackage
): { ok: boolean; code?: string; message?: string } {
  const record = getProductionReadinessForPackage(pkg.packageId);
  if (!record) {
    return { ok: false, code: 'READINESS_MISSING', message: 'Production readiness record missing.' };
  }
  if (!record.founderApproved) {
    return { ok: false, code: 'FOUNDER_APPROVAL_REQUIRED', message: 'Founder approval required before generation.' };
  }
  if (record.blockers.length > 0) {
    return { ok: false, code: 'READINESS_BLOCKERS', message: `Blockers: ${record.blockers.join(', ')}` };
  }
  if (record.readinessPercent < 100) {
    return { ok: false, code: 'READINESS_INCOMPLETE', message: `Readiness ${record.readinessPercent}% — 100% required.` };
  }
  if (record.lifecycleState !== 'production-ready' && !isLifecycleProductionReady(record.lifecycleState)) {
    return { ok: false, code: 'LIFECYCLE_NOT_READY', message: `Lifecycle state: ${record.lifecycleState}` };
  }
  return { ok: true };
}

export function approvePackageForProduction(
  pkg: EnvironmentAssetPackage,
  approvedBy: string
): FounderApprovalResult {
  // Mark all checklist items as passed for founder-approved submission
  let record = getProductionReadinessForPackage(pkg.packageId);
  if (!record) record = createProductionReadinessForPackage(pkg);

  const now = new Date().toISOString();
  const checklist = evaluateReadinessChecklist(pkg, record);

  // Founder approval accepts estimate and notes
  for (const key of READINESS_CHECKLIST_KEYS) {
    if (checklist[key].status === 'pending' && !checklist[key].blocker) {
      checklist[key] = { ...checklist[key], status: 'passed', message: null };
    }
  }
  checklist.generationEstimateAccepted = { ...checklist.generationEstimateAccepted, status: 'passed' };
  checklist.founderNotesReviewed = { ...checklist.founderNotesReviewed, status: 'passed' };
  checklist.canonicalStatusConfirmed = { ...checklist.canonicalStatusConfirmed, status: 'passed' };
  checklist.desktopPreviewApproved = {
    ...checklist.desktopPreviewApproved,
    status: resolveOutputUrl(pkg.outputs, 'desktop') ? 'passed' : 'failed',
    blocker: !resolveOutputUrl(pkg.outputs, 'desktop'),
  };
  checklist.mobilePreviewApproved = {
    ...checklist.mobilePreviewApproved,
    status: resolveOutputUrl(pkg.outputs, 'mobile') ? 'passed' : 'failed',
    blocker: !resolveOutputUrl(pkg.outputs, 'mobile'),
  };

  const blockers = detectReadinessBlockers(checklist);
  const readinessPercent = calculateReadinessPercent(checklist);

  if (blockers.length > 0) {
    const rejected: ProductionReadinessRecord = appendPackageAuditEntry(
      {
        ...record,
        checklist,
        blockers,
        readinessPercent,
        founderRejectedAt: now,
        founderRejectedBy: approvedBy,
        rejectionReason: `Blockers remain: ${blockers.join(', ')}`,
        updatedAt: now,
      },
      {
        eventType: 'rejected',
        actor: approvedBy,
        detail: `Approval rejected — blockers: ${blockers.join(', ')}`,
        occurredAt: now,
        revision: pkg.revision,
      }
    );
    saveProductionReadiness(rejected);
    return {
      ok: false,
      code: 'READINESS_BLOCKERS',
      message: `Cannot approve — blockers: ${blockers.join(', ')}`,
      record: rejected,
    };
  }

  if (readinessPercent < 100) {
    return {
      ok: false,
      code: 'READINESS_INCOMPLETE',
      message: `Readiness ${readinessPercent}% — 100% required for approval.`,
      record,
    };
  }

  const authorizedQueueEntry = {
    packageId: pkg.packageId,
    variantId: pkg.variantId,
    submissionTime: now,
    estimatedDurationMs: record.generationEstimate.estimatedQueueTimeMs,
    priority: 1,
    retryCount: 0,
    status: 'pending' as const,
  };

  let approved: ProductionReadinessRecord = {
    ...record,
    checklist,
    blockers: [],
    readinessPercent: 100,
    lifecycleState: 'production-ready',
    founderApproved: true,
    founderApprovedAt: now,
    founderApprovedBy: approvedBy,
    founderRejectedAt: null,
    founderRejectedBy: null,
    rejectionReason: null,
    authorizedQueueEntry,
    updatedAt: now,
  };

  approved = appendPackageAuditEntry(approved, {
    eventType: 'approved',
    actor: approvedBy,
    detail: 'Founder approved package for production generation',
    occurredAt: now,
    revision: pkg.revision,
  });

  approved = appendPackageAuditEntry(approved, {
    eventType: 'queue-authorized',
    actor: approvedBy,
    detail: 'Package authorized for EnvironmentPackageGenerationQueue',
    occurredAt: now,
    revision: pkg.revision,
  });

  saveProductionReadiness(approved);

  return { ok: true, record: approved, queueAuthorized: true };
}

export function assertPackageProductionReadyForConsumer(
  packageId: string
): { ok: boolean; code?: string; message?: string; lifecycleState?: PackageLifecycleState } {
  const record = getProductionReadinessForPackage(packageId);
  if (!record) {
    return { ok: false, code: 'READINESS_MISSING', message: 'Awaiting Production Approval' };
  }
  if (!record.founderApproved || !isLifecycleProductionReady(record.lifecycleState)) {
    return {
      ok: false,
      code: 'NOT_PRODUCTION_READY',
      message: 'Awaiting Production Approval',
      lifecycleState: record.lifecycleState,
    };
  }
  return { ok: true, lifecycleState: record.lifecycleState };
}

export function assertPackageProductionCompleteForMarketplace(
  packageId: string
): { ok: boolean; code?: string; message?: string } {
  const record = getProductionReadinessForPackage(packageId);
  if (!record) {
    return { ok: false, code: 'READINESS_MISSING', message: 'Package not production complete' };
  }
  if (record.lifecycleState !== 'production-complete' && record.lifecycleState !== 'marketplace-ready') {
    return {
      ok: false,
      code: 'NOT_PRODUCTION_COMPLETE',
      message: 'Marketplace requires Production Complete lifecycle state',
    };
  }
  return { ok: true };
}

export function ensureProductionReadinessForPackage(
  pkg: EnvironmentAssetPackage
): ProductionReadinessRecord {
  const existing = getProductionReadinessForPackage(pkg.packageId);
  if (existing) return existing;
  return createProductionReadinessForPackage(pkg);
}
