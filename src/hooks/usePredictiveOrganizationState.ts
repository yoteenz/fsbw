import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED,
  syncPredictiveOrganizationFromSources,
  type OrganizationPredictiveProfile,
} from '../studio-os-core/predictive-organization';

export function usePredictiveOrganizationState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPredictiveProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPredictiveOrganizationFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED, onUpdate);
    window.addEventListener('studio-os-relationship-memory-updated', onUpdate);
    window.addEventListener('studio-os-anticipation-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-pulse-updated', onUpdate);
    window.addEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_PREDICTIVE_ORGANIZATION_UPDATED, onUpdate);
      window.removeEventListener('studio-os-relationship-memory-updated', onUpdate);
      window.removeEventListener('studio-os-anticipation-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-pulse-updated', onUpdate);
      window.removeEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
