/**
 * Monetization Center — revenue by series, pillar, platform, channel.
 */

import type { AiMediaNetworkStore, MonetizationRecord, NetworkShowId } from './types';

export type MonetizationSummary = {
  total: number;
  bySeries: Record<string, number>;
  byPillar: Record<string, number>;
  byPlatform: Record<string, number>;
  byChannel: Record<string, number>;
};

export function summarizeMonetization(records: MonetizationRecord[]): MonetizationSummary {
  const summary: MonetizationSummary = {
    total: 0,
    bySeries: {},
    byPillar: {},
    byPlatform: {},
    byChannel: {},
  };

  for (const r of records) {
    summary.total += r.amount;
    summary.byChannel[r.channel] = (summary.byChannel[r.channel] ?? 0) + r.amount;
    if (r.seriesId) {
      summary.bySeries[r.seriesId] = (summary.bySeries[r.seriesId] ?? 0) + r.amount;
    }
    if (r.pillarId) {
      summary.byPillar[r.pillarId] = (summary.byPillar[r.pillarId] ?? 0) + r.amount;
    }
    if (r.platform) {
      summary.byPlatform[r.platform] = (summary.byPlatform[r.platform] ?? 0) + r.amount;
    }
  }

  return summary;
}

export function topPerformingSeries(
  store: AiMediaNetworkStore
): Array<{ showId: NetworkShowId; revenue: number }> {
  return Object.entries(store.showAnalytics)
    .map(([showId, a]) => ({ showId: showId as NetworkShowId, revenue: a.revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}
