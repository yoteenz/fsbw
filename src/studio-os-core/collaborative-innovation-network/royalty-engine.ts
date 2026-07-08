import type { ContributionShare, RoyaltySplit } from './types';

export function buildRoyaltySplitsFromContributions(
  contributions: ContributionShare[],
  perpetual = true
): RoyaltySplit[] {
  return contributions.map((c) => ({
    founderId: c.founderId,
    founderName: c.founderName,
    percentage: c.percentage,
    perpetual,
  }));
}

export function summarizeRoyaltySplits(splits: RoyaltySplit[]): string {
  if (splits.length === 0) return 'No royalty agreement.';
  return splits.map((s) => `${s.founderName} ${s.percentage}%`).join(' · ');
}

export function projectMarketplaceRevenue(
  splits: RoyaltySplit[],
  unitPrice: number,
  unitsSold: number
): { founderId: string; founderName: string; earnings: number }[] {
  const gross = unitPrice * unitsSold;
  return splits.map((s) => ({
    founderId: s.founderId,
    founderName: s.founderName,
    earnings: Math.round((gross * s.percentage) / 100),
  }));
}

export function formatRoyaltyDistributionLine(splits: RoyaltySplit[]): string {
  return `Every purchase distributes automatically: ${summarizeRoyaltySplits(splits)}. Royalties continue indefinitely per ownership agreement.`;
}
