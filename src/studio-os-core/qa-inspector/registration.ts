import { getOrganizationQaInspectorProfile } from './store';

export function canInspectorAuditRun(organizationId: string): boolean {
  const profile = getOrganizationQaInspectorProfile(organizationId);
  return profile?.inspectorActive ?? false;
}

export function hasBlockingFindings(organizationId: string): boolean {
  const profile = getOrganizationQaInspectorProfile(organizationId);
  return (profile?.criticalFindings ?? 0) > 0;
}
