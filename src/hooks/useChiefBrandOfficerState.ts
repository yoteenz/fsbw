import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildChiefBrandOfficerSeed } from '../studio-os-core/chief-brand-officer/bootstrap';
import {
  bootstrapChiefBrandOfficerStore,
  readChiefBrandOfficerStore,
  selectChiefBrandOfficerWorkspace,
} from '../studio-os-core/chief-brand-officer/store';
import type { ChiefBrandOfficerWorkspaceId } from '../studio-os-core/chief-brand-officer/types';

function ensureSeeded(): void {
  bootstrapChiefBrandOfficerStore(buildChiefBrandOfficerSeed());
}

export function useChiefBrandOfficerState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readChiefBrandOfficerStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ChiefBrandOfficerWorkspaceId) => {
    selectChiefBrandOfficerWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
