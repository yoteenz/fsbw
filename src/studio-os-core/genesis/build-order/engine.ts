import { readBuildOrderStore } from './persistence';
import {
  ensureBuildOrderStore,
  recomputeBuildOrder,
  seedBuildOrderStore,
} from './bootstrap/seed';
import {
  listBuildOrderRegistry,
  getBuildOrderSystem,
  searchBuildOrderRegistry,
  listBuildOrderByPhase,
  listBuildOrderByStatus,
  updateBuildOrderSystemStatus,
  validateBuildOrderStore,
} from './build-order/registry';
import { getCurrentSprintView } from './build-order/sprint';
import {
  resolveBuildOrderDependencies,
  detectBuildOrderCircularities,
  listBuildOrderOutboundDependencies,
  listBuildOrderInboundDependents,
} from './dependency-engine/resolver';
import { getCriticalPathView, getCriticalPathProgress } from './critical-path/analyzer';
import { getParallelWorkView } from './parallel-work/planner';
import { getBuildPhasesView, getBuildPhaseLabel } from './build-phases/phases';
import { getArchitecturalReadinessView } from './readiness/architectural';
import {
  getImplementationReadinessView,
  getBuildOrderReadyView,
  getOptimalNextSystem,
  getOverallRoadmapView,
} from './readiness/implementation';
import { getBuildOrderBlockedView } from './blocked/blocked';
import {
  getRewriteRiskAnalysis,
  getHighRewriteRiskSystems,
  getRewriteRiskSummary,
} from './risks/rewrite-risk';
import {
  getTechnicalDebtForecast,
  getHighTechnicalDebtSystems,
  getTechnicalDebtSummary,
} from './risks/technical-debt';
import {
  BUILD_ORDER_SUBSYSTEM_NAME,
  BUILD_ORDER_SUBSYSTEM_VERSION,
  BUILD_ORDER_STATUSES,
  BUILD_ORDER_PRIORITIES,
  BUILD_ORDER_ARCHITECTURAL_PHASES,
  READINESS_LEVELS,
  RISK_LEVELS,
} from './constants';
import type { BuildOrderPlatformStats } from './types';

export function ensureBuildOrderSubsystem() {
  return ensureBuildOrderStore();
}

export function getBuildOrderPlatformStats(): BuildOrderPlatformStats {
  const systems = listBuildOrderRegistry();
  const impl = getImplementationReadinessView();
  const optimal = getOptimalNextSystem();

  return {
    systemCount: systems.length,
    implementedCount: systems.filter((s) => s.currentStatus === 'implemented').length,
    inProgressCount: systems.filter((s) => s.currentStatus === 'in_progress').length,
    plannedCount: systems.filter((s) => s.currentStatus === 'planned').length,
    blockedCount: systems.filter((s) => s.currentStatus === 'blocked').length,
    readyToBuildCount: getBuildOrderReadyView().length,
    optimalNextSystemId: optimal?.systemId ?? null,
    criticalPathProgress: getCriticalPathProgress(),
    averageImplementationReadiness: impl.averageScore,
  };
}

export {
  BUILD_ORDER_SUBSYSTEM_NAME,
  BUILD_ORDER_SUBSYSTEM_VERSION,
  BUILD_ORDER_STATUSES,
  BUILD_ORDER_PRIORITIES,
  BUILD_ORDER_ARCHITECTURAL_PHASES,
  READINESS_LEVELS,
  RISK_LEVELS,
  readBuildOrderStore,
  ensureBuildOrderStore,
  seedBuildOrderStore,
  recomputeBuildOrder,
  listBuildOrderRegistry,
  getBuildOrderSystem,
  searchBuildOrderRegistry,
  listBuildOrderByPhase,
  listBuildOrderByStatus,
  updateBuildOrderSystemStatus,
  validateBuildOrderStore,
  getCurrentSprintView,
  resolveBuildOrderDependencies,
  detectBuildOrderCircularities,
  listBuildOrderOutboundDependencies,
  listBuildOrderInboundDependents,
  getCriticalPathView,
  getCriticalPathProgress,
  getParallelWorkView,
  getBuildPhasesView,
  getBuildPhaseLabel,
  getArchitecturalReadinessView,
  getImplementationReadinessView,
  getBuildOrderReadyView,
  getOptimalNextSystem,
  getOverallRoadmapView,
  getBuildOrderBlockedView,
  getRewriteRiskAnalysis,
  getHighRewriteRiskSystems,
  getRewriteRiskSummary,
  getTechnicalDebtForecast,
  getHighTechnicalDebtSystems,
  getTechnicalDebtSummary,
};

export type {
  BuildOrderPlatformStats,
  BuildOrderSystemRecord,
  BuildPhaseView,
  CriticalPathView,
  ParallelWorkView,
  ArchitecturalReadinessView,
  ImplementationReadinessView,
  BlockedSystemView,
  ReadyToBuildView,
  RoadmapEntry,
  CurrentSprintView,
  RewriteRiskEntry,
  TechnicalDebtEntry,
  BuildOrderCircularDependencyReport,
} from './types';
