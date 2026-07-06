import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  syncKnowledgeConfidenceFromSources,
  type OrganizationKnowledgeConfidenceProfile,
} from '../studio-os-core/knowledge-confidence';

export function useKnowledgeConfidenceState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationKnowledgeConfidenceProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncKnowledgeConfidenceFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-knowledge-confidence-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-wisdom-capture-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-knowledge-confidence-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-wisdom-capture-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
