import {useCallback, useMemo, useState} from 'react';
import { buildRemembranceGardenSeed } from '../studio-os-core/remembrance-garden/bootstrap';
import {
  bootstrapRemembranceGardenStore,
  readRemembranceGardenStore,
  selectRemembranceGardenWorkspace,
  setRemembranceGardenSeason,
} from '../studio-os-core/remembrance-garden/store';
import type { RemembranceGardenWorkspaceId } from '../studio-os-core/remembrance-garden/types';

function ensureSeeded(): void {
  bootstrapRemembranceGardenStore(buildRemembranceGardenSeed());
}

export function useRemembranceGardenState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readRemembranceGardenStore();
  }, [version]);

  const selectWorkspace = useCallback((id: RemembranceGardenWorkspaceId) => {
    selectRemembranceGardenWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  const setSeason = useCallback((season: string) => {
    setRemembranceGardenSeason(season);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace, setSeason };
}
