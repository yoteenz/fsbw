import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_AUTOMATION_REGISTRY_UPDATED,
  syncAutomationRegistryFromSources,
  type OrganizationAutomationRegistryProfile,
} from '../studio-os-core/automation-registry';

export function useAutomationRegistryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationAutomationRegistryProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncAutomationRegistryFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_AUTOMATION_REGISTRY_UPDATED, onUpdate);
    window.addEventListener('studio-os-event-bus-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_AUTOMATION_REGISTRY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-event-bus-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
