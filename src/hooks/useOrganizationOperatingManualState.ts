import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_ORGANIZATION_OPERATING_MANUAL_UPDATED,
  syncOrganizationOperatingManualFromSources,
  type OrganizationOperatingManualProfile,
} from '../studio-os-core/organization-operating-manual';

export function useOrganizationOperatingManualState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationOperatingManualProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(() => {
    const next = syncOrganizationOperatingManualFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_ORGANIZATION_OPERATING_MANUAL_UPDATED, onUpdate);
    window.addEventListener('studio-os-innovation-lab-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_ORGANIZATION_OPERATING_MANUAL_UPDATED, onUpdate);
      window.removeEventListener('studio-os-innovation-lab-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh, searchQuery, setSearchQuery };
}
