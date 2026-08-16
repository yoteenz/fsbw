/** Sprint 23 — production infrastructure status model */

export type AioDeploymentEnvironment = 'local' | 'demo' | 'staging' | 'production';

export type InfraConfigStatus =
  | 'READY'
  | 'PARTIAL'
  | 'NOT_CONFIGURED'
  | 'BLOCKED'
  | 'ERROR'
  | 'NOT_REQUIRED'
  | 'SANDBOX'
  | 'PRODUCTION_PENDING'
  | 'PRODUCTION_CONNECTED'
  | 'DISABLED';

export type MigrationState =
  | 'NOT_APPLIED'
  | 'PENDING'
  | 'APPLYING'
  | 'APPLIED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'MANUAL_INTERVENTION_REQUIRED';

export type RlsReadiness = 'RLS_READY' | 'RLS_BLOCKED' | 'RLS_NOT_TESTED';

export type ProviderProductionState =
  | 'ARCHITECTURE_ONLY'
  | 'SANDBOX_READY'
  | 'PRODUCTION_CREDENTIALS_PENDING'
  | 'PRODUCTION_CONNECTED'
  | 'PRODUCTION_BLOCKED'
  | 'DISABLED'
  | 'NOT_CONFIGURED';

export type ServiceActivationState =
  | 'ACTIVE'
  | 'COMING_SOON'
  | 'INTERNAL_ONLY'
  | 'PAUSED'
  | 'PARTNER_PENDING'
  | 'DISABLED';

export type ReadinessCategory = 'READY' | 'PARTIAL' | 'BLOCKED' | 'NOT_REQUIRED' | 'DEFERRED';

export interface InfrastructureComponentStatus {
  id: string;
  label: string;
  category: string;
  status: InfraConfigStatus;
  blocking: boolean;
  notes?: string;
  ownerCategory?: 'TECHNICAL' | 'BUSINESS' | 'PROVIDER' | 'LEGAL';
}

export interface ProductionGateResult {
  status: 'READY' | 'BLOCKED';
  blockers: string[];
  warnings: string[];
}

export interface HealthSnapshot {
  environment: AioDeploymentEnvironment;
  releaseId: string;
  liveness: 'OK' | 'DEGRADED' | 'ERROR';
  readiness: 'READY' | 'NOT_READY';
  checks: { id: string; status: InfraConfigStatus; message: string }[];
}
