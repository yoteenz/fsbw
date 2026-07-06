import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_EXPERIENCE_QA_UPDATED,
  syncExperienceQaFromSources,
  type OrganizationExperienceQaProfile,
} from '../studio-os-core/experience-qa';

export function useExperienceQaState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationExperienceQaProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncExperienceQaFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_EXPERIENCE_QA_UPDATED, onUpdate);
    window.addEventListener('studio-os-prompt-qa-updated', onUpdate);
    window.addEventListener('studio-os-experience-engine-updated', onUpdate);
    window.addEventListener('studio-os-interaction-engine-updated', onUpdate);
    window.addEventListener('studio-os-design-compliance-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_EXPERIENCE_QA_UPDATED, onUpdate);
      window.removeEventListener('studio-os-prompt-qa-updated', onUpdate);
      window.removeEventListener('studio-os-experience-engine-updated', onUpdate);
      window.removeEventListener('studio-os-interaction-engine-updated', onUpdate);
      window.removeEventListener('studio-os-design-compliance-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
