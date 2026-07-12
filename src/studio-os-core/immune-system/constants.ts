/** Production Supabase project allowlist (FS Website). */
export const IMMUNE_PRODUCTION_PROJECT_REF = 'hyycomvcaqxxvyrfupes';

export const IMMUNE_SCHEMA_CONTRACT_VERSION = 'immune-schema-contract.v1';

export const IMMUNE_INCIDENT_SIGNATURE_MISSING_GENERATION_JOBS_TABLE =
  'missing-schema-resource:public.studio_governed_generation_jobs';

export const IMMUNE_MAX_AUTO_REPAIR_ATTEMPTS = 1;
export const IMMUNE_MAX_OPERATION_RETRY_AFTER_REPAIR = 1;

export const IMMUNE_HEALTH_CACHE_TTL_MS = 60_000;

export const IMMUNE_NERVOUS_SIGNAL_ORDER = [
  'SchemaDriftDetected',
  'DiagnosisCompleted',
  'RepairAuthorizationEvaluated',
  'RepairStarted',
  'RepairApplied',
  'RepairVerified',
  'OriginalOperationRetried',
  'IncidentRecovered',
  'RepairDenied',
  'FounderEscalationRequired',
] as const;
