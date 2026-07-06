import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  syncOrganizationPulseFromSources,
  type OrganizationPulseProfile,
} from '../studio-os-core/organization-pulse';

export function useOrganizationPulseState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPulseProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncOrganizationPulseFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-organization-pulse-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-company-health-index-updated', onUpdate);
    window.addEventListener('studio-os-executive-council-updated', onUpdate);
    window.addEventListener('studio-os-succession-mode-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-organization-pulse-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-company-health-index-updated', onUpdate);
      window.removeEventListener('studio-os-executive-council-updated', onUpdate);
      window.removeEventListener('studio-os-succession-mode-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
