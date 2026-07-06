import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_SYSTEM_REGISTRY_UPDATED,
  syncSystemRegistryFromSources,
  type OrganizationSystemRegistryProfile,
} from '../studio-os-core/system-registry';

export function useSystemRegistryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationSystemRegistryProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncSystemRegistryFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_SYSTEM_REGISTRY_UPDATED, onUpdate);
    window.addEventListener('studio-os-documentation-governance-updated', onUpdate);
    window.addEventListener('studio-os-documentation-registry-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_SYSTEM_REGISTRY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-documentation-governance-updated', onUpdate);
      window.removeEventListener('studio-os-documentation-registry-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
