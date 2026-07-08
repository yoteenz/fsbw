/** Creative Direction Studio™ — universal vision-first pipeline (Parallel Futures integration). */

export type CreativeUniversalPipelinePhase =
  | 'founder-intent'
  | 'story-table'
  | 'parallel-futures'
  | 'future-merge'
  | 'concept-approval'
  | 'scene-deconstruction'
  | 'asset-registry'
  | 'warehouse'
  | 'scene-assembly'
  | 'golden-build';

export type CreativeConceptArchetype =
  | 'luxury-editorial'
  | 'apple-minimal'
  | 'futuristic-luxury'
  | 'modern-penthouse'
  | 'gallery-experience'
  | 'architectural-showcase'
  | 'merged-concept';

export type ConceptLayerKind =
  | 'environment'
  | 'lighting'
  | 'materials'
  | 'architecture'
  | 'furniture'
  | 'hero-objects'
  | 'atmosphere'
  | 'motion-language'
  | 'color-direction';

export type ConceptMergeIngredientKind = ConceptLayerKind | 'hero-landmark';

export type CreativeConceptAnalysis = {
  generationCostEstimate: string;
  creativeBudgetImpact: string;
  productionTimeWeeks: number;
  reusePct: number;
  marketplacePotential: string;
  creativeEquity: string;
  navigationEfficiency: number;
  brandGenomeAlignment: number;
};

export type CreativeConceptFuture = {
  id: string;
  archetype: CreativeConceptArchetype;
  label: string;
  tagline: string;
  mood: string;
  completeSceneStack: boolean;
  environment: string;
  lighting: string;
  materials: string;
  architecture: string;
  furniture: string;
  heroObjects: string;
  atmosphere: string;
  motionLanguage: string;
  colorDirection: string;
  analysis: CreativeConceptAnalysis;
  isMerged?: boolean;
  mergeSourceIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ConceptMergeIngredient = {
  kind: ConceptMergeIngredientKind;
  label: string;
  sourceConceptId: string;
  sourceConceptLabel: string;
};

export type ConceptMergeRecipe = {
  id: string;
  ingredients: ConceptMergeIngredient[];
  createdAt: string;
  createdBy: string;
};

export type SceneDeconstructionLayer = {
  id: string;
  kind: ConceptLayerKind | 'particles' | 'animations' | 'textures' | 'audio' | 'props';
  label: string;
  sourceConceptId: string;
  reusable: boolean;
  reuseSource?: 'asset-registry' | 'blueprint-archive' | 'golden-build' | 'marketplace' | 'company-genome';
  generateRequired: boolean;
  estimatedCost: string;
};

export type CreativeDirectorOrbRecommendation = {
  id: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
};

export type CreativeUniversalPipelineRecord = {
  version: 1;
  departmentId: string;
  projectId: string;
  phase: CreativeUniversalPipelinePhase;
  founderIntent: string;
  concepts: CreativeConceptFuture[];
  activeConceptId: string | null;
  mergeLabActive: boolean;
  activeMergeRecipe: ConceptMergeRecipe | null;
  mergeDraftConceptId: string | null;
  approvedConceptId: string | null;
  approvedAt: string | null;
  deconstructionLayers: SceneDeconstructionLayer[];
  warehouseAssetsAdded: number;
  assetReuseSummary: string | null;
  goldenBuildCertified: boolean;
  history: Array<{ at: string; label: string; detail: string }>;
  updatedAt: string;
};

export const CREATIVE_UNIVERSAL_PIPELINE_LABELS: Record<CreativeUniversalPipelinePhase, string> = {
  'founder-intent': 'Founder Intent™',
  'story-table': 'Story Table™',
  'parallel-futures': 'Parallel Futures™',
  'future-merge': 'Future Merge™',
  'concept-approval': 'Concept Approval™',
  'scene-deconstruction': 'Scene Deconstruction™',
  'asset-registry': 'Asset Registry™',
  'warehouse': 'Warehouse™',
  'scene-assembly': 'Scene Assembly™',
  'golden-build': 'Golden Build™',
};

export const CREATIVE_UNIVERSAL_PIPELINE_ORDER: CreativeUniversalPipelinePhase[] = [
  'founder-intent',
  'story-table',
  'parallel-futures',
  'future-merge',
  'concept-approval',
  'scene-deconstruction',
  'asset-registry',
  'warehouse',
  'scene-assembly',
  'golden-build',
];
