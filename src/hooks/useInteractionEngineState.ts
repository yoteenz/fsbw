import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_INTERACTION_ENGINE_UPDATED,
  syncInteractionEngineFromSources,
  type OrganizationInteractionEngineProfile,
} from '../studio-os-core/interaction-engine';

export function useInteractionEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationInteractionEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncInteractionEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_INTERACTION_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-design-token-engine-updated', onUpdate);
    window.addEventListener('studio-os-component-registry-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_INTERACTION_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-design-token-engine-updated', onUpdate);
      window.removeEventListener('studio-os-component-registry-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
