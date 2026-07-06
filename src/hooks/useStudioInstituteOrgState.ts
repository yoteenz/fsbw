import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  ensureOrganizationStudioInstituteProfile,
  listAudienceAdaptations,
  syncStudioInstituteFromProfessionBrain,
  type OrganizationStudioInstituteProfile,
} from '../studio-os-core/studio-institute';

export function useStudioInstituteOrgState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationStudioInstituteProfile | null>(null);

  const refresh = useCallback(() => {
    const next =
      syncStudioInstituteFromProfessionBrain(workspaceId) ??
      ensureOrganizationStudioInstituteProfile(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-studio-institute-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-studio-institute-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  const audienceStats = useMemo(
    () => (profile ? listAudienceAdaptations(profile.artifacts) : []),
    [profile]
  );

  return { profile, audienceStats, refresh };
}
