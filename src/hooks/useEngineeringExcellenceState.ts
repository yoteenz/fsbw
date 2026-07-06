import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED,
  syncEngineeringExcellenceFromSources,
  type OrganizationEngineeringExcellenceProfile,
} from '../studio-os-core/engineering-excellence-dashboard';

export function useEngineeringExcellenceState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationEngineeringExcellenceProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncEngineeringExcellenceFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED, onUpdate);
    window.addEventListener('studio-os-release-readiness-updated', onUpdate);
    window.addEventListener('studio-os-regression-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-release-readiness-updated', onUpdate);
      window.removeEventListener('studio-os-regression-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
