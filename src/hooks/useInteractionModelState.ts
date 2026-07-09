import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureInteractionModelSubsystem,
  getInteractionModelPlatformStats,
  listInteractionRegistry,
  listEventRegistry,
  listWorkflowRegistry,
  listCommandRegistry,
  listAuditLog,
  listCanonicalInteractionTypes,
  getEventCategoryCoverage,
  getInteractionTypeCoverage,
  validateInteractionModelStore,
  CANONICAL_INTERACTION_TYPES,
  EVENT_CATEGORIES,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useInteractionModelState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureInteractionModelSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureInteractionModelSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const stats = useMemo(() => getInteractionModelPlatformStats(), [tick]);
  const interactions = useMemo(() => listInteractionRegistry(), [tick]);
  const events = useMemo(() => listEventRegistry(), [tick]);
  const workflows = useMemo(() => listWorkflowRegistry(), [tick]);
  const commands = useMemo(() => listCommandRegistry(), [tick]);
  const auditLog = useMemo(() => listAuditLog(), [tick]);
  const interactionTypes = useMemo(() => listCanonicalInteractionTypes(), [tick]);
  const eventCategoryCoverage = useMemo(() => getEventCategoryCoverage(), [tick]);
  const interactionTypeCoverage = useMemo(() => getInteractionTypeCoverage(), [tick]);
  const validation = useMemo(() => validateInteractionModelStore(), [tick]);
  const canonicalInteractionTypeIds = useMemo(() => [...CANONICAL_INTERACTION_TYPES], [tick]);
  const eventCategories = useMemo(() => [...EVENT_CATEGORIES], [tick]);

  return {
    stats,
    interactions,
    events,
    workflows,
    commands,
    auditLog,
    interactionTypes,
    eventCategoryCoverage,
    interactionTypeCoverage,
    validation,
    canonicalInteractionTypeIds,
    eventCategories,
    refresh,
    tick,
  };
}
