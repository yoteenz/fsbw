import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_RELEASE_READINESS_UPDATED,
  syncReleaseReadinessFromSources,
  type OrganizationReleaseReadinessProfile,
} from '../studio-os-core/release-readiness';

export function useReleaseReadinessState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationReleaseReadinessProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncReleaseReadinessFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_RELEASE_READINESS_UPDATED, onUpdate);
    window.addEventListener('studio-os-regression-engine-updated', onUpdate);
    window.addEventListener('studio-os-performance-monitor-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_RELEASE_READINESS_UPDATED, onUpdate);
      window.removeEventListener('studio-os-regression-engine-updated', onUpdate);
      window.removeEventListener('studio-os-performance-monitor-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
