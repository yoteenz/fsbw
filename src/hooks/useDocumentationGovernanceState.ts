import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED,
  syncDocumentationGovernanceFromSources,
  type OrganizationDocumentationGovernanceProfile,
} from '../studio-os-core/documentation-governance';

export function useDocumentationGovernanceState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationDocumentationGovernanceProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncDocumentationGovernanceFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED, onUpdate);
    window.addEventListener('studio-os-documentation-registry-updated', onUpdate);
    window.addEventListener('studio-os-documentation-sync-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_DOCUMENTATION_GOVERNANCE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-documentation-registry-updated', onUpdate);
      window.removeEventListener('studio-os-documentation-sync-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
