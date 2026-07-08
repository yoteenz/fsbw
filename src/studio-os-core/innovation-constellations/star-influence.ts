import { STAR_INFLUENCE_LABELS } from './constants';
import type { StarInfluenceTier } from './types';

export function resolveStarInfluenceTier(
  companiesUsing: number,
  creativeEquity: number,
  isAnchor: boolean,
  isHistoric: boolean
): StarInfluenceTier {
  if (isAnchor) return 'constellation-anchor';
  if (isHistoric) return 'red-giant';
  if (companiesUsing >= 10_000 || creativeEquity >= 85) return 'gold-star';
  if (companiesUsing >= 2_000 || creativeEquity >= 65) return 'white-star';
  return 'blue-star';
}

export function influenceBrightness(tier: StarInfluenceTier): number {
  switch (tier) {
    case 'constellation-anchor':
      return 100;
    case 'red-giant':
      return 95;
    case 'gold-star':
      return 82;
    case 'white-star':
      return 58;
    case 'blue-star':
      return 32;
    default:
      return 30;
  }
}

export function influenceLabel(tier: StarInfluenceTier): string {
  return STAR_INFLUENCE_LABELS[tier];
}

export function shouldPromoteToSun(companiesUsing: number, descendants: number): boolean {
  return companiesUsing >= 8_000 || descendants >= 5;
}
