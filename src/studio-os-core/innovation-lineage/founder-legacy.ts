import type { FounderInnovationLegacy, IntellectualEquityMetrics } from './types';

export function buildFounderInnovationLegacy(
  founderId: string,
  founderName: string,
  equity: IntellectualEquityMetrics,
  collaborationCount: number
): FounderInnovationLegacy {
  return {
    founderId,
    founderName,
    creativeEquity: equity.creativeEquity,
    innovationScore: Math.min(99, Math.round(equity.influenceScore * 0.6 + equity.innovationReach * 0.4)),
    marketplaceInfluence: equity.influenceScore,
    companiesHelped: equity.companiesUsing,
    ideasAdopted: equity.reuseCount,
    successfulCollaborations: collaborationCount,
    knowledgeShared: Math.round(equity.derivativeWorks * 3 + equity.forks),
    breakthroughsCreated: equity.successfulMerges + equity.originalContributions,
    topDomains: ['Luxury retail environments', 'Customer experience', 'Automation'],
  };
}

export function summarizeFounderLegacy(legacy: FounderInnovationLegacy): string {
  return `${legacy.founderName} — Innovation Score ${legacy.innovationScore} · ${legacy.companiesHelped.toLocaleString()} companies helped · ${legacy.breakthroughsCreated} breakthroughs`;
}
