import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_DECISION_AUDIT_UPDATED,
  syncDecisionAuditFromSources,
  type OrganizationDecisionAuditProfile,
} from '../studio-os-core/decision-audit';

export function useDecisionAuditState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationDecisionAuditProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncDecisionAuditFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_DECISION_AUDIT_UPDATED, onUpdate);
    window.addEventListener('studio-os-self-healing-engine-updated', onUpdate);
    window.addEventListener('studio-os-predictive-qa-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_DECISION_AUDIT_UPDATED, onUpdate);
      window.removeEventListener('studio-os-self-healing-engine-updated', onUpdate);
      window.removeEventListener('studio-os-predictive-qa-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
