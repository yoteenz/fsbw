import { useCallback, useEffect, useState } from 'react';
import { buildExecutiveApprenticeshipSeed } from '../studio-os-core/executive-apprenticeship-founder-calibration/bootstrap';
import {
  bootstrapExecutiveApprenticeshipStore,
  readExecutiveApprenticeshipStore,
  selectExecutiveApprenticeshipWorkspace,
} from '../studio-os-core/executive-apprenticeship-founder-calibration/store';
import type { ExecutiveApprenticeshipWorkspaceId } from '../studio-os-core/executive-apprenticeship-founder-calibration/types';

function ensureBootstrap(): void {
  bootstrapExecutiveApprenticeshipStore(buildExecutiveApprenticeshipSeed());
}

export function useExecutiveApprenticeshipState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readExecutiveApprenticeshipStore();
  });

  useEffect(() => {
    ensureBootstrap();
    setStore(readExecutiveApprenticeshipStore());
  }, []);

  const selectWorkspace = useCallback((id: ExecutiveApprenticeshipWorkspaceId) => {
    selectExecutiveApprenticeshipWorkspace(id);
    setStore(readExecutiveApprenticeshipStore());
  }, []);

  return { store, selectWorkspace };
}
