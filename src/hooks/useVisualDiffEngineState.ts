import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED,
  syncVisualDiffEngineFromSources,
  type OrganizationVisualDiffEngineProfile,
} from '../studio-os-core/visual-diff-engine';

export function useVisualDiffEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationVisualDiffEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncVisualDiffEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-experience-qa-updated', onUpdate);
    window.addEventListener('studio-os-design-compliance-engine-updated', onUpdate);
    window.addEventListener('studio-os-design-token-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_VISUAL_DIFF_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-experience-qa-updated', onUpdate);
      window.removeEventListener('studio-os-design-compliance-engine-updated', onUpdate);
      window.removeEventListener('studio-os-design-token-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
