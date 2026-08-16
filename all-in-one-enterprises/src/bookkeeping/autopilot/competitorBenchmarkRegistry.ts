/** Internal competitor benchmark registry — optional named research data (Refinement 04A) */

export type BenchmarkStatus = 'CURRENT' | 'REVIEW_DUE' | 'STALE' | 'ARCHIVED';

export type ProviderCategory = 'general_managed' | 'trucking_service' | 'diy_software';

export interface CompetitorBenchmark {
  id: string;
  providerName: string;
  providerCategory: ProviderCategory;
  startingPriceLabel?: string;
  billingUnit?: string;
  cleanupStartingPriceLabel?: string;
  features: string[];
  sourceReference?: string;
  lastVerifiedAt?: string;
  status: BenchmarkStatus;
  publishPublicly: boolean;
  internalNotes?: string;
}

/** Internal research snapshot — verify before public display */
export const COMPETITOR_BENCHMARK_REGISTRY: CompetitorBenchmark[] = [
  {
    id: 'bench-bookkeeper360',
    providerName: 'Bookkeeper360',
    providerCategory: 'general_managed',
    startingPriceLabel: 'From ~$399/month (public listing — verify)',
    cleanupStartingPriceLabel: 'Prior-bookkeeping projects from ~$1,000 (public listing — verify)',
    billingUnit: 'month',
    features: ['Managed bookkeeping', 'Onboarding/cleanup projects'],
    sourceReference: 'Public provider website — verify current pricing before display',
    lastVerifiedAt: '2026-08-16',
    status: 'REVIEW_DUE',
    publishPublicly: false,
    internalNotes: 'Seed from market research — not hard-coded into UI components',
  },
  {
    id: 'bench-remotebooks',
    providerName: 'RemoteBooksOnline',
    providerCategory: 'general_managed',
    startingPriceLabel: 'From ~$150/month (public listing — verify)',
    billingUnit: 'month',
    features: ['Outsourced bookkeeping', 'Complexity-based pricing factors'],
    sourceReference: 'Public provider materials — verify',
    lastVerifiedAt: '2026-08-16',
    status: 'REVIEW_DUE',
    publishPublicly: false,
  },
  {
    id: 'bench-atbs',
    providerName: 'ATBS',
    providerCategory: 'trucking_service',
    features: ['Trucking-specific accounting/bookkeeping/tax services'],
    sourceReference: 'Verify current public pricing before any named comparison',
    status: 'ARCHIVED',
    publishPublicly: false,
    internalNotes: 'Trucking-specific provider — use only verified public pricing',
  },
];

export function getPublishableBenchmarks(_now = new Date()): CompetitorBenchmark[] {
  return COMPETITOR_BENCHMARK_REGISTRY.filter((b) => b.publishPublicly && b.status === 'CURRENT');
}

export function formatBenchmarkPrice(benchmark: CompetitorBenchmark): string {
  if (benchmark.status === 'STALE' || !benchmark.startingPriceLabel) {
    return 'Check provider for current pricing';
  }
  return benchmark.startingPriceLabel;
}
