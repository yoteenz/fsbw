import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED,
  syncDocumentationRegistryFromSources,
  type OrganizationDocumentationRegistryProfile,
} from '../studio-os-core/documentation-registry';

export function useDocumentationRegistryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationDocumentationRegistryProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncDocumentationRegistryFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED, onUpdate);
    window.addEventListener('studio-os-documentation-sync-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_DOCUMENTATION_REGISTRY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-documentation-sync-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
