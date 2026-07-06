import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_PLUGIN_SDK_UPDATED,
  syncPluginSdkFromSources,
  type OrganizationPluginSdkProfile,
} from '../studio-os-core/plugin-sdk';

export function usePluginSdkState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationPluginSdkProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncPluginSdkFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_PLUGIN_SDK_UPDATED, onUpdate);
    window.addEventListener('studio-os-workspace-runtime-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_PLUGIN_SDK_UPDATED, onUpdate);
      window.removeEventListener('studio-os-workspace-runtime-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
