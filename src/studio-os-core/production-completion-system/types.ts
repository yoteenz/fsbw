/** ARTICLE-K24 — Production Completion System™ / Definition of Done™ */

export type ProductionCompletionCategory =
  | 'architecture'
  | 'engineering'
  | 'experience'
  | 'visual-system'
  | 'performance'
  | 'world-integration'
  | 'qa';

export type ProductionQualityGateStage =
  | 'architecture'
  | 'implementation'
  | 'integration'
  | 'quality-assurance'
  | 'founder-review'
  | 'knowledge-update'
  | 'production-ready'
  | 'complete';

/** Inferred scope — determines which checklist items apply. */
export type ProductionFeatureScope = {
  requiresRoutes: boolean;
  requiresDatabase: boolean;
  requiresApi: boolean;
  requiresAssets: boolean;
  requiresMotion: boolean;
  requiresConstitutional: boolean;
  requiresWorldGraph: boolean;
  requiresAtlas: boolean;
  requiresOrb: boolean;
  visualOnly: boolean;
  routingOnly: boolean;
};

export type ProductionChecklistItem = {
  id: string;
  category: ProductionCompletionCategory;
  label: string;
  gateStage: ProductionQualityGateStage;
  required: boolean;
  applicable: boolean;
  passed: boolean;
  blockedReason?: string;
};

export type ProductionCompletionChecklist = {
  items: ProductionChecklistItem[];
  completionPct: number;
  currentGate: ProductionQualityGateStage;
  nextGate: ProductionQualityGateStage | null;
  gateBlocked: boolean;
  blockingLabels: string[];
  readyForReview: boolean;
  owner: string;
  assignedModel: string;
  approvedBy: string | null;
  completionTimestamp: string | null;
};

export type ProductionCompletionScopeInput = {
  featureName: string;
  founderIntent: string;
  architectureOutput?: string;
  requiresAssets?: boolean;
  requiresMotion?: boolean;
  scopeOverrides?: Partial<ProductionFeatureScope>;
  owner?: string;
  assignedModel?: string;
};

export type QualityGateEvaluation = {
  canAdvance: boolean;
  gateComplete: boolean;
  blockingLabels: string[];
  requiredRemaining: number;
  requiredTotal: number;
  requiredPassed: number;
};
