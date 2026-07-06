import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_QA_INSPECTOR_UPDATED,
  syncQaInspectorFromSources,
  type OrganizationQaInspectorProfile,
} from '../studio-os-core/qa-inspector';

export function useQaInspectorState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationQaInspectorProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncQaInspectorFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_QA_INSPECTOR_UPDATED, onUpdate);
    window.addEventListener('studio-os-qa-headquarters-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_QA_INSPECTOR_UPDATED, onUpdate);
      window.removeEventListener('studio-os-qa-headquarters-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
