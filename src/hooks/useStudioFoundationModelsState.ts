import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED,
  syncStudioFoundationModelsFromSources,
  type OrganizationStudioFoundationModelsProfile,
} from '../studio-os-core/studio-foundation-models';

export function useStudioFoundationModelsState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationStudioFoundationModelsProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncStudioFoundationModelsFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED, onUpdate);
    window.addEventListener('studio-os-model-orchestrator-updated', onUpdate);
    window.addEventListener('studio-os-studio-intelligence-architecture-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_STUDIO_FOUNDATION_MODELS_UPDATED, onUpdate);
      window.removeEventListener('studio-os-model-orchestrator-updated', onUpdate);
      window.removeEventListener('studio-os-studio-intelligence-architecture-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
