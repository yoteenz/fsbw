import { useCallback, useMemo, useState } from 'react';
import {
  EXECUTIVE_DECISIONS_DEFAULT,
  searchExecutiveIndex,
  type ExecutiveDecision,
} from '../utils/adminStudioExecutiveCommandCenterDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type DecisionStore = Record<string, ExecutiveDecision['status']>;

function readDecisions(): DecisionStore {
  return readStudioJson<DecisionStore>(ADMIN_STUDIO_STORAGE_KEYS.executiveCommandCenter) ?? {};
}

function writeDecisions(store: DecisionStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.executiveCommandCenter, store);
}

export function getExecutiveDecisions(): ExecutiveDecision[] {
  const store = readDecisions();
  return EXECUTIVE_DECISIONS_DEFAULT.map((d) => ({
    ...d,
    status: store[d.id] ?? d.status,
  }));
}

export function exportExecutiveCommandCenterSnapshot() {
  return {
    decisions: getExecutiveDecisions(),
    source: 'executive-command-center-local' as const,
  };
}

export function useAdminStudioExecutiveCommandCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const decisions = useMemo(() => {
    void version;
    return getExecutiveDecisions();
  }, [version]);

  const searchResults = useMemo(() => searchExecutiveIndex(searchQuery), [searchQuery]);

  const setDecisionStatus = useCallback(
    (id: string, status: ExecutiveDecision['status']) => {
      const store = readDecisions();
      store[id] = status;
      writeDecisions(store);
      bump();
    },
    [bump]
  );

  const pendingDecisionCount = decisions.filter((d) => d.status === 'pending').length;

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    decisions,
    setDecisionStatus,
    pendingDecisionCount,
  };
}
