import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_ANTICIPATION_ENGINE_UPDATED,
  syncAnticipationEngineFromSources,
  type OrganizationAnticipationProfile,
} from '../studio-os-core/anticipation-engine';

export function useAnticipationEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationAnticipationProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncAnticipationEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_ANTICIPATION_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-ambient-awareness-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-pulse-updated', onUpdate);
    window.addEventListener('studio-os-knowledge-confidence-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_ANTICIPATION_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-ambient-awareness-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-pulse-updated', onUpdate);
      window.removeEventListener('studio-os-knowledge-confidence-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
