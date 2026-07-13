/**
 * Master Founder Render™ + Composition Pack™ — canonical multi-device rendering contracts.
 * ONE room. Many compositions. No separate desktop/mobile scene generation.
 */

export const MASTER_FOUNDER_RENDER_VERSION = 'master-founder-render.v1' as const;

export const MASTER_LANDSCAPE_ASPECT = '21:9' as const;
export const MASTER_PORTRAIT_ASPECT = '9:16' as const;

export const MASTER_FOUNDER_LANDSCAPE_INTENT = 'master-founder-landscape' as const;
export const MASTER_FOUNDER_PORTRAIT_INTENT = 'master-founder-portrait-recompose' as const;

export const MASTER_LANDSCAPE_PROMPT_VERSION = 'master-founder-landscape-prompt.v1' as const;
export const MASTER_PORTRAIT_PROMPT_VERSION = 'master-founder-portrait-recompose-prompt.v1' as const;

export type MasterRenderRevisionBundle = {
  blueprintRevision: number;
  constructionRevision: number;
  materialRevision: number;
  lightingRevision: number;
  cameraRevision: number;
  assetRevision: number;
  sceneRevision: number;
};

export type MasterFounderRenderStatus =
  | 'no_preview'
  | 'generating'
  | 'ready'
  | 'approved'
  | 'failed'
  | 'stale';

export type MasterFounderRender = {
  renderVersion: typeof MASTER_FOUNDER_RENDER_VERSION;
  renderId: string;
  organizationId: string;
  projectId: string;
  roomId: string;
  blueprintId: string;
  constructionPlanId: string;
  revisions: MasterRenderRevisionBundle;
  aspectRatio: typeof MASTER_LANDSCAPE_ASPECT;
  artifactUrl: string | null;
  jobId: string | null;
  status: MasterFounderRenderStatus;
  aiModel: string;
  promptVersion: typeof MASTER_LANDSCAPE_PROMPT_VERSION;
  organizationAssets: string[];
  departmentRegistryId: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type MasterPortraitRender = {
  renderVersion: typeof MASTER_FOUNDER_RENDER_VERSION;
  portraitId: string;
  masterLandscapeRenderId: string;
  landscapeArtifactUrl: string;
  aspectRatio: typeof MASTER_PORTRAIT_ASPECT;
  artifactUrl: string | null;
  jobId: string | null;
  status: MasterFounderRenderStatus;
  aiModel: string;
  promptVersion: typeof MASTER_PORTRAIT_PROMPT_VERSION;
  /** Portrait may only generate after landscape is approved. */
  landscapeApprovedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
};

export type CompositionProfileId =
  | 'desktop-hero'
  | 'desktop-wide'
  | 'desktop-detail'
  | 'tablet-landscape'
  | 'tablet-portrait'
  | 'mobile-hero'
  | 'mobile-tight'
  | 'instagram-story'
  | 'tiktok'
  | 'marketplace-thumbnail'
  | 'presentation'
  | 'construction'
  | 'blueprint-overlay'
  | 'review-mode';

export type DeviceProfileId =
  | 'desktop'
  | 'tablet'
  | 'mobile'
  | 'marketing'
  | 'construction'
  | 'marketplace'
  | 'presentation'
  | 'review'
  | 'vision-pro'
  | 'ar'
  | 'vr'
  | 'smart-tv'
  | 'foldable';

export type CompositionSourceMaster = 'landscape' | 'portrait';

export type CompositionProfile = {
  profileId: CompositionProfileId;
  displayName: string;
  deviceProfile: DeviceProfileId;
  sourceMaster: CompositionSourceMaster;
  aspectRatio: string;
  fieldOfViewDeg: number;
  focalLengthMm: number;
  safeAreaInsets: { top: number; right: number; bottom: number; left: number };
  focusPriority: 'room-wide' | 'hero-landmark' | 'reception-desk' | 'brand-wall' | 'navigation-path' | 'marketing-dramatic' | 'balanced';
  cropStrategy: 'center-weighted' | 'hero-priority' | 'brand-priority' | 'balanced' | 'tight-mobile';
  requiresNewGeneration: false;
};

export type CompositionPack = {
  packVersion: typeof MASTER_FOUNDER_RENDER_VERSION;
  packId: string;
  masterLandscapeRenderId: string;
  masterPortraitRenderId: string | null;
  profiles: CompositionProfile[];
  locked: boolean;
  revision: number;
};

export type HeroObjectAnchor = {
  objectId: string;
  label: string;
  role: 'reception-desk' | 'hero-landmark' | 'brand-wall' | 'logo' | 'waiting-area' | 'entrance' | 'walkway' | 'crystal' | 'furniture-hero';
  priority: number;
};

export type SafeCropRegion = {
  regionId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type BlueprintCompositionMetadata = {
  metadataVersion: typeof MASTER_FOUNDER_RENDER_VERSION;
  blueprintId: string;
  heroObjects: HeroObjectAnchor[];
  primaryFocus: string;
  secondaryFocus: string;
  safeCropAreas: SafeCropRegion[];
  visualPriority: string[];
  architecturalAnchors: string[];
  walkingDirection: string;
  cameraHeightM: number;
  cameraOrbitRadiusM: number;
  recommendedFocalLengthMm: number;
  recommendedComposition: CompositionProfileId;
  sceneFocusGraph: { nodeId: string; label: string; weight: number }[];
};

export type BrandAssetLockBundle = {
  masterLandscapeUrl: string;
  materialLibraryId: string;
  brandVaultId: string;
  marbleProfileId: string;
  glassProfileId: string;
  acrylicProfileId: string;
  lightingProfileId: string;
  furnitureSetId: string;
};

export type CompositionValidationResult =
  | { ok: true }
  | { ok: false; code: CompositionRejectionCode; message: string };

export type CompositionRejectionCode =
  | 'PORTRAIT_WITHOUT_APPROVED_LANDSCAPE'
  | 'LANDSCAPE_NOT_APPROVED'
  | 'REVISION_MISMATCH'
  | 'ARCHITECTURE_DRIFT'
  | 'MATERIAL_DRIFT'
  | 'LIGHTING_DRIFT'
  | 'FURNITURE_DRIFT'
  | 'BRAND_ASSET_DRIFT'
  | 'DIFFERENT_ROOM'
  | 'LAYOUT_DRIFT'
  | 'MISSING_LANDSCAPE_REFERENCE'
  | 'COMPOSITION_PACK_UNLOCKED';

export type PortraitLandscapeParityInput = {
  landscape: MasterFounderRender;
  portrait: MasterPortraitRender;
  revisions: MasterRenderRevisionBundle;
  brandLock: BrandAssetLockBundle;
};

export type ApprovedMasterRenderHandoff = {
  handoffVersion: 'approved-master-render-handoff.v1';
  organizationId: string;
  masterLandscape: MasterFounderRender;
  masterPortrait: MasterPortraitRender | null;
  compositionPack: CompositionPack;
  blueprintComposition: BlueprintCompositionMetadata;
  brandLock: BrandAssetLockBundle;
  departmentRegistryId: string | null;
  approvedAt: string;
  approvedBy: string;
};
