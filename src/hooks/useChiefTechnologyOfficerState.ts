import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildChiefTechnologyOfficerSeed } from '../studio-os-core/chief-technology-officer/bootstrap';
import {
  bootstrapChiefTechnologyOfficerStore,
  readChiefTechnologyOfficerStore,
  selectChiefTechnologyOfficerWorkspace,
} from '../studio-os-core/chief-technology-officer/store';
import type { ChiefTechnologyOfficerWorkspaceId } from '../studio-os-core/chief-technology-officer/types';

function ensureSeeded(): void {
  bootstrapChiefTechnologyOfficerStore(buildChiefTechnologyOfficerSeed());
}

export function useChiefTechnologyOfficerState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readChiefTechnologyOfficerStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ChiefTechnologyOfficerWorkspaceId) => {
    selectChiefTechnologyOfficerWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
