import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_WORKSPACE_RUNTIME_UPDATED,
  syncWorkspaceRuntimeFromSources,
  type OrganizationWorkspaceRuntimeProfile,
} from '../studio-os-core/workspace-runtime';

export function useWorkspaceRuntimeState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationWorkspaceRuntimeProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncWorkspaceRuntimeFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_WORKSPACE_RUNTIME_UPDATED, onUpdate);
    window.addEventListener('studio-os-permission-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_WORKSPACE_RUNTIME_UPDATED, onUpdate);
      window.removeEventListener('studio-os-permission-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
