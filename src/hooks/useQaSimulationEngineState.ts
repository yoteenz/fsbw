import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED,
  syncQaSimulationEngineFromSources,
  type OrganizationQaSimulationEngineProfile,
} from '../studio-os-core/qa-simulation-engine';

export function useQaSimulationEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationQaSimulationEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncQaSimulationEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-qa-inspector-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_QA_SIMULATION_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-qa-inspector-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
