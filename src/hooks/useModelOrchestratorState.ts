import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED,
  syncModelOrchestratorFromSources,
  type OrganizationModelOrchestratorProfile,
} from '../studio-os-core/model-orchestrator';

export function useModelOrchestratorState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationModelOrchestratorProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncModelOrchestratorFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED, onUpdate);
    window.addEventListener('studio-os-studio-intelligence-architecture-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_MODEL_ORCHESTRATOR_UPDATED, onUpdate);
      window.removeEventListener('studio-os-studio-intelligence-architecture-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
