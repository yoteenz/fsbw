import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_WORKFLOW_ENGINE_UPDATED,
  syncWorkflowEngineFromSources,
  type OrganizationWorkflowEngineProfile,
} from '../studio-os-core/workflow-engine';

export function useWorkflowEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationWorkflowEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncWorkflowEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_WORKFLOW_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-plugin-sdk-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_WORKFLOW_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-plugin-sdk-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
