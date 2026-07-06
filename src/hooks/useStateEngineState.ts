import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_STATE_ENGINE_UPDATED,
  syncStateEngineFromSources,
  type OrganizationStateEngineProfile,
} from '../studio-os-core/state-engine';

export function useStateEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationStateEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncStateEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_STATE_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-workflow-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_STATE_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-workflow-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
