import { HEALING_MODE_LABELS } from './constants';
import type { HealingIssue, HealingMode, HealingRepair, RecoveryPlan } from './types';

const REPAIR_ACTIONS: Record<string, string> = {
  'broken-links': 'Updated 14 broken URLs to current workflow template v3 paths · validated all links pass.',
  'missing-documentation': 'Generated draft documentation from workflow node metadata · queued for review publish.',
  'inactive-automations': 'Re-mapped trigger condition to current event type · test-fired successfully.',
  'outdated-references': 'Flagged outdated references · prepared update diff for approval.',
  'knowledge-graph-inconsistencies': 'Identified conflicting nodes · harmonization plan prepared (approval required).',
  'duplicate-records': 'Merged 23 duplicate customer records · preserved most recent activity history.',
  'unused-assets': 'Archived 8 orphaned blueprint assets · registry index rebuilt.',
  'minor-ui-issues': 'Applied min-width CSS fix on mobile checkout button · verified on 375px viewport.',
  'configuration-drift': 'Diff generated against Policy Engine template · realignment queued for approval.',
  'dependency-issues': 'Dependency health scan completed · recovery plan prepared for manual execution.',
};

const ROLLBACK_ACTIONS: Record<string, string> = {
  'broken-links': 'Restore previous URL mapping from link validator snapshot · takes ~2 minutes.',
  'missing-documentation': 'Remove auto-generated draft · revert to previous doc state.',
  'inactive-automations': 'Restore previous trigger condition from automation version history.',
  'duplicate-records': 'Restore merged records from deduplication audit snapshot.',
  'unused-assets': 'Unarchive assets from registry archive · restore previous index.',
  'minor-ui-issues': 'Revert CSS change from design token snapshot · redeploy previous stylesheet.',
  default: 'Rollback available via audit log snapshot · contact QA Inspector for guided restore.',
};

export function buildAutoRepairs(
  issues: HealingIssue[],
  mode: HealingMode,
  now: string
): HealingRepair[] {
  if (mode !== 'automatic-repair') return [];

  return issues
    .filter((i) => i.status === 'repaired' && i.autoRepairEligible)
    .map((issue, idx) => ({
      id: `repair-${issue.id}`,
      issueId: issue.id,
      issueDetected: issue.description,
      rootCause: issue.rootCause,
      repairPerformed: REPAIR_ACTIONS[issue.category] ?? 'Low-risk repair applied per Self-Healing policy.',
      confidencePct: issue.confidencePct,
      systemsAffected: issue.systemsAffected,
      rollbackOption: ROLLBACK_ACTIONS[issue.category] ?? ROLLBACK_ACTIONS.default,
      mode,
      riskLevel: issue.riskLevel,
      repairedAt: now,
      auditLogId: `audit-repair-${idx}-${Date.now()}`,
    }));
}

export function buildRepairFromApproval(issue: HealingIssue, mode: HealingMode, now: string): HealingRepair {
  return {
    id: `repair-${issue.id}-${Date.now()}`,
    issueId: issue.id,
    issueDetected: issue.description,
    rootCause: issue.rootCause,
    repairPerformed: REPAIR_ACTIONS[issue.category] ?? 'Approved repair executed per Recovery Plan.',
    confidencePct: issue.confidencePct,
    systemsAffected: issue.systemsAffected,
    rollbackOption: ROLLBACK_ACTIONS[issue.category] ?? ROLLBACK_ACTIONS.default,
    mode,
    riskLevel: issue.riskLevel,
    repairedAt: now,
    auditLogId: `audit-approved-${issue.id}`,
  };
}

export function buildAuditLog(
  issues: HealingIssue[],
  repairs: HealingRepair[],
  recoveryPlans: RecoveryPlan[]
): import('./types').HealingAuditLogEntry[] {
  const entries: import('./types').HealingAuditLogEntry[] = [];

  for (const issue of issues) {
    entries.push({
      id: `audit-detect-${issue.id}`,
      timestamp: issue.detectedAt,
      eventType: 'detected',
      issueId: issue.id,
      title: issue.title,
      summary: `${issue.categoryLabel} detected · ${issue.riskLevel} risk · ${issue.confidencePct}% confidence`,
      confidencePct: issue.confidencePct,
      systemsAffected: issue.systemsAffected,
      rollbackAvailable: false,
    });
  }

  for (const repair of repairs) {
    entries.push({
      id: repair.auditLogId,
      timestamp: repair.repairedAt,
      eventType: 'repaired',
      issueId: repair.issueId,
      title: `Repair: ${repair.issueDetected.slice(0, 40)}…`,
      summary: `${repair.repairPerformed.slice(0, 80)}… · ${HEALING_MODE_LABELS[repair.mode]}`,
      confidencePct: repair.confidencePct,
      systemsAffected: repair.systemsAffected,
      rollbackAvailable: true,
    });
  }

  for (const plan of recoveryPlans) {
    entries.push({
      id: `audit-recovery-${plan.id}`,
      timestamp: plan.preparedAt,
      eventType: 'recovery-planned',
      issueId: plan.issueId,
      title: `Recovery Plan: ${plan.problemSummary.slice(0, 40)}…`,
      summary: `${plan.stepByStepPlan.length} steps · ${plan.estimatedDowntime} downtime · ${plan.recommendedPriority} priority`,
      confidencePct: 90,
      systemsAffected: plan.systemsAffected,
      rollbackAvailable: false,
    });
  }

  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function summarizeSelfHealing(profile: {
  resilienceScore: number;
  autoRepairsToday: number;
  pendingApprovals: number;
  recoveryPlansReady: number;
  activeHealingMode: HealingMode;
}): string {
  return `Self-Healing™ ${profile.resilienceScore}% resilience · ${profile.autoRepairsToday} auto-repairs today · ${profile.pendingApprovals} pending approval · ${profile.recoveryPlansReady} recovery plans ready · mode: ${HEALING_MODE_LABELS[profile.activeHealingMode]}.`;
}
