import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_TIME_MACHINE_UPDATED,
  syncTimeMachineFromSources,
  type OrganizationTimeMachineProfile,
} from '../studio-os-core/time-machine';

export function useTimeMachineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationTimeMachineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncTimeMachineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_TIME_MACHINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-executive-trust-dashboard-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_TIME_MACHINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-executive-trust-dashboard-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
