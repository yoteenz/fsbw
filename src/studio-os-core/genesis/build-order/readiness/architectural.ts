import { listBuildOrderRegistry } from '../build-order/registry';
import type { ReadinessLevel } from '../constants';
import type { ReadinessScoreEntry, ArchitecturalReadinessView } from '../types';

const READINESS_SCORE: Record<ReadinessLevel, number> = {
  shipped: 100,
  high: 85,
  medium: 55,
  low: 25,
};

/** Architectural Readiness Engine™ */
export function scoreArchitecturalReadiness(level: ReadinessLevel): number {
  return READINESS_SCORE[level] ?? 0;
}

export function getArchitecturalReadinessView(): ArchitecturalReadinessView {
  const systems = listBuildOrderRegistry().map((system): ReadinessScoreEntry => ({
    systemId: system.systemId,
    officialName: system.officialName,
    score: scoreArchitecturalReadiness(system.architecturalReadiness),
    level: system.architecturalReadiness,
    blockedBy: system.blockedBy,
  }));

  const total = systems.reduce((sum, s) => sum + s.score, 0);
  const averageScore = systems.length ? Math.round(total / systems.length) : 0;

  return {
    systems,
    averageScore,
    highCount: systems.filter((s) => s.level === 'high' || s.level === 'shipped').length,
    mediumCount: systems.filter((s) => s.level === 'medium').length,
    lowCount: systems.filter((s) => s.level === 'low').length,
  };
}
