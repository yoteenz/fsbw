import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PLUGIN_SDK_UPDATED,
  getOrganizationPluginSdkProfile,
  syncPluginSdkFromSources,
  type OrganizationPluginSdkProfile,
} from '../studio-os-core/plugin-sdk';

export function usePluginSdkState() {
  return useStudioProfileState<OrganizationPluginSdkProfile>({
    getProfile: getOrganizationPluginSdkProfile,
    syncProfile: syncPluginSdkFromSources,
    updatedEvent: STUDIO_OS_PLUGIN_SDK_UPDATED,
  });
}
