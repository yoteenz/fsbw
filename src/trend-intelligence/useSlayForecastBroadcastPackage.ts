import { useEffect, useState } from 'react';
import type { SlayForecastBroadcastPackage } from '../content/slay-forecast/broadcastContinuityRegistry';

export type ResolvedBroadcastPackage = {
  editionSlug: string;
  package: SlayForecastBroadcastPackage | null;
  source: 'published' | 'none';
  loading: boolean;
};

/** Fetch published broadcast package for an edition slug. */
export function useSlayForecastBroadcastPackage(editionSlug: string): ResolvedBroadcastPackage {
  const [pkg, setPkg] = useState<SlayForecastBroadcastPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetch(`/api/slay-forecast-broadcast/public?editionSlug=${encodeURIComponent(editionSlug)}`)
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { package?: SlayForecastBroadcastPackage | null };
        return data.package ?? null;
      })
      .then((result) => {
        if (!cancelled) {
          setPkg(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPkg(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [editionSlug]);

  return {
    editionSlug,
    package: pkg,
    source: pkg ? 'published' : 'none',
    loading,
  };
}
