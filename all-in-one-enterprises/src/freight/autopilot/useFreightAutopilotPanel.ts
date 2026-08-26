import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAIOAuth } from '../../auth/AIOAuthProvider';
import { isSupabaseMode } from '../../config/dataMode';
import { demoFreightAutopilotRepository } from './demoFreightAutopilotRepository';
import { createSupabaseFreightAutopilotRepository } from './supabaseFreightAutopilotRepository';
import type { FreightAutopilotPanelData } from './freightAutopilotRepositoryTypes';

export function useFreightAutopilotPanel(
  loadId: string | undefined,
  refreshKey?: string,
): {
  data: FreightAutopilotPanelData | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const { session, loading: authLoading } = useAIOAuth();
  const [data, setData] = useState<FreightAutopilotPanelData | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const repository = useMemo(() => {
    if (isSupabaseMode() && session?.organization?.id) {
      return createSupabaseFreightAutopilotRepository();
    }
    return demoFreightAutopilotRepository;
  }, [session?.organization?.id]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!loadId) {
      setData(undefined);
      return;
    }

    if (isSupabaseMode() && authLoading) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void repository
      .getPanelData(loadId)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load Freight Autopilot state');
          setData(undefined);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadId, repository, authLoading, tick, refreshKey]);

  return {
    data,
    loading: isSupabaseMode() ? authLoading || loading : false,
    error,
    refetch,
  };
}
