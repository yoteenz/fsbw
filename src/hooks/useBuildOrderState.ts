import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureBuildOrderSubsystem,
  getBuildOrderPlatformStats,
  listBuildOrderRegistry,
  getOverallRoadmapView,
  getCurrentSprintView,
  getBuildOrderReadyView,
  getBuildOrderBlockedView,
  getCriticalPathView,
  getParallelWorkView,
  getRewriteRiskAnalysis,
  getTechnicalDebtForecast,
  getArchitecturalReadinessView,
  getImplementationReadinessView,
  getOptimalNextSystem,
  getBuildPhasesView,
  getRewriteRiskSummary,
  getTechnicalDebtSummary,
  validateBuildOrderStore,
  detectBuildOrderCircularities,
  BUILD_ORDER_ARCHITECTURAL_PHASES,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useBuildOrderState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureBuildOrderSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => setTick((n) => n + 1);
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, []);

  const stats = useMemo(() => getBuildOrderPlatformStats(), [tick]);
  const systems = useMemo(() => listBuildOrderRegistry(), [tick]);
  const roadmap = useMemo(() => getOverallRoadmapView(), [tick]);
  const currentSprint = useMemo(() => getCurrentSprintView(), [tick]);
  const readyToBuild = useMemo(() => getBuildOrderReadyView(), [tick]);
  const blockedSystems = useMemo(() => getBuildOrderBlockedView(), [tick]);
  const criticalPath = useMemo(() => getCriticalPathView(), [tick]);
  const parallelWork = useMemo(() => getParallelWorkView(), [tick]);
  const rewriteRisks = useMemo(() => getRewriteRiskAnalysis(), [tick]);
  const technicalDebt = useMemo(() => getTechnicalDebtForecast(), [tick]);
  const architecturalReadiness = useMemo(() => getArchitecturalReadinessView(), [tick]);
  const implementationReadiness = useMemo(() => getImplementationReadinessView(), [tick]);
  const optimalNext = useMemo(() => getOptimalNextSystem(), [tick]);
  const buildPhases = useMemo(() => getBuildPhasesView(), [tick]);
  const rewriteRiskSummary = useMemo(() => getRewriteRiskSummary(), [tick]);
  const technicalDebtSummary = useMemo(() => getTechnicalDebtSummary(), [tick]);
  const validation = useMemo(() => validateBuildOrderStore(), [tick]);
  const circularDependencies = useMemo(() => detectBuildOrderCircularities(), [tick]);
  const architecturalPhases = useMemo(() => [...BUILD_ORDER_ARCHITECTURAL_PHASES], [tick]);

  return {
    stats,
    systems,
    roadmap,
    currentSprint,
    readyToBuild,
    blockedSystems,
    criticalPath,
    parallelWork,
    rewriteRisks,
    technicalDebt,
    architecturalReadiness,
    implementationReadiness,
    optimalNext,
    buildPhases,
    rewriteRiskSummary,
    technicalDebtSummary,
    validation,
    circularDependencies,
    architecturalPhases,
    refresh,
    tick,
  };
}
