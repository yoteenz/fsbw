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
  | 'master-planner'
  | 'parallel-futures'
  | 'future-merge';

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
  /** Phase 3 — master planner */
  planId?: string;
  planPhase?: MasterPlanProjectPhase;
  isConcept?: boolean;
  /** Phase 4 — parallel futures */
  parallelFutureId?: string;
  isParallelFuture?: boolean;
};

export type AtlasOrbRecommendationKind =
  | 'attention'
  | 'ai-active'
  | 'opportunity'
  | 'expansion'
  | 'expedition'
  | 'construction'
  | 'discovery'
  | 'master-plan'
  | 'placement'
  | 'forecast'
  | 'simulation'
  | 'budget';

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

export type MasterPlanProjectPhase =
  | 'vision'
  | 'reserved-land'
  | 'concept-blueprint'
  | 'approved-blueprint'
  | 'construction'
  | 'interior-assembly'
  | 'commissioning'
  | 'grand-opening'
  | 'operational';

export type MasterPlanLandCategory =
  | 'headquarters'
  | 'district'
  | 'campus'
  | 'pavilion'
  | 'academy'
  | 'experience-center'
  | 'innovation';

export type AtlasPlanFeatureType =
  | 'road'
  | 'bridge'
  | 'plaza'
  | 'park'
  | 'courtyard'
  | 'water-feature'
  | 'observation-tower'
  | 'transit-hub'
  | 'skybridge';

export type AtlasPlanFeature = {
  id: string;
  type: AtlasPlanFeatureType;
  label: string;
  mapX: number;
  mapY: number;
  connectToPlanId?: string;
};

export type AtlasCreativeBudgetEstimate = {
  generationCost: string;
  constructionCost: string;
  budgetImpactPct: number;
  reuseOpportunities: string;
  projectedEquity: string;
  marketplaceValue?: string;
};

export type AtlasSimulationResult = {
  planId: string;
  navigationImpact: string;
  crowdRisk: 'low' | 'medium' | 'high';
  entranceRecommendation?: string;
  placementScore: number;
  aiTrafficImpact: string;
  walkingDistanceDelta: string;
  discoverability: string;
  expansionFit: string;
  summary: string;
};

export type AtlasExpansionRecommendation = {
  id: string;
  message: string;
  targetPlanLabel: string;
  priority: 'high' | 'medium' | 'low';
  suggestedCategory: MasterPlanLandCategory;
};

export type AtlasWorldForecastYear = 1 | 3 | 5 | 10;

export type AtlasWorldForecast = {
  horizonYears: AtlasWorldForecastYear;
  buildingCount: number;
  districtCount: number;
  narrative: string;
  milestones: string[];
};

export type AtlasFutureVisionConcept = {
  id: string;
  label: string;
  description: string;
  mapX: number;
  mapY: number;
  alternativeLayout?: string;
  createdAt: string;
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
  /** Phase 3 — planning pipeline */
  phase?: MasterPlanProjectPhase;
  category?: MasterPlanLandCategory;
  isConcept?: boolean;
  budget?: AtlasCreativeBudgetEstimate;
  amenities?: string[];
};

/** Phase 4 — Parallel Futures™ */
export type ParallelFutureArchetype =
  | 'future-a'
  | 'future-b'
  | 'future-c'
  | 'future-d'
  | 'future-e'
  | 'future-f'
  | 'future-g';

export type ParallelFutureStatus = 'draft' | 'approved' | 'committed' | 'archived' | 'forked';

export type ParallelFutureBuilding = {
  id: string;
  label: string;
  department: string;
  mapX: number;
  mapY: number;
  wingCount: number;
  roomCount: number;
};

export type AtlasFutureAnalysis = {
  creativeBudgetEstimate: string;
  generationCostEstimate: string;
  buildDurationWeeks: number;
  creativeEquity: string;
  assetReusePct: number;
  marketplacePotential: string;
  expansionFlexibility: number;
  aiWorkforceCount: number;
  navigationEfficiency: number;
  operationalComplexity: 'low' | 'medium' | 'high';
  maintainability: number;
  founderWorkloadHours: number;
  riskProfile: 'conservative' | 'balanced' | 'aggressive' | 'experimental';
  timelineMonths: number;
  growthProjection: string;
};

export type AtlasFutureCommitSummary = {
  totalAssets: number;
  productionCost: string;
  productionHours: number;
  reusableAssets: number;
  newAssetsRequired: number;
  reuseSavings: string;
  approvedAt: string;
};

export type ParallelFutureWalkStep = {
  order: number;
  buildingLabel: string;
  department: string;
  preview: string;
  trafficLevel: 'low' | 'medium' | 'high';
  aiMovement: string;
};

export type ParallelFutureWalkSimulation = {
  futureId: string;
  steps: ParallelFutureWalkStep[];
  summary: string;
  simulatedAt: string;
};

export type MasterPlanningLibraryEntry = {
  id: string;
  label: string;
  archetype: ParallelFutureArchetype;
  version: number;
  status: ParallelFutureStatus;
  savedAt: string;
  notes?: string;
  futureSnapshotId: string;
};

export type FutureVersionSnapshot = {
  id: string;
  futureId: string;
  label: string;
  version: number;
  savedAt: string;
  analysis: AtlasFutureAnalysis;
  forkedFromId?: string;
};

export type AtlasParallelFuture = {
  id: string;
  archetype: ParallelFutureArchetype;
  label: string;
  tagline: string;
  strategy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  status: ParallelFutureStatus;
  forkedFromId?: string;
  buildings: ParallelFutureBuilding[];
  roads: AtlasPlanFeature[];
  departments: string[];
  expansionStrategy: string;
  constructionPhases: string[];
  analysis: AtlasFutureAnalysis;
  commitSummary?: AtlasFutureCommitSummary;
  /** Phase 5 — merged future metadata */
  isMerged?: boolean;
  mergeRecipe?: FutureMergeRecipe;
  genome?: FutureGenome;
  mergeSourceIds?: string[];
};

export type AtlasParallelFuturesComparisonRow = {
  futureId: string;
  label: string;
  archetype: ParallelFutureArchetype;
  buildCost: string;
  timelineMonths: number;
  creativeEquity: string;
  marketplaceValue: string;
  navigationEfficiency: number;
  expansionFlexibility: number;
  reusableAssetsPct: number;
  aiWorkforce: number;
};

/** Phase 5 — Future Merge™ */
export type MergeIngredientKind =
  | 'campus-layout'
  | 'building'
  | 'transportation'
  | 'district'
  | 'budget-strategy'
  | 'department';

export type MergeIngredient = {
  kind: MergeIngredientKind;
  label: string;
  sourceFutureId: string;
  sourceFutureLabel: string;
  buildingId?: string;
};

export type FutureMergeRecipe = {
  id: string;
  ingredients: MergeIngredient[];
  createdAt: string;
  createdBy: string;
};

export type MergeConflictKind =
  | 'land-overlap'
  | 'road-conflict'
  | 'duplicate-department'
  | 'lighting-mismatch'
  | 'style-mismatch'
  | 'genome-inconsistency'
  | 'blueprint-dependency'
  | 'ai-routing';

export type MergeConflict = {
  id: string;
  kind: MergeConflictKind;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  recommendation: string;
  affectedBuildingIds: string[];
  resolved: boolean;
};

export type FutureGenome = {
  founderSatisfaction: number;
  brandConsistency: number;
  navigationQuality: number;
  aiEfficiency: number;
  creativeDirection: number;
  operationalComplexity: number;
  longTermScalability: number;
  summary: string;
};

export type MergeCollaboratorRole =
  | 'founder'
  | 'creative-director'
  | 'architect'
  | 'designer'
  | 'operations-lead';

export type MergeCollaborator = {
  id: string;
  name: string;
  role: MergeCollaboratorRole;
  lastActiveAt: string;
};

export type MergeComment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  targetLabel: string;
  createdAt: string;
  status: 'proposed' | 'approved' | 'alternative';
};

export type MergeHistoryEntry = {
  id: string;
  mergedAt: string;
  resultFutureId: string;
  resultLabel: string;
  sourceFutureIds: string[];
  sourceLabels: string[];
  recipe: FutureMergeRecipe;
  conflictsDetected: number;
  conflictsResolved: number;
  author: string;
  replaySteps: string[];
};

export type AtlasLiveMergeMetrics = {
  creativeBudget: string;
  buildCost: string;
  generationCost: string;
  creativeEquity: string;
  marketplacePotential: string;
  reuseSavings: string;
  constructionTimeline: string;
  aiWorkforce: number;
  expansionFlexibility: number;
  navigationEfficiency: number;
};

export type AtlasDiscoveryStore = {
  version: 5;
  discoveredNodeIds: string[];
  achievements: string[];
  hiddenFinds: string[];
  collectibles: string[];
  buildingMemories: AtlasBuildingMemory[];
  masterPlan: AtlasMasterPlanReservation[];
  activeConstructions: AtlasConstructionJob[];
  planFeatures: AtlasPlanFeature[];
  futureVisionConcepts: AtlasFutureVisionConcept[];
  forecastHorizon: AtlasWorldForecastYear;
  lastSimulations: Record<string, AtlasSimulationResult>;
  parallelFutures: AtlasParallelFuture[];
  activeParallelFutureId: string | null;
  parallelFutureWalks: Record<string, ParallelFutureWalkSimulation>;
  masterPlanningLibrary: MasterPlanningLibraryEntry[];
  futureVersionHistory: FutureVersionSnapshot[];
  committedFutureId: string | null;
  mergeLabActive: boolean;
  activeMergeRecipe: FutureMergeRecipe | null;
  mergeDraftFutureId: string | null;
  mergeConflicts: MergeConflict[];
  mergeHistory: MergeHistoryEntry[];
  mergeCollaborators: MergeCollaborator[];
  mergeComments: MergeComment[];
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
  'parallel-futures': 'PARALLEL FUTURES™',
  'future-merge': 'FUTURE MERGE™',
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

export const MASTER_PLAN_PHASE_LABELS: Record<MasterPlanProjectPhase, string> = {
  vision: 'VISION™',
  'reserved-land': 'RESERVED LAND™',
  'concept-blueprint': 'CONCEPT BLUEPRINT™',
  'approved-blueprint': 'APPROVED BLUEPRINT™',
  construction: 'CONSTRUCTION™',
  'interior-assembly': 'INTERIOR ASSEMBLY™',
  commissioning: 'COMMISSIONING™',
  'grand-opening': 'GRAND OPENING™',
  operational: 'OPERATIONAL™',
};

export const RESERVE_LAND_PRESETS: { label: string; category: MasterPlanLandCategory }[] = [
  { label: 'Future Headquarters™', category: 'headquarters' },
  { label: 'Innovation District™', category: 'innovation' },
  { label: 'Research Campus™', category: 'campus' },
  { label: 'Marketplace Pavilion Expansion™', category: 'pavilion' },
  { label: 'Creative Campus™', category: 'campus' },
  { label: 'Customer Experience Center™', category: 'experience-center' },
  { label: 'Training Academy™', category: 'academy' },
];

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
  marketplace: ['creative-portfolio', 'asset-registry'],
  innovation: ['creative-intelligence', 'expedition-hub'],
  'company-genome': ['company-genome', 'creative-intelligence'],
  construction: ['generation-pipeline', 'scene-stack', 'blueprint-archive'],
  'future-vision': ['expedition-hub', 'blueprint-archive'],
  'master-planner': ['expedition-hub', 'blueprint-archive', 'creative-budget'],
  'parallel-futures': ['expedition-hub', 'blueprint-archive', 'creative-budget', 'asset-registry'],
  'future-merge': ['expedition-hub', 'blueprint-archive', 'creative-budget', 'company-genome', 'experience-intelligence'],
};
