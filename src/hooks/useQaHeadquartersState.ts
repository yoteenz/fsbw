import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_QA_HEADQUARTERS_UPDATED,
  getOrganizationQaHeadquartersProfile,
  syncQaHeadquartersFromSources,
  type OrganizationQaHeadquartersProfile,
} from '../studio-os-core/qa-headquarters';

export function useQaHeadquartersState() {
  return useStudioProfileState<OrganizationQaHeadquartersProfile>({
    getProfile: getOrganizationQaHeadquartersProfile,
    syncProfile: syncQaHeadquartersFromSources,
    updatedEvent: STUDIO_OS_QA_HEADQUARTERS_UPDATED,
  });
}
