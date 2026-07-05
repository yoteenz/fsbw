import { useCallback, useState } from 'react';
import { buildOrganizationalGovernanceSafeguardsSeed } from '../studio-os-core/organizational-governance-safeguards/bootstrap';
import {
  bootstrapOrganizationalGovernanceSafeguardsStore,
  readOrganizationalGovernanceSafeguardsStore,
  selectOrganizationalGovernanceSafeguardsWorkspace,
} from '../studio-os-core/organizational-governance-safeguards/store';
import type { OrganizationalGovernanceSafeguardsWorkspaceId } from '../studio-os-core/organizational-governance-safeguards/types';

if (typeof window !== 'undefined') {
  bootstrapOrganizationalGovernanceSafeguardsStore(buildOrganizationalGovernanceSafeguardsSeed());
}

export function useOrganizationalGovernanceSafeguardsState() {
  const [, bump] = useState(0);

  const refresh = useCallback(() => {
    bump((n) => n + 1);
  }, []);

  const store = (() => {
    void bump;
    return readOrganizationalGovernanceSafeguardsStore();
  })();

  const selectWorkspace = useCallback((id: OrganizationalGovernanceSafeguardsWorkspaceId) => {
    selectOrganizationalGovernanceSafeguardsWorkspace(id);
    refresh();
  }, [refresh]);

  return { store, selectWorkspace };
}
