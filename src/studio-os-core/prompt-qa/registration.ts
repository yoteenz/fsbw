import { getOrganizationPromptQaProfile } from './store';

export function isPromptQaActive(organizationId: string): boolean {
  return getOrganizationPromptQaProfile(organizationId) !== null;
}

export function hasPromptQaFindings(organizationId: string): boolean {
  return (getOrganizationPromptQaProfile(organizationId)?.findingsOpen ?? 0) > 0;
}
