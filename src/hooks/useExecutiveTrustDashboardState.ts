import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED,
  getOrganizationExecutiveTrustDashboardProfile,
  syncExecutiveTrustDashboardFromSources,
  type OrganizationExecutiveTrustDashboardProfile,
} from '../studio-os-core/executive-trust-dashboard';

export function useExecutiveTrustDashboardState() {
  return useStudioProfileState<OrganizationExecutiveTrustDashboardProfile>({
    getProfile: getOrganizationExecutiveTrustDashboardProfile,
    syncProfile: syncExecutiveTrustDashboardFromSources,
    updatedEvent: STUDIO_OS_EXECUTIVE_TRUST_DASHBOARD_UPDATED,
  });
}
