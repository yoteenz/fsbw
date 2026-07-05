import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildChiefGrowthOfficerSeed } from '../studio-os-core/chief-growth-officer/bootstrap';
import {
  bootstrapChiefGrowthOfficerStore,
  readChiefGrowthOfficerStore,
  selectChiefGrowthOfficerWorkspace,
} from '../studio-os-core/chief-growth-officer/store';
import type { ChiefGrowthOfficerWorkspaceId } from '../studio-os-core/chief-growth-officer/types';

function ensureSeeded(): void {
  bootstrapChiefGrowthOfficerStore(buildChiefGrowthOfficerSeed());
}

export function useChiefGrowthOfficerState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readChiefGrowthOfficerStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ChiefGrowthOfficerWorkspaceId) => {
    selectChiefGrowthOfficerWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
