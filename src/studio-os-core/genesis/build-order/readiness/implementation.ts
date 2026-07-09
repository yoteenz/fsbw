import { listBuildOrderRegistry } from '../build-order/registry';
import type { ReadinessLevel } from '../constants';
import type {
  ImplementationReadinessView,
  ReadinessScoreEntry,
  ReadyToBuildView,
} from '../types';

const READINESS_SCORE: Record<ReadinessLevel, number> = {
  shipped: 100,
  high: 85,
  medium: 55,
  low: 25,
};

const RISK_PENALTY: Record<string, number> = {
  low: 0,
  medium: 8,
  high: 18,
  critical: 30,
};

function isBuildCandidate(status: string): boolean {
  return status === 'planned' || status === 'in_progress';
}

/** Implementation Readiness Engine™ */
export function computeImplementationReadinessScore(
  implementationReadiness: ReadinessLevel,
  blockedBy: string[],
  rewriteRisk: string,
  technicalDebtRisk: string
): number {
  if (blockedBy.length > 0) {
    return Math.max(0, 30 - blockedBy.length * 8);
  }
  const base = READINESS_SCORE[implementationReadiness] ?? 0;
  const penalty =
    (RISK_PENALTY[rewriteRisk] ?? 0) / 2 + (RISK_PENALTY[technicalDebtRisk] ?? 0) / 2;
  return Math.max(0, Math.round(base - penalty));
}

export function getImplementationReadinessView(): ImplementationReadinessView {
  const systems = listBuildOrderRegistry().map((system): ReadinessScoreEntry => ({
    systemId: system.systemId,
    officialName: system.officialName,
    score: computeImplementationReadinessScore(
      system.implementationReadiness,
      system.blockedBy,
      system.rewriteRisk,
      system.technicalDebtRisk
    ),
    level: system.implementationReadiness,
    blockedBy: system.blockedBy,
  }));

  const total = systems.reduce((sum, s) => sum + s.score, 0);
  const averageScore = systems.length ? Math.round(total / systems.length) : 0;

  return {
    systems,
    averageScore,
    readyToBuildCount: getBuildOrderReadyView().length,
    shippedCount: listBuildOrderRegistry().filter((s) => s.implementationReadiness === 'shipped').length,
  };
}

export function getBuildOrderReadyView(): ReadyToBuildView[] {
  return listBuildOrderRegistry()
    .filter(
      (s) =>
        isBuildCandidate(s.currentStatus) &&
        s.blockedBy.length === 0 &&
        computeImplementationReadinessScore(
          s.implementationReadiness,
          s.blockedBy,
          s.rewriteRisk,
          s.technicalDebtRisk
        ) >= 50
    )
    .sort((a, b) => a.topologicalOrder - b.topologicalOrder)
    .map((system) => ({
      systemId: system.systemId,
      officialName: system.officialName,
      topologicalOrder: system.topologicalOrder,
      priority: system.priority,
      implementationScore: computeImplementationReadinessScore(
        system.implementationReadiness,
        system.blockedBy,
        system.rewriteRisk,
        system.technicalDebtRisk
      ),
      businessValue: system.businessValue,
      platformValue: system.platformValue,
    }));
}

export function getOptimalNextSystem(): ReadyToBuildView | null {
  const ready = getBuildOrderReadyView();
  return ready[0] ?? null;
}

export function getOverallRoadmapView() {
  return listBuildOrderRegistry().map((system) => ({
    systemId: system.systemId,
    officialName: system.officialName,
    topologicalOrder: system.topologicalOrder,
    architecturalPhase: system.architecturalPhase,
    currentStatus: system.currentStatus,
    priority: system.priority,
    blockedBy: system.blockedBy,
  }));
}
