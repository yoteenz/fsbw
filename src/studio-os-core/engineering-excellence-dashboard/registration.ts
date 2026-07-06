import { getOrganizationEngineeringExcellenceProfile } from './store';

export function isEngineeringExcellenceActive(organizationId: string): boolean {
  return getOrganizationEngineeringExcellenceProfile(organizationId) !== null;
}

export function isEngineeringExcellenceStrong(organizationId: string): boolean {
  return (getOrganizationEngineeringExcellenceProfile(organizationId)?.overallEngineeringScore ?? 0) >= 85;
}
