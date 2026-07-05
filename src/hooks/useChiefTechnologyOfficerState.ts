import {useCallback, useMemo, useState} from 'react';
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
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readChiefTechnologyOfficerStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ChiefTechnologyOfficerWorkspaceId) => {
    selectChiefTechnologyOfficerWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
