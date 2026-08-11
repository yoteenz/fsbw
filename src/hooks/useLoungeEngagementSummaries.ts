import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LoungeEngagementContentKey, LoungeEngagementSummary } from '../utils/loungeEngagementTypes';
import { engagementItemKey } from '../utils/loungeEngagementTypes';
import { fetchEngagementSummariesBatch } from '../utils/loungeEngagementApi';

const cache = new Map<string, { at: number; data: Map<string, LoungeEngagementSummary> }>();
const CACHE_MS = 45_000;

/**
 * Batch-fetch engagement summaries for card rails (single request per rail/panel).
 */
export function useLoungeEngagementSummaries(items: LoungeEngagementContentKey[]) {
  const stableKey = useMemo(
    () => items.map((i) => engagementItemKey(i)).sort().join('|'),
    [items]
  );

  const [map, setMap] = useState<Map<string, LoungeEngagementSummary>>(() => new Map());
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!items.length) {
      setMap(new Map());
      return;
    }

    const cached = cache.get(stableKey);
    if (cached && Date.now() - cached.at < CACHE_MS) {
      setMap(cached.data);
      return;
    }

    setLoading(true);
    try {
      const next = await fetchEngagementSummariesBatch(items);
      if (!mountedRef.current) return;
      cache.set(stableKey, { at: Date.now(), data: next });
      setMap(next);
    } catch {
      if (mountedRef.current) setMap(new Map());
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [items, stableKey]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const patchSummary = useCallback((key: LoungeEngagementContentKey, patch: Partial<LoungeEngagementSummary>) => {
    setMap((prev) => {
      const id = engagementItemKey(key);
      const existing = prev.get(id) ?? {
        contentType: key.contentType,
        contentId: key.contentId,
        qualifiedViewCount: 0,
        helpfulCount: 0,
        commentCount: 0,
      };
      const next = new Map(prev);
      next.set(id, { ...existing, ...patch });
      cache.delete(stableKey);
      return next;
    });
  }, [stableKey]);

  return { map, loading, refresh, patchSummary };
}

export function invalidateEngagementSummaryCache(): void {
  cache.clear();
}
