import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_SELF_HEALING_ENGINE_UPDATED,
  syncSelfHealingEngineFromSources,
  type OrganizationSelfHealingEngineProfile,
} from '../studio-os-core/self-healing-engine';

export function useSelfHealingEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationSelfHealingEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncSelfHealingEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_SELF_HEALING_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-predictive-qa-updated', onUpdate);
    window.addEventListener('studio-os-time-machine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_SELF_HEALING_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-predictive-qa-updated', onUpdate);
      window.removeEventListener('studio-os-time-machine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
