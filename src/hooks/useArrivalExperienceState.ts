import { useCallback, useEffect, useState } from 'react';
import { buildArrivalExperienceSeed } from '../studio-os-core/arrival-experience/bootstrap';
import {
  bootstrapArrivalExperienceStore,
  readArrivalExperienceStore,
  selectArrivalExperienceWorkspace,
} from '../studio-os-core/arrival-experience/store';
import type { ArrivalExperienceWorkspaceId } from '../studio-os-core/arrival-experience/types';

function ensureBootstrap(): void {
  bootstrapArrivalExperienceStore(buildArrivalExperienceSeed());
}

export function useArrivalExperienceState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readArrivalExperienceStore();
  });

  useEffect(() => {
    ensureBootstrap();
    setStore(readArrivalExperienceStore());
  }, []);

  const selectWorkspace = useCallback((id: ArrivalExperienceWorkspaceId) => {
    selectArrivalExperienceWorkspace(id);
    setStore(readArrivalExperienceStore());
  }, []);

  return { store, selectWorkspace };
}
