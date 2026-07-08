/**
 * Studio World Atlas™ — living blueprint types.
 * Not a sitemap. Not a sidebar. Spatial civilization navigation.
 */

import type { StudioWorldFlagshipId, StudioWorldMigrationStatus } from '../studio-world/types';

export type AtlasZoomLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type AtlasMapMode =
  | 'architectural-blueprint'
  | 'organization'
  | 'creative'
  | 'operations'
  | 'archives'
  | 'ai'
  | 'generation';

export type AtlasTravelMode = 'walk' | 'elevator' | 'fast-travel' | 'guided-tour';

export type AtlasActivityLevel = 'dormant' | 'idle' | 'active' | 'generating' | 'pulse';

export type AtlasNode = {
  id: string;
  displayName: string;
  level: AtlasZoomLevel;
  parentId: string | null;
  physicalType: string;
  /** % position on holographic table projection */
  mapX: number;
  mapY: number;
  mapZ: number;
  /** Height of building extrusion on table (0–1) */
  extrusion: number;
  worldPath?: string;
  travelPath: string;
  flagshipId?: StudioWorldFlagshipId;
  migrationStatus?: StudioWorldMigrationStatus;
  unlocked: boolean;
  fogged: boolean;
  hidden: boolean;
  activity: AtlasActivityLevel;
  childIds: string[];
  modes: AtlasMapMode[];
};

export type AtlasOrbRecommendation = {
  id: string;
  message: string;
  targetNodeId: string;
  priority: 'high' | 'medium' | 'low';
};

export type AtlasViewState = {
  zoomLevel: AtlasZoomLevel;
  focusNodeId: string;
  mapMode: AtlasMapMode;
  travelMode: AtlasTravelMode;
  transitionMs: number;
};

export type AtlasDiscoveryStore = {
  version: 1;
  discoveredNodeIds: string[];
  achievements: string[];
};

export const ATLAS_MAP_MODE_LABELS: Record<AtlasMapMode, string> = {
  'architectural-blueprint': 'ARCHITECTURAL BLUEPRINT™',
  organization: 'ORGANIZATION VIEW™',
  creative: 'CREATIVE VIEW™',
  operations: 'OPERATIONS VIEW™',
  archives: 'ARCHIVES VIEW™',
  ai: 'AI VIEW™',
  generation: 'GENERATION VIEW™',
};

export const ATLAS_ZOOM_LABELS: Record<AtlasZoomLevel, string> = {
  1: 'STUDIO WORLD™',
  2: 'COMPANY CAMPUS™',
  3: 'BUILDING™',
  4: 'WING™',
  5: 'ROOM™',
  6: 'WORKSPACE™',
};

export const ATLAS_TRAVEL_LABELS: Record<AtlasTravelMode, string> = {
  walk: 'WALK',
  elevator: 'ELEVATOR',
  'fast-travel': 'FAST TRAVEL',
  'guided-tour': 'GUIDED TOUR',
};

export const STUDIO_WORLD_ATLAS_EVENT = 'studio-world-atlas-updated';
