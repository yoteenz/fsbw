import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  syncShadowModeFromSources,
  type OrganizationShadowModeProfile,
} from '../studio-os-core/shadow-mode';

export function useShadowModeState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationShadowModeProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncShadowModeFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-shadow-mode-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-wisdom-capture-updated', onUpdate);
    window.addEventListener('studio-os-executive-council-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-shadow-mode-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-wisdom-capture-updated', onUpdate);
      window.removeEventListener('studio-os-executive-council-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
