import type { ForecastEdition, ForecastEditionSignal } from '../content/slay-forecast/editionTypes';
import { forecastEditionSignalDisplay } from '../components/lounge/explore/slay-forecast/slayForecastPresentation';

export type IntelligenceBackedSignal = {
  category: string;
  label: string;
  momentum: string;
  momentumDisplay: string;
  prediction?: string;
  publicRationale?: string;
  trendSignalId?: string;
  source: 'intelligence' | 'fixture';
};

export type ResolvedForecastIntelligence = {
  editionSlug: string;
  signals: IntelligenceBackedSignal[];
  source: 'intelligence' | 'fixture' | 'mixed';
  isDemoFixture: boolean;
};

function fixtureSignalsFromEdition(edition: ForecastEdition): IntelligenceBackedSignal[] {
  return edition.signals.map((signal: ForecastEditionSignal) => ({
    category: signal.categoryLabel,
    label: signal.value,
    momentum: signal.momentum,
    momentumDisplay: forecastEditionSignalDisplay(signal),
    source: 'fixture' as const,
  }));
}

/** Resolve forecast overlay payload — intelligence DB first, static demo fixtures fallback. */
export async function resolveForecastIntelligence(
  edition: ForecastEdition,
): Promise<ResolvedForecastIntelligence> {
  const isDemoFixture = edition.id.startsWith('forecast-2026-');

  try {
    const res = await fetch(
      `/api/trend-intelligence/public?editionSlug=${encodeURIComponent(edition.slug)}`,
    );
    if (res.ok) {
      const payload = (await res.json()) as {
        signals?: Array<{
          category: string;
          label: string;
          momentum: string;
          prediction?: string;
          publicRationale?: string;
          trendSignalId?: string;
        }>;
      };
      if (payload.signals && payload.signals.length > 0) {
        return {
          editionSlug: edition.slug,
          source: 'intelligence',
          isDemoFixture: false,
          signals: payload.signals.map((s) => ({
            category: s.category,
            label: s.label,
            momentum: s.momentum,
            momentumDisplay: s.momentum.toUpperCase(),
            prediction: s.prediction,
            publicRationale: s.publicRationale,
            trendSignalId: s.trendSignalId,
            source: 'intelligence',
          })),
        };
      }
    }
  } catch {
    /* fallback to fixtures in preview/offline */
  }

  return {
    editionSlug: edition.slug,
    source: 'fixture',
    isDemoFixture,
    signals: fixtureSignalsFromEdition(edition),
  };
}
