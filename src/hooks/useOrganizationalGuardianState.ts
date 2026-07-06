import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED,
  syncOrganizationalGuardianFromSources,
  type OrganizationGuardianProfile,
} from '../studio-os-core/organizational-guardian';

export function useOrganizationalGuardianState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationGuardianProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncOrganizationalGuardianFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED, onUpdate);
    window.addEventListener('studio-os-confidence-engine-updated', onUpdate);
    window.addEventListener('studio-os-executive-trust-dashboard-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_ORGANIZATIONAL_GUARDIAN_UPDATED, onUpdate);
      window.removeEventListener('studio-os-confidence-engine-updated', onUpdate);
      window.removeEventListener('studio-os-executive-trust-dashboard-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
