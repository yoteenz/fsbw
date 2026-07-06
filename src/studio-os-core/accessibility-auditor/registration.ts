import { getOrganizationAccessibilityAuditorProfile } from './store';

export function isAccessibilityAuditorActive(organizationId: string): boolean {
  return getOrganizationAccessibilityAuditorProfile(organizationId) !== null;
}

export function hasAccessibilityIssues(organizationId: string): boolean {
  return (getOrganizationAccessibilityAuditorProfile(organizationId)?.issuesOpen ?? 0) > 0;
}
