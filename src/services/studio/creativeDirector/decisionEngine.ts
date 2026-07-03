import { ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS } from '../../../utils/adminStudioContentBrainShowBibleDemo';
import { ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS, ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS } from '../../../utils/adminStudioContentBrainCatalogDemo';
import { ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS } from '../../../utils/adminStudioContentBrainPromptFrameworksDemo';
import {
  SHOW_RECOMMENDATION_RULES,
  type ContentPurposeId,
} from '../../../utils/adminStudioCreativeDirectorDemo';
import type { CreativeDirectorSession, DecisionRecommendation, ShowRecommendation } from './types';

export function recommendShowForTopic(topic: string): ShowRecommendation {
  const lower = topic.toLowerCase();
  let best = SHOW_RECOMMENDATION_RULES[0];
  let bestScore = 0;

  for (const rule of SHOW_RECOMMENDATION_RULES) {
    const hits = rule.keywords.filter((kw) => lower.includes(kw)).length;
    const score = hits > 0 ? rule.confidence + hits * 2 : 0;
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }

  const show = ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === best.showId);
  return {
    showId: best.showId,
    showName: show?.name ?? best.showId.toUpperCase(),
    reason: best.reason,
    confidence: best.confidence,
  };
}

function inferPurpose(topic: string): ContentPurposeId {
  const lower = topic.toLowerCase();
  if (lower.includes('launch') || lower.includes('drop')) return 'product-launch';
  if (lower.includes('campaign') || lower.includes('shop')) return 'promotional';
  if (lower.includes('forecast') || lower.includes('season') || lower.includes('summer') || lower.includes('fall')) return 'seasonal';
  if (lower.includes('member') || lower.includes('community') || lower.includes('challenge')) return 'community';
  if (lower.includes('learn') || lower.includes('density') || lower.includes('lace') || lower.includes('care')) return 'educational';
  if (lower.includes('entertain') || lower.includes('slay')) return 'entertainment';
  return 'editorial';
}

export function buildDecisionRecommendation(session: CreativeDirectorSession): DecisionRecommendation {
  const autoShow = recommendShowForTopic(session.topic);
  const showRec = session.showRecommendationOverride && session.manualShowId
    ? (() => {
        const show = ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === session.manualShowId);
        return {
          showId: session.manualShowId,
          showName: show?.name ?? session.manualShowId,
          reason: 'MANUAL OVERRIDE — ADMIN SELECTED SHOW.',
          confidence: 100,
        };
      })()
    : autoShow;

  const showBible = ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === showRec.showId);
  const effectiveShowId = session.selectedShowId || showRec.showId;
  const effectiveShow = ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === effectiveShowId) ?? showBible;

  const cta = ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS.find((c) => c.id === session.primaryCtaId);
  const products = session.featuredProductIds
    .map((id) => ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS.find((p) => p.id === id))
    .filter(Boolean);
  const framework = ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS.find((p) => p.id === session.promptFrameworkId);

  const purpose = session.contentPurpose || inferPurpose(session.topic);

  const activeDistribution = (Object.entries(session.distribution) as Array<[string, boolean]>)
    .filter(([, on]) => on)
    .map(([id]) => id as DecisionRecommendation['distribution'][number]);

  return {
    show: showRec,
    contentPurpose: purpose,
    primaryCtaId: session.primaryCtaId,
    primaryCtaLabel: cta?.title ?? 'SELECT CTA',
    featuredProductIds: session.featuredProductIds,
    featuredProductNames: products.map((p) => p!.name),
    rewardId: session.rewardId,
    rewardLabel: session.rewardId.replace(/-/g, ' ').toUpperCase(),
    membershipTier: session.membershipTier || effectiveShow?.membershipTier || 'ALL MEMBERS',
    environment: session.environment || effectiveShow?.studioEnvironment || 'MARBLE STUDIO',
    promptFrameworkId: session.promptFrameworkId,
    promptFrameworkLabel: framework?.title ?? 'SELECT FRAMEWORK',
    visualLanguage: session.visualLanguage || effectiveShow?.visualStyle || 'EDITORIAL LUXURY',
    distribution: activeDistribution,
  };
}

export function syncSessionFromRecommendation(
  session: CreativeDirectorSession,
  applyAutoShow = !session.showRecommendationOverride
): CreativeDirectorSession {
  const rec = buildDecisionRecommendation(session);
  return {
    ...session,
    selectedShowId: applyAutoShow ? rec.show.showId : session.selectedShowId,
    contentPurpose: session.contentPurpose || rec.contentPurpose,
    environment: session.environment || rec.environment,
    visualLanguage: session.visualLanguage || rec.visualLanguage,
  };
}
