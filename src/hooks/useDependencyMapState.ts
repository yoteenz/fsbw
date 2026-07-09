import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureDependencyMapSubsystem,
  getDependencyMapPlatformStats,
  listDependencySystemRegistry,
  getDependencyGraphView,
  detectDependencyMapCircularities,
  detectMissingDependencies,
  getBuildOrderView,
  getNextSystemsToBuild,
  getBlockedSystemsView,
  getReadyToBuildView,
  getRiskView,
  getReadinessSummary,
  getRiskSummary,
  validateDependencyMapStore,
  BUILD_PRIORITIES,
  BUILD_PHASES,
  IMPLEMENTATION_RISK_LEVELS,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useDependencyMapState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureDependencyMapSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureDependencyMapSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const stats = useMemo(() => getDependencyMapPlatformStats(), [tick]);
  const systems = useMemo(() => listDependencySystemRegistry(), [tick]);
  const dependencyGraph = useMemo(() => getDependencyGraphView(), [tick]);
  const circularDependencies = useMemo(() => detectDependencyMapCircularities(), [tick]);
  const missingDependencies = useMemo(() => detectMissingDependencies(), [tick]);
  const buildOrder = useMemo(() => getBuildOrderView(), [tick]);
  const nextToBuild = useMemo(() => getNextSystemsToBuild(8), [tick]);
  const blockedSystems = useMemo(() => getBlockedSystemsView(), [tick]);
  const readyToBuild = useMemo(() => getReadyToBuildView(), [tick]);
  const riskView = useMemo(() => getRiskView(), [tick]);
  const readinessSummary = useMemo(() => getReadinessSummary(), [tick]);
  const riskSummary = useMemo(() => getRiskSummary(), [tick]);
  const validation = useMemo(() => validateDependencyMapStore(), [tick]);
  const buildPriorities = useMemo(() => [...BUILD_PRIORITIES], [tick]);
  const buildPhases = useMemo(() => [...BUILD_PHASES], [tick]);
  const riskLevels = useMemo(() => [...IMPLEMENTATION_RISK_LEVELS], [tick]);

  return {
    stats,
    systems,
    dependencyGraph,
    circularDependencies,
    missingDependencies,
    buildOrder,
    nextToBuild,
    blockedSystems,
    readyToBuild,
    riskView,
    readinessSummary,
    riskSummary,
    validation,
    buildPriorities,
    buildPhases,
    riskLevels,
    refresh,
    tick,
  };
}
