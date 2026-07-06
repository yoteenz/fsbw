import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_PERMISSION_ENGINE_UPDATED,
  syncPermissionEngineFromSources,
  type OrganizationPermissionEngineProfile,
} from '../studio-os-core/permission-engine';

export function usePermissionEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPermissionEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPermissionEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_PERMISSION_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-policy-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_PERMISSION_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-policy-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
