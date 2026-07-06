import { getOrganizationDecisionAuditProfile } from './store';

export function canAuditDecisions(organizationId: string): boolean {
  return (getOrganizationDecisionAuditProfile(organizationId)?.totalDecisions ?? 0) > 0;
}

export function hasExplainableDecisions(organizationId: string): boolean {
  const profile = getOrganizationDecisionAuditProfile(organizationId);
  if (!profile) return false;
  return profile.explainableDecisions === profile.totalDecisions;
}
