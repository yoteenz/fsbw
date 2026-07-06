import { REPUTATION_DIMENSION_LABELS, REPUTATION_DIMENSIONS } from './constants';
import type { PublishableAsset, ReputationDimension, ReputationProfile } from './types';

function snap(
  dimension: ReputationDimension,
  scorePct: number,
  insight: string
): ReputationProfile {
  return {
    dimension,
    label: REPUTATION_DIMENSION_LABELS[dimension],
    scorePct,
    insight,
  };
}

export function buildReputationProfile(
  organizationId: string,
  publishedCount: number,
  discoveredCount: number,
  assets: PublishableAsset[]
): ReputationProfile[] {
  const totalAdoptions = assets.reduce((sum, a) => sum + a.attribution.adoptions, 0);
  const totalReviews = assets.reduce((sum, a) => sum + a.attribution.reviews, 0);
  const avgRating =
    assets.reduce((sum, a) => sum + a.attribution.averageRating, 0) / Math.max(1, assets.length);

  const contribution = Math.min(99, publishedCount * 15 + assets.length * 3);
  const impact = Math.min(99, totalAdoptions * 2 + discoveredCount);
  const trust = Math.min(99, 55 + totalReviews * 2 + (avgRating >= 4 ? 15 : 0));
  const adoption = Math.min(99, totalAdoptions * 3 + publishedCount * 8);
  const innovation = Math.min(
    99,
    assets.filter((a) => a.type === 'innovation-frameworks' || a.type === 'automation-blueprints').length * 20 + 40
  );
  const teaching = Math.min(
    99,
    assets.filter((a) => a.type === 'studio-institute-courses' || a.type === 'knowledge-products').length * 18 + 35
  );
  const legacy = Math.min(99, Math.round(contribution * 0.25 + impact * 0.25 + trust * 0.2 + teaching * 0.15 + innovation * 0.15));

  const scores: Record<ReputationDimension, number> = {
    'contribution-score': contribution,
    'knowledge-impact': impact,
    'community-trust': trust,
    'adoption-rate': adoption,
    'innovation-score': innovation,
    'teaching-score': teaching,
    'legacy-score': legacy,
  };

  const insights: Record<ReputationDimension, string> = {
    'contribution-score': `${publishedCount} assets published voluntarily — recognized for expertise contributed to the movement.`,
    'knowledge-impact': `${totalAdoptions} peer adoptions — expertise strengthens organizations worldwide.`,
    'community-trust': `${totalReviews} community reviews · ${avgRating.toFixed(1)} avg rating — trust earned through valuable contributions.`,
    'adoption-rate': `${Math.round(adoption)}% adoption rate — frameworks and playbooks adopted by peer organizations.`,
    'innovation-score': 'Innovation frameworks shared — known for advancing business practice, not only products sold.',
    'teaching-score': 'Studio Institute and knowledge products contribute to global organizational learning.',
    'legacy-score': `Legacy Score ${legacy}% — fulfilling PRESERVE EXPERTISE. BUILD LEGACY. for ${organizationId.replace(/-/g, ' ')}.`,
  };

  return REPUTATION_DIMENSIONS.map((d) => snap(d, scores[d], insights[d]));
}

export function summarizeReputation(reputation: ReputationProfile[]): string {
  const legacy = reputation.find((r) => r.dimension === 'legacy-score');
  const contrib = reputation.find((r) => r.dimension === 'contribution-score');
  return `Legacy Score ${legacy?.scorePct ?? 0}% · Contribution ${contrib?.scorePct ?? 0}% — known for what you contribute to the world.`;
}
