/**
 * Studio World™ V4 — physical location taxonomy.
 * Nothing inside Studio World™ is a webpage. Every destination is a place.
 */

export const STUDIO_WORLD_PHYSICAL_TYPES = [
  'headquarters',
  'building',
  'district',
  'wing',
  'floor',
  'room',
  'studio',
  'workshop',
  'observatory',
  'laboratory',
  'gallery',
  'museum',
  'library',
  'vault',
  'theater',
  'pavilion',
  'atrium',
  'garden',
  'command-center',
] as const;

export type StudioWorldPhysicalType = (typeof STUDIO_WORLD_PHYSICAL_TYPES)[number];

export const STUDIO_WORLD_FLAGSHIP_IDS = [
  'studio-command-center',
  'creative-direction-studio',
  'studio-warehouse',
  'studio-archives',
  'marketplace',
  'headquarters',
  'expedition-hub',
] as const;

export type StudioWorldFlagshipId = (typeof STUDIO_WORLD_FLAGSHIP_IDS)[number];

/** How the route is experienced today — not the target end state. */
export type StudioWorldShellKind =
  | 'immersive'
  | 'standard'
  | 'module'
  | 'layout'
  | 'placeholder'
  | 'redirect';

export type StudioWorldMigrationStatus =
  | 'immersive-live'
  | 'immersive-partial'
  | 'standard-room'
  | 'placeholder'
  | 'redirect-only'
  | 'coming-soon';

export type StudioWorldLocation = {
  id: string;
  displayName: string;
  physicalType: StudioWorldPhysicalType;
  flagshipId: StudioWorldFlagshipId;
  parentId?: string;
  /** Canonical world path segments after /admin/studio/world/ */
  worldPath: string;
  teaching?: string;
};

export type StudioWorldRouteMapping = {
  id: string;
  displayName: string;
  physicalType: StudioWorldPhysicalType;
  flagshipId: StudioWorldFlagshipId;
  parentLocationId: string;
  /** Canonical address — `/admin/studio/world/...` */
  worldPath: string;
  /** Current implementation URL — preserved until room is rebuilt immersive */
  legacyPath: string;
  legacySlug: string;
  shell: StudioWorldShellKind;
  migrationStatus: StudioWorldMigrationStatus;
  /** Former software feature name → architectural name */
  formerFeatureName?: string;
};

export type StudioWorldNavigationEdge = {
  fromLocationId: string;
  toLocationId: string;
  movementVerb: 'walk' | 'enter' | 'ride-elevator' | 'cross-bridge' | 'open-door' | 'descend' | 'ascend';
  label: string;
};

export type DepartmentRoomLaw = {
  arrival: string;
  atrium: string;
  overview: string;
  workspaceSelection: string;
  room: string;
  subWorkspaces: string;
  returnPath: string;
};

export const DEPARTMENT_ROOM_LAW: DepartmentRoomLaw = {
  arrival: 'Arrival',
  atrium: 'Atrium',
  overview: 'Overview',
  workspaceSelection: 'Workspace selection',
  room: 'Room',
  subWorkspaces: 'Sub-workspaces',
  returnPath: 'Return',
};

export const SCENE_STACK_ROOM_LAW = [
  'environment-shell',
  'architecture',
  'lighting',
  'furniture',
  'hero-objects',
  'interactive-systems',
  'particles',
  'runtime',
] as const;
