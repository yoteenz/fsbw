import { getOrganizationVisualDiffEngineProfile } from './store';

export function isVisualDiffEngineActive(organizationId: string): boolean {
  return getOrganizationVisualDiffEngineProfile(organizationId) !== null;
}

export function hasVisualDiffRegressions(organizationId: string): boolean {
  return (getOrganizationVisualDiffEngineProfile(organizationId)?.screensWithRegressions ?? 0) > 0;
}
