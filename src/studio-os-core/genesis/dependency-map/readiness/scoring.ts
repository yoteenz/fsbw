import type { BlockedSystemEntry, ReadyToBuildEntry } from '../types';
import { detectMissingDependencies } from '../system-dependencies/graph';
import { listDependencySystemRegistry } from '../system-registry/registry';

const RISK_WEIGHT: Record<string, number> = {
  low: 0,
  medium: 10,
  high: 25,
  critical: 40,
};

function isReadyStatus(status: string): boolean {
  return status === 'planned' || status === 'in_progress';
}

/** Readiness scoring and planning views */
export function computeReadinessScore(
  blockedBy: string[],
  implementationRisk: string
): number {
  if (blockedBy.length > 0) {
    const penalty = Math.min(95, blockedBy.length * 20);
    return Math.max(0, 100 - penalty - (RISK_WEIGHT[implementationRisk] ?? 0) / 2);
  }
  return Math.max(0, 100 - (RISK_WEIGHT[implementationRisk] ?? 0));
}

export function getBlockedSystemsView(): BlockedSystemEntry[] {
  const missing = detectMissingDependencies();
  const missingMap = new Map(missing.map((m) => [m.systemId, m]));

  return listDependencySystemRegistry()
    .filter((s) => s.blockedBy.length > 0 || s.status === 'blocked')
    .map((system) => {
      const report = missingMap.get(system.systemId);
      return {
        systemId: system.systemId,
        name: system.name,
        blockedBy: system.blockedBy,
        missingDependencies: report?.missingUpstream ?? system.blockedBy,
        readinessScore: system.readinessScore,
      };
    })
    .sort((a, b) => a.readinessScore - b.readinessScore);
}

export function getReadyToBuildView(): ReadyToBuildEntry[] {
  return listDependencySystemRegistry()
    .filter(
      (s) =>
        isReadyStatus(s.status) &&
        s.blockedBy.length === 0 &&
        s.readinessScore >= 60
    )
    .sort((a, b) => a.buildOrder - b.buildOrder)
    .map((system) => ({
      systemId: system.systemId,
      name: system.name,
      buildOrder: system.buildOrder,
      priority: system.priority,
      readinessScore: system.readinessScore,
    }));
}

export function getReadinessSummary(): {
  averageScore: number;
  readyCount: number;
  blockedCount: number;
  implementedCount: number;
} {
  const systems = listDependencySystemRegistry();
  if (systems.length === 0) {
    return { averageScore: 0, readyCount: 0, blockedCount: 0, implementedCount: 0 };
  }

  const total = systems.reduce((sum, s) => sum + s.readinessScore, 0);
  return {
    averageScore: Math.round(total / systems.length),
    readyCount: getReadyToBuildView().length,
    blockedCount: getBlockedSystemsView().length,
    implementedCount: systems.filter((s) => s.status === 'implemented').length,
  };
}
