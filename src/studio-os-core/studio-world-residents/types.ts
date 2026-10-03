/**
 * Studio World Resident System — canonical domain types.
 * Canon lives above embodiment (UE / MetaHuman are runtime targets only).
 */

export const STUDIO_WORLD_RESIDENT_SYSTEM_VERSION = 'season1-ensemble-v1';

export type ResidentId = `SW-RESIDENT-${string}`;

export type CanonLifecycleStatus = 'draft' | 'approved' | 'superseded' | 'archived';

export type ResidentIdentityStatus = 'canonical' | 'guest' | 'deprecated';

export type FabricationStatus =
  | 'NOT_STARTED'
  | 'CANON_DRAFT'
  | 'CANON_APPROVED'
  | 'PHYSICAL_BRIEF_DRAFT'
  | 'PHYSICAL_BRIEF_APPROVED'
  | 'REFERENCE_PACK_PENDING'
  | 'REFERENCE_PACK_APPROVED'
  | 'UE_RECONSTRUCTION_PENDING'
  | 'UE_RECONSTRUCTION_IN_PROGRESS'
  | 'UE_RECONSTRUCTION_APPROVED'
  | 'VOICE_PENDING'
  | 'VOICE_APPROVED'
  | 'WORLD_INTEGRATION_PENDING'
  | 'WORLD_READY';

export type EmbodimentTargetKind = 'ue_metahuman' | 'live2d' | 'provider_character' | 'other';

export type EmbodimentTargetRecord = {
  kind: EmbodimentTargetKind;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'APPROVED' | 'BLOCKED';
  /** Repo-verified paths only — never hallucinated. */
  referenceLinks: Array<{ label: string; pathOrUrl?: string; note?: string }>;
  notes?: string;
};

export type CanonVersionChangeRecord = {
  version: string;
  status: CanonLifecycleStatus;
  changedAt: string;
  changedBy?: string;
  approvedBy?: string;
  reason: string;
  previousVersion?: string;
  fieldsChanged: string[];
};

export type ResidentPersonalityCanon = {
  traits: string[];
  humor: string;
  icks: string[];
  privateLifeEnergy: string;
  ensembleFunction: string;
};

export type ResidentPhysicalDirection = {
  summary: string;
  bullets: string[];
  signatureStyling?: string;
};

export type ResidentCanonicalIdentity = {
  residentId: ResidentId;
  season: number;
  displayName: string;
  sortOrder: number;
  identityStatus: ResidentIdentityStatus;
  pronouns?: string;
  ageBand?: string;
  /** Core Studio World work role — not a client cast role. */
  coreWorldRole: string;
  archetype?: string;
  biographySummary?: string;
  physicalDirection: ResidentPhysicalDirection;
  personality: ResidentPersonalityCanon;
  /** Optional link to VP / external character rows — does not define identity. */
  externalCharacterKeys?: string[];
  worldDepartment?: string;
  worldLocation?: string;
  fabricationStatus: FabricationStatus;
  canonLifecycleStatus: CanonLifecycleStatus;
  canonVersion: string;
  versionHistory: CanonVersionChangeRecord[];
  embodimentTargets: EmbodimentTargetRecord[];
  continuityRules?: string[];
  memoryPolicy?: string;
  castingRangeNotes?: string;
  /** Links to `visual-authority/` records — not embedded asset payloads. */
  visualAuthorityRefs?: string[];
  primaryNaturalHabitatAuthorityId?: string;
  visualFabricationReadiness?: import('./visual-authority/types').VisualFabricationReadiness;
  updatedAt: string;
};

export type RelationshipType =
  | 'mutual_respect'
  | 'creative_tension'
  | 'high_trust_minimal_words'
  | 'social_glue'
  | 'systems_vs_drama'
  | 'fabrication_duo'
  | 'strategic_rivalry'
  | 'relationship_instigator'
  | 'observes_chemistry'
  | 'custom';

export type RelationshipLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type ResidentRelationshipEdge = {
  id: string;
  personAId: ResidentId;
  personBId: ResidentId;
  relationshipType: RelationshipType;
  label: string;
  mutual: boolean;
  trustLevel: RelationshipLevel;
  frictionLevel: RelationshipLevel;
  chemistryLevel: RelationshipLevel;
  loyaltyLevel: RelationshipLevel;
  publicDynamic: string;
  privateDynamic: string;
  currentArc: string;
  historicalEvents: string[];
  unresolvedTension: string[];
  documentarySocialValue: string;
  canonNotes: string;
  lastUpdated: string;
  version: string;
  /** When mutual is false, describes B→A if present. */
  asymmetricNotes?: string;
};

export type DocumentaryCameraAwareness =
  | 'plays_to_camera'
  | 'ignores_until_break'
  | 'dislikes_camera'
  | 'owns_every_camera'
  | 'always_knows_camera'
  | 'speaks_when_worth_it'
  | 'forgets_camera'
  | 'image_aware';

export type ResidentDocumentaryProfile = {
  residentId: ResidentId;
  cameraAwareness: DocumentaryCameraAwareness;
  confessionalStyle: string;
  defaultCameraReaction: string;
  howTheyLieToCamera: string;
  howCameraCatchesContradictions: string;
  breakComposureTriggers: string[];
  willNotDiscussOnCamera: string[];
  talksAboutMost: ResidentId[];
  pretendsNotToCareAbout: ResidentId[];
  runningVisualGags: string[];
  signatureLookToCamera: string;
  publicSocialIdentity: string;
  personalFeedEnergy: string;
  recurringBits: string[];
  audienceCatchpoints: string[];
  memePotential: string;
  rootForThemBecause: string;
  dislikeThemBecause: string;
  audienceDiscoversOverTime: string;
  remainsMysterious: string;
  version: string;
};

export type SocialStoryDomainType =
  | 'OFFICE_TODAY'
  | 'CONFESSIONAL'
  | 'MEETING_FOOTAGE'
  | 'AFTER_HOURS'
  | 'CLIENT_DAY'
  | 'CASTING_DAY'
  | 'PRODUCTION_DAY'
  | 'OFFICE_RUMOR'
  | 'PERFORMANCE_REVIEW'
  | 'NEW_RESIDENT'
  | 'OFFICE_EVENT'
  | 'CROSSOVER'
  | 'CLIENT_ROLE_BEHIND_THE_SCENES';

export type SocialStoryLayerRefs = {
  episodicStoryId?: string;
  characterArcId?: string;
  relationshipArcId?: string;
  studioWorldEventId?: string;
};

export type SocialStoryOutline = {
  id: string;
  domainType: SocialStoryDomainType;
  title: string;
  logline: string;
  layers: SocialStoryLayerRefs;
  residentIds: ResidentId[];
  /** Schema-only — no generated posts in this sprint. */
  status: 'schema_only';
};

export type CastRoleType =
  | 'LUXURY_CONCIERGE'
  | 'CAMPAIGN_LEAD'
  | 'CLIENT_SPOKESPERSON'
  | 'FASHION_EDITOR'
  | 'RECEPTIONIST'
  | 'BRAND_CHARACTER'
  | 'HOST'
  | 'CREATIVE_DIRECTOR'
  | 'CUSTOM';

export type CastRoleApprovalStatus = 'draft' | 'pending' | 'approved' | 'revoked' | 'expired';

export type ResidentCastRoleContract = {
  id: string;
  residentId: ResidentId;
  clientOrCompanyId?: string;
  roleName: string;
  displayNameIfDifferent?: string;
  roleType: CastRoleType;
  projectOrCampaign?: string;
  industry?: string;
  wardrobeDirection?: string;
  toneAdjustment?: string;
  temporaryBackstory?: string;
  authorizedKnowledge: string[];
  authorizedBehaviors: string[];
  restrictedBehaviors: string[];
  worldOrOfficeLocation?: string;
  startDate?: string;
  endDate?: string;
  exclusivity?: boolean;
  usageRights?: string[];
  mediaTypes?: string[];
  publicIdentityRules?: string;
  disclosureRules?: string;
  continuityRequirements?: string[];
  approvalStatus: CastRoleApprovalStatus;
  roleHistory: string[];
  assetLinks: Array<{ label: string; ref?: string }>;
  canonImpactNotes?: string;
  version: string;
};

/** Persona presented to clients — never mutates canonical identity. */
export type CastRolePersonaView = {
  contractId: string;
  residentId: ResidentId;
  displayName: string;
  roleName: string;
  toneAdjustment?: string;
  temporaryBackstory?: string;
  authorizedKnowledge: string[];
  authorizedBehaviors: string[];
  restrictedBehaviors: string[];
};

export type ResidentAccessGrantKind =
  | 'DEFAULT'
  | 'STARTER'
  | 'TIER_BASED'
  | 'EARNED'
  | 'PURCHASED'
  | 'TEMPORARY'
  | 'CLIENT_SPECIFIC'
  | 'PREMIUM_SPECIALIST'
  | 'BOOKING_ONLY';

export type ResidentAccessGrant = {
  id: string;
  residentId: ResidentId;
  organizationId?: string;
  clientId?: string;
  grantKind: ResidentAccessGrantKind;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
  notes?: string;
  /** No prices or SKUs in this sprint. */
  metadata?: Record<string, unknown>;
};

export type ReferenceAngleRequirementId =
  | 'FRONTAL_CLOSEUP_NEUTRAL'
  | 'FRONTAL_CLOSEUP_SMILING'
  | 'LEFT_THREE_QUARTER_CLOSEUP'
  | 'RIGHT_THREE_QUARTER_CLOSEUP'
  | 'LEFT_PROFILE'
  | 'RIGHT_PROFILE'
  | 'FRONT_FULL_BODY'
  | 'THREE_QUARTER_FULL_BODY'
  | 'PROFILE_FULL_BODY'
  | 'SEATED_WORKING'
  | 'EXPRESSIVE_CANDID';

export type ReferenceAngleRequirementStatus = 'pending' | 'in_progress' | 'approved' | 'blocked';

export type ReferenceAngleRequirement = {
  id: ReferenceAngleRequirementId;
  label: string;
  status: ReferenceAngleRequirementStatus;
  assetRef?: string;
};

export type FabricationSheetKind =
  | 'CANON_CHARACTER_SHEET'
  | 'PHYSICAL_FABRICATION_BRIEF'
  | 'UE_METAHUMAN_ANGLE_PACK'
  | 'PERFORMANCE_CASTING_SHEET'
  | 'DOCUMENTARY_PERFORMANCE_PROFILE';

export type FabricationSheetStatus = 'not_started' | 'draft' | 'approved';

export type ResidentFabricationRequirements = {
  residentId: ResidentId;
  sheets: Record<FabricationSheetKind, FabricationSheetStatus>;
  referenceAngles: ReferenceAngleRequirement[];
  updatedAt: string;
};

export type Season1ResidentRegistry = {
  version: typeof STUDIO_WORLD_RESIDENT_SYSTEM_VERSION;
  residents: ResidentCanonicalIdentity[];
  relationships: ResidentRelationshipEdge[];
  documentaryProfiles: ResidentDocumentaryProfile[];
  fabricationRequirements: ResidentFabricationRequirements[];
  /** Empty in foundation sprint — schema ready, no fake bookings. */
  castRoleContracts: ResidentCastRoleContract[];
  accessGrants: ResidentAccessGrant[];
  socialStoryOutlines: SocialStoryOutline[];
};
