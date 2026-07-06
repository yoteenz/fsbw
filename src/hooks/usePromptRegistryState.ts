import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_PROMPT_REGISTRY_UPDATED,
  syncPromptRegistryFromSources,
  type OrganizationPromptRegistryProfile,
} from '../studio-os-core/prompt-registry';

export function usePromptRegistryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPromptRegistryProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPromptRegistryFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_PROMPT_REGISTRY_UPDATED, onUpdate);
    window.addEventListener('studio-os-automation-registry-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_PROMPT_REGISTRY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-automation-registry-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
