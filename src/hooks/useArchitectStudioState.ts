import {useCallback, useMemo, useState} from 'react';
import { buildArchitectStudioSeed } from '../studio-os-core/architect-studio/bootstrap';
import {
  bootstrapArchitectStudioStore,
  focusArchitectStudio,
  readArchitectStudioStore,
  selectArchitectStudioWorkspace,
  setSpatialNavMode,
} from '../studio-os-core/architect-studio/store';
import type { ArchitectStudioId, ArchitectStudioWorkspaceId, SpatialNavMode } from '../studio-os-core/architect-studio/types';

function ensureSeeded(): void {
  bootstrapArchitectStudioStore(buildArchitectStudioSeed());
}

export function useArchitectStudioState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readArchitectStudioStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ArchitectStudioWorkspaceId) => {
    selectArchitectStudioWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const setSpatialMode = useCallback((mode: SpatialNavMode) => {
    setSpatialNavMode(mode);
    setVersion((v) => v + 1);
  }, []);

  const focusStudio = useCallback((studioId: ArchitectStudioId | null) => {
    focusArchitectStudio(studioId);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace, setSpatialMode, focusStudio };
}
