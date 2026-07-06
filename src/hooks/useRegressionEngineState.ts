import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_REGRESSION_ENGINE_UPDATED,
  syncRegressionEngineFromSources,
  type OrganizationRegressionEngineProfile,
} from '../studio-os-core/regression-engine';

export function useRegressionEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationRegressionEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncRegressionEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_REGRESSION_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-performance-monitor-updated', onUpdate);
    window.addEventListener('studio-os-accessibility-auditor-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_REGRESSION_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-performance-monitor-updated', onUpdate);
      window.removeEventListener('studio-os-accessibility-auditor-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
