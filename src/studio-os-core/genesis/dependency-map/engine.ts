import { readDependencyMapStore } from './persistence';
import {
  ensureDependencyMapStore,
  recomputeDependencyMap,
  seedDependencyMapStore,
} from './bootstrap/seed';
import {
  listDependencySystemRegistry,
  getDependencySystem,
  searchDependencySystemRegistry,
  listSystemsByStatus,
  listSystemsByBuildPhase,
  listSystemsByPriority,
  updateDependencySystemStatus,
  validateDependencyMapStore,
} from './system-registry/registry';
import {
  getDependencyGraphView,
  detectDependencyMapCircularities,
  detectMissingDependencies,
  listDependencyMapOutboundDependencies,
  listDependencyMapInboundDependents,
} from './system-dependencies/graph';
import {
  listAllEventsEmitted,
  listAllEventsConsumed,
  getSystemEventContracts,
  getEventCoverageSummary,
} from './system-events/events';
import {
  getBuildOrderView,
  getNextSystemsToBuild,
  getBuildOrderByPhase,
} from './build-order/order';
import {
  getBlockedSystemsView,
  getReadyToBuildView,
  getReadinessSummary,
} from './readiness/scoring';
import {
  getRiskView,
  getCriticalRiskSystems,
  getHighRiskSystems,
  getRiskSummary,
} from './architecture-risks/risks';
import {
  DEPENDENCY_MAP_SUBSYSTEM_NAME,
  DEPENDENCY_MAP_SUBSYSTEM_VERSION,
  SYSTEM_IMPLEMENTATION_STATUSES,
  BUILD_PRIORITIES,
  IMPLEMENTATION_RISK_LEVELS,
  BUILD_PHASES,
} from './constants';
import type { DependencyMapRegistryStats } from './types';

export function ensureDependencyMapSubsystem() {
  return ensureDependencyMapStore();
}

export function getDependencyMapPlatformStats(): DependencyMapRegistryStats {
  const systems = listDependencySystemRegistry();
  const circular = detectDependencyMapCircularities();
  const missing = detectMissingDependencies();
  const readiness = getReadinessSummary();

  return {
    systemCount: systems.length,
    implementedCount: systems.filter((s) => s.status === 'implemented').length,
    inProgressCount: systems.filter((s) => s.status === 'in_progress').length,
    plannedCount: systems.filter((s) => s.status === 'planned').length,
    blockedCount: systems.filter((s) => s.status === 'blocked').length,
    readyToBuildCount: getReadyToBuildView().length,
    circularCycleCount: circular.cycles.length,
    missingDependencyCount: missing.length,
    averageReadinessScore: readiness.averageScore,
  };
}

export {
  DEPENDENCY_MAP_SUBSYSTEM_NAME,
  DEPENDENCY_MAP_SUBSYSTEM_VERSION,
  SYSTEM_IMPLEMENTATION_STATUSES,
  BUILD_PRIORITIES,
  IMPLEMENTATION_RISK_LEVELS,
  BUILD_PHASES,
  readDependencyMapStore,
  ensureDependencyMapStore,
  seedDependencyMapStore,
  recomputeDependencyMap,
  listDependencySystemRegistry,
  getDependencySystem,
  searchDependencySystemRegistry,
  listSystemsByStatus,
  listSystemsByBuildPhase,
  listSystemsByPriority,
  updateDependencySystemStatus,
  validateDependencyMapStore,
  getDependencyGraphView,
  detectDependencyMapCircularities,
  detectMissingDependencies,
  listDependencyMapOutboundDependencies,
  listDependencyMapInboundDependents,
  listAllEventsEmitted,
  listAllEventsConsumed,
  getSystemEventContracts,
  getEventCoverageSummary,
  getBuildOrderView,
  getNextSystemsToBuild,
  getBuildOrderByPhase,
  getBlockedSystemsView,
  getReadyToBuildView,
  getReadinessSummary,
  getRiskView,
  getCriticalRiskSystems,
  getHighRiskSystems,
  getRiskSummary,
};

export type {
  DependencyMapRegistryStats,
  DependencySystemRecord,
  DependencyGraphView,
  BuildOrderEntry,
  RiskViewEntry,
  BlockedSystemEntry,
  ReadyToBuildEntry,
  CircularDependencyReport,
  MissingDependencyReport,
} from './types';
