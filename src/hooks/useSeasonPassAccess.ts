import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SeasonPassEntitlement } from '../content/education/types';
import { fetchSeasonPassEntitlements, syncSeasonPassGrants } from '../components/lounge/education/seasonPassApi';

export function useSeasonPassAccess() {
  const [passes, setPasses] = useState<SeasonPassEntitlement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await syncSeasonPassGrants();
      const data = await fetchSeasonPassEntitlements();
      setPasses(data?.seasonPasses ?? []);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const passBySeasonId = useMemo(() => new Map(passes.map((p) => [p.seasonId, p])), [passes]);

  return {
    passes,
    loading,
    refresh,
    hasSeasonPass: (seasonId: string) => passBySeasonId.has(seasonId),
    getSeasonPass: (seasonId: string) => passBySeasonId.get(seasonId),
  };
}
