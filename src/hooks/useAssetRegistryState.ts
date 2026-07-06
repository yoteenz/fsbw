import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_ASSET_REGISTRY_UPDATED,
  getOrganizationAssetRegistryProfile,
  syncAssetRegistryFromSources,
  type OrganizationAssetRegistryProfile,
} from '../studio-os-core/asset-registry';

export function useAssetRegistryState() {
  return useStudioProfileState<OrganizationAssetRegistryProfile>({
    getProfile: getOrganizationAssetRegistryProfile,
    syncProfile: syncAssetRegistryFromSources,
    updatedEvent: STUDIO_OS_ASSET_REGISTRY_UPDATED,
  });
}
