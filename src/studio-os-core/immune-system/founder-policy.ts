import type { ImmuneRepairRiskClass } from './types.js';

/**
 * Founder authorization policy — bounded auto-repair consent (2026-07-12).
 * Not unlimited production access.
 */
export const IMMUNE_FOUNDER_AUTO_REPAIR_POLICY = {
  version: 'founder-immune-policy.v1',
  effectiveAt: '2026-07-12',
  allowedRiskClasses: ['A'] as ImmuneRepairRiskClass[],
  guardedRiskClassesEligibleWhenPreflightPasses: ['B'] as ImmuneRepairRiskClass[],
  requiresExistingRepositoryMigration: true,
  requiresChecksumVerification: true,
  requiresTargetProjectAllowlist: true,
  prohibitsDestructiveSql: true,
  prohibitsRlsWeakening: true,
  prohibitsCrossOrganizationDataAccess: true,
  prohibitsArbitrarySql: true,
  prohibitsCredentialExposure: true,
  maxAutoRepairAttemptsPerIncident: 1,
  maxOperationRetryAfterVerifiedRepair: 1,
} as const;

export function founderPolicyPermitsRiskClass(riskClass: ImmuneRepairRiskClass): boolean {
  return (
    IMMUNE_FOUNDER_AUTO_REPAIR_POLICY.allowedRiskClasses.includes(riskClass) ||
    IMMUNE_FOUNDER_AUTO_REPAIR_POLICY.guardedRiskClassesEligibleWhenPreflightPasses.includes(riskClass)
  );
}
