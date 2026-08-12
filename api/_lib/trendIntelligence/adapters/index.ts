/** Source adapter interfaces — automation-ready, manual-first. */

export type TrendSourceAdapterKind = 'manual' | 'google_trends' | 'search' | 'editorial' | 'fs_behavior';

export type TrendSourceAdapterMeta = {
  kind: TrendSourceAdapterKind;
  label: string;
  automationStatus: 'manual' | 'available' | 'planned' | 'disabled';
  description: string;
};

export const TREND_SOURCE_ADAPTERS: TrendSourceAdapterMeta[] = [
  {
    kind: 'manual',
    label: 'Manual Signal Adapter',
    automationStatus: 'manual',
    description: 'Human-entered evidence via Trend Desk. Phase 1 primary workflow.',
  },
  {
    kind: 'google_trends',
    label: 'Google Trends Adapter',
    automationStatus: 'planned',
    description: 'Planned — no live integration in v1.',
  },
  {
    kind: 'search',
    label: 'Search Adapter',
    automationStatus: 'planned',
    description: 'Planned — FS onsite search aggregates only when available.',
  },
  {
    kind: 'editorial',
    label: 'Editorial Source Adapter',
    automationStatus: 'manual',
    description: 'Manual editorial/publication evidence ingestion.',
  },
  {
    kind: 'fs_behavior',
    label: 'FS First-Party Behavior Adapter',
    automationStatus: 'planned',
    description: 'Aggregated anonymized FS metrics — no PII. Planned pipeline.',
  },
];

export type FsBehaviorSignalAggregate = {
  metric: string;
  category: string;
  periodStart: string;
  periodEnd: string;
  currentValue: number;
  previousValue: number | null;
  changePercent: number | null;
  sampleSize: number;
};

export function fsBehaviorConfidence(sampleSize: number, minSample = 50): 'insufficient' | 'low' | 'medium' | 'high' {
  if (sampleSize < minSample) return 'insufficient';
  if (sampleSize < minSample * 2) return 'low';
  if (sampleSize < minSample * 5) return 'medium';
  return 'high';
}
