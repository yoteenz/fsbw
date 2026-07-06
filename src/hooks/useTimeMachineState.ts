import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_TIME_MACHINE_UPDATED,
  getOrganizationTimeMachineProfile,
  syncTimeMachineFromSources,
  type OrganizationTimeMachineProfile,
} from '../studio-os-core/time-machine';

export function useTimeMachineState() {
  return useStudioProfileState<OrganizationTimeMachineProfile>({
    getProfile: getOrganizationTimeMachineProfile,
    syncProfile: syncTimeMachineFromSources,
    updatedEvent: STUDIO_OS_TIME_MACHINE_UPDATED,
  });
}
