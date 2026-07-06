import { getOrganizationRegressionEngineProfile } from './store';

export function isRegressionEngineActive(organizationId: string): boolean {
  return getOrganizationRegressionEngineProfile(organizationId) !== null;
}

export function hasOpenRegressions(organizationId: string): boolean {
  return (getOrganizationRegressionEngineProfile(organizationId)?.brokenFeaturesOpen ?? 0) > 0;
}
