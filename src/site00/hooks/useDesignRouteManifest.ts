import { useCallback, useEffect, useState } from 'react';
import type { StudioWorldDesignRouteManifest } from '../../studio-os-core/route-intelligence/types';
import { MANIFEST_ARTIFACT_FILENAME } from '../../studio-os-core/route-intelligence/constants';

export type ManifestSyncStatus = 'SYNCED' | 'UPDATE_AVAILABLE' | 'LOADING' | 'ERROR';

export function useDesignRouteManifest() {
  const [manifest, setManifest] = useState<StudioWorldDesignRouteManifest | null>(null);
  const [syncStatus, setSyncStatus] = useState<ManifestSyncStatus>('LOADING');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setSyncStatus('LOADING');
    try {
      const res = await fetch(`/studio-world/${MANIFEST_ARTIFACT_FILENAME}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Manifest HTTP ${res.status}`);
      const data = (await res.json()) as StudioWorldDesignRouteManifest;
      setManifest(data);
      setSyncStatus('SYNCED');
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load manifest');
      setSyncStatus('ERROR');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { manifest, syncStatus, error, reload: load };
}
