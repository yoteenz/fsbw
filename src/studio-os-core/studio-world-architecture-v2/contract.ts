/**
 * Studio World Architecture v2 — canonical construction hierarchy.
 * Blueprint → Construction → Living World
 */

export const STUDIO_WORLD_ARCHITECTURE_VERSION = 'studio-world-architecture.v2';

/** Canonical World Compiler construction order */
export const WORLD_CONSTRUCTION_HIERARCHY = [
  'studio-world',
  'building',
  'floor',
  'room-blueprint',
  'architecture',
  'hero-assets',
  'furniture',
  'decor',
  'materials',
  'lighting',
  'effects',
  'interaction',
  'living-world',
] as const;

export type WorldConstructionLevel = (typeof WORLD_CONSTRUCTION_HIERARCHY)[number];

/** Subsystems that own independent health + localized recovery */
export const ROOM_OPERATIONAL_SUBSYSTEMS = [
  'architecture',
  'hero-assets',
  'furniture',
  'decor',
  'materials',
  'lighting',
  'effects',
  'interaction',
] as const;

export type RoomOperationalSubsystem = (typeof ROOM_OPERATIONAL_SUBSYSTEMS)[number];

export type SubsystemHealthState =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'repairing'
  | 'updating'
  | 'unknown';

export type RoomOperationalStatus =
  | 'online'
  | 'degraded'
  | 'repairing'
  | 'offline'
  | 'activating';

export type GenerationPhase =
  | 'world-blueprint'
  | 'room-blueprint'
  | 'architecture-validation'
  | 'signature-asset-generation'
  | 'furniture-generation'
  | 'decoration-generation'
  | 'material-application'
  | 'lighting-pass'
  | 'scene-assembly'
  | 'room-validation'
  | 'immune-check'
  | 'activate-room';

/** Structure / content / decoration / interaction — never conflate */
export type WorldSystemClass = 'structure' | 'content' | 'decoration' | 'interaction';

export const SUBSYSTEM_SYSTEM_CLASS: Record<RoomOperationalSubsystem, WorldSystemClass> = {
  architecture: 'structure',
  'hero-assets': 'content',
  furniture: 'content',
  decor: 'decoration',
  materials: 'structure',
  lighting: 'decoration',
  effects: 'decoration',
  interaction: 'interaction',
};

export type StudioWorldBuildingRef = {
  buildingId: string;
  organizationId: string;
  displayName: string;
  floorIds: string[];
};

export type StudioWorldFloorRef = {
  floorId: string;
  buildingId: string;
  level: number;
  roomIds: string[];
};

export type StudioWorldRoomRef = {
  roomId: string;
  roomType: string;
  floorId: string;
  buildingId: string;
  organizationId: string;
  purpose: string;
  operationalStatus: RoomOperationalStatus;
};
