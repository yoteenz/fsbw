import type { RiskViewEntry } from '../types';
import { listDependencySystemRegistry } from '../system-registry/registry';

const RISK_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Architecture Risks View */
export function getRiskView(): RiskViewEntry[] {
  return listDependencySystemRegistry()
    .map((system) => ({
      systemId: system.systemId,
      name: system.name,
      implementationRisk: system.implementationRisk,
      blockedBy: system.blockedBy,
      readinessScore: system.readinessScore,
      priority: system.priority,
    }))
    .sort((a, b) => {
      const riskDiff = (RISK_RANK[b.implementationRisk] ?? 0) - (RISK_RANK[a.implementationRisk] ?? 0);
      if (riskDiff !== 0) return riskDiff;
      return a.readinessScore - b.readinessScore;
    });
}

export function getCriticalRiskSystems(): RiskViewEntry[] {
  return getRiskView().filter((r) => r.implementationRisk === 'critical');
}

export function getHighRiskSystems(): RiskViewEntry[] {
  return getRiskView().filter(
    (r) => r.implementationRisk === 'critical' || r.implementationRisk === 'high'
  );
}

export function getRiskSummary(): {
  critical: number;
  high: number;
  medium: number;
  low: number;
} {
  const systems = listDependencySystemRegistry();
  return {
    critical: systems.filter((s) => s.implementationRisk === 'critical').length,
    high: systems.filter((s) => s.implementationRisk === 'high').length,
    medium: systems.filter((s) => s.implementationRisk === 'medium').length,
    low: systems.filter((s) => s.implementationRisk === 'low').length,
  };
}
