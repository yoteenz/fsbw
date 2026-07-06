import { useCallback, useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';

export type StudioProfileStateConfig<T> = {
  getProfile: (organizationId: string) => T | null;
  syncProfile: (organizationId: string) => T;
  updatedEvent: string;
  /** Debounce ms for background refresh listeners. Default 450. */
  debounceMs?: number;
};

/**
 * Lightweight module state hook — reads cached profile first, syncs only when missing.
 * Listens to own update + boundary events with debounce; avoids upstream cascade storms.
 */
export function useStudioProfileState<T>(config: StudioProfileStateConfig<T>) {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<T | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceMs = config.debounceMs ?? 450;

  const readCached = useCallback(() => {
    return config.getProfile(workspaceId);
  }, [config, workspaceId]);

  const load = useCallback(
    (forceSync = false) => {
      const next = forceSync
        ? config.syncProfile(workspaceId)
        : readCached() ?? config.syncProfile(workspaceId);
      setProfile(next);
      return next;
    },
    [config, readCached, workspaceId]
  );

  const refresh = useCallback(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    load(false);
  }, [load]);

  useEffect(() => {
    const scheduleRead = (forceSync: boolean) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        load(forceSync);
      }, debounceMs);
    };

    const onSelfUpdated = () => scheduleRead(false);
    const onBoundaryChanged = () => scheduleRead(false);

    window.addEventListener(config.updatedEvent, onSelfUpdated);
    window.addEventListener('studio-os-organization-boundary-changed', onBoundaryChanged);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      window.removeEventListener(config.updatedEvent, onSelfUpdated);
      window.removeEventListener('studio-os-organization-boundary-changed', onBoundaryChanged);
    };
  }, [config.updatedEvent, debounceMs, load]);

  return { profile, refresh, load };
}
