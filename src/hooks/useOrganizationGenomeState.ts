import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  ensureOrganizationGenomeProfile,
  syncOrganizationGenomeFromSources,
  type OrganizationGenomeProfile,
} from '../studio-os-core/organization-genome';

export function useOrganizationGenomeState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationGenomeProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncOrganizationGenomeFromSources(workspaceId) ?? ensureOrganizationGenomeProfile(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-organization-genome-updated', onUpdate);
    window.addEventListener('studio-os-blueprint-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-organization-genome-updated', onUpdate);
      window.removeEventListener('studio-os-blueprint-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
