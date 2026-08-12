import { useEffect, useMemo, useState } from 'react';
import type { ForecastEdition } from '../content/slay-forecast/editionTypes';
import { mapIntelligenceToEditionSignals, mapIntelligenceToObservations } from './mapIntelligenceSignals';
import { resolveForecastIntelligence, type ResolvedForecastIntelligence } from './resolveForecastIntelligence';

export type ForecastIntelligenceState = {
  edition: ForecastEdition;
  resolved: ResolvedForecastIntelligence | null;
  loading: boolean;
};

/** Resolve intelligence-backed signals for a forecast edition; falls back to static fixtures. */
export function useForecastIntelligence(baseEdition: ForecastEdition): ForecastIntelligenceState {
  const [resolved, setResolved] = useState<ResolvedForecastIntelligence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void resolveForecastIntelligence(baseEdition).then((result) => {
      if (!cancelled) {
        setResolved(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [baseEdition.id, baseEdition.slug]);

  const edition = useMemo(() => {
    if (!resolved || resolved.source === 'fixture') return baseEdition;
    const observations = mapIntelligenceToObservations(resolved.signals);
    if (observations.length === 0) return baseEdition;
    return {
      ...baseEdition,
      observations,
      signals: mapIntelligenceToEditionSignals(resolved.signals),
      isDemoFixture: resolved.isDemoFixture,
    };
  }, [baseEdition, resolved]);

  return { edition, resolved, loading };
}
