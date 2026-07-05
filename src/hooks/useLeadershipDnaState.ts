import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildLeadershipDnaSeed } from '../studio-os-core/leadership-dna/bootstrap';
import {
  bootstrapLeadershipDnaStore,
  evaluateChiefOfStaffAlignment,
  readLeadershipDnaStore,
  recordDecisionOutcome,
  refreshLeadershipDnaDashboard,
} from '../studio-os-core/leadership-dna/store';
import type { LeadershipProfileSectionId } from '../studio-os-core/leadership-dna/types';

function ensureSeeded(): void {
  bootstrapLeadershipDnaStore(buildLeadershipDnaSeed());
  refreshLeadershipDnaDashboard();
}

export function useLeadershipDnaState() {
  const [version, setVersion] = useState(0);
  const [activeSection, setActiveSection] = useState<LeadershipProfileSectionId>('leadership-philosophy');

  const refresh = useCallback(() => {
    ensureSeeded();
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readLeadershipDnaStore();
  }, [version]);

  const activeProfile = useMemo(
    () => store.founderProfile.find((s) => s.id === activeSection) ?? store.founderProfile[0],
    [store.founderProfile, activeSection]
  );

  const evaluateAlignment = useCallback(
    (input: { title: string; category: string; confidencePct: number; evaluatedAgainst: string[] }) =>
      evaluateChiefOfStaffAlignment(input),
    []
  );

  const logOutcome = useCallback((entryId: string, outcome: string, lessons: string[]) => {
    recordDecisionOutcome(entryId, outcome, lessons);
    setVersion((v) => v + 1);
  }, []);

  return {
    store,
    refresh,
    activeSection,
    setActiveSection,
    activeProfile,
    evaluateAlignment,
    logOutcome,
  };
}
