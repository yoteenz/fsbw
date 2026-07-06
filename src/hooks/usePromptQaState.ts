import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_PROMPT_QA_UPDATED,
  syncPromptQaFromSources,
  type OrganizationPromptQaProfile,
} from '../studio-os-core/prompt-qa';

export function usePromptQaState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPromptQaProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPromptQaFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_PROMPT_QA_UPDATED, onUpdate);
    window.addEventListener('studio-os-design-compliance-engine-updated', onUpdate);
    window.addEventListener('studio-os-prompt-registry-updated', onUpdate);
    window.addEventListener('studio-os-confidence-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_PROMPT_QA_UPDATED, onUpdate);
      window.removeEventListener('studio-os-design-compliance-engine-updated', onUpdate);
      window.removeEventListener('studio-os-prompt-registry-updated', onUpdate);
      window.removeEventListener('studio-os-confidence-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
