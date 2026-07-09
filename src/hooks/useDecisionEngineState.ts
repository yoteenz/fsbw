import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureDecisionEngineSubsystem,
  getDecisionEnginePlatformStats,
  listDecisionRegistry,
  listStudioRecommendations,
  listStudioPriorityRankings,
  listStudioStrategies,
  listDecisionAuditLog,
  listDecisionHistory,
  listCanonicalDecisionTypes,
  getDecisionTypeCoverage,
  validateDecisionEngineStore,
  CANONICAL_DECISION_TYPES,
  CONFIDENCE_LEVELS,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useDecisionEngineState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureDecisionEngineSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureDecisionEngineSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const stats = useMemo(() => getDecisionEnginePlatformStats(), [tick]);
  const decisions = useMemo(() => listDecisionRegistry(), [tick]);
  const recommendations = useMemo(() => listStudioRecommendations(), [tick]);
  const priorities = useMemo(() => listStudioPriorityRankings(), [tick]);
  const strategies = useMemo(() => listStudioStrategies(), [tick]);
  const auditLog = useMemo(() => listDecisionAuditLog(), [tick]);
  const history = useMemo(() => listDecisionHistory(), [tick]);
  const decisionTypes = useMemo(() => listCanonicalDecisionTypes(), [tick]);
  const decisionTypeCoverage = useMemo(() => getDecisionTypeCoverage(), [tick]);
  const validation = useMemo(() => validateDecisionEngineStore(), [tick]);
  const canonicalDecisionTypeIds = useMemo(() => [...CANONICAL_DECISION_TYPES], [tick]);
  const confidenceLevels = useMemo(() => [...CONFIDENCE_LEVELS], [tick]);

  return {
    stats,
    decisions,
    recommendations,
    priorities,
    strategies,
    auditLog,
    history,
    decisionTypes,
    decisionTypeCoverage,
    validation,
    canonicalDecisionTypeIds,
    confidenceLevels,
    refresh,
    tick,
  };
}
