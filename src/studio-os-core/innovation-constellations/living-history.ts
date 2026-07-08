import type { LivingHistorySnapshot } from './types';

export function buildLivingHistorySnapshots(): LivingHistorySnapshot[] {
  const now = Date.now();
  return [
    {
      id: 'era-1',
      eraLabel: '2024 — First Blueprint Stars',
      at: new Date(now - 730 * 86_400_000).toISOString(),
      starCount: 12,
      headline: 'Luxury Hospitality Blueprint™ ignites Beauty Galaxy™',
    },
    {
      id: 'era-2',
      eraLabel: '2025 — Constellation Formation',
      at: new Date(now - 365 * 86_400_000).toISOString(),
      starCount: 48,
      headline: 'Customer Experience™ constellation emerges',
    },
    {
      id: 'era-3',
      eraLabel: '2026 — Marketplace Suns',
      at: new Date(now - 120 * 86_400_000).toISOString(),
      starCount: 156,
      headline: 'Luxury Customer Experience HQ™ becomes Sun™ — 18,400 adopters',
    },
    {
      id: 'era-4',
      eraLabel: 'Present — Living Universe',
      at: new Date().toISOString(),
      starCount: 214,
      headline: 'Innovation Constellations™ — universe evolves in real time',
    },
  ];
}

export function summarizeLivingHistory(snapshots: LivingHistorySnapshot[]): string {
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  if (!first || !last) return 'Living history preserved forever.';
  return `${first.starCount} → ${last.starCount} stars · replay entire innovation chains · nothing lost`;
}
