import {useCallback, useMemo, useState} from 'react';
import { buildChiefDigitalOfficerSeed } from '../studio-os-core/chief-digital-officer/bootstrap';
import {
  bootstrapChiefDigitalOfficerStore,
  readChiefDigitalOfficerStore,
  selectChiefDigitalOfficerWorkspace,
} from '../studio-os-core/chief-digital-officer/store';
import type { ChiefDigitalOfficerWorkspaceId } from '../studio-os-core/chief-digital-officer/types';

function ensureSeeded(): void {
  bootstrapChiefDigitalOfficerStore(buildChiefDigitalOfficerSeed());
}

export function useChiefDigitalOfficerState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readChiefDigitalOfficerStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ChiefDigitalOfficerWorkspaceId) => {
    selectChiefDigitalOfficerWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
