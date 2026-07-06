import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED,
  syncCrossOrgIntelligenceFromSources,
  type OrganizationCrossOrgIntelligenceProfile,
} from '../studio-os-core/cross-organization-intelligence';

export function useCrossOrgIntelligenceState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationCrossOrgIntelligenceProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncCrossOrgIntelligenceFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED, onUpdate);
    window.addEventListener('studio-os-presence-engine-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_CROSS_ORG_INTELLIGENCE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-presence-engine-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
