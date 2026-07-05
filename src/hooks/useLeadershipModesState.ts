import { useCallback, useEffect, useState } from 'react';
import { buildLeadershipModesSeed } from '../studio-os-core/leadership-modes/bootstrap';
import {
  bootstrapLeadershipModesStore,
  readLeadershipModesStore,
  selectLeadershipMode,
  selectLeadershipModesWorkspace,
} from '../studio-os-core/leadership-modes/store';
import type { LeadershipModeId, LeadershipModesWorkspaceId } from '../studio-os-core/leadership-modes/types';

function ensureBootstrap(): void {
  bootstrapLeadershipModesStore(buildLeadershipModesSeed());
}

export function useLeadershipModesState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readLeadershipModesStore();
  });

  useEffect(() => {
    ensureBootstrap();
    setStore(readLeadershipModesStore());
  }, []);

  const selectWorkspace = useCallback((id: LeadershipModesWorkspaceId) => {
    selectLeadershipModesWorkspace(id);
    setStore(readLeadershipModesStore());
  }, []);

  const selectMode = useCallback((id: LeadershipModeId) => {
    selectLeadershipMode(id);
    setStore(readLeadershipModesStore());
  }, []);

  return { store, selectWorkspace, selectMode };
}
