import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED,
  syncStudioIntelligenceArchitectureFromSources,
  type OrganizationStudioIntelligenceArchitectureProfile,
} from '../studio-os-core/studio-intelligence-architecture';

export function useStudioIntelligenceArchitectureState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationStudioIntelligenceArchitectureProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncStudioIntelligenceArchitectureFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED, onUpdate);
    window.addEventListener('studio-os-legacy-network-updated', onUpdate);
    window.addEventListener('studio-os-organizational-consciousness-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_STUDIO_INTELLIGENCE_ARCHITECTURE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-legacy-network-updated', onUpdate);
      window.removeEventListener('studio-os-organizational-consciousness-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
