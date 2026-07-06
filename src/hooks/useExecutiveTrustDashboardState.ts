import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED,
  syncExecutiveTrustDashboardFromSources,
  type OrganizationExecutiveTrustDashboardProfile,
} from '../studio-os-core/executive-trust-dashboard';

export function useExecutiveTrustDashboardState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationExecutiveTrustDashboardProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncExecutiveTrustDashboardFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED, onUpdate);
    window.addEventListener('studio-os-ai-red-team-updated', onUpdate);
    window.addEventListener('studio-os-qa-headquarters-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED, onUpdate);
      window.removeEventListener('studio-os-ai-red-team-updated', onUpdate);
      window.removeEventListener('studio-os-qa-headquarters-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
