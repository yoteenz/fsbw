import type { HealingIssue, RecoveryPlan, RecoveryPriority } from './types';

const RECOVERY_TEMPLATES: Record<
  string,
  Omit<RecoveryPlan, 'id' | 'issueId' | 'preparedAt' | 'status'>
> = {
  'configuration-drift': {
    problemSummary: 'Permission template drift creates unauthorized capability exposure.',
    rootCauseAnalysis:
      'Manual Editor role edits bypassed Policy Engine sync · 3 capabilities diverged from approved template · QA Inspector flagged permission conflict.',
    stepByStepPlan: [
      'Export current Editor role permissions and diff against Policy Engine template.',
      'Revoke unauthorized delete and export capabilities from Editor role.',
      'Re-sync role from Policy Engine canonical template.',
      'Run permission simulation across top 5 workflows.',
      'Enable Policy Engine drift alerts for future edits.',
    ],
    estimatedDowntime: '15–30 minutes',
    businessImpact: 'Prevents unauthorized deletion · restores compliance posture · reduces audit finding risk.',
    recommendedPriority: 'critical',
    systemsAffected: ['Permission Engine', 'Policy Engine', 'Security'],
  },
  'dependency-issues': {
    problemSummary: 'Calendar sync integration will fail when OAuth token expires.',
    rootCauseAnalysis:
      'Token refresh automation disabled during maintenance · 48-hour expiry window · appointment workflows depend on live calendar sync.',
    stepByStepPlan: [
      'Re-enable OAuth token refresh automation.',
      'Manually refresh calendar integration token.',
      'Verify webhook registration and test appointment sync.',
      'Add token expiry monitoring alert at 7-day threshold.',
      'Document maintenance procedure to prevent refresh disable.',
    ],
    estimatedDowntime: '5–10 minutes if acted within window · 2–4 hours if token expires',
    businessImpact: 'Appointment booking failures · customer double-bookings · support ticket surge.',
    recommendedPriority: 'high',
    systemsAffected: ['Integrations', 'Automations', 'Appointment Workflows'],
  },
  'knowledge-graph-inconsistencies': {
    problemSummary: 'Conflicting tax guidance nodes risk compliance violations.',
    rootCauseAnalysis:
      'Legal Brain and Tax Brain edited independently · overlapping domain boundaries · Professional Trust Framework escalation rules not applied.',
    stepByStepPlan: [
      'Freeze conflicting brain nodes from active recommendations.',
      'Schedule harmonization review with domain experts.',
      'Merge boundaries into unified compliance gate.',
      'Add escalation rule for overlapping legal/tax queries.',
      'Re-validate with QA Simulation compliance personas.',
    ],
    estimatedDowntime: 'No downtime · 2–3 day review cycle',
    businessImpact: 'Inconsistent AI guidance · compliance exposure · customer trust erosion.',
    recommendedPriority: 'high',
    systemsAffected: ['Knowledge Graph', 'Profession Brain', 'Professional Trust Framework'],
  },
  financial: {
    problemSummary: 'Financial reporting workflow references deprecated tax calculation module.',
    rootCauseAnalysis:
      'Tax module upgraded to v3 · quarterly filing workflow still calls v2 endpoints · financial calculations may produce incorrect results.',
    stepByStepPlan: [
      'Halt automated quarterly filing until workflow migrated.',
      'Map v2 → v3 tax calculation endpoint changes.',
      'Update workflow template with v3 module references.',
      'Run parallel calculation validation against known filings.',
      'Require executive approval before re-enabling automation.',
    ],
    estimatedDowntime: '4–8 hours for migration · filing paused until validated',
    businessImpact: 'Incorrect tax filings · regulatory penalties · financial reporting errors.',
    recommendedPriority: 'critical',
    systemsAffected: ['Workflows', 'Monetization', 'Compliance'],
  },
  medical: {
    problemSummary: 'Medical consultation routing uses deprecated compliance gate.',
    rootCauseAnalysis:
      'Professional Trust Framework v2 deployed · medical routing rules still reference v1 gate · consultations may bypass required compliance checks.',
    stepByStepPlan: [
      'Pause automated medical consultation routing.',
      'Update routing rules to Professional Trust Framework v2 gate.',
      'Audit last 30 days of medical consultations for gate bypass.',
      'Re-enable routing with manual approval for first 48 hours.',
      'Schedule compliance review with medical domain expert.',
    ],
    estimatedDowntime: '1–2 hours routing pause · manual approval during transition',
    businessImpact: 'Compliance violation risk · patient safety concerns · regulatory exposure.',
    recommendedPriority: 'critical',
    systemsAffected: ['Expert Marketplace', 'Professional Trust Framework', 'Workflows'],
  },
};

function priorityForIssue(issue: HealingIssue): RecoveryPriority {
  if (issue.restrictedDomain === 'financial' || issue.restrictedDomain === 'medical') return 'critical';
  if (issue.riskLevel === 'high') return 'high';
  if (issue.riskLevel === 'medium') return 'medium';
  return 'low';
}

function templateForIssue(issue: HealingIssue) {
  if (issue.restrictedDomain === 'financial') return RECOVERY_TEMPLATES.financial;
  if (issue.restrictedDomain === 'medical') return RECOVERY_TEMPLATES.medical;
  return RECOVERY_TEMPLATES[issue.category] ?? RECOVERY_TEMPLATES['dependency-issues'];
}

export function buildRecoveryPlans(issues: HealingIssue[], now: string): RecoveryPlan[] {
  return issues
    .filter(
      (i) =>
        i.status === 'recovery-planned' ||
        i.riskLevel === 'high' ||
        i.restrictedDomain !== null ||
        (i.riskLevel === 'medium' && i.status === 'pending-approval')
    )
    .map((issue) => {
      const template = templateForIssue(issue);
      return {
        id: `recovery-${issue.id}`,
        issueId: issue.id,
        ...template,
        recommendedPriority: priorityForIssue(issue),
        preparedAt: now,
        status: 'ready' as const,
      };
    });
}
