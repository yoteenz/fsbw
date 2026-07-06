import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_PREDICTIVE_QA_UPDATED,
  syncPredictiveQaFromSources,
  type OrganizationPredictiveQaProfile,
} from '../studio-os-core/predictive-qa';

export function usePredictiveQaState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPredictiveQaProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPredictiveQaFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_PREDICTIVE_QA_UPDATED, onUpdate);
    window.addEventListener('studio-os-time-machine-updated', onUpdate);
    window.addEventListener('studio-os-executive-trust-dashboard-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_PREDICTIVE_QA_UPDATED, onUpdate);
      window.removeEventListener('studio-os-time-machine-updated', onUpdate);
      window.removeEventListener('studio-os-executive-trust-dashboard-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
