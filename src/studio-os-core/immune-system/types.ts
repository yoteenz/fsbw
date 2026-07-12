/**
 * Studio OS Immune System™ — recovery incident contract (schema drift V1).
 */

export type ImmuneRepairRiskClass = 'A' | 'B' | 'C' | 'D';

export type ImmuneDriftType =
  | 'missing-table'
  | 'missing-column'
  | 'incompatible-column-type'
  | 'missing-index'
  | 'missing-constraint'
  | 'missing-foreign-key'
  | 'missing-rls'
  | 'missing-policy'
  | 'missing-grant'
  | 'missing-function'
  | 'missing-trigger'
  | 'missing-storage-bucket'
  | 'unapplied-migration'
  | 'migration-checksum-mismatch'
  | 'migration-order-mismatch'
  | 'schema-cache-visibility';

export type ImmuneIncidentFinalStatus =
  | 'detected'
  | 'diagnosed'
  | 'repair-denied'
  | 'repairing'
  | 'repair-verified'
  | 'repair-failed'
  | 'retrying'
  | 'recovered'
  | 'escalated';

export type ImmuneNervousSignal =
  | 'SchemaDriftDetected'
  | 'DiagnosisCompleted'
  | 'RepairAuthorizationEvaluated'
  | 'RepairStarted'
  | 'RepairApplied'
  | 'RepairVerified'
  | 'OriginalOperationRetried'
  | 'IncidentRecovered'
  | 'RepairDenied'
  | 'FounderEscalationRequired';

export type ImmuneSubsystemHealth = 'ready' | 'degraded' | 'blocked' | 'repairing' | 'repair-failed';

export type ImmuneRecoveryIncident = {
  incidentId: string;
  organizationId: string;
  environment: string;
  detectedAt: string;
  detectionSource: string;
  affectedSubsystem: string;
  affectedOperation: string;
  symptom: string;
  errorCode: string;
  errorMessage: string;
  diagnosisCategory: string;
  diagnosisConfidence: number;
  expectedResource: string;
  observedResourceState: string;
  driftType: ImmuneDriftType;
  proposedRepairId: string | null;
  proposedMigrationId: string | null;
  proposedMigrationChecksum: string | null;
  repairRiskClass: ImmuneRepairRiskClass | null;
  repairAuthorized: boolean;
  authorizationSource: string | null;
  destructiveOperationDetected: boolean;
  rollbackAvailable: boolean;
  repairStartedAt: string | null;
  repairCompletedAt: string | null;
  verificationStartedAt: string | null;
  verificationCompletedAt: string | null;
  retryStartedAt: string | null;
  retryCompletedAt: string | null;
  finalStatus: ImmuneIncidentFinalStatus;
  escalationRequired: boolean;
  founderActionRequired: boolean;
  safeSummary: string;
  technicalEvidence: Record<string, unknown>;
  correlationIds: string[];
  nervousSignals: Array<{ signal: ImmuneNervousSignal; at: string; detail?: string }>;
};

export type ImmuneDriftFinding = {
  driftType: ImmuneDriftType;
  expectedResource: string;
  observedResourceState: string;
  diagnosisConfidence: number;
  proposedMigrationId: string | null;
  proposedMigrationChecksum: string | null;
  repairRiskClass: ImmuneRepairRiskClass;
  symptom: string;
};

export type ImmuneDriftReport = {
  ok: boolean;
  environment: string;
  checkedAt: string;
  findings: ImmuneDriftFinding[];
  contractVersion: string;
};

export type ImmuneRepairAuthorizationResult = {
  allowed: boolean;
  deniedReason: string | null;
  riskClass: ImmuneRepairRiskClass;
  migrationVerified: boolean;
  checksumVerified: boolean;
  targetEnvironmentVerified: boolean;
  backupRequirementSatisfied: boolean;
  rollbackAvailable: boolean;
  destructiveOperationDetected: boolean;
  securityImpact: boolean;
  expectedLockImpact: 'none' | 'low' | 'medium' | 'high';
  founderPolicyMatch: boolean;
  finalDecision: 'allow' | 'deny';
};

export type ImmuneRecoveryResponse = {
  status: 'recovered-automatically' | 'founder-attention-required' | 'repair-in-progress' | 'no-action';
  affectedSystem: string;
  cause: string;
  repair: string | null;
  verification: string | null;
  originalOperation: string | null;
  founderAction: string;
  incidentId: string | null;
  incident?: ImmuneRecoveryIncident;
};

export type ImmuneSchemaProbeResult = {
  tableExists: boolean;
  rlsEnabled: boolean | null;
  columns: Array<{ name: string; data_type: string; is_nullable: boolean }>;
  indexes: string[];
};
