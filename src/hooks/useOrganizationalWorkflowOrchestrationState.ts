import { useCallback, useState } from 'react';
import { buildOrganizationalWorkflowOrchestrationSeed } from '../studio-os-core/organizational-workflow-orchestration/bootstrap';
import {
  bootstrapOrganizationalWorkflowOrchestrationStore,
  readOrganizationalWorkflowOrchestrationStore,
  selectOrganizationalWorkflowOrchestrationWorkspace,
} from '../studio-os-core/organizational-workflow-orchestration/store';
import type { OrganizationalWorkflowOrchestrationWorkspaceId } from '../studio-os-core/organizational-workflow-orchestration/types';

if (typeof window !== 'undefined') {
  bootstrapOrganizationalWorkflowOrchestrationStore(buildOrganizationalWorkflowOrchestrationSeed());
}

export function useOrganizationalWorkflowOrchestrationState() {
  const [, bump] = useState(0);

  const refresh = useCallback(() => {
    bump((n) => n + 1);
  }, []);

  const store = (() => {
    void bump;
    return readOrganizationalWorkflowOrchestrationStore();
  })();

  const selectWorkspace = useCallback((id: OrganizationalWorkflowOrchestrationWorkspaceId) => {
    selectOrganizationalWorkflowOrchestrationWorkspace(id);
    refresh();
  }, [refresh]);

  return { store, selectWorkspace };
}
