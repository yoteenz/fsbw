import { ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS } from '../../../utils/adminStudioContentBrainDemo';
import {
  BRAND_DIMENSION_LABELS,
  BRAND_ALIGNMENT_THRESHOLD,
  type BrandDimensionId,
} from '../../../utils/adminStudioCreativeDirectorDemo';
import type { BrandAlignmentResult, CreativeDirectorSession } from './types';
import { buildDecisionRecommendation } from './decisionEngine';

function scoreDimension(base: number, boost: number): number {
  return Math.min(100, Math.max(0, Math.round(base + boost)));
}

export function evaluateBrandAlignment(session: CreativeDirectorSession): BrandAlignmentResult {
  const rec = buildDecisionRecommendation(session);
  const topicLower = session.topic.toLowerCase();
  const hasProducts = session.featuredProductIds.length > 0;
  const hasCta = Boolean(session.primaryCtaId);
  const isEducational = session.contentPurpose === 'educational' || topicLower.includes('why') || topicLower.includes('how');
  const isPremium = session.membershipTier.toLowerCase().includes('premium') || session.membershipTier.toLowerCase().includes('black');
  const hasReward = session.rewardId && session.rewardId !== 'none';

  const dimensions: Record<BrandDimensionId, number> = {
    luxury: scoreDimension(88, topicLower.includes('luxury') ? 8 : 4),
    educational: scoreDimension(70, isEducational ? 22 : 5),
    interactive: scoreDimension(75, hasCta ? 15 : 0),
    community: scoreDimension(72, session.contentPurpose === 'community' ? 20 : 8),
    premium: scoreDimension(80, isPremium ? 14 : 4),
    original: scoreDimension(85, topicLower.length > 20 ? 8 : 3),
    elegant: scoreDimension(90, 4),
    modern: scoreDimension(86, 6),
    rewardOpportunity: scoreDimension(65, hasReward ? 28 : 0),
    membershipValue: scoreDimension(70, isPremium ? 22 : 6),
    productIntegration: scoreDimension(68, hasProducts ? 26 : 0),
  };

  const values = Object.values(dimensions);
  const overallScore = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const passesThreshold = overallScore >= BRAND_ALIGNMENT_THRESHOLD;

  const improvements: string[] = [];
  if (dimensions.productIntegration < 85 && !hasProducts) {
    improvements.push('ADD FEATURED PRODUCTS FROM PRODUCT KNOWLEDGE.');
  }
  if (dimensions.educational < 85 && !isEducational) {
    improvements.push('ANGLE TOPIC AS EDUCATIONAL — TRUST OVER SALES.');
  }
  if (dimensions.rewardOpportunity < 85 && !hasReward) {
    improvements.push('INTEGRATE SLAY CHALLENGE OR MEMBER REWARD.');
  }
  if (!hasCta) {
    improvements.push('SELECT PRIMARY CTA FROM CTA LIBRARY.');
  }
  if (rec.show.confidence < 80 && !session.showRecommendationOverride) {
    improvements.push(`CONSIDER ${rec.show.showName} — ${rec.show.reason}`);
  }

  void BRAND_DIMENSION_LABELS;
  void ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS;

  return {
    overallScore,
    dimensions,
    passesThreshold,
    improvements: passesThreshold ? improvements.slice(0, 1) : improvements,
  };
}
