import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_CONFIDENCE_ENGINE_UPDATED,
  syncConfidenceEngineFromSources,
  type OrganizationConfidenceEngineProfile,
} from '../studio-os-core/confidence-engine';

export function useConfidenceEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationConfidenceEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncConfidenceEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_CONFIDENCE_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-decision-audit-updated', onUpdate);
    window.addEventListener('studio-os-knowledge-confidence-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_CONFIDENCE_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-decision-audit-updated', onUpdate);
      window.removeEventListener('studio-os-knowledge-confidence-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
