/**
 * Shared educational content models — PSA Today, Slay Tips, Content Families.
 * Curriculum data lives under src/content/education/; UI imports these types.
 */


import type {
  OwnedUnitCustomerConfiguration,
  OwnedUnitConstructionDna,
  OwnedUnitTransformationState,
} from './care/ownedUnitModel';

export const EDUCATION_PILLARS = ['lace', 'color', 'style', 'care'] as const;
export type EducationPillar = (typeof EDUCATION_PILLARS)[number] | string;

/** Editorial metadata — helps prevent curriculum overlap (not customer-facing by default). */
export type EducationOwnership = {
  ownsConcepts?: string[];
  referencesConcepts?: string[];
  excludesConcepts?: string[];
};

/** Scrapbook access — NOT PSA Today video watch policy. */
export type ScrapbookAccessPolicy = {
  accessDurationYears?: number;
  /** null = unlimited views within access period; number = optional future cap. */
  viewLimit?: number | null;
};

export type EducationContentFamily = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  pillar: EducationPillar;
  primaryPSAEpisodeId?: string;
  slayTipIds?: string[];
  relatedPSAEpisodeIds?: string[];
  tags?: string[];
  published?: boolean;
  releaseDate?: string;
  campaignId?: string;
};

export type SlayTipPageLayout =
  | 'photo-focus'
  | 'text-focus'
  | 'split'
  | 'comparison'
  | 'step'
  | 'tip'
  | 'warning';

export type SlayTipPage = {
  id: string;
  order: number;
  imageUrl?: string;
  heading?: string;
  body?: string;
  callout?: string;
  layout?: SlayTipPageLayout;
  altText?: string;
};

/** Editorial image roles for Slay Tip detail hero + macro modules. */
export type SlayTipEditorialImageRole =
  | 'hero'
  | 'macro'
  | 'detail'
  | 'comparisonLeft'
  | 'comparisonRight'
  | 'annotation'
  | 'supporting';

export type SlayTipImageAnnotation = {
  id: string;
  label?: string;
  /** Percentage position (0–100) within image frame. */
  x: number;
  y: number;
  marker?: number;
};

export type SlayTipEditorialImage = {
  id: string;
  src: string;
  alt?: string;
  caption?: string;
  role?: SlayTipEditorialImageRole;
  objectPosition?: string;
  order?: number;
  annotations?: SlayTipImageAnnotation[];
};

export type SlayTipDeeperContentType = 'episode' | 'season' | 'mastery';

export type SlayTipDeeperContent = {
  contentType: SlayTipDeeperContentType;
  episodeId?: string;
  seasonId?: string;
  masteryId?: string;
  /** Optional display overrides when routing target lacks copy. */
  title?: string;
  description?: string;
};

export type SlayTipLookCloserItem = {
  number: string;
  label: string;
  caption: string;
  imageId?: string;
  image?: SlayTipEditorialImage;
};

export type SlayTipArticleModule =
  | { type: 'quickRead'; body: string }
  | {
      type: 'diagnosticRow';
      seeing: string;
      notToDo: string;
      move: string;
    }
  | { type: 'lookCloser'; items: SlayTipLookCloserItem[] }
  | { type: 'slayerNote'; number?: string; body: string }
  | {
      type: 'comparison';
      leftLabel: string;
      rightLabel: string;
      leftImageId?: string;
      rightImageId?: string;
      leftImage?: SlayTipEditorialImage;
      rightImage?: SlayTipEditorialImage;
    }
  | { type: 'takeaway'; body: string }
  | { type: 'text'; heading?: string; body: string }
  | {
      type: 'image';
      image: SlayTipEditorialImage;
      layout?: 'wide' | 'tall' | 'standard';
    }
  | { type: 'callout'; body: string };

export type SlayTipFormat = 'scrapbook';

export type SlayTip = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription: string;
  fullDescription?: string;
  pillar: EducationPillar;
  contentFamilyId?: string;
  /** Topical link — companion class, NOT a derivative/excerpt. */
  relatedPSAEpisodeId?: string;
  /** Mastery / Season companion linkage. */
  masteryId?: string;
  seasonId?: string;
  relatedEpisodeId?: string;
  tags?: string[];
  format: SlayTipFormat;
  slayTicketCost: number;
  published?: boolean;
  comingSoon?: boolean;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  pages?: SlayTipPage[];
  /** Editorial hero collage — dominant + supporting macro stills. */
  heroMedia?: SlayTipEditorialImage[];
  /** Modular editorial article blocks rendered as one vertical scroll. */
  modules?: SlayTipArticleModule[];
  /** Related micro-guide for TRY THIS NEXT footer. */
  relatedSlayTipId?: string;
  /** Bridge into PSA Today / Mastery for GO DEEPER footer. */
  deeperContent?: SlayTipDeeperContent;
  releaseDate?: string;
  campaignId?: string;
  /** Optional lounge unlock id when distinct from tip id. */
  linkedContentPackId?: string;
  /** Optional authored read duration label (e.g. "3 MIN"). Estimated from pages when omitted. */
  readTime?: string;
  /**
   * Curiosity hook for locked cards and public browse.
   * Must not reveal the actionable solution — sell the information gap.
   */
  publicTitle?: string;
  /**
   * Unlocked reveal — the concise actionable tip ("THE TIP") shown after Slay Ticket spend.
   * Distinct from {@link publicTitle} and from full scrapbook {@link pages} body content.
   */
  revealTitle?: string;
  /**
   * Non-spoiler preview for locked state — establishes relevance without stating the answer.
   * Complements {@link publicTitle}; distinct from paid {@link pages} instruction.
   */
  previewCopy?: string;
  /** @deprecated Use {@link publicTitle}. Kept for legacy records pending editorial migration. */
  cardTitle?: string;
  accessPolicy?: ScrapbookAccessPolicy;
  educationOwnership?: EducationOwnership;
  prerequisiteContentIds?: string[];
  recommendedNextIds?: string[];
  relatedContentIds?: string[];
};

/** Union id prefix helpers for cross-content relationships. */
export type EducationContentRef =
  | { type: 'psa-today'; id: string }
  | { type: 'slay-tip'; id: string }
  | { type: 'care-guide'; id: string }
  | { type: 'care-lesson'; id: string };

export type CareGuideFormat = 'video' | 'photo-guide' | 'mixed';

export type CareGuideVisibility =
  | 'owner-library-only'
  | 'owned-product-context'
  | 'discoverable-locked'
  | 'hidden-until-entitled';

/** Rule-based matching against YOUR UNIT — evaluated at access time (future-content aware). */
export type CareGuideApplicability = import('./care/careApplicability').CareApplicability;

export type CareGuide = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription?: string;
  contentType: 'care-guide';
  accessType: 'qualifying-product';
  format: CareGuideFormat;
  videoUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  applicability?: CareGuideApplicability;
  /** @deprecated use applicability */
  careApplicability?: CareGuideApplicability;
  published?: boolean;
  comingSoon?: boolean;
  sortOrder?: number;
  relatedCareMasteryIds?: string[];
  visibility?: CareGuideVisibility;
  /** Optional topical PSA Today / Care Mastery episode ids for "Go Deeper" */
  relatedContentIds?: string[];
  tags?: string[];
  educationOwnership?: EducationOwnership;
  productPageBadge?: string;
  /** Legacy category label for Library grouping */
  category?: CareLessonCategory;
  pillar?: 'care';
  /** Legacy fields — prefer applicability */
  applicableProductTypes?: string[];
  applicableTextures?: string[];
};

export type CareLessonCategory =
  | 'washing'
  | 'conditioning'
  | 'detangling'
  | 'drying'
  | 'storage'
  | 'maintenance'
  | 'refresh'
  | 'protection'
  | string;

/** @deprecated Use CareGuide — complimentary owner-support content, not Care Mastery. */
export type CareLesson = CareGuide & {
  shortDescription: string;
  pillar: 'care';
  category: CareLessonCategory;
};

export type CareEligibilityRule = {
  id: string;
  careContentId: string;
  productTypes?: string[];
  productIds?: string[];
  baseUnitIds?: string[];
  textures?: string[];
  textureFamilies?: string[];
  categories?: string[];
  universal?: boolean;
  requiresPurchase: boolean;
};

export type CareEntitlementStatus = 'active' | 'revoked' | 'refunded';

export type CarePurchaseProfile = {
  id: string;
  userId: string;
  orderId: string;
  orderLineKey: string;
  productName: string;
  productType: string;
  baseUnitId?: string;
  textureFamily?: string;
  grantedAt: string;
  status: CareEntitlementStatus;
  /** Immutable order-time Build-A-Wig / unit configuration snapshot. */
  configurationSnapshot?: OwnedUnitCustomerConfiguration;
  constructionDna?: OwnedUnitConstructionDna;
  transformationState?: OwnedUnitTransformationState;
  /** Lounge YOUR UNIT hub label */
  displayLabel?: string;
};

// ---------------------------------------------------------------------------
// Curriculum Bible — editorial registry (internal metadata; not customer UI)
// ---------------------------------------------------------------------------

export type CurriculumContentType = 'psa-today' | 'slay-tip' | 'care' | 'care-route';

export type CurriculumRole =
  | 'foundation'
  | 'customization'
  | 'diagnostic'
  | 'preparation'
  | 'installation'
  | 'finishing'
  | 'troubleshooting'
  | 'removal'
  | 'restoration'
  | 'maintenance'
  | string;

export type CurriculumStatus = 'planned' | 'in-development' | 'production' | 'published';

export type CurriculumKitRequirement = {
  id: string;
  name: string;
  required?: boolean;
  notes?: string;
};

/** Planning slot for future companion Slay Tips — not a published tip. */
export type CurriculumConceptSlot = {
  id: string;
  title: string;
  status?: 'planned' | 'in-development';
};

export type CurriculumLifecyclePhase =
  | 'foundation'
  | 'customization'
  | 'preparation'
  | 'installation-finish'
  | 'troubleshooting'
  | 'removal-restoration'
  | 'preservation';

export type CurriculumBibleEntry = {
  id: string;
  curriculumCode: string;
  pillar: EducationPillar;
  contentType: CurriculumContentType;
  title: string;
  role: CurriculumRole;
  lifecyclePhase?: CurriculumLifecyclePhase;
  primaryLearningObjective: string;
  /** Mastery → Season → Episode hierarchy (editorial + programming). */
  masteryId?: string;
  seasonId?: string;
  seasonEpisodeNumber?: number;
  relatedMasteryIds?: string[];
  /** Link to published runtime content when it exists (PSA episode id, Slay Tip id, Care lesson id). */
  linkedContentId?: string;
  prerequisiteContentIds?: string[];
  recommendedNextIds?: string[];
  ownsConcepts: string[];
  referencesConcepts?: string[];
  excludesConcepts?: string[];
  classKitRequirements?: CurriculumKitRequirement[];
  cameraAResponsibility?: string[];
  cameraBDemonstration?: string[];
  cameraBVisualRequirements?: string[];
  criticalSuccessInformation?: string[];
  /** Published companion Slay Tip ids only. */
  companionSlayTipIds?: string[];
  /** Editorial planning slots — not validated as published tips. */
  companionSlayTipConceptSlots?: CurriculumConceptSlot[];
  relatedCareIds?: string[];
  relatedPSAEpisodeIds?: string[];
  /** Diagnostic routing targets (curriculum bible entry ids). */
  diagnosticRouteIds?: string[];
  antiOverlapNotes?: string[];
  status: CurriculumStatus;
  editorialNotes?: string[];
};

export type CurriculumOverlapIssueKind =
  | 'duplicate-ownership'
  | 'own-exclude-conflict'
  | 'broken-prerequisite'
  | 'broken-related-content'
  | 'missing-companion-slay-tip'
  | 'missing-related-care'
  | 'missing-linked-content'
  | 'duplicate-curriculum-code';

export type CurriculumOverlapIssue = {
  kind: CurriculumOverlapIssueKind;
  entryId: string;
  curriculumCode: string;
  message: string;
  details?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Mastery → Season → Episode hierarchy
// ---------------------------------------------------------------------------

export type MasteryPillar = 'lace' | 'color' | 'install' | 'care' | string;

export type MasteryStatus = 'planned' | 'active' | 'completed' | 'archived';

export type EducationMastery = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  pillar: MasteryPillar;
  seasonIds: string[];
  thumbnailUrl?: string;
  heroImageUrl?: string;
  status: MasteryStatus;
  published?: boolean;
  sortOrder?: number;
  /** Care mastery access strategy — dual-access supports paid + qualifying product paths. */
  careAccessModel?: 'purchase-included' | 'dual-access';
};

export type SeasonCurriculumStatus =
  | 'curriculum_pending'
  | 'partially_approved'
  | 'approved'
  | 'releasing';

export type SeasonAccessConfig = {
  /** Slay Ticket episode + Season Pass commerce enabled. */
  paidEducationEnabled?: boolean;
  /** Complimentary full-season from qualifying Frontal Slayer hair/unit orders. */
  qualifyingProductEntitlementEnabled?: boolean;
};

export type SeasonAccessSource =
  | 'slay-ticket-season'
  | 'slay-ticket-episode'
  | 'qualifying-product'
  | 'promotion'
  | 'admin'
  | 'member'
  | 'legacy';

export type SeasonAccessScope = 'none' | 'episode' | 'season';

export type ResolvedSeasonAccessDisplayState =
  | 'locked'
  | 'purchasable'
  | 'owned'
  | 'included-with-purchase'
  | 'season-pass-active';

export type ResolvedPsaSeasonAccess = {
  seasonId: string;
  hasAccess: boolean;
  accessScope: SeasonAccessScope;
  accessSource: SeasonAccessSource | null;
  seasonOwned: boolean;
  episodeOwned: boolean;
  complimentary: boolean;
  qualifyingOrderIds?: string[];
  purchasedAt?: string;
  grantedAt?: string;
  displayState: ResolvedSeasonAccessDisplayState;
  canPurchaseSeasonPass: boolean;
  canPurchaseEpisode: boolean;
  blockReason?: 'already-entitled' | 'curriculum-pending';
  curriculumStatus?: SeasonCurriculumStatus;
};

export type SeasonReleaseStrategy = 'scheduled' | 'all-at-once' | 'manual';

export type SeasonStatus = 'planned' | 'announced' | 'releasing' | 'complete' | 'archived';

/** Customer-facing season availability derived from episode release data + editorial status. */
export type SeasonCustomerReleaseState =
  | 'available'
  | 'upcoming'
  | 'partially_released'
  | 'completed';

export type EducationSeasonEpisodeSlot = {
  slotId: string;
  curriculumBibleId: string;
  seasonEpisodeNumber: number;
  /** Published PSA Today episode id when runtime exists. */
  psaEpisodeId?: string;
  /** Planned care lesson id for Care mastery seasons. */
  careLessonId?: string;
};

export type SeasonCertificationCompletionRequirement = 'all-required-episodes';

/** Explicit opt-in — not every Season issues a credential. */
export type SeasonCertificationConfig = {
  enabled: boolean;
  title?: string;
  requiredEpisodeIds?: string[];
  completionRequirement?: SeasonCertificationCompletionRequirement;
  collectibleAssetId?: string;
  /** Curriculum version at issuance — historical certs remain valid when curriculum evolves. */
  seasonVersion?: string;
};

export type EducationSeason = {
  id: string;
  slug: string;
  masteryId: string;
  seasonNumber: number;
  title: string;
  subtitle?: string;
  description?: string;
  /** One-line season thesis for mastery detail cards. */
  shortPremise?: string;
  learningObjective: string;
  episodeSlots: EducationSeasonEpisodeSlot[];
  releaseStrategy: SeasonReleaseStrategy;
  releaseCadence?: {
    frequency?: 'weekly' | 'custom';
    releasesPerWeek?: number;
  };
  seasonTicketCost?: number;
  allowEpisodePurchase: boolean;
  allowSeasonPass: boolean;
  posterUrl?: string;
  heroImageUrl?: string;
  releaseStartDate?: string;
  releaseEndDate?: string;
  status: SeasonStatus;
  published?: boolean;
  /** When false, season is hidden from customer mastery pages while remaining in data. */
  customerVisible?: boolean;
  campaignId?: string;
  certification?: SeasonCertificationConfig;
  /** Editorial — curriculum not approved for customer-facing episodes yet. */
  curriculumStatus?: SeasonCurriculumStatus;
  /** Season-level entitlement strategy (paid vs product-included). */
  accessConfig?: SeasonAccessConfig;
};

export type EducationCertificationStatus = 'active' | 'revoked';

export type EducationCertification = {
  id: string;
  userId: string;
  masteryId: string;
  seasonId: string;
  certificationCode: string;
  title: string;
  issuedAt: string;
  status: EducationCertificationStatus;
  seasonVersion?: string;
  completedEpisodeIds: string[];
  collectibleId?: string;
  certificationRevealSeenAt?: string | null;
  metadata?: {
    masteryTitle?: string;
    seasonTitle?: string;
    seasonNumber?: number;
  };
};

export type EducationCollectibleType = 'season-certification' | string;

export type EducationCollectibleDefinition = {
  id: string;
  type: EducationCollectibleType;
  masteryId?: string;
  seasonId?: string;
  title: string;
  description?: string;
  assetUrl?: string;
  thumbnailUrl?: string;
  transparentAssetUrl?: string;
  lockedAssetUrl?: string;
  earnedAssetUrl?: string;
  rarity?: string;
  displayStyle?: string;
  metadata?: Record<string, unknown>;
};

export type UserCollectibleSourceType =
  | 'education'
  | 'slay-challenge'
  | 'reward'
  | 'promotion'
  | 'special';

export type UserCollectibleStatus = 'earned' | 'revoked';

export type UserCollectible = {
  id: string;
  userId: string;
  collectibleId: string;
  sourceType: UserCollectibleSourceType;
  sourceId?: string;
  earnedAt: string;
  status: UserCollectibleStatus;
  displaySlotId?: string;
  metadata?: Record<string, unknown>;
};

export type CollectibleDisplaySlot = {
  id: string;
  surfaceId: string;
  position: { x: number; y: number };
  scale?: number;
  rotation?: number;
  collectibleId?: string;
  autoAssign?: boolean;
};

export type EducationEpisodeCompletionType = 'psa-today' | 'care-lesson';

export type EducationEpisodeCompletion = {
  id: string;
  userId: string;
  episodeRefId: string;
  episodeType: EducationEpisodeCompletionType;
  seasonId?: string;
  completedAt: string;
};

export type EpisodeReleaseState =
  | 'planned'
  | 'announced'
  | 'preview-available'
  | 'scheduled'
  | 'released'
  | 'archived';

export type SeasonPassAccessSource =
  | 'slay-ticket'
  | 'member'
  | 'promotion'
  | 'admin'
  | 'qualifying-product';

export type SeasonPassEntitlementStatus = 'active' | 'revoked' | 'refunded';

export type SeasonPassEntitlement = {
  id: string;
  userId: string;
  masteryId: string;
  seasonId: string;
  acquiredAt: string;
  accessSource: SeasonPassAccessSource;
  slayTicketCostAtPurchase?: number;
  status: SeasonPassEntitlementStatus;
  episodeEntitlementIds?: string[];
};

export type HierarchyOverlapIssueKind =
  | CurriculumOverlapIssueKind
  | 'broken-mastery-id'
  | 'broken-season-id'
  | 'broken-episode-id'
  | 'duplicate-season-number'
  | 'duplicate-episode-number'
  | 'episode-in-multiple-seasons'
  | 'invalid-release-dates'
  | 'season-pass-no-episodes'
  | 'no-access-path'
  | 'invalid-signature-unit-ref'
  | 'inactive-education-profile'
  | 'missing-shared-fallback'
  | 'broken-chapter-order'
  | 'duplicate-chapter-number'
  | 'invalid-continuity-unit'
  | 'invalid-demonstration-unit'
  | 'personalized-no-fallback'
  | 'unit-media-required-for-universal'
  | 'duplicated-episode-by-unit';

export type HierarchyOverlapIssue = {
  kind: HierarchyOverlapIssueKind;
  message: string;
  masteryId?: string;
  seasonId?: string;
  episodeId?: string;
  curriculumCode?: string;
  details?: Record<string, unknown>;
};
