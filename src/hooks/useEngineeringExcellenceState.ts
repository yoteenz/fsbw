import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED,
  getOrganizationEngineeringExcellenceProfile,
  syncEngineeringExcellenceFromSources,
  type OrganizationEngineeringExcellenceProfile,
} from '../studio-os-core/engineering-excellence-dashboard';

export function useEngineeringExcellenceState() {
  return useStudioProfileState<OrganizationEngineeringExcellenceProfile>({
    getProfile: getOrganizationEngineeringExcellenceProfile,
    syncProfile: syncEngineeringExcellenceFromSources,
    updatedEvent: STUDIO_OS_ENGINEERING_EXCELLENCE_UPDATED,
  });
}
