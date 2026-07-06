import type {
  KNOWLEDGE_DEPENDENCY_TYPES,
  READINESS_STATUS_LEVELS,
  SUCCESSION_READINESS_DIMENSIONS,
  SUCCESSION_RECOMMENDATION_TYPES,
} from './constants';

export type SuccessionReadinessDimension = (typeof SUCCESSION_READINESS_DIMENSIONS)[number];
export type KnowledgeDependencyType = (typeof KNOWLEDGE_DEPENDENCY_TYPES)[number];
export type SuccessionRecommendationType = (typeof SUCCESSION_RECOMMENDATION_TYPES)[number];
export type ReadinessStatusLevel = (typeof READINESS_STATUS_LEVELS)[number];

export type SuccessionDimensionScore = {
  id: SuccessionReadinessDimension;
  label: string;
  scorePct: number;
  status: ReadinessStatusLevel;
  signal: string;
  improvesWhen: string;
};

export type KnowledgeDependencyNode = {
  id: string;
  area: string;
  dependencyType: KnowledgeDependencyType;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
  preserveInBrainId?: string;
  recommendation: string;
};

export type SuccessionRecommendation = {
  id: string;
  type: SuccessionRecommendationType;
  title: string;
  rationale: string;
  priority: 'critical' | 'high' | 'medium';
  targetBrainId?: string;
};

export type LegacyContinuityAssessment = {
  canOperateWithoutFounder: boolean;
  continuityScorePct: number;
  philosophyPreserved: boolean;
  standardsPreserved: boolean;
  summary: string;
  legacyActions: string[];
};

export type OrganizationSuccessionProfile = {
  organizationId: string;
  companyName: string;
  industryId: string;
  updatedAt: string;
  overallSuccessionReadiness: number;
  overallStatus: ReadinessStatusLevel;
  dimensionScores: SuccessionDimensionScore[];
  knowledgeDependencies: KnowledgeDependencyNode[];
  recommendations: SuccessionRecommendation[];
  legacyContinuity: LegacyContinuityAssessment;
  founderDependencyPct: number;
  syncedSources: string[];
};

export type SuccessionModeStore = {
  version: string;
  profiles: OrganizationSuccessionProfile[];
};

export type SuccessionModeDockAdvice = {
  response: string;
  concierge: string;
  readinessScore?: number;
};
