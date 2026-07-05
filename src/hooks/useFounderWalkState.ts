import {useCallback, useMemo, useState} from 'react';
import { buildFounderWalkSeed } from '../studio-os-core/founder-walk/bootstrap';
import {
  bootstrapFounderWalkStore,
  readFounderWalkStore,
  selectFounderWalkWorkspace,
  setFounderWalkTimelineEra,
} from '../studio-os-core/founder-walk/store';
import type { FounderWalkWorkspaceId, TimelineEra } from '../studio-os-core/founder-walk/types';

function ensureSeeded(): void {
  bootstrapFounderWalkStore(buildFounderWalkSeed());
}

export function useFounderWalkState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readFounderWalkStore();
  }, [version]);

  const selectWorkspace = useCallback((id: FounderWalkWorkspaceId) => {
    selectFounderWalkWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const setTimelineEra = useCallback((era: TimelineEra) => {
    setFounderWalkTimelineEra(era);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace, setTimelineEra };
}
