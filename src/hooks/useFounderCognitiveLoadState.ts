import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED,
  syncFounderCognitiveLoadFromSources,
  type OrganizationFounderCognitiveLoadProfile,
} from '../studio-os-core/founder-cognitive-load';

export function useFounderCognitiveLoadState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationFounderCognitiveLoadProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncFounderCognitiveLoadFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED, onUpdate);
    window.addEventListener('studio-os-anticipation-engine-updated', onUpdate);
    window.addEventListener('studio-os-ambient-awareness-updated', onUpdate);
    window.addEventListener('studio-os-organization-pulse-updated', onUpdate);
    window.addEventListener('studio-os-executive-council-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_FOUNDER_COGNITIVE_LOAD_UPDATED, onUpdate);
      window.removeEventListener('studio-os-anticipation-engine-updated', onUpdate);
      window.removeEventListener('studio-os-ambient-awareness-updated', onUpdate);
      window.removeEventListener('studio-os-organization-pulse-updated', onUpdate);
      window.removeEventListener('studio-os-executive-council-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
