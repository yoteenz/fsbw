/**
 * Global Atlas Layer™ — OS-level navigation fabric types.
 */

import type { AtlasMapMode, AtlasTravelMode } from '../studio-world-atlas/types';
import type { StudioWorldFlagshipId } from '../studio-world/types';

export type AtlasAnchorKind =
  | 'story-table'
  | 'founder-office'
  | 'warehouse-floor'
  | 'museum-exhibit'
  | 'marketplace-pavilion'
  | 'strategy-wall'
  | 'capital-table'
  | 'mission-control'
  | 'holographic-table'
  | 'constitution-hall'
  | 'innovation-campus'
  | 'generic-room';

export type AtlasAnchor = {
  kind: AtlasAnchorKind;
  displayName: string;
  projectionLine: string;
  overlayClass: string;
  flagshipId?: StudioWorldFlagshipId;
};

export type GlobalAtlasLocationContext = {
  flagshipId: StudioWorldFlagshipId | null;
  priorityModes: AtlasMapMode[];
  priorityDestinations: string[];
  contextLabel: string;
};

export type GlobalAtlasShortcut = {
  id: string;
  label: string;
  nodeId: string;
  travelPath: string;
  kind: 'recent' | 'frequent' | 'recommended' | 'continue' | 'approval' | 'project';
  visitCount?: number;
};

export type GlobalAtlasVisitRecord = {
  path: string;
  nodeId: string;
  label: string;
  visitedAt: string;
};

export type GlobalAtlasMemoryStore = {
  version: 1;
  visits: GlobalAtlasVisitRecord[];
  lastWorkspacePath: string | null;
};

export type OrbAtlasNavigationIntent = {
  action: 'open' | 'travel' | 'highlight';
  query: string;
  targetPath?: string;
  targetNodeId?: string;
  travelMode?: AtlasTravelMode;
  confidence: number;
};

export const GLOBAL_ATLAS_LAYER_EVENT = 'studio-global-atlas-layer-updated';

export const GLOBAL_ATLAS_TRAVEL_MODES: AtlasTravelMode[] = [
  'walk',
  'elevator',
  'fast-travel',
  'guided-tour',
];
