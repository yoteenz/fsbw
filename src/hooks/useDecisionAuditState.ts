import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_DECISION_AUDIT_UPDATED,
  getOrganizationDecisionAuditProfile,
  syncDecisionAuditFromSources,
  type OrganizationDecisionAuditProfile,
} from '../studio-os-core/decision-audit';

export function useDecisionAuditState() {
  return useStudioProfileState<OrganizationDecisionAuditProfile>({
    getProfile: getOrganizationDecisionAuditProfile,
    syncProfile: syncDecisionAuditFromSources,
    updatedEvent: STUDIO_OS_DECISION_AUDIT_UPDATED,
  });
}
