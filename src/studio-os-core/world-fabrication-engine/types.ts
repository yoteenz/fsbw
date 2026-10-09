/**
 * World Fabrication Engine V1 — canonical domain types.
 * Studio OS production capability (not a standalone product).
 */

export const WORLD_FABRICATION_ENGINE_VERSION = 'world-fabrication-v1';

export type WorldFabricationProofEnvironment =
  | 'SITE00_BUILD_OBJECT'
  | 'ASTREA_ENTRANCE_THRESHOLD'
  | 'STUDIO_WORLD_SPATIAL_ZONE';

export type WorldFabricationTargetRuntime =
  | 'WEB_THREEJS'
  | 'WEB_CUSTOM'
  | 'UNREAL_CINEMATIC'
  | 'UNREAL_INTERACTIVE'
  | 'BLENDER_REVIEW'
  | 'DELIVERY_PACKAGE_ONLY';

export type VisualAuthoritySourceType =
  | 'APPROVED_ENVIRONMENT_IMAGE'
  | 'CONCEPT_RENDER'
  | 'ARCHITECTURAL_REFERENCE_BOARD'
  | 'EXISTING_3D_SOURCE'
  | 'WORLD_DESIGN_DOCUMENT'
  | 'SPATIAL_ZONE_DEFINITION'
  | 'MATERIAL_AUTHORITY'
  | 'INTERACTION_REQUIREMENTS'
  | 'APPROVED_PRODUCTION_ASSET';

export type VisualAuthorityApprovalStatus =
  | 'DRAFT'
  | 'IN_PRODUCTION'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'APPROVED_WITH_CORRECTIONS'
  | 'REVISION_REQUESTED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type SpatialCertaintyClass =
  | 'REFERENCE_CONFIRMED'
  | 'DESIGN_INFERRED'
  | 'ENGINEERING_REQUIRED'
  | 'FOUNDER_DECISION_REQUIRED';

export type AssetLineageTier =
  | 'ORIGINAL_REFERENCE'
  | 'AI_MASSING_SOURCE'
  | 'FABRICATION_SOURCE'
  | 'APPROVED_MASTER'
  | 'RUNTIME_EXPORT';

export type MassingProviderRole = 'MASSING_PROVIDER';

export type FabricationExecutionEnvironment =
  | 'CODEX_AGENT'
  | 'BLENDER_LOCAL'
  | 'BLENDER_HEADLESS'
  | 'UNREAL_LOCAL'
  | 'SHADOW_PC'
  | 'CLOUD_GPU'
  | 'UNAVAILABLE';

export type WorldProjectRef = {
  worldProjectId: string;
  organizationId: string;
  site00ProjectId?: string;
  studioWorldZoneId?: string;
  ndxbookProductionId?: string;
  title: string;
  proofEnvironment?: WorldFabricationProofEnvironment;
};

export type VisualAuthorityRecord = {
  authorityId: string;
  projectId: string;
  worldId?: string;
  sourceType: VisualAuthoritySourceType;
  assetReference: string;
  approvalStatus: VisualAuthorityApprovalStatus;
  version: string;
  approvedBy?: string;
  approvedAt?: string;
  scope: string;
  supersedesAuthorityId?: string;
  requiredCharacteristics: string[];
  prohibitedDeviations: string[];
};

export type ReferenceViewKind =
  | 'HERO'
  | 'FRONT'
  | 'REAR'
  | 'LEFT'
  | 'RIGHT'
  | 'ELEVATED'
  | 'AERIAL'
  | 'INTERIOR'
  | 'THRESHOLD'
  | 'DETAIL';

export type ReferenceViewRecord = {
  viewId: string;
  projectId: string;
  kind: ReferenceViewKind;
  authorityId?: string;
  referenceImageRef?: string;
  cameraIntent: string;
  orientation?: string;
  visibleFeatures: string[];
  consistencyConstraints: string[];
  uncertainGeometry: string[];
  approvalStatus: VisualAuthorityApprovalStatus;
};

export type SpatialSpecification = {
  spatialSpecId: string;
  projectId: string;
  worldPurpose: string;
  zoneType: string;
  architecturalIdentity: string;
  scaleAssumptions: string[];
  primarySilhouette: string;
  structuralComponents: string[];
  entrances: string[];
  exits: string[];
  interiorSpaces: string[];
  pathConnections: string[];
  verticalCirculation: string[];
  majorLandmarks: string[];
  materialFamilies: string[];
  lightingDirection: string;
  interactiveElements: string[];
  cameraConstraints: string[];
  collisionRequirements: string[];
  navigationRequirements: string[];
  performanceTarget?: string;
  targetRuntime: WorldFabricationTargetRuntime;
  referenceUncertainties: Array<{ subject: string; certainty: SpatialCertaintyClass }>;
};

export type FabricationJobManifest = {
  manifestId: string;
  manifestVersion: typeof WORLD_FABRICATION_ENGINE_VERSION;
  project: WorldProjectRef;
  spatialSpecId: string;
  visualAuthorityIds: string[];
  referenceViewIds: string[];
  currentStageId: string;
  targetRuntime: WorldFabricationTargetRuntime;
  proofEnvironment?: WorldFabricationProofEnvironment;
  costBudgetId: string;
  lineageRootAuthorityId: string;
  executionCapabilityRequired: FabricationExecutionEnvironment[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
};
