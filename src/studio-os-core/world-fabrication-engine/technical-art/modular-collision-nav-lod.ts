import type { CollisionPrimitiveType, ValidationSeverity } from './types';

export type ModularKitModuleCategory =
  | 'FOUNDATION'
  | 'FLOOR'
  | 'WALL'
  | 'GLASS_PARTITION'
  | 'DOOR'
  | 'DOORFRAME'
  | 'WINDOW'
  | 'STAIR'
  | 'RAMP'
  | 'COLUMN'
  | 'BEAM'
  | 'CEILING'
  | 'ROOF'
  | 'RAILING'
  | 'TRIM'
  | 'THRESHOLD'
  | 'PORTAL'
  | 'ARCHITECTURAL_FIXTURE'
  | 'PROP'
  | 'ENVIRONMENT_LANDMARK';

export type ModularKitModule = {
  moduleId: string;
  category: ModularKitModuleCategory;
  dimensions: [number, number, number];
  pivot: [number, number, number];
  snapGridSize: number;
  connectionPointIds: string[];
  compatibleNeighborModuleIds: string[];
  materialSlotIds: string[];
  collisionRequired: boolean;
  lodRequired: boolean;
  runtimeExportRef?: string;
  version: string;
};

export type CollisionGeometryRecord = {
  collisionId: string;
  parentMeshRef: string;
  collisionType: CollisionPrimitiveType;
  transform: number[];
  physicsLayer?: string;
  navigationUse: boolean;
  interactionUse: boolean;
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

export type NavigationRequirementRecord = {
  walkableSurfaceRefs: string[];
  blockedRegionRefs: string[];
  doorTransitionRefs: string[];
  stairConnectionRefs: string[];
  residentPathRefs: string[];
  teleportAnchorRefs: string[];
  runtimeNavGeneration: 'UNREAL_NAVMESH' | 'WEB_CUSTOM' | 'NONE' | 'MANUAL';
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

export type LodLevelRecord = {
  lodIndex: number;
  sourceMeshRef: string;
  targetTriangleCount?: number;
  actualTriangleCount?: number;
  screenSizeCriterion?: number;
  textureResolution?: [number, number];
  simplificationMethod?: 'MANUAL' | 'AUTOMATIC' | 'NOT_APPLICABLE';
  validationStatus: 'PASS' | 'FAIL' | 'UNVERIFIED' | 'NOT_APPLICABLE';
};

export function validateCollisionRecord(
  record: CollisionGeometryRecord,
  collisionRequired: boolean
): ValidationSeverity {
  if (!collisionRequired) return 'NOT_APPLICABLE';
  if (record.collisionType === 'NONE') return 'CRITICAL';
  if (record.validationStatus === 'FAIL') return 'CRITICAL';
  if (record.validationStatus === 'UNVERIFIED') return 'WARNING';
  return 'ACCEPTABLE_EXCEPTION';
}
