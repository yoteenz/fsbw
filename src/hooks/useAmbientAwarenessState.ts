import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_AMBIENT_AWARENESS_UPDATED,
  syncAmbientAwarenessFromSources,
  type OrganizationAmbientAwarenessProfile,
} from '../studio-os-core/ambient-awareness';

export function useAmbientAwarenessState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationAmbientAwarenessProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncAmbientAwarenessFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_AMBIENT_AWARENESS_UPDATED, onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-pulse-updated', onUpdate);
    window.addEventListener('studio-os-executive-council-updated', onUpdate);
    window.addEventListener('studio-os-business-discovery-blueprint-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_AMBIENT_AWARENESS_UPDATED, onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-pulse-updated', onUpdate);
      window.removeEventListener('studio-os-executive-council-updated', onUpdate);
      window.removeEventListener('studio-os-business-discovery-blueprint-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
