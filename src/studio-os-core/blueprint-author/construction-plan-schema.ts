import type { BlueprintAuthorMetadata, BlueprintRevisionVersions } from './contract';
import type { AssetSocket } from '../studio-world-architecture-v2/room-blueprint';
import type { StudioWorldMaterialId } from '../studio-world-architecture-v2/material-library';
import type { DepartmentUiSocketBlueprint } from '../architecture-law-001/ui-socket-registry';
import { ARCHITECTURE_LAW_001_VERSION } from '../architecture-law-001/contract';

export const CONSTRUCTION_PLAN_SCHEMA_VERSION = 'construction-plan.v1';

export type ConstructionPlanBuilding = {
  buildingId: string;
  displayName: string;
};

export type ConstructionPlanFloor = {
  floorId: string;
  level: number;
  displayName: string;
};

export type ConstructionPlanRoom = {
  roomId: string;
  roomType: string;
  displayName: string;
  purpose: string;
};

export type ConstructionPlanArchitecture = {
  architectureId: string;
  version: string;
  shellSpecId: string;
  immutable: true;
};

export type ConstructionPlanAssetRef = {
  assetId: string;
  version: string;
  assetClass: string;
  socketId: string;
  tier: 'hero' | 'furniture' | 'decor';
};

export type ConstructionPlanMaterialSet = {
  materialSetId: string;
  version: string;
  materialIds: StudioWorldMaterialId[];
  organizationId: string;
};

export type CameraAnchorSpec = {
  anchorId: string;
  label: string;
  purpose: 'arrival' | 'overview' | 'hero' | 'walkthrough' | 'inspection' | 'photo';
  position: string;
  orientation: string;
};

export type LightingProfileSpec = {
  profileId: string;
  version: string;
  colorTemperatureK: number;
  reflectionIntensity: number;
  shadowSoftness: number;
  bounceCount: number;
  glassResponse: number;
  materialResponse: number;
  ambientProfile: string;
};

export type NavigationGraphSpec = {
  graphId: string;
  version: string;
  loaded: boolean;
  entryAnchors: string[];
  walkPaths: string[];
};

export type ValidationProfileSpec = {
  profileId: string;
  version: string;
  rules: string[];
};

export type InteractionProfileSpec = {
  profileId: string;
  version: string;
  zones: string[];
};

export type StyleProfileSpec = {
  styleId: string;
  version: string;
  organizationStyle: string;
  visualLanguage: string;
};

/**
 * Deterministic Construction Plan™ — nothing inferred during construction.
 */
export type ConstructionPlan = {
  schemaVersion: typeof CONSTRUCTION_PLAN_SCHEMA_VERSION;
  planId: string;
  metadata: BlueprintAuthorMetadata;
  versions: BlueprintRevisionVersions;
  building: ConstructionPlanBuilding;
  floor: ConstructionPlanFloor;
  room: ConstructionPlanRoom;
  architecture: ConstructionPlanArchitecture;
  heroAssets: ConstructionPlanAssetRef[];
  furnitureSet: { setId: string; version: string; assets: ConstructionPlanAssetRef[] };
  decorSet: { setId: string; version: string; assets: ConstructionPlanAssetRef[] };
  materialSet: ConstructionPlanMaterialSet;
  lightingProfile: LightingProfileSpec;
  cameraAnchors: CameraAnchorSpec[];
  navigationGraph: NavigationGraphSpec;
  validationProfile: ValidationProfileSpec;
  interactionProfile: InteractionProfileSpec;
  styleProfile: StyleProfileSpec;
  assetSockets: AssetSocket[];
  collisionZones: string[];
  accessibilityRules: string[];
  negativeRules: string[];
  organizationRules: string[];
  /** Architecture Law #001 — UI mount sockets for Studio World runtime. */
  uiMountSockets?: DepartmentUiSocketBlueprint;
  architectureLawVersion?: typeof ARCHITECTURE_LAW_001_VERSION;
};

export function assertConstructionPlanComplete(plan: ConstructionPlan): { ok: true } | { ok: false; missing: string[] } {
  const missing: string[] = [];
  if (!plan.planId) missing.push('planId');
  if (!plan.architecture.architectureId) missing.push('architecture');
  if (!plan.materialSet.materialSetId) missing.push('materialSet');
  if (!plan.lightingProfile.profileId) missing.push('lightingProfile');
  if (plan.cameraAnchors.length === 0) missing.push('cameraAnchors');
  if (!plan.navigationGraph.loaded) missing.push('navigationGraph');
  if (!plan.validationProfile.profileId) missing.push('validationProfile');
  const requiredSockets = plan.assetSockets.filter((s) => s.required);
  for (const socket of requiredSockets) {
    const hasAsset = [...plan.heroAssets, ...plan.furnitureSet.assets, ...plan.decorSet.assets].some(
      (a) => a.socketId === socket.socketId
    );
    if (!hasAsset && socket.role === 'hero') {
      missing.push(`hero-asset-for-socket:${socket.socketId}`);
    }
  }
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}
