import type { SupabaseClient } from '@supabase/supabase-js';
import {
  IMMUNE_INCIDENT_SIGNATURE_MISSING_GENERATION_JOBS_TABLE,
  IMMUNE_MAX_AUTO_REPAIR_ATTEMPTS,
  IMMUNE_MAX_OPERATION_RETRY_AFTER_REPAIR,
} from '../../../src/studio-os-core/immune-system/constants.js';
import {
  attachMigrationChecksumToFinding,
  inferMissingTableFromError,
  detectDriftForTableContract,
} from '../../../src/studio-os-core/immune-system/drift-detector.js';
import { evaluateAutomaticRepairAuthorization } from '../../../src/studio-os-core/immune-system/repair-authorization.js';
import {
  acquireRepairLock,
  buildRecoveryResponse,
  createIncident,
  emitNervousSignal,
  releaseRepairLock,
  updateIncident,
} from '../../../src/studio-os-core/immune-system/incident-recorder.js';
import { STUDIO_GOVERNED_GENERATION_JOBS_TABLE } from '../../../src/studio-os-core/immune-system/schema-contract.js';
import { invalidateReadinessCache } from '../../../src/studio-os-core/immune-system/readiness.js';
import type { ImmuneRecoveryResponse } from '../../../src/studio-os-core/immune-system/types.js';
import { loadApprovedMigrationSql } from './migration-loader.js';
import {
  getAllowedSupabaseProjectRefs,
  isImmuneAutoRepairEnabled,
  isImmuneProductionTargetVerified,
  resolveImmuneEnvironment,
  resolveSupabaseProjectRef,
} from './production-target.js';
import { executeApprovedMigrationSql } from './repair-executor.js';
import { probeGovernedGenerationJobsTable, verifyGovernedGenerationJobsContract } from './schema-probe.js';

export type SchemaDriftRecoveryContext = {
  organizationId: string;
  affectedSubsystem: string;
  affectedOperation: string;
  errorCode: string;
  errorMessage: string;
  correlationIds: string[];
  hintedTable?: string;
};

export type SchemaDriftRecoveryResult = {
  recovered: boolean;
  response: ImmuneRecoveryResponse;
  shouldRetryOriginalOperation: boolean;
};

export async function attemptSchemaDriftRecoveryForMissingTable(
  supabase: SupabaseClient,
  ctx: SchemaDriftRecoveryContext
): Promise<SchemaDriftRecoveryResult> {
  const inferred = inferMissingTableFromError(ctx.errorMessage, ctx.hintedTable);
  if (!inferred) {
    return {
      recovered: false,
      response: {
        status: 'no-action',
        affectedSystem: ctx.affectedSubsystem,
        cause: ctx.errorMessage,
        repair: null,
        verification: null,
        originalOperation: null,
        founderAction: 'No schema drift diagnosis available',
        incidentId: null,
      },
      shouldRetryOriginalOperation: false,
    };
  }

  const probe = await probeGovernedGenerationJobsTable(supabase);
  const findings = detectDriftForTableContract(
    STUDIO_GOVERNED_GENERATION_JOBS_TABLE,
    probe,
    resolveImmuneEnvironment()
  );
  const finding = findings[0];
  if (!finding) {
    return {
      recovered: false,
      response: {
        status: 'no-action',
        affectedSystem: ctx.affectedSubsystem,
        cause: 'Drift detector found no actionable finding',
        repair: null,
        verification: null,
        originalOperation: null,
        founderAction: 'Investigate schema contract',
        incidentId: null,
      },
      shouldRetryOriginalOperation: false,
    };
  }

  const { sql, checksum } = loadApprovedMigrationSql(finding.proposedMigrationId ?? '');
  const enrichedFinding = attachMigrationChecksumToFinding(finding, sql);

  const incident = createIncident({
    organizationId: ctx.organizationId,
    environment: resolveImmuneEnvironment(),
    detectedAt: new Date().toISOString(),
    detectionSource: 'governed-generation-job-insert',
    affectedSubsystem: ctx.affectedSubsystem,
    affectedOperation: ctx.affectedOperation,
    symptom: enrichedFinding.symptom,
    errorCode: ctx.errorCode,
    errorMessage: ctx.errorMessage,
    diagnosisCategory: enrichedFinding.driftType,
    diagnosisConfidence: enrichedFinding.diagnosisConfidence,
    expectedResource: enrichedFinding.expectedResource,
    observedResourceState: enrichedFinding.observedResourceState,
    driftType: enrichedFinding.driftType,
    proposedRepairId: enrichedFinding.proposedMigrationId,
    proposedMigrationId: enrichedFinding.proposedMigrationId,
    proposedMigrationChecksum: enrichedFinding.proposedMigrationChecksum,
    repairRiskClass: enrichedFinding.repairRiskClass,
    authorizationSource: 'founder-immune-policy.v1',
    safeSummary: IMMUNE_INCIDENT_SIGNATURE_MISSING_GENERATION_JOBS_TABLE,
    technicalEvidence: {
      inferredTable: inferred.qualifiedName,
      signature: IMMUNE_INCIDENT_SIGNATURE_MISSING_GENERATION_JOBS_TABLE,
      correlationIds: ctx.correlationIds,
    },
    correlationIds: ctx.correlationIds,
  });

  emitNervousSignal(incident.incidentId, 'SchemaDriftDetected', enrichedFinding.symptom);
  emitNervousSignal(incident.incidentId, 'DiagnosisCompleted', enrichedFinding.driftType);

  const lockAcquired = acquireRepairLock(enrichedFinding.expectedResource);

  const auth = evaluateAutomaticRepairAuthorization({
    finding: enrichedFinding,
    migrationSql: sql,
    expectedChecksum: checksum,
    targetProjectRef: resolveSupabaseProjectRef(),
    allowedProjectRefs: getAllowedSupabaseProjectRefs(),
    environment: resolveImmuneEnvironment(),
    expectedEnvironment: resolveImmuneEnvironment(),
    autoRepairEnabled: isImmuneAutoRepairEnabled() && isImmuneProductionTargetVerified(),
    concurrentRepairActive: !lockAcquired,
  });

  emitNervousSignal(
    incident.incidentId,
    'RepairAuthorizationEvaluated',
    auth.finalDecision === 'allow' ? 'authorized' : auth.deniedReason ?? 'denied'
  );

  updateIncident(incident.incidentId, {
    repairAuthorized: auth.allowed,
    destructiveOperationDetected: auth.destructiveOperationDetected,
    rollbackAvailable: auth.rollbackAvailable,
    finalStatus: auth.allowed ? 'diagnosed' : 'repair-denied',
    escalationRequired: !auth.allowed,
    founderActionRequired: !auth.allowed,
    safeSummary: auth.allowed
      ? 'Approved additive migration ready for automatic apply'
      : auth.deniedReason ?? 'Automatic repair denied',
    technicalEvidence: {
      ...incident.technicalEvidence,
      authorization: auth,
    },
  });

  if (!auth.allowed || !sql) {
    if (lockAcquired) releaseRepairLock(enrichedFinding.expectedResource);
    emitNervousSignal(incident.incidentId, 'RepairDenied', auth.deniedReason ?? undefined);
    emitNervousSignal(incident.incidentId, 'FounderEscalationRequired');
    const updated = updateIncident(incident.incidentId, { finalStatus: 'escalated' })!;
    return {
      recovered: false,
      response: buildRecoveryResponse(updated),
      shouldRetryOriginalOperation: false,
    };
  }

  updateIncident(incident.incidentId, {
    finalStatus: 'repairing',
    repairStartedAt: new Date().toISOString(),
  });
  emitNervousSignal(incident.incidentId, 'RepairStarted');

  const apply = await executeApprovedMigrationSql(sql);
  emitNervousSignal(
    incident.incidentId,
    'RepairApplied',
    apply.ok ? `via ${apply.channel}` : apply.error
  );

  if (!apply.ok) {
    releaseRepairLock(enrichedFinding.expectedResource);
    const updated = updateIncident(incident.incidentId, {
      finalStatus: 'repair-failed',
      repairCompletedAt: new Date().toISOString(),
      escalationRequired: true,
      founderActionRequired: true,
      safeSummary: apply.error ?? 'Migration apply failed',
      technicalEvidence: {
        ...incident.technicalEvidence,
        applyResult: { channel: apply.channel, error: apply.error },
      },
    })!;
    emitNervousSignal(incident.incidentId, 'FounderEscalationRequired', apply.error);
    return { recovered: false, response: buildRecoveryResponse(updated), shouldRetryOriginalOperation: false };
  }

  updateIncident(incident.incidentId, {
    repairCompletedAt: new Date().toISOString(),
    verificationStartedAt: new Date().toISOString(),
  });

  // Schema cache visibility — brief pause then re-probe
  await new Promise((r) => setTimeout(r, 250));
  const postProbe = await probeGovernedGenerationJobsTable(supabase);
  const verification = verifyGovernedGenerationJobsContract(postProbe);
  invalidateReadinessCache();

  emitNervousSignal(
    incident.incidentId,
    'RepairVerified',
    verification.ok ? 'contract-pass' : verification.failures.join('; ')
  );

  updateIncident(incident.incidentId, {
    verificationCompletedAt: new Date().toISOString(),
    technicalEvidence: {
      ...incident.technicalEvidence,
      verification,
      postProbe: { tableExists: postProbe.tableExists, columnCount: postProbe.columns.length },
    },
  });

  releaseRepairLock(enrichedFinding.expectedResource);

  if (!verification.ok) {
    const updated = updateIncident(incident.incidentId, {
      finalStatus: 'repair-failed',
      escalationRequired: true,
      founderActionRequired: true,
      safeSummary: `Verification failed: ${verification.failures.join(', ')}`,
    })!;
    emitNervousSignal(incident.incidentId, 'FounderEscalationRequired');
    return { recovered: false, response: buildRecoveryResponse(updated), shouldRetryOriginalOperation: false };
  }

  updateIncident(incident.incidentId, {
    finalStatus: 'recovered',
    retryStartedAt: new Date().toISOString(),
    retryCompletedAt: new Date().toISOString(),
    safeSummary: 'Schema drift repaired — original operation may retry once',
  });
  emitNervousSignal(incident.incidentId, 'OriginalOperationRetried', 'pending-caller-retry');
  emitNervousSignal(incident.incidentId, 'IncidentRecovered');

  const updated = updateIncident(incident.incidentId, { finalStatus: 'recovered' })!;
  return {
    recovered: true,
    response: buildRecoveryResponse(updated),
    shouldRetryOriginalOperation: true,
  };
}

export function getImmuneRecoveryLimits() {
  return {
    maxAutoRepairAttempts: IMMUNE_MAX_AUTO_REPAIR_ATTEMPTS,
    maxOperationRetry: IMMUNE_MAX_OPERATION_RETRY_AFTER_REPAIR,
  };
}
