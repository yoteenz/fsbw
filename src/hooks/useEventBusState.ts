import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_EVENT_BUS_UPDATED,
  getOrganizationEventBusProfile,
  syncEventBusFromSources,
  type OrganizationEventBusProfile,
} from '../studio-os-core/event-bus';

export function useEventBusState() {
  return useStudioProfileState<OrganizationEventBusProfile>({
    getProfile: getOrganizationEventBusProfile,
    syncProfile: syncEventBusFromSources,
    updatedEvent: STUDIO_OS_EVENT_BUS_UPDATED,
  });
}
