import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED,
  syncDesignComplianceEngineFromSources,
  type OrganizationDesignComplianceEngineProfile,
} from '../studio-os-core/design-compliance-engine';

export function useDesignComplianceEngineState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationDesignComplianceEngineProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncDesignComplianceEngineFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED, onUpdate);
    window.addEventListener('studio-os-organizational-guardian-updated', onUpdate);
    window.addEventListener('studio-os-design-token-engine-updated', onUpdate);
    window.addEventListener('studio-os-interaction-engine-updated', onUpdate);
    window.addEventListener('studio-os-qa-inspector-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_DESIGN_COMPLIANCE_ENGINE_UPDATED, onUpdate);
      window.removeEventListener('studio-os-organizational-guardian-updated', onUpdate);
      window.removeEventListener('studio-os-design-token-engine-updated', onUpdate);
      window.removeEventListener('studio-os-interaction-engine-updated', onUpdate);
      window.removeEventListener('studio-os-qa-inspector-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
