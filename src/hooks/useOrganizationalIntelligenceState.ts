import {useCallback, useMemo, useState} from 'react';
import { buildOrganizationalIntelligenceSeed } from '../studio-os-core/organizational-intelligence/bootstrap';
import {
  bootstrapOrganizationalIntelligenceStore,
  readOrganizationalIntelligenceStore,
  selectOrganizationalIntelligenceWorkspace,
} from '../studio-os-core/organizational-intelligence/store';
import type { OrganizationalIntelligenceWorkspaceId } from '../studio-os-core/organizational-intelligence/types';

function ensureSeeded(): void {
  bootstrapOrganizationalIntelligenceStore(buildOrganizationalIntelligenceSeed());
}

export function useOrganizationalIntelligenceState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const store = useMemo(() => {
    void version;
    return readOrganizationalIntelligenceStore();
  }, [version]);

  const selectWorkspace = useCallback((id: OrganizationalIntelligenceWorkspaceId) => {
    selectOrganizationalIntelligenceWorkspace(id);
    setVersion((v) => v + 1);
  }, []);

  return { store, selectWorkspace };
}
