import { useCallback, useEffect, useState } from 'react';
import type { PSAEpisodeEntitlement, PSATodayEpisode } from '../components/lounge/psa-today/types';
import { fetchPsaEntitlements } from '../components/lounge/psa-today/psaTodayEntitlementApi';
import {
  psaEntitlementCanStartNewWatch,
  psaEntitlementIsExpired,
  psaEntitlementWatchesExhausted,
} from '../components/lounge/psa-today/psaTodayEntitlementLogic';

export function usePsaEpisodeEntitlement(episode: PSATodayEpisode | null) {
  const [entitlement, setEntitlement] = useState<PSAEpisodeEntitlement | null>(null);
  const [loading, setLoading] = useState(Boolean(episode && episode.accessType !== 'free'));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!episode || episode.accessType === 'free') {
      setEntitlement(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPsaEntitlements(episode.id);
      const active = data?.activeEntitlement ?? null;
      setEntitlement(active);
      return active;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load entitlement');
      return null;
    } finally {
      setLoading(false);
    }
  }, [episode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canStartNewWatch = entitlement ? psaEntitlementCanStartNewWatch(entitlement) : false;
  const expired = entitlement ? psaEntitlementIsExpired(entitlement) : false;
  const watchesExhausted = entitlement ? psaEntitlementWatchesExhausted(entitlement) : false;

  return {
    entitlement,
    setEntitlement,
    loading,
    error,
    refresh,
    canStartNewWatch,
    expired,
    watchesExhausted,
  };
}
