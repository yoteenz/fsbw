/**
 * ProductionReadinessGate — mandatory founder approval before expensive AI generation.
 * Every Environment Package owns exactly one Production Readiness record.
 */

import type { EnvironmentVariantId } from './EnvironmentAssetPackage';

export const PRODUCTION_READINESS_SCHEMA_VERSION = 'studio.production-readiness.v1' as const;

/** Expanded package lifecycle — only production-ready may enter generation queue. */
export type PackageLifecycleState =
  | 'draft'
  | 'preview-ready'
  | 'founder-reviewing'
  | 'production-ready'
  | 'generating'
  | 'partially-complete'
  | 'awaiting-founder-approval'
  | 'production-complete'
  | 'marketplace-ready'
  | 'archived';

export type ReadinessCheckStatus =
  | 'pending'
  | 'passed'
  | 'failed'
  | 'blocked'
  | 'not-required';

export const READINESS_CHECKLIST_KEYS = [
  'environmentApproved',
  'departmentBibleLocked',
  'variantSelected',
  'promptFrozen',
  'promptVersionRecorded',
  'seedFrozen',
  'providerSelected',
  'generationBudgetApproved',
  'desktopPreviewApproved',
  'mobilePreviewApproved',
  'themeConfirmed',
  'canonicalStatusConfirmed',
  'founderNotesReviewed',
  'dependenciesResolved',
  'generationEstimateAccepted',
  'blueprintGenerationEnabled',
  'constructionGenerationEnabled',
  'lightingGenerationEnabled',
  'materialsGenerationEnabled',
  'marketplaceEligibilityReviewed',
] as const;

export type ReadinessChecklistKey = (typeof READINESS_CHECKLIST_KEYS)[number];

export type ReadinessChecklistItem = {
  key: ReadinessChecklistKey;
  status: ReadinessCheckStatus;
  blocker: boolean;
  message: string | null;
};

export type ReadinessChecklist = Record<ReadinessChecklistKey, ReadinessChecklistItem>;

export type GenerationEstimateLineItem = {
  kind: string;
  estimatedCredits: number;
  estimatedDollarsUsd: number;
  estimatedRuntimeMs: number;
};

export type GenerationCostEstimate = {
  estimatedCredits: number;
  estimatedDollarsUsd: number;
  estimatedRuntimeMs: number;
  estimatedQueueTimeMs: number;
  lineItems: GenerationEstimateLineItem[];
  calculatedAt: string;
};

export type PackageAuditEventType =
  | 'created'
  | 'updated'
  | 'approved'
  | 'generated'
  | 'rejected'
  | 'archived'
  | 'regenerated'
  | 'provider-changed'
  | 'prompt-changed'
  | 'seed-changed'
  | 'revision-changed'
  | 'founder-changed'
  | 'readiness-evaluated'
  | 'queue-authorized'
  | 'queue-rejected';

export type PackageAuditEntry = {
  id: string;
  packageId: string;
  eventType: PackageAuditEventType;
  actor: string | null;
  detail: string;
  occurredAt: string;
  revision: number;
};

export type AuthorizedQueueEntry = {
  packageId: string;
  variantId: EnvironmentVariantId;
  submissionTime: string;
  estimatedDurationMs: number;
  priority: number;
  retryCount: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cached';
};

/** One readiness record per package — persisted, not transient UI state. */
export type ProductionReadinessRecord = {
  schemaVersion: typeof PRODUCTION_READINESS_SCHEMA_VERSION;
  readinessId: string;
  packageId: string;
  variantId: EnvironmentVariantId;
  lifecycleState: PackageLifecycleState;
  checklist: ReadinessChecklist;
  readinessPercent: number;
  blockers: ReadinessChecklistKey[];
  generationEstimate: GenerationCostEstimate;
  founderApproved: boolean;
  founderApprovedAt: string | null;
  founderApprovedBy: string | null;
  founderRejectedAt: string | null;
  founderRejectedBy: string | null;
  rejectionReason: string | null;
  auditLog: PackageAuditEntry[];
  authorizedQueueEntry: AuthorizedQueueEntry | null;
  createdAt: string;
  updatedAt: string;
  revision: number;
};

export function buildReadinessId(packageId: string): string {
  return `readiness.${packageId}`;
}

export function buildEmptyChecklist(): ReadinessChecklist {
  const checklist = {} as ReadinessChecklist;
  for (const key of READINESS_CHECKLIST_KEYS) {
    checklist[key] = {
      key,
      status: 'pending',
      blocker: false,
      message: null,
    };
  }
  return checklist;
}

export function isLifecycleProductionReady(state: PackageLifecycleState): boolean {
  return (
    state === 'production-ready'
    || state === 'generating'
    || state === 'production-complete'
    || state === 'marketplace-ready'
  );
}

export function isLifecycleProductionComplete(state: PackageLifecycleState): boolean {
  return state === 'production-complete' || state === 'marketplace-ready';
}

export function isLifecycleMarketplaceEligible(state: PackageLifecycleState): boolean {
  return state === 'production-complete' || state === 'marketplace-ready';
}
