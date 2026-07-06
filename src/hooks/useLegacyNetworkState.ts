import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_LEGACY_NETWORK_UPDATED,
  getOrganizationLegacyNetworkProfile,
  syncLegacyNetworkFromSources,
  type OrganizationLegacyNetworkProfile,
} from '../studio-os-core/legacy-network';

export function useLegacyNetworkState() {
  return useStudioProfileState<OrganizationLegacyNetworkProfile>({
    getProfile: getOrganizationLegacyNetworkProfile,
    syncProfile: syncLegacyNetworkFromSources,
    updatedEvent: STUDIO_OS_LEGACY_NETWORK_UPDATED,
  });
}
