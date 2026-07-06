import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_LEGACY_NETWORK_UPDATED,
  syncLegacyNetworkFromSources,
  type OrganizationLegacyNetworkProfile,
} from '../studio-os-core/legacy-network';

export function useLegacyNetworkState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationLegacyNetworkProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncLegacyNetworkFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_LEGACY_NETWORK_UPDATED, onUpdate);
    window.addEventListener('studio-os-organization-operating-manual-updated', onUpdate);
    window.addEventListener('studio-os-innovation-lab-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_LEGACY_NETWORK_UPDATED, onUpdate);
      window.removeEventListener('studio-os-organization-operating-manual-updated', onUpdate);
      window.removeEventListener('studio-os-innovation-lab-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
