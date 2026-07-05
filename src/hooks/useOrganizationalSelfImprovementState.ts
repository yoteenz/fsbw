import { useCallback, useState } from 'react';
import { buildOrganizationalSelfImprovementSeed } from '../studio-os-core/organizational-self-improvement/bootstrap';
import {
  bootstrapOrganizationalSelfImprovementStore,
  readOrganizationalSelfImprovementStore,
  selectOrganizationalSelfImprovementWorkspace,
} from '../studio-os-core/organizational-self-improvement/store';
import type { OrganizationalSelfImprovementWorkspaceId } from '../studio-os-core/organizational-self-improvement/types';

if (typeof window !== 'undefined') {
  bootstrapOrganizationalSelfImprovementStore(buildOrganizationalSelfImprovementSeed());
}

export function useOrganizationalSelfImprovementState() {
  const [, bump] = useState(0);

  const refresh = useCallback(() => {
    bump((n) => n + 1);
  }, []);

  const store = (() => {
    void bump;
    return readOrganizationalSelfImprovementStore();
  })();

  const selectWorkspace = useCallback((id: OrganizationalSelfImprovementWorkspaceId) => {
    selectOrganizationalSelfImprovementWorkspace(id);
    refresh();
  }, [refresh]);

  return { store, selectWorkspace };
}
