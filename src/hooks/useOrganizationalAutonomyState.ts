import {useCallback, useMemo, useState} from 'react';
import { buildOrganizationalAutonomySeed } from '../studio-os-core/organizational-autonomy-framework/bootstrap';
import {
  bootstrapOrganizationalAutonomyStore,
  readOrganizationalAutonomyStore,
  selectOrganizationalAutonomyWorkspace,
} from '../studio-os-core/organizational-autonomy-framework/store';
import type { OrganizationalAutonomyWorkspaceId } from '../studio-os-core/organizational-autonomy-framework/types';

function ensureSeeded(): void {
  bootstrapOrganizationalAutonomyStore(buildOrganizationalAutonomySeed());
}

export function useOrganizationalAutonomyState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readOrganizationalAutonomyStore();
  }, [version]);

  const selectWorkspace = useCallback((id: OrganizationalAutonomyWorkspaceId) => {
    selectOrganizationalAutonomyWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
