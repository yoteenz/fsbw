export type IntelligenceBackedReportSignal = {
  label: string;
  category: string;
  momentum: string;
  publicSummary?: string;
  trendSignalId?: string;
  source: 'intelligence' | 'fixture';
};

export type ResolvedTrendReportIntelligence = {
  packId: string;
  signals: IntelligenceBackedReportSignal[];
  source: 'intelligence' | 'fixture' | 'mixed';
};

/** Resolve approved trend report signals from intelligence DB; empty payload keeps editorial static content. */
export async function resolveTrendReportIntelligence(
  packId: string,
): Promise<ResolvedTrendReportIntelligence> {
  try {
    const res = await fetch(`/api/trend-intelligence/public?packId=${encodeURIComponent(packId)}`);
    if (res.ok) {
      const payload = (await res.json()) as {
        signals?: Array<{
          label: string;
          category: string;
          momentum: string;
          publicSummary?: string;
          trendSignalId?: string;
        }>;
      };
      if (payload.signals && payload.signals.length > 0) {
        return {
          packId,
          source: 'intelligence',
          signals: payload.signals.map((s) => ({
            label: s.label,
            category: s.category,
            momentum: s.momentum,
            publicSummary: s.publicSummary,
            trendSignalId: s.trendSignalId,
            source: 'intelligence',
          })),
        };
      }
    }
  } catch {
    /* offline preview */
  }

  return { packId, source: 'fixture', signals: [] };
}
