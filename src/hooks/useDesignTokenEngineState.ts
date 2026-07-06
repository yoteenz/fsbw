import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED,
  syncDesignTokenEngineFromSources,
  type OrganizationDesignTokenEngineProfile,
} from '../studio-os-core/design-token-engine';

export function useDesignTokenEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationDesignTokenEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncDesignTokenEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-component-registry-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_DESIGN_TOKEN_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-component-registry-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
