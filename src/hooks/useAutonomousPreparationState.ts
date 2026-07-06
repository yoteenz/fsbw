import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED,
  syncAutonomousPreparationFromSources,
  type OrganizationAutonomousPreparationProfile,
} from '../studio-os-core/autonomous-preparation';

export function useAutonomousPreparationState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationAutonomousPreparationProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncAutonomousPreparationFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED, onUpdate);
    window.addEventListener('studio-os-predictive-organization-updated', onUpdate);
    window.addEventListener('studio-os-anticipation-engine-updated', onUpdate);
    window.addEventListener('studio-os-relationship-memory-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED, onUpdate);
      window.removeEventListener('studio-os-predictive-organization-updated', onUpdate);
      window.removeEventListener('studio-os-anticipation-engine-updated', onUpdate);
      window.removeEventListener('studio-os-relationship-memory-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
