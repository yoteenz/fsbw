import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { DEFAULT_HEALING_THRESHOLDS } from './constants';
import { buildHealingIssues, computeResilienceScore } from './healing-engine';
import { buildRecoveryPlans } from './recovery-engine';
import { buildAuditLog, buildAutoRepairs, summarizeSelfHealing } from './repair-engine';
import type { HealingMode, HealingThresholds, OrganizationSelfHealingEngineProfile } from './types';

export function buildDockSelfHealingLine(profile: OrganizationSelfHealingEngineProfile): string {
  return summarizeSelfHealing(profile);
}

export function buildOrganizationSelfHealingEngineProfile(
  organizationId: string,
  options?: {
    healingMode?: HealingMode;
    thresholds?: HealingThresholds;
  }
): OrganizationSelfHealingEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const mode = options?.healingMode ?? 'request-approval';
  const thresholds = options?.thresholds ?? DEFAULT_HEALING_THRESHOLDS;

  const issues = buildHealingIssues(organizationId, now, mode);
  const repairs = buildAutoRepairs(issues, mode, now);
  const recoveryPlans = buildRecoveryPlans(issues, now);
  const auditLog = buildAuditLog(issues, repairs, recoveryPlans);

  const profile: OrganizationSelfHealingEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    resilienceScore: 0,
    activeHealingMode: mode,
    healingThresholds: thresholds,
    issuesDetected: issues.length,
    autoRepairsToday: repairs.length,
    pendingApprovals: issues.filter((i) => i.status === 'pending-approval').length,
    recoveryPlansReady: recoveryPlans.filter((p) => p.status === 'ready').length,
    issues,
    repairs,
    recoveryPlans,
    auditLog,
    dockSelfHealingLine: '',
    intelligentResilienceNotAutonomousControl: true,
    lastSyncedAt: now,
  };

  profile.resilienceScore = computeResilienceScore(issues, repairs, recoveryPlans);
  profile.dockSelfHealingLine = buildDockSelfHealingLine(profile);
  return profile;
}
