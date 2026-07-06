import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_COMPANY_HEALTH_INDEX_UPDATED,
  getOrganizationHealthIndexProfile,
  syncCompanyHealthIndexFromSources,
  type OrganizationHealthIndexProfile,
} from '../studio-os-core/company-health-index';

export function useCompanyHealthIndexState() {
  return useStudioProfileState<OrganizationHealthIndexProfile>({
    getProfile: getOrganizationHealthIndexProfile,
    syncProfile: syncCompanyHealthIndexFromSources,
    updatedEvent: STUDIO_OS_COMPANY_HEALTH_INDEX_UPDATED,
  });
}
