import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_EXPERIENCE_ENGINE_UPDATED,
  syncExperienceEngineFromSources,
  type OrganizationExperienceEngineProfile,
} from '../studio-os-core/experience-engine';

export function useExperienceEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationExperienceEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncExperienceEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_EXPERIENCE_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-asset-registry-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_EXPERIENCE_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-asset-registry-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
