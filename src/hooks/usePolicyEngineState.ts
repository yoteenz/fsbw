import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_POLICY_ENGINE_UPDATED,
  syncPolicyEngineFromSources,
  type OrganizationPolicyEngineProfile,
} from '../studio-os-core/policy-engine';

export function usePolicyEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPolicyEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPolicyEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_POLICY_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-prompt-registry-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_POLICY_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-prompt-registry-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
