import type { CommerceLinkSet } from '../../../config/commerce';
import type { EpisodeReleaseState } from '../../../content/education/types';
import type { CareApplicability } from '../../../content/education/care/careApplicability';
import type { CareTextureFamily, WigUnitSlug } from '../../../content/education/care/productCatalog';
import type {
  ContinuityStage,
  DemonstrationUnitStrategy,
  SignatureUnitEducationMedia,
} from '../../../content/education/signature-units/types';

export const PSA_TODAY_SERIES = 'psa-today' as const;

export type PSATodayAccessType = 'free' | 'slay-ticket' | 'member' | 'purchase' | 'mixed';

export type PSAEpisodeChapterType =
  | 'camera-a'
  | 'camera-a-transition'
  | 'class-kit'
  | 'camera-b'
  | 'macro'
  | 'recap'
  | 'outro';

export type PSAChapterSharedModule = {
  mediaUrl?: string;
  posterUrl?: string;
  learningObjective?: string;
};

export type PSAChapterUnitModule = {
  mediaUrl?: string;
  posterUrl?: string;
  insertLabel?: string;
};

/** Named slot on SignatureUnitEducationProfile.educationMedia for dynamic resolution. */
export type PSAUnitMediaSlot = keyof SignatureUnitEducationMedia;

export type PSAEpisodeChapter = {
  id: string;
  /** Ordered position within the Episode (1-based editorial number). */
  order?: number;
  label: string;
  type: PSAEpisodeChapterType;
  /** Timestamp on master video (seconds) — strategy A. */
  startSeconds?: number;
  endSeconds?: number;
  title?: string;
  description?: string;
  learningObjective?: string;
  gated?: boolean;
  /** Separate clip URL — strategy B. */
  mediaUrl?: string;
  posterUrl?: string;
  /** Universal content shared across all unit contexts. */
  sharedModule?: PSAChapterSharedModule;
  /** Per-unit media inserts — keyed by canonical unit slug. */
  unitSpecificModules?: Partial<Record<WigUnitSlug, PSAChapterUnitModule>>;
  /** Optional texture-family fallback when unit insert missing. */
  textureFamilyModules?: Partial<Record<CareTextureFamily, PSAChapterUnitModule>>;
  allowTextureFamilyFallback?: boolean;
  /** Resolve insert from education profile media slot when module URLs absent. */
  unitMediaSlot?: PSAUnitMediaSlot;
  fallbackMediaUrl?: string;
  fallbackPosterUrl?: string;
  /** Social/promotional extract readiness — not Slay Tips. */
  socialExtractThemes?: string[];
};

export type PSAEpisodeUnitEducationConfig = {
  supportsDynamicUnits?: boolean;
  supportsGeneralMode?: boolean;
  supportsFollowThisUnit?: boolean;
  continuityStage?: ContinuityStage;
  demonstrationUnitStrategy?: DemonstrationUnitStrategy;
  preferredDemonstrationUnitIds?: WigUnitSlug[];
  demonstrationUnitReason?: string;
  /** Editorial curriculum approval marker (dev tooling). */
  curriculumApprovalNote?: string;
};

export type PSAClassKitItem = CommerceLinkSet & {
  id: string;
  order: number;
  name: string;
  description?: string;
  required: boolean;
  imageUrl?: string;
  hotspot?: { x: number; y: number };
};

export type PSAClassKit = {
  id: string;
  title?: string;
  introText?: string;
  flatLayImageUrl?: string;
  flatLayVideoUrl?: string;
  tools: PSAClassKitItem[];
  fullKit?: CommerceLinkSet & {
    label: string;
  };
};

export type PSATodayCameraA = {
  previewVideoUrl?: string;
  posterUrl?: string;
  durationSeconds?: number;
  socialReusable?: boolean;
  /** End of preview / start of walk-off transition (seconds). */
  transitionAtSeconds?: number;
};

export type PSATodayCameraB = {
  fullLessonVideoUrl?: string;
  posterUrl?: string;
};

export type PSATodaySocialMeta = {
  socialClipTitle?: string;
  socialCaption?: string;
  socialAspectVariants?: Array<'9x16' | '1x1' | '4x5'>;
  socialVideoUrl9x16?: string;
  socialVideoUrl1x1?: string;
  socialVideoUrl4x5?: string;
};

export type PSATodayEpisode = {
  id: string;
  slug: string;
  series: typeof PSA_TODAY_SERIES;
  episodeNumber: number;
  seasonNumber?: number;
  /** Mastery → Season → Episode hierarchy. */
  masteryId?: string;
  seasonId?: string;
  seasonEpisodeNumber?: number;
  /** Per-episode ticket cost (overrides slayTicketCost when set). */
  episodeTicketCost?: number;
  releaseAt?: string;
  announcementAt?: string;
  previewAvailableAt?: string;
  releaseState?: EpisodeReleaseState;
  title: string;
  subtitle?: string;
  shortDescription: string;
  fullDescription?: string;
  category?: string;
  tags?: string[];
  runtimeSeconds?: number;
  featured?: boolean;
  published?: boolean;
  comingSoon?: boolean;
  accessType: PSATodayAccessType;
  slayTicketCost?: number;
  /** Links ticket unlock + lounge content pack when present. */
  linkedContentPackId?: string;
  cameraA?: PSATodayCameraA;
  classKit?: PSAClassKit;
  cameraB?: PSATodayCameraB;
  chapters?: PSAEpisodeChapter[];
  /** Dynamic Signature Unit education — ONE canonical episode, many unit contexts. */
  unitEducation?: PSAEpisodeUnitEducationConfig;
  /** Rule-based complimentary Care entitlement when product-qualifying. */
  careApplicability?: CareApplicability;
  /** Teaching uses Class Unit specs — not customer's Build-A-Wig configuration. */
  classUnitTeaching?: {
    usesSignatureUnitClassSpec: true;
    note?: string;
  };
  thumbnailUrl?: string;
  heroPosterUrl?: string;
  releaseDate?: string;
  requiresPreparationCheck?: boolean;
  /** Paid lesson watch entitlement — defaults to 3 watches / 33.333% / 1 calendar year. */
  watchPolicy?: PSAWatchPolicy;
  /** Education content family — topical grouping with companion Slay Tips. */
  contentFamilyId?: string;
  /** Curriculum Bible entry id — editorial link (internal). */
  curriculumBibleId?: string;
  pillar?: string;
  educationOwnership?: {
    ownsConcepts?: string[];
    referencesConcepts?: string[];
    excludesConcepts?: string[];
  };
  prerequisiteContentIds?: string[];
  recommendedNextIds?: string[];
  relatedContentIds?: string[];
  campaignId?: string;
  social?: PSATodaySocialMeta;
  supabaseId?: string;
};

export type PSAWatchPolicy = {
  includedWatches?: number;
  qualificationPercent?: number;
  accessDurationYears?: number;
};

export type PSAEntitlementStatus = 'active' | 'watches-exhausted' | 'expired' | 'revoked';

export type PSAEpisodeEntitlement = {
  id: string;
  episodeId: string;
  userId: string;
  accessSource: 'slay-ticket' | 'member' | 'purchase' | 'admin' | 'free' | 'season-pass';
  redeemedAt: string;
  expiresAt: string;
  totalWatches: number;
  watchesUsed: number;
  watchesRemaining: number;
  status: PSAEntitlementStatus;
  pendingWatchSeconds: number;
  slayTicketCostAtRedemption?: number;
  contentId: string;
};

export type PSAWatchSession = {
  sessionId: string;
  episodeId: string;
  entitlementId: string;
  userId: string;
  startedAt: string;
  lastActiveAt: string;
  actualWatchedSeconds: number;
  qualificationThresholdSeconds: number;
  qualified: boolean;
  consumedWatchAt?: string;
  closedAt?: string;
};

export type EpisodeAccessState = {
  episodeId: string;
  userId?: string;
  accessGranted: boolean;
  accessSource?: 'free' | 'slay-ticket' | 'member' | 'purchase' | 'admin';
  redeemedAt?: string;
};

export type PSAEpisodeProgress = {
  episodeId: string;
  userId?: string;
  progressSeconds: number;
  durationSeconds?: number;
  completed: boolean;
  lastWatchedAt: number;
  currentChapterId?: string;
};

export type PSATodayPlayerPhase =
  | 'camera-a-preview'
  | 'camera-a-transition'
  | 'access-gate'
  | 'class-kit'
  | 'ready-check'
  | 'camera-b-lesson'
  | 'complete';

export type PSATodayMediaSlotKey =
  | 'cameraAPreview'
  | 'cameraAPoster'
  | 'cameraAThumbnail'
  | 'classKitImage'
  | 'classKitVideo'
  | 'cameraBVideo'
  | 'cameraBPoster'
  | 'heroPoster'
  | 'thumbnail'
  | 'mobilePoster';
