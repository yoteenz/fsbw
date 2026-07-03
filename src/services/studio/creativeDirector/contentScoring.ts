import {
  CONTENT_SCORE_LABELS,
  type ContentScoreId,
} from '../../../utils/adminStudioCreativeDirectorDemo';
import type { ContentScoreResult, CreativeDirectorSession } from './types';
import { buildDecisionRecommendation } from './decisionEngine';

export function evaluateContentScore(session: CreativeDirectorSession): ContentScoreResult {
  const rec = buildDecisionRecommendation(session);
  const topic = session.topic.trim();
  const wordCount = topic.split(/\s+/).length;

  const base = 72;
  const boost = (id: ContentScoreId): number => {
    switch (id) {
      case 'originality':
        return wordCount >= 4 ? 18 : 8;
      case 'entertainment':
        return session.contentPurpose === 'entertainment' ? 20 : 10;
      case 'educationalValue':
        return session.contentPurpose === 'educational' ? 22 : 8;
      case 'viralityPotential':
        return topic.toLowerCase().includes('secret') || topic.toLowerCase().includes('why') ? 16 : 8;
      case 'conversionPotential':
        return session.featuredProductIds.length > 0 ? 18 : 6;
      case 'membershipValue':
        return session.membershipTier.includes('PREMIUM') ? 16 : 8;
      case 'communityValue':
        return session.contentPurpose === 'community' ? 20 : 7;
      case 'shareability':
        return rec.show.confidence > 85 ? 14 : 9;
      case 'evergreenValue':
        return topic.toLowerCase().includes('care') || topic.toLowerCase().includes('density') ? 17 : 8;
      case 'productionValue':
        return session.promptFrameworkId ? 15 : 5;
      default:
        return 0;
    }
  };

  const scores = (Object.keys(CONTENT_SCORE_LABELS) as ContentScoreId[]).reduce(
    (acc, id) => {
      acc[id] = Math.min(100, base + boost(id));
      return acc;
    },
    {} as Record<ContentScoreId, number>
  );

  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  return { overallScore, scores };
}
