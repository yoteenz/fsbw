import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED,
  syncAccessibilityAuditorFromSources,
  type OrganizationAccessibilityAuditorProfile,
} from '../studio-os-core/accessibility-auditor';

export function useAccessibilityAuditorState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationAccessibilityAuditorProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncAccessibilityAuditorFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED, onUpdate);
    window.addEventListener('studio-os-visual-diff-engine-updated', onUpdate);
    window.addEventListener('studio-os-interaction-engine-updated', onUpdate);
    window.addEventListener('studio-os-experience-qa-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_ACCESSIBILITY_AUDITOR_UPDATED, onUpdate);
      window.removeEventListener('studio-os-visual-diff-engine-updated', onUpdate);
      window.removeEventListener('studio-os-interaction-engine-updated', onUpdate);
      window.removeEventListener('studio-os-experience-qa-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
