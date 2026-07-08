/**
 * Studio World™ Architecture Auditor™ — permanent architectural intelligence types.
 * Guardian of Studio World philosophy. Not QA. Not debugging.
 */

export type ArchitectureViolationCategory =
  | 'webpage-pattern'
  | 'missing-physical-place'
  | 'non-physical-navigation'
  | 'scene-stack-incomplete'
  | 'asset-registry'
  | 'world-continuity'
  | 'route-unmapped';

export type ArchitectureViolationSeverity = 'critical' | 'major' | 'minor';

export type ArchitectureViolation = {
  id: string;
  category: ArchitectureViolationCategory;
  severity: ArchitectureViolationSeverity;
  problem: string;
  reason: string;
  affectedRoutes: string[];
  detectedPatterns: string[];
};

export type ArchitectureScores = {
  immersion: number;
  architecture: number;
  worldContinuity: number;
  reuse: number;
  navigation: number;
  sceneStack: number;
  generationCost: number;
  overallHeadquartersQuality: number;
};

export type ArchitectureRecommendation = {
  id: string;
  violationId: string;
  problem: string;
  reason: string;
  affectedRoutes: string[];
  suggestedBuilding: string;
  suggestedWing: string;
  suggestedRoom: string;
  suggestedSceneStack: string;
  reusableAssets: string[];
  estimatedGenerationCost: '$' | '$$' | '$$$';
  estimatedImplementationComplexity: 'S' | 'M' | 'L' | 'XL';
  migrationPriority: 'P0' | 'P1' | 'P2' | 'P3';
};

export type ArchitectureAuditReport = {
  auditedAt: string;
  scores: ArchitectureScores;
  violations: ArchitectureViolation[];
  recommendations: ArchitectureRecommendation[];
  remainingWebpages: number;
  immersiveLiveCount: number;
  brokenRoutes: string[];
  duplicateAssetCount: number;
  sceneReusePct: number;
  registryEfficiencyPct: number;
  estimatedGenerationBudget: string;
  estimatedOptimizationSavings: string;
  upcomingMigrations: { route: string; priority: string; room: string }[];
  passed: boolean;
};

export type ArchitectureAuditorGateContext = {
  kind: 'route' | 'scene' | 'feature' | 'generation' | 'continuous';
  route?: string;
  departmentId?: string;
  projectId?: string;
  stationId?: string;
  /** Shell component hints from page source analysis */
  shellHints?: string[];
  featureName?: string;
  metadata?: Record<string, unknown>;
};

export type ArchitectureAuditorGateResult = {
  ok: true;
  passed: boolean;
  proceed: boolean;
  report: ArchitectureAuditReport;
  reason?: string;
};

export type ApprovedArchitecturalPattern = {
  id: string;
  approvedAt: string;
  patternType: 'layout' | 'transition' | 'room-type' | 'navigation' | 'material' | 'scene-stack' | 'world-building';
  label: string;
  route?: string;
  departmentId?: string;
  notes?: string;
};

export type ArchitectureMemoryStore = {
  version: 1;
  patterns: ApprovedArchitecturalPattern[];
};

export const ARCHITECTURE_AUDITOR_EVENT = 'studio-world-architecture-audit-requested';
