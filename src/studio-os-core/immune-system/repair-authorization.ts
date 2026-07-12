import { founderPolicyPermitsRiskClass } from './founder-policy.js';
import { isMigrationAllowlisted } from './migration-manifest.js';
import { analyzeMigrationSafety } from './migration-safety.js';
import type { ImmuneDriftFinding, ImmuneRepairAuthorizationResult, ImmuneRepairRiskClass } from './types.js';

export type RepairAuthorizationInput = {
  finding: ImmuneDriftFinding;
  migrationSql: string | null;
  expectedChecksum: string | null;
  targetProjectRef: string | null;
  allowedProjectRefs: string[];
  environment: string;
  expectedEnvironment: string;
  autoRepairEnabled: boolean;
  concurrentRepairActive: boolean;
};

export function evaluateAutomaticRepairAuthorization(input: RepairAuthorizationInput): ImmuneRepairAuthorizationResult {
  const deny = (reason: string, partial?: Partial<ImmuneRepairAuthorizationResult>): ImmuneRepairAuthorizationResult => ({
    allowed: false,
    deniedReason: reason,
    riskClass: input.finding.repairRiskClass,
    migrationVerified: false,
    checksumVerified: false,
    targetEnvironmentVerified: false,
    backupRequirementSatisfied: true,
    rollbackAvailable: false,
    destructiveOperationDetected: true,
    securityImpact: false,
    expectedLockImpact: 'none',
    founderPolicyMatch: false,
    finalDecision: 'deny',
    ...partial,
  });

  if (!input.autoRepairEnabled) {
    return deny('IMMUNE_SYSTEM_AUTO_REPAIR is not enabled');
  }
  if (input.concurrentRepairActive) {
    return deny('Concurrent repair already active for this resource');
  }
  if (!input.finding.proposedMigrationId) {
    return deny('No approved migration mapped to drift finding');
  }
  if (!isMigrationAllowlisted(input.finding.proposedMigrationId)) {
    return deny('Migration is not on production-approved allowlist');
  }
  if (!input.migrationSql) {
    return deny('Migration SQL could not be loaded from repository');
  }

  const safety = analyzeMigrationSafety(input.migrationSql);
  const riskClass: ImmuneRepairRiskClass = safety.riskClass;

  if (safety.destructiveOperationDetected) {
    return deny('Destructive SQL detected in migration', {
      destructiveOperationDetected: true,
      riskClass,
      migrationVerified: true,
    });
  }
  if (safety.rlsWeakeningDetected) {
    return deny('RLS weakening detected in migration', {
      destructiveOperationDetected: false,
      securityImpact: true,
      riskClass: 'C',
      migrationVerified: true,
    });
  }
  if (!founderPolicyPermitsRiskClass(riskClass)) {
    return deny(`Founder policy does not permit risk class ${riskClass}`, {
      riskClass,
      founderPolicyMatch: false,
      migrationVerified: true,
      destructiveOperationDetected: false,
    });
  }

  const checksumVerified =
    !input.expectedChecksum || !input.finding.proposedMigrationChecksum
      ? false
      : input.expectedChecksum === input.finding.proposedMigrationChecksum;

  if (input.expectedChecksum && !checksumVerified) {
    return deny('Migration checksum mismatch — repair blocked', {
      checksumVerified: false,
      migrationVerified: true,
      destructiveOperationDetected: false,
      riskClass,
    });
  }

  if (!input.targetProjectRef || !input.allowedProjectRefs.includes(input.targetProjectRef)) {
    return deny('Target Supabase project is not on allowlist', {
      targetEnvironmentVerified: false,
      migrationVerified: true,
      checksumVerified,
      destructiveOperationDetected: false,
      riskClass,
    });
  }

  if (input.environment !== input.expectedEnvironment) {
    return deny('Environment mismatch — repair blocked', {
      targetEnvironmentVerified: false,
      migrationVerified: true,
      checksumVerified,
      destructiveOperationDetected: false,
      riskClass,
    });
  }

  return {
    allowed: true,
    deniedReason: null,
    riskClass,
    migrationVerified: true,
    checksumVerified: input.expectedChecksum ? checksumVerified : true,
    targetEnvironmentVerified: true,
    backupRequirementSatisfied: riskClass === 'A',
    rollbackAvailable: Boolean(safety.rollbackStrategy),
    destructiveOperationDetected: false,
    securityImpact: false,
    expectedLockImpact: safety.lockImpact,
    founderPolicyMatch: true,
    finalDecision: 'allow',
  };
}
