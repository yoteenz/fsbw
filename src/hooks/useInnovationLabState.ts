import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_INNOVATION_LAB_UPDATED,
  syncInnovationLabFromSources,
  type OrganizationInnovationLabProfile,
} from '../studio-os-core/innovation-lab';

export function useInnovationLabState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationInnovationLabProfile | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const next = syncInnovationLabFromSources(workspaceId);
    setProfile(next);
    if (!selectedIdeaId && next.ideas[0]) {
      setSelectedIdeaId(next.ideas[0].id);
    }
  }, [workspaceId, selectedIdeaId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_INNOVATION_LAB_UPDATED, onUpdate);
    window.addEventListener('studio-os-founder-operating-system-updated', onUpdate);
    window.addEventListener('studio-os-world-knowledge-engine-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_INNOVATION_LAB_UPDATED, onUpdate);
      window.removeEventListener('studio-os-founder-operating-system-updated', onUpdate);
      window.removeEventListener('studio-os-world-knowledge-engine-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  const selectedIdea = profile?.ideas.find((i) => i.id === selectedIdeaId) ?? profile?.ideas[0] ?? null;

  return { profile, refresh, selectedIdea, selectedIdeaId, setSelectedIdeaId };
}
