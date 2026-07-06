import type { OrganizationSelfHealingEngineProfile } from './types';

export function querySelfHealingEngine(
  query: string,
  profile: OrganizationSelfHealingEngineProfile,
  limit = 8
) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits = [];

  for (const issue of profile.issues) {
    const hay = `${issue.title} ${issue.description} ${issue.categoryLabel} ${issue.rootCause}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'issue' as const,
        id: issue.id,
        label: issue.title,
        score: issue.confidencePct,
        matchReason: `${issue.categoryLabel} · ${issue.riskLevel} · ${issue.status}`,
      });
    }
  }

  for (const repair of profile.repairs) {
    const hay = `${repair.repairPerformed} ${repair.rootCause}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'repair' as const,
        id: repair.id,
        label: repair.repairPerformed.slice(0, 60),
        score: repair.confidencePct,
        matchReason: `Repaired · ${repair.riskLevel} risk`,
      });
    }
  }

  for (const plan of profile.recoveryPlans) {
    const hay = `${plan.problemSummary} ${plan.rootCauseAnalysis}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'recovery' as const,
        id: plan.id,
        label: plan.problemSummary.slice(0, 60),
        score: plan.recommendedPriority === 'critical' ? 95 : 80,
        matchReason: `${plan.recommendedPriority} priority · ${plan.estimatedDowntime}`,
      });
    }
  }

  for (const entry of profile.auditLog) {
    const hay = `${entry.title} ${entry.summary}`.toLowerCase();
    if (hay.includes(q)) {
      hits.push({
        type: 'audit' as const,
        id: entry.id,
        label: entry.title,
        score: entry.confidencePct,
        matchReason: entry.eventType,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function explainHealingIssue(issueId: string, profile: OrganizationSelfHealingEngineProfile): string | null {
  const issue = profile.issues.find((i) => i.id === issueId);
  if (!issue) return null;
  const plan = profile.recoveryPlans.find((p) => p.issueId === issueId);
  const planLine = plan ? ` Recovery plan ready: ${plan.stepByStepPlan.length} steps.` : '';
  return `${issue.title}: ${issue.rootCause}${planLine}`;
}
