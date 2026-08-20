/**
 * Studio World Virtual Production OS — canonical domain types.
 * Provider-agnostic production operating system layer.
 */

/** Three production modes */
export type VirtualProductionMode = 'director' | 'precision' | 'hybrid';

/** Campaign lifecycle */
export type CampaignLifecycleStatus =
  | 'idea'
  | 'brief'
  | 'direction'
  | 'storyboard'
  | 'preproduction'
  | 'production'
  | 'qc'
  | 'repair'
  | 'assembly'
  | 'client_review'
  | 'approved'
  | 'delivered'
  | 'archived';

/** Asset / shot approval states */
export type ProductionApprovalState =
  | 'draft'
  | 'generating'
  | 'ready_for_review'
  | 'approved'
  | 'rejected'
  | 'repair_required'
  | 'superseded'
  | 'archived';

/** QC categories */
export type QcCategory =
  | 'identity'
  | 'product'
  | 'environment'
  | 'wardrobe'
  | 'prop'
  | 'anatomy'
  | 'motion'
  | 'camera'
  | 'lighting'
  | 'continuity'
  | 'text_logo'
  | 'audio'
  | 'brand'
  | 'overall';

export type QcStatus = 'pass' | 'warning' | 'fail' | 'not_reviewed';

/** Shot transition types (invisible-cut strategy) */
export type ShotTransitionType =
  | 'cut'
  | 'match_action'
  | 'motion_cut'
  | 'occlusion'
  | 'whip'
  | 'object_wipe'
  | 'insert'
  | 'reaction'
  | 'detail'
  | 'camera_movement'
  | 'lighting_transition'
  | 'hard_cut'
  | 'dissolve'
  | 'other';

/** Storyboard frame kinds */
export type StoryboardFrameKind =
  | 'text_concept'
  | 'reference_frame'
  | 'generated_keyframe'
  | 'approved_keyframe'
  | 'start_frame'
  | 'end_frame';

/** Reference pack status */
export type ReferencePackStatus = 'draft' | 'approved' | 'archived';

/** Canon entity setup status */
export type CanonEntityStatus = 'setup_required' | 'draft' | 'approved' | 'archived';

/** Production job status */
export type ProductionJobStatus =
  | 'queued'
  | 'running'
  | 'complete'
  | 'failed'
  | 'cancelled';

/** User-facing production failure categories */
export type ProductionErrorCategory =
  | 'production_failed'
  | 'provider_unavailable'
  | 'invalid_reference'
  | 'generation_timed_out'
  | 'authentication_required'
  | 'unsupported_capability';

/** Continuity state dimensions */
export type ContinuityDimension =
  | 'character_state'
  | 'wardrobe_state'
  | 'hair_state'
  | 'makeup_state'
  | 'prop_state'
  | 'environment_state'
  | 'lighting_state'
  | 'position_state'
  | 'camera_state';

export type ContinuityState = Partial<Record<ContinuityDimension, Record<string, unknown>>>;

export type VirtualProductionBrand = {
  id: string;
  orgId: string;
  brandKey: string;
  displayName: string;
  description?: string;
  visualRules: Record<string, unknown>;
  forbiddenDeviations: string[];
  status: CanonEntityStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type VirtualProductionCharacter = {
  id: string;
  orgId: string;
  brandId: string;
  characterKey: string;
  canonicalName: string;
  role?: string;
  description?: string;
  heroReferenceUrl?: string;
  referenceUrls: Record<string, string>;
  bodyNotes: Record<string, unknown>;
  visualInvariants: string[];
  forbiddenDeviations: string[];
  providerMetadata: Record<string, unknown>;
  version: number;
  status: CanonEntityStatus;
  canonLocked: boolean;
  metadata: Record<string, unknown>;
};

export type CharacterReferencePack = {
  id: string;
  orgId: string;
  characterId: string;
  packKey: string;
  label: string;
  frames: Record<string, string>;
  version: number;
  status: ReferencePackStatus;
  metadata: Record<string, unknown>;
};

export type VirtualProductionEnvironment = {
  id: string;
  orgId: string;
  brandId: string;
  environmentKey: string;
  name: string;
  description?: string;
  canonicalImages: unknown[];
  spatialNotes: Record<string, unknown>;
  lightingConditions: Record<string, unknown>;
  permittedModifications: string[];
  forbiddenModifications: string[];
  providerMetadata: Record<string, unknown>;
  version: number;
  status: CanonEntityStatus;
  canonLocked: boolean;
  metadata: Record<string, unknown>;
};

export type VirtualProductionProduct = {
  id: string;
  orgId: string;
  brandId: string;
  productKey: string;
  name: string;
  description?: string;
  canonicalImages: Record<string, unknown>;
  packagingRules: Record<string, unknown>;
  labelRules: Record<string, unknown>;
  forbiddenDeviations: string[];
  providerMetadata: Record<string, unknown>;
  version: number;
  status: CanonEntityStatus;
  canonLocked: boolean;
  metadata: Record<string, unknown>;
};

export type VirtualProductionCampaign = {
  id: string;
  orgId: string;
  brandId: string;
  campaignKey: string;
  name: string;
  objective?: string;
  platform?: string;
  audience?: string;
  creativeBrief?: string;
  narrativeConcept?: string;
  treatment?: string;
  productionMode: VirtualProductionMode;
  deliverables: unknown[];
  format: Record<string, unknown>;
  canonSnapshot: Record<string, unknown>;
  lifecycleStatus: CampaignLifecycleStatus;
  approvalState: ProductionApprovalState;
  deadline?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type VirtualProductionScene = {
  id: string;
  orgId: string;
  campaignId: string;
  sceneKey: string;
  title: string;
  description?: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
};

export type VirtualProductionShot = {
  id: string;
  orgId: string;
  campaignId: string;
  sceneId: string;
  shotKey: string;
  sortOrder: number;
  purpose?: string;
  shotType?: string;
  description?: string;
  durationSeconds?: number;
  productionMode?: VirtualProductionMode;
  providerId?: string;
  modelId?: string;
  modelSettings: Record<string, unknown>;
  prompt?: string;
  negativeConstraints?: string;
  canonRefs: Record<string, unknown>;
  startFrameUrl?: string;
  endFrameUrl?: string;
  transitionType?: ShotTransitionType;
  selectedTakeId?: string;
  replacementTakeId?: string;
  approvalState: ProductionApprovalState;
  qcSummary: Record<string, unknown>;
  metadata: Record<string, unknown>;
};

export type VirtualProductionQcReview = {
  id: string;
  orgId: string;
  campaignId?: string;
  shotId?: string;
  assetId?: string;
  reviewerId?: string;
  overallStatus: QcStatus;
  categoryResults: Partial<Record<QcCategory, { status: QcStatus; notes?: string }>>;
  notes?: string;
  decision?: 'approve' | 'reject' | 'repair';
};

export type VirtualProductionRepair = {
  id: string;
  orgId: string;
  campaignId: string;
  shotId: string;
  originalAssetId?: string;
  repairJobId?: string;
  replacementAssetId?: string;
  status: 'open' | 'in_progress' | 'complete' | 'cancelled';
  reason?: string;
  metadata: Record<string, unknown>;
};

export type VirtualProductionGenerationAsset = {
  id: string;
  orgId: string;
  campaignId?: string;
  sceneId?: string;
  shotId?: string;
  productionJobId?: string;
  assetKey: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'audio';
  providerId: string;
  modelId?: string;
  prompt?: string;
  settings: Record<string, unknown>;
  sourceReferences: unknown[];
  canonVersions: Record<string, unknown>;
  parentAssetId?: string;
  repairAncestry: string[];
  approvalState: ProductionApprovalState;
  registryAssetId?: string;
  metadata: Record<string, unknown>;
};

export type VirtualProductionAssembly = {
  id: string;
  orgId: string;
  campaignId: string;
  assemblyKey: string;
  label: string;
  timeline: Array<{ shotId: string; takeId: string; durationSeconds?: number; transition?: ShotTransitionType }>;
  audioAssets: unknown[];
  transitions: unknown[];
  gradeVersion?: string;
  status: ProductionApprovalState;
};

export type VirtualProductionDeliverable = {
  id: string;
  orgId: string;
  campaignId: string;
  assemblyId?: string;
  deliverableKey: string;
  platform: string;
  aspectRatio?: string;
  resolution?: string;
  durationSeconds?: number;
  caption?: string;
  exportVersion?: string;
  approvalState: ProductionApprovalState;
  deliveryState: 'pending' | 'ready' | 'delivered' | 'archived';
};

export type DirectorProductionPackage = {
  campaign: { key: string; name: string; objective?: string };
  story?: string;
  treatment?: string;
  characters: Array<{ key: string; name: string; references: Record<string, string> }>;
  environments: Array<{ key: string; name: string; references: string[] }>;
  products: Array<{ key: string; name: string; references: Record<string, string> }>;
  wardrobe: Array<{ key: string; label: string }>;
  cameraLanguage: Record<string, unknown>;
  scenePlan: Array<{ sceneKey: string; title: string; shots: string[] }>;
  shotRequirements: Array<{ shotKey: string; description?: string; duration?: number }>;
  continuityRequirements: Record<string, unknown>;
  forbiddenDeviations: string[];
  deliverableRequirements: unknown[];
  aspectRatio?: string;
  durationTarget?: number;
  audioDirection?: string;
};
