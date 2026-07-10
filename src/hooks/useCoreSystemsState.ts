import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureCoreSystemsSubsystem,
  getCoreSystemsPlatformStats,
  listSystemRegistry,
  listDependencyRegistry,
  listCapabilityRegistry,
  listBoundaryDefinitions,
  listIntegrationContracts,
  listExpansionHooks,
  listLifecycleHistory,
  getCanonicalSystemCoverage,
  getDependencyGraph,
  detectCircularDependencies,
  getCoreSystemLifecycleSummary,
  validateCoreSystemsStore,
  CANONICAL_CORE_SYSTEMS,
  CORE_SYSTEM_DOMAINS,
  SYSTEM_LIFECYCLE_STATES,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useCoreSystemsState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureCoreSystemsSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => setTick((n) => n + 1);
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, []);

  const stats = useMemo(() => getCoreSystemsPlatformStats(), [tick]);
  const systems = useMemo(() => listSystemRegistry(), [tick]);
  const dependencies = useMemo(() => listDependencyRegistry(), [tick]);
  const capabilities = useMemo(() => listCapabilityRegistry(), [tick]);
  const boundaries = useMemo(() => listBoundaryDefinitions(), [tick]);
  const contracts = useMemo(() => listIntegrationContracts(), [tick]);
  const expansionHooks = useMemo(() => listExpansionHooks(), [tick]);
  const lifecycleHistory = useMemo(() => listLifecycleHistory(), [tick]);
  const canonicalCoverage = useMemo(() => getCanonicalSystemCoverage(), [tick]);
  const dependencyGraph = useMemo(() => getDependencyGraph(), [tick]);
  const circularDependencies = useMemo(() => detectCircularDependencies(), [tick]);
  const lifecycleSummary = useMemo(() => getCoreSystemLifecycleSummary(), [tick]);
  const validation = useMemo(() => validateCoreSystemsStore(), [tick]);
  const canonicalSystems = useMemo(() => [...CANONICAL_CORE_SYSTEMS], [tick]);
  const domains = useMemo(() => [...CORE_SYSTEM_DOMAINS], [tick]);
  const lifecycleStates = useMemo(() => [...SYSTEM_LIFECYCLE_STATES], [tick]);

  return {
    stats,
    systems,
    dependencies,
    capabilities,
    boundaries,
    contracts,
    expansionHooks,
    lifecycleHistory,
    canonicalCoverage,
    dependencyGraph,
    circularDependencies,
    lifecycleSummary,
    validation,
    canonicalSystems,
    domains,
    lifecycleStates,
    refresh,
    tick,
  };
}
