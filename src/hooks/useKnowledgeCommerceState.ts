import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  ensureOrganizationKnowledgeCommerceProfile,
  syncKnowledgeCommerceFromProfessionBrain,
  type OrganizationKnowledgeCommerceProfile,
} from '../studio-os-core/knowledge-commerce';

export function useKnowledgeCommerceState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationKnowledgeCommerceProfile | null>(null);

  const refresh = useCallback(() => {
    const next =
      syncKnowledgeCommerceFromProfessionBrain(workspaceId) ??
      ensureOrganizationKnowledgeCommerceProfile(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-knowledge-commerce-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-knowledge-commerce-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
