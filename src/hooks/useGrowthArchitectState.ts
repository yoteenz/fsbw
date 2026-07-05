import {useCallback, useMemo, useState} from 'react';
import { buildGrowthArchitectSeed } from '../studio-os-core/growth-architect/bootstrap';
import {
  bootstrapGrowthArchitectStore,
  readGrowthArchitectStore,
  selectGrowthArchitectWorkspace,
} from '../studio-os-core/growth-architect/store';
import type { GrowthArchitectWorkspaceId } from '../studio-os-core/growth-architect/types';

function ensureSeeded(): void {
  bootstrapGrowthArchitectStore(buildGrowthArchitectSeed());
}

export function useGrowthArchitectState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readGrowthArchitectStore();
  }, [version]);

  const selectWorkspace = useCallback((id: GrowthArchitectWorkspaceId) => {
    selectGrowthArchitectWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
