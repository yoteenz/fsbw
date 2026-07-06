import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_AI_RED_TEAM_UPDATED,
  syncAiRedTeamFromSources,
  type OrganizationAiRedTeamProfile,
} from '../studio-os-core/ai-red-team';

export function useAiRedTeamState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationAiRedTeamProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncAiRedTeamFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_AI_RED_TEAM_UPDATED, onUpdate);
    window.addEventListener('studio-os-qa-simulation-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_AI_RED_TEAM_UPDATED, onUpdate);
      window.removeEventListener('studio-os-qa-simulation-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
