import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_COMPONENT_REGISTRY_UPDATED,
  syncComponentRegistryFromSources,
  type OrganizationComponentRegistryProfile,
} from '../studio-os-core/component-registry';

export function useComponentRegistryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationComponentRegistryProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncComponentRegistryFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_COMPONENT_REGISTRY_UPDATED, onUpdate);
    window.addEventListener('studio-os-system-registry-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_COMPONENT_REGISTRY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-system-registry-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
