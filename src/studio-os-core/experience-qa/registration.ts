import { getOrganizationExperienceQaProfile } from './store';

export function isExperienceQaActive(organizationId: string): boolean {
  return getOrganizationExperienceQaProfile(organizationId) !== null;
}

export function hasExperienceQaFindings(organizationId: string): boolean {
  return (getOrganizationExperienceQaProfile(organizationId)?.findingsOpen ?? 0) > 0;
}
