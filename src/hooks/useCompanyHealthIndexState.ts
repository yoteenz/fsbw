import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  ensureOrganizationHealthIndexProfile,
  syncCompanyHealthIndexFromSources,
  type OrganizationHealthIndexProfile,
} from '../studio-os-core/company-health-index';

export function useCompanyHealthIndexState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationHealthIndexProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncCompanyHealthIndexFromSources(workspaceId) ?? ensureOrganizationHealthIndexProfile(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-company-health-index-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-memory-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-genome-updated', onUpdate);
    window.addEventListener('studio-os-blueprint-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-company-health-index-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-memory-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-genome-updated', onUpdate);
      window.removeEventListener('studio-os-blueprint-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
