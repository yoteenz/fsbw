/**
 * Studio World Atlas™ — living blueprint types (Phase 2 evolution).
 * Not a sitemap. Not a sidebar. Spatial civilization + operating table.
 */

import type { StudioWorldFlagshipId, StudioWorldMigrationStatus } from '../studio-world/types';

export type AtlasZoomLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type AtlasMapMode =
  | 'architectural-blueprint'
  | 'organization'
  | 'operations'
  | 'creative'
  | 'archives'
  | 'ai'
  | 'generation'
  | 'creative-budget'
  | 'creative-portfolio'
  | 'creative-equity'
  | 'marketplace'
  | 'innovation'
  | 'company-genome'
  | 'construction'
  | 'future-vision'
  | 'master-planner';

export type AtlasTravelMode =
  | 'walk'
  | 'elevator'
  | 'fast-travel'
  | 'guided-tour'
  | 'executive-shuttle'
  | 'skybridge'
  | 'observation-train'
  | 'autonomous-transit';

export type AtlasActivityLevel = 'dormant' | 'idle' | 'active' | 'generating' | 'pulse';

export type AtlasConstructionPhase =
  | 'reserved'
  | 'fencing'
  | 'blueprint-hologram'
  | 'foundation'
  | 'steel-structure'
  | 'glass-install'
  | 'lighting-active'
  | 'opening-ceremony'
  | 'complete';

export type AtlasEngineId =
  | 'creative-intelligence'
  | 'company-genome'
  | 'asset-registry'
  | 'blueprint-archive'
  | 'creative-budget'
  | 'creative-portfolio'
  | 'architecture-auditor'
  | 'experience-intelligence'
  | 'generation-pipeline'
  | 'scene-stack'
  | 'studio-archives'
  | 'expedition-hub';

export type AtlasLivingSignal =
  | 'pulse'
  | 'ai-glow'
  | 'construction-crane'
  | 'road-illuminated'
  | 'marketplace-delivery'
  | 'golden-monument'
  | 'museum-exhibit'
  | 'innovation-monument'
  | 'seasonal-event'
  | 'hidden-discovery'
  | 'transit-active';

export type AtlasMonumentType =
  | 'golden-build'
  | 'innovation'
  | 'historical'
  | 'founder-easter-egg'
  | 'seasonal'
  | null;

export type AtlasNode = {
  id: string;
  displayName: string;
  level: AtlasZoomLevel;
  parentId: string | null;
  physicalType: string;
  mapX: number;
  mapY: number;
  mapZ: number;
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
  /** Phase 2 — engine intelligence layer */
  engineIds?: AtlasEngineId[];
  livingSignals?: AtlasLivingSignal[];
  constructionPhase?: AtlasConstructionPhase | null;
  isPlanned?: boolean;
  monumentType?: AtlasMonumentType;
  worldMemoryId?: string;
};

export type AtlasOrbRecommendationKind =
  | 'attention'
  | 'ai-active'
  | 'opportunity'
  | 'expansion'
  | 'expedition'
  | 'construction'
  | 'discovery'
  | 'master-plan';

export type AtlasOrbRecommendation = {
  id: string;
  message: string;
  targetNodeId: string;
  priority: 'high' | 'medium' | 'low';
  kind?: AtlasOrbRecommendationKind;
  engineId?: AtlasEngineId;
};

export type AtlasViewState = {
  zoomLevel: AtlasZoomLevel;
  focusNodeId: string;
  mapMode: AtlasMapMode;
  travelMode: AtlasTravelMode;
  transitionMs: number;
  /** Roads glow while founder is traveling */
  travelingRoads?: boolean;
};

export type AtlasBuildingMemory = {
  nodeId: string;
  displayName: string;
  constructedAt: string;
  reason: string;
  unlockedByExpedition?: string;
  enabledByBlueprint?: string;
  generationCost?: string;
  creativeBudgetUsed?: string;
  creativeEquityGained?: string;
  milestones: string[];
};

export type AtlasConstructionJob = {
  nodeId: string;
  displayName: string;
  phase: AtlasConstructionPhase;
  startedAt: string;
  reason: string;
  enabledByBlueprint?: string;
  unlockedByExpedition?: string;
};

export type AtlasMasterPlanReservation = {
  id: string;
  label: string;
  mapX: number;
  mapY: number;
  districtSketch?: string;
  wingPlan?: string;
  headquartersPlan?: string;
  notes?: string;
  reservedAt: string;
};

export type AtlasDiscoveryStore = {
  version: 2;
  discoveredNodeIds: string[];
  achievements: string[];
  hiddenFinds: string[];
  collectibles: string[];
  buildingMemories: AtlasBuildingMemory[];
  masterPlan: AtlasMasterPlanReservation[];
  activeConstructions: AtlasConstructionJob[];
};

export const ATLAS_MAP_MODE_LABELS: Record<AtlasMapMode, string> = {
  'architectural-blueprint': 'ARCHITECTURAL BLUEPRINT™',
  organization: 'ORGANIZATION™',
  creative: 'CREATIVE™',
  operations: 'OPERATIONS™',
  archives: 'ARCHIVES™',
  ai: 'AI ACTIVITY™',
  generation: 'GENERATION™',
  'creative-budget': 'CREATIVE BUDGET™',
  'creative-portfolio': 'CREATIVE PORTFOLIO™',
  'creative-equity': 'CREATIVE EQUITY™',
  marketplace: 'MARKETPLACE™',
  innovation: 'INNOVATION™',
  'company-genome': 'COMPANY GENOME™',
  construction: 'CONSTRUCTION™',
  'future-vision': 'FUTURE VISION™',
  'master-planner': 'MASTER PLANNER™',
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
  elevator: 'GLASS ELEVATOR™',
  'fast-travel': 'FAST TRAVEL™',
  'guided-tour': 'GUIDED TOUR',
  'executive-shuttle': 'EXECUTIVE SHUTTLE™',
  skybridge: 'SKYBRIDGE™',
  'observation-train': 'OBSERVATION TRAIN™',
  'autonomous-transit': 'AUTONOMOUS TRANSIT™',
};

export const ATLAS_CONSTRUCTION_PHASE_LABELS: Record<AtlasConstructionPhase, string> = {
  reserved: 'LAND RESERVED',
  fencing: 'CONSTRUCTION FENCING',
  'blueprint-hologram': 'BLUEPRINT HOLOGRAM',
  foundation: 'FOUNDATION POURED',
  'steel-structure': 'STEEL STRUCTURE',
  'glass-install': 'GLASS INSTALLED',
  'lighting-active': 'LIGHTING ACTIVATES',
  'opening-ceremony': 'OPENING CEREMONY',
  complete: 'JOINED THE CITY',
};

export const ATLAS_ENGINE_LABELS: Record<AtlasEngineId, string> = {
  'creative-intelligence': 'CREATIVE INTELLIGENCE ENGINE™',
  'company-genome': 'COMPANY GENOME™',
  'asset-registry': 'ASSET REGISTRY™',
  'blueprint-archive': 'BLUEPRINT ARCHIVE™',
  'creative-budget': 'CREATIVE BUDGET™',
  'creative-portfolio': 'CREATIVE PORTFOLIO™',
  'architecture-auditor': 'ARCHITECTURE AUDITOR™',
  'experience-intelligence': 'EXPERIENCE INTELLIGENCE™',
  'generation-pipeline': 'GENERATION PIPELINE™',
  'scene-stack': 'SCENE STACK™',
  'studio-archives': 'STUDIO ARCHIVES™',
  'expedition-hub': 'EXPEDITION HUB™',
};

export const STUDIO_WORLD_ATLAS_EVENT = 'studio-world-atlas-updated';

/** Which engines surface in each map mode */
export const ATLAS_MODE_ENGINE_FOCUS: Partial<Record<AtlasMapMode, AtlasEngineId[]>> = {
  creative: ['creative-intelligence', 'scene-stack', 'generation-pipeline'],
  generation: ['generation-pipeline', 'scene-stack', 'creative-intelligence'],
  archives: ['studio-archives', 'asset-registry', 'blueprint-archive'],
  ai: ['architecture-auditor', 'experience-intelligence', 'creative-intelligence'],
  'creative-budget': ['creative-budget', 'generation-pipeline'],
  'creative-portfolio': ['creative-portfolio', 'asset-registry'],
  'creative-equity': ['creative-portfolio', 'creative-budget'],
  marketplace: ['studio-archives', 'asset-registry'],
  innovation: ['creative-intelligence', 'expedition-hub'],
  'company-genome': ['company-genome', 'creative-intelligence'],
  construction: ['generation-pipeline', 'scene-stack', 'blueprint-archive'],
  'future-vision': ['expedition-hub', 'blueprint-archive'],
  'master-planner': ['expedition-hub', 'blueprint-archive'],
};
