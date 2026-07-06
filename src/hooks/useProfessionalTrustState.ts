import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  ensureOrganizationTrustFrameworkProfile,
  syncProfessionalTrustFromProfessionBrain,
  type OrganizationTrustFrameworkProfile,
} from '../studio-os-core/professional-trust-framework';

export function useProfessionalTrustState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationTrustFrameworkProfile | null>(null);

  const refresh = useCallback(() => {
    const next =
      syncProfessionalTrustFromProfessionBrain(workspaceId) ??
      ensureOrganizationTrustFrameworkProfile(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-professional-trust-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-professional-trust-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
