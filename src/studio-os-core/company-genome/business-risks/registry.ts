import type { BusinessRisk, RiskCategory } from '../business-types';

export function listBusinessRisks(risks: BusinessRisk[]): BusinessRisk[] {
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...risks].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function getBusinessRisk(risks: BusinessRisk[], riskId: string): BusinessRisk | null {
  return risks.find((r) => r.id === riskId) ?? null;
}

export function getRisksByCategory(risks: BusinessRisk[], category: RiskCategory): BusinessRisk[] {
  return risks.filter((r) => r.category === category);
}

export function getRisksForSystem(risks: BusinessRisk[], systemId: string): BusinessRisk[] {
  return risks.filter((r) => r.affectedSystemIds.includes(systemId));
}

export function getCriticalRiskCount(risks: BusinessRisk[]): number {
  return risks.filter((r) => r.severity === 'critical' || r.severity === 'high').length;
}
