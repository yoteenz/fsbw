import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED,
  syncWorldKnowledgeEngineFromSources,
  type OrganizationWorldKnowledgeProfile,
} from '../studio-os-core/world-knowledge-engine';

export function useWorldKnowledgeEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationWorldKnowledgeProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncWorldKnowledgeEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-executive-timeline-history-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_WORLD_KNOWLEDGE_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-executive-timeline-history-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
