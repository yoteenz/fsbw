import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_ASSET_REGISTRY_UPDATED,
  syncAssetRegistryFromSources,
  type OrganizationAssetRegistryProfile,
} from '../studio-os-core/asset-registry';

export function useAssetRegistryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationAssetRegistryProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncAssetRegistryFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_ASSET_REGISTRY_UPDATED, onUpdate);
    window.addEventListener('studio-os-state-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_ASSET_REGISTRY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-state-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
