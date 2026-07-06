import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED,
  syncRelationshipMemoryFromSources,
  type OrganizationRelationshipMemoryProfile,
} from '../studio-os-core/relationship-memory';

export function useRelationshipMemoryState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationRelationshipMemoryProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncRelationshipMemoryFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED, onUpdate);
    window.addEventListener('studio-os-cross-org-intelligence-updated', onUpdate);
    window.addEventListener('studio-os-presence-engine-updated', onUpdate);
    window.addEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
    window.addEventListener('studio-os-ambient-awareness-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED, onUpdate);
      window.removeEventListener('studio-os-cross-org-intelligence-updated', onUpdate);
      window.removeEventListener('studio-os-presence-engine-updated', onUpdate);
      window.removeEventListener('studio-os-founder-cognitive-load-updated', onUpdate);
      window.removeEventListener('studio-os-ambient-awareness-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
