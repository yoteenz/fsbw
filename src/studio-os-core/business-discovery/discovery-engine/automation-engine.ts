import { AUTOMATION_READINESS_THRESHOLD } from '../constants';
import type { AutomationOpportunity, DiscoverySession } from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function detectAutomationOpportunities(session: DiscoverySession): AutomationOpportunity[] {
  const opportunities: AutomationOpportunity[] = [];

  for (const dependency of session.dependencies) {
    const readiness = dependency.bottleneckRisk === 'high' ? 55 : dependency.bottleneckRisk === 'medium' ? 72 : 85;
    if (readiness >= AUTOMATION_READINESS_THRESHOLD - 15) {
      opportunities.push({
        id: uid('auto'),
        title: `Observe ${dependency.workflowName}`,
        description: 'Repeated workflow pattern suitable for Shadow Mode observation before automation.',
        workflowName: dependency.workflowName,
        readinessScore: readiness,
        shadowModePhase: readiness >= AUTOMATION_READINESS_THRESHOLD ? 'recommend' : 'observe',
        awaitingApproval: true,
        sourcePhaseId: dependency.sourcePhaseId,
      });
    }
  }

  if (session.company.customerSegments.length && session.company.offers.length) {
    opportunities.push({
      id: uid('auto'),
      title: 'Customer follow-up preparation',
      description: 'Studio Intelligence can prepare follow-up briefs after customer interactions.',
      workflowName: 'Customer follow-up',
      readinessScore: 78,
      shadowModePhase: 'assist',
      awaitingApproval: true,
      sourcePhaseId: 'company-discovery',
    });
  }

  return opportunities;
}
