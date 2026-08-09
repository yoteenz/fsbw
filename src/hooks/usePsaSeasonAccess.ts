import { useCallback, useEffect, useState } from 'react';
import type { ResolvedPsaSeasonAccess } from '../content/education/types';
import { apiFetch } from '../utils/api';

export function usePsaSeasonAccess(seasonId: string | undefined) {
  const [access, setAccess] = useState<ResolvedPsaSeasonAccess | null>(null);
  const [loading, setLoading] = useState(Boolean(seasonId));

  const refresh = useCallback(async () => {
    if (!seasonId) {
      setAccess(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const res = await apiFetch(`/api/education/season-access?seasonId=${encodeURIComponent(seasonId)}`);
      if (res.status === 401 || !res.ok) {
        setAccess(null);
        return null;
      }
      const data = (await res.json()) as { access: ResolvedPsaSeasonAccess };
      setAccess(data.access ?? null);
      return data.access ?? null;
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { access, loading, refresh };
}
