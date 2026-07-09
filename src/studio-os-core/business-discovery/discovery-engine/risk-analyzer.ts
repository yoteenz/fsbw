import type { BusinessRisk, DiscoverySession } from '../types';

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function analyzeBusinessRisks(session: DiscoverySession): BusinessRisk[] {
  const risks: BusinessRisk[] = [];

  for (const dependency of session.dependencies.filter((dep) => dep.bottleneckRisk === 'high')) {
    risks.push({
      id: uid('risk'),
      title: `Bottleneck in ${dependency.workflowName}`,
      description: `Workflow requires ${dependency.requiredInputs.join(', ')} before progressing.`,
      severity: 'high',
      category: 'bottleneck',
      mitigation: 'Document owners, inputs, and approval thresholds in the operational graph.',
      sourcePhaseId: dependency.sourcePhaseId,
    });
  }

  const knowledgeResponses = session.responses.filter((r) => r.phaseId === 'knowledge-discovery');
  if (knowledgeResponses.length > 0 && knowledgeResponses.length < 3) {
    risks.push({
      id: uid('risk'),
      title: 'Incomplete knowledge foundation',
      description: 'Key SOPs, policies, or brand standards may be undocumented.',
      severity: 'medium',
      category: 'knowledge',
      mitigation: 'Continue knowledge discovery and seed Profession Brain™ with verified documents.',
      sourcePhaseId: 'knowledge-discovery',
    });
  }

  if (session.company.revenueSources.length === 1) {
    risks.push({
      id: uid('risk'),
      title: 'Revenue concentration',
      description: `Primary revenue depends on: ${session.company.revenueSources[0]}.`,
      severity: 'medium',
      category: 'revenue',
      mitigation: 'Map additional offers and revenue streams in the revenue graph.',
      sourcePhaseId: 'company-discovery',
    });
  }

  const founderLedApprovals = session.dependencies.some((dep) =>
    dep.requiredApprovals.some((approval) => approval.toLowerCase().includes('founder'))
  );
  if (founderLedApprovals) {
    risks.push({
      id: uid('risk'),
      title: 'Founder dependency in approvals',
      description: 'Critical workflows may stall when the founder is unavailable.',
      severity: 'high',
      category: 'founder-dependency',
      mitigation: 'Define delegated approval thresholds in the decision graph.',
      sourcePhaseId: 'relationship-discovery',
    });
  }

  if (!session.company.operationsSummary && session.discoveredSystems.length >= 2) {
    risks.push({
      id: uid('risk'),
      title: 'Undocumented operational workflow',
      description: 'Systems were inferred but end-to-end operations were not fully described.',
      severity: 'medium',
      category: 'workflow',
      mitigation: 'Complete company and relationship discovery with an operations walkthrough.',
      sourcePhaseId: 'company-discovery',
    });
  }

  return risks;
}
