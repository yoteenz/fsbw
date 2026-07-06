import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_AUTOMATION_REGISTRY_UPDATED,
  getOrganizationAutomationRegistryProfile,
  syncAutomationRegistryFromSources,
  type OrganizationAutomationRegistryProfile,
} from '../studio-os-core/automation-registry';

export function useAutomationRegistryState() {
  return useStudioProfileState<OrganizationAutomationRegistryProfile>({
    getProfile: getOrganizationAutomationRegistryProfile,
    syncProfile: syncAutomationRegistryFromSources,
    updatedEvent: STUDIO_OS_AUTOMATION_REGISTRY_UPDATED,
  });
}
