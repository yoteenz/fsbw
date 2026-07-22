import type { LoungeTvAccessType } from './loungeTvContent';

/** Visual status chips — metadata only; cards map to existing chrome. */
export type LoungeTvContentStatusFlag =
  | 'new'
  | 'just-added'
  | 'trending'
  | 'popular'
  | 'continue-watching'
  | 'watched'
  | 'completed'
  | 'updated'
  | 'featured'
  | 'limited-time'
  | 'members-only'
  | 'free-preview'
  | 'premiere'
  | 'coming-soon';

/** Premium access model (no backend enforcement). */
export type LoungeTvContentAccessMethod =
  | 'free'
  | 'member'
  | 'slay-ticket'
  | 'purchased'
  | 'bundle-included'
  | 'early-access'
  | 'invite-only'
  | 'limited-release';

export type LoungeTvContentLifecycleState =
  | 'draft'
  | 'scheduled'
  | 'premiering'
  | 'published'
  | 'archived'
  | 'seasonal'
  | 'hidden'
  | 'expired';

export type LoungeTvTrailerKind =
  | 'official'
  | 'season'
  | 'course-preview'
  | 'launch'
  | 'product';

export type LoungeTvTrailerRef = {
  kind: LoungeTvTrailerKind;
  title: string;
  videoSrc: string;
  runtime?: string;
  posterSrc?: string;
};

/** Per-title artwork — each role can point to a distinct asset. */
export type LoungeTvContentArtwork = {
  landscapeCover?: string;
  portraitCover?: string;
  heroBanner?: string;
  episodeThumbnail?: string;
  previewImage?: string;
  hoverImage?: string;
};

/** Episode-level experience (placeholders allowed). */
export type LoungeTvEpisodeExperience = {
  description?: string;
  learningObjectives?: string[];
  toolsNeeded?: string[];
  productsMentioned?: string[];
  estimatedSkillLevel?: string;
  runtimeMinutes?: number;
  relatedEpisodeIds?: string[];
  nextEpisodeId?: string;
  previousEpisodeId?: string;
  transcriptPlaceholder?: boolean;
  bookmarksPlaceholder?: boolean;
  notesPlaceholder?: boolean;
  resourcesPlaceholder?: boolean;
  downloadsPlaceholder?: boolean;
};

/** Taxonomy + future recommendation graph. */
export type LoungeTvContentRelationships = {
  seriesId?: string;
  category?: string;
  skill?: string[];
  hairTexture?: string[];
  hairLength?: string[];
  difficulty?: string;
  productSku?: string[];
  collectionIds?: string[];
  creator?: string;
  host?: string;
  topic?: string[];
};

export type LoungeTvProductIntegration = {
  unitKey?: string;
  recommendedLessonIds?: string[];
  recommendedStylingIds?: string[];
  maintenanceGuideIds?: string[];
  installationGuideIds?: string[];
  relatedProductIds?: string[];
  accessoryIds?: string[];
  suggestedAddOnIds?: string[];
};

/** Future series detail page — data only, no UI. */
export type LoungeTvSeriesPageFuture = {
  heroArtwork?: string;
  description?: string;
  host?: string;
  difficulty?: string;
  estimatedCompletionMinutes?: number;
  episodeCount?: number;
  prerequisiteSeriesIds?: string[];
  relatedSeriesIds?: string[];
  studentsAlsoWatchedSeriesIds?: string[];
};

export type LoungeTvSeriesEpisodeRef = {
  episodeNumber: number;
  episodeTitle: string;
  contentPackId: string;
};

/** Streaming series (Season → Episodes). */
export type LoungeTvStreamSeries = {
  id: string;
  title: string;
  host?: string;
  season: number | string;
  description?: string;
  difficulty?: string;
  episodes: LoungeTvSeriesEpisodeRef[];
  page?: LoungeTvSeriesPageFuture;
  trailers?: LoungeTvTrailerRef[];
};

export type LoungeTvContentCollection = {
  id: string;
  title: string;
  description?: string;
  packIds: string[];
  seasonal?: boolean;
};

/** Future achievements — metadata only. */
export type LoungeTvCourseAchievementFuture = {
  completionBadge?: string;
  certificateEligible?: boolean;
  digitalRewardId?: string;
  loyaltyPoints?: number;
  exclusiveWallpaperId?: string;
  bonusLessonId?: string;
  discountCodePlaceholder?: string;
  ticketReward?: number;
};

/** Analytics seed fields — no tracking implementation. */
export type LoungeTvAnalyticsSeed = {
  views?: number;
  completionRate?: number;
  averageWatchTimeSec?: number;
  likes?: number;
  bookmarks?: number;
  shares?: number;
  mostReplayedSegmentSec?: number;
  dropOffPointSec?: number;
  ticketRedemptions?: number;
};

/** Search / filter index (future UI). */
export type LoungeTvContentFilterFacets = {
  seriesId?: string;
  difficulty?: string;
  runtimeBucket?: 'short' | 'medium' | 'long';
  hairTexture?: string[];
  category?: string;
  host?: string;
  flags?: LoungeTvContentStatusFlag[];
  accessMethods?: LoungeTvContentAccessMethod[];
  lifecycle?: LoungeTvContentLifecycleState;
};

/** Grouped streaming metadata on a content pack. */
export type LoungeContentStreamingMeta = {
  seriesId?: string;
  artwork?: LoungeTvContentArtwork;
  statusFlags?: LoungeTvContentStatusFlag[];
  accessMethods?: LoungeTvContentAccessMethod[];
  lifecycle?: {
    state?: LoungeTvContentLifecycleState;
    launchDate?: string;
    expirationDate?: string;
  };
  episode?: LoungeTvEpisodeExperience;
  relationships?: LoungeTvContentRelationships;
  productIntegration?: LoungeTvProductIntegration;
  achievementsFuture?: LoungeTvCourseAchievementFuture;
  analyticsSeed?: LoungeTvAnalyticsSeed;
  trailers?: LoungeTvTrailerRef[];
  /** Runtime in seconds for progress math. */
  durationSec?: number;
};

export type LoungeTvPersonalizedRailKey =
  | 'psa-picks-for-you'
  | 'continue-your-journey'
  | 'because-you-watched'
  | 'recommended-next'
  | 'finish-what-you-started'
  | 'recently-unlocked'
  | 'recently-purchased'
  | 'based-on-favorites'
  | 'complete-your-course'
  | 'member-exclusives'
  | 'keep-watching'
  | 'trending-this-week';

export type LoungeTvPsaHostContext =
  | 'featured-open'
  | 'returning-viewer'
  | 'course-almost-done'
  | 'next-class'
  | 'member-exclusive-waiting';

/** Legacy tile access + streaming access methods. */
export type LoungeTvContentAccessDescriptor = {
  accessType?: LoungeTvAccessType;
  ticketCost?: number;
  membershipRequired?: boolean;
  methods: LoungeTvContentAccessMethod[];
};
