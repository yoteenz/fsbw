import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildOrganizationalDelegationSeed } from '../studio-os-core/organizational-delegation-engine/bootstrap';
import {
  bootstrapOrganizationalDelegationStore,
  readOrganizationalDelegationStore,
  selectOrganizationalDelegationWorkspace,
} from '../studio-os-core/organizational-delegation-engine/store';
import type { OrganizationalDelegationWorkspaceId } from '../studio-os-core/organizational-delegation-engine/types';

function ensureSeeded(): void {
  bootstrapOrganizationalDelegationStore(buildOrganizationalDelegationSeed());
}

export function useOrganizationalDelegationState() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const store = useMemo(() => {
    void version;
    ensureSeeded();
    return readOrganizationalDelegationStore();
  }, [version]);

  const selectWorkspace = useCallback((id: OrganizationalDelegationWorkspaceId) => {
    selectOrganizationalDelegationWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
