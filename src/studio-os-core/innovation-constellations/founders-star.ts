import type { FoundersStar } from './types';
import { influenceBrightness, resolveStarInfluenceTier } from './star-influence';

export function buildFoundersStar(
  founderId: string,
  founderName: string,
  companiesHelped: number,
  innovationScore: number,
  breakthroughs: number
): FoundersStar {
  const tier = resolveStarInfluenceTier(companiesHelped, innovationScore, breakthroughs >= 3, false);
  return {
    founderId,
    founderName,
    magnitude: influenceBrightness(tier),
    tier,
    orbitingAchievements: [
      'Marketplace Bestseller™ contributor',
      'Cross-constellation collaborator',
      'Innovation Lineage anchor',
    ],
    planetarySystems: ['Luxury Customer Experience HQ™', 'Immersive Retail Story Stack™'],
    companyWorlds: ['Frontal Slayer™ Headquarters'],
    growthRate: Math.min(99, 40 + innovationScore * 0.4 + breakthroughs * 5),
  };
}

export function summarizeFoundersStar(star: FoundersStar): string {
  return `${star.founderName}'s Star™ — magnitude ${star.magnitude} · ${star.planetarySystems.length} planetary systems · ${star.growthRate}% growth`;
}
