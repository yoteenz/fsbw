import { useCallback, useEffect, useState } from 'react';
import { buildOrganizationalApprenticeshipSeed } from '../studio-os-core/organizational-apprenticeship/bootstrap';
import {
  bootstrapOrganizationalApprenticeshipStore,
  readOrganizationalApprenticeshipStore,
  selectOrganizationalApprenticeshipWorkspace,
} from '../studio-os-core/organizational-apprenticeship/store';
import type { OrganizationalApprenticeshipWorkspaceId } from '../studio-os-core/organizational-apprenticeship/types';

function ensureBootstrap(): void {
  bootstrapOrganizationalApprenticeshipStore(buildOrganizationalApprenticeshipSeed());
}

export function useOrganizationalApprenticeshipState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readOrganizationalApprenticeshipStore();
  });

  useEffect(() => {
    ensureBootstrap();
    setStore(readOrganizationalApprenticeshipStore());
  }, []);

  const selectWorkspace = useCallback((id: OrganizationalApprenticeshipWorkspaceId) => {
    selectOrganizationalApprenticeshipWorkspace(id);
    setStore(readOrganizationalApprenticeshipStore());
  }, []);

  return { store, selectWorkspace };
}
