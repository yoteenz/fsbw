import { useCallback, useEffect, useState } from 'react';
import type { PSAEpisodeEntitlement } from '../components/lounge/psa-today/types';
import { fetchPsaEntitlements } from '../components/lounge/psa-today/psaTodayEntitlementApi';
import {
  deriveEntitlementStatus,
} from '../components/lounge/psa-today/psaTodayEntitlementLogic';
import {
  formatPsaAccessUntil,
  watchesRemainingLabel,
} from '../components/lounge/psa-today/psaWatchPolicy';

export function usePsaEntitlementsByEpisode() {
  const [byEpisode, setByEpisode] = useState<Map<string, PSAEpisodeEntitlement>>(new Map());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPsaEntitlements();
      const map = new Map<string, PSAEpisodeEntitlement>();
      if (data?.activeEntitlement) {
        map.set(data.activeEntitlement.episodeId, data.activeEntitlement);
      }
      for (const ent of data?.entitlements ?? []) {
        const status = deriveEntitlementStatus(ent);
        if (status === 'active' && ent.watchesRemaining > 0 && !map.has(ent.episodeId)) {
          map.set(ent.episodeId, ent);
        }
      }
      setByEpisode(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { byEpisode, loading, refresh };
}

export function psaEpisodeEntitlementBadge(
  ent: PSAEpisodeEntitlement | undefined,
  locked: boolean
): string | undefined {
  if (locked || !ent) return locked ? undefined : undefined;
  const status = deriveEntitlementStatus(ent);
  if (status === 'expired') return 'ACCESS EXPIRED';
  if (status === 'watches-exhausted') return 'WATCHES USED';
  if (ent.watchesRemaining > 0) {
    return `${watchesRemainingLabel(ent.watchesRemaining, ent.totalWatches)} · UNTIL ${formatPsaAccessUntil(ent.expiresAt)}`;
  }
  return undefined;
}
