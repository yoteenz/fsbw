import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  STUDIO_OS_EVENT_BUS_UPDATED,
  syncEventBusFromSources,
  type OrganizationEventBusProfile,
} from '../studio-os-core/event-bus';

export function useEventBusState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationEventBusProfile | null>(null);

  const refresh = useCallback(() => {
    const next = syncEventBusFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener(STUDIO_OS_EVENT_BUS_UPDATED, onUpdate);
    window.addEventListener('studio-os-interaction-engine-updated', onUpdate);
    window.addEventListener('studio-os-design-token-engine-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener(STUDIO_OS_EVENT_BUS_UPDATED, onUpdate);
      window.removeEventListener('studio-os-interaction-engine-updated', onUpdate);
      window.removeEventListener('studio-os-design-token-engine-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh };
}
