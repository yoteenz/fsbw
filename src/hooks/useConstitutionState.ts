import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureConstitutionSubsystem,
  getConstitutionPlatformStats,
  listConstitutionRegistry,
  listConstitutionAmendments,
  listOpenConstitutionAmendments,
  listPendingConstitutionReviews,
  listConstitutionRelationships,
  listConstitutionHistoricalArchive,
  listConstitutionAmendmentStages,
  listConstitutionCrossReferences,
  GENESIS_UPDATED_EVENT,
} from '../studio-os-core/genesis';

export function useConstitutionState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureConstitutionSubsystem();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureConstitutionSubsystem();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(GENESIS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(GENESIS_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const stats = useMemo(() => getConstitutionPlatformStats(), [tick]);
  const articles = useMemo(() => listConstitutionRegistry(), [tick]);
  const amendments = useMemo(() => listConstitutionAmendments(), [tick]);
  const openAmendments = useMemo(() => listOpenConstitutionAmendments(), [tick]);
  const reviews = useMemo(() => listPendingConstitutionReviews(), [tick]);
  const relationships = useMemo(() => listConstitutionRelationships(), [tick]);
  const historicalArchive = useMemo(() => listConstitutionHistoricalArchive(), [tick]);
  const amendmentStages = useMemo(() => listConstitutionAmendmentStages(), [tick]);

  return {
    stats,
    articles,
    amendments,
    openAmendments,
    reviews,
    relationships,
    historicalArchive,
    amendmentStages,
    listConstitutionCrossReferences,
    refresh,
    tick,
  };
}
