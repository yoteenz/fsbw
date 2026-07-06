import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED,
  getOrganizationAutonomousPreparationProfile,
  syncAutonomousPreparationFromSources,
  type OrganizationAutonomousPreparationProfile,
} from '../studio-os-core/autonomous-preparation';

export function useAutonomousPreparationState() {
  return useStudioProfileState<OrganizationAutonomousPreparationProfile>({
    getProfile: getOrganizationAutonomousPreparationProfile,
    syncProfile: syncAutonomousPreparationFromSources,
    updatedEvent: STUDIO_OS_AUTONOMOUS_PREPARATION_UPDATED,
  });
}
