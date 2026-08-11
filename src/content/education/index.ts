export type {
  EducationPillar,
  EducationOwnership,
  EducationContentFamily,
  ScrapbookAccessPolicy,
  SlayTip,
  SlayTipPage,
  SlayTipPageLayout,
  SlayTipFormat,
  EducationContentRef,
  CareGuide,
  CareGuideFormat,
  CareGuideVisibility,
  CareGuideApplicability,
  CareLesson,
  CareLessonCategory,
  CareEligibilityRule,
  CarePurchaseProfile,
  CareEntitlementStatus,
  CurriculumContentType,
  CurriculumRole,
  CurriculumStatus,
  CurriculumKitRequirement,
  CurriculumConceptSlot,
  CurriculumLifecyclePhase,
  CurriculumBibleEntry,
  CurriculumOverlapIssueKind,
  CurriculumOverlapIssue,
  EducationMastery,
  MasteryPillar,
  MasteryStatus,
  EducationSeason,
  EducationSeasonEpisodeSlot,
  SeasonReleaseStrategy,
  SeasonStatus,
  EpisodeReleaseState,
  SeasonPassAccessSource,
  SeasonPassEntitlementStatus,
  SeasonPassEntitlement,
  HierarchyOverlapIssueKind,
  HierarchyOverlapIssue,
  SeasonCertificationConfig,
  SeasonCertificationCompletionRequirement,
  SeasonCurriculumStatus,
  SeasonAccessConfig,
  SeasonAccessSource,
  SeasonAccessScope,
  ResolvedSeasonAccessDisplayState,
  ResolvedPsaSeasonAccess,
  EducationCertification,
  EducationCertificationStatus,
  EducationCollectibleType,
  EducationCollectibleDefinition,
  UserCollectibleSourceType,
  UserCollectibleStatus,
  UserCollectible,
  CollectibleDisplaySlot,
  EducationEpisodeCompletionType,
  EducationEpisodeCompletion,
} from './types';

export { EDUCATION_PILLARS } from './types';

export {
  getAllEducationFamilies,
  getEducationFamilyById,
  getEducationFamilyBySlug,
  getAllSlayTips,
  getSlayTipById,
  getSlayTipBySlug,
  getSlayTipsForFamily,
  getSlayTipsForPsaEpisode,
  getSlayTipsByPillar,
  getFamilyForPsaEpisode,
  getFamilyForSlayTip,
  EDUCATION_PILLAR_RAILS,
  getSlayTipsForLearnRail,
} from './catalog';

export {
  getAllCareGuides,
  getCareGuideById,
  getCareGuideBySlug,
  getCareGuidesByCategory,
  getCareGuidesForLibrary,
  getCareGuidesForLearnRail,
  CARE_GUIDE_LIBRARY_RAIL,
  getAllCareLessons,
  getCareLessonById,
  getCareLessonBySlug,
  getCareLessonsByCategory,
  getCareLessonsForLearnRail,
  CARE_LEARN_RAILS,
  resolveCareAccessForGuides,
  resolveUnlockedCareGuideIds,
  resolveCareAccessForLessons,
  resolveUnlockedCareLessonIds,
} from './care/catalog';

export {
  getAllCurriculumBibleEntries,
  getCurriculumBibleEntryById,
  getCurriculumBibleEntryByCode,
  getCurriculumBibleEntriesByPillar,
  getCurriculumBibleEntriesByStatus,
  getCurriculumEntriesWithLinkedContent,
  validateCurriculumRegistry,
  resolveCurriculumContentRefs,
  curriculumRefLabel,
  contentRefExistsForCurriculum,
  LACE_CURRICULUM_ENTRIES,
  LACE_CURRICULUM_LIFECYCLE,
} from './curriculum/registry';

export {
  getAllEducationMasteries,
  getEducationMasteryById,
  getEducationMasteryBySlug,
  getAllEducationSeasons,
  getEducationSeasonById,
  getSeasonsForMastery,
  getPublishedMasteriesWithSeasons,
  getCurriculumBibleEntryWithHierarchy,
  getAllCurriculumBibleEntriesWithHierarchy,
  validateEducationProgram,
  validateEducationHierarchy,
  validateSeasonReleases,
  seasonUsesPurchaseIncludedAccess,
  seasonHasDualAccess,
  resolveEpisodeReleaseState,
  isEpisodeFullLessonReleased,
  isEpisodePreviewAvailable,
  formatEpisodeReleaseLabel,
  resolveEpisodeTicketCost,
  CURRICULUM_HIERARCHY_LINKS,
} from './hierarchy/catalog';

export {
  isSeasonCertificationEnabled,
  resolveRequiredEpisodeIdsForSeason,
  resolveSeasonCertificationTitle,
  computeCertificationProgress,
} from './hierarchy/certificationResolver';

export {
  resolvePsaSeasonAccess,
  resolveSeasonAccessConfig,
  getSeasonIdsForPsaEpisode,
  isDualAccessCareSeason,
} from './hierarchy/psaSeasonAccessResolver';

export {
  SIGNATURE_UNIT_EDUCATION_PROFILES,
  getSignatureUnitEducationProfile,
  getActiveSignatureUnitEducationProfiles,
  isKnownSignatureUnitId,
  resolveEducationUnitContext,
  resolveChapterMedia,
  readFollowThisUnitPreference,
  writeFollowThisUnitPreference,
  readContinuityUnitPreference,
  writeContinuityUnitPreference,
} from './signature-units';

export { validatePsaTodayCurriculum } from './validatePsaTodayCurriculum';

export {
  CARE_MASTERY_CANONICAL_SEASON_ID,
  isCareMasterySeasonId,
} from './hierarchy/care/seasons';

export {
  CARE_MASTERY_QUALIFYING_PRODUCT_TYPES,
  carePurchaseProfileQualifiesForCareMasterySeason,
  resolveQualifyingOrderIdsForCareMastery,
} from './care/careMasteryProductEntitlements';

export {
  buildYourOwnedUnitFromProfile,
  resolveCareEntitlementsForOwnedUnits,
  resolveCareEntitlementsForPurchasedUnit,
  resolveCareEntitlementsFromProfiles,
  isCareContentProductEntitled,
} from './care/careEntitlementResolver';

export type {
  YourOwnedUnit,
  ClassUnitReference,
  OwnedUnitConstructionDna,
  OwnedUnitCustomerConfiguration,
  OwnedUnitTransformationState,
  ResolvedCareContentEntitlement,
} from './care/ownedUnitModel';

export type { CareApplicability } from './care/careApplicability';
export { getCareContentRegistry } from './care/careContentRegistry';
export {
  QUALIFYING_PRODUCT_GRANTS_FULL_CARE_SEASON_PASS,
  CARE_VS_MASTERY_BOUNDARY,
} from './care/careEntitlementPolicy';
export {
  isHairPurchaseSlayTicketEarningEnabled,
  HAIR_PURCHASE_SLAY_TICKET_EARNING_DEPRECATED,
} from './commerce/slayTicketEconomyPolicy';

export {
  listMasteryTrackPresentations,
  getMasteryTrackById,
  resolveMasteryTrackStatus,
  MASTERY_TRACKS,
  PSA_TODAY_LEARN_UMBRELLA,
  FRONTAL_SLAYER_ACADEMY_FUTURE_NOTE,
} from './hierarchy/masteryTracks';
export {
  PSA_TODAY_CONTENT_FAMILY,
  PSA_LEARN_SECONDARY_RAILS,
  type PsaTeachingFormat,
  type PsaMasteryTrackKey,
} from './psaTodayTaxonomy';
export {
  MASTERY_KIT_COPY,
  OFFICIAL_MASTERY_KIT_FULFILLMENT_ENABLED,
  resolveMasteryKitPresentationMode,
  type MasteryKitItem,
  type MasteryKitPresentationMode,
} from './masteryKitModel';

export { resolveMasteryCertificationReadiness, listMasteriesWithCertificationProgress } from './hierarchy/masteryCompletion';

export {
  EDUCATION_COLLECTIBLE_DEFINITIONS,
  getCollectibleDefinitionById,
  getCollectibleForSeason,
  REWARDS_CERTIFICATION_DISPLAY_SLOTS,
  REWARDS_CERTIFICATION_WALL_SURFACE_ID,
  getAutoAssignCertificationSlots,
} from './collectibles';

export { CARE_ELIGIBILITY_RULES, getCareEligibilityRulesForLesson } from './care/eligibilityRules';
export { careProfilesFromOrders, type CareOrderLike } from './care/careOrderParsing';
export {
  CARE_QUALIFYING_ORDER_STATUS,
  DISPLAY_NAME_TO_UNIT_SLUG,
  UNIT_SLUG_TEXTURE,
} from './care/productCatalog';

export { FAMILY_PLUCKING } from './families/plucking';
export { SLAY_TIP_DEV_WET_HAIRLINE } from './slay-tips/dev-wet-hairline-plucking';
