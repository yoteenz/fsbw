import {useCallback, useState} from 'react';
import { buildStudioInstituteSeed } from '../studio-os-core/studio-institute/bootstrap';
import {
  bootstrapStudioInstituteStore,
  readStudioInstituteStore,
  selectStudioInstituteWorkspace,
} from '../studio-os-core/studio-institute/store';
import type { StudioInstituteWorkspaceId } from '../studio-os-core/studio-institute/types';

function ensureBootstrap(): void {
  bootstrapStudioInstituteStore(buildStudioInstituteSeed());
}

export function useStudioInstituteState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readStudioInstituteStore();
  });

  const selectWorkspace = useCallback((id: StudioInstituteWorkspaceId) => {
    selectStudioInstituteWorkspace(id);
    setStore(readStudioInstituteStore());
  }, []);

  return { store, selectWorkspace };
}
