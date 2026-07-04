/**
 * Promotion Pipeline — promote winning experiments to institutional standards.
 */

import type { LearningInsight, PromotionRecord, PromotionTarget } from './types';

function promoId(): string {
  return `promo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

const CATEGORY_TO_TARGET: Partial<Record<LearningInsight['category'], PromotionTarget>> = {
  hook: 'hook-library',
  thumbnail: 'thumbnail-templates',
  caption: 'writing-bible',
  pillar: 'company-dna',
  series: 'content-templates',
  voice: 'creative-dna',
  revenue: 'automation-rules',
  retention: 'creative-dna',
};

export function suggestPromotions(
  workspaceId: string,
  learnings: LearningInsight[],
  minConfidence = 0.8
): PromotionRecord[] {
  return learnings
    .filter((l) => l.workspaceId === workspaceId && l.confidence >= minConfidence && !l.promotedToMemory)
    .map((l) => ({
      id: promoId(),
      workspaceId,
      experimentId: l.experimentIds[0] ?? '',
      learningId: l.id,
      target: CATEGORY_TO_TARGET[l.category] ?? 'future-campaigns',
      status: 'pending' as const,
      note: l.insight,
    }))
    .filter((p) => p.experimentId);
}

export function approvePromotion(promotion: PromotionRecord): PromotionRecord {
  return {
    ...promotion,
    status: 'approved',
  };
}

export function markPromoted(promotion: PromotionRecord): PromotionRecord {
  return {
    ...promotion,
    status: 'promoted',
    promotedAt: new Date().toISOString(),
  };
}
