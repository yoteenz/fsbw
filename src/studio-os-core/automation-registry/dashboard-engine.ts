import { buildAutomationCatalog } from './automation-catalog';
import type { AutomationDashboardSection, AutomationImprovementRecommendation, AutomationEntry } from './types';

export function buildAutomationDashboard(automations: AutomationEntry[]): AutomationDashboardSection[] {
  const active = automations.filter((a) => a.status === 'active');
  const paused = automations.filter((a) => a.status === 'paused');
  const failed = automations.filter((a) => a.status === 'failed');
  const pending = automations.filter((a) => a.status === 'pending-approval');

  const byUsage = [...automations].sort((a, b) => b.executionCount - a.executionCount);
  const byImpact = [...automations]
    .filter((a) => a.riskLevel === 'high' || a.approvalRequired)
    .sort((a, b) => b.executionCount - a.executionCount);
  const byConfidence = [...automations].sort((a, b) => a.confidencePct - b.confidencePct);
  const recent = [...automations]
    .filter((a) => a.lastExecutedAt)
    .sort((a, b) => (b.lastExecutedAt ?? '').localeCompare(a.lastExecutedAt ?? ''))
    .slice(0, 5);

  return [
    { sectionId: 'active', label: 'Active Automations', automationIds: active.map((a) => a.automationId), description: `${active.length} automations running` },
    { sectionId: 'paused', label: 'Paused Automations', automationIds: paused.map((a) => a.automationId), description: `${paused.length} temporarily disabled` },
    { sectionId: 'failed', label: 'Failed Automations', automationIds: failed.map((a) => a.automationId), description: `${failed.length} require attention` },
    { sectionId: 'pending-approval', label: 'Pending Approval', automationIds: pending.map((a) => a.automationId), description: `${pending.length} awaiting founder approval` },
    { sectionId: 'recent', label: 'Recently Executed', automationIds: recent.map((a) => a.automationId), description: 'Latest automation runs' },
    { sectionId: 'most-used', label: 'Most Used', automationIds: byUsage.slice(0, 5).map((a) => a.automationId), description: 'Highest execution volume' },
    { sectionId: 'highest-impact', label: 'Highest Impact', automationIds: byImpact.slice(0, 5).map((a) => a.automationId), description: 'High-risk or approval-gated automations' },
    { sectionId: 'lowest-confidence', label: 'Lowest Confidence', automationIds: byConfidence.slice(0, 5).map((a) => a.automationId), description: 'Shadow Mode or learning-phase automations' },
  ];
}

export function buildImprovementRecommendations(automations: AutomationEntry[]): AutomationImprovementRecommendation[] {
  const recs: AutomationImprovementRecommendation[] = [];

  for (const a of automations) {
    if (a.failureRatePct > 15) {
      recs.push({
        id: `rec-fail-${a.automationId}`,
        automationId: a.automationId,
        title: `Improve reliability: ${a.name}`,
        detail: `${a.failureRatePct}% failure rate — review trigger conditions and dependencies.`,
        priority: 'high',
      });
    }
    if (a.confidencePct < 80 && a.status === 'active') {
      recs.push({
        id: `rec-conf-${a.automationId}`,
        automationId: a.automationId,
        title: `Raise confidence: ${a.name}`,
        detail: `Confidence ${a.confidencePct}% — extend Shadow Mode observation before full automation.`,
        priority: 'medium',
      });
    }
    if (!a.registered) {
      recs.push({
        id: `rec-reg-${a.automationId}`,
        automationId: a.automationId,
        title: `Register: ${a.name}`,
        detail: 'Unregistered automation detected — register before allowing execution.',
        priority: 'high',
      });
    }
  }

  if (automations.filter((a) => a.category === 'customer-followup').length === 0) {
    recs.push({
      id: 'rec-next-followup',
      title: 'Automate customer follow-ups',
      detail: 'Relationship Memory can trigger post-purchase sequences — register follow-up automation.',
      priority: 'low',
    });
  }

  recs.push({
    id: 'rec-transparency',
    title: 'Maintain automation transparency',
    detail: 'Review Automation Registry monthly — ensure every automation has owner, documentation, and approval trail.',
    priority: 'low',
  });

  return recs.slice(0, 8);
}

export function pauseAutomationsByFilter(
  automations: AutomationEntry[],
  filter: (a: AutomationEntry) => boolean
): AutomationEntry[] {
  return automations.map((a) => (filter(a) ? { ...a, status: 'paused' as const } : a));
}

void buildAutomationCatalog;
