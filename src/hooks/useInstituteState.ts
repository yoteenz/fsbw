import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ensureInstituteStore,
  getInstituteStats,
  buildInstituteAdvisorLines,
  listInstitutePublications,
  listInstituteDivisions,
  listPendingSubmissions,
  queryInstitutePublications,
  getInstituteDivisionStats,
  getInstituteCodexSyncSummary,
  INSTITUTE_OF_KNOWLEDGE_UPDATED_EVENT,
  type InstituteDivisionId,
  type InstitutePublicationStatus,
} from '../studio-os-core/institute-of-knowledge';

export function useInstituteState() {
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    ensureInstituteStore();
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    ensureInstituteStore();
  }, []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(INSTITUTE_OF_KNOWLEDGE_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(INSTITUTE_OF_KNOWLEDGE_UPDATED_EVENT, onUpdate);
  }, [refresh]);

  const publications = useMemo(() => listInstitutePublications(), [tick]);
  const stats = useMemo(() => getInstituteStats(), [tick]);
  const advisorLines = useMemo(() => buildInstituteAdvisorLines(), [tick]);
  const divisions = useMemo(() => listInstituteDivisions(), [tick]);
  const pendingSubmissions = useMemo(() => listPendingSubmissions(), [tick]);
  const divisionStats = useMemo(() => getInstituteDivisionStats(), [tick]);
  const codexSync = useMemo(() => getInstituteCodexSyncSummary(), [tick]);

  return {
    publications,
    stats,
    advisorLines,
    divisions,
    pendingSubmissions,
    divisionStats,
    codexSync,
    refresh,
    tick,
  };
}

export function useInstituteSearch(query: string) {
  const { tick } = useInstituteState();
  return useMemo(() => queryInstitutePublications(query, 12), [query, tick]);
}

export function useInstitutePublicationsByDivision(divisionId: InstituteDivisionId) {
  const { publications } = useInstituteState();
  return useMemo(
    () => publications.filter((p) => p.divisionId === divisionId),
    [publications, divisionId]
  );
}

export function useInstitutePublicationsByStatus(status: InstitutePublicationStatus) {
  const { publications } = useInstituteState();
  return useMemo(() => publications.filter((p) => p.status === status), [publications, status]);
}
