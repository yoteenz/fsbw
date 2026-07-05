import {useCallback, useMemo, useState} from 'react';
import { buildChiefExperienceOfficerSeed } from '../studio-os-core/chief-experience-officer/bootstrap';
import {
  bootstrapChiefExperienceOfficerStore,
  readChiefExperienceOfficerStore,
  selectChiefExperienceOfficerWorkspace,
} from '../studio-os-core/chief-experience-officer/store';
import type { ChiefExperienceOfficerWorkspaceId } from '../studio-os-core/chief-experience-officer/types';

function ensureSeeded(): void {
  bootstrapChiefExperienceOfficerStore(buildChiefExperienceOfficerSeed());
}

export function useChiefExperienceOfficerState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readChiefExperienceOfficerStore();
  }, [version]);

  const selectWorkspace = useCallback((id: ChiefExperienceOfficerWorkspaceId) => {
    selectChiefExperienceOfficerWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
