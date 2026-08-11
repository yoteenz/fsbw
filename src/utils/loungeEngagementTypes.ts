export const LOUNGE_ENGAGEMENT_CONTENT_TYPES = [
  'content_pack',
  'psa_episode',
  'slay_tip',
  'care_lesson',
] as const;

export type LoungeEngagementContentType = (typeof LOUNGE_ENGAGEMENT_CONTENT_TYPES)[number];

export type LoungeEngagementContentKey = {
  contentType: LoungeEngagementContentType;
  contentId: string;
};

export type LoungeEngagementSummary = {
  contentType: LoungeEngagementContentType;
  contentId: string;
  qualifiedViewCount: number;
  helpfulCount: number;
  commentCount: number;
  viewerHelpful?: boolean;
};

export function engagementItemKey(item: LoungeEngagementContentKey): string {
  return `${item.contentType}:${item.contentId}`;
}

/** Primary engagement key for content packs. */
export function engagementKeyForPack(packId: string): LoungeEngagementContentKey {
  return { contentType: 'content_pack', contentId: packId };
}

/** PSA episodes share pack id when linked (progress/bookmark parity). */
export function engagementKeyForPsaEpisode(episode: {
  id: string;
  linkedContentPackId?: string;
}): LoungeEngagementContentKey {
  const contentId = episode.linkedContentPackId ?? episode.id;
  const contentType: LoungeEngagementContentType = episode.linkedContentPackId
    ? 'content_pack'
    : 'psa_episode';
  return { contentType, contentId };
}

export function engagementKeyForSlayTip(tip: { id: string; linkedContentPackId?: string }): LoungeEngagementContentKey {
  const contentId = tip.linkedContentPackId ?? tip.id;
  return {
    contentType: tip.linkedContentPackId ? 'content_pack' : 'slay_tip',
    contentId,
  };
}

/**
 * Qualified view threshold (client-side preview; server validates):
 * - Default: min(30s, 20% duration), whichever occurs first
 * - Short content (<60s): min(15s, 50% duration)
 */
export function qualifiedViewThresholdSec(durationSec: number): number {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return 30;
  if (durationSec < 60) {
    return Math.min(15, Math.max(1, Math.floor(durationSec * 0.5)));
  }
  return Math.min(30, Math.max(1, Math.floor(durationSec * 0.2)));
}

/**
 * View deduplication (documented):
 * Server enforces one qualified view per viewer per content per 7-day rolling window.
 * Authenticated viewers use user_id; anonymous viewers use a stable viewerKey in localStorage.
 */

/**
 * Public comment count includes visible top-level comments AND visible replies.
 */
