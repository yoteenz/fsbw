import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_QA_HEADQUARTERS_UPDATED,
  syncQaHeadquartersFromSources,
  type OrganizationQaHeadquartersProfile,
} from '../studio-os-core/qa-headquarters';

export function useQaHeadquartersState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationQaHeadquartersProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncQaHeadquartersFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_QA_HEADQUARTERS_UPDATED, onUpdate);
    window.addEventListener('studio-os-experience-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_QA_HEADQUARTERS_UPDATED, onUpdate);
      window.removeEventListener('studio-os-experience-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
