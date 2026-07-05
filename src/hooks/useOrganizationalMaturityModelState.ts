import { useCallback, useEffect, useState } from 'react';
import { buildOrganizationalMaturityModelSeed } from '../studio-os-core/organizational-maturity-model/bootstrap';
import {
  bootstrapOrganizationalMaturityModelStore,
  readOrganizationalMaturityModelStore,
  selectOrganizationalMaturityModelWorkspace,
} from '../studio-os-core/organizational-maturity-model/store';
import type { OrganizationalMaturityModelWorkspaceId } from '../studio-os-core/organizational-maturity-model/types';

function ensureBootstrap(): void {
  bootstrapOrganizationalMaturityModelStore(buildOrganizationalMaturityModelSeed());
}

export function useOrganizationalMaturityModelState() {
  const [store, setStore] = useState(() => {
    ensureBootstrap();
    return readOrganizationalMaturityModelStore();
  });

  useEffect(() => {
    ensureBootstrap();
    setStore(readOrganizationalMaturityModelStore());
  }, []);

  const selectWorkspace = useCallback((id: OrganizationalMaturityModelWorkspaceId) => {
    selectOrganizationalMaturityModelWorkspace(id);
    setStore(readOrganizationalMaturityModelStore());
  }, []);

  return { store, selectWorkspace };
}
