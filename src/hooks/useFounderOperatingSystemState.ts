import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED,
  syncFounderOperatingSystemFromSources,
  type OrganizationFounderOperatingSystemProfile,
} from '../studio-os-core/founder-operating-system';

export function useFounderOperatingSystemState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationFounderOperatingSystemProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncFounderOperatingSystemFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED, onUpdate);
    window.addEventListener('studio-os-world-knowledge-engine-updated', onUpdate);
    window.addEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_FOUNDER_OPERATING_SYSTEM_UPDATED, onUpdate);
      window.removeEventListener('studio-os-world-knowledge-engine-updated', onUpdate);
      window.removeEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
