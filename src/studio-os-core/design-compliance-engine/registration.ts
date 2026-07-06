import { getOrganizationDesignComplianceEngineProfile } from './store';

export function isDesignComplianceActive(organizationId: string): boolean {
  return getOrganizationDesignComplianceEngineProfile(organizationId) !== null;
}

export function hasDesignComplianceFindings(organizationId: string): boolean {
  return (getOrganizationDesignComplianceEngineProfile(organizationId)?.findingsOpen ?? 0) > 0;
}
