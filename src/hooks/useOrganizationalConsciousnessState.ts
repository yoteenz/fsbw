import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED,
  syncOrganizationalConsciousnessFromSources,
  type OrganizationConsciousnessProfile,
} from '../studio-os-core/organizational-consciousness';

export function useOrganizationalConsciousnessState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationConsciousnessProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncOrganizationalConsciousnessFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED, onUpdate);
    window.addEventListener('studio-os-autonomous-preparation-updated', onUpdate);
    window.addEventListener('studio-os-predictive-organization-updated', onUpdate);
    window.addEventListener('studio-os-relationship-memory-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED, onUpdate);
      window.removeEventListener('studio-os-autonomous-preparation-updated', onUpdate);
      window.removeEventListener('studio-os-predictive-organization-updated', onUpdate);
      window.removeEventListener('studio-os-relationship-memory-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
