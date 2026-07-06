import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_PRESENCE_ENGINE_UPDATED,
  syncPresenceEngineFromSources,
  type OrganizationPresenceProfile,
} from '../studio-os-core/presence-engine';

export function usePresenceEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPresenceProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPresenceEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_PRESENCE_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
    window.addEventListener('studio-os-ambient-awareness-updated', onUpdate);
    window.addEventListener('studio-os-organization-pulse-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_PRESENCE_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
      window.removeEventListener('studio-os-ambient-awareness-updated', onUpdate);
      window.removeEventListener('studio-os-organization-pulse-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
