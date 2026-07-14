/** Canonical Environment Package event schema version. */
export const ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION = 'studio.environment-package-event.v1' as const;

export type EnvironmentPackageActorType =
  | 'founder'
  | 'admin'
  | 'system'
  | 'scheduler'
  | 'generation-worker'
  | 'provider'
  | 'CDS'
  | 'asset-manufacturing';

export type EnvironmentPackageEventSource =
  | 'package-repository'
  | 'generation-worker'
  | 'scheduler'
  | 'readiness-service'
  | 'approval-service'
  | 'review-service'
  | 'revision-service'
  | 'CDS-handoff'
  | 'asset-manufacturing'
  | 'realtime-recovery'
  | 'client-local';

/** Registry-driven canonical event types. */
export const ENVIRONMENT_PACKAGE_EVENT_TYPES = [
  'ACTIVE_PROGRAM_CHANGED',
  'ACTIVE_DEPARTMENT_CHANGED',
  'ACTIVE_INDUSTRY_PACK_CHANGED',
  'ACTIVE_ENVIRONMENT_CHANGED',
  'ACTIVE_VARIANT_CHANGED',
  'ACTIVE_PACKAGE_CHANGED',
  'ACTIVE_REVISION_CHANGED',
  'ACTIVE_WORKBENCH_TOOL_CHANGED',
  'PACKAGE_CREATED',
  'PACKAGE_UPDATED',
  'PACKAGE_STATUS_CHANGED',
  'PACKAGE_HEALTH_CHANGED',
  'PACKAGE_ARCHIVED',
  'PACKAGE_SUPERSEDED',
  'PACKAGE_PROMOTED_TO_PRODUCTION',
  'PACKAGE_PROMOTED_TO_CANONICAL',
  'VARIANT_SELECTED',
  'VARIANT_APPROVED',
  'VARIANT_ARCHIVED',
  'VARIANT_RESTORED',
  'REVISION_CREATED',
  'REVISION_STARTED',
  'REVISION_UPDATED',
  'REVISION_COMPLETED',
  'REVISION_FAILED',
  'REVISION_APPROVED',
  'REVISION_REJECTED',
  'REVISION_REQUESTED',
  'REVISION_ARCHIVED',
  'GENERATION_PARENT_CREATED',
  'GENERATION_JOB_QUEUED',
  'GENERATION_JOB_STARTED',
  'GENERATION_JOB_PROGRESS',
  'GENERATION_JOB_COMPLETED',
  'GENERATION_JOB_FAILED',
  'GENERATION_JOB_RETRYING',
  'GENERATION_JOB_CANCELLED',
  'OUTPUT_REQUESTED',
  'OUTPUT_QUEUED',
  'OUTPUT_GENERATING',
  'OUTPUT_GENERATED',
  'OUTPUT_FAILED',
  'OUTPUT_STALE',
  'OUTPUT_APPROVED',
  'OUTPUT_REJECTED',
  'OUTPUT_CACHED',
  'OUTPUT_REPLACED',
  'BLUEPRINT_UPDATED',
  'CONSTRUCTION_UPDATED',
  'MATERIALS_UPDATED',
  'LIGHTING_UPDATED',
  'CAMERA_UPDATED',
  'ASSET_MANIFEST_UPDATED',
  'ESTIMATE_CREATED',
  'ESTIMATE_ACCEPTED',
  'BUDGET_UPDATED',
  'ACTUAL_COST_UPDATED',
  'CACHE_SAVINGS_UPDATED',
  'READINESS_UPDATED',
  'BLOCKER_ADDED',
  'BLOCKER_RESOLVED',
  'PRODUCTION_APPROVED',
  'PRODUCTION_REJECTED',
  'CANONICAL_APPROVAL_GRANTED',
  'CANONICAL_APPROVAL_REVOKED',
  'FOUNDER_REVIEW_CREATED',
  'FOUNDER_COMMENT_ADDED',
  'FOUNDER_DECISION_RECORDED',
  'CDS_HANDOFF_CREATED',
  'CDS_HANDOFF_ACCEPTED',
  'ASSET_MANUFACTURING_STARTED',
  'ASSET_MANUFACTURING_UPDATED',
] as const;

export type EnvironmentPackageEventType = (typeof ENVIRONMENT_PACKAGE_EVENT_TYPES)[number];

export type EnvironmentPackageEvent = {
  eventId: string;
  eventType: EnvironmentPackageEventType | string;
  packageId: string;
  variantId: string | null;
  environmentId: string | null;
  departmentId: string | null;
  revision: number;
  outputType: string | null;
  jobId: string | null;
  actorType: EnvironmentPackageActorType;
  actorId: string | null;
  source: EnvironmentPackageEventSource;
  sequence: number;
  occurredAt: string;
  persistedAt: string;
  correlationId: string | null;
  causationId: string | null;
  schemaVersion: typeof ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION;
  payload: Record<string, unknown>;
};

export type EnvironmentPackageEventCursor = {
  packageId: string | null;
  lastEventId: string | null;
  lastSequence: number;
  lastOccurredAt: string | null;
  connectionState: EnvironmentPackageConnectionState;
  missingSequenceCount: number;
  duplicateEventCount: number;
  recoveryCount: number;
  lastRecoveryAt: string | null;
  lastInvalidationSet: string[];
  processingErrors: number;
};

export type EnvironmentPackageConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'degraded'
  | 'disconnected'
  | 'recovering'
  | 'local-only';

export function isRegisteredEventType(value: string): value is EnvironmentPackageEventType {
  return (ENVIRONMENT_PACKAGE_EVENT_TYPES as readonly string[]).includes(value);
}

export function normalizeLegacyAuditEventType(legacy: string): EnvironmentPackageEventType | string {
  const map: Record<string, EnvironmentPackageEventType> = {
    created: 'PACKAGE_CREATED',
    updated: 'PACKAGE_UPDATED',
    approved: 'PRODUCTION_APPROVED',
    rejected: 'PRODUCTION_REJECTED',
    generated: 'OUTPUT_GENERATED',
    'generation-queued': 'GENERATION_JOB_QUEUED',
    'production-complete': 'REVISION_COMPLETED',
    'canonical-promoted': 'PACKAGE_PROMOTED_TO_CANONICAL',
    'readiness-evaluated': 'READINESS_UPDATED',
    'queue-authorized': 'GENERATION_JOB_QUEUED',
    'blueprint-generation-started': 'OUTPUT_GENERATING',
    'blueprint-retry-requested': 'GENERATION_JOB_RETRYING',
  };
  if (isRegisteredEventType(legacy)) return legacy;
  return map[legacy] ?? legacy.toUpperCase().replace(/-/g, '_');
}

export function validateEnvironmentPackageEvent(input: Partial<EnvironmentPackageEvent>): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!input.eventId) errors.push('eventId required');
  if (!input.eventType) errors.push('eventType required');
  if (!input.packageId) errors.push('packageId required');
  if (typeof input.sequence !== 'number' || input.sequence < 0) errors.push('sequence invalid');
  if (!input.occurredAt) errors.push('occurredAt required');
  return { ok: errors.length === 0, errors };
}
